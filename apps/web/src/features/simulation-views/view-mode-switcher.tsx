"use client";
import { useEffect, useState } from "react";
import { Box, Layers3, Scan, Orbit, Network } from "lucide-react";
import {
  getSupportedViews,
  isSupportedView,
  viewHref,
  viewLabels,
  type InspectionSlug,
  type SimulationViewMode,
  type ViewNavigation
} from "./capabilities";
import styles from "./views.module.css";

const icons = {
  standard: Box,
  anatomy: Scan,
  explodedview: Layers3,
  "360view": Orbit,
  aerialview: Network
};

export function useSimulationView(slug: InspectionSlug, navigation?: ViewNavigation) {
  const [view, setView] = useState<SimulationViewMode>(
    navigation?.initialView ?? "standard"
  );
  useEffect(() => {
    if (!navigation) return;
    const sync = () => {
      const path = window.location.pathname;
      const candidate =
        path === navigation.basePath
          ? "standard"
          : path.slice(navigation.basePath.length + 1);
      if (isSupportedView(slug, candidate)) setView(candidate);
    };
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, [slug, navigation]);
  const changeView = (next: SimulationViewMode) => {
    if (!isSupportedView(slug, next)) return;
    setView(next);
    if (navigation && next !== view)
      window.history.pushState(null, "", viewHref(navigation.basePath, next));
  };
  return { view, changeView };
}

export function ViewModeSwitcher({
  slug,
  view,
  onChange,
  navigation
}: {
  slug: InspectionSlug;
  view: SimulationViewMode;
  onChange: (mode: SimulationViewMode) => void;
  navigation?: ViewNavigation | undefined;
}) {
  return (
    <nav className={styles.viewModes} aria-label="Simulation view">
      {getSupportedViews(slug).map((mode) => {
        const Icon = icons[mode];
        const children = (
          <>
            <Icon size={18} aria-hidden="true" />
            <span>{viewLabels[mode]}</span>
          </>
        );
        return navigation ? (
          <a
            key={mode}
            href={viewHref(navigation.basePath, mode)}
            aria-current={view === mode ? "page" : undefined}
            onClick={(event) => {
              if (
                !event.ctrlKey &&
                !event.metaKey &&
                !event.shiftKey &&
                !event.altKey &&
                event.button === 0
              ) {
                event.preventDefault();
                onChange(mode);
              }
            }}
          >
            {children}
          </a>
        ) : (
          <button
            key={mode}
            type="button"
            aria-pressed={view === mode}
            onClick={() => onChange(mode)}
          >
            {children}
          </button>
        );
      })}
    </nav>
  );
}
