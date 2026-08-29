import { describe, expect, it } from "vitest";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import {
  LESSON_CONTENT_BLOCK_TYPES,
  LESSON_ENGINE_REQUIRED_SECTIONS,
  REVIEW_STATUSES,
  VISUAL_LESSON_TYPES,
  VISUAL_LESSON_TYPE_REQUIREMENTS,
  VISUAL_LESSON_STAGE_IDS,
  validateContentSystem
} from "./index";

type VerifiedSourceFixture = {
  title: string;
  author: string;
  organisation: string;
  version: string;
  publicationDate: string;
  evidenceStatus: string;
  reviewStatus: string;
  independentHumanReviewRequired: boolean;
  verification: { documentOpened: boolean; metadataVerified: boolean };
  relevantSections: string[];
  limitations: string[];
  filePath: string | null;
  accessMode: string;
  url: string;
  rights?: { metadataOnly?: boolean };
};

type KnowledgeFixture = {
  metadata: { sourceIds: string[] };
  sourceReferences: unknown[];
  reviewStatus: string;
  equations: Array<{
    sourceIds: string[];
    symbols: string[];
    siUnits: Record<string, string>;
  }>;
};

type LessonFixture = {
  publicationStatus: string;
  reviewStatus: string;
  equationIds: string[];
};

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

  it("records verified metadata for the first real engineering sources", () => {
    const sources = [
      readWorkspaceJson<VerifiedSourceFixture>(
        "sources/fluid-pressure/openstax-college-physics.json"
      ),
      readWorkspaceJson<VerifiedSourceFixture>(
        "sources/hydraulics/parker-140h8-cylinder.json"
      ),
      readWorkspaceJson<VerifiedSourceFixture>(
        "sources/hydraulics/caterpillar-boom-cylinder-6040431.json"
      ),
      readWorkspaceJson<VerifiedSourceFixture>(
        "sources/smart-pump-systems/nist-sp-330-2019.json"
      ),
      readWorkspaceJson<VerifiedSourceFixture>(
        "sources/smart-pump-systems/doe-pump-sourcebook-2006.json"
      ),
      readWorkspaceJson<VerifiedSourceFixture>(
        "sources/thermodynamics/purdue-me200-definitions-2021.json"
      )
    ];

    for (const source of sources) {
      expect(source.evidenceStatus).toBe("approved");
      expect(source.reviewStatus).toBe("Source checked");
      expect(source.verification).toMatchObject({
        documentOpened: true,
        metadataVerified: true
      });
      expect(source.independentHumanReviewRequired).toBe(true);
      expect(source.relevantSections.length).toBeGreaterThan(0);
      expect(source.limitations.length).toBeGreaterThan(0);
    }

    expect(sources[0]).toMatchObject({
      title: "College Physics",
      author: "Paul Peter Urone and Roger Hinrichs",
      organisation: "OpenStax, Rice University"
    });
    expect(sources[1]).toMatchObject({
      version: "Catalog HY08-T1151-1/NA",
      organisation: "Taiyo America, a Parker Hannifin company"
    });
    expect(sources[2]).toMatchObject({
      organisation: "Caterpillar Inc.",
      version: "Page accessed 2026-08-27"
    });
    expect(sources[3]).toMatchObject({
      version: "NIST Special Publication 330-2019",
      publicationDate: "2019-08-20"
    });
    expect(sources[5]).toMatchObject({
      author: "Carl Wassgren",
      organisation: "Purdue University School of Mechanical Engineering"
    });
  });

  it("requires a verified local file or rights-controlled metadata-only source", () => {
    const sourceFiles = [
      "sources/fluid-pressure/openstax-college-physics.json",
      "sources/hydraulics/parker-140h8-cylinder.json",
      "sources/hydraulics/caterpillar-boom-cylinder-6040431.json",
      "sources/smart-pump-systems/nist-sp-330-2019.json",
      "sources/smart-pump-systems/doe-pump-sourcebook-2006.json",
      "sources/thermodynamics/purdue-me200-definitions-2021.json"
    ];

    for (const sourceFile of sourceFiles) {
      expect(existsSync(join(process.cwd(), sourceFile))).toBe(true);
      const source = readWorkspaceJson<VerifiedSourceFixture>(sourceFile);
      const hasLocalFile =
        typeof source.filePath === "string" &&
        existsSync(join(process.cwd(), source.filePath));
      const hasMetadataOnlyEvidence =
        source.accessMode === "metadata-only" &&
        source.rights?.metadataOnly === true &&
        typeof source.url === "string" &&
        source.url.startsWith("https://");

      expect(hasLocalFile || hasMetadataOnlyEvidence).toBe(true);
    }
  });

  it("keeps the four focused knowledge files source-linked and within size policy", () => {
    const knowledgeFiles = [
      "knowledge/fluid-mechanics/pressure-fundamentals.json",
      "knowledge/hydraulics/hydraulic-cylinder-force.json",
      "knowledge/smart-pump-systems/si-units-and-measurement.json",
      "knowledge/thermodynamics/systems-surroundings-boundaries.json"
    ];

    for (const knowledgeFile of knowledgeFiles) {
      const text = readFileSync(join(process.cwd(), knowledgeFile), "utf8");
      const knowledge = JSON.parse(text) as KnowledgeFixture;

      expect(text.length).toBeLessThanOrEqual(18_000);
      expect(knowledge.metadata.sourceIds.length).toBeGreaterThan(0);
      expect(knowledge.sourceReferences.length).toBeGreaterThan(0);
      expect(knowledge.reviewStatus).not.toBe("Approved for student use");

      for (const equation of knowledge.equations) {
        expect(equation.sourceIds.length).toBeGreaterThan(0);
        for (const symbol of equation.symbols) {
          expect(equation.siUnits[symbol]).toEqual(expect.any(String));
        }
      }
    }
  });

  it("keeps the first thermodynamics lesson draft and free of invented property data", () => {
    const lesson = readWorkspaceJson<LessonFixture>(
      "content/lessons/thermodynamics/systems-surroundings-boundaries.json"
    );
    const serialized = JSON.stringify(lesson);

    expect(lesson.publicationStatus).toBe("draft");
    expect(lesson.reviewStatus).toBe("Engineering review required");
    expect(lesson.equationIds).toEqual([]);
    expect(serialized).not.toMatch(/steam\s+table/i);
    expect(serialized).not.toMatch(/refrigerant\s+(?:table|data)/i);
    expect(serialized).not.toMatch(/(?:enthalpy|entropy|specific volume)\s*=\s*\d/i);
    expect(serialized).not.toMatch(/"propertyData"|"propertyTables"/);
  });

  it("keeps the hydraulic visual pilot internal, review-gated, and extension-only", () => {
    const lesson = readWorkspaceJson<
      LessonFixture & {
        experienceModel: string;
        lessonType: string;
        visualStandardVersion: string;
        simulationIds: string[];
        relatedAssessmentIds: string[];
        experienceSequence: Array<{
          stage: string;
          blocks: Array<{ type: string; simulationId?: string }>;
        }>;
      }
    >("content/lessons/hydraulics/hydraulic-cylinder-force.json");
    const serialized = JSON.stringify(lesson);

    expect(lesson.publicationStatus).toBe("internal");
    expect(lesson.reviewStatus).toBe("Engineering review required");
    expect(lesson.experienceModel).toBe("visual-v2");
    expect(lesson.lessonType).toBe("phenomenon");
    expect(lesson.visualStandardVersion).toBe("1.0.0");
    expect(lesson.simulationIds).toEqual(["SIM-HYD-CYL-FORCE-001"]);
    expect(lesson.relatedAssessmentIds).toEqual(["ASM-FLUID-PRESSURE-001"]);
    expect(lesson.experienceSequence[0]?.stage).toBe("heroExperience");
    expect(lesson.experienceSequence[0]?.blocks[0]).toMatchObject({
      type: "heroSimulation",
      simulationId: "SIM-HYD-CYL-FORCE-001"
    });
    expect(serialized).not.toContain('"type":"faultChallenge"');
    expect(serialized).not.toMatch(/rod-side.*calculation is implemented/i);
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
    expect(LESSON_CONTENT_BLOCK_TYPES).toContain("heroSimulation");
    expect(LESSON_CONTENT_BLOCK_TYPES).toContain("liveEquation");
    expect(LESSON_CONTENT_BLOCK_TYPES).toContain("linkedSchematic");
    expect(VISUAL_LESSON_STAGE_IDS).toContain("heroExperience");
    expect(VISUAL_LESSON_STAGE_IDS).toContain("deepDive");
    expect(VISUAL_LESSON_TYPES).toEqual([
      "phenomenon",
      "component",
      "system",
      "calculation",
      "diagnostic",
      "design"
    ]);
    expect(VISUAL_LESSON_TYPE_REQUIREMENTS.phenomenon).toContain("microTheory");
  });

  it("accepts a valid optional visual-v2 experience while legacy sections remain valid", () => {
    const workspace = createContentFixture();
    writeJson(
      join(workspace, "sources/test/source-record.json"),
      missingEvidenceSourceRecord()
    );
    writeJson(join(workspace, "knowledge/test/topic.json"), minimalKnowledgeFile());
    writeJson(join(workspace, "content/lessons/test/visual.json"), {
      ...minimalLesson(),
      publicationStatus: "draft",
      reviewStatus: "Source required",
      schemaVersion: "2.0.0",
      experienceModel: "visual-v2",
      lessonType: "phenomenon",
      visualStandardVersion: "1.0.0",
      visualMetadata: visualMetadata(),
      experienceSequence: [
        {
          stage: "heroExperience",
          title: "See the demonstration",
          blocks: [visualHeroBlock(), visualObservationBlock(), visualMicroTheoryBlock()]
        }
      ]
    });

    const result = validateContentSystem(workspace);

    expect(result.errors).toEqual([]);
  });

  it("rejects malformed visual simulation references and missing accessibility metadata", () => {
    const workspace = createContentFixture();
    writeJson(
      join(workspace, "sources/test/source-record.json"),
      missingEvidenceSourceRecord()
    );
    writeJson(join(workspace, "knowledge/test/topic.json"), minimalKnowledgeFile());
    writeJson(join(workspace, "content/lessons/test/visual-invalid.json"), {
      ...minimalLesson(),
      publicationStatus: "draft",
      reviewStatus: "Source required",
      schemaVersion: "2.0.0",
      experienceModel: "visual-v2",
      lessonType: "phenomenon",
      visualStandardVersion: "1.0.0",
      visualMetadata: visualMetadata(),
      experienceSequence: [
        {
          stage: "heroExperience",
          title: "Invalid visual",
          blocks: [
            {
              ...visualHeroBlock(),
              simulationId: "not-a-simulation-id",
              accessibility: undefined
            }
          ]
        }
      ]
    });

    const result = validateContentSystem(workspace);

    expect(result.errors).toContainEqual(
      expect.stringContaining("requires accessibility metadata")
    );
    expect(result.errors).toContainEqual(
      expect.stringContaining("malformed simulationId")
    );
  });

  it("enforces category blocks, first-screen presence, and optional Deep Dive", () => {
    const workspace = createContentFixture();
    writeJson(
      join(workspace, "sources/test/source-record.json"),
      missingEvidenceSourceRecord()
    );
    writeJson(join(workspace, "knowledge/test/topic.json"), minimalKnowledgeFile());
    writeJson(join(workspace, "content/lessons/test/component.json"), {
      ...minimalLesson(),
      publicationStatus: "draft",
      reviewStatus: "Source required",
      schemaVersion: "3.0.0",
      experienceModel: "visual-v2",
      lessonType: "component",
      visualStandardVersion: "1.0.0",
      visualMetadata: visualMetadata({ primaryVisualBlockId: "BLOCK-NOT-HERE" }),
      experienceSequence: [
        {
          stage: "explore",
          title: "Explore",
          blocks: [visualHeroBlock()]
        }
      ]
    });

    const result = validateContentSystem(workspace);

    expect(result.errors).toContainEqual(
      expect.stringContaining("component lessons require a componentCutaway block")
    );
    expect(result.errors).toContainEqual(
      expect.stringContaining("heroExperience first stage")
    );
    expect(result.errors).toContainEqual(
      expect.stringContaining("first-screen primary visual")
    );
    expect(result.errors.join("\n")).not.toContain("deepDive");
  });

  it("validates simulation input and output metadata", () => {
    const workspace = createContentFixture();
    writeJson(
      join(workspace, "sources/test/source-record.json"),
      missingEvidenceSourceRecord()
    );
    writeJson(join(workspace, "knowledge/test/topic.json"), minimalKnowledgeFile());
    const metadata = visualMetadata();
    metadata.inputs[0]!.step = 0;
    metadata.inputs[0]!.default = 99;
    metadata.outputs[0]!.measurementSource = "";
    metadata.outputs[0]!.validityState = "confident";
    writeJson(join(workspace, "content/lessons/test/metadata.json"), {
      ...minimalLesson(),
      publicationStatus: "draft",
      reviewStatus: "Source required",
      schemaVersion: "3.0.0",
      experienceModel: "visual-v2",
      lessonType: "phenomenon",
      visualStandardVersion: "1.0.0",
      visualMetadata: metadata,
      experienceSequence: [
        {
          stage: "heroExperience",
          title: "See",
          blocks: [visualHeroBlock(), visualObservationBlock(), visualMicroTheoryBlock()]
        }
      ]
    });

    const result = validateContentSystem(workspace);

    expect(result.errors).toContainEqual(expect.stringContaining("step must be greater"));
    expect(result.errors).toContainEqual(
      expect.stringContaining("default must be inside")
    );
    expect(result.errors).toContainEqual(
      expect.stringContaining("requires measurementSource")
    );
    expect(result.errors).toContainEqual(
      expect.stringContaining("requires a valid validityState")
    );
  });

  it("requires complete reusable challenge metadata", () => {
    const workspace = createContentFixture();
    writeJson(
      join(workspace, "sources/test/source-record.json"),
      missingEvidenceSourceRecord()
    );
    writeJson(join(workspace, "knowledge/test/topic.json"), minimalKnowledgeFile());
    writeJson(join(workspace, "content/lessons/test/challenge.json"), {
      ...minimalLesson(),
      publicationStatus: "draft",
      reviewStatus: "Source required",
      schemaVersion: "3.0.0",
      experienceModel: "visual-v2",
      lessonType: "phenomenon",
      visualStandardVersion: "1.0.0",
      visualMetadata: visualMetadata(),
      experienceSequence: [
        {
          stage: "heroExperience",
          title: "See",
          blocks: [
            visualHeroBlock(),
            visualObservationBlock(),
            visualMicroTheoryBlock(),
            {
              ...visualHeroBlock(),
              id: "BLOCK-CHALLENGE-001",
              type: "engineeringChallenge",
              simulationId: undefined,
              mode: undefined,
              challengeId: "CH-TEST-001",
              pattern: "target",
              goal: "",
              allowedActions: [],
              successCondition: "",
              feedback: {}
            }
          ]
        }
      ]
    });

    const result = validateContentSystem(workspace);

    expect(result.errors).toContainEqual(expect.stringContaining("requires goal"));
    expect(result.errors).toContainEqual(
      expect.stringContaining("requires allowedActions")
    );
    expect(result.errors).toContainEqual(
      expect.stringContaining("feedback requires onSuccess")
    );
  });

  it("keeps existing linear lessons compatible without visual metadata", () => {
    const workspace = createContentFixture();
    writeJson(
      join(workspace, "sources/test/source-record.json"),
      missingEvidenceSourceRecord()
    );
    writeJson(join(workspace, "knowledge/test/topic.json"), minimalKnowledgeFile());
    writeJson(join(workspace, "content/lessons/test/linear.json"), {
      ...minimalLesson(),
      publicationStatus: "draft",
      reviewStatus: "Source required",
      experienceModel: "linear-v1"
    });

    const result = validateContentSystem(workspace);

    expect(result.errors).toEqual([]);
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

  it("rejects approved evidence with missing metadata or a missing local file", () => {
    const missingMetadataWorkspace = createContentFixture();
    writeJson(
      join(missingMetadataWorkspace, "sources/test/source-record.json"),
      approvedSourceRecord({ author: "" })
    );

    const missingMetadataResult = validateContentSystem(missingMetadataWorkspace);
    expect(missingMetadataResult.errors).toContainEqual(
      expect.stringContaining("requires author")
    );

    const missingFileWorkspace = createContentFixture();
    writeJson(
      join(missingFileWorkspace, "sources/test/source-record.json"),
      approvedSourceRecord({
        accessMode: "local-file",
        filePath: "sources/test/not-present.pdf",
        url: undefined,
        rights: {
          permittedInternalUse: "Internal validation only.",
          metadataOnly: false
        }
      })
    );

    const missingFileResult = validateContentSystem(missingFileWorkspace);
    expect(missingFileResult.errors).toContainEqual(
      expect.stringContaining("approved source file")
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

function readWorkspaceJson<T>(path: string) {
  return JSON.parse(readFileSync(join(process.cwd(), path), "utf8")) as T;
}

function approvedSourceRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: "SRC-TEST-REAL-001",
    title: "Verified test source",
    author: "Test Author",
    organisation: "Test Organisation",
    version: "1",
    publicationDate: "2026-01-01",
    accessDate: "2026-08-26",
    documentType: "verified technical source",
    copyrightStatus: "Test-only fixture",
    reliabilityLevel: 3,
    citation: "Test citation.",
    approvalStatus: "Source checked",
    reviewStatus: "Source checked",
    evidenceStatus: "approved",
    accessMode: "metadata-only",
    filePath: null,
    url: "https://example.com/source",
    rights: {
      permittedInternalUse: "Internal validation only.",
      metadataOnly: true
    },
    reviewer: "Test Reviewer",
    reviewDate: "2026-08-26",
    verification: {
      documentOpened: true,
      metadataVerified: true
    },
    relevantSections: ["Test section"],
    relevantPages: ["1"],
    limitations: ["Test fixture only."],
    ...overrides
  };
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

function missingEvidenceSourceRecord() {
  return {
    id: "SRC-TEST-MISSING-001",
    title: "Missing source",
    documentType: "source-needed record",
    citation: "Missing.",
    approvalStatus: "Source required",
    reviewStatus: "Source required",
    evidenceStatus: "missing",
    createdAt: "2026-07-22",
    updatedAt: "2026-07-22"
  };
}

function visualHeroBlock() {
  return {
    id: "BLOCK-VISUAL-001",
    type: "heroSimulation",
    title: "Demonstration simulation",
    description: "A validated visual content fixture.",
    simulationId: "SIM-TEST-001",
    mode: "demonstration",
    sourceIds: ["SRC-TEST-MISSING-001"],
    reviewStatus: "Source required",
    accessibility: {
      label: "Demonstration simulation",
      textAlternative: "A text alternative for the visual state.",
      keyboardInstructions: "Use the labelled controls.",
      reducedMotionFallback: "Use stepped static states."
    }
  };
}

function visualObservationBlock() {
  return {
    ...visualHeroBlock(),
    id: "BLOCK-OBSERVE-001",
    type: "observationQuestion",
    simulationId: undefined,
    mode: undefined,
    prompt: "What changes?",
    graded: false
  };
}

function visualMicroTheoryBlock() {
  return {
    ...visualHeroBlock(),
    id: "BLOCK-MICRO-001",
    type: "microTheory",
    simulationId: undefined,
    mode: undefined,
    principle: "One concise principle."
  };
}

function visualMetadata(firstScreenOverrides: Record<string, unknown> = {}) {
  return {
    firstScreen: {
      purpose: "Change the input and observe the output.",
      primaryVisualBlockId: "BLOCK-VISUAL-001",
      primaryControlIds: ["input-one"],
      ...firstScreenOverrides
    },
    progression: ["see", "play", "calculate"],
    inputs: [
      {
        id: "input-one",
        label: "Input",
        quantity: "pressure",
        unit: "MPa",
        internalUnit: "Pa",
        default: 5,
        minimum: 1,
        maximum: 10,
        step: 1,
        validation: "Reject non-finite values and values outside the declared range.",
        modelValidityRange: { minimum: 1, maximum: 10 },
        accessibilityLabel: "Input in megapascals",
        educationalDescription: "Controls the example input."
      }
    ],
    outputs: [
      {
        id: "output-one",
        label: "Output",
        quantity: "force",
        unit: "kN",
        internalUnit: "N",
        interpretation: "Shows the calculated response.",
        validityState: "valid",
        measurementSource: "SIM-TEST-001 output state"
      }
    ]
  };
}
