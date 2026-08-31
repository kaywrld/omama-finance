import nodemailer from "nodemailer";
import type { LoanApplicationInput } from "@/lib/validations/loanApplication";

// cPanel SMTP, not Gmail — same pattern as DMS Portal. Configure via .env:
//   SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, LOAN_NOTIFY_EMAIL
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: process.env.SMTP_SECURE !== "false", // true for port 465, false for 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type LoanApplicationAttachment = {
  filename: string;
  content: Buffer;
  contentType?: string;
};

/**
 * True once every env var needed to actually send mail is present.
 * The .env / .env.example ship with placeholder values (e.g.
 * "mail.yourdomain.com", "change-me") — those are NOT considered
 * configured, so local setups fail loudly and clearly instead of trying
 * to connect to a placeholder host and throwing a confusing DNS error.
 */
export function isMailerConfigured(): boolean {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS, LOAN_NOTIFY_EMAIL } = process.env;
  const placeholders = new Set(["mail.yourdomain.com", "change-me", "staff@yourdomain.com"]);
  return Boolean(
    SMTP_HOST &&
      SMTP_USER &&
      SMTP_PASS &&
      LOAN_NOTIFY_EMAIL &&
      !placeholders.has(SMTP_HOST) &&
      !placeholders.has(SMTP_PASS) &&
      !placeholders.has(LOAN_NOTIFY_EMAIL)
  );
}

/**
 * Sends the staff notification for a submitted loan application. The full
 * application (every section of the paper form) travels as the attached
 * PDF — the email body itself is just a quick-glance summary so staff can
 * triage from their inbox before opening the attachment.
 */
export async function sendLoanApplicationEmail(
  data: Omit<LoanApplicationInput, "website">,
  attachments: LoanApplicationAttachment[] = []
) {
  const to = process.env.LOAN_NOTIFY_EMAIL;
  if (!to) {
    throw new Error("LOAN_NOTIFY_EMAIL is not configured");
  }

  const summaryRows: Array<[string, string]> = [
    ["Application type", data.applicationType],
    ["Loan type", data.loanType],
    ["Full name", data.fullName],
    ["ID number", data.idNumber],
    ["Email", data.email],
    ["Phone", data.phone],
    ["Loan amount requested", formatCurrency(data.loanAmountRequested)],
    ["Purpose of loan", data.loanPurpose],
    ["Guarantor", `${data.guarantorName} (${data.guarantorPhone})`],
    [
      "Attachments",
      attachments.length > 0
        ? `${attachments.length} file(s) — full application PDF ${
            attachments.length > 1 ? "and supporting documents " : ""
          }attached`
        : "None",
    ],
  ];

  const htmlRows = summaryRows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 12px;color:#5b5b58;font-family:sans-serif;font-size:13px;white-space:nowrap;">${escapeHtml(
          label
        )}</td><td style="padding:6px 12px;font-family:sans-serif;font-size:13px;">${escapeHtml(value)}</td></tr>`
    )
    .join("");

  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
      <h2 style="color:#1c3d2e;">${escapeHtml(data.fullName)} has applied for a loan</h2>
      <p style="color:#5b5b58;font-size:13px;">Submitted via the website loan application form. The complete application (every section of the paper form) is attached as a PDF. Please call or WhatsApp the applicant to follow up.</p>
      <table style="border-collapse:collapse;width:100%;">${htmlRows}</table>
    </div>
  `;

  const text = summaryRows.map(([label, value]) => `${label}: ${value}`).join("\n");

  await getTransporter().sendMail({
    from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
    to,
    replyTo: data.email,
    subject: `New loan application — ${data.fullName} (${data.loanType})`,
    text,
    html,
    attachments: attachments.map((file) => ({
      filename: file.filename,
      content: file.content,
      contentType: file.contentType,
    })),
  });
}
