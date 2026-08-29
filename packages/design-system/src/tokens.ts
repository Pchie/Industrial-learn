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

export const VISUAL_STATE_SEMANTICS = [
  "normal",
  "active",
  "selected",
  "warning",
  "fault",
  "disabled",
  "measurement",
  "target"
] as const;

export type VisualStateSemantic = (typeof VISUAL_STATE_SEMANTICS)[number];

export const visualStateSemantics = {
  normal: {
    token: "normalOperation",
    label: "Normal",
    nonColorCue: "Normal status text"
  },
  active: {
    token: "brandAccent",
    label: "Active",
    nonColorCue: "Active status text and directional marker"
  },
  selected: {
    token: "information",
    label: "Selected",
    nonColorCue: "Selection outline and selected status text"
  },
  warning: {
    token: "warning",
    label: "Warning",
    nonColorCue: "Warning icon and warning status text"
  },
  fault: {
    token: "fault",
    label: "Fault",
    nonColorCue: "Fault icon and fault status text"
  },
  disabled: {
    token: "disabled",
    label: "Disabled",
    nonColorCue: "Disabled control state and disabled status text"
  },
  measurement: {
    token: "information",
    label: "Measurement",
    nonColorCue: "Instrument marker and measured value"
  },
  target: {
    token: "brandAccent",
    label: "Target",
    nonColorCue: "Target marker and target value"
  }
} as const satisfies Record<
  VisualStateSemantic,
  {
    token: keyof typeof designTokens.states;
    label: string;
    nonColorCue: string;
  }
>;
