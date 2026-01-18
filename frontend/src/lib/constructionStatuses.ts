export const CONSTRUCTION_STATUSES = [
  "Under Construction",
  "Ready To Move",
  "New Launch",
  "Completed",
];

export type ConstructionStatus = (typeof CONSTRUCTION_STATUSES)[number];
