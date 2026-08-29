export type ValidityStatus = "valid" | "invalid";

export type UnitValue<Unit extends string> = {
  value: number;
  unit: Unit;
};

export type CalculationInput = Record<string, UnitValue<string> | number | string>;

export type CalculationValidity = {
  status: ValidityStatus;
  errors: string[];
};

export type EngineeringCalculationResult<Unit extends string> = {
  calculatedValue: number | null;
  unit: Unit;
  inputValues: CalculationInput;
  equationId: string;
  calculationSteps: string[];
  assumptions: string[];
  warnings: string[];
  validity: CalculationValidity;
};

export type EngineeringEquationReviewStatus =
  | "Source required"
  | "Source checked"
  | "Equation checked"
  | "Engineering review required"
  | "Approved for student use";

export type EngineeringEquationMetadata = {
  equationId: string;
  expression: string;
  symbols: Array<{ symbol: string; name: string; unit: string }>;
  inputUnits: Record<string, string>;
  outputUnit: string;
  assumptions: string[];
  validityLimits: string[];
  sourceIds: string[];
  sourceReferences: Array<{ sourceId: string; section?: string; pages?: string }>;
  engineeringReviewStatus: EngineeringEquationReviewStatus;
};

export const engineeringEquationMetadata: Record<string, EngineeringEquationMetadata> = {
  "EQ-SI-CONVERSION-EXPLICIT-001": {
    equationId: "EQ-SI-CONVERSION-EXPLICIT-001",
    expression: "value_SI = value * conversionFactor",
    symbols: [
      { symbol: "value", name: "input value", unit: "source unit" },
      { symbol: "conversionFactor", name: "explicit conversion factor", unit: "varies" }
    ],
    inputUnits: { value: "caller-selected explicit source unit" },
    outputUnit: "caller-selected SI target unit",
    assumptions: [
      "The caller explicitly requests conversion before using a calculation function."
    ],
    validityLimits: [
      "Only conversions declared in the unit-conversion table are supported.",
      "No conversion is applied silently."
    ],
    sourceIds: ["SRC-NIST-SP330-2019"],
    sourceReferences: [
      {
        sourceId: "SRC-NIST-SP330-2019",
        section: "Table 7: SI prefixes",
        pages: "23"
      },
      {
        sourceId: "SRC-NIST-SP330-2019",
        section: "Table 8: Non-SI units accepted for use with SI units",
        pages: "25"
      }
    ],
    engineeringReviewStatus: "Equation checked"
  },
  "EQ-FLUID-PRESSURE-001": {
    equationId: "EQ-FLUID-PRESSURE-001",
    expression: "p = F / A",
    symbols: [
      { symbol: "p", name: "pressure", unit: "Pa" },
      { symbol: "F", name: "normal force", unit: "N" },
      { symbol: "A", name: "area", unit: "m^2" }
    ],
    inputUnits: { F: "N", A: "m^2" },
    outputUnit: "Pa",
    assumptions: [
      "Force is applied normally over the stated area.",
      "Area is greater than zero.",
      "Inputs are SI values."
    ],
    validityLimits: [
      "Introductory static-pressure relationship only.",
      "Not a pressure-vessel or equipment-rating calculation."
    ],
    sourceIds: ["SRC-OPENSTAX-COLLEGE-PHYSICS-2012"],
    sourceReferences: [
      {
        sourceId: "SRC-OPENSTAX-COLLEGE-PHYSICS-2012",
        section: "11.3 Pressure"
      }
    ],
    engineeringReviewStatus: "Equation checked"
  },
  "EQ-FLUID-FORCE-PRESSURE-AREA-001": {
    equationId: "EQ-FLUID-FORCE-PRESSURE-AREA-001",
    expression: "F = p * A",
    symbols: [
      { symbol: "F", name: "force", unit: "N" },
      { symbol: "p", name: "pressure", unit: "Pa" },
      { symbol: "A", name: "area", unit: "m^2" }
    ],
    inputUnits: { p: "Pa", A: "m^2" },
    outputUnit: "N",
    assumptions: ["Pressure is uniform across the stated area.", "Inputs are SI values."],
    validityLimits: [
      "Ideal training relationship only.",
      "Does not include cylinder friction, seal leakage, dynamics, or equipment ratings."
    ],
    sourceIds: ["SRC-PARKER-140H8-CYLINDER-2024"],
    sourceReferences: [
      {
        sourceId: "SRC-PARKER-140H8-CYLINDER-2024",
        section: "Theoretical Push and Pull Forces",
        pages: "Catalog p. 26 (PDF p. 28)"
      }
    ],
    engineeringReviewStatus: "Equation checked"
  },
  "EQ-HYD-PISTON-AREA-DIAMETER-001": {
    equationId: "EQ-HYD-PISTON-AREA-DIAMETER-001",
    expression: "A = pi * D^2 / 4",
    symbols: [
      { symbol: "A", name: "cap-end piston area", unit: "m^2" },
      { symbol: "D", name: "piston diameter", unit: "m" }
    ],
    inputUnits: { D: "m" },
    outputUnit: "m^2",
    assumptions: [
      "The cap-end piston face is circular.",
      "Diameter is positive and supplied in metres.",
      "The result is a geometric area, not a cylinder rating."
    ],
    validityLimits: [
      "Cap-end full piston area only.",
      "Does not calculate rod-side annular area, tolerances, deformation, or leakage."
    ],
    sourceIds: ["SRC-PARKER-140H8-CYLINDER-2024"],
    sourceReferences: [
      {
        sourceId: "SRC-PARKER-140H8-CYLINDER-2024",
        section: "Theoretical Push and Pull Forces",
        pages: "Catalog p. 26 (PDF p. 28)"
      }
    ],
    engineeringReviewStatus: "Equation checked"
  },
  "EQ-GEOMETRY-CIRCULAR-AREA-DIAMETER-001": {
    equationId: "EQ-GEOMETRY-CIRCULAR-AREA-DIAMETER-001",
    expression: "A = pi * D^2 / 4",
    symbols: [
      { symbol: "A", name: "circular cross-sectional area", unit: "m^2" },
      { symbol: "D", name: "internal diameter", unit: "m" }
    ],
    inputUnits: { D: "m" },
    outputUnit: "m^2",
    assumptions: [
      "The section is circular.",
      "Diameter is positive and supplied in metres."
    ],
    validityLimits: [
      "Geometric area only; no tolerance, deformation, or roughness model."
    ],
    sourceIds: ["SRC-OPENSTAX-COLLEGE-PHYSICS-2E-2022"],
    sourceReferences: [
      {
        sourceId: "SRC-OPENSTAX-COLLEGE-PHYSICS-2E-2022",
        section: "12.1 Flow Rate and Its Relation to Velocity"
      }
    ],
    engineeringReviewStatus: "Engineering review required"
  },
  "EQ-FLUID-VOLUMETRIC-FLOW-001": {
    equationId: "EQ-FLUID-VOLUMETRIC-FLOW-001",
    expression: "Q = V / t",
    symbols: [
      { symbol: "Q", name: "volumetric flow rate", unit: "m^3/s" },
      { symbol: "V", name: "fluid volume", unit: "m^3" },
      { symbol: "t", name: "elapsed time", unit: "s" }
    ],
    inputUnits: { V: "m^3", t: "s" },
    outputUnit: "m^3/s",
    assumptions: ["Volume passes the stated section during the stated interval."],
    validityLimits: ["Elapsed time must be greater than zero."],
    sourceIds: ["SRC-OPENSTAX-COLLEGE-PHYSICS-2E-2022"],
    sourceReferences: [
      {
        sourceId: "SRC-OPENSTAX-COLLEGE-PHYSICS-2E-2022",
        section: "12.1 Flow Rate and Its Relation to Velocity"
      }
    ],
    engineeringReviewStatus: "Engineering review required"
  },
  "EQ-FLUID-VELOCITY-FLOW-AREA-001": {
    equationId: "EQ-FLUID-VELOCITY-FLOW-AREA-001",
    expression: "v = Q / A",
    symbols: [
      { symbol: "v", name: "average fluid velocity", unit: "m/s" },
      { symbol: "Q", name: "volumetric flow rate", unit: "m^3/s" },
      { symbol: "A", name: "cross-sectional area", unit: "m^2" }
    ],
    inputUnits: { Q: "m^3/s", A: "m^2" },
    outputUnit: "m/s",
    assumptions: ["The velocity is the average across the stated section."],
    validityLimits: ["Area must be greater than zero."],
    sourceIds: ["SRC-OPENSTAX-COLLEGE-PHYSICS-2E-2022"],
    sourceReferences: [
      {
        sourceId: "SRC-OPENSTAX-COLLEGE-PHYSICS-2E-2022",
        section: "12.1 Flow Rate and Its Relation to Velocity"
      }
    ],
    engineeringReviewStatus: "Engineering review required"
  },
  "EQ-FLUID-CONTINUITY-INCOMPRESSIBLE-001": {
    equationId: "EQ-FLUID-CONTINUITY-INCOMPRESSIBLE-001",
    expression: "A1 * v1 = A2 * v2",
    symbols: [
      { symbol: "A1", name: "section 1 area", unit: "m^2" },
      { symbol: "v1", name: "section 1 average velocity", unit: "m/s" },
      { symbol: "A2", name: "section 2 area", unit: "m^2" },
      { symbol: "v2", name: "section 2 average velocity", unit: "m/s" }
    ],
    inputUnits: { A1: "m^2", v1: "m/s", A2: "m^2" },
    outputUnit: "m/s",
    assumptions: [
      "Flow is steady and incompressible.",
      "There is no leakage between sections."
    ],
    validityLimits: ["Both cross-sectional areas must be greater than zero."],
    sourceIds: ["SRC-OPENSTAX-COLLEGE-PHYSICS-2E-2022"],
    sourceReferences: [
      {
        sourceId: "SRC-OPENSTAX-COLLEGE-PHYSICS-2E-2022",
        section: "12.1 Flow Rate and Its Relation to Velocity"
      }
    ],
    engineeringReviewStatus: "Engineering review required"
  },
  "EQ-FLUID-BERNOULLI-TWO-POINT-001": {
    equationId: "EQ-FLUID-BERNOULLI-TWO-POINT-001",
    expression: "P1 + rho*v1^2/2 + rho*g*z1 = P2 + rho*v2^2/2 + rho*g*z2",
    symbols: [
      { symbol: "P", name: "absolute pressure", unit: "Pa" },
      { symbol: "rho", name: "fluid density", unit: "kg/m^3" },
      { symbol: "v", name: "average fluid velocity", unit: "m/s" },
      { symbol: "g", name: "gravitational acceleration parameter", unit: "m/s^2" },
      { symbol: "z", name: "elevation above the selected reference", unit: "m" }
    ],
    inputUnits: {
      P1: "Pa",
      rho: "kg/m^3",
      v1: "m/s",
      v2: "m/s",
      g: "m/s^2",
      z1: "m",
      z2: "m"
    },
    outputUnit: "Pa",
    assumptions: [
      "Flow is steady, incompressible, and frictionless along the modelled path.",
      "No pump work, turbine work, heat transfer, or loss term is included."
    ],
    validityLimits: [
      "The calculated absolute pressure must remain greater than zero.",
      "The model does not predict turbulence, cavitation, or component ratings."
    ],
    sourceIds: ["SRC-OPENSTAX-COLLEGE-PHYSICS-2E-2022", "SRC-NASA-GLENN-BERNOULLI"],
    sourceReferences: [
      {
        sourceId: "SRC-OPENSTAX-COLLEGE-PHYSICS-2E-2022",
        section: "12.2 Bernoulli's Equation"
      },
      {
        sourceId: "SRC-NASA-GLENN-BERNOULLI",
        section: "Assumptions and limitations"
      }
    ],
    engineeringReviewStatus: "Engineering review required"
  },
  "EQ-FLUID-PRESSURE-HEAD-001": {
    equationId: "EQ-FLUID-PRESSURE-HEAD-001",
    expression: "h_p = P / (rho * g)",
    symbols: [
      { symbol: "h_p", name: "pressure head", unit: "m" },
      { symbol: "P", name: "absolute pressure", unit: "Pa" },
      { symbol: "rho", name: "fluid density", unit: "kg/m^3" },
      { symbol: "g", name: "gravitational acceleration parameter", unit: "m/s^2" }
    ],
    inputUnits: { P: "Pa", rho: "kg/m^3", g: "m/s^2" },
    outputUnit: "m",
    assumptions: [
      "Density and gravitational acceleration are positive model parameters."
    ],
    validityLimits: [
      "Head is referenced to the modelled fluid and selected gravitational parameter."
    ],
    sourceIds: ["SRC-OPENSTAX-COLLEGE-PHYSICS-2E-2022"],
    sourceReferences: [
      {
        sourceId: "SRC-OPENSTAX-COLLEGE-PHYSICS-2E-2022",
        section: "12.2 Bernoulli's Equation"
      }
    ],
    engineeringReviewStatus: "Engineering review required"
  },
  "EQ-FLUID-VELOCITY-HEAD-001": {
    equationId: "EQ-FLUID-VELOCITY-HEAD-001",
    expression: "h_v = v^2 / (2 * g)",
    symbols: [
      { symbol: "h_v", name: "velocity head", unit: "m" },
      { symbol: "v", name: "average fluid velocity", unit: "m/s" },
      { symbol: "g", name: "gravitational acceleration parameter", unit: "m/s^2" }
    ],
    inputUnits: { v: "m/s", g: "m/s^2" },
    outputUnit: "m",
    assumptions: ["Velocity is the section-average model velocity."],
    validityLimits: ["Gravitational acceleration must be greater than zero."],
    sourceIds: ["SRC-OPENSTAX-COLLEGE-PHYSICS-2E-2022"],
    sourceReferences: [
      {
        sourceId: "SRC-OPENSTAX-COLLEGE-PHYSICS-2E-2022",
        section: "12.2 Bernoulli's Equation"
      }
    ],
    engineeringReviewStatus: "Engineering review required"
  },
  "EQ-FLUID-TOTAL-HEAD-001": {
    equationId: "EQ-FLUID-TOTAL-HEAD-001",
    expression: "H = P/(rho*g) + v^2/(2*g) + z",
    symbols: [
      { symbol: "H", name: "total ideal head", unit: "m" },
      { symbol: "P", name: "absolute pressure", unit: "Pa" },
      { symbol: "rho", name: "fluid density", unit: "kg/m^3" },
      { symbol: "v", name: "average fluid velocity", unit: "m/s" },
      { symbol: "g", name: "gravitational acceleration parameter", unit: "m/s^2" },
      { symbol: "z", name: "elevation above the selected reference", unit: "m" }
    ],
    inputUnits: { P: "Pa", rho: "kg/m^3", v: "m/s", g: "m/s^2", z: "m" },
    outputUnit: "m",
    assumptions: ["Bernoulli model assumptions apply to the stated point."],
    validityLimits: [
      "No loss, machine-work, heat-transfer, or compressibility term is included."
    ],
    sourceIds: ["SRC-OPENSTAX-COLLEGE-PHYSICS-2E-2022", "SRC-NASA-GLENN-BERNOULLI"],
    sourceReferences: [
      {
        sourceId: "SRC-OPENSTAX-COLLEGE-PHYSICS-2E-2022",
        section: "12.2 Bernoulli's Equation"
      }
    ],
    engineeringReviewStatus: "Engineering review required"
  }
};

export function getEngineeringEquationMetadata(equationId: string) {
  return engineeringEquationMetadata[equationId];
}

type ValidResultInput<Unit extends string> = {
  calculatedValue: number;
  unit: Unit;
  inputValues: CalculationInput;
  equationId: string;
  calculationSteps: string[];
  assumptions: string[];
  warnings?: string[];
};

type Quantity =
  | "force"
  | "length"
  | "area"
  | "pressure"
  | "volume"
  | "volumetricFlowRate"
  | "time"
  | "mass"
  | "massFlowRate"
  | "specificHeatCapacity"
  | "temperatureDifference"
  | "temperature"
  | "amountOfSubstance"
  | "energy"
  | "power"
  | "voltage"
  | "current"
  | "resistance";

const conversionFactors: Record<
  Quantity,
  Record<string, { unit: string; factor: number }>
> = {
  force: {
    kN: { unit: "N", factor: 1_000 }
  },
  length: {
    mm: { unit: "m", factor: 0.001 }
  },
  area: {
    "cm^2": { unit: "m^2", factor: 0.0001 },
    "mm^2": { unit: "m^2", factor: 0.000001 }
  },
  pressure: {
    kPa: { unit: "Pa", factor: 1_000 },
    MPa: { unit: "Pa", factor: 1_000_000 }
  },
  volume: {
    L: { unit: "m^3", factor: 0.001 }
  },
  volumetricFlowRate: {
    "L/s": { unit: "m^3/s", factor: 0.001 },
    "L/min": { unit: "m^3/s", factor: 0.001 / 60 }
  },
  time: {
    min: { unit: "s", factor: 60 }
  },
  mass: {
    g: { unit: "kg", factor: 0.001 }
  },
  massFlowRate: {},
  specificHeatCapacity: {},
  temperatureDifference: {},
  temperature: {},
  amountOfSubstance: {},
  energy: {
    kJ: { unit: "J", factor: 1_000 }
  },
  power: {
    kW: { unit: "W", factor: 1_000 }
  },
  voltage: {},
  current: {
    mA: { unit: "A", factor: 0.001 }
  },
  resistance: {
    kOhm: { unit: "ohm", factor: 1_000 }
  }
};

export function convertToSi<Unit extends string>({
  quantity,
  value,
  fromUnit,
  toUnit
}: {
  quantity: Quantity;
  value: number;
  fromUnit: string;
  toUnit: Unit;
}): EngineeringCalculationResult<Unit> {
  const errors = validateFinite({ value, unit: fromUnit }, "conversion input");
  const conversion = conversionFactors[quantity][fromUnit];

  if (!conversion || conversion.unit !== toUnit) {
    errors.push(`Unsupported conversion from ${fromUnit} to ${toUnit} for ${quantity}.`);
  }

  if (errors.length > 0 || !conversion) {
    return invalidResult({
      unit: toUnit,
      inputValues: { quantity, value: { value, unit: fromUnit }, targetUnit: toUnit },
      equationId: "EQ-SI-CONVERSION-EXPLICIT-001",
      errors,
      assumptions: [
        "Conversions are explicit and are never applied silently inside calculations."
      ]
    });
  }

  return validResult({
    calculatedValue: value * conversion.factor,
    unit: toUnit,
    inputValues: { quantity, value: { value, unit: fromUnit }, targetUnit: toUnit },
    equationId: "EQ-SI-CONVERSION-EXPLICIT-001",
    calculationSteps: [
      `Confirm requested ${quantity} conversion from ${fromUnit} to ${toUnit}.`,
      `Multiply ${value} ${fromUnit} by ${conversion.factor}.`
    ],
    assumptions: ["The caller explicitly requested this conversion before calculation."]
  });
}

export function convertFromSi<Unit extends string>({
  quantity,
  value,
  fromUnit,
  toUnit
}: {
  quantity: Quantity;
  value: number;
  fromUnit: string;
  toUnit: Unit;
}): EngineeringCalculationResult<Unit> {
  const errors = validateFinite({ value, unit: fromUnit }, "conversion input");
  const conversion = conversionFactors[quantity][toUnit];

  if (!conversion || conversion.unit !== fromUnit) {
    errors.push(`Unsupported conversion from ${fromUnit} to ${toUnit} for ${quantity}.`);
  }

  if (errors.length > 0 || !conversion) {
    return invalidResult({
      unit: toUnit,
      inputValues: { quantity, value: { value, unit: fromUnit }, targetUnit: toUnit },
      equationId: "EQ-SI-CONVERSION-EXPLICIT-001",
      errors,
      assumptions: [
        "Display conversions are explicit and are never applied inside governing calculations."
      ]
    });
  }

  return validResult({
    calculatedValue: value / conversion.factor,
    unit: toUnit,
    inputValues: { quantity, value: { value, unit: fromUnit }, targetUnit: toUnit },
    equationId: "EQ-SI-CONVERSION-EXPLICIT-001",
    calculationSteps: [
      `Confirm requested ${quantity} display conversion from ${fromUnit} to ${toUnit}.`,
      `Divide ${value} ${fromUnit} by ${conversion.factor}.`
    ],
    assumptions: ["The caller explicitly requested this display conversion."]
  });
}

export type PressureFromForceAreaInput = {
  force: UnitValue<"N">;
  area: UnitValue<"m^2">;
};

export function pressureFromForceAndArea({
  force,
  area
}: PressureFromForceAreaInput): EngineeringCalculationResult<"Pa"> {
  return calculate({
    unit: "Pa",
    inputValues: { force, area },
    equationId: "EQ-FLUID-PRESSURE-001",
    errors: [
      ...validateUnit(force, "N", "force"),
      ...validateUnit(area, "m^2", "area"),
      ...validateNonNegative(force.value, "force"),
      ...validateGreaterThanZero(area.value, "area")
    ],
    assumptions: [
      "Force is applied normally over the stated area.",
      "Inputs are SI values."
    ],
    steps: [`p = F / A`, `p = ${force.value} / ${area.value}`],
    compute: () => force.value / area.value
  });
}

export type ForceFromPressureAreaInput = {
  pressure: UnitValue<"Pa">;
  area: UnitValue<"m^2">;
};

export function forceFromPressureAndArea({
  pressure,
  area
}: ForceFromPressureAreaInput): EngineeringCalculationResult<"N"> {
  return calculate({
    unit: "N",
    inputValues: { pressure, area },
    equationId: "EQ-FLUID-FORCE-PRESSURE-AREA-001",
    errors: [
      ...validateUnit(pressure, "Pa", "pressure"),
      ...validateUnit(area, "m^2", "area"),
      ...validateNonNegative(pressure.value, "pressure"),
      ...validateNonNegative(area.value, "area")
    ],
    assumptions: ["Pressure is uniform across the stated area.", "Inputs are SI values."],
    steps: [`F = p * A`, `F = ${pressure.value} * ${area.value}`],
    compute: () => pressure.value * area.value
  });
}

export type PistonAreaFromDiameterInput = {
  diameter: UnitValue<"m">;
};

export function pistonAreaFromDiameter({
  diameter
}: PistonAreaFromDiameterInput): EngineeringCalculationResult<"m^2"> {
  return calculate({
    unit: "m^2",
    inputValues: { diameter },
    equationId: "EQ-HYD-PISTON-AREA-DIAMETER-001",
    errors: [
      ...validateUnit(diameter, "m", "diameter"),
      ...validateGreaterThanZero(diameter.value, "diameter")
    ],
    assumptions: [
      "The cap-end piston face is circular.",
      "Diameter is supplied in metres.",
      "The result is a geometric area, not an equipment rating."
    ],
    steps: ["A = pi * D^2 / 4", `A = pi * (${diameter.value})^2 / 4`],
    compute: () => (Math.PI * diameter.value ** 2) / 4
  });
}

export type CircularAreaFromDiameterInput = {
  diameter: UnitValue<"m">;
};

export function circularAreaFromDiameter({
  diameter
}: CircularAreaFromDiameterInput): EngineeringCalculationResult<"m^2"> {
  return calculate({
    unit: "m^2",
    inputValues: { diameter },
    equationId: "EQ-GEOMETRY-CIRCULAR-AREA-DIAMETER-001",
    errors: [
      ...validateUnit(diameter, "m", "diameter"),
      ...validateGreaterThanZero(diameter.value, "diameter")
    ],
    assumptions: ["The section is circular.", "Diameter is supplied in metres."],
    steps: ["A = pi * D^2 / 4", `A = pi * (${diameter.value})^2 / 4`],
    compute: () => (Math.PI * diameter.value ** 2) / 4
  });
}

export type VolumetricFlowRateInput = {
  volume: UnitValue<"m^3">;
  time: UnitValue<"s">;
};

export function volumetricFlowRate({
  volume,
  time
}: VolumetricFlowRateInput): EngineeringCalculationResult<"m^3/s"> {
  return calculate({
    unit: "m^3/s",
    inputValues: { volume, time },
    equationId: "EQ-FLUID-VOLUMETRIC-FLOW-001",
    errors: [
      ...validateUnit(volume, "m^3", "volume"),
      ...validateUnit(time, "s", "time"),
      ...validateNonNegative(volume.value, "volume"),
      ...validateGreaterThanZero(time.value, "time")
    ],
    assumptions: [
      "Volume is measured over the stated time interval.",
      "Inputs are SI values."
    ],
    steps: [`Q = V / t`, `Q = ${volume.value} / ${time.value}`],
    compute: () => volume.value / time.value
  });
}

export type ContinuityEquationInput = {
  area1: UnitValue<"m^2">;
  velocity1: UnitValue<"m/s">;
  area2: UnitValue<"m^2">;
};

export function continuityEquation({
  area1,
  velocity1,
  area2
}: ContinuityEquationInput): EngineeringCalculationResult<"m/s"> {
  return calculate({
    unit: "m/s",
    inputValues: { area1, velocity1, area2 },
    equationId: "EQ-FLUID-CONTINUITY-INCOMPRESSIBLE-001",
    errors: [
      ...validateUnit(area1, "m^2", "area1"),
      ...validateUnit(velocity1, "m/s", "velocity1"),
      ...validateUnit(area2, "m^2", "area2"),
      ...validateGreaterThanZero(area1.value, "area1"),
      ...validateNonNegative(velocity1.value, "velocity1"),
      ...validateGreaterThanZero(area2.value, "area2")
    ],
    assumptions: [
      "Steady incompressible flow.",
      "No leakage between section 1 and section 2."
    ],
    steps: [
      `A1 * v1 = A2 * v2`,
      `v2 = (${area1.value} * ${velocity1.value}) / ${area2.value}`
    ],
    compute: () => (area1.value * velocity1.value) / area2.value
  });
}

export type FluidVelocityInput = {
  flowRate: UnitValue<"m^3/s">;
  area: UnitValue<"m^2">;
};

export function fluidVelocity({
  flowRate,
  area
}: FluidVelocityInput): EngineeringCalculationResult<"m/s"> {
  return calculate({
    unit: "m/s",
    inputValues: { flowRate, area },
    equationId: "EQ-FLUID-VELOCITY-FLOW-AREA-001",
    errors: [
      ...validateUnit(flowRate, "m^3/s", "flowRate"),
      ...validateUnit(area, "m^2", "area"),
      ...validateNonNegative(flowRate.value, "flowRate"),
      ...validateGreaterThanZero(area.value, "area")
    ],
    assumptions: ["Flow rate is uniformly distributed across the stated area."],
    steps: [`v = Q / A`, `v = ${flowRate.value} / ${area.value}`],
    compute: () => flowRate.value / area.value
  });
}

export type BernoulliPressureAtPoint2Input = {
  pressure1: UnitValue<"Pa">;
  density: UnitValue<"kg/m^3">;
  velocity1: UnitValue<"m/s">;
  velocity2: UnitValue<"m/s">;
  elevation1: UnitValue<"m">;
  elevation2: UnitValue<"m">;
  gravitationalAcceleration: UnitValue<"m/s^2">;
};

export function bernoulliPressureAtPoint2({
  pressure1,
  density,
  velocity1,
  velocity2,
  elevation1,
  elevation2,
  gravitationalAcceleration
}: BernoulliPressureAtPoint2Input): EngineeringCalculationResult<"Pa"> {
  const assumptions = [
    "Flow is steady, incompressible, and frictionless along the modelled path.",
    "No pump work, turbine work, heat transfer, or loss term is included.",
    "Pressure values are absolute and inputs use SI units."
  ];
  const inputValues = {
    pressure1,
    density,
    velocity1,
    velocity2,
    elevation1,
    elevation2,
    gravitationalAcceleration
  };
  const result = calculate({
    unit: "Pa",
    inputValues,
    equationId: "EQ-FLUID-BERNOULLI-TWO-POINT-001",
    errors: [
      ...validateUnit(pressure1, "Pa", "pressure1"),
      ...validateGreaterThanZero(pressure1.value, "pressure1"),
      ...validateUnit(density, "kg/m^3", "density"),
      ...validateGreaterThanZero(density.value, "density"),
      ...validateUnit(velocity1, "m/s", "velocity1"),
      ...validateNonNegative(velocity1.value, "velocity1"),
      ...validateUnit(velocity2, "m/s", "velocity2"),
      ...validateNonNegative(velocity2.value, "velocity2"),
      ...validateUnit(elevation1, "m", "elevation1"),
      ...validateUnit(elevation2, "m", "elevation2"),
      ...validateUnit(gravitationalAcceleration, "m/s^2", "gravitationalAcceleration"),
      ...validateGreaterThanZero(
        gravitationalAcceleration.value,
        "gravitationalAcceleration"
      )
    ],
    assumptions,
    steps: [
      "P2 = P1 + rho*(v1^2 - v2^2)/2 + rho*g*(z1 - z2)",
      `P2 = ${pressure1.value} + ${density.value} * (${velocity1.value}^2 - ${velocity2.value}^2) / 2 + ${density.value} * ${gravitationalAcceleration.value} * (${elevation1.value} - ${elevation2.value})`
    ],
    compute: () =>
      pressure1.value +
      (density.value * (velocity1.value ** 2 - velocity2.value ** 2)) / 2 +
      density.value *
        gravitationalAcceleration.value *
        (elevation1.value - elevation2.value)
  });

  if (result.calculatedValue !== null && result.calculatedValue <= 0) {
    return invalidResult({
      unit: "Pa",
      inputValues,
      equationId: "EQ-FLUID-BERNOULLI-TWO-POINT-001",
      errors: [
        "calculated absolute pressure at point 2 must be greater than zero within this model."
      ],
      assumptions,
      warnings: [
        "The selected state is outside this ideal educational model; cavitation is not predicted."
      ]
    });
  }

  return result;
}

export type PressureHeadInput = {
  pressure: UnitValue<"Pa">;
  density: UnitValue<"kg/m^3">;
  gravitationalAcceleration: UnitValue<"m/s^2">;
};

export function pressureHead({
  pressure,
  density,
  gravitationalAcceleration
}: PressureHeadInput): EngineeringCalculationResult<"m"> {
  return calculate({
    unit: "m",
    inputValues: { pressure, density, gravitationalAcceleration },
    equationId: "EQ-FLUID-PRESSURE-HEAD-001",
    errors: [
      ...validateUnit(pressure, "Pa", "pressure"),
      ...validateGreaterThanZero(pressure.value, "pressure"),
      ...validateUnit(density, "kg/m^3", "density"),
      ...validateGreaterThanZero(density.value, "density"),
      ...validateUnit(gravitationalAcceleration, "m/s^2", "gravitationalAcceleration"),
      ...validateGreaterThanZero(
        gravitationalAcceleration.value,
        "gravitationalAcceleration"
      )
    ],
    assumptions: ["Pressure is absolute and all inputs use SI units."],
    steps: [
      "h_p = P / (rho * g)",
      `h_p = ${pressure.value} / (${density.value} * ${gravitationalAcceleration.value})`
    ],
    compute: () => pressure.value / (density.value * gravitationalAcceleration.value)
  });
}

export type VelocityHeadInput = {
  velocity: UnitValue<"m/s">;
  gravitationalAcceleration: UnitValue<"m/s^2">;
};

export function velocityHead({
  velocity,
  gravitationalAcceleration
}: VelocityHeadInput): EngineeringCalculationResult<"m"> {
  return calculate({
    unit: "m",
    inputValues: { velocity, gravitationalAcceleration },
    equationId: "EQ-FLUID-VELOCITY-HEAD-001",
    errors: [
      ...validateUnit(velocity, "m/s", "velocity"),
      ...validateNonNegative(velocity.value, "velocity"),
      ...validateUnit(gravitationalAcceleration, "m/s^2", "gravitationalAcceleration"),
      ...validateGreaterThanZero(
        gravitationalAcceleration.value,
        "gravitationalAcceleration"
      )
    ],
    assumptions: ["Velocity is the section-average model velocity."],
    steps: [
      "h_v = v^2 / (2 * g)",
      `h_v = ${velocity.value}^2 / (2 * ${gravitationalAcceleration.value})`
    ],
    compute: () => velocity.value ** 2 / (2 * gravitationalAcceleration.value)
  });
}

export type TotalBernoulliHeadInput = PressureHeadInput & {
  velocity: UnitValue<"m/s">;
  elevation: UnitValue<"m">;
};

export function totalBernoulliHead({
  pressure,
  density,
  velocity,
  elevation,
  gravitationalAcceleration
}: TotalBernoulliHeadInput): EngineeringCalculationResult<"m"> {
  return calculate({
    unit: "m",
    inputValues: {
      pressure,
      density,
      velocity,
      elevation,
      gravitationalAcceleration
    },
    equationId: "EQ-FLUID-TOTAL-HEAD-001",
    errors: [
      ...validateUnit(pressure, "Pa", "pressure"),
      ...validateGreaterThanZero(pressure.value, "pressure"),
      ...validateUnit(density, "kg/m^3", "density"),
      ...validateGreaterThanZero(density.value, "density"),
      ...validateUnit(velocity, "m/s", "velocity"),
      ...validateNonNegative(velocity.value, "velocity"),
      ...validateUnit(elevation, "m", "elevation"),
      ...validateUnit(gravitationalAcceleration, "m/s^2", "gravitationalAcceleration"),
      ...validateGreaterThanZero(
        gravitationalAcceleration.value,
        "gravitationalAcceleration"
      )
    ],
    assumptions: [
      "Bernoulli model assumptions apply at the stated point.",
      "Elevation uses the selected reference datum."
    ],
    steps: [
      "H = P/(rho*g) + v^2/(2*g) + z",
      `H = ${pressure.value}/(${density.value}*${gravitationalAcceleration.value}) + ${velocity.value}^2/(2*${gravitationalAcceleration.value}) + ${elevation.value}`
    ],
    compute: () =>
      pressure.value / (density.value * gravitationalAcceleration.value) +
      velocity.value ** 2 / (2 * gravitationalAcceleration.value) +
      elevation.value
  });
}

export type HydraulicPowerInput = {
  pressureDifference: UnitValue<"Pa">;
  flowRate: UnitValue<"m^3/s">;
};

export function hydraulicPower({
  pressureDifference,
  flowRate
}: HydraulicPowerInput): EngineeringCalculationResult<"W"> {
  return calculate({
    unit: "W",
    inputValues: { pressureDifference, flowRate },
    equationId: "EQ-FLUID-HYDRAULIC-POWER-001",
    errors: [
      ...validateUnit(pressureDifference, "Pa", "pressureDifference"),
      ...validateUnit(flowRate, "m^3/s", "flowRate"),
      ...validateNonNegative(pressureDifference.value, "pressureDifference"),
      ...validateNonNegative(flowRate.value, "flowRate")
    ],
    assumptions: [
      "Hydraulic power is calculated from pressure difference and volumetric flow rate."
    ],
    steps: [`P = delta p * Q`, `P = ${pressureDifference.value} * ${flowRate.value}`],
    compute: () => pressureDifference.value * flowRate.value
  });
}

export type SensibleHeatInput = {
  mass: UnitValue<"kg">;
  specificHeatCapacity: UnitValue<"J/(kg*K)">;
  temperatureChange: UnitValue<"K">;
};

export function sensibleHeat({
  mass,
  specificHeatCapacity,
  temperatureChange
}: SensibleHeatInput): EngineeringCalculationResult<"J"> {
  return calculate({
    unit: "J",
    inputValues: { mass, specificHeatCapacity, temperatureChange },
    equationId: "EQ-THERMO-SENSIBLE-HEAT-001",
    errors: [
      ...validateUnit(mass, "kg", "mass"),
      ...validateUnit(specificHeatCapacity, "J/(kg*K)", "specificHeatCapacity"),
      ...validateUnit(temperatureChange, "K", "temperatureChange"),
      ...validateNonNegative(mass.value, "mass"),
      ...validateGreaterThanZero(specificHeatCapacity.value, "specificHeatCapacity")
    ],
    assumptions: [
      "Specific heat capacity is constant over the stated temperature change."
    ],
    steps: [
      `Q = m * c * delta T`,
      `Q = ${mass.value} * ${specificHeatCapacity.value} * ${temperatureChange.value}`
    ],
    compute: () => mass.value * specificHeatCapacity.value * temperatureChange.value
  });
}

export type HeatingPowerInput = {
  massFlowRate: UnitValue<"kg/s">;
  specificHeatCapacity: UnitValue<"J/(kg*K)">;
  temperatureChange: UnitValue<"K">;
};

export function heatingPower({
  massFlowRate,
  specificHeatCapacity,
  temperatureChange
}: HeatingPowerInput): EngineeringCalculationResult<"W"> {
  return calculate({
    unit: "W",
    inputValues: { massFlowRate, specificHeatCapacity, temperatureChange },
    equationId: "EQ-THERMO-HEATING-POWER-001",
    errors: [
      ...validateUnit(massFlowRate, "kg/s", "massFlowRate"),
      ...validateUnit(specificHeatCapacity, "J/(kg*K)", "specificHeatCapacity"),
      ...validateUnit(temperatureChange, "K", "temperatureChange"),
      ...validateNonNegative(massFlowRate.value, "massFlowRate"),
      ...validateGreaterThanZero(specificHeatCapacity.value, "specificHeatCapacity")
    ],
    assumptions: ["Steady flow heating or cooling with constant specific heat capacity."],
    steps: [
      `P = mass flow rate * c * delta T`,
      `P = ${massFlowRate.value} * ${specificHeatCapacity.value} * ${temperatureChange.value}`
    ],
    compute: () =>
      massFlowRate.value * specificHeatCapacity.value * temperatureChange.value
  });
}

const idealGasConstant = 8.31446261815324;

export type IdealGasRelationInput = {
  pressure?: UnitValue<"Pa">;
  volume?: UnitValue<"m^3">;
  amountOfSubstance?: UnitValue<"mol">;
  temperature?: UnitValue<"K">;
};

export function idealGasRelation(
  input: IdealGasRelationInput
): EngineeringCalculationResult<string> {
  const missing = idealGasMissingVariables(input);
  const commonErrors = [
    ...(input.pressure ? validatePositiveSi(input.pressure, "Pa", "pressure") : []),
    ...(input.volume ? validatePositiveSi(input.volume, "m^3", "volume") : []),
    ...(input.amountOfSubstance
      ? validatePositiveSi(input.amountOfSubstance, "mol", "amountOfSubstance")
      : []),
    ...(input.temperature
      ? validatePositiveSi(input.temperature, "K", "temperature")
      : [])
  ];

  if (missing.length !== 1) {
    return invalidResult({
      unit: "unknown",
      inputValues: compactInputs(input),
      equationId: "EQ-THERMO-IDEAL-GAS-001",
      errors: ["Exactly one ideal-gas variable must be omitted.", ...commonErrors],
      assumptions: ["Ideal gas behaviour."]
    });
  }

  const missingName = missing[0];
  const pressure = input.pressure?.value;
  const volume = input.volume?.value;
  const amount = input.amountOfSubstance?.value;
  const temperature = input.temperature?.value;

  if (commonErrors.length > 0) {
    return invalidResult({
      unit: idealGasUnitFor(missingName),
      inputValues: compactInputs(input),
      equationId: "EQ-THERMO-IDEAL-GAS-001",
      errors: commonErrors,
      assumptions: ["Ideal gas behaviour."]
    });
  }

  const value =
    missingName === "pressure"
      ? (amount! * idealGasConstant * temperature!) / volume!
      : missingName === "volume"
        ? (amount! * idealGasConstant * temperature!) / pressure!
        : missingName === "amountOfSubstance"
          ? (pressure! * volume!) / (idealGasConstant * temperature!)
          : (pressure! * volume!) / (amount! * idealGasConstant);

  return validResult({
    calculatedValue: value,
    unit: idealGasUnitFor(missingName),
    inputValues: compactInputs(input),
    equationId: "EQ-THERMO-IDEAL-GAS-001",
    calculationSteps: ["p * V = n * R * T", `R = ${idealGasConstant} J/(mol*K)`],
    assumptions: ["Ideal gas behaviour.", "All supplied variables are SI values."]
  });
}

export type ClosedSystemEnergyBalanceInput = {
  heatTransfer: UnitValue<"J">;
  workDoneBySystem: UnitValue<"J">;
};

export function closedSystemEnergyBalance({
  heatTransfer,
  workDoneBySystem
}: ClosedSystemEnergyBalanceInput): EngineeringCalculationResult<"J"> {
  return calculate({
    unit: "J",
    inputValues: { heatTransfer, workDoneBySystem },
    equationId: "EQ-THERMO-CLOSED-SYSTEM-ENERGY-001",
    errors: [
      ...validateUnit(heatTransfer, "J", "heatTransfer"),
      ...validateUnit(workDoneBySystem, "J", "workDoneBySystem")
    ],
    assumptions: [
      "Neglect changes in kinetic and potential energy.",
      "Work is positive when done by the system."
    ],
    steps: [
      `delta U = Q - W`,
      `delta U = ${heatTransfer.value} - ${workDoneBySystem.value}`
    ],
    compute: () => heatTransfer.value - workDoneBySystem.value
  });
}

export type OhmsLawInput = {
  voltage?: UnitValue<"V">;
  current?: UnitValue<"A">;
  resistance?: UnitValue<"ohm">;
};

export function ohmsLaw(input: OhmsLawInput): EngineeringCalculationResult<string> {
  const missing = ohmsLawMissingVariables(input);
  const errors = [
    ...(input.voltage ? validateUnit(input.voltage, "V", "voltage") : []),
    ...(input.current ? validateUnit(input.current, "A", "current") : []),
    ...(input.resistance
      ? validateNonNegativeSi(input.resistance, "ohm", "resistance")
      : [])
  ];

  if (missing.length !== 1) {
    return invalidResult({
      unit: "unknown",
      inputValues: compactInputs(input),
      equationId: "EQ-ELEC-OHMS-LAW-001",
      errors: ["Exactly one Ohm's law variable must be omitted.", ...errors],
      assumptions: ["Ohmic behaviour."]
    });
  }

  const missingName = missing[0];
  if (missingName === "current" && input.resistance?.value === 0) {
    errors.push("resistance must be greater than zero when calculating current.");
  }

  if (errors.length > 0) {
    return invalidResult({
      unit: ohmsLawUnitFor(missingName),
      inputValues: compactInputs(input),
      equationId: "EQ-ELEC-OHMS-LAW-001",
      errors,
      assumptions: ["Ohmic behaviour."]
    });
  }

  const value =
    missingName === "voltage"
      ? input.current!.value * input.resistance!.value
      : missingName === "current"
        ? input.voltage!.value / input.resistance!.value
        : input.voltage!.value / input.current!.value;

  return validResult({
    calculatedValue: value,
    unit: ohmsLawUnitFor(missingName),
    inputValues: compactInputs(input),
    equationId: "EQ-ELEC-OHMS-LAW-001",
    calculationSteps: [
      "V = I * R",
      `Calculate missing ${String(missingName)} from supplied SI values.`
    ],
    assumptions: ["Ohmic behaviour.", "Temperature effects are not modelled."]
  });
}

export type ElectricalPowerInput = {
  voltage: UnitValue<"V">;
  current: UnitValue<"A">;
};

export function electricalPower({
  voltage,
  current
}: ElectricalPowerInput): EngineeringCalculationResult<"W"> {
  return calculate({
    unit: "W",
    inputValues: { voltage, current },
    equationId: "EQ-ELEC-POWER-VI-001",
    errors: [
      ...validateUnit(voltage, "V", "voltage"),
      ...validateUnit(current, "A", "current")
    ],
    assumptions: ["Electrical power is calculated from terminal voltage and current."],
    steps: [`P = V * I`, `P = ${voltage.value} * ${current.value}`],
    compute: () => voltage.value * current.value
  });
}

export type ResistanceNetworkInput = {
  resistances: Array<UnitValue<"ohm">>;
};

export function seriesResistance({
  resistances
}: ResistanceNetworkInput): EngineeringCalculationResult<"ohm"> {
  const errors = validateResistanceArray(resistances);

  return calculate({
    unit: "ohm",
    inputValues: { resistances: `${resistances.length} values in ohm` },
    equationId: "EQ-ELEC-SERIES-RESISTANCE-001",
    errors,
    assumptions: ["Resistors are connected in series."],
    steps: ["R_total = R1 + R2 + ... + Rn"],
    compute: () => resistances.reduce((total, resistance) => total + resistance.value, 0)
  });
}

export function parallelResistance({
  resistances
}: ResistanceNetworkInput): EngineeringCalculationResult<"ohm"> {
  const errors = validateResistanceArray(resistances);
  const hasZeroBranch = resistances.some((resistance) => resistance.value === 0);

  if (errors.length > 0) {
    return invalidResult({
      unit: "ohm",
      inputValues: { resistances: `${resistances.length} values in ohm` },
      equationId: "EQ-ELEC-PARALLEL-RESISTANCE-001",
      errors,
      assumptions: ["Resistors are connected in parallel."]
    });
  }

  if (hasZeroBranch) {
    return validResult({
      calculatedValue: 0,
      unit: "ohm",
      inputValues: { resistances: `${resistances.length} values in ohm` },
      equationId: "EQ-ELEC-PARALLEL-RESISTANCE-001",
      calculationSteps: [
        "A zero-ohm parallel branch makes the equivalent resistance zero."
      ],
      assumptions: ["Resistors are connected in parallel."],
      warnings: ["Zero-ohm branch treated as an ideal short-circuit boundary case."]
    });
  }

  return calculate({
    unit: "ohm",
    inputValues: { resistances: `${resistances.length} values in ohm` },
    equationId: "EQ-ELEC-PARALLEL-RESISTANCE-001",
    errors,
    assumptions: ["Resistors are connected in parallel."],
    steps: ["1 / R_total = 1 / R1 + 1 / R2 + ... + 1 / Rn"],
    compute: () =>
      1 / resistances.reduce((total, resistance) => total + 1 / resistance.value, 0)
  });
}

function calculate<Unit extends string>({
  unit,
  inputValues,
  equationId,
  errors,
  steps,
  assumptions,
  compute,
  warnings = []
}: {
  unit: Unit;
  inputValues: CalculationInput;
  equationId: string;
  errors: string[];
  steps: string[];
  assumptions: string[];
  compute: () => number;
  warnings?: string[];
}): EngineeringCalculationResult<Unit> {
  const finiteErrors = Object.entries(inputValues).flatMap(([name, value]) =>
    typeof value === "object" ? validateFinite(value, name) : []
  );
  const allErrors = [...finiteErrors, ...errors];

  if (allErrors.length > 0) {
    return invalidResult({
      unit,
      inputValues,
      equationId,
      errors: allErrors,
      assumptions,
      warnings
    });
  }

  const calculatedValue = compute();
  if (!Number.isFinite(calculatedValue)) {
    return invalidResult({
      unit,
      inputValues,
      equationId,
      errors: ["calculated value is not finite."],
      assumptions,
      warnings
    });
  }

  return validResult({
    calculatedValue,
    unit,
    inputValues,
    equationId,
    calculationSteps: [...steps, `Result = ${calculatedValue} ${unit}`],
    assumptions,
    warnings
  });
}

function validResult<Unit extends string>({
  calculatedValue,
  unit,
  inputValues,
  equationId,
  calculationSteps,
  assumptions,
  warnings = []
}: ValidResultInput<Unit>): EngineeringCalculationResult<Unit> {
  return {
    calculatedValue,
    unit,
    inputValues,
    equationId,
    calculationSteps,
    assumptions,
    warnings,
    validity: { status: "valid", errors: [] }
  };
}

function invalidResult<Unit extends string>({
  unit,
  inputValues,
  equationId,
  errors,
  assumptions,
  warnings = []
}: {
  unit: Unit;
  inputValues: CalculationInput;
  equationId: string;
  errors: string[];
  assumptions: string[];
  warnings?: string[];
}): EngineeringCalculationResult<Unit> {
  return {
    calculatedValue: null,
    unit,
    inputValues,
    equationId,
    calculationSteps: [],
    assumptions,
    warnings,
    validity: { status: "invalid", errors }
  };
}

function validateUnit<Unit extends string>(
  quantity: UnitValue<string>,
  expectedUnit: Unit,
  name: string
) {
  return quantity.unit === expectedUnit
    ? []
    : [`${name} must use ${expectedUnit}; received ${quantity.unit}.`];
}

function validateFinite(quantity: UnitValue<string>, name: string) {
  return Number.isFinite(quantity.value) ? [] : [`${name} must be a finite number.`];
}

function validateGreaterThanZero(value: number, name: string) {
  return value > 0 ? [] : [`${name} must be greater than zero.`];
}

function validateNonNegative(value: number, name: string) {
  return value >= 0 ? [] : [`${name} must not be negative.`];
}

function validatePositiveSi<Unit extends string>(
  quantity: UnitValue<string>,
  unit: Unit,
  name: string
) {
  return [
    ...validateUnit(quantity, unit, name),
    ...validateGreaterThanZero(quantity.value, name)
  ];
}

function validateNonNegativeSi<Unit extends string>(
  quantity: UnitValue<string>,
  unit: Unit,
  name: string
) {
  return [
    ...validateUnit(quantity, unit, name),
    ...validateNonNegative(quantity.value, name)
  ];
}

function validateResistanceArray(resistances: Array<UnitValue<"ohm">>) {
  const errors: string[] = [];

  if (resistances.length === 0) {
    errors.push("at least one resistance value is required.");
  }

  resistances.forEach((resistance, index) => {
    errors.push(...validateUnit(resistance, "ohm", `resistance ${index + 1}`));
    errors.push(...validateFinite(resistance, `resistance ${index + 1}`));
    errors.push(...validateNonNegative(resistance.value, `resistance ${index + 1}`));
  });

  return errors;
}

function compactInputs(
  input: Record<string, UnitValue<string> | undefined>
): CalculationInput {
  return Object.fromEntries(
    Object.entries(input).filter(
      (entry): entry is [string, UnitValue<string>] => entry[1] !== undefined
    )
  );
}

function idealGasMissingVariables(input: IdealGasRelationInput) {
  const missing: string[] = [];

  if (!input.pressure) {
    missing.push("pressure");
  }
  if (!input.volume) {
    missing.push("volume");
  }
  if (!input.amountOfSubstance) {
    missing.push("amountOfSubstance");
  }
  if (!input.temperature) {
    missing.push("temperature");
  }

  return missing;
}

function ohmsLawMissingVariables(input: OhmsLawInput) {
  const missing: string[] = [];

  if (!input.voltage) {
    missing.push("voltage");
  }
  if (!input.current) {
    missing.push("current");
  }
  if (!input.resistance) {
    missing.push("resistance");
  }

  return missing;
}

function idealGasUnitFor(name: string | undefined) {
  return name === "pressure"
    ? "Pa"
    : name === "volume"
      ? "m^3"
      : name === "amountOfSubstance"
        ? "mol"
        : name === "temperature"
          ? "K"
          : "unknown";
}

function ohmsLawUnitFor(name: string | undefined) {
  return name === "voltage"
    ? "V"
    : name === "current"
      ? "A"
      : name === "resistance"
        ? "ohm"
        : "unknown";
}
