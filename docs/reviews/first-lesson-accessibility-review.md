# First Lesson Accessibility Review

Review date: 2026-08-30

Candidate: `LES-FLUID-PRESSURE-001`, Basic Fluid Pressure, version `0.3.0`

Verdict: **ACCESSIBILITY PASS WITH LIMITATIONS**

This is an engineering-product accessibility review, not formal WCAG certification.

## Static Renderer Review

The reusable renderer provides:

- a labelled lesson-section navigation;
- semantic headings and section landmarks;
- an equation text alternative through `aria-label`;
- a captioned symbol table with column headers;
- a `role="img"` force-over-area diagram with descriptive alternative text;
- native `details` and `summary` controls for worked steps;
- a `fieldset` and `legend` for the practice question;
- visible source IDs and review status;
- text labels in addition to status colours; and
- a signed-out progress statement that does not invent completion.

The CSS provides horizontal containment for equations and tables, collapses metadata,
fault, and source grids below 760 px, retains browser zoom, and defines reduced-motion
behavior globally. The selected lesson has no motion or custom pointer-only control.

## Keyboard And Focus

All current lesson controls are native links, details controls, and radio inputs. They are
keyboard operable. No custom focus trap or non-semantic clickable graphic exists in the
lesson.

The long 18-link contents list creates a high tab count before lesson content. A visual-v2
revision should shorten or progressively disclose this navigation.

## Mobile Review

The shared stylesheet has no fixed page width for the lesson and collapses multi-column
content for narrow screens. Existing browser tests exercise 320, 375, 430, 768, 1024, and
1366 px without document-level overflow.

However, the public Basic Fluid Pressure route is intentionally hidden. Those browser
checks exercise the fail-closed not-found page, not the internal lesson content. The
internal static content was reviewed at code and component level only; a genuine
student-delivery mobile pass must be run after a corrected, approved version is deployed.

## Equation And Diagram Accessibility

The equation is exposed as the literal text `p = F / A` and the symbols are repeated in a
table. This is understandable, but it is not semantic MathML and no pronunciation string
such as "pressure equals force divided by area" is separately supplied. The diagram's text
alternative conveys direction and area without relying on the hydraulic accent colour.

## Dynamic Feedback And Reduced Motion

There is no dynamic calculation, slider, challenge, or simulation in this lesson version,
so dynamic announcement, control synchronisation, and reduced-motion animation behavior
cannot be reviewed. These become mandatory if the lesson is converted to visual-v2.

## Required Follow-Up

1. Add a plain-language equation pronunciation or MathML strategy.
2. Reduce the pre-content keyboard burden when the lesson is reorganised.
3. Test the corrected content itself at 320, 375, 430, and tablet widths.
4. Run keyboard, screen-reader smoke, zoom, reduced-motion, and dynamic-feedback checks on
   any future interaction.
5. Re-run Axe on the approved deployed route, while recognising that automated scans are
   not certification.
