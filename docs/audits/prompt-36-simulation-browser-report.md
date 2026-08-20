# Prompt 36 Simulation Browser Report

Date: 2026-08-10

## Executive Summary

Implemented the browser-based hydraulic cylinder force simulation journey using the existing simulation engine, engineering-core calculation boundary, authenticated route protection, and simulation attempt persistence services.

## Routes Implemented

- `/simulations`
- `/simulations/hydraulic-cylinder-force`
- `/simulations/hydraulic-cylinder-force/attempt/[attemptId]`
- `/simulations/hydraulic-cylinder-force/attempt/[attemptId]/review`
- `/simulations/history`

## Modes Completed

- Learn
- Guided
- Explore
- Fault diagnosis
- Assessment

## Engineering Boundary

The UI does not implement the governing hydraulic equation. It uses `@industrial-learn/simulation-engine`, which calls `@industrial-learn/engineering-core` for the pressure-area force calculation.

## Persistence Behaviour

Attempt summaries persist authenticated student ID, simulation ID, version, lesson context, mode, inputs, output summary, fault, measurements, diagnosis, score, competency awards, and completion status. The browser does not persist animation frames.

## Security Protections

- Student ID is resolved from the authenticated server session.
- Cross-student review resolves to not found.
- Completion score and competency are server-controlled.
- Invalid mode and invalid physical inputs are rejected.
- Duplicate completion returns the already completed attempt or blocks mutation.
- Service-role credentials remain server-only.

## Accessibility

Controls have visible labels, numeric inputs are available for all ranges, reset and pause are keyboard-operable, fault alarms include text, and reduced-motion/mobile flows are covered by E2E tests.

## Verification Results

- `npm run scan:secrets`: PASS
- `npm run format:check`: PASS
- `npm run typecheck`: PASS
- `npm run lint`: PASS
- `npm run validate:content`: PASS
- `npm run validate:migrations`: PASS, 13 migration/schema tests passed
- `npm run test:unit`: PASS, 19 files passed, 1 skipped; 161 tests passed, 4 skipped
- `npm run build`: PASS, simulation routes included in the Next.js route manifest
- `npm run test:smoke`: PASS, 5 tests passed
- `npm run test:e2e`: PASS, 69 tests passed

## Live Supabase Staging Migration

`database/migrations/0008_atomic_simulation_completion.sql` was applied to the linked Supabase staging project on 2026-08-10.

Live function privilege verification:

- Function: `public.complete_simulation_attempt_transaction`
- Security definer: PASS
- `anon` execute privilege: denied
- `authenticated` execute privilege: denied
- `service_role` execute privilege: allowed

`database/migrations/0009_staging_hydraulic_simulation_fixture.sql` was applied to the linked Supabase staging project on 2026-08-10 to add the expected application-facing staging slug `hydraulic-cylinder-force`. The fixture is idempotent and only inserts the row when the earlier staging hydraulic simulation fixture exists.

## Live Deployed Staging Simulation

Live deployed browser verification was run against:

`https://industrial-learn-staging-git-development-kolobe.vercel.app`

Vercel SSO deployment protection was temporarily disabled for the test and restored immediately afterward.

Live result:

- Synthetic staging-only student created.
- Student signed in through the deployed Supabase-backed application.
- `/simulations/hydraulic-cylinder-force` loaded successfully.
- Source-gated review status `Source required` was visible.
- Fault diagnosis mode started an authenticated attempt.
- Pressure-loss fault was introduced through the browser controls.
- Attempt completed and redirected to review.
- Simulation history displayed the completed fault-diagnosis attempt.
- Dashboard displayed simulation activity and `Diagnosed` competency evidence.
- Supabase stored attempt `9cd60285-769b-45ef-a05f-b33825f7abf1` as `submitted`.
- Stored mode: `fault-diagnosis`.
- Stored fault: `pressure-loss`.
- Stored score: `1.00`.
- Stored competency awards: `Diagnosed: 1`.
- Stored measurement count: `6`.
- Stored output summary includes `cylinderForce: 6000`, `status: faulted`, and `scenarioState: fault-state`.

## Source And Review Status

The pilot remains `Source required`. The browser labels it as training content and does not present it as engineering-approved.

## Known Limitations

- The hydraulic source record is still a placeholder.
- Fault behaviours remain pedagogical until reviewed source evidence is onboarded.
- The dashboard currently displays the persisted live Supabase simulation row with the generic title `Simulation attempt` because the dashboard reader does not yet join simulation metadata for titles. Competency and activity evidence still appeared correctly.
