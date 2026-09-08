# Industrial Learn Brand System

Prompt 51. Implementation date: 2026-09-07. This supersedes the earlier orange UI
direction for presentation only; it does not change technical content approval.

The colour table below is the historical Prompt 51 palette. Prompt 53A supersedes
these values with the [vibrant brand token system](vibrant-brand-token-system.md)
and [premium visual direction](premium-visual-direction.md). Shared accessibility,
engineering-state and content-governance rules remain in force.

## Identity

| Brand colour   | Value     | Role                                               |
| -------------- | --------- | -------------------------------------------------- |
| Slate Blue     | `#355C7D` | Light-mode primary actions and navigation emphasis |
| Muted Teal     | `#2B7A78` | Secondary action, practical-learning accent        |
| Pearl White    | `#F5F7FA` | Light-mode page background                         |
| Deep Blue Grey | `#121C27` | Dark-mode page background, inverse text            |

All palette values live in `packages/design-system/src/styles.css`. Components use
semantic custom properties, not copied hex values. Brand hues are not fault states.
Dark-mode actions use lighter, contrasting tints instead of dark brand swatches.
Light-mode secondary-action text uses a slightly deeper teal (`#246E6C`) so it also
meets normal-text contrast on muted surfaces; the approved brand swatch is unchanged.

## Semantic Tokens

`--il-color-bg-page`, `bg-surface`, `bg-elevated`, and `bg-muted` distinguish page,
content, overlays and workbench backgrounds. `text-primary`, `text-secondary`, and
`text-inverse` define readable text. `border-subtle` separates groups; `border-strong`
identifies controls. Primary/secondary actions, accent and focus have separate tokens.
Legacy `brand-accent` names alias the primary action so existing components inherit
the new theme without individually changing behaviour.

Success/normal, information, warning, fault and disabled states remain distinct.
Hydraulic, electrical, automation and temperature tokens retain separate meanings.
Every engineering state must also have a label, marker, pattern or numeric value.
Material tokens describe illustration colour only, not actual material specifications.

## Typography and Layout

- Local system-font stack with optional installed Inter; no remote font requests.
- Fixed rem typography scale; font size does not depend on viewport width.
- Monospace numbers and equations use the existing unit-aware components.
- 4 px spacing foundation, 44 px minimum primary control targets, maximum 8 px corners.
- Sections are unframed bands; cards represent individual records, not entire pages.
- Restrained shadows for repeated records and menus; simulation viewports are unframed.
- Lucide icons use accessible names on their parent control; decorative icons are hidden.

No user metrics, content approvals or credentials are encoded in brand styling.
