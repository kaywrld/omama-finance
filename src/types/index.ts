export type LoanApplicationStatus =
  | "PENDING"
  | "REVIEWING"
  | "CALLED"
  | "APPROVED"
  | "DECLINED";

export interface LoanApplicationRecord {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  nationalId: string;
  loanAmount: number;
  loanPurpose: string;
  monthlyIncome: number | null;
  employer: string | null;
  notes: string | null;
  status: LoanApplicationStatus;
  emailSent: boolean;
  createdAt: string;
}

/** Generic shape returned by any paginated list endpoint in this app. */
export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

/** Standard shape for API error responses. */
export interface ApiErrorResponse {
  error: string;
  issues?: Record<string, string[] | undefined>;
}
