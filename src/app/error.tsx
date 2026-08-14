"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Swap for real error reporting (Sentry, etc.) when this goes live.
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-[var(--color-primary)]">
        Something went wrong
      </h1>
      <p className="mt-2 text-[var(--color-muted)]">
        This page hit an error. It has been logged — try again, or head back
        to the homepage.
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-md bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-light)]"
      >
        Try again
      </button>
    </div>
  );
}
