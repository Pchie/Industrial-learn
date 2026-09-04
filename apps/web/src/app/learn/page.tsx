import type { Metadata } from "next";
import Link from "next/link";

import {
  BrowseNav,
  CurriculumHero,
  DifficultyIndex,
  PathwayCard,
  ProgressNotice,
  PublishedLessonSection,
  SchoolCard
} from "@/features/curriculum/components";
import { getCurriculum } from "@/features/curriculum/data";
import { searchPublicLessons } from "@/features/lesson-engine/data";

export const metadata: Metadata = {
  title: "Learn | Industrial Learn",
  description: "Browse Industrial Learn curriculum by school, difficulty, and pathway."
};

type LearnPageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

export default async function LearnPage({ searchParams }: LearnPageProps) {
  const curriculum = getCurriculum();
  const rawQuery = (await searchParams).q;
  const query = Array.isArray(rawQuery) ? (rawQuery[0] ?? "") : (rawQuery ?? "");
  const lessons = searchPublicLessons(query);

  return (
    <div className="curriculum-page">
      <BrowseNav pathways={curriculum.pathways} schools={curriculum.schools} />
      <CurriculumHero
        description="Browse Core Engineering and Future Engineering using the real curriculum seed data."
        eyebrow="Learning catalogue"
        title="Browse Industrial Learn"
      />
      <ProgressNotice />

      <section className="curriculum-section" aria-labelledby="pilot-path-title">
        <div className="section-heading">
          <p className="eyebrow">Controlled pilot</p>
          <h2 id="pilot-path-title">Fluid Engineering Pilot</h2>
          <p>A short path containing only independently approved, published content.</p>
        </div>
        <Link className="curriculum-action" href="/learn/pilot">
          Open pilot learning path
        </Link>
      </section>

      <PublishedLessonSection lessons={lessons} query={query} searchable />

      <section className="curriculum-section" aria-labelledby="schools-title">
        <div className="section-heading">
          <p className="eyebrow">Browse by school</p>
          <h2 id="schools-title">Core and Future Engineering</h2>
        </div>
        <div className="curriculum-grid">
          {curriculum.schools.map((school) => (
            <SchoolCard key={school.id} school={school} />
          ))}
        </div>
      </section>

      <DifficultyIndex modules={curriculum.modules} />

      <section className="curriculum-section" aria-labelledby="pathways-title">
        <div className="section-heading">
          <p className="eyebrow">Browse by career pathway</p>
          <h2 id="pathways-title">Professional directions</h2>
        </div>
        <div className="curriculum-grid">
          {curriculum.pathways.map((pathway) => (
            <PathwayCard key={pathway.id} pathway={pathway} />
          ))}
        </div>
      </section>
    </div>
  );
}
