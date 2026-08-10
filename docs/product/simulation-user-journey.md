# Simulation User Journey

Source IDs: IL-AGENTS-001, IL-PRD-001, IL-SIM-001, IL-DAL-001.

## Pilot Scope

The first browser simulation journey supports the hydraulic cylinder force pilot only. It uses `SIM-HYD-CYL-FORCE-001` from the existing simulation engine and keeps the review status visible as `Source required`.

## Student Journey

1. Student signs in.
2. Student opens `/simulations`.
3. Student chooses the hydraulic cylinder force simulation.
4. Student selects Learn, Guided, Explore, Fault diagnosis, or Assessment mode.
5. The server starts an authenticated attempt for the current student.
6. The student operates labelled controls using SI inputs.
7. The simulation engine calculates live measurements and warnings.
8. The student may introduce or receive a pilot fault where the selected mode allows it.
9. The student completes the attempt.
10. The server reconstructs and validates the state, scores assessment mode, persists a bounded summary, and updates progress.
11. The student reviews the completed attempt and sees dashboard activity.

## Evidence Rules

- Opening a simulation does not award progress.
- Starting an attempt does not award progress.
- Resetting state does not award progress.
- Explore mode is practice and does not award automatic mastery.
- Completion stores inputs, outputs, measurements, diagnosis, fault, score, and competency awards.

## Current Limitation

The pilot is a reviewed software boundary but remains source-gated. It must not be presented as engineering approval for real hydraulic equipment until source, equation, safety, and simulation review records are complete.
