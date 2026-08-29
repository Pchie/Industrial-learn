import { describe, expect, it } from "vitest";
import type { PersistedSimulationAttempt } from "@industrial-learn/database";

import {
  getPublicSimulationCatalog,
  getPublicSimulationCollections,
  simulationRegistry,
  simulationDisciplines,
  simulationTypes
} from "./catalog";
import {
  buildSimulationRecommendations,
  catalogueEntryToLabCard,
  deriveSimulationAvailability,
  emptySimulationFilters,
  filterSimulationCatalogue,
  verifiedCompetenciesForAttempt
} from "./discovery";

const hydraulic = catalogueEntryToLabCard(simulationRegistry[0]!);
const thermal = catalogueEntryToLabCard(simulationRegistry[1]!);
const bernoulli = catalogueEntryToLabCard(simulationRegistry[2]!);

describe("simulation lab discovery", () => {
  it("integrates the hydraulic cylinder through complete registry metadata", () => {
    expect(hydraulic).toMatchObject({
      slug: "hydraulic-cylinder-force",
      simulationId: "SIM-HYD-CYL-FORCE-001",
      discipline: "Fluid Systems",
      difficulty: "Beginner",
      reviewStatus: "Equation checked",
      availability: "available",
      recommendedMode: "explore"
    });
    expect(hydraulic.types).toEqual(
      expect.arrayContaining(["Component", "Calculation", "Schematic"])
    );
    expect(hydraulic.preview.alt).toContain("Hydraulic pressure source");
  });

  it("registers the thermodynamic boundary simulation behind its human-review gate", () => {
    expect(thermal).toMatchObject({
      slug: "thermal-system-boundary-simulation",
      simulationId: "sim-core-thermal-system-001",
      discipline: "Thermodynamics",
      difficulty: "Beginner",
      reviewStatus: "Engineering review required",
      publicationStatus: "draft",
      availability: "coming-later",
      faultModeStatus: "evidence-required",
      recommendedMode: "learn"
    });
    expect(thermal.types).toEqual(expect.arrayContaining(["System", "Schematic"]));
    expect(thermal.preview.alt).toContain("selected thermodynamic system");
  });

  it("integrates the Bernoulli flagship through registry metadata", () => {
    expect(bernoulli).toMatchObject({
      slug: "bernoulli-flow-lab",
      simulationId: "SIM-FLUID-BERNOULLI-FLOW-001",
      discipline: "Fluid Systems",
      difficulty: "Intermediate",
      reviewStatus: "Engineering review required",
      availability: "available",
      recommendedMode: "learn",
      faultModeStatus: "not-available"
    });
    expect(bernoulli.types).toEqual(
      expect.arrayContaining(["System", "Calculation", "Schematic"])
    );
    expect(bernoulli.preview.kind).toBe("bernoulli-flow");
  });

  it("supports name, component, concept, module and abbreviation search", () => {
    for (const query of [
      "hydraulic cylinder",
      "piston",
      "pressure",
      "fluid mechanics foundations",
      "MPa"
    ]) {
      expect(
        filterSimulationCatalogue([hydraulic], {
          ...emptySimulationFilters,
          query
        })
      ).toHaveLength(1);
    }
    expect(
      filterSimulationCatalogue([hydraulic], {
        ...emptySimulationFilters,
        query: "PLC"
      })
    ).toEqual([]);
  });

  it("finds Bernoulli flow by concept, component, and common symbols", () => {
    for (const query of ["Bernoulli", "contraction", "P2", "flow meter"]) {
      expect(
        filterSimulationCatalogue([bernoulli], {
          ...emptySimulationFilters,
          query
        })
      ).toEqual([bernoulli]);
    }
  });

  it("discovers the review-gated thermodynamics entry without making it actionable", () => {
    for (const query of ["boundary", "closed system", "thermodynamics foundations"]) {
      expect(
        filterSimulationCatalogue([hydraulic, thermal], {
          ...emptySimulationFilters,
          query
        })
      ).toEqual([thermal]);
    }

    expect(
      filterSimulationCatalogue([hydraulic, thermal], {
        ...emptySimulationFilters,
        discipline: "Thermodynamics",
        type: "System"
      })
    ).toEqual([thermal]);
  });

  it("combines discipline, type, difficulty, mode and pathway filters", () => {
    expect(
      filterSimulationCatalogue([hydraulic], {
        query: "force",
        discipline: "Fluid Systems",
        difficulty: "Beginner",
        type: "Component",
        mode: "guided",
        pathway: "all"
      })
    ).toEqual([hydraulic]);

    expect(
      filterSimulationCatalogue([hydraulic], {
        ...emptySimulationFilters,
        discipline: "Electrical",
        type: "Component"
      })
    ).toEqual([]);
  });

  it("keeps all declared discipline and visual type options stable", () => {
    expect(simulationDisciplines).toEqual([
      "Mechanical",
      "Fluid Systems",
      "Thermodynamics",
      "Electrical",
      "Automation",
      "Energy",
      "Future Engineering"
    ]);
    expect(simulationTypes).toEqual([
      "Component",
      "System",
      "Calculation",
      "Schematic",
      "Fault Diagnosis",
      "Design"
    ]);
  });

  it("does not project review-gated simulations or collections to students", () => {
    expect(getPublicSimulationCatalog()).toEqual([]);
    expect(getPublicSimulationCollections()).toEqual([]);
  });

  it("locks required prerequisites but leaves recommended prerequisites operable", () => {
    expect(
      deriveSimulationAvailability({
        catalogueAvailability: "available",
        prerequisitePolicy: "required",
        prerequisiteLessonSlugs: ["basic-fluid-pressure"],
        completedLessonSlugs: []
      })
    ).toBe("locked-by-prerequisite");
    expect(
      deriveSimulationAvailability({
        catalogueAvailability: "available",
        prerequisitePolicy: "recommended",
        prerequisiteLessonSlugs: ["basic-fluid-pressure"],
        completedLessonSlugs: []
      })
    ).toBe("available");
  });

  it("builds recommendations only from real module, prerequisite or attempt evidence", () => {
    expect(
      buildSimulationRecommendations({
        simulations: [hydraulic],
        currentModuleSlugs: [],
        completedLessonSlugs: [],
        recentAttempts: []
      })
    ).toEqual([]);

    expect(
      buildSimulationRecommendations({
        simulations: [hydraulic],
        currentModuleSlugs: ["fluid-mechanics-foundations"],
        completedLessonSlugs: ["basic-fluid-pressure"],
        recentAttempts: []
      })
    ).toEqual([expect.objectContaining({ simulationSlug: "hydraulic-cylinder-force" })]);

    expect(
      buildSimulationRecommendations({
        simulations: [thermal],
        currentModuleSlugs: ["thermodynamics-foundations"],
        completedLessonSlugs: [],
        recentAttempts: []
      })
    ).toEqual([]);
  });

  it("shows competency only from a completed persisted award", () => {
    const attempt: PersistedSimulationAttempt = {
      id: "attempt-1",
      simulationId: "SIM-HYD-CYL-FORCE-001",
      simulationVersion: 1,
      lessonId: "LES-HYD-CYL-FORCE-VISUAL-001",
      studentProfileId: "student-1",
      mode: "guided",
      status: "graded",
      startedAt: "2026-08-27T08:00:00.000Z",
      completedAt: "2026-08-27T08:10:00.000Z",
      inputState: {},
      outputSummary: {},
      measurementsTaken: [],
      diagnosisSubmitted: {},
      competencyAwards: { Operated: 1 }
    };

    expect(verifiedCompetenciesForAttempt(attempt)).toEqual(["Operated"]);
    expect(verifiedCompetenciesForAttempt({ ...attempt, status: "in_progress" })).toEqual(
      []
    );
  });
});
