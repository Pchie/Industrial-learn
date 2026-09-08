export const designTokens = {
  surfaces: {
    page: "var(--il-color-bg-page)",
    surface: "var(--il-color-bg-surface)",
    elevated: "var(--il-color-bg-elevated)",
    muted: "var(--il-color-bg-muted)"
  },
  actions: {
    primary: "var(--il-color-action-primary)",
    primaryHover: "var(--il-color-action-primary-hover)",
    secondary: "var(--il-color-action-secondary)",
    accent: "var(--il-color-accent)",
    focus: "var(--il-color-focus)"
  },
  text: {
    primary: "var(--il-color-text-primary)",
    secondary: "var(--il-color-text-secondary)",
    muted: "var(--il-color-text-muted)"
  },
  interaction: {
    hover: "var(--il-color-hover)",
    activeNavigationBackground: "var(--il-color-nav-active-bg)",
    activeNavigationText: "var(--il-color-nav-active-text)"
  },
  borders: {
    subtle: "var(--il-border-subtle)",
    strong: "var(--il-border-strong)"
  },
  feature: {
    background: "var(--il-color-feature-bg)",
    text: "var(--il-color-feature-text)",
    secondaryText: "var(--il-color-feature-secondary)",
    actionBackground: "var(--il-color-feature-action-bg)",
    actionText: "var(--il-color-feature-action-text)"
  },
  shadows: {
    card: "var(--il-shadow-card)",
    panel: "var(--il-shadow-panel)",
    overlay: "var(--il-shadow-overlay)"
  },
  motion: {
    fast: "var(--il-motion-fast)",
    standard: "var(--il-motion-standard)",
    entrance: "var(--il-motion-entrance)",
    stagger: "var(--il-motion-stagger)",
    art: "var(--il-motion-art)",
    theme: "var(--il-motion-theme)",
    press: "var(--il-motion-press)",
    ease: "var(--il-motion-ease)",
    lift: "var(--il-motion-lift)",
    rise: "var(--il-motion-rise)"
  },
  typography: {
    fontFamilySans:
      "'Inter Variable', Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
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
