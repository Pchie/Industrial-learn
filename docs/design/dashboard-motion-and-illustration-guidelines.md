# Dashboard Motion And Illustration Guidelines

Prompt 53C. Date: 2026-09-07. Extends the Prompt 53A/53B visual direction; does not
replace the learning, authentication or publication architecture.

## Art Direction

Use a clear visual sequence: the whole assembly in Continue learning, a closer
material/detail view in My learning, practical actions beside it, and recorded
learning evidence in the snapshot and results. Blue identifies the main learning
action; teal distinguishes practice; white and neutral surfaces provide breathing
room. Do not add speculative courses, streaks, certificates or AI controls to fill space.

The hero's title, description, difficulty and estimated time remain sourced from the
eligible lesson. Small outlined metadata chips are not equipment ratings or invented
progress. The completed chip has an icon, text and rule, not just a colour change.
Unavailable progress retains its own explicit wording.

The previous miniature teaching diagram was difficult to inspect at thumbnail size.
The dashboard now uses a companion concept-detail illustration; the actual reviewed
technical diagram and calculation remain unchanged inside the lesson. The thumbnail
has a concept label and an explicit non-technical text alternative. The hero retains
its construction/saved-state disclaimer.

## Motion Vocabulary

| Interaction                   | Duration          | Treatment                                                                              |
| ----------------------------- | ----------------- | -------------------------------------------------------------------------------------- |
| Hover/focus-adjacent feedback | 140 ms            | Surface/border change; arrows travel 2 px only on hover-capable devices                |
| Press                         | 140 ms transition | Enabled buttons and primary actions settle down 1 px; no scale or changed hit-box size |
| Initial panel entrance        | 280 ms            | Opacity 0.85 to 1 with 4 px lift; once per mount                                       |
| Panel stagger                 | 45 ms per step    | Hero, then study records; largest delay 180 ms                                         |
| Image reveal                  | 360 ms            | Opacity 0.65 to 1 and 3 px lift; no zoom, blur or moving equipment parts               |
| Study selection               | 200 ms            | Surface/rule and a 2 px icon settle; `aria-current` indicates page or location         |
| Tabs                          | 200 ms            | Selected underline grows; existing panel fade and keyboard semantics retained          |
| Native disclosure             | 200 ms            | Intrinsic-height and opacity transition where supported                                |
| Theme                         | 180 ms            | Small icon settle and border transitions; reading surfaces change palette immediately  |

Tokens live in `packages/design-system/src/styles.css`, with matching exports in
`tokens.ts`. Use `--il-motion-fast`, `--il-motion-standard`, `--il-motion-entrance`,
`--il-motion-stagger`, `--il-motion-art`, `--il-motion-theme`, `--il-motion-press`,
`--il-motion-ease`, `--il-motion-rise` and `--il-motion-lift`.

Do not animate counters from zero, progress awards, gauge values or engineering state
as decoration. Do not use parallax, perpetual floating, spinning, particles, large
overshoots, filter blurs, scroll hijacking or a motion framework for this surface.
Art is not a physical simulation and never moves its piston independently.

## Semantics And Fallbacks

All new motion is inside `prefers-reduced-motion: no-preference`. With reduced motion,
content is immediately visible, travel/stagger are absent and native disclosure is
instant. The existing global reduced-motion override also remains. No entrance keeps
its transformed state after completion; no timer gates controls or reading.

Study links keep ordinary URLs and native browser history. A small client component
adds selected-location feedback without receiving student records or changing access.
Keyboard activation retains native focus. Disabled shared controls do not depress.
Tab animation decorates the existing accessible tabs; it does not add a second
selection model or duplicate hidden panels.

Disclosure animation is progressive enhancement using guarded `interpolate-size`
and `::details-content`. Browsers without those capabilities keep native details
behaviour, not a JavaScript replacement or fixed maximum height. See the official
[MDN details-content reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/::details-content)
and [intrinsic-size interpolation reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/interpolate-size).
Only dashboard disclosures are height-animated; menus elsewhere are not globally clipped.

Theme motion is concentrated in the appearance icon (12-degree settle with a short
fade) and surface borders. Reading text and backgrounds switch together immediately:
interpolating foreground colour after the page background has changed can temporarily
reduce contrast. Do not animate the whole page between palette colours. Existing
short control hover transitions remain; no measurement or diagram is blanket-animated.
Light/Dark/System, initial theme setup, storage failures and cross-tab preference
handling are unchanged.

## Asset Register

| Asset                          | Role                  | Dimensions | Bytes  | Loading                             |
| ------------------------------ | --------------------- | ---------- | ------ | ----------------------------------- |
| `pressure-press-feature.webp`  | Existing wide hero    | 1440 x 576 | 26,996 | Eager, responsive desktop selection |
| `pressure-press-concept.webp`  | Existing compact hero | 1120 x 840 | 41,818 | Responsive compact selection        |
| `pressure-contact-detail.webp` | New lesson thumbnail  | 960 x 480  | 21,022 | Lazy, responsive Next image         |

All three are local to `apps/web/public/images/dashboard/`. Fixed image dimensions
reserve layout space; the thumbnail has a stable 172 px frame, and the hero retains
its desktop/compact composition. Do not preload the below-fold thumbnail. Do not
load simulation engines, video, Three.js or remote artwork for these images.

The new asset was created with the built-in image-generation tool and encoded with
the existing Sharp installation. No dependency was added. It is AI-generated concept
art under explicit art direction, not a claim of manually illustrated authorship,
source evidence, manufacturer construction, equipment performance or engineering approval.
The selected source is `exec-b07d171d-1ae7-47ca-b52c-8c6155094f84.png` in the thread's
generated-image folder. The original remains there; the deployed asset is in the repository.

### Final Image Prompt

Use case: precise-object-edit. Asset: Industrial Learn dashboard lesson thumbnail,
companion to this existing hero illustration. Reframe the same conceptual press as a
precise close-up of the lower silver ram, restrained amber collar, broad square silver
press face and teal square work surface below it. Preserve the shapes and arrangement
of these parts from the reference; this is only art direction, not new engineering
construction. Keep a small static visible gap between the press face and teal surface.
Stainless guide columns may remain at the edges. Background: flat very pale ice blue
#E8F0FF, crisp bright studio lighting, brushed metal, polished cyan/teal and small amber
accent. Landscape 2:1 composition; main contact assembly fills the centre-right with
breathing room on the left for a later HTML label. Large legible shapes, entire press
face and teal work surface visible; crop the tall upper housing deliberately outside
frame. No text, no symbols, no numbers, no diagrams, no motion lines, no arrows, no
gauges, no noise, no particles, no fake measurements or certification marks. Original
premium educational concept illustration, not a technical diagram, no cartoon styling.

## Review Checklist

- Inspect desktop, tablet and phone in both themes, including 200% text.
- Check hero action remains visible and art does not cover unavailable-data notices.
- Check navigation, history, tabs and disclosures with keyboard only.
- Check real completed, fresh-start and unavailable data states without invented totals.
- Check reduced motion, native controls in a rendered no-script component fixture, and no persistent running animations.
- Measure actual resource impact; local timing is not a field performance claim.
- Keep screenshots and failed-run history in the audit report.

Execution results and known limitations are recorded in
`docs/audits/prompt-53c-premium-polish.md`.
