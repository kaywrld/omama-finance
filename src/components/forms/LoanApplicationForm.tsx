"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  FileText,
  Home,
  Landmark,
  Loader2,
  Paperclip,
  Phone,
  ShieldCheck,
  Upload,
  Users,
  X,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import {
  loanApplicationSchema,
  MAX_FILE_SIZE_BYTES,
  MAX_FILES,
  ACCEPTED_FILE_TYPES,
  ACCEPTED_FILE_EXTENSIONS,
} from "@/lib/validations/loanApplication";

// Icons for the loan-type cards, matched to siteConfig.services by keyword
// so the mapping keeps working if labels are tweaked slightly.
const TYPE_ICONS: Array<{ match: RegExp; icon: typeof Landmark }> = [
  { match: /salary/i, icon: Landmark },
  { match: /business/i, icon: Briefcase },
  { match: /collateral/i, icon: Home },
  { match: /group|saving/i, icon: Users },
  { match: /insurance/i, icon: ShieldCheck },
];

function iconFor(label: string) {
  return TYPE_ICONS.find((entry) => entry.match.test(label))?.icon ?? Landmark;
}

// ── Field configuration ────────────────────────────────────────────────
// Every text/select/date/number field on the paper form is described here
// once, then rendered generically. This keeps ~60 fields in sync with the
// validation schema without 60 hand-written <input> blocks.

type FieldType = "text" | "email" | "tel" | "number" | "date" | "select" | "textarea";

interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  full?: boolean; // spans both grid columns
}

const MARITAL_OPTIONS = ["Single", "Married", "Divorced", "Widowed"];
const EDUCATION_OPTIONS = ["Primary", "Secondary", "Certificate", "Diploma", "Degree", "Postgraduate", "Other"];
const YES_NO = ["Yes", "No"];

interface Section {
  id: string;
  title: string;
  note?: string;
  fields: FieldDef[];
}

const SECTIONS: Section[] = [
  {
    id: "personal",
    title: "Personal Details",
    fields: [
      { name: "fullName", label: "Full name (Mr, Mrs etc.)", type: "text", required: true },
      { name: "idNumber", label: "ID number", type: "text", required: true },
      { name: "nationality", label: "Nationality", type: "text", required: true },
      { name: "dateOfBirth", label: "Date of birth", type: "date", required: true },
      { name: "maritalStatus", label: "Marital status", type: "select", required: true, options: MARITAL_OPTIONS },
      { name: "numberOfDependents", label: "Number of dependents", type: "number" },
      { name: "ecNumber", label: "E.C No", type: "text" },
      { name: "residentialAddress", label: "Residential address", type: "textarea", required: true, full: true, placeholder: "No., Street/Subdivision, Town/City, Province, Zip code" },
      { name: "residentialStatus", label: "Residential status", type: "select", required: true, options: ["Owned", "Family House", "Rented", "Other"] },
      { name: "lengthOfStayCurrentAddress", label: "Length of stay at current address", type: "text", placeholder: "e.g. 3 years" },
      { name: "lengthOfStayPreviousAddress", label: "Length of stay at previous address", type: "text", placeholder: "e.g. 2 years" },
      { name: "email", label: "Email address", type: "email", required: true },
      { name: "phone", label: "Phone number", type: "tel", required: true, placeholder: "+263 77 000 0000" },
    ],
  },
  {
    id: "spouse",
    title: "Spouse Details",
    note: "Complete if married",
    fields: [
      { name: "spouseName", label: "Name (Mr, Mrs etc.)", type: "text" },
      { name: "spouseIdNumber", label: "ID number", type: "text" },
      { name: "spousePhone", label: "Phone no(s)", type: "tel" },
      { name: "spouseEmployer", label: "Employer", type: "text" },
      { name: "spouseWorkAddress", label: "Work address", type: "text" },
      { name: "spouseWorkPhone", label: "Phone no", type: "tel" },
    ],
  },
  {
    id: "employment",
    title: "Employment Details",
    note: "Complete if employed",
    fields: [
      { name: "employer", label: "Employer", type: "text" },
      { name: "workAddress", label: "Work address", type: "text" },
      { name: "workPhone", label: "Work phone no", type: "tel" },
      { name: "levelOfEducation", label: "Level of education", type: "select", options: EDUCATION_OPTIONS },
      { name: "positionHeld", label: "Position held", type: "text" },
      { name: "periodOfEmployment", label: "Period of employment", type: "text", placeholder: "e.g. 4 years" },
      { name: "previousEmployer", label: "Previous employer", type: "text" },
      { name: "previousPeriodOfEmployment", label: "Period of employment", type: "text" },
      { name: "previousWorkPhone", label: "Work phone no", type: "tel" },
    ],
  },
  {
    id: "business",
    title: "Business Details",
    note: "Complete if self-employed",
    fields: [
      { name: "businessType", label: "Business type", type: "text" },
      { name: "businessAddress", label: "Business address", type: "text" },
      { name: "businessPhone", label: "Phone no", type: "tel" },
      { name: "businessLevelOfEducation", label: "Level of education", type: "select", options: EDUCATION_OPTIONS },
      { name: "mainActivities", label: "Main activities", type: "text" },
      { name: "periodInBusiness", label: "Period in business", type: "text" },
    ],
  },
  {
    id: "banking",
    title: "Banking Details",
    fields: [
      { name: "bankName", label: "Name of bank", type: "text", required: true },
      { name: "bankBranch", label: "Branch", type: "text", required: true },
      { name: "accountType", label: "Type of account held", type: "text", required: true, placeholder: "e.g. Savings" },
      { name: "accountNumber", label: "Account no", type: "text", required: true },
      { name: "accountOpenedDate", label: "When was account opened", type: "text", placeholder: "e.g. 2019" },
      { name: "hasLoanAccount", label: "Do you have a loan account?", type: "select", options: YES_NO },
      { name: "bankAmountOutstanding", label: "Amount outstanding (USD)", type: "number" },
      { name: "bankPmt", label: "PMT (monthly payment)", type: "text" },
    ],
  },
  {
    id: "loan",
    title: "Loan Details",
    fields: [
      { name: "loanAmountRequested", label: "Loan amount requested (USD)", type: "number", required: true },
      { name: "loanPurpose", label: "Purpose of loan", type: "text", required: true, placeholder: "e.g. School fees, stock" },
      { name: "proposedRepaymentPeriod", label: "Proposed repayment period", type: "text", required: true, placeholder: "e.g. 12 months" },
      { name: "proposedRepaymentDate", label: "Proposed repayment date", type: "text" },
      { name: "loanElsewhere", label: "Loan elsewhere?", type: "select", options: YES_NO },
      { name: "loanElsewhereOutstanding", label: "Amount outstanding (USD)", type: "number" },
      { name: "loanElsewhereRepayment", label: "Repayment", type: "text" },
    ],
  },
  {
    id: "security",
    title: "Security Details",
    fields: [
      { name: "securityType", label: "Type of security", type: "text", required: true },
      { name: "securityDescription", label: "Description", type: "textarea", required: true, full: true },
    ],
  },
  {
    id: "guarantor",
    title: "Guarantor Details",
    note: "Income is required",
    fields: [
      { name: "guarantorName", label: "Name (Mr, Mrs etc.)", type: "text", required: true },
      { name: "guarantorIdNumber", label: "ID no", type: "text", required: true },
      { name: "guarantorNationality", label: "Nationality", type: "text" },
      { name: "guarantorDateOfBirth", label: "Date of birth", type: "date" },
      { name: "guarantorMaritalStatus", label: "Marital status", type: "select", options: MARITAL_OPTIONS },
      { name: "guarantorPhone", label: "Phone no", type: "tel", required: true },
      { name: "guarantorRelationship", label: "Relationship to you", type: "text", required: true },
      { name: "guarantorAddress", label: "Residential address", type: "textarea", required: true, full: true },
      { name: "guarantorEmployer", label: "Employer", type: "text" },
      { name: "guarantorNetMonthlyIncome", label: "Net monthly income (USD)", type: "number", required: true },
    ],
  },
  {
    id: "kin1",
    title: "Next of Kin 1",
    note: "Must not reside at the same address as you",
    fields: [
      { name: "kin1Name", label: "Full name (Mr, Mrs etc.)", type: "text", required: true },
      { name: "kin1Address", label: "Residential address", type: "textarea", required: true, full: true },
      { name: "kin1Phone", label: "Phone no", type: "tel", required: true },
      { name: "kin1Employer", label: "Employer", type: "text" },
      { name: "kin1WorkPhone", label: "Work phone no", type: "tel" },
    ],
  },
  {
    id: "kin2",
    title: "Next of Kin 2",
    note: "Optional — must not reside at the same address as you",
    fields: [
      { name: "kin2Name", label: "Full name (Mr, Mrs etc.)", type: "text" },
      { name: "kin2Address", label: "Residential address", type: "textarea", full: true },
      { name: "kin2Phone", label: "Phone no", type: "tel" },
      { name: "kin2Employer", label: "Employer", type: "text" },
      { name: "kin2WorkPhone", label: "Work phone no", type: "tel" },
    ],
  },
];

const ALL_FIELD_NAMES = [
  "loanType",
  ...SECTIONS.flatMap((s) => s.fields.map((f) => f.name)),
  "residentialStatusOther",
  "declarationName",
] as const;

type Values = Record<(typeof ALL_FIELD_NAMES)[number], string> & { website: string };

const initialValues: Values = Object.fromEntries([
  ...ALL_FIELD_NAMES.map((name) => [name, ""]),
  ["website", ""],
]) as Values;

type FieldErrors = Partial<Record<string, string>>;

const telHref = `tel:${siteConfig.contact.phone.replace(/[^+\d]/g, "")}`;
const whatsappHref = `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(
  "Hi Omama Finance, I just submitted a loan application online."
)}`;

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function LoanApplicationForm() {
  const [step, setStep] = useState<"select" | "form">("select");
  const [applicationType, setApplicationType] = useState<"NEW" | "REPEAT" | "">("");
  const [values, setValues] = useState<Values>(initialValues);
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function handleFilesSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    if (selected.length === 0) return;

    const combined = [...files, ...selected];
    if (combined.length > MAX_FILES) {
      setFileError(`You can attach at most ${MAX_FILES} files.`);
      event.target.value = "";
      return;
    }

    for (const file of selected) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setFileError(`"${file.name}" is larger than 5MB. Please choose a smaller file.`);
        event.target.value = "";
        return;
      }
      if (file.type && !ACCEPTED_FILE_TYPES.includes(file.type)) {
        setFileError(`"${file.name}" isn't a supported file type. Use PDF, JPG, PNG, or Word.`);
        event.target.value = "";
        return;
      }
    }

    setFileError(null);
    setFiles(combined);
    event.target.value = "";
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setServerError(null);

    const candidate = { ...values, applicationType, agree };
    const parsed = loanApplicationSchema.safeParse(candidate);

    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const [key, messages] of Object.entries(parsed.error.flatten().fieldErrors)) {
        if (messages?.[0]) fieldErrors[key] = messages[0];
      }
      setErrors(fieldErrors);
      setServerError(
        `Please fix ${Object.keys(fieldErrors).length === 1 ? "1 field" : `${Object.keys(fieldErrors).length} fields`} highlighted above before submitting.`
      );
      const firstKey = Object.keys(fieldErrors)[0];
      if (firstKey) {
        document.getElementById(firstKey)?.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      return;
    }

    setErrors({});
    setStatus("submitting");

    try {
      const formData = new FormData();
      for (const [key, value] of Object.entries(parsed.data)) {
        if (key === "agree") {
          formData.append("agree", value ? "true" : "false");
          continue;
        }
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      }
      for (const file of files) {
        formData.append("documents", file);
      }

      // Baked in at build time (static export has no server to read env vars
      // at request time). Set NEXT_PUBLIC_API_URL before running
      // `npm run build:static`, e.g. NEXT_PUBLIC_API_URL="https://api.yourdomain.co.zw"
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
      const response = await fetch(`${apiUrl}/api/loan-application`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        if (data?.issues) {
          const fieldErrors: FieldErrors = {};
          for (const [key, messages] of Object.entries(data.issues as Record<string, string[]>)) {
            if (messages?.[0]) fieldErrors[key] = messages[0];
          }
          setErrors(fieldErrors);
        }
        setServerError(data?.error ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setServerError("Network error — check your connection and try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="of-card">
        <FormStyles />
        <div role="status" className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="h-9 w-9 text-success" />
          </div>
          <h2 className="mt-5 font-heading text-2xl font-bold text-primary">
            Thank you, {values.fullName.split(" ")[0] || values.fullName}!
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted">
            Your application has been sent to our team as a completed loan application form.
            You will be contacted within a maximum of{" "}
            <span className="font-semibold text-bronze">15 minutes</span> during working hours.
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
            If you don&apos;t hear from us after 15 minutes, please call or WhatsApp us directly.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a href={telHref} className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-light">
              <Phone className="h-4 w-4" />
              Call us
            </a>
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-md bg-[#25D366] px-5 py-3 text-sm font-medium text-white transition-colors hover:opacity-90">
              <WhatsAppIcon className="h-4 w-4" />
              WhatsApp us
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Step 1: choose which loan to apply for. Nothing else is shown until a
  // choice is made — the full form only appears once a loan type is picked.
  if (step === "select") {
    return (
      <div className="of-card mx-auto max-w-3xl">
        <FormStyles />

        <div className="flex justify-center">
          <Image src={siteConfig.logo.src} alt={siteConfig.logo.alt} width={siteConfig.logo.width} height={siteConfig.logo.height} className="h-12 w-auto" />
        </div>
        <h1 className="mt-4 text-center font-heading text-lg font-bold uppercase tracking-wide text-primary">
          What are you applying for?
        </h1>
        <p className="mx-auto mt-1 max-w-md text-center text-xs text-muted">
          Choose a loan type to start your application.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {siteConfig.services.map((service) => {
            const Icon = iconFor(service.label);
            return (
              <button
                key={service.label}
                type="button"
                onClick={() => {
                  setValues((prev) => ({ ...prev, loanType: service.label }));
                  setStep("form");
                }}
                className="of-type-card"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ background: "color-mix(in srgb, var(--color-gold) 18%, transparent)" }}>
                  <Icon className="h-5 w-5 text-bronze" />
                </span>
                <span>
                  <span className="block font-heading text-sm font-bold text-primary">{service.label}</span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted">{service.description}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="of-card">
      <FormStyles />

      <div className="flex justify-center">
        <Image src={siteConfig.logo.src} alt={siteConfig.logo.alt} width={siteConfig.logo.width} height={siteConfig.logo.height} className="h-12 w-auto" />
      </div>
      <h1 className="mt-4 text-center font-heading text-lg font-bold uppercase tracking-wide text-primary">
        Loan Application Form
      </h1>
      <p className="mx-auto mt-1 max-w-md text-center text-xs text-muted">
        Fill in every section that applies to you, attach your documents, and submit. Fields marked{" "}
        <span className="text-bronze">*</span> are required.
      </p>

      <div className="mx-auto mt-5 flex max-w-2xl items-center justify-between gap-3 rounded-lg border border-border bg-paper px-4 py-3">
        <span className="text-sm">
          <span className="text-xs uppercase tracking-wide text-muted">Applying for </span>
          <span className="font-heading font-bold text-primary">{values.loanType}</span>
        </span>
        <button
          type="button"
          onClick={() => setStep("select")}
          className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold uppercase tracking-wide text-bronze transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Change
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-8">
        {/* Honeypot */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="website">Leave this field empty</label>
          <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" value={values.website} onChange={handleChange} />
        </div>

        <input id="loanType" type="hidden" name="loanType" value={values.loanType} />
        {errors.loanType && <p className="of-error -mt-6">{errors.loanType}</p>}

        {/* Application type + Personal Details */}
        <div id="applicationType">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-heading text-xl font-bold text-primary">Personal Details</h2>
            <div className="flex gap-4 text-xs font-semibold uppercase tracking-wide text-muted">
              {(["NEW", "REPEAT"] as const).map((opt) => (
                <label key={opt} className="flex cursor-pointer items-center gap-1.5">
                  <input
                    type="radio"
                    name="applicationType"
                    value={opt}
                    checked={applicationType === opt}
                    onChange={() => setApplicationType(opt)}
                    className="h-3.5 w-3.5 accent-primary"
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>
          {errors.applicationType && <p className="of-error mb-3">{errors.applicationType}</p>}
        </div>

        {/* Personal details fields */}
        <SectionFields section={SECTIONS[0]} values={values} errors={errors} onChange={handleChange} />
        {values.residentialStatus === "Other" && (
          <div className="-mt-6">
            <SectionField
              def={{ name: "residentialStatusOther", label: "Please specify", type: "text" }}
              value={values.residentialStatusOther}
              error={errors.residentialStatusOther}
              onChange={handleChange}
            />
          </div>
        )}

        {/* Remaining sections */}
        {SECTIONS.slice(1).map((section) => (
          <div key={section.id}>
            <div className="mb-3 flex items-baseline justify-between gap-2 border-b border-border pb-2">
              <h2 className="font-heading text-xl font-bold text-primary">{section.title}</h2>
              {section.note && <span className="text-xs italic text-muted">{section.note}</span>}
            </div>
            <SectionFields section={section} values={values} errors={errors} onChange={handleChange} />
          </div>
        ))}

        {/* Supporting documents */}
        <div>
          <div className="mb-3 border-b border-border pb-2">
            <h2 className="font-heading text-xl font-bold text-primary">Supporting Documents</h2>
          </div>
          <label className="of-label">ID, proof of income, photo, proof of residence (optional)</label>
          <button type="button" onClick={() => fileInputRef.current?.click()} className="of-upload-box flex w-full items-center justify-center gap-2 rounded-lg px-4 py-5 text-sm font-medium transition-colors">
            <Upload className="h-4 w-4" />
            Click to upload documents
          </button>
          <input ref={fileInputRef} type="file" multiple accept={ACCEPTED_FILE_EXTENSIONS} onChange={handleFilesSelected} className="hidden" />
          <p className="mt-2 text-xs text-muted">PDF, JPG, PNG, or Word. Max 5MB per file, up to {MAX_FILES} files.</p>
          {fileError && <p className="of-error">{fileError}</p>}
          {files.length > 0 && (
            <ul className="mt-3 space-y-2">
              {files.map((file, i) => (
                <li key={`${file.name}-${i}`} className="of-file-row flex items-center justify-between gap-3 rounded-md px-3 py-2">
                  <span className="flex min-w-0 items-center gap-2">
                    <FileText className="h-4 w-4 shrink-0 text-bronze" />
                    <span className="truncate text-xs text-ink">{file.name}</span>
                    <span className="shrink-0 text-[11px] text-muted">{formatBytes(file.size)}</span>
                  </span>
                  <button type="button" onClick={() => removeFile(i)} aria-label={`Remove ${file.name}`} className="shrink-0 text-muted transition-colors hover:text-danger">
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Client declaration */}
        <div>
          <div className="mb-3 border-b border-border pb-2">
            <h2 className="font-heading text-xl font-bold text-primary">Client Declaration</h2>
          </div>
          <p className="text-sm leading-relaxed text-muted">
            I confirm that the information given above is true and correct and I authorise Omama
            Finance to make enquiries deemed necessary in connection with this application. I
            agree to pay any amounts that may be levied per the terms and conditions of the loan
            agreement.
          </p>
          <div className="mt-4">
            <SectionField
              def={{ name: "declarationName", label: "Type your full name to confirm", type: "text", required: true }}
              value={values.declarationName}
              error={errors.declarationName}
              onChange={handleChange}
            />
          </div>
          <label className="mt-3 flex cursor-pointer items-start gap-2 text-sm text-ink">
            <input
              id="agree"
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-primary"
            />
            I agree to the declaration above.
          </label>
          {errors.agree && <p className="of-error">{errors.agree}</p>}
        </div>

        {/* Office use only — shown so applicants see the full form, but staff-only */}
        <div className="of-office-block rounded-lg p-4">
          <h3 className="text-xs font-bold uppercase tracking-wide text-muted">For office use only</h3>
          <p className="mt-1 text-xs text-muted">Completed by Omama Finance staff after submission — not editable here.</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <OfficeField label="Loan number" />
            <OfficeField label="Security value x3 of loan amount" />
            <OfficeField label="Tangible value (official use)" />
            <OfficeField label="Requirements checklist (applicant &amp; guarantor)" />
            <OfficeField label="Loan officer &amp; date" />
            <OfficeField label="Branch supervisor &amp; date" />
          </div>
        </div>

        {serverError && (
          <p role="alert" className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
            {serverError}
          </p>
        )}

        <div className="flex justify-end">
          <button type="submit" disabled={status === "submitting"} className="of-btn-primary">
            {status === "submitting" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                <Paperclip className="h-4 w-4" />
                Submit application
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function SectionFields({
  section,
  values,
  errors,
  onChange,
}: {
  section: Section;
  values: Values;
  errors: FieldErrors;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {section.fields.map((def) => (
        <SectionField
          key={def.name}
          def={def}
          value={values[def.name as keyof Values] ?? ""}
          error={errors[def.name]}
          onChange={onChange}
        />
      ))}
    </div>
  );
}

function SectionField({
  def,
  value,
  error,
  onChange,
}: {
  def: FieldDef;
  value: string;
  error?: string;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
}) {
  const wrapperClass = def.full ? "sm:col-span-2 lg:col-span-3" : undefined;

  return (
    <div className={wrapperClass}>
      <label htmlFor={def.name} className="of-label">
        {def.label}
        {def.required && <span className="text-bronze"> *</span>}
      </label>
      {def.type === "select" ? (
        <select id={def.name} name={def.name} value={value} onChange={onChange} aria-invalid={Boolean(error)} className="of-select">
          <option value="">Select…</option>
          {def.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : def.type === "textarea" ? (
        <textarea id={def.name} name={def.name} value={value} onChange={onChange} rows={2} placeholder={def.placeholder} aria-invalid={Boolean(error)} className="of-textarea" />
      ) : (
        <input id={def.name} name={def.name} type={def.type} value={value} onChange={onChange} placeholder={def.placeholder} aria-invalid={Boolean(error)} className="of-input" />
      )}
      {error && <p className="of-error">{error}</p>}
    </div>
  );
}

function OfficeField({ label }: { label: string }) {
  return (
    <div>
      <label className="of-label">{label}</label>
      <input type="text" value="" disabled placeholder="Left blank for staff to complete" className="of-input of-input-disabled" />
    </div>
  );
}

function FormStyles() {
  return (
    <style>{`
      .of-card {
        position: relative;
        border-radius: 22px;
        padding: 34px 26px 30px;
        background: #ffffff;
        border: 1px solid var(--color-border);
        box-shadow: 0 24px 60px -28px rgba(0,0,0,0.35);
        overflow: hidden;
      }
      .of-card::before {
        content: '';
        position: absolute;
        inset: 0;
        background:
          radial-gradient(circle at 15% 0%, color-mix(in srgb, var(--color-gold) 10%, transparent), transparent 55%),
          radial-gradient(circle at 100% 100%, color-mix(in srgb, var(--color-primary) 6%, transparent), transparent 60%);
        pointer-events: none;
      }
      .of-card > * { position: relative; z-index: 1; }

      .of-input, .of-select, .of-textarea {
        width: 100%;
        background: #fff;
        border: 1px solid var(--color-border);
        border-radius: 8px;
        padding: 12px 14px;
        font-size: 14px;
        color: var(--color-ink);
        outline: none;
        transition: border-color .2s, background .2s;
        box-sizing: border-box;
      }
      .of-input::placeholder, .of-textarea::placeholder { color: #9a9488; }
      .of-input:focus, .of-select:focus, .of-textarea:focus {
        border-color: var(--color-gold);
        background: #fffdf7;
      }
      .of-select option { background: #fff; color: var(--color-ink); }
      .of-textarea { resize: vertical; min-height: 60px; }

      .of-input-disabled {
        background: #f2f1ee;
        color: #9a9488;
        cursor: not-allowed;
      }

      .of-office-block {
        background: #f7f6f3;
        border: 1px dashed var(--color-border);
      }

      .of-label {
        display: block;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--color-muted);
        margin-bottom: 6px;
      }

      .of-error { margin-top: 6px; font-size: 12px; color: var(--color-danger); }

      .of-btn-primary {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        background: var(--color-primary);
        color: #fff;
        font-weight: 700;
        font-size: 13px;
        letter-spacing: 0.04em;
        padding: 13px 24px;
        border-radius: 9px;
        border: none;
        cursor: pointer;
        transition: background .2s, transform .15s, opacity .2s;
      }
      .of-btn-primary:hover { background: var(--color-primary-light); transform: translateY(-1px); }
      .of-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

      .of-type-card {
        text-align: left;
        width: 100%;
        background: var(--color-paper);
        border: 1px solid var(--color-border);
        border-radius: 14px;
        padding: 18px;
        cursor: pointer;
        transition: border-color .2s, transform .2s, background .2s, box-shadow .2s;
        display: flex;
        gap: 14px;
        align-items: flex-start;
      }
      .of-type-card:hover {
        border-color: var(--color-gold);
        background: #fff;
        transform: translateY(-2px);
        box-shadow: 0 12px 24px -16px rgba(0,0,0,0.25);
      }

      .of-upload-box {
        background: var(--color-paper);
        border: 1px dashed color-mix(in srgb, var(--color-gold) 55%, var(--color-border));
        color: var(--color-muted);
      }
      .of-upload-box:hover { border-color: var(--color-gold); color: var(--color-ink); }

      .of-file-row {
        background: var(--color-paper);
        border: 1px solid var(--color-border);
      }
    `}</style>
  );
}