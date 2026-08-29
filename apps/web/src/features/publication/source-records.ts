import fluidPressureSource from "../../../../../sources/fluid-pressure/openstax-college-physics.json";
import nasaBernoulliSource from "../../../../../sources/fluid-mechanics/nasa-glenn-bernoulli.json";
import openStaxFluidDynamicsSource from "../../../../../sources/fluid-mechanics/openstax-college-physics-2e.json";
import excavatorBoomCylinderSource from "../../../../../sources/hydraulics/caterpillar-boom-cylinder-6040431.json";
import hydraulicCylinderSource from "../../../../../sources/hydraulics/parker-140h8-cylinder.json";
import smartPumpMeasurementSource from "../../../../../sources/smart-pump-systems/doe-pump-sourcebook-2006.json";
import siUnitsSource from "../../../../../sources/smart-pump-systems/nist-sp-330-2019.json";
import thermodynamicsDefinitionsSource from "../../../../../sources/thermodynamics/purdue-me200-definitions-2021.json";

export type StaticSourceRecord = {
  id: string;
  evidenceStatus?: unknown;
};

const sourceRecords = Object.freeze([
  fluidPressureSource,
  openStaxFluidDynamicsSource,
  nasaBernoulliSource,
  hydraulicCylinderSource,
  excavatorBoomCylinderSource,
  smartPumpMeasurementSource,
  siUnitsSource,
  thermodynamicsDefinitionsSource
]);

export function getStaticSourceRecordsById(sourceIds: readonly string[]) {
  return sourceRecords.filter((source) => sourceIds.includes(source.id));
}
