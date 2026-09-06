export const lifecycleStages = [
  "PLANNING",
  "RESEARCH",
  "SOLUTION_DESIGN",
  "PROTOTYPE",
  "TESTING",
  "PILOT",
  "IMPLEMENTATION",
  "IMPACT_MONITORING",
  "COMPLETED",
];

export const lifecycleLabels = {
  ASSIGNED: "Challenge Intake",
  PLANNING: "Challenge Intake",
  RESEARCH: "Research",
  SOLUTION_DESIGN: "Blueprint",
  PROTOTYPE: "Prototype",
  TESTING: "Testing",
  PILOT: "Pilot",
  IMPLEMENTATION: "Implementation",
  IMPACT_MONITORING: "Impact Review",
  COMPLETED: "Closed / Completed",
};

export const lifecycleProgress = {
  ASSIGNED: 10,
  PLANNING: 10,
  RESEARCH: 25,
  SOLUTION_DESIGN: 40,
  PROTOTYPE: 55,
  TESTING: 70,
  PILOT: 82,
  IMPLEMENTATION: 92,
  IMPACT_MONITORING: 98,
  COMPLETED: 100,
};

const aliases = {
  CHALLENGE_INTAKE: "PLANNING",
  BLUEPRINT: "SOLUTION_DESIGN",
  SOLUTION_BLUEPRINT: "SOLUTION_DESIGN",
  IMPACT_REVIEW: "IMPACT_MONITORING",
  CLOSED: "COMPLETED",
  IMPACT_CLOSED: "COMPLETED",
  IN_DEVELOPMENT: "PROTOTYPE",
  PILOT_TESTING: "PILOT",
  IMPLEMENTED: "COMPLETED",
};

export function normalizeLifecycleStage(value) {
  const raw = String(value || "PLANNING").toUpperCase().replaceAll(" ", "_").replaceAll("/", "_");
  return aliases[raw] || raw;
}

export function getLifecycleProgress(projectOrStage) {
  const stage = typeof projectOrStage === "string"
    ? normalizeLifecycleStage(projectOrStage)
    : normalizeLifecycleStage(projectOrStage?.status || projectOrStage?.stage || projectOrStage?.current_stage?.stage);
  return lifecycleProgress[stage] ?? 10;
}

export function getLifecycleLabel(projectOrStage) {
  const stage = typeof projectOrStage === "string"
    ? normalizeLifecycleStage(projectOrStage)
    : normalizeLifecycleStage(projectOrStage?.status || projectOrStage?.stage || projectOrStage?.current_stage?.stage);
  return lifecycleLabels[stage] || stage.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}
