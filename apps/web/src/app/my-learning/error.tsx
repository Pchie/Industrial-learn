"use client";
import Link from "next/link";
export default function MyLearningError({ reset }: { reset: () => void }) {
  return (
    <section className="dashboard-state" role="alert">
      <h1>Your learning is unavailable</h1>
      <p>We could not load your learning records. Please try again.</p>
      <button type="button" className="il-button il-button--secondary" onClick={reset}>
        Try again
      </button>
      <p>
        <Link href="/learn">Browse available learning</Link>
      </p>
    </section>
  );
}
