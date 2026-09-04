import Link from "next/link";
import {
  Alert,
  Badge,
  Breadcrumbs,
  Button,
  EngineeringReviewBadge
} from "@industrial-learn/design-system";

import type {
  AcademicYear,
  Discipline,
  Module,
  Pathway,
  Programme,
  School
} from "./data";
import { prerequisiteTitles } from "./data";
import type { StructuredLesson } from "../lesson-engine/types";

export function CurriculumHero({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="curriculum-hero" aria-labelledby="curriculum-title">
      <p className="eyebrow">{eyebrow}</p>
      <h1 id="curriculum-title">{title}</h1>
      <p>{description}</p>
    </section>
  );
}

export function ProgressNotice() {
  return (
    <Alert title="Progress" tone="info">
      Progress appears after sign in. This signed-out catalogue does not display
      completion data.
    </Alert>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <section className="curriculum-state" aria-live="polite">
      <h2>No items to show</h2>
      <p>{message}</p>
    </section>
  );
}

export function PublishedLessonSection({
  lessons,
  query,
  searchable = false
}: {
  lessons: StructuredLesson[];
  query?: string;
  searchable?: boolean;
}) {
  return (
    <section className="curriculum-section" aria-labelledby="published-lessons-title">
      <div className="section-heading">
        <p className="eyebrow">Approved and published</p>
        <h2 id="published-lessons-title">Student lessons</h2>
        <p>Only exact versions that passed review and publication checks appear here.</p>
      </div>

      {searchable ? (
        <form action="/learn" className="curriculum-search" role="search">
          <label htmlFor="lesson-search">Search published lessons</label>
          <div>
            <input
              defaultValue={query}
              id="lesson-search"
              name="q"
              placeholder="Search by topic or lesson name"
              type="search"
            />
            <Button type="submit">Search</Button>
            {query ? (
              <Link className="curriculum-search__clear" href="/learn">
                Clear
              </Link>
            ) : null}
          </div>
        </form>
      ) : null}

      {lessons.length > 0 ? (
        <div className="curriculum-grid">
          {lessons.map((lesson) => (
            <article className="curriculum-card" key={lesson.id}>
              <div className="curriculum-card__topline">
                <p className="il-card-kicker">Lesson</p>
                <Badge tone="normal">Published</Badge>
              </div>
              <h3>{lesson.title}</h3>
              <p>{lesson.description}</p>
              <dl className="curriculum-meta">
                <div>
                  <dt>Difficulty</dt>
                  <dd>{lesson.difficulty}</dd>
                </div>
                <div>
                  <dt>Duration</dt>
                  <dd>{lesson.estimatedCompletionTime}</dd>
                </div>
              </dl>
              <EngineeringReviewBadge status={lesson.reviewStatus} />
              <Link className="curriculum-action" href={`/lessons/${lesson.slug}`}>
                Start lesson
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="curriculum-search-empty" aria-live="polite">
          <h3>No published lessons found</h3>
          <p>
            {query
              ? `No published lesson matches “${query}”.`
              : "No reviewed lesson is published in this area yet."}
          </p>
        </div>
      )}
    </section>
  );
}

export function CurriculumBreadcrumbs({
  items
}: {
  items: Array<{ href: string; label: string }>;
}) {
  return <Breadcrumbs items={[{ href: "/learn", label: "Learn" }, ...items]} />;
}

export function BrowseNav({
  schools,
  pathways
}: {
  schools: School[];
  pathways: Pathway[];
}) {
  return (
    <details className="curriculum-mobile-nav">
      <summary>Browse curriculum</summary>
      <nav aria-label="Curriculum browse navigation">
        <Link href="/learn">All learning</Link>
        {schools.map((school) => (
          <Link href={`/learn/${school.slug}`} key={school.id}>
            {school.title}
          </Link>
        ))}
        {pathways.map((pathway) => (
          <Link href={`/pathways/${pathway.slug}`} key={pathway.id}>
            {pathway.title}
          </Link>
        ))}
      </nav>
    </details>
  );
}

export function SchoolCard({ school }: { school: School }) {
  return (
    <article className="curriculum-card">
      <div>
        <p className="il-card-kicker">School</p>
        <h2>{school.title}</h2>
      </div>
      <p>{school.description}</p>
      <Link className="curriculum-action" href={`/learn/${school.slug}`}>
        Browse {school.title}
      </Link>
    </article>
  );
}

export function DisciplineSection({ discipline }: { discipline: Discipline }) {
  return (
    <section className="curriculum-section" aria-labelledby={`${discipline.slug}-title`}>
      <div className="section-heading">
        <p className="eyebrow">Discipline</p>
        <h2 id={`${discipline.slug}-title`}>{discipline.title}</h2>
        <p>{discipline.description}</p>
      </div>
      <div className="curriculum-grid">
        {discipline.programmes.map((programme) => (
          <ProgrammeCard key={programme.id} programme={programme} />
        ))}
      </div>
    </section>
  );
}

export function ProgrammeCard({ programme }: { programme: Programme }) {
  return (
    <article className="curriculum-card">
      <div>
        <p className="il-card-kicker">Programme</p>
        <h3>{programme.title}</h3>
      </div>
      <p>{programme.description}</p>
      <p>{programme.academicYears.length} academic year group</p>
      <Link className="curriculum-action" href={`/programmes/${programme.slug}`}>
        View programme
      </Link>
    </article>
  );
}

export function YearCard({
  programme,
  year
}: {
  programme: Programme;
  year: AcademicYear;
}) {
  const moduleCount = year.semesters.reduce(
    (count, semester) => count + semester.modules.length,
    0
  );

  return (
    <article className="curriculum-card">
      <div>
        <p className="il-card-kicker">Academic year</p>
        <h3>{year.title}</h3>
      </div>
      <p>
        {year.semesters.length} semester group, {moduleCount} modules
      </p>
      <Link
        className="curriculum-action"
        href={`/programmes/${programme.slug}/year/${year.yearNumber}`}
      >
        Browse year {year.yearNumber}
      </Link>
    </article>
  );
}

export function ModuleCard({
  module,
  allModules
}: {
  module: Module;
  allModules: Module[];
}) {
  const isAvailable = module.prerequisites.length === 0;
  const prerequisites = prerequisiteTitles(module.prerequisites, allModules);

  return (
    <article className="curriculum-card">
      <div className="curriculum-card__topline">
        <p className="il-card-kicker">Module</p>
        <Badge tone={isAvailable ? "normal" : "warning"}>
          {isAvailable ? "Available" : "Prerequisites required"}
        </Badge>
      </div>
      <h3>{module.title}</h3>
      <p>{module.description}</p>
      <dl className="curriculum-meta">
        <div>
          <dt>Difficulty</dt>
          <dd>{module.difficulty}</dd>
        </div>
        <div>
          <dt>Duration</dt>
          <dd>{module.estimatedDuration}</dd>
        </div>
        <div>
          <dt>Academic level</dt>
          <dd>{module.academicLevel}</dd>
        </div>
      </dl>
      <PrerequisiteList items={prerequisites} />
      <EngineeringReviewBadge status={module.technicalReviewStatus} />
      <Link className="curriculum-action" href={`/modules/${module.slug}`}>
        View module
      </Link>
    </article>
  );
}

export function LessonList({ module }: { module: Module }) {
  return (
    <div className="curriculum-list">
      {module.units.flatMap((unit) =>
        unit.lessons.map((lesson) => {
          const isAvailable = lesson.prerequisites.length === 0;

          return (
            <article className="lesson-row" key={lesson.id}>
              <div>
                <p className="il-card-kicker">{unit.title}</p>
                <h3>{lesson.title}</h3>
                <p>{lesson.description}</p>
                <p>{lesson.estimatedDuration}</p>
              </div>
              <div className="lesson-row__status">
                <Badge tone={isAvailable ? "normal" : "warning"}>
                  {isAvailable ? "Available lesson" : "Locked lesson"}
                </Badge>
                {lesson.prerequisites.length > 0 ? (
                  <p>Requires: {lesson.prerequisites.join(", ")}</p>
                ) : (
                  <p>Next step: begin with this lesson when lesson pages are built.</p>
                )}
              </div>
            </article>
          );
        })
      )}
    </div>
  );
}

export function PathwayCard({ pathway }: { pathway: Pathway }) {
  return (
    <article className="curriculum-card">
      <div>
        <p className="il-card-kicker">Career pathway</p>
        <h3>{pathway.title}</h3>
      </div>
      <p>{pathway.description}</p>
      <EngineeringReviewBadge status={pathway.technicalReviewStatus} />
      <Link className="curriculum-action" href={`/pathways/${pathway.slug}`}>
        View pathway
      </Link>
    </article>
  );
}

export function PrerequisiteList({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <p className="curriculum-available">No prerequisites listed.</p>;
  }

  return (
    <div>
      <p className="curriculum-prerequisite-title">Prerequisites</p>
      <ul className="curriculum-prerequisites">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export function DifficultyIndex({ modules }: { modules: Module[] }) {
  const difficulties = Array.from(
    new Set(modules.map((module) => module.difficulty))
  ).sort();

  return (
    <section className="curriculum-section" aria-labelledby="difficulty-title">
      <div className="section-heading">
        <p className="eyebrow">Browse by difficulty</p>
        <h2 id="difficulty-title">Difficulty index</h2>
      </div>
      <div className="curriculum-chip-list">
        {difficulties.map((difficulty) => (
          <a href={`#difficulty-${difficulty}`} key={difficulty}>
            {difficulty}
          </a>
        ))}
      </div>
      {difficulties.map((difficulty) => (
        <section id={`difficulty-${difficulty}`} key={difficulty}>
          <h3>{difficulty}</h3>
          <ul>
            {modules
              .filter((module) => module.difficulty === difficulty)
              .map((module) => (
                <li key={module.id}>
                  <Link href={`/modules/${module.slug}`}>{module.title}</Link>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </section>
  );
}
