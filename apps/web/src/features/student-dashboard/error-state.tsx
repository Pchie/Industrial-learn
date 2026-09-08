"use client";

import Link from "next/link";
import { RotateCcw } from "lucide-react";

export function DashboardErrorState({ retry }: { retry: () => void }) {
  return (
    <section className="dashboard-state" role="alert">
      <h1>Dashboard unavailable</h1>
      <p>Your learning records could not be loaded. No progress has been changed.</p>
      <button className="il-button il-button--secondary" type="button" onClick={retry}>
        <RotateCcw size={18} aria-hidden="true" />
        Try again
      </button>
      <p>
        <Link href="/learn">Browse available learning</Link> ·{" "}
        <Link href="/auth/sign-in?next=%2Fdashboard">Sign in again</Link>
      </p>
    </section>
  );
}
