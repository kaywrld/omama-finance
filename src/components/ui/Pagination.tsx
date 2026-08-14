import Link from "next/link";

interface PaginationProps {
  /** Current page (1-indexed). */
  page: number;
  totalPages: number;
  /** Base path, e.g. "/admin/applications" — query string is appended. */
  basePath: string;
  /** Extra query params to preserve across page links, e.g. { status: "PENDING" }. */
  searchParams?: Record<string, string | undefined>;
}

function buildHref(basePath: string, page: number, searchParams?: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value) params.set(key, value);
    }
  }
  params.set("page", String(page));
  return `${basePath}?${params.toString()}`;
}

/**
 * Plain <Link>-based pagination. Uses Next.js's built-in link prefetching,
 * so adjacent pages are typically already cached by the time someone clicks.
 * Pairs with `parsePaginationParams` / `buildPaginatedResult` in lib/pagination.ts.
 */
export function Pagination({ page, totalPages, basePath, searchParams }: PaginationProps) {
  if (totalPages <= 1) return null;

  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  // Keep the page-number list short: first, last, current, and its neighbors.
  const pages = new Set<number>([1, totalPages, page, page - 1, page + 1]);
  const pageList = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1 py-6">
      <PaginationLink
        href={buildHref(basePath, page - 1, searchParams)}
        disabled={prevDisabled}
        aria-label="Previous page"
      >
        Prev
      </PaginationLink>

      {pageList.map((p, i) => {
        const prevListed = pageList[i - 1];
        const showEllipsis = prevListed !== undefined && p - prevListed > 1;
        return (
          <span key={p} className="flex items-center gap-1">
            {showEllipsis && <span className="px-2 text-[var(--color-muted)]">…</span>}
            <PaginationLink
              href={buildHref(basePath, p, searchParams)}
              current={p === page}
              aria-label={`Page ${p}`}
              aria-current={p === page ? "page" : undefined}
            >
              {p}
            </PaginationLink>
          </span>
        );
      })}

      <PaginationLink
        href={buildHref(basePath, page + 1, searchParams)}
        disabled={nextDisabled}
        aria-label="Next page"
      >
        Next
      </PaginationLink>
    </nav>
  );
}

function PaginationLink({
  href,
  disabled,
  current,
  children,
  ...rest
}: {
  href: string;
  disabled?: boolean;
  current?: boolean;
  children: React.ReactNode;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const baseClasses =
    "min-w-9 h-9 px-2 inline-flex items-center justify-center rounded-md text-sm border transition-colors";

  if (disabled) {
    return (
      <span
        aria-disabled="true"
        className={`${baseClasses} border-[var(--color-border)] text-[var(--color-muted)] opacity-50 cursor-not-allowed`}
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={`${baseClasses} ${
        current
          ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
          : "border-[var(--color-border)] hover:border-[var(--color-primary)]"
      }`}
      {...rest}
    >
      {children}
    </Link>
  );
}
