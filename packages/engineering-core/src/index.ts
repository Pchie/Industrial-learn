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
    sourceIds: ["SRC-SMART-PUMP-PLACEHOLDER-001"],
    sourceReferences: [],
    engineeringReviewStatus: "Source required"
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
    sourceIds: ["SRC-FLUID-PRESSURE-PLACEHOLDER-001"],
    sourceReferences: [],
    engineeringReviewStatus: "Source required"
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
    sourceIds: ["SRC-HYDRAULIC-CYLINDER-PLACEHOLDER-001"],
    sourceReferences: [],
    engineeringReviewStatus: "Source required"
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
  | "area"
  | "pressure"
  | "volume"
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
