# Reference Dashboard V2

Date: 2026-09-08. This supersedes the dashboard composition described in the initial
Prompt 53D specification. The user approved both an honest live layout and a clearly
labelled fictional reference preview.

## Adopted Website Design

On 2026-09-08 the owner approved this shared layout as the ongoing Industrial Learn
website design, not a demo-only direction. The normal authenticated dashboard and
shared website shell are the release surfaces. Future pages should reuse their
typography, navigation, responsive behaviour and accessible components.

This decision does not turn fictional reference data into real courses, progress,
achievements or an AI Mentor. The local reference route remains a protected design
fixture, excluded from hosted delivery. Publication and engineering review gates
continue to determine which learning experiences students may open.

## One Presentation, Two Data Sources

`DashboardOverview` renders the welcome, equipment hero, four learning entries,
recommendation, quick actions, four-part information rail and Future Engineering band.
`buildDashboardOverview` adapts the existing authenticated, publication-filtered
dashboard model. It does not query another student, award progress or change content.

The live layout includes the one published lesson and three entry points into its
existing activities. They are labelled Lesson, Activity, Challenge and Practice,
not four separate courses. Only evidenced completion is shown; unrecorded and failed
data are not converted into fabricated percentages. The ring's denominator is the
shown eligible lessons, not an invented programme-wide total. Existing detailed
results, current programme, prerequisites, recommendations and saved content remain below.

`/internal/reference-dashboard` uses the same presenter with fictional data from the
supplied picture. It is permitted only with explicit local test authentication,
`INDUSTRIAL_LEARN_E2E=true`, `NEXT_PUBLIC_APP_ENV=test`, a loopback application URL
and the existing server-verified `content:preview` capability. Staging/production
configuration returns not-found. Ordinary students receive access denied. No query
parameter can select this dataset on the live dashboard.

A "Design preview · Fictional data" notice remains included in screenshots. It is
fixed in a reserved desktop sidebar footer and in normal page flow on narrower
screens or when the sidebar is collapsed. The footer is outside the scrolling
navigation area, so neither short windows nor large text put controls behind it.
The pictured 72%, 68%, streak, course names and achievements are presentation fixtures,
not curriculum publication or database records. The reference's 68% and displayed
counts are copied as fictional visual examples, not asserted to be a consistent
calculation. Demo course and mentor buttons open a disclosure dialog instead of
starting unavailable activities. Existing catalogue navigation remains functional.
The account menu retains the actual signed-in identity and permissions, even when
its closed preview header displays a fictional student identity.

## Shared Website Frame

The existing root shell continues across Home, Learn, lessons, simulations, assessments
and authorised workspaces. It uses a circular Lucide mark, compact labelled search,
icon appearance selector, persistent sidebar collapse and a keyboard-operable mobile
drawer. Command/Control+K focuses the search field. No notification count or AI chat
is added to the live dashboard.

## Typography And Artwork

Inter Variable is self-hosted at `apps/web/public/fonts/InterVariable.woff2`, with its
unmodified SIL Open Font License beside it. Sources:
[official Inter project](https://github.com/rsms/inter) and
[upstream licence](https://raw.githubusercontent.com/rsms/inter/master/LICENSE.txt).
No runtime font CDN request or new npm dependency is needed. Font display uses swap.

Seven original generated WebP illustrations supplement the existing support and city
artwork. The typed and JSON asset manifests record provenance, dimensions and UI-only
classification. Pump, cylinder, Venturi, exchanger and piping art is used in the demo;
the live view uses pressure-related artwork. None supplies engineering evidence.

The target geometry remains 256 px sidebar, 76 px header, 880 px main column, 296 px
rail, 28 px column gap and 290 px hero at 1536 x 1024. White surfaces, dark ink, blue
actions, teal progress and restrained multicolour quick actions follow the reference.
Eight-pixel radii follow the existing engineering UI constraint.

The screenshot is a visual reference, not a deployable image placed over the page.
Text, links, panels, charts and controls remain real HTML. Generated artwork, Lucide
icons, an initials avatar and the mandatory fictional-data notice mean this is not
a literal pixel-identical reproduction.

## Responsive And Accessible Behaviour

The rail reflows below 1400 px; navigation becomes a drawer below 1100 px. On phones
the hero artwork sits above readable content, then cards, actions and record panels.
Controls retain keyboard focus, native dialog Escape/return focus and larger touch
targets. Motion is finite and disabled with reduced-motion preference. Unknown progress
has a textual alternative; colour never supplies the only status explanation.

See `docs/audits/reference-dashboard-v2-verification.md` for executed checks and
unmasked browser evidence. Screenshots use local synthetic accounts, not real students.
