# Basic Fluid Pressure Review Evidence

Prepared: 2026-08-30

Target: `LES-FLUID-PRESSURE-001`, version `0.4.0`, governance revision `4`

Status: Ready for human review; not approved; not published

## Frozen Artifact Register

The SHA-256 values below were frozen after final source formatting.

| Artifact                                                                  | SHA-256                                                            |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `content/lessons/fluid-pressure/basic-fluid-pressure.json`                | `f3746a0730b154023a1faea80719f1cfde27477aae22b164bcfe71cab3ca552a` |
| `knowledge/fluid-pressure/basic-fluid-pressure.json`                      | `0d5985dff14f43baa72ab1ad4c0bdc6858e5f7aae575766a5744aef3cf682c4a` |
| `content/assessments/fluid-pressure/basic-fluid-pressure-assessment.json` | `db6268839cdfb959e7f7e392d9879cb3518b30d8b13ee01686cdd88ec71cec88` |
| `sources/fluid-pressure/openstax-college-physics.json`                    | `fe740d6f9325f110e6922b8b9395f27e03d74e3158b096eb3c0ec946c3adfaec` |
| `sources/fluid-pressure/penn-state-pressure-basics.json`                  | `87ec80fac6237cfe0bee7ba80bf603aee3d6597a81afd8e0508accba2d90132a` |
| `apps/web/src/features/basic-fluid-pressure-lesson/model.ts`              | `083f8921f1eccb50660b6790e50ed06e5edf8a1d3c829c9f3f58dcb9c73a7185` |

If any listed artifact changes after these hashes are frozen, stop and prepare a new
version or refreshed evidence package before recording a decision.

## Source Evidence

### OpenStax

- Source ID: `SRC-OPENSTAX-COLLEGE-PHYSICS-2012`.
- Relevant location: chapter 11, section 11.3, Pressure.
- Evidence used: pressure as normal force divided by area, `p = F / A`, and
  `1 Pa = 1 N/m^2`.
- Status: Source checked; evidence approved for this bounded claim set; independent human
  review still required before student-use approval.

### Penn State

- Source ID: `SRC-PSU-CIMBALA-PRESSURE-BASICS`.
- Author and institution: John M. Cimbala, Penn State Department of Mechanical
  Engineering.
- Relevant location: Introduction to Pressure in Fluid Mechanics.
- Evidence used: pressure acting normally, force per area, and pascal dimensions.
- Runtime registry: registered in
  `apps/web/src/features/publication/source-records.ts` and covered by publication tests.
- Status: Source checked; evidence approved for this bounded claim set; independent human
  review still required before student-use approval.

### McGraw Hill

The preferred commercial textbook benchmark remains **ACQUISITION REQUIRED**. Lawful
project access to the identified edition and chapter has not been recorded. It has no
Industrial Learn source ID and is not cited by this version.

## Claim And Outcome Traceability

| Claim or activity                                 | Outcome                  | Evidence or implementation                   |
| ------------------------------------------------- | ------------------------ | -------------------------------------------- |
| Pressure is normal force per area                 | `LO-FP-001`              | Both source IDs; `EQ-FLUID-PRESSURE-001`     |
| Increasing force at fixed area increases pressure | `LO-FP-002`              | Equation relationship and visual observation |
| Reducing area at fixed force increases pressure   | `LO-FP-002`              | Equation relationship and visual observation |
| Pressure calculation in SI units                  | `LO-FP-003`              | engineering-core pure function and tests     |
| `200 kPa` target challenge                        | `LO-FP-002`, `LO-FP-003` | Shared challenge evaluator; practice only    |
| Simple hydraulic-press context                    | `LO-FP-001`, `LO-FP-003` | Original bounded application explanation     |

No retained claim provides an equipment rating, safe design decision, fault diagnosis, or
complete hydraulic-system model.

## Equation And Known Answers

- Equation ID: `EQ-FLUID-PRESSURE-001`.
- Runtime function: `pressureFromForceAndArea`.
- Inputs: explicit `N` and `m^2`.
- Internal result: `Pa`.
- Display conversion: explicit engineering-core conversion to `kPa`.

Automated coverage includes known-answer, zero-force, zero-area, invalid input, explicit
conversion, input-boundary, visual-normalisation, challenge-threshold, and challenge-margin
cases.

## Model Evidence

See `docs/content/basic-fluid-pressure-model-scope.md`. The calculated,
representational, and not-modelled boundaries are visible in the lesson and reviewer
workspace. No simulation, fault mode, or high-frequency state is introduced.

## Assessment Evidence

The assessment contains five items and a maximum of six points. It tests concept
understanding, a numeric pressure calculation, visual comparison, SI-unit awareness, and
simple application reasoning. Its competencies are limited to `Understood` and
`Calculated`.

Production delivery uses the trusted assessment server and exact content version. The
new unreviewed version is not made available merely because an older database row may have
been approved.

## Governance Evidence

Migration `0013_atomic_content_review_decision.sql`:

- removes authenticated direct insert/update/delete access to review records;
- requires an authenticated engineering reviewer or administrator;
- requires a substantive comment;
- binds the decision to the current governance revision and snapshot version label;
- prevents an author from approving their own lesson;
- requires source, equation, safety/limitations, educational, and accessibility
  attestations for approval;
- writes the review record, workflow update, and audit event atomically; and
- leaves publication as a separate action.

The staging seed binds version `0.4.0` to the synthetic content author and leaves the item
in `Engineering review required` plus `draft`. No human decision is seeded.

## Evidence Status

Automated remediation evidence is complete enough to present to a qualified human
reviewer. Only that human reviewer may decide whether this exact version should become
`Approved for student use`. This evidence file is not an approval record.
