# Industrial Learn Rollback Runbook

## Purpose

Rollback restores a known safe application state after failed deployment or unacceptable production behaviour.

## Source IDs

- IL-AGENTS-001: `AGENTS.md`
- IL-ARCH-DEPLOY-001: `docs/architecture/deployment-architecture.md`

## Rollback Triggers

- Production health checks fail after deployment.
- Critical authentication or access-control issue is observed.
- Student data ownership boundary is broken.
- Assessment or simulation persistence corrupts attempt results.
- Critical content publication issue is exposed to students.
- Error rate exceeds the release threshold set by the release owner.

## Application Rollback

1. Declare rollback and name the incident owner.
2. Freeze further production changes.
3. Identify last known good release artifact or commit.
4. Redeploy the last known good application artifact.
5. Keep database state under review before running any corrective migration.
6. Run production-safe health checks.
7. Monitor errors and access-denied patterns.
8. Record user impact and follow-up actions.

## Database Rollback

Database rollback is riskier than application rollback.

Preferred order:

1. Forward-fix with an additive corrective migration.
2. Disable or hide the affected feature through server-side control if available.
3. Restore from backup only after approval, data-loss assessment, and communications planning.

Never edit historical migrations to roll back a shared environment.

## Engineering Calculation Rollback

For an incorrect engineering calculation release:

1. Preserve the previous equation version, calculation tests, lesson content version, and assessment-attempt traceability.
2. Stop publishing content or assessments that depend on the suspect equation where student safety or grading integrity may be affected.
3. Restore the last reviewed calculation package version or ship a forward-fix with reviewed tests.
4. Re-run known-answer, boundary, invalid-input, unit-conversion, and physical-validity tests.
5. Record affected content, simulations, assessments, and review records.

## Simulation Regression Rollback

For a simulation regression:

1. Preserve the affected simulation version and attempt summaries.
2. Stop awarding competency from the affected mode if scoring integrity is uncertain.
3. Restore the last reviewed simulation version or publish a reviewed forward-fix.
4. Re-run normal-state, boundary-state, fault-state, and assessment-mode tests.

## Content Rollback

For reviewed content:

1. Unpublish the affected content version where supported.
2. Restore the previous approved content version.
3. Record reviewer, date, reason, and audit event.
4. Confirm source references and review status remain visible.

## Communication

Notify:

- Release approver.
- Engineering lead.
- Product owner.
- Security reviewer when privacy or access control may be affected.
- Education/content owner when student-facing content may be affected.

Do not include secrets, private student answers, or sensitive submissions in incident messages.
