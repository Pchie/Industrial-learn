import { describe, expect, it } from "vitest";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import {
  LESSON_CONTENT_BLOCK_TYPES,
  LESSON_ENGINE_REQUIRED_SECTIONS,
  REVIEW_STATUSES,
  validateContentSystem
} from "./index";

describe("engineering content system validation", () => {
  it("accepts only approved Industrial Learn review statuses", () => {
    expect(REVIEW_STATUSES).toContain("Source required");
    expect(REVIEW_STATUSES).toContain("Approved for student use");
    expect(REVIEW_STATUSES).not.toContain("Looks fine");
  });

  it("validates source IDs, required lesson sections, review statuses, and equation units", () => {
    const result = validateContentSystem();

    expect(result.errors).toEqual([]);
  });

  it("defines the full reusable lesson engine contract", () => {
    expect(LESSON_ENGINE_REQUIRED_SECTIONS).toEqual([
      "lessonHeader",
      "estimatedCompletionTime",
      "difficulty",
      "prerequisites",
      "learningOutcomes",
      "whyTopicMatters",
      "keyTerminology",
      "visualExplanation",
      "theory",
      "equations",
      "workedExamples",
      "interactiveActivity",
      "faultFindingExercise",
      "safetyConsiderations",
      "knowledgeCheck",
      "summary",
      "sources",
      "nextRecommendedLesson"
    ]);
    expect(LESSON_CONTENT_BLOCK_TYPES).toContain("workedCalculation");
    expect(LESSON_CONTENT_BLOCK_TYPES).toContain("sourceCitation");
  });

  it("clearly flags missing technical evidence for the draft sample source", () => {
    const result = validateContentSystem();

    expect(result.warnings).toContainEqual(
      expect.stringContaining("missing technical evidence approval")
    );
    expect(result.warnings).toContainEqual(
      expect.stringContaining("SRC-FLUID-PRESSURE-PLACEHOLDER-001")
    );
  });

  it("prevents placeholder source records from being approved", () => {
    const workspace = createContentFixture();
    writeJson(join(workspace, "sources/test/source-record.json"), {
      id: "SRC-TEST-PLACEHOLDER-001",
      title: "Placeholder source",
      documentType: "technical reference placeholder",
      citation: "Source required before approval.",
      approvalStatus: "Approved for student use",
      reviewStatus: "Approved for student use",
      evidenceStatus: "approved",
      createdAt: "2026-07-22",
      updatedAt: "2026-07-22"
    });

    const result = validateContentSystem(workspace);

    expect(result.errors).toContainEqual(
      expect.stringContaining(
        "placeholder source SRC-TEST-PLACEHOLDER-001 cannot be approved"
      )
    );
  });

  it("requires approved source evidence before a published lesson can cite it", () => {
    const workspace = createContentFixture();
    writeJson(join(workspace, "sources/test/source-record.json"), {
      id: "SRC-TEST-MISSING-001",
      title: "Missing source",
      documentType: "source-needed record",
      citation: "Missing.",
      approvalStatus: "Source required",
      reviewStatus: "Source required",
      evidenceStatus: "missing",
      createdAt: "2026-07-22",
      updatedAt: "2026-07-22"
    });
    writeJson(join(workspace, "knowledge/test/topic.json"), minimalKnowledgeFile());
    writeJson(join(workspace, "content/lessons/test/published.json"), minimalLesson());

    const result = validateContentSystem(workspace);

    expect(result.errors).toContainEqual(
      expect.stringContaining("published lessons cannot use missing source evidence")
    );
  });

  it("rejects approved equations without source IDs and unverified page references", () => {
    const workspace = createContentFixture();
    writeJson(join(workspace, "sources/test/source-record.json"), {
      id: "SRC-TEST-REAL-001",
      title: "Test real source",
      documentType: "open educational source",
      citation: "Test source with limited metadata.",
      approvalStatus: "Source checked",
      reviewStatus: "Source checked",
      evidenceStatus: "partial",
      relevantPages: [],
      createdAt: "2026-07-22",
      updatedAt: "2026-07-22"
    });
    writeJson(join(workspace, "knowledge/test/topic.json"), {
      ...minimalKnowledgeFile(),
      metadata: {
        ...minimalKnowledgeFile().metadata,
        sourceIds: ["SRC-TEST-REAL-001"]
      },
      definitions: [
        {
          term: "Test",
          meaning: "Test.",
          sourceIds: ["SRC-TEST-REAL-001"]
        }
      ],
      workedExample: {
        ...minimalKnowledgeFile().workedExample,
        sourceIds: ["SRC-TEST-REAL-001"]
      },
      sourceCitations: ["SRC-TEST-REAL-001"],
      sourceReferences: [
        {
          sourceId: "SRC-TEST-REAL-001",
          pages: "12"
        }
      ],
      equations: [
        {
          id: "EQ-TEST-APPROVED-001",
          name: "Approved without source",
          expression: "x = y",
          symbols: ["x", "y"],
          siUnits: { x: "m", y: "m" },
          sourceIds: [],
          reviewStatus: "Approved for student use"
        }
      ]
    });

    const result = validateContentSystem(workspace);

    expect(result.errors).toContainEqual(
      expect.stringContaining(
        "approved equation EQ-TEST-APPROVED-001 requires source IDs"
      )
    );
    expect(result.errors).toContainEqual(
      expect.stringContaining("has no verified source metadata")
    );
  });
});

function createContentFixture() {
  const workspace = mkdtempSync(join(tmpdir(), "industrial-learn-content-"));

  for (const directory of [
    "sources/test",
    "knowledge/test",
    "content/lessons/test",
    "content/assessments",
    "content/projects"
  ]) {
    mkdirSync(join(workspace, directory), { recursive: true });
  }

  return workspace;
}

function writeJson(path: string, value: unknown) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function minimalKnowledgeFile() {
  return {
    metadata: {
      id: "KF-TEST-001",
      slug: "test",
      title: "Test",
      topic: "Test",
      version: "0.1.0",
      sourceIds: ["SRC-TEST-MISSING-001"]
    },
    learningPurpose: "Test.",
    definitions: [
      {
        term: "Test",
        meaning: "Test.",
        sourceIds: ["SRC-TEST-MISSING-001"]
      }
    ],
    governingPrinciples: ["Test."],
    equations: [],
    symbolDefinitions: [],
    siUnits: [],
    assumptions: ["Test."],
    limitations: ["Test."],
    workedExample: {
      id: "WE-TEST-001",
      title: "Test",
      purpose: "Test.",
      given: ["Test."],
      steps: ["Test."],
      answer: "Test.",
      sourceIds: ["SRC-TEST-MISSING-001"],
      reviewStatus: "Source required"
    },
    components: ["Test"],
    normalOperation: ["Test."],
    faultConditions: [],
    safety: [],
    relatedSimulations: [],
    sourceCitations: ["SRC-TEST-MISSING-001"],
    reviewStatus: "Source required"
  };
}

function minimalLesson() {
  const block = {
    id: "BLOCK-TEST-001",
    type: "paragraph",
    text: "Test.",
    sourceIds: ["SRC-TEST-MISSING-001"]
  };

  return {
    id: "LES-TEST-001",
    slug: "test",
    title: "Test",
    publicationStatus: "published",
    reviewStatus: "Approved for student use",
    knowledgeFileIds: ["KF-TEST-001"],
    sourceIds: ["SRC-TEST-MISSING-001"],
    requiredSections: [...LESSON_ENGINE_REQUIRED_SECTIONS],
    sections: Object.fromEntries(
      LESSON_ENGINE_REQUIRED_SECTIONS.map((section) => [
        section,
        { title: section, blocks: [block] }
      ])
    )
  };
}
