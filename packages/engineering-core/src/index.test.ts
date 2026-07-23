import { describe, expect, it } from "vitest";

import {
  closedSystemEnergyBalance,
  continuityEquation,
  convertToSi,
  electricalPower,
  fluidVelocity,
  forceFromPressureAndArea,
  getEngineeringEquationMetadata,
  heatingPower,
  hydraulicPower,
  idealGasRelation,
  ohmsLaw,
  parallelResistance,
  pressureFromForceAndArea,
  sensibleHeat,
  seriesResistance,
  volumetricFlowRate
} from "./index";

function expectValidValue(
  result: { calculatedValue: number | null; validity: { status: string } },
  value: number
) {
  expect(result.validity.status).toBe("valid");
  expect(result.calculatedValue).toBeCloseTo(value);
}

function expectInvalid(result: {
  calculatedValue: number | null;
  validity: { status: string; errors: string[] };
}) {
  expect(result.validity.status).toBe("invalid");
  expect(result.calculatedValue).toBeNull();
  expect(result.validity.errors.length).toBeGreaterThan(0);
}

describe("general SI units", () => {
  it("converts only when explicitly requested", () => {
    expectValidValue(
      convertToSi({ quantity: "pressure", value: 2.5, fromUnit: "kPa", toUnit: "Pa" }),
      2_500
    );
  });

  it("rejects unsupported conversions", () => {
    expectInvalid(
      convertToSi({ quantity: "pressure", value: 1, fromUnit: "bar", toUnit: "Pa" })
    );
  });
});

describe("fluid mechanics calculations", () => {
  it("exposes source-gated metadata for pilot equations", () => {
    const pressureMetadata = getEngineeringEquationMetadata("EQ-FLUID-PRESSURE-001");
    const cylinderForceMetadata = getEngineeringEquationMetadata(
      "EQ-FLUID-FORCE-PRESSURE-AREA-001"
    );

    expect(pressureMetadata?.sourceIds).toEqual(["SRC-FLUID-PRESSURE-PLACEHOLDER-001"]);
    expect(pressureMetadata?.engineeringReviewStatus).toBe("Source required");
    expect(cylinderForceMetadata?.sourceIds).toEqual([
      "SRC-HYDRAULIC-CYLINDER-PLACEHOLDER-001"
    ]);
    expect(cylinderForceMetadata?.validityLimits).toContain(
      "Does not include cylinder friction, seal leakage, dynamics, or equipment ratings."
    );
  });

  it("calculates pressure from force and area", () => {
    const result = pressureFromForceAndArea({
      force: { value: 200, unit: "N" },
      area: { value: 0.5, unit: "m^2" }
    });

    expectValidValue(result, 400);
    expect(result.equationId).toBe("EQ-FLUID-PRESSURE-001");
    expect(result.assumptions).toContain("Inputs are SI values.");
  });

  it("handles pressure zero and rejects impossible pressure inputs", () => {
    expectValidValue(
      pressureFromForceAndArea({
        force: { value: 0, unit: "N" },
        area: { value: 1, unit: "m^2" }
      }),
      0
    );
    expectInvalid(
      pressureFromForceAndArea({
        force: { value: -1, unit: "N" },
        area: { value: 1, unit: "m^2" }
      })
    );
  });

  it("rejects pressure division by zero and non-SI pressure inputs", () => {
    expectInvalid(
      pressureFromForceAndArea({
        force: { value: 10, unit: "N" },
        area: { value: 0, unit: "m^2" }
      })
    );
    expectInvalid(
      pressureFromForceAndArea({
        force: { value: 1, unit: "kN" as "N" },
        area: { value: 1, unit: "m^2" }
      })
    );
  });

  it("uses explicit conversion before pressure calculation", () => {
    const force = convertToSi({
      quantity: "force",
      value: 1,
      fromUnit: "kN",
      toUnit: "N"
    });
    const area = convertToSi({
      quantity: "area",
      value: 1_000,
      fromUnit: "cm^2",
      toUnit: "m^2"
    });

    expectValidValue(
      pressureFromForceAndArea({
        force: { value: force.calculatedValue!, unit: "N" },
        area: { value: area.calculatedValue!, unit: "m^2" }
      }),
      10_000
    );
  });

  it("calculates force from pressure and area", () => {
    expectValidValue(
      forceFromPressureAndArea({
        pressure: { value: 400, unit: "Pa" },
        area: { value: 0.5, unit: "m^2" }
      }),
      200
    );
  });

  it("handles force boundary and invalid inputs", () => {
    expectValidValue(
      forceFromPressureAndArea({
        pressure: { value: 0, unit: "Pa" },
        area: { value: 2, unit: "m^2" }
      }),
      0
    );
    expectInvalid(
      forceFromPressureAndArea({
        pressure: { value: -1, unit: "Pa" },
        area: { value: 2, unit: "m^2" }
      })
    );
    expectInvalid(
      forceFromPressureAndArea({
        pressure: { value: 1, unit: "kPa" as "Pa" },
        area: { value: 2, unit: "m^2" }
      })
    );
  });

  it("calculates volumetric flow rate", () => {
    expectValidValue(
      volumetricFlowRate({
        volume: { value: 2, unit: "m^3" },
        time: { value: 4, unit: "s" }
      }),
      0.5
    );
  });

  it("validates volumetric flow boundaries, units, and conversions", () => {
    expectValidValue(
      volumetricFlowRate({
        volume: { value: 0, unit: "m^3" },
        time: { value: 4, unit: "s" }
      }),
      0
    );
    expectInvalid(
      volumetricFlowRate({
        volume: { value: 1, unit: "m^3" },
        time: { value: 0, unit: "s" }
      })
    );
    expectInvalid(
      volumetricFlowRate({
        volume: { value: -1, unit: "m^3" },
        time: { value: 4, unit: "s" }
      })
    );
    expectInvalid(
      volumetricFlowRate({
        volume: { value: 1, unit: "L" as "m^3" },
        time: { value: 4, unit: "s" }
      })
    );
    const volume = convertToSi({
      quantity: "volume",
      value: 500,
      fromUnit: "L",
      toUnit: "m^3"
    });
    expectValidValue(
      volumetricFlowRate({
        volume: { value: volume.calculatedValue!, unit: "m^3" },
        time: { value: 5, unit: "s" }
      }),
      0.1
    );
  });

  it("calculates continuity equation outlet velocity", () => {
    expectValidValue(
      continuityEquation({
        area1: { value: 0.2, unit: "m^2" },
        velocity1: { value: 3, unit: "m/s" },
        area2: { value: 0.1, unit: "m^2" }
      }),
      6
    );
  });

  it("validates continuity boundaries, units, and physical values", () => {
    expectValidValue(
      continuityEquation({
        area1: { value: 0.2, unit: "m^2" },
        velocity1: { value: 0, unit: "m/s" },
        area2: { value: 0.1, unit: "m^2" }
      }),
      0
    );
    expectInvalid(
      continuityEquation({
        area1: { value: 0, unit: "m^2" },
        velocity1: { value: 1, unit: "m/s" },
        area2: { value: 0.1, unit: "m^2" }
      })
    );
    expectInvalid(
      continuityEquation({
        area1: { value: 0.1, unit: "m^2" },
        velocity1: { value: -1, unit: "m/s" },
        area2: { value: 0.1, unit: "m^2" }
      })
    );
    expectInvalid(
      continuityEquation({
        area1: { value: 1, unit: "cm^2" as "m^2" },
        velocity1: { value: 1, unit: "m/s" },
        area2: { value: 1, unit: "m^2" }
      })
    );
  });

  it("calculates fluid velocity", () => {
    expectValidValue(
      fluidVelocity({
        flowRate: { value: 0.4, unit: "m^3/s" },
        area: { value: 0.2, unit: "m^2" }
      }),
      2
    );
  });

  it("validates velocity boundaries, units, conversions, and physical values", () => {
    expectValidValue(
      fluidVelocity({
        flowRate: { value: 0, unit: "m^3/s" },
        area: { value: 0.2, unit: "m^2" }
      }),
      0
    );
    expectInvalid(
      fluidVelocity({
        flowRate: { value: 1, unit: "m^3/s" },
        area: { value: 0, unit: "m^2" }
      })
    );
    expectInvalid(
      fluidVelocity({
        flowRate: { value: -1, unit: "m^3/s" },
        area: { value: 0.2, unit: "m^2" }
      })
    );
    expectInvalid(
      fluidVelocity({
        flowRate: { value: 1, unit: "L/s" as "m^3/s" },
        area: { value: 1, unit: "m^2" }
      })
    );
  });

  it("calculates hydraulic power", () => {
    expectValidValue(
      hydraulicPower({
        pressureDifference: { value: 100_000, unit: "Pa" },
        flowRate: { value: 0.02, unit: "m^3/s" }
      }),
      2_000
    );
  });

  it("validates hydraulic power boundary, units, conversion, and physical values", () => {
    expectValidValue(
      hydraulicPower({
        pressureDifference: { value: 0, unit: "Pa" },
        flowRate: { value: 0.02, unit: "m^3/s" }
      }),
      0
    );
    expectInvalid(
      hydraulicPower({
        pressureDifference: { value: -1, unit: "Pa" },
        flowRate: { value: 0.02, unit: "m^3/s" }
      })
    );
    expectInvalid(
      hydraulicPower({
        pressureDifference: { value: 1, unit: "kPa" as "Pa" },
        flowRate: { value: 0.02, unit: "m^3/s" }
      })
    );
    const pressure = convertToSi({
      quantity: "pressure",
      value: 100,
      fromUnit: "kPa",
      toUnit: "Pa"
    });
    expectValidValue(
      hydraulicPower({
        pressureDifference: { value: pressure.calculatedValue!, unit: "Pa" },
        flowRate: { value: 0.02, unit: "m^3/s" }
      }),
      2_000
    );
  });
});

describe("thermodynamics calculations", () => {
  it("calculates sensible heat", () => {
    expectValidValue(
      sensibleHeat({
        mass: { value: 2, unit: "kg" },
        specificHeatCapacity: { value: 4_180, unit: "J/(kg*K)" },
        temperatureChange: { value: 10, unit: "K" }
      }),
      83_600
    );
  });

  it("validates sensible heat boundaries, units, conversions, and physical values", () => {
    expectValidValue(
      sensibleHeat({
        mass: { value: 0, unit: "kg" },
        specificHeatCapacity: { value: 4_180, unit: "J/(kg*K)" },
        temperatureChange: { value: 10, unit: "K" }
      }),
      0
    );
    expectInvalid(
      sensibleHeat({
        mass: { value: -1, unit: "kg" },
        specificHeatCapacity: { value: 4_180, unit: "J/(kg*K)" },
        temperatureChange: { value: 10, unit: "K" }
      })
    );
    expectInvalid(
      sensibleHeat({
        mass: { value: 1, unit: "g" as "kg" },
        specificHeatCapacity: { value: 4_180, unit: "J/(kg*K)" },
        temperatureChange: { value: 10, unit: "K" }
      })
    );
    const mass = convertToSi({
      quantity: "mass",
      value: 2_000,
      fromUnit: "g",
      toUnit: "kg"
    });
    expectValidValue(
      sensibleHeat({
        mass: { value: mass.calculatedValue!, unit: "kg" },
        specificHeatCapacity: { value: 4_180, unit: "J/(kg*K)" },
        temperatureChange: { value: 10, unit: "K" }
      }),
      83_600
    );
  });

  it("calculates heating power", () => {
    expectValidValue(
      heatingPower({
        massFlowRate: { value: 0.5, unit: "kg/s" },
        specificHeatCapacity: { value: 4_180, unit: "J/(kg*K)" },
        temperatureChange: { value: 20, unit: "K" }
      }),
      41_800
    );
  });

  it("validates heating power boundaries, units, and physical values", () => {
    expectValidValue(
      heatingPower({
        massFlowRate: { value: 0, unit: "kg/s" },
        specificHeatCapacity: { value: 4_180, unit: "J/(kg*K)" },
        temperatureChange: { value: 20, unit: "K" }
      }),
      0
    );
    expectInvalid(
      heatingPower({
        massFlowRate: { value: -1, unit: "kg/s" },
        specificHeatCapacity: { value: 4_180, unit: "J/(kg*K)" },
        temperatureChange: { value: 20, unit: "K" }
      })
    );
    expectInvalid(
      heatingPower({
        massFlowRate: { value: 1, unit: "kg/min" as "kg/s" },
        specificHeatCapacity: { value: 4_180, unit: "J/(kg*K)" },
        temperatureChange: { value: 20, unit: "K" }
      })
    );
  });

  it("calculates the ideal gas relation", () => {
    expectValidValue(
      idealGasRelation({
        volume: { value: 1, unit: "m^3" },
        amountOfSubstance: { value: 1, unit: "mol" },
        temperature: { value: 300, unit: "K" }
      }),
      2_494.338785445972
    );
  });

  it("validates ideal gas boundaries, units, conversions, and physical values", () => {
    expectInvalid(
      idealGasRelation({
        volume: { value: 0, unit: "m^3" },
        amountOfSubstance: { value: 1, unit: "mol" },
        temperature: { value: 300, unit: "K" }
      })
    );
    expectInvalid(
      idealGasRelation({
        pressure: { value: 1, unit: "kPa" as "Pa" },
        volume: { value: 1, unit: "m^3" },
        amountOfSubstance: { value: 1, unit: "mol" }
      })
    );
    const pressure = convertToSi({
      quantity: "pressure",
      value: 101.325,
      fromUnit: "kPa",
      toUnit: "Pa"
    });
    expectValidValue(
      idealGasRelation({
        pressure: { value: pressure.calculatedValue!, unit: "Pa" },
        volume: { value: 1, unit: "m^3" },
        temperature: { value: 300, unit: "K" }
      }),
      40.621987651475294
    );
  });

  it("calculates closed-system energy balance", () => {
    expectValidValue(
      closedSystemEnergyBalance({
        heatTransfer: { value: 1_000, unit: "J" },
        workDoneBySystem: { value: 250, unit: "J" }
      }),
      750
    );
  });

  it("validates energy balance signed boundary, units, conversions, and physical validity", () => {
    expectValidValue(
      closedSystemEnergyBalance({
        heatTransfer: { value: 0, unit: "J" },
        workDoneBySystem: { value: 250, unit: "J" }
      }),
      -250
    );
    expectInvalid(
      closedSystemEnergyBalance({
        heatTransfer: { value: 1, unit: "kJ" as "J" },
        workDoneBySystem: { value: 250, unit: "J" }
      })
    );
    const heatTransfer = convertToSi({
      quantity: "energy",
      value: 1,
      fromUnit: "kJ",
      toUnit: "J"
    });
    expectValidValue(
      closedSystemEnergyBalance({
        heatTransfer: { value: heatTransfer.calculatedValue!, unit: "J" },
        workDoneBySystem: { value: 250, unit: "J" }
      }),
      750
    );
  });
});

describe("electrical fundamentals calculations", () => {
  it("calculates Ohm's law", () => {
    expectValidValue(
      ohmsLaw({
        voltage: { value: 12, unit: "V" },
        resistance: { value: 6, unit: "ohm" }
      }),
      2
    );
  });

  it("validates Ohm's law boundary, units, conversions, and physical values", () => {
    expectValidValue(
      ohmsLaw({
        current: { value: 0, unit: "A" },
        resistance: { value: 6, unit: "ohm" }
      }),
      0
    );
    expectInvalid(
      ohmsLaw({
        voltage: { value: 12, unit: "V" },
        resistance: { value: 0, unit: "ohm" }
      })
    );
    expectInvalid(
      ohmsLaw({
        voltage: { value: 12, unit: "V" },
        resistance: { value: -1, unit: "ohm" }
      })
    );
    expectInvalid(
      ohmsLaw({
        voltage: { value: 12, unit: "V" },
        resistance: { value: 6, unit: "kOhm" as "ohm" }
      })
    );
    const resistance = convertToSi({
      quantity: "resistance",
      value: 1,
      fromUnit: "kOhm",
      toUnit: "ohm"
    });
    expectValidValue(
      ohmsLaw({
        voltage: { value: 10, unit: "V" },
        resistance: { value: resistance.calculatedValue!, unit: "ohm" }
      }),
      0.01
    );
  });

  it("calculates electrical power", () => {
    expectValidValue(
      electricalPower({
        voltage: { value: 12, unit: "V" },
        current: { value: 2, unit: "A" }
      }),
      24
    );
  });

  it("validates electrical power boundary, units, conversions, and physical validity", () => {
    expectValidValue(
      electricalPower({
        voltage: { value: 0, unit: "V" },
        current: { value: 2, unit: "A" }
      }),
      0
    );
    expectInvalid(
      electricalPower({
        voltage: { value: 12, unit: "V" },
        current: { value: 2, unit: "mA" as "A" }
      })
    );
    const current = convertToSi({
      quantity: "current",
      value: 500,
      fromUnit: "mA",
      toUnit: "A"
    });
    expectValidValue(
      electricalPower({
        voltage: { value: 12, unit: "V" },
        current: { value: current.calculatedValue!, unit: "A" }
      }),
      6
    );
  });

  it("calculates series resistance", () => {
    expectValidValue(
      seriesResistance({
        resistances: [
          { value: 10, unit: "ohm" },
          { value: 20, unit: "ohm" }
        ]
      }),
      30
    );
  });

  it("validates series resistance boundary, units, conversions, and physical values", () => {
    expectValidValue(
      seriesResistance({
        resistances: [
          { value: 0, unit: "ohm" },
          { value: 20, unit: "ohm" }
        ]
      }),
      20
    );
    expectInvalid(seriesResistance({ resistances: [] }));
    expectInvalid(seriesResistance({ resistances: [{ value: -1, unit: "ohm" }] }));
    expectInvalid(
      seriesResistance({ resistances: [{ value: 1, unit: "kOhm" as "ohm" }] })
    );
  });

  it("calculates parallel resistance", () => {
    expectValidValue(
      parallelResistance({
        resistances: [
          { value: 10, unit: "ohm" },
          { value: 10, unit: "ohm" }
        ]
      }),
      5
    );
  });

  it("validates parallel resistance boundary, units, conversions, and physical values", () => {
    const zeroBranch = parallelResistance({
      resistances: [
        { value: 0, unit: "ohm" },
        { value: 20, unit: "ohm" }
      ]
    });
    expectValidValue(zeroBranch, 0);
    expect(zeroBranch.warnings).toContain(
      "Zero-ohm branch treated as an ideal short-circuit boundary case."
    );
    expectInvalid(parallelResistance({ resistances: [] }));
    expectInvalid(parallelResistance({ resistances: [{ value: -1, unit: "ohm" }] }));
    expectInvalid(
      parallelResistance({ resistances: [{ value: 1, unit: "kOhm" as "ohm" }] })
    );
    const resistance = convertToSi({
      quantity: "resistance",
      value: 1,
      fromUnit: "kOhm",
      toUnit: "ohm"
    });
    expectValidValue(
      parallelResistance({
        resistances: [
          { value: resistance.calculatedValue!, unit: "ohm" },
          { value: 1_000, unit: "ohm" }
        ]
      }),
      500
    );
  });
});
