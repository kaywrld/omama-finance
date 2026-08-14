"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Check,
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
  personalDetailsSchema,
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

type Step = "type" | "personal" | "details" | "success";

type Values = {
  loanType: string;
  fullName: string;
  email: string;
  phone: string;
  nationalId: string;
  address: string;
  loanAmount: string;
  loanPurpose: string;
  monthlyIncome: string;
  employer: string;
  notes: string;
  website: string; // honeypot — stays empty, hidden from real users via CSS
};

const initialValues: Values = {
  loanType: "",
  fullName: "",
  email: "",
  phone: "",
  nationalId: "",
  address: "",
  loanAmount: "",
  loanPurpose: "",
  monthlyIncome: "",
  employer: "",
  notes: "",
  website: "",
};

type FieldErrors = Partial<Record<keyof Values, string>>;

const telHref = `tel:${siteConfig.contact.phone.replace(/[^+\d]/g, "")}`;
const whatsappHref = `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(
  "Hi Omama Finance, I just submitted a loan application online."
)}`;

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const STEPS: Array<{ key: Step; label: string }> = [
  { key: "type", label: "Loan type" },
  { key: "personal", label: "Your details" },
  { key: "details", label: "Documents" },
];

export function LoanApplicationForm() {
  const [step, setStep] = useState<Step>("type");
  const [values, setValues] = useState<Values>(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function selectLoanType(label: string) {
    setValues((prev) => ({ ...prev, loanType: label }));
    setErrors((prev) => ({ ...prev, loanType: undefined }));
    setStep("personal");
  }

  function handlePersonalNext(event: React.FormEvent) {
    event.preventDefault();
    const parsed = personalDetailsSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const [key, messages] of Object.entries(parsed.error.flatten().fieldErrors)) {
        if (messages?.[0]) fieldErrors[key as keyof FieldErrors] = messages[0];
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setStep("details");
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

    const parsed = loanApplicationSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const [key, messages] of Object.entries(parsed.error.flatten().fieldErrors)) {
        if (messages?.[0]) fieldErrors[key as keyof FieldErrors] = messages[0];
      }
      setErrors(fieldErrors);
      // Personal-detail fields live on the previous step; if one of those
      // is invalid, send the applicant back to fix it.
      const personalKeys: (keyof Values)[] = ["fullName", "email", "phone", "nationalId", "address"];
      if (personalKeys.some((key) => fieldErrors[key])) {
        setStep("personal");
      }
      return;
    }

    setErrors({});
    setStatus("submitting");

    try {
      const formData = new FormData();
      for (const [key, value] of Object.entries(parsed.data)) {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      }
      for (const file of files) {
        formData.append("documents", file);
      }

      const response = await fetch("/loan-application.php", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setServerError(data?.error ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      setStatus("idle");
      setStep("success");
    } catch {
      setServerError("Network error — check your connection and try again.");
      setStatus("error");
    }
  }

  const activeStepIndex = STEPS.findIndex((s) => s.key === step);

  return (
    <div className="of-card">
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
        .of-textarea { resize: vertical; min-height: 90px; }

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

        .of-btn-ghost {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: transparent;
          color: var(--color-muted);
          font-weight: 600;
          font-size: 13px;
          padding: 13px 18px;
          border-radius: 9px;
          border: 1px solid var(--color-border);
          cursor: pointer;
          transition: border-color .2s, color .2s;
        }
        .of-btn-ghost:hover { border-color: var(--color-primary); color: var(--color-primary); }

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

        .of-step-dot {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 26px;
          width: 26px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          flex-shrink: 0;
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

      {/* Logo at the top of the form */}
      <div className="flex justify-center">
        <Image
          src={siteConfig.logo.src}
          alt={siteConfig.logo.alt}
          width={siteConfig.logo.width}
          height={siteConfig.logo.height}
          className="h-12 w-auto"
        />
      </div>

      {/* Step indicator */}
      {step !== "success" && (
        <div className="mt-7 flex items-center justify-center gap-2 sm:gap-3">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2">
                <span
                  className="of-step-dot"
                  style={{
                    background: i <= activeStepIndex ? "var(--color-gold)" : "var(--color-paper)",
                    color: i <= activeStepIndex ? "var(--color-primary)" : "var(--color-muted)",
                    border: i <= activeStepIndex ? "none" : "1px solid var(--color-border)",
                  }}
                >
                  {i < activeStepIndex ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </span>
                <span
                  className="hidden text-xs font-semibold uppercase tracking-wide sm:inline"
                  style={{ color: i <= activeStepIndex ? "var(--color-primary)" : "var(--color-muted)" }}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <span className="h-px w-6 bg-border sm:w-10" aria-hidden="true" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Step 1: choose loan type ─────────────────────────────────── */}
      {step === "type" && (
        <div className="mt-8">
          <h2 className="text-center font-heading text-xl font-bold text-primary">
            What are you applying for?
          </h2>
          <p className="mt-2 text-center text-sm text-muted">
            Choose the loan type that best fits your needs.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {siteConfig.services.map((service) => {
              const Icon = iconFor(service.label);
              return (
                <button
                  key={service.label}
                  type="button"
                  onClick={() => selectLoanType(service.label)}
                  className="of-type-card"
                >
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: "color-mix(in srgb, var(--color-gold) 18%, transparent)" }}
                  >
                    <Icon className="h-5 w-5 text-bronze" />
                  </span>
                  <span>
                    <span className="block font-heading text-sm font-bold text-primary">
                      {service.label}
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed text-muted">
                      {service.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Step 2: personal details ─────────────────────────────────── */}
      {step === "personal" && (
        <form onSubmit={handlePersonalNext} noValidate className="mt-8 space-y-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h2 className="font-heading text-xl font-bold text-primary">Your details</h2>
            <span className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-semibold text-bronze">
              {values.loanType}
            </span>
          </div>

          <FormField label="Full name" name="fullName" value={values.fullName} onChange={handleChange} error={errors.fullName} required />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Email" name="email" type="email" value={values.email} onChange={handleChange} error={errors.email} required />
            <FormField label="Phone number" name="phone" type="tel" value={values.phone} onChange={handleChange} error={errors.phone} required placeholder="+263 77 000 0000" />
          </div>

          <FormField label="National ID number" name="nationalId" value={values.nationalId} onChange={handleChange} error={errors.nationalId} required placeholder="63-123456A12" />

          <FormField label="Residential address" name="address" value={values.address} onChange={handleChange} error={errors.address} required placeholder="123 Samora Machel Ave, Harare" />

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <button type="button" className="of-btn-ghost" onClick={() => setStep("type")}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <button type="submit" className="of-btn-primary">
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      )}

      {/* ── Step 3: loan details + documents ─────────────────────────── */}
      {step === "details" && (
        <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-4">
          {/* Honeypot — hidden from sighted/real users, bots often fill every field. */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor="website">Leave this field empty</label>
            <input
              id="website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={values.website}
              onChange={handleChange}
            />
          </div>

          <h2 className="font-heading text-xl font-bold text-primary">Loan &amp; documents</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Loan amount (USD)" name="loanAmount" type="number" value={values.loanAmount} onChange={handleChange} error={errors.loanAmount} required />
            <FormField label="Loan purpose" name="loanPurpose" value={values.loanPurpose} onChange={handleChange} error={errors.loanPurpose} required placeholder="e.g. School fees, stock" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Monthly income (USD)" name="monthlyIncome" type="number" value={values.monthlyIncome} onChange={handleChange} error={errors.monthlyIncome} />
            <FormField label="Employer" name="employer" value={values.employer} onChange={handleChange} error={errors.employer} />
          </div>

          <div>
            <label htmlFor="notes" className="of-label">Additional notes</label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={values.notes}
              onChange={handleChange}
              className="of-textarea"
              placeholder="Anything else we should know?"
            />
            {errors.notes && <p className="of-error">{errors.notes}</p>}
          </div>

          {/* Document upload — optional */}
          <div>
            <label className="of-label">Supporting documents (optional)</label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="of-upload-box flex w-full items-center justify-center gap-2 rounded-lg px-4 py-5 text-sm font-medium transition-colors"
            >
              <Upload className="h-4 w-4" />
              Click to upload ID, payslip, or proof of income
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ACCEPTED_FILE_EXTENSIONS}
              onChange={handleFilesSelected}
              className="hidden"
            />
            <p className="mt-2 text-xs text-muted">
              PDF, JPG, PNG, or Word. Max 5MB per file, up to {MAX_FILES} files.
            </p>

            {fileError && <p className="of-error">{fileError}</p>}

            {files.length > 0 && (
              <ul className="mt-3 space-y-2">
                {files.map((file, i) => (
                  <li
                    key={`${file.name}-${i}`}
                    className="of-file-row flex items-center justify-between gap-3 rounded-md px-3 py-2"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <FileText className="h-4 w-4 shrink-0 text-bronze" />
                      <span className="truncate text-xs text-ink">{file.name}</span>
                      <span className="shrink-0 text-[11px] text-muted">{formatBytes(file.size)}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      aria-label={`Remove ${file.name}`}
                      className="shrink-0 text-muted transition-colors hover:text-danger"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {serverError && (
            <p role="alert" className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
              {serverError}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <button type="button" className="of-btn-ghost" onClick={() => setStep("personal")}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
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
      )}

      {/* ── Success ───────────────────────────────────────────────────── */}
      {step === "success" && (
        <div role="status" className="mt-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="h-9 w-9 text-success" />
          </div>
          <h2 className="mt-5 font-heading text-2xl font-bold text-primary">
            Thank you, {values.fullName.split(" ")[0] || values.fullName}!
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted">
            Your application has been sent. You will be contacted within a
            maximum of <span className="font-semibold text-bronze">15 minutes</span> during
            working hours.
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
            If you don&apos;t hear from us after 15 minutes, please call or
            WhatsApp us directly.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href={telHref}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-light"
            >
              <Phone className="h-4 w-4" />
              Call us
            </a>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-[#25D366] px-5 py-3 text-sm font-medium text-white transition-colors hover:opacity-90"
            >
              <WhatsAppIcon className="h-4 w-4" />
              WhatsApp us
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

interface FormFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  error?: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}

function FormField({ label, name, value, onChange, error, type = "text", required, placeholder }: FormFieldProps) {
  return (
    <div>
      <label htmlFor={name} className="of-label">
        {label}
        {required && <span className="text-bronze"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        className="of-input"
      />
      {error && (
        <p id={`${name}-error`} className="of-error">
          {error}
        </p>
      )}
    </div>
  );
}