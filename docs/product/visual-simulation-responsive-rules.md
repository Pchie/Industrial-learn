# Visual Simulation Responsive Rules

## Desktop

At widths above 820 px, the workbench uses:

1. Main visual viewport.
2. Context column containing controls, measurements, and Live Equation.
3. Full-width guidance, challenge, and fault regions below.

The viewport uses a stable 16:9 area and visual primitives size within their own bounds.

## Mobile And Tablet

At 820 px and below, the layout becomes:

1. Simulation viewport.
2. Primary controls and view selection.
3. Measurements and instrument status.
4. Live Equation when mode policy permits.
5. Challenge.
6. Guidance and expanded theory.

The viewport changes from a two-column visual grid to a single column with a stable minimum height. At 520 px and below, headers and application diagrams also stack. No desktop three-column layout is scaled down.

## Control Rules

- Primary targets remain at least the design-system control minimum.
- Sliders in future simulations must pair with number inputs.
- View and depth controls are radio groups with keyboard support.
- Play, Pause, Step, Reset, and speed remain available without drag.
- Unsupported measurement points remain labelled and disabled rather than disappearing.
- Focus stays on the activating control after Reset or representation changes.

## Technical Visuals

- SVG uses `viewBox` and a fluid maximum width.
- Labels wrap outside SVG when practical; critical values are repeated as text.
- Schematics may offer local pan/zoom later but cannot create page-level horizontal overflow.
- Landscape may be recommended for a future complex simulation but portrait remains operable.

## Accessibility And Motion

- The viewport has an accessible name and current-state summary.
- Flow, vector, and gauge SVGs include accessible names/descriptions.
- Colour is reinforced by arrows, stop marks, patterns, geometry, labels, and numeric readings.
- Reduced motion stops automatic particles and automatic lab stepping; Step remains available.
- Rapid readings use `aria-live="off"`; the stable state summary is available on demand/read order.

## Verified Widths

The existing accessibility suite includes the private lab in overflow checks at 320, 375, 430, 768, 1024, and 1366 px. The dedicated browser test additionally verifies viewport, controls, then measurements appear in vertical order at 375 px.
