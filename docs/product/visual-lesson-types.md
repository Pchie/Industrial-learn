# Visual Lesson Types

Version: 1.0.0

## Selection Rule

Choose the type from the primary learning outcome, not from the available component. One
lesson may contain supporting blocks from other types, but it declares one dominant type.

## A. Phenomenon

Use when the learner must see and explain how a variable changes a physical effect, such
as pressure, heat transfer, voltage/current, Bernoulli behaviour, or bending.

- Required blocks: Hero Simulation, Observation Question, Micro Theory.
- Optional blocks: Live Equation, Engineering Challenge, Application, Deep Dive, Check.
- Order: Hook, Hero, Explore, Observe, Micro Theory, equation if relevant, challenge,
  application, check, optional Deep Dive.
- Maximum initial theory: One sentence of purpose; no explanatory paragraph before Hero.
- Required visual: Interactive phenomenon with a valid default state.
- Required interaction: At least one meaningful bounded variable or start action.
- Calculation relationship: Engineering-core drives calculated values when equations are
  part of the outcome.
- Challenge relationship: Optional target or constraint that tests cause and effect.
- Assessment relationship: Concept observation plus calculation or application reasoning.

## B. Component

Use when the learner must identify a component, inspect its internal structure, and
explain operation, such as a pump, valve, motor, relay, or compressor.

- Required blocks: Component Cutaway, Observation Question, Micro Theory.
- Optional blocks: Hero Simulation, Linked Schematic, measurement, fault, application,
  Deep Dive, check.
- Order: Hook, cutaway/operation, explore, observe, Micro Theory, schematic, application,
  check, optional Deep Dive.
- Maximum initial theory: One purpose sentence and essential safety boundary.
- Required visual: External or cutaway component representation with labelled identity.
- Required interaction: Select a state, operating part, view, or legitimate control.
- Calculation relationship: Include only quantities needed to explain operation.
- Challenge relationship: Operation or identification; diagnosis belongs in a diagnostic
  lesson when evidence becomes the main task.
- Assessment relationship: Component identification, operation sequence, or state reading.

## C. System

Use when the learner must understand relationships between multiple components, such as a
hydraulic circuit, refrigeration cycle, pump system, or motor starter.

- Required blocks: Linked Schematic, Observation Question, Micro Theory.
- Optional blocks: Hero Simulation, cutaways, instruments, Live Equation, challenge,
  application, Deep Dive, check.
- Order: Hook, physical system plus schematic, explore state paths, observe, explain,
  calculate where needed, challenge, apply, check.
- Maximum initial theory: One system purpose and necessary safety state.
- Required visual: Linked physical and schematic representations or a reviewed network
  visual.
- Required interaction: Select or change a component/state and see consequences across
  the system.
- Calculation relationship: State and equation outputs share component IDs and units.
- Challenge relationship: Reach or explain a system state without inventing unsupported
  component behaviour.
- Assessment relationship: Trace, sequence, measurement, or system reasoning.

## D. Calculation

Use when the learner must configure a visual system and perform or interpret a calculation,
such as pump sizing, heat load, beam stress, or electrical power.

- Required blocks: Hero Simulation, Live Equation, Engineering Challenge.
- Optional blocks: Observation, Micro Theory, worked example, application, Deep Dive,
  check.
- Order: Objective, visual model, inputs, live result, concise explanation, worked
  interpretation, challenge, application, check.
- Maximum initial theory: Definitions needed to understand inputs only.
- Required visual: A state or geometry visibly driven by calculation inputs and outputs.
- Required interaction: Change at least one reviewed input.
- Calculation relationship: All trusted calculations run in engineering-core with SI
  internally and explicit display conversion.
- Challenge relationship: Target or constraint with stated assumptions and margin.
- Assessment relationship: Numeric answer, units, interpretation, and model boundary.

## E. Diagnostic

Use when the learner must infer a supported fault from symptoms and measurements, such as
a hydraulic, electrical, or HVAC fault.

- Required blocks: Hero Simulation, Fault Challenge.
- Optional blocks: Linked schematic, instruments, observation, controlled hints, Micro
  Theory after evidence collection, application, Deep Dive, check.
- Order: Safe context, normal baseline, symptoms, measurements, diagnosis, feedback,
  explanation, check.
- Maximum initial theory: Safety context and operating baseline only.
- Required visual: Evidence-supported system state with explicit normal/fault distinction.
- Required interaction: Select measurements and submit a diagnosis.
- Calculation relationship: Measurements and limits come from reviewed domain state.
- Challenge relationship: Diagnosis pattern with controlled hints and no invented fault.
- Assessment relationship: Server-controlled diagnosis and competency policy where graded.

## F. Design

Use when the learner must choose variables under an objective and constraints, such as
pump, pipe, or battery selection.

- Required blocks: Engineering Challenge, Real-World Application, and a declared
  first-screen primary visual.
- Optional blocks: Hero Simulation, Interactive Diagram, Live Equation, comparison,
  trade-off view, Deep Dive, check.
- Order: Design objective, constraints, visual configuration, calculated outcome,
  compare, submit, interpret, application, check.
- Maximum initial theory: Definitions of objective and constraints only.
- Required visual: Outcome or trade-off view tied to the current candidate design.
- Required interaction: Choose reviewed design variables and intentionally check/submit.
- Calculation relationship: Engineering-core owns equations; data and limits require
  approved sources.
- Challenge relationship: Design pattern with explicit assumptions, constraints, and
  margin.
- Assessment relationship: Reasoned selection and limitation awareness, not merely a
  matching numeric result.

## Choosing A Non-Visual Type

Use a linear `theory` lesson when the outcome cannot be improved by a meaningful visual
state or manipulation. Record the rationale during authoring. A static illustration may
still support the lesson without converting it into a visual-v2 experience.
