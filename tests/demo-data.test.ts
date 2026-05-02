import { describe, it, expect, beforeEach } from "vitest";

import {
  getDashboard,
  getTasks,
  getToolActivity,
  pauseAutonomy,
  resumeAutonomy,
  clearAutonomyRateLimit,
  openClaudeSession,
} from "@/lib/demo-data";
import {
  resetStore,
  setActiveTasks,
  setDoneTasks,
  setToolActivity,
  setAutonomy,
  setAgents,
} from "@/lib/demo-store";
import { DEMO_AGENTS } from "@/lib/demo-fixtures";
import type { MissionTask, ToolActivity } from "@/lib/mission";

const t = (id: string, status: MissionTask["status"]): MissionTask => ({
  id, title: `t-${id}`, description: null, status, priority: 0,
  agent_id: "scout", result_summary: null, created_at: 0, updated_at: 0,
  started_at: null, finished_at: status === "done" ? 1 : null,
});

describe("demo-data API", () => {
  beforeEach(() => {
    resetStore();
    setAgents(DEMO_AGENTS);
  });

  it("getDashboard returns store snapshot as Dashboard", async () => {
    setActiveTasks([t("a", "live"), t("b", "queued")]);
    const d = await getDashboard();
    expect(d.agents).toHaveLength(4);
    expect(d.active_tasks).toHaveLength(2);
    expect(d.counts.live).toBe(1);
    expect(d.counts.queued).toBe(1);
  });

  it("getTasks('done') returns done tasks only", async () => {
    setActiveTasks([t("a", "live")]);
    setDoneTasks([t("b", "done"), t("c", "done")]);
    const r = await getTasks("done");
    expect(r.tasks).toHaveLength(2);
    expect(r.tasks.every((x) => x.status === "done")).toBe(true);
  });

  it("getTasks(undefined) returns all active tasks", async () => {
    setActiveTasks([t("a", "live"), t("b", "queued")]);
    const r = await getTasks();
    expect(r.tasks).toHaveLength(2);
  });

  it("getToolActivity respects limit", async () => {
    const tools: ToolActivity[] = [];
    for (let i = 0; i < 20; i++) {
      tools.push({
        id: `x${i}`, kind: "call", agent_id: "scout", task_id: null,
        summary: "s", created_at: i,
      });
    }
    setToolActivity(tools);
    const r = await getToolActivity({ limit: 5 });
    expect(r.tools).toHaveLength(5);
  });

  it("pauseAutonomy/resumeAutonomy return AutonomyStatus", async () => {
    setAutonomy({
      enabled: true, status: "processing", active_task_id: null,
      last_heartbeat: 0, last_error: null, max_concurrent: 1,
      max_tasks_per_hour: 10, loop_running: true, recent_events: [],
    });
    const paused = await pauseAutonomy();
    expect(paused.status).toBe("paused");
    const resumed = await resumeAutonomy();
    expect(resumed.status).toBe("processing");
  });

  it("clearAutonomyRateLimit resolves with status", async () => {
    setAutonomy({
      enabled: true, status: "processing", active_task_id: null,
      last_heartbeat: 0, last_error: null, max_concurrent: 1,
      max_tasks_per_hour: 10, loop_running: true, recent_events: [],
    });
    const r = await clearAutonomyRateLimit();
    expect(r.rate_limit_cleared_at).toBeGreaterThan(0);
  });

  it("openClaudeSession resolves with fake session", async () => {
    const r = await openClaudeSession("task-1");
    expect(r.ok).toBe(true);
    expect(r.task_id).toBe("task-1");
  });
});
