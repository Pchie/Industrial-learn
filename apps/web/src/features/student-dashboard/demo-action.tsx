"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export function DemoAction({
  children,
  className
}: {
  children: ReactNode;
  className?: string | undefined;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <>
      <button
        type="button"
        ref={trigger}
        className={className}
        onClick={() => dialog.current?.showModal()}
      >
        {children}
      </button>
      {mounted &&
        createPortal(
          <dialog
            className="reference-action-dialog"
            ref={dialog}
            aria-label="Design preview action"
            onClose={() => trigger.current?.focus()}
          >
            <button
              type="button"
              className="reference-dialog-close"
              aria-label="Close preview explanation"
              onClick={() => dialog.current?.close()}
            >
              <X size={20} />
            </button>
            <h2>Design preview only</h2>
            <p>
              This is a fictional example from the approved reference. It does not open a
              course, start an AI conversation or change any student record.
            </p>
            <button
              type="button"
              className="il-button"
              onClick={() => dialog.current?.close()}
            >
              Back to preview
            </button>
          </dialog>,
          document.body
        )}
    </>
  );
}
