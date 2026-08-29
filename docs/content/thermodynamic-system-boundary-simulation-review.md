# Thermodynamic System Boundary Simulation Review

Review date: 2026-08-27
Simulation ID: `sim-core-thermal-system-001`
Technical status: `Engineering review required`
Operational availability: `Coming later`

## Scope

The candidate teaches classification of a stated thermodynamic system from declared
boundary conditions. It distinguishes:

- open system: mass may cross the stated boundary;
- closed system: mass does not cross, while energy may cross; and
- isolated system: neither mass nor energy crosses.

The classifier is a pure deterministic rule. It does not calculate heat, work, temperature,
pressure, fluid properties, mass flow, or time-dependent behaviour.

## Evidence Matrix

| Candidate statement or rule                                                           | Source evidence                                                             | Decision                                              |
| ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------- |
| A system is separated from surroundings by a stated boundary                          | `SRC-PURDUE-ME200-THERMO-DEFINITIONS-2021`, pp. 6-7                         | Supported for internal review                         |
| A closed system/control mass does not exchange mass across its boundary               | `SRC-PURDUE-ME200-THERMO-DEFINITIONS-2021`, pp. 6-7                         | Supported for internal review                         |
| An open system/control volume permits mass transfer across its boundary               | `SRC-PURDUE-ME200-THERMO-DEFINITIONS-2021`, pp. 6-7                         | Supported for internal review                         |
| An isolated system exchanges neither mass nor energy with its surroundings            | `SRC-PURDUE-ME200-THERMO-DEFINITIONS-2021`, pp. 6-7                         | Supported for internal review                         |
| Changing the selected system or stated boundary can change the correct classification | Derived instructional consequence of the source-defined system and boundary | Requires human education and engineering review       |
| A cycle returns a system to its initial state                                         | `SRC-OPENSTAX-COLLEGE-PHYSICS-2012`, section 15.2                           | Lesson traceability only; not used by this classifier |

The repository stores source metadata and original explanatory visuals. It does not
redistribute Purdue figures or slides.

## Implemented Rule

The internal rule ID is `RULE-THERMO-SYSTEM-BOUNDARY-001`:

1. An inconsistent or changed boundary selection returns `Indeterminate` with a warning.
2. If mass may cross, return `Open`.
3. Otherwise, if energy may cross, return `Closed`.
4. Otherwise, return `Isolated`.

The result uses the shared engineering result contract for traceability, assumptions,
warnings, and validity. It deliberately declares no equation metadata because this is a
classification rule, not an engineering equation.

## Fault Framing

`boundary-shift` is an analysis fault, not an equipment malfunction. It represents a
student changing the selected system or stated boundary during classification. The output
becomes `Indeterminate`; no physical machine failure, alarm threshold, or manufacturer
behaviour is implied.

## Review Separation

Source preparation, rule implementation, and this review record were produced in the same
automated-assisted workstream. They do not satisfy independent review. The following named
records remain required:

- Thermodynamics engineering review of the classification rule and visual semantics;
- education review of learning language and the boundary-shift diagnostic task;
- safety review confirming that the model introduces no misleading operational claim; and
- accessibility review of the final student-operable experience.

## Release Decision

The candidate may remain registered, searchable, previewable, and fully tested internally.
It must not expose Start, mode-selection, recommendation, attempt, or competency actions.
No database simulation row or migration is added at this gate.

## Unlock Checklist

Before changing availability to `Available`:

1. Record named reviewers, dates, decisions, and the accepted content/simulation versions.
2. Resolve every requested change and repeat affected tests.
3. Change lesson publication only through the existing review workflow.
4. Add version-controlled database data for the reviewed simulation if persistence requires
   a database record.
5. Verify live staging RLS, authenticated start, summary persistence, completion, and
   cross-student denial.
6. Re-run all local and deployed quality gates.

Current verdict: **TECHNICALLY IMPLEMENTED, HUMAN REVIEW GATE OPEN**.
