"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

/** Refresh the authenticated server projection; never manufacture progress locally. */
export function DashboardSync({ revision }: { revision: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const previous = useRef(revision);
  const requested = useRef(false);
  useEffect(() => {
    if (!pending && requested.current) {
      requested.current = false;
      setMessage((current) => current || "Showing the latest available activity.");
    }
  }, [pending]);
  useEffect(() => {
    if (previous.current !== revision) {
      setMessage("Your learning activity has been updated.");
      previous.current = revision;
    }
  }, [revision]);
  useEffect(() => {
    let lastRefresh = 0;
    const refresh = () => {
      if (document.visibilityState !== "visible" || Date.now() - lastRefresh < 10000)
        return;
      lastRefresh = Date.now();
      startTransition(() => router.refresh());
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [router]);
  return (
    <div className="dashboard-sync">
      <span role="status" aria-live="polite">
        {pending ? "Checking your learning activity…" : message}
      </span>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setMessage("");
          requested.current = true;
          startTransition(() => router.refresh());
        }}
      >
        <RefreshCw size={14} aria-hidden="true" />
        {pending ? "Refreshing" : "Refresh activity"}
      </button>
    </div>
  );
}
