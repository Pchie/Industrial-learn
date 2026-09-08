# Premium Visual Direction

Prompt 53A. Locked implementation direction, 2026-09-07.

## Reference And Scope

The user's dashboard concept is the primary visual reference:
`a_clean_bright_web_dashboard_app_ui_mockup_scre.png`, supplied from the user's
Downloads folder. The attachment's `/mnt/data` path is not the local file location.
The image was inspected directly, not treated as a requirements list for new features.

This increment implements the shared visual foundation and styles the existing
dashboard. It is not the full reference dashboard rebuild. No pump course, fictional
percentage, streak, badge collection, notification count, study group, AI Mentor,
or third-party portrait is introduced from the image.

## Design Decisions

| Reference cue                             | Industrial Learn decision                                                                                                                                                                    |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Saturated blue Continue area              | One blue, full-width Continue learning band anchors the dashboard; white CTA and light supporting text.                                                                                      |
| Large meaningful engineering illustration | Reuse the existing original Basic Fluid Pressure diagram with its labels, accessible description and honest static-preview caption. Do not pass off a pump rendering as the approved lesson. |
| Clear left navigation                     | Existing study navigation gets a blue-tinted active surface, a visible left rule, icon and heavier text. Global active navigation also uses a rule, not colour alone.                        |
| Mixed visual rhythm                       | Large blue study anchor, smaller white lesson records, unframed section headings and a teal-accented practice band. Do not make every section an equal-weight card.                          |
| Compact KPI cards                         | Reserve this composition for real, well-defined records in a later dashboard increment. Do not manufacture KPI cards to resemble the concept.                                                |
| Rounded white surfaces                    | Keep the established 8 px radius for repeated records and controls. Continue remains a full-width colour band; do not nest decorative cards.                                                 |
| Bright controlled accents                 | Blue for primary action, deeper teal for secondary text/actions, cyan for limited non-text accents. Engineering status colours remain distinct.                                              |
| Clean whitespace                          | Keep a 4 px spacing scale, 24-32 px section separation, 16 px record padding and 44 px primary targets.                                                                                      |

## Composition

Desktop puts the current approved lesson title and action beside the illustration,
with the study rail to the left. The lesson title is the dominant content heading;
section headings are compact. The illustration is unframed on the blue band, not a
second card inside it. On narrow screens the action precedes the illustration, so a
student can begin without scrolling past decorative media. The existing mobile study
navigation disclosure remains keyboard-operable.

No extra columns are added merely to fill space when only one lesson is approved.
No overall-progress chart is implied by partial loaded activity. Existing empty,
unavailable, expired-session and ownership states remain intact.

## Typography And Surfaces

- Preserve the local Inter/system sans stack and monospace engineering figures.
- Fixed rem sizes, zero letter spacing, readable line heights, no viewport-scaled type.
- One strong lesson title, smaller section labels, muted secondary dates and details.
- Cool near-white page, crisp white records, stronger control boundaries, subtle
  shadows for individual records and overlays only.
- Night mode uses separate page, surface and elevated colours, bright readable action
  tints and a deeper saturated feature blue. It is not a colour inversion.

## Motion

Motion is CSS-only and never communicates completion, force, flow or competency.
The dashboard preview remains static; no new simulation movement is introduced.

| Interaction                       | Budget       | Behaviour                                                                        |
| --------------------------------- | ------------ | -------------------------------------------------------------------------------- |
| Button, navigation, tab state     | 140 ms       | Background, border and text-colour transition.                                   |
| Record hover                      | 200 ms       | At most 2 px lift with modest shadow/border change; hover-capable pointers only. |
| CTA icon                          | 140 ms       | 2 px horizontal movement, without resizing its control.                          |
| Continue entrance                 | 280 ms, once | 4 px rise, opacity 0.85 to 1; never initially hidden.                            |
| Modal, drawer, selected tab panel | 200 ms       | Opacity 0.85 to 1, no sliding screen-sized surfaces.                             |

All new animation and movement is inside `prefers-reduced-motion: no-preference`.
Reduced motion keeps content fully visible, disables entrance and hover travel, and
uses the existing global near-zero transition-duration fallback. Keyboard focus is
immediate and visible. There is no autoplay, carousel, bounce, parallax or motion library.

## Boundaries For The Next Dashboard Increment

Follow this direction for composition, not the mockup's fictional facts. A future
full dashboard layout may introduce a denser overview only when each card has a real
data source, a meaningful empty state and an approved publication boundary. Preserve
the existing server-controlled data projection and assessment integrity. No security,
content, source approval, database or engineering model change is authorised here.

The implementation locks a concrete visual direction; whether the finished product
feels sufficiently personal and polished still needs human review. It does not claim
pixel identity with a concept containing unavailable product features.
