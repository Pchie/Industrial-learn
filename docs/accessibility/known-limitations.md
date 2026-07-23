# Accessibility Known Limitations

## Current Limitations

- Automated axe scans cover representative routes and states, but not every possible authored lesson or future simulation.
- The current simulation route is a protected placeholder. Full simulation canvas or schematic accessibility must be audited when production simulations are built.
- The assessment route is a protected placeholder. Full graded assessment interactions must be audited when complete assessment pages are built.
- The browser-level suite verifies Chromium only through the current Playwright project. Additional browser and assistive technology checks remain manual.
- Automated scans do not prove cognitive accessibility, quality of engineering explanation, or screen-reader usability across every reader/browser pair.
- Existing npm audit output reports 1 moderate and 2 high vulnerabilities in the dependency tree. They were not changed in this task because remediation may require broader dependency updates outside the accessibility scope.

## Required Future Checks

- Re-run manual keyboard and screen-reader tests when full simulations, complete assessments, modals or drawers are added to product pages.
- Add route-specific tests for any new diagram, table, chart or simulation control.
- Check performance and low-data impact when visual assets or simulation bundles are introduced.
