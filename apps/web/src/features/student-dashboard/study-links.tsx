"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BookOpen,
  Bookmark,
  ChartNoAxesColumnIncreasing,
  ClipboardCheck,
  Compass,
  FlaskConical,
  LayoutDashboard,
  Settings2
} from "lucide-react";

export function StudyLinks({ hasSaved }: { hasSaved: boolean }) {
  const [location, setLocation] = useState("");
  useEffect(() => {
    const sync = () => setLocation(window.location.hash);
    sync();
    window.addEventListener("hashchange", sync);
    window.addEventListener("popstate", sync);
    return () => {
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("popstate", sync);
    };
  }, []);
  const links = [
    { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
    { href: "#current-learning", label: "My learning", Icon: BookOpen },
    { href: "/simulations", label: "Simulations", Icon: FlaskConical },
    { href: "/assessments", label: "Assessments", Icon: ClipboardCheck },
    { href: "#results", label: "Progress", Icon: ChartNoAxesColumnIncreasing },
    ...(hasSaved ? [{ href: "#saved", label: "Saved content", Icon: Bookmark }] : []),
    { href: "/account/access", label: "Profile & access", Icon: Settings2 }
  ];
  const selected = links.some((link) => link.href === location) ? location : "/dashboard";
  return (
    <>
      {links.map(({ href, label, Icon }) => {
        const StudyLink = href.startsWith("#") ? "a" : Link;
        return (
          <StudyLink
            key={href}
            href={href}
            aria-current={
              href === selected ? (href.startsWith("#") ? "location" : "page") : undefined
            }
            onClick={(event) => {
              if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
                return;
              if (href.startsWith("#")) setLocation(href);
              else if (href === "/dashboard") setLocation("");
            }}
          >
            <Icon size={19} aria-hidden="true" />
            {label}
          </StudyLink>
        );
      })}
      <p data-nav-group>Explore</p>
      <Link href="/learn/core-engineering">
        <BookOpen size={19} aria-hidden="true" />
        Core Engineering
      </Link>
      <Link href="/learn/future-engineering">
        <Compass size={19} aria-hidden="true" />
        Future Engineering
      </Link>
    </>
  );
}
