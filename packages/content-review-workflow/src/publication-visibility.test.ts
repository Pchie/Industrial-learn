import { describe, expect, it } from "vitest";

import {
  CONTENT_REVIEW_STATUSES,
  evaluatePublicationVisibility,
  isContentVisible,
  type ContentAudience,
  type ContentReviewStatus,
  type PublicationStatus,
  type SourceEvidenceStatus,
  type PublicationVisibilityMetadata,
  type PublicationVisibilityReason
} from "./publication-visibility";

const incompleteReviewStatuses = CONTENT_REVIEW_STATUSES.filter(
  (status) => status !== "Approved for student use"
);

describe("publication visibility policy", () => {
  it.each(["public", "student"] satisfies ContentAudience[])(
    "allows %s access only to the current published and approved version",
    (audience) => {
      expect(
        evaluatePublicationVisibility({ audience, metadata: publishedMetadata() })
      ).toEqual({
        visible: true,
        scope: "public",
        reason: "public-current-version"
      });
    }
  );

  it.each(incompleteReviewStatuses)(
    "denies published content with %s review status",
    (reviewStatus) => {
      expectDeniedForPublicAudiences(
        publishedMetadata({ reviewStatus }),
        "review-not-approved"
      );
    }
  );

  it("denies approved but unpublished and published but unapproved content", () => {
    expectDeniedForPublicAudiences(
      publishedMetadata({ publicationStatus: "draft" }),
      "not-published"
    );
    expectDeniedForPublicAudiences(
      publishedMetadata({ reviewStatus: "Engineering review required" }),
      "review-not-approved"
    );
  });

  it.each(["draft", "internal"] satisfies PublicationStatus[])(
    "denies %s publication status for public and student audiences",
    (publicationStatus) => {
      expectDeniedForPublicAudiences(
        publishedMetadata({ publicationStatus }),
        "not-published"
      );
    }
  );

  it("denies future, archived, withdrawn, and expired publication states", () => {
    expectDeniedForPublicAudiences(
      publishedMetadata({ publicationStatus: "scheduled" }),
      "publication-not-started"
    );

    for (const scenario of ["archived", "withdrawn", "expired"]) {
      expectDeniedForPublicAudiences(
        publishedMetadata({
          publicationStatus: "archived",
          archivedAt: "2026-08-28T00:00:00.000Z"
        }),
        "archived",
        scenario
      );
    }
  });

  it("denies an archived timestamp even if statuses still look publishable", () => {
    expectDeniedForPublicAudiences(
      publishedMetadata({ archivedAt: "2026-08-28T00:00:00.000Z" }),
      "archived"
    );
  });

  it("shows the current published version while a newer draft exists", () => {
    expect(
      isContentVisible({
        audience: "student",
        metadata: publishedMetadata({
          version: 2,
          publishedVersion: 2,
          currentVersion: 3
        })
      })
    ).toBe(true);
  });

  it("denies old, superseded, and newer draft candidate versions", () => {
    for (const version of [1, 3]) {
      expectDeniedForPublicAudiences(
        publishedMetadata({ version, publishedVersion: 2, currentVersion: 3 }),
        "version-not-current-published",
        `version ${version}`
      );
    }
  });

  it("denies a rolled-back version normalized to archived", () => {
    expect(
      evaluatePublicationVisibility({
        audience: "student",
        metadata: publishedMetadata({
          publicationStatus: "archived",
          version: 1,
          publishedVersion: 1
        })
      }).reason
    ).toBe("archived");
  });

  it("denies an impossible numeric version relationship", () => {
    expect(
      evaluatePublicationVisibility({
        audience: "public",
        metadata: publishedMetadata({
          version: 3,
          publishedVersion: 3,
          currentVersion: 2
        })
      }).reason
    ).toBe("invalid-version-relationship");
  });

  it("fails closed when public metadata is missing", () => {
    const scenarios: Array<{
      metadata: PublicationVisibilityMetadata;
      reason: string;
    }> = [
      { metadata: {}, reason: "missing-publication-status" },
      {
        metadata: publishedMetadata({ reviewStatus: null }),
        reason: "missing-review-status"
      },
      {
        metadata: publishedMetadata({ evidenceStatus: null }),
        reason: "missing-evidence-status"
      },
      { metadata: publishedMetadata({ version: null }), reason: "missing-version" },
      {
        metadata: publishedMetadata({ publishedVersion: null }),
        reason: "missing-published-version"
      }
    ];

    for (const scenario of scenarios) {
      expectDeniedForPublicAudiences(
        scenario.metadata,
        scenario.reason as PublicationVisibilityReason
      );
    }
  });

  it("fails closed for invalid runtime status values", () => {
    expectDeniedForPublicAudiences(
      publishedMetadata({ publicationStatus: "visible" as PublicationStatus }),
      "invalid-publication-status"
    );
    expectDeniedForPublicAudiences(
      publishedMetadata({ reviewStatus: "Approved" as ContentReviewStatus }),
      "invalid-review-status"
    );
    expectDeniedForPublicAudiences(
      publishedMetadata({ evidenceStatus: "checked" as SourceEvidenceStatus }),
      "invalid-evidence-status"
    );
  });

  it("requires approved source evidence for public and student access", () => {
    for (const evidenceStatus of ["missing", "partial"] as const) {
      expectDeniedForPublicAudiences(
        publishedMetadata({ evidenceStatus }),
        "evidence-not-approved"
      );
    }
  });

  it("allows an author to see their own draft without granting approval", () => {
    expect(
      evaluatePublicationVisibility({
        audience: "content_author",
        metadata: draftMetadata(),
        access: { actorProfileId: "author-1" }
      })
    ).toEqual({ visible: true, scope: "internal", reason: "internal-author" });
    expect(
      evaluatePublicationVisibility({
        audience: "content_author",
        metadata: draftMetadata(),
        access: { actorProfileId: "author-2" }
      }).visible
    ).toBe(false);
  });

  it.each([
    ["lecturer", "lecturerAuthorized", "internal-authorized-lecturer"],
    ["engineering_reviewer", "reviewerAuthorized", "internal-authorized-reviewer"],
    ["administrator", "administratorAuthorized", "internal-authorized-administrator"]
  ] as const)(
    "requires explicit internal authorization for %s draft access",
    (audience, authorization, reason) => {
      expect(
        evaluatePublicationVisibility({ audience, metadata: draftMetadata() })
      ).toMatchObject({ visible: false, reason: "internal-authorization-required" });
      expect(
        evaluatePublicationVisibility({
          audience,
          metadata: draftMetadata(),
          access: { [authorization]: true }
        })
      ).toEqual({ visible: true, scope: "internal", reason });
    }
  );

  it("supports an explicitly authorized content author without treating visibility as approval", () => {
    const decision = evaluatePublicationVisibility({
      audience: "content_author",
      metadata: draftMetadata({ reviewStatus: "Source required" }),
      access: { contentAuthorAuthorized: true }
    });

    expect(decision).toEqual({
      visible: true,
      scope: "internal",
      reason: "internal-authorized-content-author"
    });
  });

  it("allows every internal role to see public content without an extra grant", () => {
    for (const audience of [
      "lecturer",
      "content_author",
      "engineering_reviewer",
      "administrator"
    ] as const) {
      expect(isContentVisible({ audience, metadata: publishedMetadata() })).toBe(true);
    }
  });
});

function publishedMetadata(
  overrides: Partial<PublicationVisibilityMetadata> = {}
): PublicationVisibilityMetadata {
  return {
    publicationStatus: "published",
    reviewStatus: "Approved for student use",
    version: 2,
    currentVersion: 2,
    publishedVersion: 2,
    archivedAt: null,
    evidenceStatus: "approved",
    authorProfileId: "author-1",
    ...overrides
  };
}

function draftMetadata(
  overrides: Partial<PublicationVisibilityMetadata> = {}
): PublicationVisibilityMetadata {
  return {
    publicationStatus: "draft",
    reviewStatus: "Draft",
    version: 3,
    currentVersion: 3,
    publishedVersion: 2,
    archivedAt: null,
    evidenceStatus: "partial",
    authorProfileId: "author-1",
    ...overrides
  };
}

function expectDeniedForPublicAudiences(
  metadata: PublicationVisibilityMetadata,
  reason: PublicationVisibilityReason,
  label?: string
) {
  for (const audience of ["public", "student"] as const) {
    expect(
      evaluatePublicationVisibility({ audience, metadata }),
      label ? `${audience}: ${label}` : audience
    ).toMatchObject({ visible: false, reason });
  }
}
