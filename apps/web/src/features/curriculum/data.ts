import coreCurriculum from "../../../../../content/curriculum/core-engineering.json";
import futureCurriculum from "../../../../../content/curriculum/future-engineering.json";
import careerPathways from "../../../../../content/curriculum/career-pathways.json";
import prerequisiteGraph from "../../../../../content/curriculum/prerequisite-graph.json";
import { getStaticSourceRecordsById } from "../publication/source-records";
import {
  evaluateStaticPublicationVisibility,
  type StaticPublicationAuthority
} from "../publication/static-publication";

export type Lesson = {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: string;
  academicLevel: string;
  estimatedDuration: string;
  prerequisites: string[];
  learningOutcomes: string[];
  knowledgeFileIds: string[];
  sourceIds: string[];
  simulationIds: string[];
  assessmentIds: string[];
  projectIds: string[];
  technicalReviewStatus: string;
  publicationStatus: string;
  version: string;
};

export type Unit = {
  id: string;
  slug: string;
  title: string;
  description: string;
  lessons: Lesson[];
};

export type Module = {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: string;
  academicLevel: string;
  estimatedDuration: string;
  prerequisites: string[];
  learningOutcomes: string[];
  knowledgeFileIds: string[];
  sourceIds: string[];
  simulationIds: string[];
  assessmentIds: string[];
  projectIds: string[];
  technicalReviewStatus: string;
  publicationStatus: string;
  version: string;
  units: Unit[];
};

export type Semester = {
  id: string;
  semesterNumber: number;
  title: string;
  modules: Module[];
};

export type AcademicYear = {
  id: string;
  yearNumber: number;
  title: string;
  semesters: Semester[];
};

export type Programme = {
  id: string;
  slug: string;
  title: string;
  description: string;
  academicYears: AcademicYear[];
};

export type Discipline = {
  id: string;
  slug: string;
  title: string;
  description: string;
  programmes: Programme[];
};

export type School = {
  id: string;
  slug: "core-engineering" | "future-engineering";
  title: string;
  description: string;
  disciplines: Discipline[];
};

type CurriculumFile = {
  school: School;
};

export type Pathway = {
  id: string;
  slug: string;
  title: string;
  description: string;
  targetLearners: string[];
  coreModuleIds: string[];
  futureModuleIds: string[];
  projectIds: string[];
  practiceOutcomes: string[];
  technicalReviewStatus: string;
  publicationStatus: string;
  version: string;
};

type CareerPathwaysFile = {
  pathways: Pathway[];
};

type PrerequisiteEdge = {
  id: string;
  from: string;
  to: string;
  relationship: string;
  rationale: string;
};

type PrerequisiteGraphFile = {
  edges: PrerequisiteEdge[];
};

export type CurriculumModel = {
  schools: School[];
  pathways: Pathway[];
  prerequisiteEdges: PrerequisiteEdge[];
  modules: Module[];
};

export function getCurriculum(): CurriculumModel {
  const internal = getInternalCurriculum();
  const schools = internal.schools.map(projectSchoolForPublic);
  const modules = schools.flatMap((school) =>
    school.disciplines.flatMap((discipline) =>
      discipline.programmes.flatMap((programme) =>
        programme.academicYears.flatMap((year) =>
          year.semesters.flatMap((semester) => semester.modules)
        )
      )
    )
  );
  const visibleModuleIds = new Set(modules.map((module) => module.id));

  return {
    schools,
    pathways: internal.pathways.filter(
      (pathway) => evaluateCurriculumPublication(pathway).visible
    ),
    prerequisiteEdges: internal.prerequisiteEdges.filter(
      (edge) => visibleModuleIds.has(edge.from) && visibleModuleIds.has(edge.to)
    ),
    modules
  };
}

export function getInternalCurriculum(): CurriculumModel {
  const core = (coreCurriculum as CurriculumFile).school;
  const future = (futureCurriculum as CurriculumFile).school;
  const pathways = (careerPathways as CareerPathwaysFile).pathways;
  const prerequisiteEdges = (prerequisiteGraph as PrerequisiteGraphFile).edges;
  const schools = [core, future];

  return {
    schools,
    pathways,
    prerequisiteEdges,
    modules: schools.flatMap((school) =>
      school.disciplines.flatMap((discipline) =>
        discipline.programmes.flatMap((programme) =>
          programme.academicYears.flatMap((year) =>
            year.semesters.flatMap((semester) => semester.modules)
          )
        )
      )
    )
  };
}

export function evaluateCurriculumPublication(
  record: Module | Lesson | Pathway,
  authority?: StaticPublicationAuthority
) {
  return evaluateStaticPublicationVisibility({
    audience: "public",
    record,
    sourceRecords: getStaticSourceRecordsById(
      "sourceIds" in record ? record.sourceIds : []
    ),
    ...(authority ? { authority } : {})
  });
}

export function getSchool(slug: School["slug"]) {
  return getCurriculum().schools.find((school) => school.slug === slug);
}

export function getProgramme(programmeSlug: string) {
  for (const school of getCurriculum().schools) {
    for (const discipline of school.disciplines) {
      for (const programme of discipline.programmes) {
        if (programme.slug === programmeSlug) {
          return { school, discipline, programme };
        }
      }
    }
  }

  return undefined;
}

export function getModule(moduleSlug: string) {
  for (const school of getCurriculum().schools) {
    for (const discipline of school.disciplines) {
      for (const programme of discipline.programmes) {
        for (const academicYear of programme.academicYears) {
          for (const semester of academicYear.semesters) {
            for (const module of semester.modules) {
              if (module.slug === moduleSlug) {
                return { school, discipline, programme, academicYear, semester, module };
              }
            }
          }
        }
      }
    }
  }

  return undefined;
}

export function getPathway(pathwaySlug: string) {
  const curriculum = getCurriculum();
  const pathway = curriculum.pathways.find((item) => item.slug === pathwaySlug);

  if (!pathway) {
    return undefined;
  }

  return {
    pathway,
    coreModules: pathway.coreModuleIds
      .map((moduleId) => curriculum.modules.find((module) => module.id === moduleId))
      .filter((module): module is Module => Boolean(module)),
    futureModules: pathway.futureModuleIds
      .map((moduleId) => curriculum.modules.find((module) => module.id === moduleId))
      .filter((module): module is Module => Boolean(module))
  };
}

export function prerequisiteTitles(ids: string[], modules: Module[]) {
  return ids.map((id) => modules.find((module) => module.id === id)?.title ?? id);
}

function projectSchoolForPublic(school: School): School {
  return {
    ...school,
    disciplines: school.disciplines.map((discipline) => ({
      ...discipline,
      programmes: discipline.programmes.map((programme) => ({
        ...programme,
        academicYears: programme.academicYears.map((academicYear) => ({
          ...academicYear,
          semesters: academicYear.semesters.map((semester) => ({
            ...semester,
            modules: semester.modules.flatMap((module) => {
              const projected = projectModuleForPublic(module);
              return projected ? [projected] : [];
            })
          }))
        }))
      }))
    }))
  };
}

function projectModuleForPublic(module: Module): Module | null {
  if (!evaluateCurriculumPublication(module).visible) {
    return null;
  }

  return {
    ...module,
    units: module.units.map((unit) => ({
      ...unit,
      lessons: unit.lessons.filter(
        (lesson) => evaluateCurriculumPublication(lesson).visible
      )
    }))
  };
}
