import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  CurriculumBreadcrumbs,
  CurriculumHero,
  EmptyState,
  ModuleCard,
  ProgressNotice
} from "@/features/curriculum/components";
import { getCurriculum, getProgramme } from "@/features/curriculum/data";

type ProgrammeYearPageProps = {
  params: Promise<{ programmeSlug: string; year: string }>;
};

export function generateStaticParams() {
  return getCurriculum().schools.flatMap((school) =>
    school.disciplines.flatMap((discipline) =>
      discipline.programmes.flatMap((programme) =>
        programme.academicYears.map((academicYear) => ({
          programmeSlug: programme.slug,
          year: String(academicYear.yearNumber)
        }))
      )
    )
  );
}

export async function generateMetadata({
  params
}: ProgrammeYearPageProps): Promise<Metadata> {
  const { programmeSlug, year } = await params;
  const record = getProgramme(programmeSlug);

  return {
    title: record
      ? `${record.programme.title} Year ${year} | Industrial Learn`
      : "Programme year | Industrial Learn"
  };
}

export default async function ProgrammeYearPage({ params }: ProgrammeYearPageProps) {
  const { programmeSlug, year } = await params;
  const record = getProgramme(programmeSlug);
  const academicYear = record?.programme.academicYears.find(
    (item) => item.yearNumber === Number(year)
  );
  const curriculum = getCurriculum();

  if (!record || !academicYear) {
    notFound();
  }

  return (
    <div className="curriculum-page">
      <CurriculumBreadcrumbs
        items={[
          { href: `/learn/${record.school.slug}`, label: record.school.title },
          { href: `/programmes/${record.programme.slug}`, label: record.programme.title },
          {
            href: `/programmes/${record.programme.slug}/year/${academicYear.yearNumber}`,
            label: academicYear.title
          }
        ]}
      />
      <CurriculumHero
        description={`Browse ${record.programme.title} by semester and module.`}
        eyebrow="Academic year"
        title={academicYear.title}
      />
      <ProgressNotice />
      {academicYear.semesters.length === 0 ? (
        <EmptyState message="No semesters are available for this academic year yet." />
      ) : (
        academicYear.semesters.map((semester) => (
          <section
            className="curriculum-section"
            key={semester.id}
            aria-labelledby={`${semester.id}-title`}
          >
            <div className="section-heading">
              <p className="eyebrow">Semester {semester.semesterNumber}</p>
              <h2 id={`${semester.id}-title`}>{semester.title}</h2>
            </div>
            {semester.modules.length === 0 ? (
              <EmptyState message="No modules are available for this semester yet." />
            ) : (
              <div className="curriculum-grid">
                {semester.modules.map((module) => (
                  <ModuleCard
                    allModules={curriculum.modules}
                    key={module.id}
                    module={module}
                  />
                ))}
              </div>
            )}
          </section>
        ))
      )}
    </div>
  );
}
