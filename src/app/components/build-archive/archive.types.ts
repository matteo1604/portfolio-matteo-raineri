export type BuildModuleStatus =
  | "deployed"
  | "prototype"
  | "research"
  | "archived"
  | "locked";

export type BuildModuleVisualType =
  | "engine"
  | "motion"
  | "tokens"
  | "commerce"
  | "neural"
  | "locked";

export type BuildLogLevel = "info" | "success" | "warning" | "error";

export interface BuildMetric {
  id: string;
  label: string;
  value: string;
  description: string;
}

export interface BuildLogEntry {
  id: string;
  timestamp: string;
  title: string;
  detail: string;
  level: BuildLogLevel;
}

export interface BuildModuleAccent {
  line: string;
  glow: string;
  surface: string;
  text: string;
  muted: string;
}

export interface BuildArchiveModule {
  id: string;
  index: string;
  title: string;
  status: BuildModuleStatus;
  year: string;
  type: string;
  stack: string[];
  summary: string;
  description: string;
  metrics: BuildMetric[];
  logs: BuildLogEntry[];
  accent: BuildModuleAccent;
  visualType: BuildModuleVisualType;
}
