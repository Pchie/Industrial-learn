import {
  Alert,
  Badge,
  Breadcrumbs,
  Button,
  Checkbox,
  CourseCard,
  EngineeringReviewBadge,
  EquationPanel,
  FaultNotification,
  IconButton,
  Input,
  LearningOutcomePanel,
  LessonCard,
  MeasurementDisplay,
  ModuleCard,
  NavigationItem,
  NumberInput,
  ProgressIndicator,
  QuizQuestion,
  RadioGroup,
  SafetyWarning,
  Select,
  SimulationControlPanel,
  Slider,
  SourceReference,
  Tabs,
  Tooltip,
  WorkedExamplePanel
} from "@industrial-learn/design-system";
import { OverlayDemo } from "./overlay-demo";

const swatches = [
  ["Brand accent", "var(--il-color-brand-accent)"],
  ["Normal operation", "var(--il-color-state-normal)"],
  ["Information", "var(--il-color-state-info)"],
  ["Warning", "var(--il-color-state-warning)"],
  ["Fault", "var(--il-color-state-fault)"],
  ["Disabled", "var(--il-color-state-disabled)"],
  ["Hydraulic flow", "var(--il-color-domain-hydraulic)"],
  ["Electrical state", "var(--il-color-domain-electrical)"],
  ["Automation signal", "var(--il-color-domain-automation)"],
  ["Temperature indication", "var(--il-color-domain-temperature)"]
] as const;

export const metadata = {
  title: "Design System | Industrial Learn",
  robots: {
    index: false,
    follow: false
  }
};

export default function DesignSystemDemoPage() {
  return (
    <div className="il-demo">
      <section className="section-band" aria-labelledby="demo-title">
        <p className="eyebrow">Private demonstration route</p>
        <h1 id="demo-title">Industrial Learn design system</h1>
        <p>
          Component and token examples for development review only. This is not a
          production product page.
        </p>
      </section>

      <section className="section-band" aria-labelledby="tokens-title">
        <h2 id="tokens-title">Engineering state tokens</h2>
        <div className="il-demo__swatches">
          {swatches.map(([label, color]) => (
            <div className="il-demo__swatch" key={label}>
              <div className="il-demo__swatch-color" style={{ background: color }} />
              <div className="il-demo__swatch-label">
                <strong>{label}</strong>
                <code>{color}</code>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section-band" aria-labelledby="controls-title">
        <h2 id="controls-title">Controls</h2>
        <div className="il-demo__grid">
          <Button>Primary action</Button>
          <Button variant="secondary">Secondary action</Button>
          <IconButton icon="?" label="Open help" />
          <Input helperText="Visible helper text supports context." label="Text input" />
          <NumberInput label="Number input" min={0} />
          <Slider label="Flow rate" max={100} output="42 L/min" />
          <Select
            label="Operating mode"
            options={[
              { label: "Normal", value: "normal" },
              { label: "Boundary", value: "boundary" },
              { label: "Fault", value: "fault" }
            ]}
          />
          <Checkbox label="I understand this is a training scenario" />
          <RadioGroup
            legend="System state"
            name="demo-state"
            options={[
              { label: "Normal operation", value: "normal" },
              { label: "Fault state", value: "fault" }
            ]}
          />
        </div>
      </section>

      <section className="section-band" aria-labelledby="navigation-title">
        <h2 id="navigation-title">Navigation and overlays</h2>
        <div className="il-demo__grid">
          <NavigationItem current href="/internal/design-system">
            Design system
          </NavigationItem>
          <Breadcrumbs
            items={[
              { href: "/", label: "Home" },
              { href: "/internal/design-system", label: "Design system" }
            ]}
          />
          <Tooltip id="demo-tooltip">
            Use concise tooltips for unfamiliar controls.
          </Tooltip>
          <Tabs
            activeId="tokens"
            tabs={[
              { id: "tokens", label: "Tokens", panel: <p>Design token preview.</p> },
              { id: "components", label: "Components", panel: <p>Component preview.</p> }
            ]}
          />
          <OverlayDemo />
        </div>
      </section>

      <section className="section-band" aria-labelledby="learning-title">
        <h2 id="learning-title">Learning components</h2>
        <div className="il-demo__grid">
          <CourseCard
            description="A reviewed path through engineering foundations."
            meta="Core Engineering"
            status="Source required"
            title="Mechanical Foundations"
          />
          <ModuleCard
            description="Structured module metadata without full lesson content."
            meta="8 hours"
            status="Engineering review required"
            title="Thermodynamics Foundations"
          />
          <LessonCard
            description="A lesson card for authored learning activities."
            meta="45 minutes"
            status="Draft"
            title="System boundaries"
          />
          <LearningOutcomePanel
            outcomes={[
              "Identify assumptions before calculation.",
              "Reference approved source IDs for important technical statements."
            ]}
          />
        </div>
      </section>

      <section className="section-band" aria-labelledby="engineering-title">
        <h2 id="engineering-title">Engineering learning surfaces</h2>
        <div className="il-demo__grid">
          <EquationPanel sourceId="SRC-DEMO-001">
            <p>
              Equation display area. Formulas are supplied by reviewed content, not UI
              code.
            </p>
          </EquationPanel>
          <WorkedExamplePanel title="Worked example">
            <p>Steps, assumptions, and feedback can be displayed here.</p>
          </WorkedExamplePanel>
          <SafetyWarning>
            Training examples do not replace laboratory safety instruction.
          </SafetyWarning>
          <MeasurementDisplay
            label="Pump flow"
            tone="hydraulic"
            unit="L/min"
            value="42"
          />
          <SimulationControlPanel title="Simulation controls">
            <Slider label="Valve position" max={100} output="60%" />
          </SimulationControlPanel>
          <FaultNotification>
            Flow has moved outside the expected training range.
          </FaultNotification>
        </div>
      </section>

      <section className="section-band" aria-labelledby="assessment-title">
        <h2 id="assessment-title">Assessment and review</h2>
        <div className="il-demo__grid">
          <QuizQuestion prompt="Which review state is required before student approval?">
            <RadioGroup
              legend="Answer options"
              name="review-question"
              options={[
                { label: "Draft", value: "draft" },
                { label: "Review record exists", value: "review" }
              ]}
            />
          </QuizQuestion>
          <Alert title="Information" tone="info">
            Status meaning is visible as text and not communicated by colour alone.
          </Alert>
          <Badge tone="normal">Normal operation</Badge>
          <ProgressIndicator label="Module progress" value={35} />
          <SourceReference sourceId="SRC-DEMO-002" />
          <EngineeringReviewBadge status="Engineering review required" />
        </div>
      </section>

      <section className="section-band" data-theme="dark" aria-labelledby="dark-title">
        <h2 id="dark-title">Dark appearance support</h2>
        <p>
          Components inherit dark tokens through `data-theme="dark"` and preserve text
          labels for state meaning.
        </p>
        <div className="il-demo__grid">
          <Button>Dark action</Button>
          <Alert title="Warning" tone="warning">
            Review source IDs before publishing technical content.
          </Alert>
          <MeasurementDisplay
            label="Temperature"
            tone="temperature"
            unit="deg C"
            value="68"
          />
        </div>
      </section>
    </div>
  );
}
