"use client";

import { useId, useState } from "react";

export function PasswordField({ label, name }: { label: string; name: string }) {
  const [visible, setVisible] = useState(false);
  const inputId = useId();

  return (
    <div className="auth-password-field">
      <label className="il-field" htmlFor={inputId}>
        <span className="il-field__label">{label}</span>
        <input
          autoComplete={name === "password" ? "current-password" : "new-password"}
          className="il-input"
          id={inputId}
          minLength={8}
          name={name}
          required
          type={visible ? "text" : "password"}
        />
      </label>
      <button
        aria-pressed={visible}
        className="auth-password-field__toggle"
        onClick={() => setVisible((current) => !current)}
        type="button"
      >
        {visible ? "Hide password" : "Show password"}
      </button>
    </div>
  );
}
