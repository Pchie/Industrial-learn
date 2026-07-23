import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  CurriculumBreadcrumbs,
  CurriculumHero,
  EmptyState,
  ProgressNotice,
  YearCard
} from "@/features/curriculum/components";
import { getCurriculum, getProgramme } from "@/features/curriculum/data";

type ProgrammePageProps = {
  params: Promise<{ programmeSlug: string }>;
};

export function generateStaticParams() {
  return getCurriculum().schools.flatMap((school) =>
    school.disciplines.flatMap((discipline) =>
      discipline.programmes.map((programme) => ({ programmeSlug: programme.slug }))
    )
  );
}

export async function generateMetadata({
  params
}: ProgrammePageProps): Promise<Metadata> {
  const { programmeSlug } = await params;
  const record = getProgramme(programmeSlug);

  return {
    title: record
      ? `${record.programme.title} | Industrial Learn`
      : "Programme | Industrial Learn"
  };
}

export default async function ProgrammePage({ params }: ProgrammePageProps) {
  const { programmeSlug } = await params;
  const record = getProgramme(programmeSlug);

  if (!record) {
    notFound();
  }

  return (
    <div className="curriculum-page">
      <CurriculumBreadcrumbs
        items={[
          { href: `/learn/${record.school.slug}`, label: record.school.title },
          { href: `/programmes/${record.programme.slug}`, label: record.programme.title }
        ]}
      />
      <CurriculumHero
        description={record.programme.description}
        eyebrow={record.discipline.title}
        title={record.programme.title}
      />
      <ProgressNotice />
      {record.programme.academicYears.length === 0 ? (
        <EmptyState message="No academic years are available for this programme yet." />
      ) : (
        <section className="curriculum-section" aria-labelledby="years-title">
          <div className="section-heading">
            <p className="eyebrow">Browse by academic year</p>
            <h2 id="years-title">Academic years</h2>
          </div>
          <div className="curriculum-grid">
            {record.programme.academicYears.map((year) => (
              <YearCard key={year.id} programme={record.programme} year={year} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
