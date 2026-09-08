# Light, Dark and System Appearance

## Contract

`ThemeToggle` is in the root application header, including student and staff routes.
Its labelled native select supports Light, Dark and System with standard keyboard use.
`industrial-learn-theme` stores only this preference in browser local storage. It is
not sent to analytics, a profile, Supabase, or another user. Blocked storage degrades to
a session-only selection without breaking the page. Invalid stored values use System.

A small, static, pre-hydration initializer applies the preference to the document.
It contains no interpolated user input or credentials. The existing CSP is unchanged.
The root hydration warning is suppressed only for the intentional theme attribute.

CSS custom properties, `color-scheme` and a prefers-colour-scheme media query resolve
the central light/dark token pairs without requiring the newer `light-dark()` function. System follows
the operating system, including changes while the page is open. Explicit Light/Dark
overrides the operating system. Native controls follow the same colour scheme.
Storage events synchronise explicit changes across open tabs. The CSS default follows
System even without JavaScript. Palette values are defined once; explicit theme selectors
and the System media query only map semantic aliases to those values.

## Simulation Colours

SVG reads the same semantic properties as page UI. The optional Three.js renderer
resolves token colours through computed CSS, observes theme changes and redraws only
when needed. Transparent chambers also have a text equivalent.

## Verification

Automated coverage lives in `tests/e2e/premium-frontend.spec.ts`: persistence across
routes/reloads, System switching, blocked storage, two themes, mobile layout and axe.
The final audit records results. Automated scans are not a claim of full WCAG conformance;
screen-reader and physical-device review remain necessary. Never lower contrast just
to match a brand swatch, and do not disable zoom.
