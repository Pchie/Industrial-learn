# Industrial Learn execution plan

Date: 2026-10-03. Status: proposed delivery plan, not production or engineering approval.

## Recommendation

Build on the existing application rather than restart it. Make one reviewed learning
path reliable, useful and measurable; prove it with a controlled pilot; then expand
content and introduce a narrowly scoped AI mentor. A polished dashboard is only one
part of the product. The learner must be able to understand, practise, demonstrate
understanding, receive useful feedback and return to an appropriate next activity.

## October 12 delivery update

The bounded staging release is now verified and its link switched. All five test accounts are retired. See [current verification](../audits/platform-verification-2026-10-12.md). AI Mentor is explicitly deferred; operational and reviewed-content requirements remain. The October 3 observations below are historical.

## Historical October 3 evidence and unfinished work

The saved September 29 hosted journey records 13 passes, including genuine sign-in,
canonical bookmarks, fresh-browser persistence, challenge progress, assessment v2,
immutable review, account isolation, dashboard results and responsive accessibility.
Its bookmark cleanup passed. These are dated saved results, not a fresh October 3
availability check. Evidence: `.private-operations/53f-2026-09-22/browser-round1.json`.

The saved actor state still has all five approved synthetic accounts marked CREATED,
including a platform owner. Retirement is not recorded. Both hosted account-boundary
rounds, the second hosted journey, this continuation's unchanged original seven-test
suite runs, final preservation and staging-alias switch are not recorded as complete.
The September 22 handover's claim that account approval is pending is stale: the user
approved it September 29 and provisioning succeeded. Do not ask again.

First reconcile current remote state and finish these already-authorized operations.
Retire the test accounts after verification; if verification cannot continue promptly,
disable their access and record a safe restart procedure rather than leave privileged
test access indefinitely. Preserve existing evidence and do not overwrite failed runs.

Existing pilot documents also require external-mail lifecycle evidence, operational
ownership, recovery custody and human accessibility checks. Their dated status must be
revalidated before claiming any gate is currently open or closed. See
[pilot remediation](../audits/staging-pilot-gate-remediation.md) and
[recovery record](../operations/staging-recovery-current.md).

## Delivery sequence

| Stage                       | Deliverable                                                                                                                             | Responsible role                                       | Exit evidence                                                                                                                                   |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Reliable release         | Finish hosted acceptance, lifecycle cleanup, alias verification; consolidate one current status report                                  | Engineering/release lead                               | Both rounds pass on the exact release; original data preserved; test access retired; staging link verified; unresolved gaps explicitly retained |
| 2. Pilot operations         | Delivered signup/recovery email journey, participant access, named support/incident operators, recovery custody and human accessibility | Release operator, pilot owner, accessibility reviewer  | Documented operational acceptance; no fabricated sign-off; explicit pilot start decision                                                        |
| 3. Complete learning path   | Reviewed lesson, original visual, guided challenge, assessment, explanatory feedback, revision and next step                            | Learning designer and independent engineering reviewer | A learner can complete the full path; each claim/version has required review evidence; normal, boundary and fault tests cover simulations       |
| 4. Evidence-grounded mentor | Approved-content search followed by a limited concept/hint mentor inside the existing Study Support UI                                  | AI/backend engineer and content reviewer               | Permission, citation, calculation, assessment-integrity and adversarial evaluations pass; approved retention and escalation process             |
| 5. Measured expansion       | Small supervised pilot, then another reviewed module and scoped educator workflow                                                       | Pilot owner and product lead                           | Reported usability/outcome evidence supports expansion; critical issues closed; sustainable support and per-learner costs                       |

Stages 1–2 remain the critical path. Content design and offline AI evaluation-case
authoring can proceed alongside them. Student access and live mentor release wait for
their respective gates. This is a dependency sequence, not a promised calendar estimate.

## The learner experience to build

Use Basic Fluid Pressure as the first complete reference experience:

1. State the learning outcome and check prerequisites with a short diagnostic.
2. Explain the concept using reviewed text and an original interactive visual.
3. Ask the learner to predict an outcome before changing simulation inputs.
4. Let them practise, receive controlled hints and explain their reasoning.
5. Assess using the existing deterministic scoring and exact content version.
6. Explain mistakes and units after submission, then recommend specific revision.
7. Save progress and make the dashboard's next step reflect the actual stored result.

Keep navigation, terminology and progress consistent across desktop, tablet and mobile.
Include keyboard, screen-reader, zoom and constrained-network scenarios. Never imply
that opening a page proves competence. Treat mastery rules and spaced revision as
product hypotheses to validate, not as established outcomes.

## OpenAI implementation direction

Extend the existing [mentor design](../architecture/ai-engineering-mentor.md) and
[search-first ADR](../architecture/adr/0008-search-before-ai-mentor.md). The inspected
Study Support component currently provides search/navigation and explicitly says live
AI answers are not connected. Preserve that honesty until a real service is enabled.

Proposed request path:

`Study Support → authenticated server → publication/ownership checks → approved evidence → model → citation/policy validation → learner`

- Start with concept explanations and prerequisite hints in the reviewed pilot path.
  Keep assessed-answer keys out of the mentor's inputs and tools.
- Keep Supabase as the authority for ownership, publication and progress. Check current
  access before retrieval and validate returned source/version IDs again before display.
  Search metadata alone is not an authorization boundary; withdrawn content must stop
  being usable even while an external index update is pending.
- The Responses API's File Search is an option for a permitted reviewed corpus: it offers
  retrieval and file metadata filtering. Hosted ingestion is a separate decision about
  rights, data transfer and lifecycle; uploading licensed textbooks or private learner
  records is not part of this plan. [Official File Search documentation](https://developers.openai.com/api/docs/guides/tools-file-search).
- Use Structured Outputs for fields such as explanation, source IDs, next question and
  insufficient-evidence status. Validate their meaning on the server: a valid schema
  does not establish factual correctness. [Official Structured Outputs documentation](https://developers.openai.com/api/docs/guides/structured-outputs).
- Route calculations and scoring through existing pure tested functions using SI units.
  The model may explain their verified output; it does not assign grades, approve content
  or write directly to student progress tables.
- Select a model using representative quality, latency and cost evaluations. Set request
  limits, minimal-data logging and a fallback to approved search when generation fails.
  No API credential, paid call or new provider integration was configured in this review.

Before enabling the mentor, build a reviewer-checked evaluation set containing ordinary
questions, wrong-unit reasoning, absent evidence, conflicting sources, withdrawn versions,
prompt injection, cross-student access and requests for hidden answers. Test citation
support, appropriate refusal and useful hints separately. Re-run evaluations when the
model, prompt, retrieval or reviewed corpus changes. This follows OpenAI's recommendation
for task-specific continuous evaluation calibrated with human judgment.
[Official evaluation guidance](https://developers.openai.com/api/docs/guides/evaluation-best-practices).

## How to judge quality

Use the existing [pilot success metrics](../pilot/student-pilot-success-metrics.md),
which define proposed thresholds and require their acceptance before recruitment.
Report denominators, failures and assisted completion. Do not claim causal learning
gains or professional competence from a small usability pilot.

Track unaided journey completion, misconception correction, assessment consistency,
accessibility blockers, support demand and return-to-learning usefulness. For AI, add
unsupported-claim rate, citation support, refusal correctness, response latency and cost
per completed help session. Any observed privacy breach or serious engineering error
blocks expansion. Passing a finite test set is not proof of zero future failures.

## Scope and remaining limitations

This review adds this plan only; it does not modify application code, issue credentials,
invite learners, change production or approve engineering material. Historical assessment
v1 provenance, positive reviewed simulation/withdrawal evidence, natural JWT expiry and
the original owner-assignment failure's causal explanation remain documented gaps unless
new evidence closes them. Author UI CRUD remains deferred. A September 29 independent
review attempt was interrupted by a usage limit and is not a completed review.

The next engineering work item is completion of the existing hosted release verification
and test-access cleanup. The next product work item is a reviewed specification for the
single complete pilot learning path. Broad catalogue expansion, voice tutoring and
certificates should follow demonstrated readiness and learner value.
