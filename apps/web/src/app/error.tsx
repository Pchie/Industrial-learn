"use client";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <section className="state-page" aria-labelledby="error-title">
      <p className="eyebrow">Application error</p>
      <h1 id="error-title">Something needs attention</h1>
      <p>
        The foundation shell caught an unexpected error. Try again, or check the
        development logs if this continues.
      </p>
      {error.digest ? <p className="technical-note">Reference: {error.digest}</p> : null}
      <button className="button" type="button" onClick={reset}>
        Try again
      </button>
    </section>
  );
}
