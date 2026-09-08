# Vibrant Brand Token System

Prompt 53A. Current presentation palette, 2026-09-07. Supersedes the muted Prompt 51
palette; not a change to engineering review, publication or safety semantics.

## Single Source Of Truth

Values live in `packages/design-system/src/styles.css`. `designTokens` in the adjacent
`tokens.ts` exports semantic CSS references, not a second set of hex values. Root,
explicit Light/Dark selectors and the System media query resolve the same pairs.
The existing pre-hydration preference, cross-tab updates, storage-failure fallback
and native Appearance control are unchanged.

Brand primitives are blue `#1D5CEB`, teal `#008F95`, cyan `#38BDF8`, day `#F5F8FF`
and night `#0B1424`. The old slate/muted/pearl/deep variable names remain compatibility
aliases, not competing colour values. Teal's normal-text action is deliberately deeper
than the brand swatch. Cyan is an accent, not normal text or the sole selection signal.

## Semantic Palette

Names below omit the `--il-color-` prefix.

| Token                  | Light     | Dark      | Use                                                     |
| ---------------------- | --------- | --------- | ------------------------------------------------------- |
| `bg-page`              | `#F5F8FF` | `#0B1424` | Page canvas.                                            |
| `bg-surface`           | `#FFFFFF` | `#0F1B2D` | Record and control surface.                             |
| `bg-elevated`          | `#FFFFFF` | `#122033` | Modal and elevated surface.                             |
| `bg-muted`             | `#EDF3FF` | `#15273C` | Supporting work area.                                   |
| `text-primary`         | `#17243B` | `#F5F8FF` | Main copy and titles.                                   |
| `text-secondary`       | `#52627B` | `#BCCBE0` | Supporting copy.                                        |
| `text-muted`           | `#5B6B84` | `#A2B5CE` | Lower-priority readable metadata.                       |
| `action-primary`       | `#1D5CEB` | `#8AB4FF` | Links and primary control fill.                         |
| `brand-on-accent`      | `#FFFFFF` | `#0B1424` | Text on primary control fill.                           |
| `action-secondary`     | `#006F75` | `#5DD9D1` | Practical-learning links and actions.                   |
| `accent`               | `#38BDF8` | `#38BDF8` | Limited non-text emphasis.                              |
| `border-subtle`        | `#DCE5F3` | `#23344D` | Decorative separation, not sole control identification. |
| `border-strong`        | `#74839B` | `#708BAD` | Recognisable control edges.                             |
| `nav-active-bg`        | `#E8F0FF` | `#1B3357` | Active navigation surface.                              |
| `nav-active-text`      | `#164CC7` | `#A9C9FF` | Active label, icon and selection rule.                  |
| `hover`                | `#E8F0FF` | `#1A304B` | Neutral interactive hover.                              |
| `action-primary-hover` | `#174BC4` | `#AECBFF` | Primary button hover fill.                              |
| `focus`                | `#164CC7` | `#67D4FF` | 3 px focus ring with 3 px offset.                       |
| `state-normal`         | `#176C43` | `#76DBAB` | Success/normal plus a label or icon.                    |
| `state-info`           | `#09678B` | `#8ED9F0` | Information.                                            |
| `state-warning`        | `#8D5105` | `#F4CB7A` | Warning plus a label/icon.                              |
| `state-fault`          | `#B3293B` | `#FF9CAA` | Danger/fault plus a label/icon.                         |
| `state-disabled`       | `#657786` | `#96A9B7` | Disabled state; never the only cue.                     |
| `feature-bg`           | `#1D5CEB` | `#1748AF` | Current-learning visual band.                           |
| `feature-text`         | `#FFFFFF` | `#FFFFFF` | Feature title and feature focus ring.                   |
| `feature-secondary`    | `#E1EDFF` | `#E1EDFF` | Feature supporting copy/caption.                        |
| `feature-action-bg`    | `#FFFFFF` | `#FFFFFF` | Feature CTA fill.                                       |
| `feature-action-text`  | `#174BC4` | `#174BC4` | Feature CTA label.                                      |

`brand-accent` remains an alias for `action-primary`; `brand-accent-strong` uses
`#1647B5` / `#BED5FF`. Inverse surfaces/text and engineering domain/material pairs
remain available. Hydraulic, electrical, automation, temperature and material roles
have not been reassigned to brand meanings. The dashboard illustration uses existing
night engineering colours locally for contrast on the feature blue, without changing
its equations, geometry, accessible text or state semantics.

## Geometry And Motion

Keep 8 px control/card/panel radii, the 4 px spacing scale and existing fixed rem font
sizes. Theme-aware card/panel/overlay shadows distinguish repeated records and overlays
without framing every section. Motion tokens are 140 ms fast, 200 ms standard, 280 ms
entrance, `cubic-bezier(0.2, 0.7, 0.2, 1)`, -2 px lift and 4 px entrance rise.
Consumers must apply motion only when reduced motion is not requested.

## Accessibility Contract

Automated tests require at least 4.5:1 for primary/secondary/muted text, primary/secondary
actions and normal/information/warning/fault text on all four base surfaces. They also
check selected navigation, neutral hover, primary-button hover, feature copy and feature
CTA pairs. Strong control edges and focus contrast have 3:1 checks. Cyan and subtle
borders are not suitable as the only meaningful indicator on white.

Inputs and selects use strong borders. Active navigation includes a rule and font-weight
change; active tabs have a bottom rule. Status retains existing text/icon alternatives.
Feature links receive a white focus ring on blue. Do not apply the base blue focus ring
on a blue feature band. Browser axe scans and keyboard checks complement token tests;
they do not constitute complete WCAG certification.

Representative calculated contrast ratios for the final palette:

| Pair                           | Light  | Dark   |
| ------------------------------ | ------ | ------ |
| Muted text / muted surface     | 4.86:1 | 7.23:1 |
| Primary button text / fill     | 5.55:1 | 8.82:1 |
| Active navigation text / fill  | 6.34:1 | 7.53:1 |
| Feature supporting text / blue | 4.69:1 | 6.88:1 |
| Feature CTA text / white       | 7.39:1 | 7.39:1 |

## Difference From The Previous Palette

The earlier `#355C7D` action and `#2B7A78` accent were subdued. The new primary blue is
more saturated, teal is brighter, and cyan is a separate small accent. A cooler white
page and cleaner surface/border separation support the concept's bright appearance.
Night mode retains saturated blue rather than turning the main anchor grey. Dedicated
hover/selection/feature roles replace ad hoc colours and obsolete orange navigation
references. No extra client dependency, font download or analytics request is required.
