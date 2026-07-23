# Industrial Learn Accessibility Standard

## Target

Industrial Learn targets WCAG 2.2 Level AA where applicable. This is an internal product quality standard and is not a formal legal certification.

## Supported Users

- Keyboard users
- Screen-reader users
- Low-vision users
- Colour-vision-deficient users
- Students on mobile, tablet and desktop
- Students using browser zoom and larger text
- Students using reduced-motion settings
- Students on low-bandwidth connections

## Required Practices

- Every page must expose a meaningful `main` landmark and logical heading structure.
- A skip link must be available before primary navigation.
- Interactive controls must have accessible names.
- Keyboard focus must be visible.
- Dialogs and drawers must move focus inside, keep tab focus scoped while open, support Escape dismissal when dismissible and return focus to the trigger.
- Tabs must support Tab, ArrowLeft, ArrowRight, Home and End behaviour.
- Form errors must be visible and announced.
- Status, warning and fault states must use text labels, not colour alone.
- Equations must include text or accessible labels, and symbol tables must use semantic table markup.
- Simulation controls must use labelled controls and must not require drag-only operation.
- Reduced-motion preference must disable decorative or non-essential motion without disabling engineering state changes.
- Layouts must avoid horizontal overflow at 320 px except for intentionally scrollable technical tables or diagrams.

## Automated Testing

Industrial Learn uses `@axe-core/playwright` in the Playwright suite for route-level accessibility scans. Automated scans do not replace manual testing because they cannot fully verify reading order, pedagogical clarity, cognitive load, or all assistive technology behaviour.

## Dependency Rationale

`@axe-core/playwright` is a test-only dependency that integrates the standard axe accessibility engine with the existing Playwright suite. It was selected because it adds browser-level accessibility checks without introducing a UI framework or production runtime dependency.
