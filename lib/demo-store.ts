import type {
  AutonomyStatus,
  Dashboard,
  HiveNote,
  MissionAgent,
  MissionTask,
  TaskStatus,
  ToolActivity,
} from "@/lib/mission";

type StoreSnapshot = {
  agents: MissionAgent[];
  active_tasks: MissionTask[];
  done_tasks: MissionTask[];
  recent_hive: HiveNote[];
  tool_activity: ToolActivity[];
  autonomy: AutonomyStatus | null;
};

const TOOL_CAP = 50;
const HIVE_CAP = 30;

const state: StoreSnapshot = {
  agents: [],
  active_tasks: [],
  done_tasks: [],
  recent_hive: [],
  tool_activity: [],
  autonomy: null,
};

export function resetStore(): void {
  state.agents = [];
  state.active_tasks = [];
  state.done_tasks = [];
  state.recent_hive = [];
  state.tool_activity = [];
  state.autonomy = null;
}

export function setAgents(agents: MissionAgent[]): void {
  state.agents = agents;
}

export function setActiveTasks(tasks: MissionTask[]): void {
  state.active_tasks = tasks;
}

export function setDoneTasks(tasks: MissionTask[]): void {
  state.done_tasks = tasks;
}

export function setRecentHive(notes: HiveNote[]): void {
  state.recent_hive = notes;
}

export function setToolActivity(tools: ToolActivity[]): void {
  state.tool_activity = tools;
}

export function pushToolActivity(t: ToolActivity): void {
  state.tool_activity = [t, ...state.tool_activity].slice(0, TOOL_CAP);
}

export function pushHiveNote(n: HiveNote): void {
  state.recent_hive = [n, ...state.recent_hive].slice(0, HIVE_CAP);
}

export function setAutonomy(a: AutonomyStatus): void {
  state.autonomy = a;
}

export function getStoreSnapshot(): StoreSnapshot {
  return { ...state };
}

export function getDoneTasks(): MissionTask[] {
  return state.done_tasks;
}

export function buildDashboard(): Dashboard {
  const counts: Record<TaskStatus, number> = {
    queued: 0,
    live: 0,
    done: state.done_tasks.length,
    failed: 0,
  };
  for (const t of state.active_tasks) {
    if (t.status === "queued") counts.queued += 1;
    if (t.status === "live") counts.live += 1;
    if (t.status === "failed") counts.failed += 1;
  }
  return {
    agents: state.agents,
    active_tasks: state.active_tasks,
    recent_hive: state.recent_hive,
    counts,
    autonomy: state.autonomy ?? undefined,
  };
}
