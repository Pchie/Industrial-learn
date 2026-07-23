"use client";

export default function LearnError({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className="curriculum-state" role="alert">
      <p className="eyebrow">Error</p>
      <h1>Curriculum browser could not load</h1>
      <p>Try loading the curriculum browser again.</p>
      <button className="button" type="button" onClick={reset}>
        Try again
      </button>
    </section>
  );
}
