"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Layers3,
  CircleGauge,
  Bell,
  Trophy,
  Menu,
  Search,
  X
} from "lucide-react";
import { ThemeToggle } from "../theme/theme-toggle";
import {
  navigationIsActive,
  schoolNavigation,
  shellNavigation
} from "../app-shell/navigation";
import { frontendAssets } from "../app-shell/assets";
import { DemoAction } from "../student-dashboard/demo-action";
import type { AppRole } from "./session-core";
import type { WorkspaceDestination } from "./workspace-access";
import { workspaceForPath } from "./workspace-access";

type AccountAccessSummary = {
  authenticated: true;
  displayName: string;
  primaryRole: string;
  roles: AppRole[];
  workspaces: WorkspaceDestination[];
};

export function SiteNavigation() {
  const pathname = usePathname();
  const [account, setAccount] = useState<AccountAccessSummary | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [hash, setHash] = useState("");
  const drawer = useRef<HTMLDialogElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const safeAccount = pathname.startsWith("/auth/") ? null : account;
  const [demo, setDemo] = useState(false);
  useEffect(() => {
    if (pathname !== "/internal/reference-dashboard") {
      setDemo(false);
      return;
    }
    // App Router may stream the authorised page after the persistent shell mounts.
    const sync = () => {
      if (document.querySelector("[data-reference-demo]")) {
        setDemo(true);
        observer.disconnect();
      }
    };
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true });
    sync();
    return () => observer.disconnect();
  }, [pathname]);
  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        document.getElementById("shell-search")?.focus();
      }
    };
    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, []);
  const student =
    safeAccount?.workspaces.some((workspace) => workspace.key === "student") ?? false;

  useEffect(() => {
    const controller = new AbortController();
    setAccount(null);
    fetch("/api/account/access", {
      cache: "no-store",
      credentials: "same-origin",
      signal: controller.signal
    })
      .then(async (response) =>
        response.ok ? ((await response.json()) as AccountAccessSummary) : null
      )
      .then((result) => {
        if (!controller.signal.aborted) setAccount(result);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, [pathname]);
  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem("industrial-learn-sidebar") === "compact");
    } catch {
      /* Session-only preference. */
    }
    const sync = () => setHash(location.hash);
    sync();
    window.addEventListener("hashchange", sync);
    window.addEventListener("popstate", sync);
    const media = matchMedia("(min-width: 1100px)");
    const closeOnDesktop = () => {
      if (media.matches) drawer.current?.close();
    };
    media.addEventListener("change", closeOnDesktop);
    return () => {
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("popstate", sync);
      media.removeEventListener("change", closeOnDesktop);
    };
  }, []);
  useEffect(() => {
    drawer.current?.close();
  }, [pathname]);

  function closeMenu() {
    drawer.current?.close();
  }
  function navigation(mobile = false) {
    return (
      <nav
        className="shell-navigation"
        aria-label={mobile ? "Mobile navigation" : "Primary navigation"}
      >
        {shellNavigation
          .filter(
            (item) =>
              (item.access === "public" || student) && !(student && item.href === "/")
          )
          .map((item) => {
            const Icon = demo && item.label === "Progress" ? Trophy : item.icon;
            const current = demo
              ? item.href === "/dashboard"
              : navigationIsActive(item.href, pathname, hash);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed && !mobile ? item.label : undefined}
                aria-current={
                  current ? (item.href.includes("#") ? "location" : "page") : undefined
                }
                onClick={() => {
                  setHash(item.href.split("#")[1] ? `#${item.href.split("#")[1]}` : "");
                  closeMenu();
                }}
              >
                <Icon size={20} aria-hidden="true" />
                <span>
                  {demo && item.label === "Progress" ? "Achievements" : item.label}
                </span>
              </Link>
            );
          })}
        <p className="shell-nav-group">Explore</p>
        {schoolNavigation.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            title={collapsed && !mobile ? label : undefined}
            aria-current={navigationIsActive(href, pathname, hash) ? "page" : undefined}
            onClick={closeMenu}
          >
            <Icon size={20} aria-hidden="true" />
            <span>{label}</span>
            <ChevronRight size={14} className="shell-nav-chevron" aria-hidden="true" />
          </Link>
        ))}
        {!demo &&
          safeAccount &&
          safeAccount.workspaces.some((item) => item.key !== "student") && (
            <>
              <p className="shell-nav-group">Workspace</p>
              {safeAccount.workspaces
                .filter((item) => item.key !== "student")
                .map((workspace) => (
                  <Link
                    href={workspace.href}
                    key={workspace.key}
                    onClick={closeMenu}
                    aria-current={
                      navigationIsActive(workspace.href, pathname, hash)
                        ? "page"
                        : undefined
                    }
                    title={collapsed && !mobile ? workspace.shortLabel : undefined}
                  >
                    <Layers3 size={20} aria-hidden="true" />
                    <span>{workspace.shortLabel}</span>
                  </Link>
                ))}
            </>
          )}
      </nav>
    );
  }
  return (
    <>
      <aside
        className="app-sidebar"
        data-collapsed={collapsed}
        aria-label="Application sidebar"
      >
        <Link href="/" className="shell-brand" aria-label="Industrial Learn home">
          <CircleGauge size={34} strokeWidth={2.5} aria-hidden="true" />
          <span>Industrial Learn</span>
        </Link>
        <button
          type="button"
          className="sidebar-collapse"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          onClick={() => {
            const next = !collapsed;
            setCollapsed(next);
            try {
              localStorage.setItem(
                "industrial-learn-sidebar",
                next ? "compact" : "expanded"
              );
            } catch {
              /* Session-only preference. */
            }
          }}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
        <div className="sidebar-scroll">
          {navigation()}
          <section className="study-support" aria-labelledby="study-support-title">
            <Image
              {...frontendAssets.support.image}
              alt=""
              sizes="205px"
              loading="lazy"
            />
            <div>
              <h2 id="study-support-title">
                {demo ? (
                  <>
                    AI Mentor <small className="shell-beta">BETA</small>
                  </>
                ) : (
                  "Study Support"
                )}
              </h2>
              <p>
                {demo
                  ? "Get instant help and explanations as you learn."
                  : "Find the pilot learning path and lesson references."}
              </p>
              {demo ? (
                <DemoAction>
                  Chat with AI Mentor <ArrowRight size={16} aria-hidden="true" />
                </DemoAction>
              ) : (
                <Link href="/learn/pilot">
                  Open study guide <ArrowRight size={16} aria-hidden="true" />
                </Link>
              )}
            </div>
          </section>
        </div>
      </aside>
      <header className="site-header app-topbar" aria-label="Application header">
        <button
          ref={menuButton}
          className="shell-menu-button"
          type="button"
          aria-label="Open navigation"
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => {
            drawer.current?.showModal();
            setMenuOpen(true);
          }}
        >
          <Menu size={23} aria-hidden="true" />
        </button>
        <Link className="shell-mobile-brand" href="/" aria-label="Industrial Learn home">
          Industrial Learn
        </Link>
        <form action="/learn" role="search" className="shell-search">
          <label className="sr-only" htmlFor="shell-search">
            Search published lessons
          </label>
          <Search size={19} aria-hidden="true" />
          <input
            id="shell-search"
            name="q"
            type="search"
            placeholder={
              demo
                ? "Search lessons, simulations, topics..."
                : "Search lessons, engineering topics..."
            }
            maxLength={200}
          />
          <button type="submit" aria-label="Search learning" title="Search learning">
            <kbd aria-hidden="true">⌘ K</kbd>
          </button>
        </form>
        <div className="shell-account-controls">
          {demo && (
            <DemoAction className="shell-notification">
              <Bell size={23} aria-hidden="true" />
              <span className="sr-only">Example notifications</span>
              <b aria-hidden="true">3</b>
            </DemoAction>
          )}
          <ThemeToggle />
          {safeAccount ? (
            <details className="shell-profile workspace-menu" key={pathname}>
              <summary
                aria-label={`Workspace: ${workspaceForPath(pathname)}. ${safeAccount.displayName}`}
              >
                <span className="shell-avatar" aria-hidden="true">
                  {(demo ? "Tebogo Sebopela" : safeAccount.displayName)
                    .split(/\s+/)
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((word) => word[0])
                    .join("")}
                </span>
                <span className="shell-identity">
                  {demo ? "Tebogo Sebopela" : safeAccount.displayName}
                  <small>{demo ? "Student · Demo" : safeAccount.primaryRole}</small>
                </span>
                <ChevronDown size={14} aria-hidden="true" />
              </summary>
              <div className="workspace-menu__panel">
                <p className="workspace-menu__identity">
                  <strong>{safeAccount.displayName}</strong>
                  <span>{safeAccount.primaryRole}</span>
                </p>
                <p className="workspace-menu__label">Switch workspace</p>
                {safeAccount.workspaces.map((workspace) => (
                  <Link href={workspace.href} key={`${workspace.key}-${workspace.href}`}>
                    {workspace.shortLabel}
                  </Link>
                ))}
                <Link href="/workspace">All workspaces</Link>
                <Link href="/account/access">Account access</Link>
                <Link href="/auth/sign-out">Sign out</Link>
              </div>
            </details>
          ) : (
            <Link className="shell-sign-in" href="/auth/sign-in?next=%2Fworkspace">
              Sign in
            </Link>
          )}
        </div>
      </header>
      <dialog
        id="mobile-navigation"
        className="shell-drawer"
        aria-labelledby="mobile-navigation-title"
        ref={drawer}
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const controls = Array.from(
            event.currentTarget.querySelectorAll<HTMLElement>(
              "a[href], button:not([disabled])"
            )
          );
          const first = controls[0];
          const last = controls.at(-1);
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
        onClose={() => {
          setMenuOpen(false);
          menuButton.current?.focus();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeMenu();
        }}
      >
        <div className="shell-drawer-heading">
          <h2 id="mobile-navigation-title">Industrial Learn</h2>
          <button type="button" aria-label="Close navigation" onClick={closeMenu}>
            <X size={22} aria-hidden="true" />
          </button>
        </div>
        {navigation(true)}
      </dialog>
    </>
  );
}
