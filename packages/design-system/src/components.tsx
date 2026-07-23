import type {
  ButtonHTMLAttributes,
  ComponentPropsWithoutRef,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes
} from "react";
import { AccessibleTabs } from "./accessible-tabs";
import { FocusScope } from "./focus-scope";

type Tone =
  | "brand"
  | "normal"
  | "info"
  | "warning"
  | "fault"
  | "disabled"
  | "hydraulic"
  | "electrical"
  | "automation"
  | "temperature";

type Size = "sm" | "md" | "lg";

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "quiet";
  size?: Size;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cx(
        "il-button",
        `il-button--${variant}`,
        `il-button--${size}`,
        className
      )}
      type={type}
      {...props}
    />
  );
}

export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  icon: ReactNode;
};

export function IconButton({
  className,
  icon,
  label,
  type = "button",
  ...props
}: IconButtonProps) {
  return (
    <button
      aria-label={label}
      className={cx("il-icon-button", className)}
      title={label}
      type={type}
      {...props}
    >
      <span aria-hidden="true">{icon}</span>
    </button>
  );
}

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  helperText?: string;
};

export function Input({ className, helperText, id, label, ...props }: InputProps) {
  const inputId = id ?? `input-${label.toLowerCase().replaceAll(" ", "-")}`;
  const helperId = helperText ? `${inputId}-helper` : undefined;

  return (
    <label className="il-field" htmlFor={inputId}>
      <span className="il-field__label">{label}</span>
      <input
        aria-describedby={helperId}
        className={cx("il-input", className)}
        id={inputId}
        {...props}
      />
      {helperText ? (
        <span className="il-field__helper" id={helperId}>
          {helperText}
        </span>
      ) : null}
    </label>
  );
}

export function NumberInput(props: Omit<InputProps, "type">) {
  return <Input inputMode="decimal" type="number" {...props} />;
}

export type SliderProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  output?: string;
};

export function Slider({ className, id, label, output, ...props }: SliderProps) {
  const sliderId = id ?? `slider-${label.toLowerCase().replaceAll(" ", "-")}`;

  return (
    <label className="il-field" htmlFor={sliderId}>
      <span className="il-field__label">
        {label}
        {output ? <span className="il-field__output">{output}</span> : null}
      </span>
      <input
        className={cx("il-slider", className)}
        id={sliderId}
        type="range"
        {...props}
      />
    </label>
  );
}

export type SelectOption = {
  label: string;
  value: string;
};

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: SelectOption[];
};

export function Select({ className, id, label, options, ...props }: SelectProps) {
  const selectId = id ?? `select-${label.toLowerCase().replaceAll(" ", "-")}`;

  return (
    <label className="il-field" htmlFor={selectId}>
      <span className="il-field__label">{label}</span>
      <select className={cx("il-select", className)} id={selectId} {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function Checkbox({ className, label, ...props }: CheckboxProps) {
  return (
    <label className="il-check">
      <input className={className} type="checkbox" {...props} />
      <span>{label}</span>
    </label>
  );
}

export type RadioOption = {
  label: string;
  value: string;
};

export type RadioGroupProps = {
  legend: string;
  name: string;
  options: RadioOption[];
  value?: string;
};

export function RadioGroup({ legend, name, options, value }: RadioGroupProps) {
  return (
    <fieldset className="il-radio-group">
      <legend>{legend}</legend>
      {options.map((option) => (
        <label className="il-check" key={option.value}>
          <input
            defaultChecked={option.value === value}
            name={name}
            type="radio"
            value={option.value}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </fieldset>
  );
}

export type TabsProps = {
  tabs: Array<{ id: string; label: string; panel: ReactNode }>;
  activeId: string;
};

export function Tabs({ activeId, tabs }: TabsProps) {
  return <AccessibleTabs activeId={activeId} tabs={tabs} />;
}

export type ModalProps = {
  title: string;
  children: ReactNode;
  open: boolean;
  onDismiss?: () => void;
};

export function Modal({ children, onDismiss, open, title }: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="il-modal">
      <div className="il-modal__panel">
        <FocusScope
          className="il-focus-scope"
          labelledBy="il-modal-title"
          onDismiss={onDismiss}
        >
          <h2 id="il-modal-title">{title}</h2>
          {children}
        </FocusScope>
      </div>
    </div>
  );
}

export type DrawerProps = ModalProps & {
  side?: "left" | "right";
};

export function Drawer({
  children,
  onDismiss,
  open,
  side = "right",
  title
}: DrawerProps) {
  if (!open) {
    return null;
  }

  return (
    <aside className={cx("il-drawer", `il-drawer--${side}`)}>
      <FocusScope
        className="il-focus-scope"
        labelledBy="il-drawer-title"
        onDismiss={onDismiss}
      >
        <h2 id="il-drawer-title">{title}</h2>
        {children}
      </FocusScope>
    </aside>
  );
}

export type TooltipProps = {
  id: string;
  children: ReactNode;
};

export function Tooltip({ children, id }: TooltipProps) {
  return (
    <span className="il-tooltip" id={id} role="tooltip">
      {children}
    </span>
  );
}

export type AlertProps = {
  title: string;
  children: ReactNode;
  tone?: Tone;
  role?: "status" | "alert";
};

export function Alert({ children, role, title, tone = "info" }: AlertProps) {
  return (
    <section
      className={cx("il-alert", `il-tone-${tone}`)}
      role={role ?? (tone === "fault" ? "alert" : "status")}
    >
      <strong>{title}</strong>
      <div>{children}</div>
    </section>
  );
}

export type BadgeProps = {
  children: ReactNode;
  tone?: Tone;
};

export function Badge({ children, tone = "info" }: BadgeProps) {
  return <span className={cx("il-badge", `il-tone-${tone}`)}>{children}</span>;
}

export type ProgressIndicatorProps = {
  label: string;
  value: number;
  max?: number;
};

export function ProgressIndicator({ label, max = 100, value }: ProgressIndicatorProps) {
  return (
    <label className="il-progress">
      <span className="il-field__label">{label}</span>
      <progress max={max} value={value}>
        {value} of {max}
      </progress>
    </label>
  );
}

export type NavigationItemProps = ComponentPropsWithoutRef<"a"> & {
  current?: boolean;
};

export function NavigationItem({
  children,
  className,
  current,
  ...props
}: NavigationItemProps) {
  return (
    <a
      aria-current={current ? "page" : undefined}
      className={cx("il-nav-item", className)}
      {...props}
    >
      {children}
    </a>
  );
}

export type Breadcrumb = {
  href: string;
  label: string;
};

export function Breadcrumbs({ items }: { items: Breadcrumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="il-breadcrumbs">
      <ol>
        {items.map((item, index) => (
          <li key={item.href}>
            {index === items.length - 1 ? (
              <span>{item.label}</span>
            ) : (
              <a href={item.href}>{item.label}</a>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

type CardProps = {
  title: string;
  description: string;
  meta?: string;
  status?: string;
};

function LearningCard({
  description,
  meta,
  status,
  title,
  type
}: CardProps & { type: string }) {
  return (
    <article className="il-learning-card">
      <div>
        <p className="il-card-kicker">{type}</p>
        <h3>{title}</h3>
      </div>
      <p>{description}</p>
      <div className="il-card-meta">
        {meta ? <span>{meta}</span> : null}
        {status ? <Badge tone="warning">{status}</Badge> : null}
      </div>
    </article>
  );
}

export function CourseCard(props: CardProps) {
  return <LearningCard type="Course" {...props} />;
}

export function ModuleCard(props: CardProps) {
  return <LearningCard type="Module" {...props} />;
}

export function LessonCard(props: CardProps) {
  return <LearningCard type="Lesson" {...props} />;
}

export function LearningOutcomePanel({ outcomes }: { outcomes: string[] }) {
  return (
    <section className="il-panel" aria-labelledby="learning-outcomes-title">
      <h3 id="learning-outcomes-title">Learning outcomes</h3>
      <ul>
        {outcomes.map((outcome) => (
          <li key={outcome}>{outcome}</li>
        ))}
      </ul>
    </section>
  );
}

export function EquationPanel({
  children,
  sourceId
}: {
  children: ReactNode;
  sourceId: string;
}) {
  return (
    <section className="il-panel il-equation-panel" aria-label="Equation panel">
      <div>{children}</div>
      <SourceReference sourceId={sourceId} />
    </section>
  );
}

export function WorkedExamplePanel({
  children,
  title
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="il-panel" aria-labelledby="worked-example-title">
      <h3 id="worked-example-title">{title}</h3>
      {children}
    </section>
  );
}

export function SafetyWarning({ children }: { children: ReactNode }) {
  return (
    <Alert title="Safety warning" tone="warning">
      {children}
    </Alert>
  );
}

export function MeasurementDisplay({
  label,
  tone = "normal",
  unit,
  value
}: {
  label: string;
  tone?: Tone;
  unit: string;
  value: string;
}) {
  return (
    <dl className={cx("il-measurement", `il-tone-${tone}`)}>
      <div>
        <dt>{label}</dt>
        <dd>
          <span>{value}</span> <span>{unit}</span>
        </dd>
      </div>
    </dl>
  );
}

export function SimulationControlPanel({
  children,
  title
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section
      className="il-panel il-simulation-panel"
      aria-labelledby="simulation-control-title"
    >
      <h3 id="simulation-control-title">{title}</h3>
      {children}
    </section>
  );
}

export function FaultNotification({ children }: { children: ReactNode }) {
  return (
    <Alert title="Fault state" tone="fault">
      {children}
    </Alert>
  );
}

export function QuizQuestion({
  children,
  prompt
}: {
  children: ReactNode;
  prompt: string;
}) {
  return (
    <fieldset className="il-quiz-question">
      <legend>{prompt}</legend>
      {children}
    </fieldset>
  );
}

export function SourceReference({ sourceId }: { sourceId: string }) {
  return (
    <span className="il-source-reference">
      Source ID: <code>{sourceId}</code>
    </span>
  );
}

export function EngineeringReviewBadge({ status }: { status: string }) {
  return (
    <Badge tone={status === "Approved for student use" ? "normal" : "warning"}>
      {status}
    </Badge>
  );
}
