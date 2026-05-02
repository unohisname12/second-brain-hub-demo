import { describe, it, expect, beforeEach } from "vitest";

import {
  resetStore,
  getStoreSnapshot,
  setActiveTasks,
  setDoneTasks,
  pushToolActivity,
  pushHiveNote,
  setAutonomy,
} from "@/lib/demo-store";
import type { MissionTask, ToolActivity, HiveNote } from "@/lib/mission";

const sampleTask = (id: string, status: MissionTask["status"]): MissionTask => ({
  id,
  title: `task ${id}`,
  description: null,
  status,
  priority: 0,
  agent_id: "scout",
  result_summary: null,
  created_at: 0,
  updated_at: 0,
  started_at: null,
  finished_at: status === "done" ? 1 : null,
});

describe("demo-store", () => {
  beforeEach(() => {
    resetStore();
  });

  it("starts empty after reset", () => {
    const s = getStoreSnapshot();
    expect(s.active_tasks).toEqual([]);
    expect(s.done_tasks).toEqual([]);
    expect(s.recent_hive).toEqual([]);
    expect(s.tool_activity).toEqual([]);
  });

  it("setters replace arrays", () => {
    setActiveTasks([sampleTask("a", "live")]);
    expect(getStoreSnapshot().active_tasks).toHaveLength(1);

    setDoneTasks([sampleTask("b", "done")]);
    expect(getStoreSnapshot().done_tasks).toHaveLength(1);
  });

  it("pushToolActivity caps at 50, newest first", () => {
    for (let i = 0; i < 60; i++) {
      const t: ToolActivity = {
        id: `tool-${i}`,
        kind: "call",
        agent_id: "scout",
        task_id: null,
        summary: `s${i}`,
        created_at: i,
      };
      pushToolActivity(t);
    }
    const tools = getStoreSnapshot().tool_activity;
    expect(tools).toHaveLength(50);
    expect(tools[0].id).toBe("tool-59"); // newest first
    expect(tools[49].id).toBe("tool-10");
  });

  it("pushHiveNote caps at 30, newest first", () => {
    for (let i = 0; i < 35; i++) {
      const n: HiveNote = {
        id: `hn-${i}`,
        kind: "log",
        task_id: null,
        agent_id: "scribe",
        content: `c${i}`,
        created_at: i,
      };
      pushHiveNote(n);
    }
    const notes = getStoreSnapshot().recent_hive;
    expect(notes).toHaveLength(30);
    expect(notes[0].id).toBe("hn-34");
  });

  it("setAutonomy stores autonomy state", () => {
    setAutonomy({
      enabled: true,
      status: "processing",
      active_task_id: "t1",
      last_heartbeat: 0,
      last_error: null,
      max_concurrent: 1,
      max_tasks_per_hour: 10,
      loop_running: true,
      recent_events: [],
    });
    expect(getStoreSnapshot().autonomy?.status).toBe("processing");
  });
});
