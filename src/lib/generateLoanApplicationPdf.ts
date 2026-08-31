import fs from "fs";
import path from "path";
import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb, RGB } from "pdf-lib";
import type { LoanApplicationInput } from "@/lib/validations/loanApplication";

// Renders a submitted application as a PDF laid out like Omama Finance's
// paper "Loan Application Form" — same section order, same field groups —
// so staff who are used to the paper form can review it at a glance.
// Anything reserved for staff on the paper form (loan number, security
// valuation, requirements checklist, signatures) is drawn but left blank;
// it's not something an applicant can fill in online.

const PAGE_WIDTH = 595.28; // A4 at 72dpi
const PAGE_HEIGHT = 841.89;
const MARGIN = 36;

const INK = rgb(0.11, 0.11, 0.11);
const MUTED = rgb(0.4, 0.4, 0.4);
const HEADER_BG = rgb(0.86, 0.86, 0.86);
const HEADER_TEXT = rgb(0.1, 0.15, 0.12);
const BORDER = rgb(0.75, 0.75, 0.75);
const PRIMARY = rgb(0.11, 0.24, 0.18); // dark green, matches brand
const GOLD = rgb(0.62, 0.49, 0.2);
const OFFICE_BG = rgb(0.95, 0.95, 0.93);

type Field = { label: string; value: string };

// pdf-lib's standard fonts (WinAnsi encoding) can't render every Unicode
// character — some throw outright (e.g. "☐"), others silently fall back to
// a blank ".notdef" box with no error at all. Rather than fail or produce
// invisible text, normalize common "smart" typography to plain ASCII and
// strip anything else outside the safe WinAnsi-printable range so every
// field always renders as readable text.
const PDF_CHAR_REPLACEMENTS: Record<string, string> = {
  "\u2018": "'", "\u2019": "'", "\u201A": "'", "\u2032": "'", // smart single quotes / prime
  "\u201C": '"', "\u201D": '"', "\u201E": '"', "\u2033": '"', // smart double quotes
  "\u2013": "-", "\u2014": "-", "\u2212": "-", // en/em dash, minus
  "\u2026": "...", // ellipsis
  "\u2022": "-", "\u25CF": "-", "\u25AA": "-", // bullets
  "\u2610": "[ ]", "\u2611": "[x]", "\u2612": "[x]", // checkboxes
  "\u00A0": " ", "\u2007": " ", "\u2009": " ", // non-breaking / thin spaces
  "\u2122": "(TM)", "\u00AE": "(R)", "\u00A9": "(C)",
};

function sanitizePdfText(text: string): string {
  if (!text) return text;
  let out = "";
  for (const ch of text) {
    const replacement = PDF_CHAR_REPLACEMENTS[ch];
    if (replacement !== undefined) {
      out += replacement;
      continue;
    }
    const code = ch.codePointAt(0) ?? 0;
    // Printable ASCII, or Latin-1 Supplement letters/punctuation with a
    // defined WinAnsi glyph (skip the handful of undefined control-range
    // bytes: 0x81, 0x8D, 0x8F, 0x90, 0x9D).
    const isPrintableAscii = code >= 0x20 && code <= 0x7e;
    const isSafeLatin1 = code >= 0xa0 && code <= 0xff && ![0x81, 0x8d, 0x8f, 0x90, 0x9d].includes(code);
    out += isPrintableAscii || isSafeLatin1 ? ch : "";
  }
  return out;
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const safe = sanitizePdfText(text);
  if (!safe) return [""];
  const words = safe.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [""];
}

class PdfBuilder {
  doc: PDFDocument;
  regular: PDFFont;
  bold: PDFFont;
  page!: PDFPage;
  y = 0;
  pageIndex = 0;

  private constructor(doc: PDFDocument, regular: PDFFont, bold: PDFFont) {
    this.doc = doc;
    this.regular = regular;
    this.bold = bold;
  }

  static async create() {
    const doc = await PDFDocument.create();
    const regular = await doc.embedFont(StandardFonts.Helvetica);
    const bold = await doc.embedFont(StandardFonts.HelveticaBold);
    const builder = new PdfBuilder(doc, regular, bold);
    builder.addPage();
    return builder;
  }

  addPage() {
    this.page = this.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    this.pageIndex += 1;
    this.y = PAGE_HEIGHT - MARGIN;
    if (this.pageIndex > 1) {
      this.drawText(`Loan Application Form (continued) — page ${this.pageIndex}`, MARGIN, this.y, {
        size: 8,
        font: this.regular,
        color: MUTED,
      });
      this.y -= 16;
    }
  }

  ensureSpace(height: number) {
    if (this.y - height < MARGIN + 30) {
      this.addPage();
    }
  }

  drawText(
    text: string,
    x: number,
    y: number,
    opts: { size?: number; font?: PDFFont; color?: RGB } = {}
  ) {
    this.page.drawText(sanitizePdfText(text), {
      x,
      y,
      size: opts.size ?? 9,
      font: opts.font ?? this.regular,
      color: opts.color ?? INK,
    });
  }

  sectionHeader(title: string, note?: string) {
    this.ensureSpace(30);
    const width = PAGE_WIDTH - MARGIN * 2;
    this.page.drawRectangle({
      x: MARGIN,
      y: this.y - 18,
      width,
      height: 20,
      color: HEADER_BG,
    });
    this.drawText(title, MARGIN + 6, this.y - 13, { size: 10, font: this.bold, color: HEADER_TEXT });
    if (note) {
      const noteWidth = this.regular.widthOfTextAtSize(note, 8);
      this.drawText(note, MARGIN + width - noteWidth - 6, this.y - 13, {
        size: 8,
        font: this.regular,
        color: MUTED,
      });
    }
    this.y -= 26;
  }

  // Draws label/value pairs in a fixed-column grid, wrapping long values.
  fieldGrid(fields: Field[], columns: 1 | 2 | 3 = 2) {
    const gap = 12;
    const width = PAGE_WIDTH - MARGIN * 2;
    const colWidth = (width - gap * (columns - 1)) / columns;
    const labelSize = 7.5;
    const valueSize = 9.5;
    const lineHeight = 11;

    for (let i = 0; i < fields.length; i += columns) {
      const row = fields.slice(i, i + columns);
      const wrapped = row.map((f) => wrapText(f.value || "—", this.regular, valueSize, colWidth - 4));
      const rowLines = Math.max(...wrapped.map((w) => w.length));
      const rowHeight = 12 + rowLines * lineHeight + 6;

      this.ensureSpace(rowHeight);

      row.forEach((field, colIdx) => {
        const x = MARGIN + colIdx * (colWidth + gap);
        this.drawText(field.label.toUpperCase(), x, this.y, {
          size: labelSize,
          font: this.bold,
          color: MUTED,
        });
        const lines = wrapped[colIdx];
        lines.forEach((line, lineIdx) => {
          this.drawText(line, x, this.y - 12 - lineIdx * lineHeight, {
            size: valueSize,
            font: this.regular,
            color: INK,
          });
        });
      });

      this.y -= rowHeight;
      this.page.drawLine({
        start: { x: MARGIN, y: this.y + 4 },
        end: { x: PAGE_WIDTH - MARGIN, y: this.y + 4 },
        thickness: 0.5,
        color: BORDER,
      });
      this.y -= 4;
    }
    this.y -= 6;
  }

  paragraph(text: string, opts: { size?: number; color?: RGB } = {}) {
    const size = opts.size ?? 9;
    const width = PAGE_WIDTH - MARGIN * 2;
    const lines = wrapText(text, this.regular, size, width);
    this.ensureSpace(lines.length * 12 + 6);
    lines.forEach((line) => {
      this.drawText(line, MARGIN, this.y, { size, color: opts.color ?? INK });
      this.y -= 12;
    });
    this.y -= 4;
  }

  spacer(h = 8) {
    this.y -= h;
  }
}

function fmtDate(value?: string) {
  if (!value) return "";
  // Native <input type="date"> values arrive as YYYY-MM-DD.
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (match) {
    const [, yyyy, mm, dd] = match;
    return `${dd}/${mm}/${yyyy}`;
  }
  return value;
}

function fmtMoney(value?: number) {
  if (value === undefined || value === null || Number.isNaN(value)) return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function fmtYesNo(value?: string) {
  return value ?? "";
}

export async function generateLoanApplicationPdf(
  data: Omit<LoanApplicationInput, "website">,
  opts: { submittedAt?: Date; attachmentNote?: string } = {}
): Promise<Buffer> {
  const builder = await PdfBuilder.create();
  const { page, bold, regular } = builder;

  // ── Header: logo + title, mirrors the paper form's letterhead ─────────
  let logoDims: { width: number; height: number } | null = null;
  try {
    const logoPath = path.join(process.cwd(), "public", "omama_logo.png");
    const logoBytes = fs.readFileSync(logoPath);
    const logoImage = await builder.doc.embedPng(logoBytes);
    const logoHeight = 40;
    const logoWidth = (logoImage.width / logoImage.height) * logoHeight;
    page.drawImage(logoImage, {
      x: MARGIN,
      y: builder.y - logoHeight + 6,
      width: logoWidth,
      height: logoHeight,
    });
    logoDims = { width: logoWidth, height: logoHeight };
  } catch {
    // Logo is optional — if it can't be read, just skip it rather than fail the whole PDF.
  }

  const titleX = MARGIN + (logoDims ? logoDims.width + 16 : 0);
  builder.drawText("LOAN APPLICATION FORM", titleX, builder.y - 8, {
    size: 16,
    font: bold,
    color: PRIMARY,
  });
  builder.drawText("Submitted via omamafinance.co.zw", titleX, builder.y - 24, {
    size: 9,
    font: regular,
    color: MUTED,
  });
  const submittedAt = opts.submittedAt ?? new Date();
  const submittedLabel = `Submitted: ${submittedAt.toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  })}`;
  const submittedWidth = regular.widthOfTextAtSize(submittedLabel, 8.5);
  builder.drawText(submittedLabel, PAGE_WIDTH - MARGIN - submittedWidth, builder.y - 8, {
    size: 8.5,
    color: MUTED,
  });
  builder.drawText(
    `Application type: ${data.applicationType}   •   Loan type: ${data.loanType}`,
    PAGE_WIDTH - MARGIN - regular.widthOfTextAtSize(
      `Application type: ${data.applicationType}   •   Loan type: ${data.loanType}`,
      8.5
    ),
    builder.y - 24,
    { size: 8.5, font: bold, color: GOLD }
  );

  builder.y -= 48;

  // ── Personal details ────────────────────────────────────────────────
  builder.sectionHeader("Personal Details");
  builder.fieldGrid(
    [
      { label: "Full name", value: data.fullName },
      { label: "ID number", value: data.idNumber },
      { label: "Nationality", value: data.nationality },
    ],
    3
  );
  builder.fieldGrid(
    [
      { label: "Date of birth", value: fmtDate(data.dateOfBirth) },
      { label: "Marital status", value: data.maritalStatus },
      { label: "Number of dependents", value: data.numberOfDependents?.toString() ?? "" },
      { label: "E.C No", value: data.ecNumber ?? "" },
    ],
    2
  );
  builder.fieldGrid([{ label: "Residential address", value: data.residentialAddress }], 1);
  builder.fieldGrid(
    [
      {
        label: "Residential status",
        value: data.residentialStatus === "Other" ? `Other — ${data.residentialStatusOther ?? ""}` : data.residentialStatus,
      },
      { label: "Length of stay (current)", value: data.lengthOfStayCurrentAddress ?? "" },
      { label: "Length of stay (previous)", value: data.lengthOfStayPreviousAddress ?? "" },
    ],
    2
  );
  builder.fieldGrid(
    [
      { label: "Email address", value: data.email },
      { label: "Phone number", value: data.phone },
    ],
    2
  );

  // ── Spouse details ───────────────────────────────────────────────────
  builder.sectionHeader("Spouse Details", "if applicable");
  builder.fieldGrid(
    [
      { label: "Name", value: data.spouseName ?? "" },
      { label: "ID number", value: data.spouseIdNumber ?? "" },
      { label: "Phone no(s)", value: data.spousePhone ?? "" },
    ],
    3
  );
  builder.fieldGrid(
    [
      { label: "Employer", value: data.spouseEmployer ?? "" },
      { label: "Work address", value: data.spouseWorkAddress ?? "" },
      { label: "Phone no", value: data.spouseWorkPhone ?? "" },
    ],
    3
  );

  // ── Employment details ───────────────────────────────────────────────
  builder.sectionHeader("Employment Details", "if employed");
  builder.fieldGrid(
    [
      { label: "Employer", value: data.employer ?? "" },
      { label: "Work address", value: data.workAddress ?? "" },
      { label: "Work phone no", value: data.workPhone ?? "" },
    ],
    3
  );
  builder.fieldGrid(
    [
      { label: "Level of education", value: data.levelOfEducation ?? "" },
      { label: "Position held", value: data.positionHeld ?? "" },
      { label: "Period of employment", value: data.periodOfEmployment ?? "" },
    ],
    3
  );
  builder.fieldGrid(
    [
      { label: "Previous employer", value: data.previousEmployer ?? "" },
      { label: "Period of employment", value: data.previousPeriodOfEmployment ?? "" },
      { label: "Work phone no", value: data.previousWorkPhone ?? "" },
    ],
    3
  );

  // ── Business details ─────────────────────────────────────────────────
  builder.sectionHeader("Business Details", "if self-employed");
  builder.fieldGrid(
    [
      { label: "Business type", value: data.businessType ?? "" },
      { label: "Business address", value: data.businessAddress ?? "" },
      { label: "Phone no", value: data.businessPhone ?? "" },
    ],
    3
  );
  builder.fieldGrid(
    [
      { label: "Level of education", value: data.businessLevelOfEducation ?? "" },
      { label: "Main activities", value: data.mainActivities ?? "" },
      { label: "Period in business", value: data.periodInBusiness ?? "" },
    ],
    3
  );

  // ── Banking details ──────────────────────────────────────────────────
  builder.sectionHeader("Banking Details");
  builder.fieldGrid(
    [
      { label: "Name of bank", value: data.bankName },
      { label: "Branch", value: data.bankBranch },
      { label: "Type of account held", value: data.accountType },
      { label: "Account no", value: data.accountNumber },
    ],
    2
  );
  builder.fieldGrid(
    [
      { label: "When was account opened", value: data.accountOpenedDate ?? "" },
      { label: "Do you have a loan account?", value: fmtYesNo(data.hasLoanAccount) },
      { label: "Amount outstanding", value: fmtMoney(data.bankAmountOutstanding) },
      { label: "PMT", value: data.bankPmt ?? "" },
    ],
    2
  );

  // ── Loan details ─────────────────────────────────────────────────────
  builder.sectionHeader("Loan Details");
  builder.fieldGrid(
    [
      { label: "Loan amount requested", value: fmtMoney(data.loanAmountRequested) },
      { label: "Purpose of loan", value: data.loanPurpose },
      { label: "Proposed repayment period", value: data.proposedRepaymentPeriod },
    ],
    2
  );
  builder.fieldGrid(
    [
      { label: "Proposed repayment date", value: data.proposedRepaymentDate ?? "" },
      { label: "Loan elsewhere?", value: fmtYesNo(data.loanElsewhere) },
      { label: "Amount outstanding", value: fmtMoney(data.loanElsewhereOutstanding) },
      { label: "Repayment", value: data.loanElsewhereRepayment ?? "" },
    ],
    2
  );

  // ── Security details ─────────────────────────────────────────────────
  builder.sectionHeader("Security Details");
  builder.fieldGrid(
    [
      { label: "Type of security", value: data.securityType },
      { label: "Description", value: data.securityDescription },
    ],
    2
  );
  officeOnlyStrip(builder, [
    { label: "Security value x3 of loan amount", value: "" },
    { label: "Tangible value (official use)", value: "" },
  ]);

  // ── Guarantor details ────────────────────────────────────────────────
  builder.sectionHeader("Guarantor Details", "income a must!");
  builder.fieldGrid(
    [
      { label: "Name", value: data.guarantorName },
      { label: "ID no", value: data.guarantorIdNumber },
      { label: "Nationality", value: data.guarantorNationality ?? "" },
    ],
    3
  );
  builder.fieldGrid(
    [
      { label: "Date of birth", value: fmtDate(data.guarantorDateOfBirth) },
      { label: "Marital status", value: data.guarantorMaritalStatus ?? "" },
      { label: "Phone no", value: data.guarantorPhone },
      { label: "Relationship", value: data.guarantorRelationship },
    ],
    2
  );
  builder.fieldGrid(
    [
      { label: "Residential address", value: data.guarantorAddress },
      { label: "Employer", value: data.guarantorEmployer ?? "" },
      { label: "Net monthly income", value: fmtMoney(data.guarantorNetMonthlyIncome) },
    ],
    3
  );

  // ── Next of kin ──────────────────────────────────────────────────────
  builder.sectionHeader("Next of Kin 1", "not residing at same address");
  builder.fieldGrid(
    [
      { label: "Full name", value: data.kin1Name },
      { label: "Residential address", value: data.kin1Address },
      { label: "Phone no", value: data.kin1Phone },
    ],
    3
  );
  builder.fieldGrid(
    [
      { label: "Employer", value: data.kin1Employer ?? "" },
      { label: "Work phone no", value: data.kin1WorkPhone ?? "" },
    ],
    2
  );

  if (data.kin2Name) {
    builder.sectionHeader("Next of Kin 2", "not residing at same address");
    builder.fieldGrid(
      [
        { label: "Full name", value: data.kin2Name ?? "" },
        { label: "Residential address", value: data.kin2Address ?? "" },
        { label: "Phone no", value: data.kin2Phone ?? "" },
      ],
      3
    );
    builder.fieldGrid(
      [
        { label: "Employer", value: data.kin2Employer ?? "" },
        { label: "Work phone no", value: data.kin2WorkPhone ?? "" },
      ],
      2
    );
  }

  // ── Client declaration ───────────────────────────────────────────────
  builder.sectionHeader("Client Declaration");
  builder.paragraph(
    `I, ${data.declarationName}, confirm that the information given above is true and correct and I authorise Omama Finance to make enquiries deemed necessary in connection with this application. I agree to pay any amounts that may be levied per the terms and conditions of the loan agreement.`
  );
  builder.paragraph(`Agreed and submitted electronically by ${data.declarationName}.`, { size: 8.5, color: MUTED });

  // ── Office use only ──────────────────────────────────────────────────
  builder.spacer(4);
  builder.ensureSpace(90);
  const stripY = builder.y;
  const stripHeight = 78;
  builder.page.drawRectangle({
    x: MARGIN,
    y: stripY - stripHeight,
    width: PAGE_WIDTH - MARGIN * 2,
    height: stripHeight,
    color: OFFICE_BG,
    borderColor: BORDER,
    borderWidth: 0.75,
  });
  builder.drawText("FOR OFFICE USE ONLY — completed by Omama Finance staff", MARGIN + 8, stripY - 14, {
    size: 8.5,
    font: bold,
    color: MUTED,
  });
  const officeLines = [
    "Loan Number: ______________        Requirements Checklist — Applicant:  ID [ ]  POI [ ]  Photo [ ]  POR [ ]",
    "Guarantor:  ID [ ]  POI [ ]  Photo [ ]  POR [ ]",
    "Thus Done & Signed: ______________________  At: ______________________  Date: ______________",
    "Loan Officer: ______________________________________________  Date: ______________",
    "Branch Supervisor: _________________________________________  Date: ______________",
  ];
  officeLines.forEach((line, i) => {
    builder.drawText(line, MARGIN + 8, stripY - 28 - i * 11, { size: 8, color: MUTED });
  });
  builder.y = stripY - stripHeight - 12;

  if (opts.attachmentNote) {
    builder.paragraph(opts.attachmentNote, { size: 8, color: MUTED });
  }

  const bytes = await builder.doc.save();
  return Buffer.from(bytes);
}

function officeOnlyStrip(builder: PdfBuilder, fields: Field[]) {
  const width = PAGE_WIDTH - MARGIN * 2;
  const height = 24;
  builder.ensureSpace(height + 8);
  builder.page.drawRectangle({
    x: MARGIN,
    y: builder.y - height,
    width,
    height,
    color: OFFICE_BG,
    borderColor: BORDER,
    borderWidth: 0.5,
  });
  const text = fields.map((f) => `${f.label}: ______________`).join("        ");
  builder.drawText(text, MARGIN + 6, builder.y - height / 2 - 3, { size: 7.5, color: MUTED });
  builder.y -= height + 8;
}