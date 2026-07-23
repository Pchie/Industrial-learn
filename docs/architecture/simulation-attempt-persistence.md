# Simulation Attempt Persistence

## Purpose

Industrial Learn simulation attempts persist meaningful authenticated summaries rather than high-frequency animation state.

Source IDs: IL-AGENTS-001, IL-AUTH-001, IL-DAL-001, IL-DB-001.

## Persisted Summary

Simulation attempts persist:

- Simulation ID and version
- Lesson ID
- Authenticated student ID
- Mode
- Start and completion time
- Input state
- Output summary
- Fault introduced
- Measurements taken
- Diagnosis submitted
- Score
- Competency awards
- Completion status

## Lifecycle

1. Start attempt using a registered simulation definition.
2. Store initial inputs and output summary.
3. Complete attempt with a final simulation state.
4. Server scores assessment mode using the simulation runtime.
5. Server derives competency awards from the mode and result.
6. Store bounded measurement summaries.
7. Update progress and competency in a transaction.
8. Record an audit event.

## Mode Rules

- Learn can award Introduced.
- Guided can award Operated.
- Explore is practice and does not automatically award mastery.
- Fault diagnosis can award Diagnosed.
- Assessment can award verified Operated evidence when scored successfully.

## Storage Boundary

The persistence layer stores a bounded measurement set and output summary. It does not store every animation frame or transient UI state.

## Current Adapter Status

`packages/database/src/attempt-persistence.ts` defines the application-service boundary and repository ports. Production Supabase/PostgreSQL repository adapters are the next implementation step.
