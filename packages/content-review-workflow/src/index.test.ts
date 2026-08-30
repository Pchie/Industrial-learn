import { describe, expect, it } from "vitest";

import {
  addApprovedSourceReferences,
  addReviewerComments,
  approveOrRejectContent,
  createDraftLesson,
  editStructuredLessonContent,
  publishApprovedContent,
  recordSafetyReview,
  recordSimulationTests,
  requestChanges,
  reviewEquations,
  rollBackPublication,
  viewAuditLog,
  viewRevisionHistory,
  type LessonWorkflowRecord,
  type StructuredLessonContent,
  type WorkflowActor
} from "./index";

const author: WorkflowActor = {
  id: "author-1",
  displayName: "Author One",
  roles: ["content_author"]
};
const lecturer: WorkflowActor = {
  id: "lecturer-1",
  displayName: "Lecturer One",
  roles: ["lecturer"]
};
const reviewer: WorkflowActor = {
  id: "reviewer-1",
  displayName: "Reviewer One",
  roles: ["engineering_reviewer"]
};
const admin: WorkflowActor = {
  id: "admin-1",
  displayName: "Admin One",
  roles: ["administrator"]
};
const owner: WorkflowActor = {
  id: "owner-1",
  displayName: "Platform Owner",
  roles: ["platform_owner"]
};
const reviewerAuthor: WorkflowActor = {
  id: "author-1",
  displayName: "Author Reviewer",
  roles: ["content_author", "engineering_reviewer"]
};

const now = "2026-07-21T18:00:00.000Z";

const draftContent: StructuredLessonContent = {
  title: "Basic Fluid Pressure",
  description: "Draft structured lesson.",
  sections: {
    lessonHeader: { blocks: [] }
  }
};

function createDraft() {
  return createDraftLesson({
    actor: author,
    content: draftContent,
    id: "LES-FLUID-PRESSURE-001",
    now,
    slug: "basic-fluid-pressure"
  }).record;
}

function makePublishableDraft() {
  let record: LessonWorkflowRecord = createDraft();
  record = addApprovedSourceReferences({
    actor: author,
    now,
    record,
    sourceReferences: [
      { sourceId: "SRC-FLUID-PRESSURE-PLACEHOLDER-001", approvalStatus: "Source checked" }
    ]
  }).record;
  record = reviewEquations({
    actor: reviewer,
    equationIds: ["EQ-FLUID-PRESSURE-001"],
    now,
    passed: true,
    record
  }).record;
  record = recordSimulationTests({
    actor: reviewer,
    now,
    passed: true,
    record,
    testCaseIds: ["normal-state", "boundary-state", "fault-state"]
  }).record;
  record = recordSafetyReview({
    actor: reviewer,
    now,
    notes: "Safety warning boundaries checked.",
    passed: true,
    record
  }).record;

  return record;
}

describe("content review workflow access control", () => {
  it("allows authors to create drafts and blocks unauthorised creation", () => {
    const record = createDraft();

    expect(record.reviewStatus).toBe("Draft");
    expect(record.publicationStatus).toBe("draft");
    expect(record.revisions).toHaveLength(1);
    expect(record.auditLog[0]?.action).toBe("lesson.draft.created");

    expect(() =>
      createDraftLesson({
        actor: { id: "student-1", displayName: "Student", roles: [] },
        content: draftContent,
        id: "LES-2",
        now,
        slug: "blocked"
      })
    ).toThrow("not permitted");
  });

  it("prevents authors from approving their own content unless policy explicitly allows it", () => {
    const record = makePublishableDraft();

    expect(() =>
      approveOrRejectContent({
        actor: reviewerAuthor,
        decision: "approved",
        notes: "Looks ready.",
        now,
        record,
        requiresSafetyReview: true,
        requiresSimulationReview: true
      })
    ).toThrow("may not approve their own content");

    const approved = approveOrRejectContent({
      actor: reviewerAuthor,
      decision: "approved",
      notes: "Policy exception approved.",
      now,
      policy: { allowSelfApproval: true },
      record,
      requiresSafetyReview: true,
      requiresSimulationReview: true
    }).record;

    expect(approved.reviewStatus).toBe("Approved for student use");
  });

  it("restricts audit log viewing to platform managers", () => {
    const record = createDraft();

    expect(() => viewAuditLog(reviewer, record)).toThrow("not permitted");
    expect(viewAuditLog(admin, record)).toHaveLength(1);
    expect(viewAuditLog(owner, record)).toHaveLength(1);
  });

  it("allows owner workflow management but never grants engineering-review authority", () => {
    const record = makePublishableDraft();

    expect(() =>
      approveOrRejectContent({
        actor: owner,
        decision: "approved",
        notes: "Owner access is not reviewer authority.",
        now,
        record,
        requiresSafetyReview: true,
        requiresSimulationReview: true
      })
    ).toThrow("not permitted");

    const approved = approveOrRejectContent({
      actor: reviewer,
      decision: "approved",
      notes: "Independent engineering review complete.",
      now,
      record,
      requiresSafetyReview: true,
      requiresSimulationReview: true
    }).record;
    expect(
      publishApprovedContent({
        actor: owner,
        now,
        record: approved,
        requiresSafetyReview: true,
        requiresSimulationReview: true
      }).record.publicationStatus
    ).toBe("published");
  });
});

describe("content review workflow gates", () => {
  it("records source, equation, simulation, safety and reviewer comment workflow steps", () => {
    let record = createDraft();

    record = addApprovedSourceReferences({
      actor: author,
      now,
      record,
      sourceReferences: [
        {
          sourceId: "SRC-FLUID-PRESSURE-PLACEHOLDER-001",
          approvalStatus: "Source checked"
        }
      ]
    }).record;
    expect(record.reviewStatus).toBe("Source checked");

    record = reviewEquations({
      actor: reviewer,
      equationIds: ["EQ-FLUID-PRESSURE-001"],
      now,
      passed: true,
      record
    }).record;
    expect(record.reviewStatus).toBe("Equation checked");

    record = recordSimulationTests({
      actor: reviewer,
      now,
      passed: true,
      record,
      testCaseIds: ["normal-state", "boundary-state", "fault-state"]
    }).record;
    expect(record.reviewStatus).toBe("Simulation checked");

    record = recordSafetyReview({
      actor: reviewer,
      now,
      notes: "Safety warning included.",
      passed: true,
      record
    }).record;
    record = addReviewerComments({
      actor: lecturer,
      notes: "Suitable for first-year use after approval.",
      now,
      record
    }).record;

    expect(record.safetyReview?.passed).toBe(true);
    expect(record.reviewRecords[0]?.decision).toBe("comment");
  });

  it("requires all engineering gates before approval and publication", () => {
    const draft = createDraft();

    expect(() =>
      approveOrRejectContent({
        actor: reviewer,
        decision: "approved",
        notes: "Not ready.",
        now,
        record: draft,
        requiresSafetyReview: true,
        requiresSimulationReview: true
      })
    ).toThrow("Valid sources are required");

    const approved = approveOrRejectContent({
      actor: reviewer,
      decision: "approved",
      notes: "All checks complete.",
      now,
      record: makePublishableDraft(),
      requiresSafetyReview: true,
      requiresSimulationReview: true
    }).record;

    expect(approved.reviewStatus).toBe("Approved for student use");
    expect(approved.engineeringApproval?.reviewerName).toBe("Reviewer One");
    expect(approved.engineeringApproval?.reviewedAt).toBe(now);

    const published = publishApprovedContent({
      actor: admin,
      now,
      record: approved,
      requiresSafetyReview: true,
      requiresSimulationReview: true
    }).record;

    expect(published.publicationStatus).toBe("published");
    expect(published.publishedVersions[0]?.version).toBe(1);
  });

  it("rejects publishing without named reviewer approval date and content version", () => {
    const record = makePublishableDraft();

    expect(() =>
      publishApprovedContent({
        actor: admin,
        now,
        record,
        requiresSafetyReview: true,
        requiresSimulationReview: true
      })
    ).toThrow("Content must be approved for student use");
  });

  it("records requested changes and reverts status to draft", () => {
    const changed = requestChanges({
      actor: reviewer,
      notes: "Clarify the pressure assumption.",
      now,
      record: makePublishableDraft()
    }).record;

    expect(changed.reviewStatus).toBe("Draft");
    expect(changed.reviewRecords[0]?.decision).toBe("changes_requested");
    expect(changed.auditLog.at(-1)?.action).toBe("lesson.review.changes_requested");
  });
});

describe("content review revisions and rollback", () => {
  it("records revision history when structured lesson content is edited", () => {
    const draft = createDraft();
    const edited = editStructuredLessonContent({
      actor: author,
      changeSummary: "Added worked example section.",
      content: {
        ...draftContent,
        description: "Updated structured lesson.",
        sections: { ...draftContent.sections, workedExamples: { blocks: [] } }
      },
      now,
      record: draft
    }).record;

    expect(edited.version).toBe(2);
    expect(viewRevisionHistory(author, edited)).toHaveLength(2);
    expect(viewRevisionHistory(lecturer, edited)[1]?.changeSummary).toBe(
      "Added worked example section."
    );
  });

  it("rolls back a publication to an earlier revision and records audit", () => {
    let record = editStructuredLessonContent({
      actor: author,
      changeSummary: "Second revision.",
      content: {
        ...draftContent,
        description: "Second revision.",
        sections: { ...draftContent.sections, summary: { blocks: [] } }
      },
      now,
      record: createDraft()
    }).record;

    record = addApprovedSourceReferences({
      actor: author,
      now,
      record,
      sourceReferences: [
        {
          sourceId: "SRC-FLUID-PRESSURE-PLACEHOLDER-001",
          approvalStatus: "Source checked"
        }
      ]
    }).record;
    record = reviewEquations({
      actor: reviewer,
      equationIds: ["EQ-FLUID-PRESSURE-001"],
      now,
      passed: true,
      record
    }).record;
    record = recordSimulationTests({
      actor: reviewer,
      now,
      passed: true,
      record,
      testCaseIds: ["normal-state", "boundary-state", "fault-state"]
    }).record;
    record = recordSafetyReview({
      actor: reviewer,
      now,
      notes: "Checked.",
      passed: true,
      record
    }).record;
    record = approveOrRejectContent({
      actor: reviewer,
      decision: "approved",
      notes: "Approved.",
      now,
      record,
      requiresSafetyReview: true,
      requiresSimulationReview: true
    }).record;
    const published = publishApprovedContent({
      actor: admin,
      now,
      record,
      requiresSafetyReview: true,
      requiresSimulationReview: true
    }).record;
    const rolledBack = rollBackPublication({
      actor: admin,
      now,
      record: published,
      targetVersion: 1
    }).record;

    expect(rolledBack.version).toBe(1);
    expect(rolledBack.publicationStatus).toBe("archived");
    expect(rolledBack.content.description).toBe("Draft structured lesson.");
    expect(rolledBack.auditLog.at(-1)?.action).toBe("lesson.publication.rolled_back");
  });
});
