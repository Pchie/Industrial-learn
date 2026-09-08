# Premium Student Dashboard

Prompt 53B. Implementation date: 2026-09-07.

## Scope And Reference

The primary reference is the user's `a_clean_bright_web_dashboard_app_ui_mockup_scre.png`,
inspected from their Downloads folder. Its layout is a design reference, not evidence
of available courses, progress, achievements or accounts. This implements the full
student dashboard composition following the Prompt 53A token and motion direction.
It does not redesign the homepage, public learning pages or staff workspaces.

## Composition

- Compact header: Industrial Learn identity, native published-lesson search, the real
  account/workspace menu and the existing Light/Dark/System preference.
- Study rail: Dashboard, My learning, Simulations, Assessments, Progress, conditional
  Saved content, Profile & access, and the two engineering schools. Projects are not
  advertised when the current dashboard has no supported project workflow.
- Welcome: the authenticated profile name and a short new/returning study message.
- Continue learning: a blue illustrated band with the next eligible lesson, duration,
  difficulty, honest last-activity date where available and a strong white action.
- My learning: illustrated lesson records with actual completion states and expandable
  prerequisites. Adjacent quick actions lead to existing working routes.
- Study snapshot: recorded completed-lesson count, current programme/year/semester and
  real lesson activity. No aggregate percentage is inferred from partial records.
- Practice: eligible published simulations, or the existing lesson activity fallback.
  Optional revision controls retain their existing hide and dismiss behaviour.
- Results: reviewed completed assessment links, progress explanation, server-awarded
  competencies and eligible simulation activity where those records exist.
- Saved lessons and a restrained Core/Future Engineering exploration band.

Sections remain unframed. The only bordered cards are individual lesson/programme/
progress records, using the existing 8 px radius. There are no nested decorative cards,
streak charts, fictional badges, notifications, certificates, portraits or AI controls.

## Data Contract

`buildDashboardExperience` remains unchanged. It supplies the same governed, server-side,
owner-scoped projection used before this design change. Authentication, queries,
row-level policies, scoring, assessment versions and engineering calculations are unchanged.

| Surface            | Source and missing-data treatment                                                          |
| ------------------ | ------------------------------------------------------------------------------------------ |
| Next lesson        | Existing public lesson projection and owned progress; no exact-step resume claim           |
| Lesson cards       | Only public lessons; recorded state or explicit unavailable state                          |
| Completion count   | `completedLessonCount`; undefined is a fresh-start message, unavailable stays unavailable  |
| Current programme  | Existing enrolment projection; no invented programme, year or semester                     |
| Module progress    | Existing complete-evidence guard; no new percentage calculation                            |
| Recent activity    | Existing visible lesson activity only; recorded absolute dates, not fake relative activity |
| Assessment results | Existing graded, reviewable, exact-version public-content filter                           |
| Competency         | Existing explicit server-awarded evidence only                                             |
| Practice           | Existing eligible simulation projection or honest lesson activity fallback                 |
| Search             | Native GET `/learn?q=...`; existing deterministic public-lesson search                     |
| Account menu       | Existing `/api/account/access` request and workspace capabilities                          |

Missing, incomplete and withdrawn data keep their existing warnings and recovery links.
The dashboard is still dynamic and no-store. Opening it does not award progress.

## Responsive And Accessible Behaviour

At wide desktop sizes the 216 px rail sits beside a main study column and 252 px
snapshot column. Below 1340 px, snapshot records move into the main flow. Below 901 px,
the hero uses its compact art direction after the primary action. Below 761 px, study
navigation becomes a native disclosure and the compact header wraps to two rows.
The smallest layouts stack snapshot cards. No font size is tied to viewport width.

Search has a persistent accessible label and a submit button. Links and navigation
have keyboard focus, active navigation has a rule and text weight, and all progress
states use words. The account icon keeps the real account name and role in its
accessible name on narrow screens. Native details preserve keyboard interaction.
The illustration has a text alternative and an explicit non-technical caption.

The existing day/night surface, text, action and focus tokens remain authoritative.
The artwork retains its original blue/teal/stainless palette in both themes; it is not
a visual representation of a changing engineering state. Entrances, hover lift and
CTA arrow movement only run with no reduced-motion preference. No motion library is added.

## Original Illustration Assets

Generated using the built-in image-generation tool, then resized/encoded using the
already-installed Sharp dependency. No dependency was installed. These are original
conceptual dashboard illustrations, not manufacturer data, simulation output,
equipment ratings, reviewed construction drawings or new approved engineering content.
The lesson's reviewed technical diagram and governing content remain unchanged.

| Final project asset                                            | Dimensions | File bytes |
| -------------------------------------------------------------- | ---------- | ---------- |
| `apps/web/public/images/dashboard/pressure-press-feature.webp` | 1440 x 576 | 26,996     |
| `apps/web/public/images/dashboard/pressure-press-concept.webp` | 1120 x 840 | 41,818     |

The browser selects one art direction with `picture`. Desktop uses the existing Next
image optimisation path; compact screens request the small local WebP directly.
There is no remote image host or simulation/Three.js bundle dependency for the artwork.
The first generated draft had a painted checkerboard rather than genuine alpha; it
was rejected. The selected variants intentionally have an opaque blue backdrop.

### Generation Prompt

Use case: stylized-concept. Asset type: original transparent engineering illustration for an Industrial Learn student dashboard. Create a premium three-quarter isometric studio render of a compact conceptual hydraulic press contact assembly: two brushed stainless guide columns on a clean rectangular base, cobalt-blue upper crosshead holding a central transparent cyan cylindrical housing, a polished silver vertical ram with a restrained amber collar, ending in a broad square press face just above a simple teal square work surface. This is an illustrative introduction to pressure and contact area, not a technical construction drawing. Make the equipment tangible and beautifully precise, with legible silhouettes, polished metallic edges, translucent blue material and restrained teal highlights. Entire machine visible with generous transparent margin, visually balanced at a slightly diagonal angle, suitable on both a vivid royal-blue feature background and a pale blue thumbnail. Landscape 4:3 composition, isolated subject, genuinely transparent background with alpha. No UI, no text, no labels, no equations, no gauges or fabricated measurement values, no logos, no watermarks, no extra hoses, no control panel, no safety or manufacturer markings, no neon, no decorative particles. Crisp original premium educational product illustration, not cartoon.

### Compact Asset Edit Prompt

Edit this illustration only by replacing the entire checkerboard background with a perfectly uniform flat royal blue RGB(29,92,235), hex #1D5CEB. Keep the same press assembly, materials, shapes, framing and all equipment details exactly unchanged. No checkerboard, no white edge or ground plane, no gradient, no text. It will be placed over the same #1D5CEB blue in a dashboard hero. Make the backdrop completely opaque blue and match the margins to that same blue.

### Wide Asset Edit Prompt

Use case: stylized-concept. Recompose this same original hydraulic press-contact illustration as a very wide 5:2 dashboard background image, ideally 2000 by 800. Preserve the existing equipment design, stainless steel, cobalt housing, translucent cyan chamber, amber collar and teal work surface. Place the ENTIRE press assembly in the rightmost 42 percent, centered around x=78 percent, with at least 5 percent clear margin at top and bottom. Do not crop the equipment at any edge. Leave the leftmost 55 percent completely empty flat royal blue for later HTML text. Use a uniform royal blue backdrop #1D5CEB across the entire canvas; no gradient, no white surface, no checkerboard, no shadows spanning the empty left area. Make the machine large and crisp within the right section. No text, no labels, no arrows, no UI. This is a conceptual education illustration, not a construction drawing.

## Verification

See `docs/audits/prompt-53b-dashboard-concept-implementation.md` for executed checks,
screenshots, limitations and final design verdicts. Visual verdicts describe the
implemented design criteria, not an independent student satisfaction study.
