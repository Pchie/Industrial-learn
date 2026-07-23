import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  CurriculumBreadcrumbs,
  CurriculumHero,
  ModuleCard,
  ProgressNotice
} from "@/features/curriculum/components";
import { getCurriculum, getPathway } from "@/features/curriculum/data";
import { EngineeringReviewBadge } from "@industrial-learn/design-system";

type PathwayPageProps = {
  params: Promise<{ pathwaySlug: string }>;
};

export function generateStaticParams() {
  return getCurriculum().pathways.map((pathway) => ({ pathwaySlug: pathway.slug }));
}

export async function generateMetadata({ params }: PathwayPageProps): Promise<Metadata> {
  const { pathwaySlug } = await params;
  const record = getPathway(pathwaySlug);

  return {
    title: record
      ? `${record.pathway.title} | Industrial Learn`
      : "Pathway | Industrial Learn"
  };
}

export default async function PathwayPage({ params }: PathwayPageProps) {
  const { pathwaySlug } = await params;
  const record = getPathway(pathwaySlug);
  const curriculum = getCurriculum();

  if (!record) {
    notFound();
  }

  return (
    <div className="curriculum-page">
      <CurriculumBreadcrumbs
        items={[
          { href: `/pathways/${record.pathway.slug}`, label: record.pathway.title }
        ]}
      />
      <CurriculumHero
        description={record.pathway.description}
        eyebrow="Career pathway"
        title={record.pathway.title}
      />
      <ProgressNotice />
      <section className="curriculum-section" aria-labelledby="pathway-outcomes-title">
        <div className="section-heading">
          <p className="eyebrow">Practice outcomes</p>
          <h2 id="pathway-outcomes-title">Professional direction</h2>
        </div>
        <ul className="capability-list">
          {record.pathway.practiceOutcomes.map((outcome) => (
            <li key={outcome}>{outcome}</li>
          ))}
        </ul>
        <EngineeringReviewBadge status={record.pathway.technicalReviewStatus} />
      </section>
      <section className="curriculum-section" aria-labelledby="pathway-core-title">
        <div className="section-heading">
          <p className="eyebrow">Core prerequisites</p>
          <h2 id="pathway-core-title">Core Engineering foundations</h2>
        </div>
        <div className="curriculum-grid">
          {record.coreModules.map((module) => (
            <ModuleCard allModules={curriculum.modules} key={module.id} module={module} />
          ))}
        </div>
      </section>
      <section className="curriculum-section" aria-labelledby="pathway-future-title">
        <div className="section-heading">
          <p className="eyebrow">Future pathway</p>
          <h2 id="pathway-future-title">Future Engineering modules</h2>
        </div>
        <div className="curriculum-grid">
          {record.futureModules.map((module) => (
            <ModuleCard allModules={curriculum.modules} key={module.id} module={module} />
          ))}
        </div>
      </section>
    </div>
  );
}
