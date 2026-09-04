import { describe, expect, it } from "vitest";
import type {
  StaticReviewRequirement,
  StaticTechnicalReviewRecord
} from "@industrial-learn/content-review-workflow/static-review-record";

import {
  evaluateCurriculumPublication,
  getCurriculum,
  getInternalCurriculum
} from "../curriculum/data";
import {
  evaluateLessonPublication,
  getInternalLessonBySlug,
  getPublicLessonBySlug,
  getPublicLessons,
  searchPublicLessons
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

  it("registers both academic sources used by Basic Fluid Pressure", () => {
    const records = getStaticSourceRecordsById([
      "SRC-OPENSTAX-COLLEGE-PHYSICS-2012",
      "SRC-PSU-CIMBALA-PRESSURE-BASICS"
    ]);

    expect(records.map((record) => record.id).sort()).toEqual([
      "SRC-OPENSTAX-COLLEGE-PHYSICS-2012",
      "SRC-PSU-CIMBALA-PRESSURE-BASICS"
    ]);
    expect(records.every((record) => record.evidenceStatus === "approved")).toBe(true);
  });

  it("allows a synthetic current, approved and published lesson", () => {
    const lesson = approvedLesson();

    expect(
      evaluateLessonPublication(lesson, {
        audience: "student",
        reviewRecords: approvedLessonReviewRecords(lesson)
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
          reviewRecords: approvedLessonReviewRecords(lesson)
        }).visible
      ).toBe(false);
    }
  );

  it("denies approved unpublished, published unapproved, old and metadata-incomplete lessons", () => {
    const approved = approvedLesson();
    expect(
      evaluateLessonPublication(approvedLesson({ publicationStatus: "internal" }), {
        audience: "public",
        reviewRecords: approvedLessonReviewRecords(approved)
      }).visible
    ).toBe(false);
    expect(
      evaluateLessonPublication(approvedLesson({ reviewStatus: "Source required" }), {
        audience: "student",
        reviewRecords: approvedLessonReviewRecords(approved)
      }).visible
    ).toBe(false);
    expect(
      evaluateLessonPublication(approved, {
        audience: "student",
        reviewRecords: approvedLessonReviewRecords(approved).map((record) => ({
          ...record,
          entityVersion: "0.9.0"
        }))
      }).visible
    ).toBe(false);
    expect(
      evaluateLessonPublication(approved, {
        audience: "student",
        reviewRecords: []
      }).visible
    ).toBe(false);
  });

  it("publishes only the exact approved Basic Fluid Pressure lesson", () => {
    expect(getPublicLessons().map((lesson) => lesson.slug)).toEqual([
      "basic-fluid-pressure"
    ]);
    expect(getPublicLessonBySlug("basic-fluid-pressure")?.version).toBe("0.4.0");

    for (const slug of [
      "pump-system-units-and-measurements",
      "hydraulic-cylinder-force",
      "bernoulli-flow-lab",
      "systems-surroundings-boundaries"
    ]) {
      expect(getPublicLessonBySlug(slug)).toBeUndefined();
    }
  });

  it("searches only the publication-gated lesson set", () => {
    expect(searchPublicLessons("pressure").map((lesson) => lesson.slug)).toEqual([
      "basic-fluid-pressure"
    ]);
    expect(searchPublicLessons("hydraulic cylinder")).toEqual([]);
    expect(searchPublicLessons("SRC-NASA-GLENN-BERNOULLI")).toEqual([]);
  });

  it("rejects self-approval and incomplete review packages", () => {
    const lesson = approvedLesson();
    const reviews = approvedLessonReviewRecords(lesson);

    expect(
      evaluateLessonPublication(lesson, {
        audience: "student",
        reviewRecords: reviews.map((record) => ({
          ...record,
          reviewerId: lesson.authorProfileId!
        }))
      }).visible
    ).toBe(false);
    expect(
      evaluateLessonPublication(lesson, {
        audience: "student",
        reviewRecords: reviews.filter(
          (record) => record.reviewType !== "engineering_approval"
        )
      }).visible
    ).toBe(false);
  });

  it("requires explicit internal authorization for draft lesson lookup", () => {
    expect(
      getInternalLessonBySlug({
        slug: "hydraulic-cylinder-force",
        audience: "content_author",
        access: {}
      })
    ).toBeUndefined();
    expect(
      getInternalLessonBySlug({
        slug: "hydraulic-cylinder-force",
        audience: "content_author",
        access: { contentAuthorAuthorized: true }
      })?.slug
    ).toBe("hydraulic-cylinder-force");
    expect(
      getInternalLessonBySlug({
        slug: "hydraulic-cylinder-force",
        audience: "engineering_reviewer",
        access: { reviewerAuthorized: true }
      })?.slug
    ).toBe("hydraulic-cylinder-force");
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
    authorProfileId: "author-basic-fluid-pressure",
    sourceIds: [approvedSourceId],
    ...overrides
  };
}

function approvedLessonReviewRecords(
  lesson: StructuredLesson
): StaticTechnicalReviewRecord[] {
  if (!lesson.authorProfileId) {
    throw new Error("Approved lesson fixture requires an author identity.");
  }

  const reviewTypes: StaticReviewRequirement[] = [
    "source",
    "educational_structure",
    ...(lesson.equationIds?.length ? (["equation"] as const) : []),
    ...(lesson.simulationIds?.length ? (["simulation"] as const) : []),
    "safety",
    "engineering_approval",
    "publication_authorization"
  ];

  return reviewTypes.map((reviewType, index) => ({
    schemaVersion: "1.0.0",
    id: `REV-LESSON-TEST-${index + 1}`,
    entityId: lesson.id,
    entityType: "lesson",
    entityVersion: lesson.version,
    authorId: lesson.authorProfileId!,
    reviewerId: `reviewer-${reviewType}`,
    reviewerName: `Reviewer ${reviewType}`,
    reviewerRole:
      reviewType === "educational_structure"
        ? "lecturer"
        : reviewType === "publication_authorization"
          ? "administrator"
          : "engineering_reviewer",
    reviewType,
    decision: "approved",
    reviewStatus:
      reviewType === "engineering_approval" || reviewType === "publication_authorization"
        ? "Approved for student use"
        : "Engineering review required",
    notes: `Test approval for ${reviewType}.`,
    evidenceChecked:
      reviewType === "publication_authorization"
        ? {
            exact_version_verified: true,
            approval_record_verified: true,
            artifact_hash_verified: true,
            staging_only: true
          }
        : { reviewComplete: true },
    sourceIdsChecked: reviewType === "source" ? [...lesson.sourceIds] : [],
    equationIdsChecked: reviewType === "equation" ? [...(lesson.equationIds ?? [])] : [],
    simulationTestIdsChecked: reviewType === "simulation" ? ["SIM-TEST-CASE-001"] : [],
    safetyReviewOutcome: reviewType === "safety" ? "passed" : "not_applicable",
    reviewedAt: "2026-08-30T12:00:00.000Z"
  }));
}
