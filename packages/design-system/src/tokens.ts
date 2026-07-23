export const designTokens = {
  typography: {
    fontFamilySans:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
    fontFamilyMono:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace"
  },
  states: {
    brandAccent: "var(--il-color-brand-accent)",
    normalOperation: "var(--il-color-state-normal)",
    information: "var(--il-color-state-info)",
    warning: "var(--il-color-state-warning)",
    fault: "var(--il-color-state-fault)",
    disabled: "var(--il-color-state-disabled)",
    hydraulicFlow: "var(--il-color-domain-hydraulic)",
    electricalState: "var(--il-color-domain-electrical)",
    automationSignal: "var(--il-color-domain-automation)",
    temperatureIndication: "var(--il-color-domain-temperature)"
  }
} as const;

export type DesignTokens = typeof designTokens;
