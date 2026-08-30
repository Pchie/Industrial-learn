# Academic Source Quality Policy

## Purpose

Industrial Learn provides university-level engineering education. Its technical evidence must
support university-textbook quality, professional engineering accuracy, visual-first learning,
and interactive simulation.

This policy governs source selection, onboarding, traceability, copyright handling, and content
approval. It does not grant professional engineering approval and does not replace applicable
law, standards, regulations, or manufacturer instructions.

Policy source ID: `IL-ACADEMIC-SOURCE-POLICY-001`.

## Source Authority Hierarchy

Use the most authoritative source for the claim and application. A lower-numbered level does not
make a source universally better; it establishes precedence within the source's proper scope.

| Level | Category                                         | Appropriate use                                                                                                                                                                                                                             |
| ----- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | Governing or authoritative                       | Applicable legislation, SANS, IEC, ISO, ASHRAE, occupational and safety requirements, and government technical regulations. These govern compliance, safety, prescribed requirements, and regulatory limits.                                |
| 2     | Official technical documentation                 | Original equipment manufacturer manuals, engineering guides, product documentation, official software documentation, and technical application manuals. Use for specific equipment behaviour, specification, configuration, or application. |
| 3     | University engineering textbook                  | University-level engineering theory, worked examples, fundamental equations, and academic explanations from a legally obtained, traceable edition.                                                                                          |
| 4     | University or peer-reviewed educational material | University course material, open university textbooks, peer-reviewed publications, and recognised open educational resources.                                                                                                               |
| 5     | Supporting                                       | Supplementary explanation or illustration only. Level 5 material must not be the primary authority for important equations, safety requirements, or technical claims.                                                                       |

A checked Level 5 source may supplement student explanations or illustrations, but it
does not satisfy the independent corroboration requirement for a significant equation,
simulation, design principle, safety limit, fault behaviour, or operating limit.

## Preferred Academic Publisher

McGraw Hill Education engineering textbooks are a preferred benchmark for university engineering
theory where an appropriate title exists and is legally available to the project. Preference is
not automatic authority:

- Level 1 requirements override textbooks for compliance, safety, and prescribed limits.
- Level 2 documentation governs equipment-specific claims.
- A McGraw Hill title must still be relevant, current enough for the claim, traceable to an exact
  edition, suitable for the student's level, and lawfully available.
- A first available internet source must not replace a suitable academic source merely because it
  is easier to access.

When McGraw Hill coverage is insufficient or unavailable, select an equivalent source based on
publisher reputation, author credentials, university adoption, edition history, technical depth,
academic standing, citations, level suitability, and accepted engineering practice. Record the
selection rationale and legal-access decision in the source record.

## Multiple-Source Verification

Where practical, significant equations, simulations, design principles, equipment behaviour,
safety limits, fault diagnosis, and system operating limits require corroboration by at least one
additional credible source.

An exception is permitted only when corroboration is not practicable and a named independent
reviewer records the reason for the exact content version. An exception does not weaken Level 1
requirements or permit invented technical data.

## Visual-First Transformation

Textbooks and other approved evidence provide the academic foundation. They must not be converted
into copied web chapters. Use the following transformation:

```text
Approved source
  -> focused knowledge file
  -> engineering model
  -> original visual explanation
  -> animation or simulation
  -> live calculation
  -> engineering challenge
  -> real-world application
  -> optional Deep Dive theory
```

Explanations, diagrams, worked examples, animations, and interactive models must be original unless
the project has explicit reuse permission.

## Focused Knowledge Files

Do not place complete textbooks in lessons, prompts, or broad knowledge files. Each knowledge file
must cover one focused technical topic, cite exact approved source IDs, and record the equations and
simulations it supports.

## Copyright And Licensing

Commercial textbooks and many technical documents are copyrighted. Industrial Learn must not:

- copy complete chapters or large passages;
- reproduce copyrighted diagrams without permission;
- make licensed textbooks or standards publicly downloadable;
- distribute copyrighted source files to students unless authorised; or
- infer a redistribution right from public web access.

Every approved source record must state its access mode, copyright status, licence or absence of a
verified licence, permitted internal use, distribution permission, and whether students may open the
official source directly.

## Required Source Metadata

Every approved source record must include:

- stable source ID, title, author or responsible organisation;
- authority level and category;
- source-selection role and rationale;
- edition, version, publication date, and access date;
- publisher and ISBN when applicable and verified;
- discipline, relevant chapter, section, and pages when available;
- knowledge file IDs, equation IDs, and simulation IDs supported;
- copyright and project access status;
- source-conflict status;
- reviewer, review date, evidence status, and limitations.

Never invent missing edition, page, ISBN, clause, rating, or licence information.

## Simulation Traceability

Each engineering simulation must be traceable through:

```text
simulation ID
  -> governing equation IDs
  -> knowledge file IDs
  -> source IDs
  -> manufacturer or standards references where applicable
  -> engineering review records
```

A visually polished simulation without credible technical evidence cannot be approved for student
use.

## Source Conflicts

When credible sources disagree, record the disagreement, source editions, assumptions, context, and
applicable engineering regime. Resolve it using the most authoritative source for the specific
application. If unresolved, mark the affected content `Engineering review required`; it cannot be
approved or published for students.

## Student Level

Match depth to the student's academic stage. Foundations should emphasise visual intuition,
fundamental principles, basic equations, and simple applications. Advanced material may add
derivations, complex assumptions, advanced models, and deeper design applications. Simplification
must never make technical content incorrect.

## Approval Gate

Source metadata marked `approved` means the evidence was located and checked; it does not by itself
mean the derived lesson is approved for students. Student-use approval still requires the repository's
independent technical review record for the exact content version.
