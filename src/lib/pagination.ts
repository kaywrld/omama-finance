import type { PaginatedResult } from "@/types";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export interface PaginationParams {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
}

/**
 * Parses `page`/`pageSize` query params (as strings, straight from
 * searchParams) into safe, clamped values plus the Prisma skip/take pair.
 *
 * Usage in a route/page:
 *   const { skip, take, page, pageSize } = parsePaginationParams(searchParams);
 *   const [items, totalItems] = await Promise.all([
 *     prisma.loanApplication.findMany({ skip, take, orderBy: { createdAt: "desc" } }),
 *     prisma.loanApplication.count(),
 *   ]);
 *   return buildPaginatedResult(items, totalItems, page, pageSize);
 */
export function parsePaginationParams(
  searchParams: URLSearchParams | Record<string, string | string[] | undefined>
): PaginationParams {
  const get = (key: string): string | undefined => {
    if (searchParams instanceof URLSearchParams) return searchParams.get(key) ?? undefined;
    const value = searchParams[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const rawPage = Number.parseInt(get("page") ?? "1", 10);
  const rawPageSize = Number.parseInt(get("pageSize") ?? String(DEFAULT_PAGE_SIZE), 10);

  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const pageSize =
    Number.isFinite(rawPageSize) && rawPageSize > 0
      ? Math.min(rawPageSize, MAX_PAGE_SIZE)
      : DEFAULT_PAGE_SIZE;

  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}

export function buildPaginatedResult<T>(
  items: T[],
  totalItems: number,
  page: number,
  pageSize: number
): PaginatedResult<T> {
  return {
    items,
    page,
    pageSize,
    totalItems,
    totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
  };
}
