import { describe, expect, it } from "vitest";

import {
  evaluateCurriculumPublication,
  getCurriculum,
  getInternalCurriculum
} from "../curriculum/data";
import {
  evaluateLessonPublication,
  getInternalLessonBySlug,
  getPublicLessonBySlug,
  getPublicLessons
} from "../lesson-engine/data";
import { projectLessonForPublicDelivery } from "../lesson-engine/visual-experience-registry";
import type { StructuredLesson } from "../lesson-engine/types";
import {
  evaluateSimulationCatalogVisibility,
  evaluateSimulationPublicationRecords,
  getPublicSimulationCatalog,
  simulationRegistry
} from "../simulations/catalog";
import { getStaticSourceRecordsById } from "./source-records";
import {
  aggregateSourceEvidence,
  evaluateStaticPublicationVisibility
} from "./static-publication";

const approvedSourceId = "SRC-OPENSTAX-COLLEGE-PHYSICS-2012";

describe("application publication enforcement", () => {
  it("aggregates source evidence without treating missing records as approved", () => {
    expect(
      aggregateSourceEvidence(
        [approvedSourceId],
        getStaticSourceRecordsById([approvedSourceId])
      )
    ).toBe("approved");
    expect(aggregateSourceEvidence(["SRC-NOT-REGISTERED"], [])).toBe("missing");
    expect(
      aggregateSourceEvidence(
        [approvedSourceId, "SRC-PARTIAL"],
        [
          ...getStaticSourceRecordsById([approvedSourceId]),
          { id: "SRC-PARTIAL", evidenceStatus: "partial" }
        ]
      )
    ).toBe("partial");
  });

  it("allows a synthetic current, approved and published lesson", () => {
    const lesson = approvedLesson();

    expect(
      evaluateLessonPublication(lesson, {
        audience: "student",
        authority: { currentVersion: lesson.version, publishedVersion: lesson.version }
      })
    ).toMatchObject({ visible: true, scope: "public" });
  });

  it.each([
    ["draft", "Approved for student use"],
    ["published", "Source required"],
    ["published", "Source checked"],
    ["published", "Equation checked"],
    ["published", "Simulation checked"],
    ["published", "Engineering review required"],
    ["archived", "Approved for student use"]
  ] as const)(
    "denies lesson publication=%s review=%s",
    (publicationStatus, reviewStatus) => {
      const lesson = approvedLesson({ publicationStatus, reviewStatus });
      expect(
        evaluateLessonPublication(lesson, {
          audience: "student",
          authority: { currentVersion: lesson.version, publishedVersion: lesson.version }
        }).visible
      ).toBe(false);
    }
  );

  it("denies approved unpublished, published unapproved, old and metadata-incomplete lessons", () => {
    const approved = approvedLesson();
    expect(
      evaluateLessonPublication(approvedLesson({ publicationStatus: "internal" }), {
        audience: "public",
        authority: {
          currentVersion: approved.version,
          publishedVersion: approved.version
        }
      }).visible
    ).toBe(false);
    expect(
      evaluateLessonPublication(approvedLesson({ reviewStatus: "Source required" }), {
        audience: "student",
        authority: {
          currentVersion: approved.version,
          publishedVersion: approved.version
        }
      }).visible
    ).toBe(false);
    expect(
      evaluateLessonPublication(approved, {
        audience: "student",
        authority: { currentVersion: "2.0.0", publishedVersion: "0.9.0" }
      }).visible
    ).toBe(false);
    expect(evaluateLessonPublication(approved, { audience: "student" }).visible).toBe(
      false
    );
  });

  it("keeps every current structured lesson out of public lookup and static enumeration", () => {
    expect(getPublicLessons()).toEqual([]);
    for (const slug of [
      "basic-fluid-pressure",
      "pump-system-units-and-measurements",
      "hydraulic-cylinder-force",
      "bernoulli-flow-lab",
      "systems-surroundings-boundaries"
    ]) {
      expect(getPublicLessonBySlug(slug)).toBeUndefined();
    }
  });

  it("requires explicit internal authorization for draft lesson lookup", () => {
    expect(
      getInternalLessonBySlug({
        slug: "basic-fluid-pressure",
        audience: "content_author",
        access: {}
      })
    ).toBeUndefined();
    expect(
      getInternalLessonBySlug({
        slug: "basic-fluid-pressure",
        audience: "content_author",
        access: { contentAuthorAuthorized: true }
      })?.slug
    ).toBe("basic-fluid-pressure");
    expect(
      getInternalLessonBySlug({
        slug: "basic-fluid-pressure",
        audience: "engineering_reviewer",
        access: { reviewerAuthorized: true }
      })?.slug
    ).toBe("basic-fluid-pressure");
  });

  it("filters draft modules, lessons, pathways and prerequisite edges from curriculum", () => {
    const internal = getInternalCurriculum();
    const publicCurriculum = getCurriculum();

    expect(internal.modules.length).toBeGreaterThan(0);
    expect(internal.pathways.length).toBeGreaterThan(0);
    expect(publicCurriculum.modules).toEqual([]);
    expect(publicCurriculum.pathways).toEqual([]);
    expect(publicCurriculum.prerequisiteEdges).toEqual([]);
    expect(
      publicCurriculum.schools.flatMap((school) =>
        school.disciplines.flatMap((discipline) =>
          discipline.programmes.flatMap((programme) =>
            programme.academicYears.flatMap((year) =>
              year.semesters.flatMap((semester) => semester.modules)
            )
          )
        )
      )
    ).toEqual([]);
  });

  it("can admit a synthetic approved curriculum record only with version evidence", () => {
    const module = getInternalCurriculum().modules[0]!;
    const candidate = {
      ...module,
      publicationStatus: "published",
      technicalReviewStatus: "Approved for student use",
      sourceIds: [approvedSourceId]
    };

    expect(evaluateCurriculumPublication(candidate).visible).toBe(false);
    expect(
      evaluateCurriculumPublication(candidate, {
        currentVersion: candidate.version,
        publishedVersion: candidate.version
      }).visible
    ).toBe(true);
  });

  it("does not let intended availability bypass simulation governance", () => {
    expect(simulationRegistry[0]?.intendedAvailability).toBe("available");
    expect(evaluateSimulationCatalogVisibility(simulationRegistry[0]!).visible).toBe(
      false
    );
    expect(getPublicSimulationCatalog()).toEqual([]);
  });

  it("allows a synthetic simulation only when simulation and parent gates both pass", () => {
    const base = simulationRegistry[0]!;
    const entry = {
      ...base,
      publicationStatus: "published",
      reviewStatus: "Approved for student use"
    };
    const parentLesson = {
      id: "LES-APPROVED-PARENT",
      publicationStatus: "published",
      reviewStatus: "Approved for student use",
      version: "1.0.0",
      sourceIds: entry.definition.sourceIds
    };
    const authorities = {
      parentLesson: { currentVersion: "1.0.0", publishedVersion: "1.0.0" },
      simulation: { currentVersion: entry.version, publishedVersion: entry.version }
    };

    expect(
      evaluateSimulationPublicationRecords({ entry, parentLesson, authorities })
    ).toMatchObject({ visible: true, scope: "public" });
    expect(
      evaluateSimulationPublicationRecords({
        entry: { ...entry, reviewStatus: "Engineering review required" },
        parentLesson,
        authorities
      }).visible
    ).toBe(false);
    expect(
      evaluateSimulationPublicationRecords({
        entry,
        parentLesson: { ...parentLesson, reviewStatus: "Source required" },
        authorities
      }).visible
    ).toBe(false);
  });

  it("requires explicit reviewer authorization for an internal simulation", () => {
    const entry = simulationRegistry[0]!;
    const parentLesson = {
      id: "LES-INTERNAL-PARENT",
      publicationStatus: "internal",
      reviewStatus: "Engineering review required",
      version: "1.0.0",
      sourceIds: entry.definition.sourceIds
    };

    expect(
      evaluateSimulationPublicationRecords({
        entry,
        parentLesson,
        audience: "engineering_reviewer"
      }).visible
    ).toBe(false);
    expect(
      evaluateSimulationPublicationRecords({
        entry,
        parentLesson,
        audience: "engineering_reviewer",
        access: { reviewerAuthorized: true }
      })
    ).toMatchObject({ visible: true, scope: "internal" });
    expect(
      evaluateSimulationPublicationRecords({
        entry,
        parentLesson,
        audience: "student",
        access: { reviewerAuthorized: true }
      }).visible
    ).toBe(false);
  });

  it("removes hidden embedded simulations from a public lesson projection", () => {
    const lesson = getInternalLessonBySlug({
      slug: "hydraulic-cylinder-force",
      audience: "administrator",
      access: { administratorAuthorized: true }
    });
    expect(lesson).toBeDefined();

    const projected = projectLessonForPublicDelivery(lesson!);
    expect(projected.simulationIds).toEqual([]);
    expect(
      Object.values(projected.sections)
        .flatMap((section) => section.blocks)
        .some((block) =>
          ["heroSimulation", "linkedSchematic", "faultChallenge"].includes(block.type)
        )
    ).toBe(false);
  });

  it("fails closed when a static status value is invalid at runtime", () => {
    expect(
      evaluateStaticPublicationVisibility({
        audience: "public",
        record: {
          publicationStatus: "visible",
          reviewStatus: "Approved for student use",
          version: "1.0.0",
          sourceIds: [approvedSourceId]
        },
        sourceRecords: getStaticSourceRecordsById([approvedSourceId]),
        authority: { currentVersion: "1.0.0", publishedVersion: "1.0.0" }
      })
    ).toMatchObject({ visible: false, reason: "invalid-publication-status" });
  });
});

function approvedLesson(overrides: Partial<StructuredLesson> = {}): StructuredLesson {
  const base = getInternalLessonBySlug({
    slug: "basic-fluid-pressure",
    audience: "administrator",
    access: { administratorAuthorized: true }
  });
  if (!base) {
    throw new Error("Internal lesson fixture is unavailable.");
  }

  return {
    ...base,
    publicationStatus: "published",
    reviewStatus: "Approved for student use",
    sourceIds: [approvedSourceId],
    ...overrides
  };
}
