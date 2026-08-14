import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
      <p className="font-[family-name:var(--font-mono)] text-sm text-[var(--color-accent)]">404</p>
      <h1 className="mt-2 font-[family-name:var(--font-heading)] text-2xl font-semibold text-[var(--color-primary)]">
        Page not found
      </h1>
      <p className="mt-2 text-[var(--color-muted)]">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-md bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-light)]"
      >
        Back to homepage
      </Link>
    </div>
  );
}
