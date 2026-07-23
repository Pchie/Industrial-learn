"use client";

import { type KeyboardEvent, type ReactNode, useEffect, useRef } from "react";

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])"
].join(",");

export function FocusScope({
  children,
  className,
  labelledBy,
  onDismiss,
  role = "dialog"
}: {
  children: ReactNode;
  className?: string | undefined;
  labelledBy: string;
  onDismiss?: (() => void) | undefined;
  role?: "dialog" | "alertdialog" | undefined;
}) {
  const scopeRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    returnFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const scope = scopeRef.current;
    const firstFocusable = scope?.querySelector<HTMLElement>(focusableSelector);
    (firstFocusable ?? scope)?.focus();

    return () => {
      returnFocusRef.current?.focus();
    };
  }, []);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape" && onDismiss) {
      event.preventDefault();
      onDismiss();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const focusableElements = Array.from(
      scopeRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? []
    ).filter((element) => !element.hasAttribute("disabled"));

    if (focusableElements.length === 0) {
      event.preventDefault();
      scopeRef.current?.focus();
      return;
    }

    const first = focusableElements[0];
    const last = focusableElements.at(-1);

    if (!first || !last) {
      return;
    }

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <div
      aria-labelledby={labelledBy}
      aria-modal="true"
      className={className}
      onKeyDown={handleKeyDown}
      ref={scopeRef}
      role={role}
      tabIndex={-1}
    >
      {children}
    </div>
  );
}
