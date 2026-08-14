// Automatically shown by Next.js while a route segment (and any of its
// server data fetches) is loading — this is what makes navigation feel
// instant even before the next page is fully ready.
export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6" role="status" aria-label="Loading">
      <div className="animate-pulse space-y-4">
        <div className="h-3 w-32 rounded bg-[var(--color-border)]" />
        <div className="h-8 w-2/3 rounded bg-[var(--color-border)]" />
        <div className="h-4 w-full max-w-lg rounded bg-[var(--color-border)]" />
        <div className="h-4 w-full max-w-md rounded bg-[var(--color-border)]" />
      </div>
    </div>
  );
}
