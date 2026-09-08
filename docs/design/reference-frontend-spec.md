# Reference Frontend Specification

The subsequent [Reference Dashboard V2](reference-dashboard-v2.md) specification
supersedes this document's dashboard card count, right-rail composition, font,
shortcut and fictional-preview decisions. Shared routing and permission boundaries
remain as described below.

Prompt 53D, 2026-09-07. The supplied 1536 x 1024 reference is preserved at
`references/industrial-learn-dashboard-target.png`. It was copied from the user's
verified Downloads attachment, not reconstructed from another environment.

## Shared Frame

The server root layout owns one `app-shell` grid, one `SiteNavigation` chrome component
and one `main` server-content slot. `SiteNavigation` owns the sidebar, topbar and mobile
dialog. Passing rendered pages through the layout does not turn their server loaders
into client code. No role, scoring, publication or database policy changed.

The previous dashboard-only nested rail and its global `:has([data-student-workspace])`
header overrides have been removed. The old simulation-attempt header suppression is
removed so its exit controls and the shared frame can coexist. Shared CSS lives in
`apps/web/src/features/app-shell/shell.css`; dashboard composition lives in its existing
CSS module, not a second root layout.

At the reference viewport: 256 px expanded sidebar, 76 px target header, 40 px left
gutter, 36 px right gutter, 880 px main study column, 296 px information rail, 28 px gap.
The blue hero targets 290 px height. Content may grow for long names or missing-data
warnings instead of clipping essential information. Right-rail contents are real
recorded progress, programme and activity, not fabricated reference statistics.

Below 1400 px, the information rail reflows. Below 1100 px, navigation uses the same
route configuration in a native modal dialog; below 601 px, search moves to a second
header row. Sidebar collapse is a local-only preference, not a permission. Native
dialog modality plus explicit first/last Tab wrapping contains keyboard focus,
Escape dismisses it, and the menu button
receives return focus. Wider desktop resize closes an open mobile dialog.

## Navigation And Account Boundary

`navigation.ts` is the one public/student route configuration. The existing
`/api/account/access` supplies the current user's name, role label and permitted
workspaces. Requests remain same-origin, no-store and abortable. Auth pages suppress
personal identity and private navigation. Switching workspace changes the route only.
Server route checks still enforce access independently of visible links.

Search submits to existing governed `/learn?q=...` search. The catalogue's own filter
has a distinct accessible label. No shortcut hint is displayed because no command-key
search interaction exists. Notifications, achievements, groups and AI chat are omitted.
Saved links to `/dashboard#saved`, including an honest empty state. Projects links to
the existing protected project route; it does not claim a new project builder.

## Dashboard Hierarchy

Welcome, hero, eligible image-led learning row, recommended next lesson/quick actions,
Future Engineering banner, then the existing practice, detailed results and saved
records. The right rail spans the compact upper composition. Prerequisite disclosures
and module evidence remain available in Results and progress. Opening the dashboard
never awards progress. Optional recommendation hide/dismiss controls remain present.

The recommendation is the existing server-selected next eligible lesson. No additional
recommendation model, fabricated percentage or new course is introduced. With only one
eligible lesson, the row contains one card, using four-column tracks when more eligible
items exist. It is not filled with unapproved hydraulic/Bernoulli/thermal courses.

## Visual And Asset Rules

Existing semantic blue/teal/cyan, light/dark surfaces and system sans-serif stack remain.
Light reading surfaces are largely white. Dark uses the same geometry. Palette changes
remain atomic for reading contrast, with the existing short appearance-icon motion.
Motion is finite and reduced-motion-aware; no static equipment illustration is animated
as physics. The installed Lucide mark is retained instead of inventing a new brand logo.
The existing 8 px card radius remains the design-system constraint, rather than copying
the reference's inferred 14-18 px corners.

The typed asset manifest is `features/app-shell/assets.ts`. The companion JSON manifest
records the same actual paths, dimensions, provenance, UI-only permitted use and decorative
classification. Hero and compact art are existing press concepts that match the eligible
pressure topic. The exact pump subject is intentionally not advertised as a course.
Concept art is not an instructional diagram, source evidence, rating or review approval.

New generated assets:

- Future banner: clean-energy city, solar/wind/research infrastructure, right-weighted
  3:1 composition with calm royal-blue left space; no text, logos, numbers, UI or people.
- Study Support: white/pale-blue learning companion holding an unmarked notebook,
  cool studio lighting, 4:3 crop; no labels, badges, UI or chat promise.

Both were generated with the available image tool and encoded with existing Sharp.
Original generated files remain intact. No dependency, external hotlink or private
source document was added. Study Support links to the actual pilot guide.

## Verification Scope

Browser screenshots use the real production components and existing local synthetic
account service, not a second dashboard or authentication bypass. They are labelled
synthetic service data, not real student records or live Supabase verification.
See the implementation audit for measured geometry, executed checks and limitations.
