import { z } from "zod";

// Single source of truth for the loan application shape. This mirrors the
// physical "Loan Application Form" paper document field-for-field (see
// /public/loan-application-reference if ever needed) so the online form,
// the generated PDF, and the notification email never drift apart.
//
// Fields that are reserved for Omama staff on the paper form (loan number,
// security valuation, requirements checklist, signatures) are NOT part of
// this schema — applicants can't submit values for them. They're rendered
// as disabled placeholders in the UI and left blank on the generated PDF
// for staff to complete by hand.

// ── File upload constraints (supporting documents) ─────────────────────
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB per file
export const MAX_FILES = 6;
export const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
export const ACCEPTED_FILE_EXTENSIONS = ".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx";

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));
const requiredText = (min: number, max: number, message: string) =>
  z.string().trim().min(min, message).max(max);
const optionalPhone = z
  .string()
  .trim()
  .max(20)
  .regex(/^[0-9+()\s-]*$/, "Phone number contains invalid characters")
  .optional()
  .or(z.literal(""));
const requiredPhone = z
  .string()
  .trim()
  .min(9, "Enter a valid phone number")
  .max(20, "Phone number is too long")
  .regex(/^[0-9+()\s-]+$/, "Phone number contains invalid characters");
const optionalNumber = z.coerce.number().nonnegative().optional().or(z.nan().transform(() => undefined));

// ── Personal details ─────────────────────────────────────────────────────
export const personalDetailsSchema = z.object({
  applicationType: z.enum(["NEW", "REPEAT"], { message: "Select new or repeat application" }),
  loanType: requiredText(2, 100, "Choose the type of loan you'd like to apply for"),

  fullName: requiredText(2, 150, "Enter your full name"),
  idNumber: requiredText(4, 30, "Enter your ID number"),
  nationality: requiredText(2, 60, "Enter your nationality"),
  dateOfBirth: requiredText(4, 20, "Enter your date of birth"),
  maritalStatus: z.enum(["Single", "Married", "Divorced", "Widowed"], {
    message: "Select your marital status",
  }),
  numberOfDependents: optionalNumber,
  ecNumber: optionalText(30),

  residentialAddress: requiredText(5, 250, "Enter your residential address"),
  residentialStatus: z.enum(["Owned", "Family House", "Rented", "Other"], {
    message: "Select your residential status",
  }),
  residentialStatusOther: optionalText(100),
  lengthOfStayCurrentAddress: optionalText(50),
  lengthOfStayPreviousAddress: optionalText(50),

  email: z.string().trim().email("Enter a valid email address").max(150),
  phone: requiredPhone,
});

// ── Spouse details (optional — complete if married) ─────────────────────
export const spouseDetailsSchema = z.object({
  spouseName: optionalText(150),
  spouseIdNumber: optionalText(30),
  spousePhone: optionalPhone,
  spouseEmployer: optionalText(150),
  spouseWorkAddress: optionalText(200),
  spouseWorkPhone: optionalPhone,
});

// ── Employment details (optional — complete if employed) ────────────────
export const employmentDetailsSchema = z.object({
  employer: optionalText(150),
  workAddress: optionalText(200),
  workPhone: optionalPhone,
  levelOfEducation: optionalText(60),
  positionHeld: optionalText(100),
  periodOfEmployment: optionalText(50),
  previousEmployer: optionalText(150),
  previousPeriodOfEmployment: optionalText(50),
  previousWorkPhone: optionalPhone,
});

// ── Business details (optional — complete if self-employed) ─────────────
export const businessDetailsSchema = z.object({
  businessType: optionalText(150),
  businessAddress: optionalText(200),
  businessPhone: optionalPhone,
  businessLevelOfEducation: optionalText(60),
  mainActivities: optionalText(200),
  periodInBusiness: optionalText(50),
});

// ── Banking details ──────────────────────────────────────────────────────
export const bankingDetailsSchema = z.object({
  bankName: requiredText(2, 100, "Enter the name of your bank"),
  bankBranch: requiredText(2, 100, "Enter your branch"),
  accountType: requiredText(2, 60, "Enter the type of account held"),
  accountNumber: requiredText(2, 40, "Enter your account number"),
  accountOpenedDate: optionalText(30),
  hasLoanAccount: z.enum(["Yes", "No"]).optional(),
  bankAmountOutstanding: optionalNumber,
  bankPmt: optionalText(30),
});

// ── Loan details ─────────────────────────────────────────────────────────
export const loanDetailsSchema = z.object({
  loanAmountRequested: z.coerce
    .number({ message: "Enter the loan amount requested" })
    .positive("Loan amount must be greater than 0")
    .max(1_000_000, "Loan amount is too large"),
  loanPurpose: requiredText(2, 150, "Tell us what the loan is for"),
  proposedRepaymentPeriod: requiredText(1, 60, "Enter the proposed repayment period"),
  proposedRepaymentDate: optionalText(30),
  loanElsewhere: z.enum(["Yes", "No"]).optional(),
  loanElsewhereOutstanding: optionalNumber,
  loanElsewhereRepayment: optionalText(30),
});

// ── Security details ─────────────────────────────────────────────────────
export const securityDetailsSchema = z.object({
  securityType: requiredText(2, 100, "Enter the type of security offered"),
  securityDescription: requiredText(2, 300, "Describe the security offered"),
});

// ── Guarantor details (income is required, per policy) ───────────────────
export const guarantorDetailsSchema = z.object({
  guarantorName: requiredText(2, 150, "Enter the guarantor's full name"),
  guarantorIdNumber: requiredText(4, 30, "Enter the guarantor's ID number"),
  guarantorNationality: optionalText(60),
  guarantorDateOfBirth: optionalText(20),
  guarantorMaritalStatus: z.enum(["Single", "Married", "Divorced", "Widowed"]).optional(),
  guarantorPhone: requiredPhone,
  guarantorRelationship: requiredText(2, 60, "Enter your relationship to the guarantor"),
  guarantorAddress: requiredText(5, 250, "Enter the guarantor's residential address"),
  guarantorEmployer: optionalText(150),
  guarantorNetMonthlyIncome: z.coerce
    .number({ message: "Guarantor's net monthly income is required" })
    .positive("Enter a valid monthly income")
    .max(10_000_000),
});

// ── Next of kin (not residing at the same address as the applicant) ─────
export const nextOfKin1Schema = z.object({
  kin1Name: requiredText(2, 150, "Enter next of kin's full name"),
  kin1Address: requiredText(5, 250, "Enter next of kin's residential address"),
  kin1Phone: requiredPhone,
  kin1Employer: optionalText(150),
  kin1WorkPhone: optionalPhone,
});

export const nextOfKin2Schema = z.object({
  kin2Name: optionalText(150),
  kin2Address: optionalText(250),
  kin2Phone: optionalPhone,
  kin2Employer: optionalText(150),
  kin2WorkPhone: optionalPhone,
});

// ── Client declaration ───────────────────────────────────────────────────
export const declarationSchema = z.object({
  declarationName: requiredText(2, 150, "Type your full name to confirm the declaration"),
  agree: z.literal(true, { message: "You must agree to the declaration to submit" }),
});

// ── Full schema (all sections combined + honeypot) ───────────────────────
export const loanApplicationSchema = personalDetailsSchema
  .extend(spouseDetailsSchema.shape)
  .extend(employmentDetailsSchema.shape)
  .extend(businessDetailsSchema.shape)
  .extend(bankingDetailsSchema.shape)
  .extend(loanDetailsSchema.shape)
  .extend(securityDetailsSchema.shape)
  .extend(guarantorDetailsSchema.shape)
  .extend(nextOfKin1Schema.shape)
  .extend(nextOfKin2Schema.shape)
  .extend(declarationSchema.shape)
  .extend({
    // Honeypot field: real users never fill this in (it's hidden via CSS).
    // Bots that auto-fill every field will trip it. Kept optional + must be empty.
    website: z.string().max(0, "Spam detected").optional().or(z.literal("")),
  });

export type LoanApplicationInput = z.infer<typeof loanApplicationSchema>;
export type PersonalDetailsInput = z.infer<typeof personalDetailsSchema>;
export type LoanDetailsInput = z.infer<typeof loanDetailsSchema>;

// Field keys grouped by the paper form's section, in display order. Used to
// drive both the form UI and the generated PDF, so the two never fall out
// of sync.
export const SECTION_FIELD_ORDER = {
  personal: [
    "fullName",
    "idNumber",
    "nationality",
    "dateOfBirth",
    "maritalStatus",
    "numberOfDependents",
    "ecNumber",
    "residentialAddress",
    "residentialStatus",
    "residentialStatusOther",
    "lengthOfStayCurrentAddress",
    "lengthOfStayPreviousAddress",
    "email",
    "phone",
  ],
  spouse: ["spouseName", "spouseIdNumber", "spousePhone", "spouseEmployer", "spouseWorkAddress", "spouseWorkPhone"],
  employment: [
    "employer",
    "workAddress",
    "workPhone",
    "levelOfEducation",
    "positionHeld",
    "periodOfEmployment",
    "previousEmployer",
    "previousPeriodOfEmployment",
    "previousWorkPhone",
  ],
  business: [
    "businessType",
    "businessAddress",
    "businessPhone",
    "businessLevelOfEducation",
    "mainActivities",
    "periodInBusiness",
  ],
  banking: [
    "bankName",
    "bankBranch",
    "accountType",
    "accountNumber",
    "accountOpenedDate",
    "hasLoanAccount",
    "bankAmountOutstanding",
    "bankPmt",
  ],
  loan: [
    "loanAmountRequested",
    "loanPurpose",
    "proposedRepaymentPeriod",
    "proposedRepaymentDate",
    "loanElsewhere",
    "loanElsewhereOutstanding",
    "loanElsewhereRepayment",
  ],
  security: ["securityType", "securityDescription"],
  guarantor: [
    "guarantorName",
    "guarantorIdNumber",
    "guarantorNationality",
    "guarantorDateOfBirth",
    "guarantorMaritalStatus",
    "guarantorPhone",
    "guarantorRelationship",
    "guarantorAddress",
    "guarantorEmployer",
    "guarantorNetMonthlyIncome",
  ],
  kin1: ["kin1Name", "kin1Address", "kin1Phone", "kin1Employer", "kin1WorkPhone"],
  kin2: ["kin2Name", "kin2Address", "kin2Phone", "kin2Employer", "kin2WorkPhone"],
} as const;
