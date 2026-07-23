import type { Metadata } from "next";

import {
  BrowseNav,
  CurriculumHero,
  DifficultyIndex,
  PathwayCard,
  ProgressNotice,
  SchoolCard
} from "@/features/curriculum/components";
import { getCurriculum } from "@/features/curriculum/data";

export const metadata: Metadata = {
  title: "Learn | Industrial Learn",
  description: "Browse Industrial Learn curriculum by school, difficulty, and pathway."
};

export default function LearnPage() {
  const curriculum = getCurriculum();

  return (
    <div className="curriculum-page">
      <BrowseNav pathways={curriculum.pathways} schools={curriculum.schools} />
      <CurriculumHero
        description="Browse Core Engineering and Future Engineering using the real curriculum seed data."
        eyebrow="Learning catalogue"
        title="Browse Industrial Learn"
      />
      <ProgressNotice />

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
