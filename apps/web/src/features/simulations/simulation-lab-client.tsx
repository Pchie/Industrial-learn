"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { Badge, Button, Input, Select } from "@industrial-learn/design-system";
import type { SimulationMode } from "@industrial-learn/simulation-engine";

import {
  simulationDifficulties,
  simulationDisciplines,
  simulationTypes
} from "./catalog-contract";
import { emptySimulationFilters, filterSimulationCatalogue } from "./discovery";
import type {
  SimulationDiscoveryFilters,
  SimulationLabCard,
  SimulationLabModel
} from "./lab-types";
import { SimulationPreview } from "./simulation-preview";
import styles from "./simulation-lab.module.css";

const modeOptions: Array<{ value: "all" | SimulationMode; label: string }> = [
  { value: "all", label: "All modes" },
  { value: "learn", label: "Learn" },
  { value: "guided", label: "Guided" },
  { value: "explore", label: "Explore" },
  { value: "fault-diagnosis", label: "Diagnose" },
  { value: "assessment", label: "Assessment" }
];

const subscribeToHydration = () => () => undefined;

export function SimulationLab({ model }: { model: SimulationLabModel }) {
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false
  );
  const [filters, setFilters] =
    useState<SimulationDiscoveryFilters>(emptySimulationFilters);
  const results = useMemo(
    () => filterSimulationCatalogue(model.simulations, filters),
    [filters, model.simulations]
  );
  const pathwayOptions = useMemo(
    () =>
      Array.from(
        new Set(model.simulations.flatMap((simulation) => simulation.careerPathwaySlugs))
      ).sort(),
    [model.simulations]
  );

  function setFilter<Key extends keyof SimulationDiscoveryFilters>(
    key: Key,
    value: SimulationDiscoveryFilters[Key]
  ) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className={styles.labPage} data-testid="simulation-lab">
      <header className={styles.labHeader}>
        <div>
          <p className={styles.kicker}>Engineering workspace</p>
          <h1>Simulation Lab</h1>
          <p>
            Operate engineering systems. Change variables. See the physics. Diagnose
            problems.
          </p>
        </div>
        <Input
          autoComplete="off"
          disabled={!isHydrated}
          helperText="Search names, components, concepts, modules or abbreviations."
          label="Search simulations"
          onChange={(event) => setFilter("query", event.target.value)}
          placeholder="Try pressure, pump, PLC or motor"
          type="search"
          value={filters.query}
        />
      </header>

      <nav aria-label="Simulation disciplines" className={styles.disciplineRail}>
        <button
          aria-pressed={filters.discipline === "all"}
          onClick={() => setFilter("discipline", "all")}
          type="button"
        >
          All disciplines
        </button>
        {simulationDisciplines.map((discipline) => {
          const count = model.simulations.filter(
            (simulation) =>
              simulation.discipline === discipline &&
              simulation.availability === "available"
          ).length;
          return (
            <button
              aria-pressed={filters.discipline === discipline}
              key={discipline}
              onClick={() => setFilter("discipline", discipline)}
              type="button"
            >
              {discipline}
              <span aria-label={`${count} available`}>{count}</span>
            </button>
          );
        })}
      </nav>

      <StudentActivity model={model} />

      <section
        aria-labelledby="lab-catalogue-heading"
        className={styles.catalogueSection}
      >
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.kicker}>Available workbenches</p>
            <h2 id="lab-catalogue-heading">Choose a simulation</h2>
          </div>
          <p aria-live="polite" className={styles.resultCount}>
            {results.length} {results.length === 1 ? "simulation" : "simulations"}
          </p>
        </div>

        <div className={styles.filterBand}>
          <Select
            label="Difficulty"
            onChange={(event) =>
              setFilter(
                "difficulty",
                event.target.value as SimulationDiscoveryFilters["difficulty"]
              )
            }
            options={[
              { label: "All difficulties", value: "all" },
              ...simulationDifficulties.map((difficulty) => ({
                label: difficulty,
                value: difficulty
              }))
            ]}
            value={filters.difficulty}
          />
          <Select
            label="Simulation type"
            onChange={(event) =>
              setFilter("type", event.target.value as SimulationDiscoveryFilters["type"])
            }
            options={[
              { label: "All types", value: "all" },
              ...simulationTypes.map((type) => ({ label: type, value: type }))
            ]}
            value={filters.type}
          />
          <Select
            label="Interaction mode"
            onChange={(event) =>
              setFilter("mode", event.target.value as SimulationDiscoveryFilters["mode"])
            }
            options={modeOptions}
            value={filters.mode}
          />
          <Select
            label="Career pathway"
            onChange={(event) => setFilter("pathway", event.target.value)}
            options={[
              { label: "All pathways", value: "all" },
              ...pathwayOptions.map((pathway) => ({
                label: formatSlug(pathway),
                value: pathway
              }))
            ]}
            value={filters.pathway}
          />
          <Button
            disabled={filtersEqual(filters, emptySimulationFilters)}
            onClick={() => setFilters(emptySimulationFilters)}
            variant="quiet"
          >
            Clear filters
          </Button>
        </div>

        {results.length > 0 ? (
          <div aria-label="Simulation catalogue" className={styles.simulationGrid}>
            {results.map((simulation) => (
              <SimulationCard key={simulation.simulationId} simulation={simulation} />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState} role="status">
            <h3>No matching simulation</h3>
            <p>
              {model.simulations.length === 0
                ? "Reviewed simulations are being prepared."
                : emptyStateMessage(filters)}
            </p>
            {model.simulations.length > 0 ? (
              <Button
                onClick={() => setFilters(emptySimulationFilters)}
                variant="secondary"
              >
                Show available simulations
              </Button>
            ) : null}
          </div>
        )}
      </section>

      {model.collections.length > 0 ? (
        <section
          aria-labelledby="collections-heading"
          className={styles.collectionSection}
        >
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.kicker}>Curriculum collections</p>
              <h2 id="collections-heading">Laboratory sequences</h2>
            </div>
          </div>
          <div className={styles.collectionGrid}>
            {model.collections.map((collection) => (
              <article className={styles.collectionCard} key={collection.id}>
                <h3>{collection.title}</h3>
                <p>{collection.description}</p>
                <ul>
                  {collection.items.map((item) => (
                    <li key={item.simulationId}>
                      {item.slug ? (
                        <Link prefetch={false} href={`/simulations/${item.slug}`}>
                          {item.title}
                        </Link>
                      ) : (
                        <span>{item.title}</span>
                      )}
                      <Badge
                        tone={item.availability === "available" ? "normal" : "disabled"}
                      >
                        {item.availability === "available" ? "Available" : "Coming later"}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function SimulationCard({ simulation }: { simulation: SimulationLabCard }) {
  const availability = availabilityPresentation(simulation.availability);

  return (
    <article className={styles.simulationCard}>
      <SimulationPreview preview={simulation.preview} />
      <div className={styles.cardBody}>
        <div className={styles.statusRow}>
          <Badge tone={availability.tone}>{availability.label}</Badge>
          <Badge tone="warning">{simulation.reviewStatus}</Badge>
        </div>
        <div>
          <p className={styles.cardMeta}>
            {simulation.discipline} · {simulation.difficulty} ·{" "}
            {simulation.estimatedMinutes} min
          </p>
          <h3>{simulation.title}</h3>
          <p>{simulation.mainConcept}</p>
        </div>
        <dl className={styles.cardFacts}>
          <div>
            <dt>Type</dt>
            <dd>{simulation.types.join(", ")}</dd>
          </div>
          <div>
            <dt>Module</dt>
            <dd>{simulation.moduleTitle}</dd>
          </div>
          <div>
            <dt>Challenge</dt>
            <dd>{simulation.availableChallenge ?? "No challenge declared"}</dd>
          </div>
          <div>
            <dt>Fault mode</dt>
            <dd>{faultStatusLabel(simulation.faultModeStatus)}</dd>
          </div>
        </dl>
        <ul aria-label="Modes offered by this simulation" className={styles.modeList}>
          {simulation.modes.map((mode) => (
            <li key={mode}>{formatMode(mode)}</li>
          ))}
        </ul>
        {simulation.verifiedCompetencies.length > 0 ? (
          <p className={styles.competencyLine}>
            <strong>Verified competency:</strong>{" "}
            {simulation.verifiedCompetencies.join(", ")}
          </p>
        ) : null}
        {simulation.availability === "available" ? (
          <Link
            className={styles.cardAction}
            href={`/simulations/${simulation.slug}`}
            prefetch={false}
          >
            Open simulation
          </Link>
        ) : (
          <span className={styles.cardUnavailable}>Not currently available</span>
        )}
      </div>
    </article>
  );
}

function StudentActivity({ model }: { model: SimulationLabModel }) {
  if (!model.authenticated) {
    return (
      <aside className={styles.studentStrip} aria-label="Student simulation activity">
        <div>
          <strong>Your laboratory activity</strong>
          <span>Sign in to continue real attempts and view verified competency.</span>
        </div>
        <Link href="/auth/sign-in?next=%2Fsimulations">Sign in</Link>
      </aside>
    );
  }

  if (!model.historyAvailable) {
    return (
      <aside className={styles.studentStrip} role="status">
        <div>
          <strong>Laboratory activity unavailable</strong>
          <span>
            Your catalogue is available, but private attempt history could not load.
          </span>
        </div>
      </aside>
    );
  }

  if (model.recentAttempts.length === 0) {
    return (
      <aside className={styles.studentStrip} aria-label="Recent simulations">
        <div>
          <strong>No recent simulations</strong>
          <span>No simulation activity is recorded for your account.</span>
        </div>
      </aside>
    );
  }

  const recent = model.recentAttempts[0];
  const recommendation = model.recommendations.find(
    (item) => item.simulationSlug === recent?.simulationSlug
  );
  return (
    <section aria-labelledby="recent-simulation-heading" className={styles.recentSection}>
      <div>
        <p className={styles.kicker}>Private learning activity</p>
        <h2 id="recent-simulation-heading">Continue recent simulation</h2>
      </div>
      <div className={styles.recentRecord}>
        <div>
          <strong>{recent?.title}</strong>
          <span>
            {formatMode(recent?.mode ?? "")} · {formatStatus(recent?.status ?? "")}
          </span>
          {recommendation ? <small>{recommendation.reason}</small> : null}
        </div>
        <Link href={`/simulations/${recent?.simulationSlug}`} prefetch={false}>
          Continue
        </Link>
      </div>
    </section>
  );
}

function emptyStateMessage(filters: SimulationDiscoveryFilters) {
  if (filters.discipline !== "all" && !filters.query) {
    return `${filters.discipline} simulations are being prepared or do not match the active filters.`;
  }
  return "No available simulation matches this search and filter combination.";
}

function filtersEqual(
  left: SimulationDiscoveryFilters,
  right: SimulationDiscoveryFilters
) {
  return Object.keys(left).every(
    (key) =>
      left[key as keyof SimulationDiscoveryFilters] ===
      right[key as keyof SimulationDiscoveryFilters]
  );
}

function formatMode(mode: string) {
  return mode === "fault-diagnosis" ? "Diagnose" : formatSlug(mode);
}

function formatStatus(status: string) {
  return formatSlug(status.replaceAll("_", "-"));
}

function formatSlug(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function faultStatusLabel(status: SimulationLabCard["faultModeStatus"]) {
  switch (status) {
    case "available":
      return "Available";
    case "evidence-required":
      return "Engineering evidence required";
    default:
      return "Not available";
  }
}

function availabilityPresentation(availability: SimulationLabCard["availability"]): {
  label: string;
  tone: "normal" | "disabled" | "warning";
} {
  if (availability === "locked-by-prerequisite") {
    return { label: "Locked by prerequisite", tone: "warning" };
  }
  if (availability === "coming-later") {
    return { label: "Coming later", tone: "disabled" };
  }
  return { label: "Available", tone: "normal" };
}
