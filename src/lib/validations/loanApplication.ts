import { z } from "zod";

// Single source of truth for the loan application shape.
// Import this on the client (the multi-step form) AND in the API route,
// so validation never drifts between the two.

// ── File upload constraints (supporting documents) ─────────────────────
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB per file
export const MAX_FILES = 5;
export const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
export const ACCEPTED_FILE_EXTENSIONS = ".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx";

// ── Step 1: which loan the applicant wants ──────────────────────────────
export const loanTypeSchema = z.object({
  loanType: z
    .string()
    .trim()
    .min(2, "Choose the type of loan you'd like to apply for"),
});

// ── Step 2: personal details ────────────────────────────────────────────
export const personalDetailsSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Enter your full name")
    .max(150, "Name is too long"),

  email: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .max(150),

  phone: z
    .string()
    .trim()
    .min(9, "Enter a valid phone number")
    .max(20, "Phone number is too long")
    .regex(/^[0-9+()\s-]+$/, "Phone number contains invalid characters"),

  nationalId: z
    .string()
    .trim()
    .min(5, "Enter a valid national ID number")
    .max(30, "National ID is too long")
    .regex(/^[A-Za-z0-9\-/\s]+$/, "National ID contains invalid characters"),

  address: z
    .string()
    .trim()
    .min(5, "Enter your residential address")
    .max(200, "Address is too long"),
});

// ── Step 3: loan details + documents (files handled separately) ─────────
export const loanDetailsSchema = z.object({
  loanAmount: z.coerce
    .number({ message: "Enter a loan amount" })
    .positive("Loan amount must be greater than 0")
    .max(1_000_000, "Loan amount is too large"),

  loanPurpose: z
    .string()
    .trim()
    .min(2, "Tell us what the loan is for")
    .max(100, "Keep the purpose under 100 characters"),

  monthlyIncome: z.coerce
    .number()
    .positive("Monthly income must be greater than 0")
    .max(10_000_000)
    .optional(),

  employer: z.string().trim().max(150).optional(),

  notes: z.string().trim().max(1000, "Keep notes under 1000 characters").optional(),
});

// ── Full schema (all steps combined + honeypot) ─────────────────────────
export const loanApplicationSchema = loanTypeSchema
  .extend(personalDetailsSchema.shape)
  .extend(loanDetailsSchema.shape)
  .extend({
    // Honeypot field: real users never fill this in (it's hidden via CSS).
    // Bots that auto-fill every field will trip it. Kept optional + must be empty.
    website: z.string().max(0, "Spam detected").optional().or(z.literal("")),
  });

export type LoanApplicationInput = z.infer<typeof loanApplicationSchema>;
export type PersonalDetailsInput = z.infer<typeof personalDetailsSchema>;
export type LoanDetailsInput = z.infer<typeof loanDetailsSchema>;