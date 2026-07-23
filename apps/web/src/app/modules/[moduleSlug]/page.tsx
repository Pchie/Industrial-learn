import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  CurriculumBreadcrumbs,
  CurriculumHero,
  LessonList,
  PrerequisiteList,
  ProgressNotice
} from "@/features/curriculum/components";
import { getCurriculum, getModule, prerequisiteTitles } from "@/features/curriculum/data";
import { EngineeringReviewBadge } from "@industrial-learn/design-system";

type ModulePageProps = {
  params: Promise<{ moduleSlug: string }>;
};

export function generateStaticParams() {
  return getCurriculum().modules.map((module) => ({ moduleSlug: module.slug }));
}

export async function generateMetadata({ params }: ModulePageProps): Promise<Metadata> {
  const { moduleSlug } = await params;
  const record = getModule(moduleSlug);

  return {
    title: record
      ? `${record.module.title} | Industrial Learn`
      : "Module | Industrial Learn"
  };
}

export default async function ModulePage({ params }: ModulePageProps) {
  const { moduleSlug } = await params;
  const record = getModule(moduleSlug);
  const curriculum = getCurriculum();

  if (!record) {
    notFound();
  }

  const prerequisites = prerequisiteTitles(
    record.module.prerequisites,
    curriculum.modules
  );

  return (
    <div className="curriculum-page">
      <CurriculumBreadcrumbs
        items={[
          { href: `/learn/${record.school.slug}`, label: record.school.title },
          { href: `/programmes/${record.programme.slug}`, label: record.programme.title },
          {
            href: `/programmes/${record.programme.slug}/year/${record.academicYear.yearNumber}`,
            label: record.academicYear.title
          },
          { href: `/modules/${record.module.slug}`, label: record.module.title }
        ]}
      />
      <CurriculumHero
        description={record.module.description}
        eyebrow={`${record.discipline.title} / ${record.semester.title}`}
        title={record.module.title}
      />
      <ProgressNotice />
      <section className="curriculum-section" aria-labelledby="module-summary-title">
        <div className="section-heading">
          <p className="eyebrow">Module summary</p>
          <h2 id="module-summary-title">What students can see now</h2>
        </div>
        <dl className="curriculum-meta curriculum-meta--wide">
          <div>
            <dt>Difficulty</dt>
            <dd>{record.module.difficulty}</dd>
          </div>
          <div>
            <dt>Duration</dt>
            <dd>{record.module.estimatedDuration}</dd>
          </div>
          <div>
            <dt>Academic level</dt>
            <dd>{record.module.academicLevel}</dd>
          </div>
          <div>
            <dt>Publication</dt>
            <dd>{record.module.publicationStatus}</dd>
          </div>
        </dl>
        <PrerequisiteList items={prerequisites} />
        <EngineeringReviewBadge status={record.module.technicalReviewStatus} />
      </section>
      <section className="curriculum-section" aria-labelledby="lessons-title">
        <div className="section-heading">
          <p className="eyebrow">Lessons</p>
          <h2 id="lessons-title">Available and locked lessons</h2>
          <p>Lesson content and simulations are not built in this task.</p>
        </div>
        <LessonList module={record.module} />
      </section>
    </div>
  );
}
