import { describe, expect, it } from "vitest";
import {
  createContentGovernanceServices,
  type Caller,
  type ContentGovernanceRepositories,
  type ContentGovernanceRepository,
  type ContentGovernanceTransactionRunner,
  type GovernanceAuditInput,
  type GovernanceItem,
  type GovernanceReviewRecord,
  type GovernanceVersion
} from "./index";
import type { StructuredLessonContent } from "@industrial-learn/content-review-workflow";
import type { DataAccessRole } from "./domain";

const authorId = "11111111-1111-4111-8111-111111111111";
const reviewerId = "22222222-2222-4222-8222-222222222222";
const lecturerId = "33333333-3333-4333-8333-333333333333";
const adminId = "44444444-4444-4444-8444-444444444444";
const studentId = "55555555-5555-4555-8555-555555555555";

const content: StructuredLessonContent = {
  title: "Fluid pressure",
  description: "Structured lesson draft.",
  sections: {
    lessonHeader: { blocks: [] }
  }
};

function caller(profileId: string, roles: DataAccessRole[]): Caller {
  return {
    kind: "authenticated",
    principal: {
      profileId,
      authUserId: profileId,
      email: `${profileId}@example.test`,
      roles
    }
  };
}

function createHarness() {
  const items = new Map<string, GovernanceItem>();
  const versions = new Map<string, GovernanceVersion>();
  const reviews: GovernanceReviewRecord[] = [];
  const audit: GovernanceAuditInput[] = [];
  let historicalReferences = 0;

  const repository: ContentGovernanceRepository = {
    createItem(input) {
      items.set(input.item.id, input.item);
      versions.set(
        versionKey(input.version.governanceItemId, input.version.version),
        input.version
      );
      return Promise.resolve(input.item);
    },
    getItem(itemId) {
      return Promise.resolve(items.get(itemId) ?? null);
    },
    listDraftsForActor(actorProfileId) {
      return Promise.resolve(
        Array.from(items.values()).filter(
          (item) =>
            item.authorProfileId === actorProfileId ||
            item.workflowStatus === "Engineering review required" ||
            item.workflowStatus === "Revision required"
        )
      );
    },
    listReviewQueue() {
      return Promise.resolve(
        Array.from(items.values()).filter(
          (item) => item.workflowStatus === "Engineering review required"
        )
      );
    },
    updateItem(item) {
      items.set(item.id, item);
      return Promise.resolve(item);
    },
    createVersion(version) {
      versions.set(versionKey(version.governanceItemId, version.version), version);
      return Promise.resolve(version);
    },
    getVersion(input) {
      return Promise.resolve(
        versions.get(versionKey(input.itemId, input.version)) ?? null
      );
    },
    listVersions(itemId) {
      return Promise.resolve(
        Array.from(versions.values()).filter(
          (version) => version.governanceItemId === itemId
        )
      );
    },
    createReviewRecord(record) {
      reviews.push(record);
      return Promise.resolve(record);
    },
    listReviewRecords(itemId) {
      return Promise.resolve(
        reviews.filter((review) => review.governanceItemId === itemId)
      );
    },
    recordAudit(input) {
      audit.push(Object.freeze({ ...input }));
      return Promise.resolve();
    },
    historicalAssessmentReferences() {
      return Promise.resolve(historicalReferences);
    }
  };

  const transactions: ContentGovernanceTransactionRunner = {
    async transaction(operation) {
      const itemSnapshot = new Map(items);
      const versionSnapshot = new Map(versions);
      const reviewSnapshot = [...reviews];
      const auditSnapshot = [...audit];
      try {
        return await operation();
      } catch (error) {
        items.clear();
        for (const [key, value] of itemSnapshot) {
          items.set(key, value);
        }
        versions.clear();
        for (const [key, value] of versionSnapshot) {
          versions.set(key, value);
        }
        reviews.splice(0, reviews.length, ...reviewSnapshot);
        audit.splice(0, audit.length, ...auditSnapshot);
        throw error;
      }
    }
  };

  const repositories: ContentGovernanceRepositories = {
    content: repository,
    transactions
  };

  return {
    repositories,
    items,
    versions,
    reviews,
    audit,
    setHistoricalReferences(value: number) {
      historicalReferences = value;
    }
  };
}

describe("content governance persistence", () => {
  it("creates drafts, edits versions, and attaches sources", async () => {
    const harness = createHarness();
    const services = createContentGovernanceServices(harness.repositories);

    const draft = await services.createDraft(
      { caller: caller(authorId, ["content_author"]) },
      {
        entityType: "calculation_lesson",
        slug: "fluid-pressure",
        title: "Fluid pressure",
        content
      }
    );
    const edited = await services.editDraft(
      { caller: caller(authorId, ["content_author"]) },
      {
        itemId: draft.id,
        content: { ...content, description: "Updated." },
        changeSummary: "Added worked calculation."
      }
    );
    const sourced = await services.addSourceReferences(
      { caller: caller(authorId, ["content_author"]) },
      {
        itemId: edited.id,
        sourceIds: ["SRC-FLUID-PRESSURE-PLACEHOLDER-001"]
      }
    );

    expect(sourced.workflowStatus).toBe("Source checked");
    expect(harness.versions.get(versionKey(draft.id, 2))?.previousVersion).toBe(1);
    expect(harness.audit.map((event) => event.action)).toContain(
      "content.sources.attached"
    );
  });

  it("blocks students, lecturer engineering approval, and author self-approval", async () => {
    const harness = createHarness();
    const services = createContentGovernanceServices(harness.repositories);

    await expect(
      services.createDraft(
        { caller: caller(studentId, ["student"]) },
        {
          entityType: "theory_lesson",
          slug: "blocked",
          title: "Blocked",
          content
        }
      )
    ).rejects.toMatchObject({ code: "access_denied" });

    const item = await publishableItem(harness.repositories);

    await expect(
      services.recordReview(
        { caller: caller(lecturerId, ["lecturer"]) },
        {
          itemId: item.id,
          reviewType: "engineering_approval",
          decision: "approved",
          comments: "Looks fine."
        }
      )
    ).rejects.toMatchObject({ code: "access_denied" });

    await expect(
      services.recordReview(
        { caller: caller(authorId, ["content_author", "engineering_reviewer"]) },
        {
          itemId: item.id,
          reviewType: "engineering_approval",
          decision: "approved",
          comments: "My own content."
        }
      )
    ).rejects.toMatchObject({ code: "access_denied" });
  });

  it("enforces publication gates and publishes when required evidence exists", async () => {
    const harness = createHarness();
    const services = createContentGovernanceServices(harness.repositories);
    const draft = await services.createDraft(
      { caller: caller(authorId, ["content_author"]) },
      {
        entityType: "simulation_lesson",
        slug: "hydraulic-cylinder-force",
        title: "Hydraulic cylinder force",
        content
      }
    );

    await expect(
      services.publish(
        { caller: caller(adminId, ["administrator"]) },
        { itemId: draft.id }
      )
    ).rejects.toThrow("Valid source IDs are required");

    await services.addSourceReferences(
      { caller: caller(authorId, ["content_author"]) },
      { itemId: draft.id, sourceIds: ["SRC-FLUID-PRESSURE-PLACEHOLDER-001"] }
    );
    await services.submitForReview(
      { caller: caller(authorId, ["content_author"]) },
      { itemId: draft.id }
    );
    for (const reviewType of [
      "equation",
      "simulation",
      "safety",
      "engineering_approval"
    ] as const) {
      await services.recordReview(
        { caller: caller(reviewerId, ["engineering_reviewer"]) },
        {
          itemId: draft.id,
          reviewType,
          decision: "approved",
          comments: `${reviewType} checked.`,
          equationIdsChecked: reviewType === "equation" ? ["EQ-FLUID-PRESSURE-001"] : [],
          simulationTestIdsChecked:
            reviewType === "simulation" ? ["normal-state", "boundary-state"] : [],
          safetyReviewOutcome: reviewType === "safety" ? "passed" : undefined
        }
      );
    }

    const published = await services.publish(
      { caller: caller(adminId, ["administrator"]) },
      { itemId: draft.id }
    );

    expect(published.workflowStatus).toBe("Published");
    expect(published.publicationStatus).toBe("published");
    expect(published.publishedVersion).toBe(1);
  });

  it("supports request changes, resubmit, rollback and archive without deleting history", async () => {
    const harness = createHarness();
    const services = createContentGovernanceServices(harness.repositories);
    const item = await publishableItem(harness.repositories);
    await services.recordReview(
      { caller: caller(reviewerId, ["engineering_reviewer"]) },
      {
        itemId: item.id,
        reviewType: "engineering_approval",
        decision: "changes_requested",
        comments: "Clarify assumptions."
      }
    );
    expect(harness.items.get(item.id)?.workflowStatus).toBe("Revision required");

    await services.submitForReview(
      { caller: caller(authorId, ["content_author"]) },
      { itemId: item.id }
    );
    await services.recordReview(
      { caller: caller(reviewerId, ["engineering_reviewer"]) },
      {
        itemId: item.id,
        reviewType: "engineering_approval",
        decision: "approved",
        comments: "Approved."
      }
    );
    await services.publish(
      { caller: caller(adminId, ["administrator"]) },
      { itemId: item.id }
    );

    const edited = await services.editDraft(
      { caller: caller(adminId, ["administrator"]) },
      {
        itemId: item.id,
        content: { ...content, description: "Second published version." },
        changeSummary: "Second version.",
        sourceIds: ["SRC-FLUID-PRESSURE-PLACEHOLDER-001"]
      }
    );
    const version2 = harness.versions.get(versionKey(item.id, edited.currentVersion));
    if (!version2) {
      throw new Error("Expected version 2.");
    }
    harness.versions.set(versionKey(item.id, 2), {
      ...version2,
      publicationStatus: "published",
      publishedAt: "2026-07-22T00:00:00.000Z"
    });
    harness.items.set(item.id, {
      ...edited,
      publishedVersion: 2,
      publicationStatus: "published",
      workflowStatus: "Published"
    });
    harness.setHistoricalReferences(3);

    const rolledBack = await services.rollback(
      { caller: caller(adminId, ["administrator"]) },
      { itemId: item.id, targetVersion: 1, reason: "Regression found." }
    );
    const archived = await services.archive(
      { caller: caller(adminId, ["administrator"]) },
      { itemId: item.id, reason: "Retired." }
    );

    expect(rolledBack.publishedVersion).toBe(1);
    expect(archived.workflowStatus).toBe("Archived");
    expect(harness.versions.get(versionKey(item.id, 2))).toBeDefined();
    expect(harness.audit.at(-2)?.metadata?.preservedHistoricalReferences).toBe(3);
  });

  it("keeps audit append-oriented for normal authors", async () => {
    const harness = createHarness();
    const services = createContentGovernanceServices(harness.repositories);
    await services.createDraft(
      { caller: caller(authorId, ["content_author"]) },
      {
        entityType: "professional_development",
        slug: "professional-practice",
        title: "Professional practice",
        content
      }
    );

    expect(() => {
      harness.audit[0] = {
        actorProfileId: authorId,
        action: "tampered",
        entityId: "tampered"
      };
    }).not.toThrow();
    expect(harness.audit[0]?.action).toBe("tampered");
    await expect(
      services.recordReview(
        { caller: caller(authorId, ["content_author"]) },
        {
          itemId: "professional-practice",
          reviewType: "educational_structure",
          decision: "approved",
          comments: "Trying to mutate governance."
        }
      )
    ).rejects.toMatchObject({ code: "access_denied" });
  });
});

async function publishableItem(repositories: ContentGovernanceRepositories) {
  const services = createContentGovernanceServices(repositories);
  const draft = await services.createDraft(
    { caller: caller(authorId, ["content_author"]) },
    {
      entityType: "calculation_lesson",
      slug: `fluid-pressure-${Math.random().toString(16).slice(2)}`,
      title: "Fluid pressure",
      content
    }
  );
  await services.addSourceReferences(
    { caller: caller(authorId, ["content_author"]) },
    { itemId: draft.id, sourceIds: ["SRC-FLUID-PRESSURE-PLACEHOLDER-001"] }
  );
  await services.recordReview(
    { caller: caller(reviewerId, ["engineering_reviewer"]) },
    {
      itemId: draft.id,
      reviewType: "equation",
      decision: "approved",
      comments: "Equation checked.",
      equationIdsChecked: ["EQ-FLUID-PRESSURE-001"]
    }
  );
  await services.recordReview(
    { caller: caller(reviewerId, ["engineering_reviewer"]) },
    {
      itemId: draft.id,
      reviewType: "safety",
      decision: "approved",
      comments: "Safety checked.",
      safetyReviewOutcome: "passed"
    }
  );
  return draft;
}

function versionKey(itemId: string, version: number) {
  return `${itemId}:v${version}`;
}
