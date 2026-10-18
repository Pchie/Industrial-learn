import {
  BookOpen,
  Bookmark,
  Boxes,
  ClipboardCheck,
  Compass,
  FlaskConical,
  GraduationCap,
  House
} from "lucide-react";

export const shellNavigation = [
  { href: "/", label: "Home", icon: House, access: "public" },
  { href: "/dashboard", label: "Dashboard", icon: House, access: "student" },
  { href: "/my-learning", label: "My Learning", icon: BookOpen, access: "student" },
  { href: "/learn", label: "Browse learning", icon: Compass, access: "public" },
  { href: "/simulations", label: "Simulations", icon: FlaskConical, access: "public" },
  { href: "/assessments", label: "Assessments", icon: ClipboardCheck, access: "student" },
  { href: "/projects", label: "Projects", icon: Boxes, access: "student" },
  { href: "/dashboard#saved", label: "Saved", icon: Bookmark, access: "student" },
  {
    href: "/dashboard#results",
    label: "Progress",
    icon: GraduationCap,
    access: "student"
  }
] as const;
export const schoolNavigation = [
  { href: "/learn/core-engineering", label: "Core Engineering", icon: GraduationCap },
  { href: "/learn/future-engineering", label: "Future Engineering", icon: Compass }
] as const;
export function navigationIsActive(href: string, pathname: string, hash: string) {
  if (href === "/my-learning" && pathname.startsWith("/lessons/")) return true;
  if (
    href === "/learn" &&
    ["/programmes/", "/modules/", "/pathways/"].some((prefix) =>
      pathname.startsWith(prefix)
    )
  )
    return true;
  if (href.includes("#")) return `${pathname}${hash}` === href;
  if (pathname === "/dashboard" && ["#saved", "#results"].includes(hash)) return false;
  if (
    href === "/learn" &&
    schoolNavigation.some((item) => pathname.startsWith(item.href))
  )
    return false;
  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
}
