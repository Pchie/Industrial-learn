import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  BrowseNav,
  CurriculumBreadcrumbs,
  CurriculumHero,
  DisciplineSection,
  EmptyState,
  ProgressNotice,
  PublishedLessonSection
} from "@/features/curriculum/components";
import { getCurriculum, getSchool } from "@/features/curriculum/data";
import { getPublicLessons } from "@/features/lesson-engine/data";

export const metadata: Metadata = {
  title: "Core Engineering | Industrial Learn"
};

export default function CoreEngineeringPage() {
  const curriculum = getCurriculum();
  const school = getSchool("core-engineering");

  if (!school) {
    notFound();
  }

  return (
    <div className="curriculum-page">
      <BrowseNav pathways={curriculum.pathways} schools={curriculum.schools} />
      <CurriculumBreadcrumbs
        items={[{ href: "/learn/core-engineering", label: school.title }]}
      />
      <CurriculumHero
        description={school.description}
        eyebrow="School"
        title={school.title}
      />
      <ProgressNotice />
      <PublishedLessonSection lessons={getPublicLessons()} />
      {school.disciplines.length === 0 ? (
        <EmptyState message="No Core Engineering disciplines are available yet." />
      ) : (
        school.disciplines.map((discipline) => (
          <DisciplineSection discipline={discipline} key={discipline.id} />
        ))
      )}
    </div>
  );
}
