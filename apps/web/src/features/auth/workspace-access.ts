import type { AppCapability, AppRole, AuthenticatedSession } from "./session-core";
import { hasCapability, hasRole } from "./session-core";

export type WorkspaceKey = "student" | "author" | "reviewer" | "lecturer" | "owner";

export type WorkspaceDestination = {
  key: WorkspaceKey;
  label: string;
  shortLabel: string;
  description: string;
  href: string;
  capability: AppCapability;
};

const workspaceDefinitions: WorkspaceDestination[] = [
  {
    key: "student",
    label: "Student Learning",
    shortLabel: "Student",
    description: "Continue learning, assessments, simulations, projects, and progress.",
    href: "/dashboard",
    capability: "workspace:student"
  },
  {
    key: "author",
    label: "Content Authoring",
    shortLabel: "Author",
    description: "Work with drafts, evidence, versions, and review submissions.",
    href: "/author",
    capability: "workspace:author"
  },
  {
    key: "reviewer",
    label: "Engineering Review",
    shortLabel: "Reviewer",
    description: "Inspect review packages, evidence, exact versions, and decisions.",
    href: "/review",
    capability: "workspace:review"
  },
  {
    key: "lecturer",
    label: "Lecturer",
    shortLabel: "Lecturer",
    description: "Open authorised teaching, cohort, assessment, and module tools.",
    href: "/lecturer",
    capability: "workspace:lecturer"
  },
  {
    key: "owner",
    label: "Platform Management",
    shortLabel: "Owner",
    description: "Manage users, roles, governance, publication records, and operations.",
    href: "/owner",
    capability: "workspace:owner"
  }
];

const roleLabels: Record<AppRole, string> = {
  student: "Student",
  lecturer: "Lecturer",
  content_author: "Content Author",
  engineering_reviewer: "Engineering Reviewer",
  administrator: "Administrator",
  platform_owner: "Platform Owner"
};

export function availableWorkspaces(session: AuthenticatedSession) {
  const workspaces = workspaceDefinitions.filter((workspace) =>
    hasCapability(session, workspace.capability)
  );

  if (hasRole(session, "administrator") && !hasRole(session, "platform_owner")) {
    workspaces.push({
      key: "owner",
      label: "Administration",
      shortLabel: "Admin",
      description: "Manage authorised users, roles, governance, and operations.",
      href: "/admin",
      capability: "workspace:admin"
    });
  }

  return workspaces;
}

export function primaryRoleLabel(roles: AppRole[]) {
  const priority: AppRole[] = [
    "platform_owner",
    "administrator",
    "engineering_reviewer",
    "content_author",
    "lecturer",
    "student"
  ];
  const role = priority.find((candidate) => roles.includes(candidate));
  return role ? roleLabels[role] : "Authenticated user";
}

export function roleLabel(role: AppRole) {
  return roleLabels[role];
}

export function workspaceForPath(pathname: string) {
  if (pathname.startsWith("/review") || pathname.startsWith("/preview/lessons")) {
    return "Reviewer";
  }
  if (pathname.startsWith("/author")) {
    return "Author";
  }
  if (pathname.startsWith("/lecturer")) {
    return "Lecturer";
  }
  if (pathname.startsWith("/owner") || pathname.startsWith("/admin")) {
    return "Owner / Admin";
  }
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/my-learning") ||
    pathname.startsWith("/projects") ||
    pathname.startsWith("/assessments") ||
    pathname.startsWith("/simulations")
  ) {
    return "Student";
  }
  return "Workspace";
}
