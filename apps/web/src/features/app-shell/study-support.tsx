"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, BookOpen, Bot, FlaskConical, X } from "lucide-react";

export function StudySupport({ compact = false }: { compact?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <>
      <button
        ref={trigger}
        type="button"
        className={compact ? "shell-help-button" : "shell-support-button"}
        aria-label="Open study support"
        title="Study support"
        disabled={!mounted}
        onClick={() => dialog.current?.showModal()}
      >
        {compact ? (
          <Bot size={20} aria-hidden="true" />
        ) : (
          <>
            Open study support <ArrowRight size={16} aria-hidden="true" />
          </>
        )}
      </button>
      {mounted &&
        createPortal(
          <dialog
            ref={dialog}
            className="study-dialog"
            aria-label="Study support"
            onClose={() => trigger.current?.focus()}
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                const rect = event.currentTarget.getBoundingClientRect();
                if (
                  event.clientX < rect.left ||
                  event.clientX > rect.right ||
                  event.clientY < rect.top ||
                  event.clientY > rect.bottom
                )
                  dialog.current?.close();
              }
            }}
          >
            <div className="study-dialog-header">
              <h2>Your engineering companion</h2>
              <button
                type="button"
                aria-label="Close study support"
                onClick={() => dialog.current?.close()}
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <p>
              Choose your next step. Explore a concept, work through a visual activity, or
              return to your learning path.
            </p>
            <nav
              aria-label="Study support resources"
              onClick={() => dialog.current?.close()}
            >
              <Link href="/learn/pilot">
                <BookOpen size={20} aria-hidden="true" /> Follow the guided learning path
              </Link>
              <Link href="/simulations">
                <FlaskConical size={20} aria-hidden="true" /> Explore the simulation lab
              </Link>
            </nav>
            <form action="/learn" onSubmit={() => dialog.current?.close()}>
              <label htmlFor={compact ? "support-topic-compact" : "support-topic"}>
                What would you like to understand?
              </label>
              <input
                id={compact ? "support-topic-compact" : "support-topic"}
                name="q"
                type="search"
                maxLength={200}
                required
                placeholder="Try pressure, force, or fluid flow"
              />
              <button type="submit" className="shell-support-button">
                Find learning resources <ArrowRight size={16} aria-hidden="true" />
              </button>
            </form>
            <p>
              <strong>AI Mentor · Coming soon</strong>
              <br />
              Live AI answers are not connected yet. These links open the platform’s
              published learning resources.
            </p>
          </dialog>,
          document.body
        )}
    </>
  );
}
