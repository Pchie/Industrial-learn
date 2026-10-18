import Link from "next/link";
import { ArrowRight, BookOpen, Compass, FlaskConical } from "lucide-react";
import { getPublicLessons } from "@/features/lesson-engine/data";
import { getCurriculum } from "@/features/curriculum/data";
import { PublishedLessonSection, SchoolCard } from "@/features/curriculum/components";
import { ImageBand, PageHeading, PageLink } from "@/features/page-layout/components";
import { BasicFluidPressureScene } from "@/features/basic-fluid-pressure-lesson/basic-fluid-pressure-scene";
import {
  BASIC_PRESSURE_LIMITS,
  createBasicPressureLessonModel
} from "@/features/basic-fluid-pressure-lesson/model";

export default function HomePage() {
  const lessons = getPublicLessons();
  const pressure = lessons.find((lesson) => lesson.slug === "basic-fluid-pressure");
  const model = createBasicPressureLessonModel({
    forceN: BASIC_PRESSURE_LIMITS.forceN.defaultValue,
    areaM2: BASIC_PRESSURE_LIMITS.areaM2.defaultValue
  });
  return (
    <div className="page-stack home-workbench">
      <PageHeading
        title="Industrial Learn"
        description="Explore a concept. Test your understanding. Build your engineering foundations."
        eyebrow="Your engineering workspace"
      />
      {pressure ? (
        <ImageBand
          image="pressureScene"
          title={pressure.title}
          description={pressure.description}
          eyebrow="Start learning"
          priority
        >
          <PageLink href={`/lessons/${pressure.slug}`}>Open lesson</PageLink>
          <Link href="/learn/pilot">View learning path</Link>
        </ImageBand>
      ) : null}
      <nav className="home-destinations" aria-label="Start learning">
        <Link href="/learn/pilot">
          <BookOpen aria-hidden="true" />
          <span>Fluid Engineering Pilot</span>
          <ArrowRight aria-hidden="true" />
        </Link>
        <Link href="/simulations">
          <FlaskConical aria-hidden="true" />
          <span>Simulation Lab</span>
          <ArrowRight aria-hidden="true" />
        </Link>
        <Link href="/workspace">
          <Compass aria-hidden="true" />
          <span>My workspace</span>
          <ArrowRight aria-hidden="true" />
        </Link>
      </nav>
      {pressure ? (
        <details className="home-feature home-visual-preview">
          <summary>Preview the pressure model</summary>
          <BasicFluidPressureScene
            {...model.input}
            contactSideLength={model.contactSideLength}
            forceVectorLength={model.forceVectorLength}
            pressureIntensity={model.pressureIntensity}
            pressureKPa={model.pressureDisplayConversion?.calculatedValue ?? 0}
          />
        </details>
      ) : null}
      <PublishedLessonSection lessons={lessons} />
      <section className="curriculum-section" aria-labelledby="schools-title">
        <div className="section-heading">
          <h2 id="schools-title">Two connected schools</h2>
        </div>
        <div className="curriculum-grid">
          {getCurriculum().schools.map((school) => (
            <SchoolCard key={school.id} school={school} />
          ))}
        </div>
      </section>
    </div>
  );
}
