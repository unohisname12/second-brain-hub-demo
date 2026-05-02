"use client";

import "./war-room.css";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  type Dashboard,
  type MissionAgent,
  type MissionTask,
  type ToolActivity,
} from "@/lib/mission";
import {
  clearAutonomyRateLimit,
  getDashboard,
  getTasks,
  getToolActivity,
  openClaudeSession,
  pauseAutonomy,
  resumeAutonomy,
} from "@/lib/demo-data";
import { startTimeline, stopTimeline } from "@/lib/demo-timeline";
import {
  type AgentStatus,
  agentIconForRole,
  deriveAgentStatus,
} from "@/lib/mission-derive";

import { WarRoomCrest } from "@/components/mission/war-room/crest";
import { AgentBar, type AgentWithStatus } from "@/components/mission/war-room/agent-bar";
import { AutonomyMonitor } from "@/components/mission/war-room/autonomy-monitor";
import { TaskPanel } from "@/components/mission/war-room/task-panel";
import { ActivityFeed } from "@/components/mission/war-room/activity-feed";
import { ChatStage } from "@/components/mission/war-room/chat-stage";
import { MemorySignals } from "@/components/mission/war-room/memory-signals";
import { useAgentChat } from "@/lib/use-agent-chat";

const POLL_MS = 5000;

export default function MissionPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [doneTasks, setDoneTasks] = useState<MissionTask[]>([]);
  const [toolActivity, setToolActivity] = useState<ToolActivity[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeAgentId, setActiveAgentId] = useState<string>("main");

  const [nowSec, setNowSec] = useState<number>(() => Math.floor(Date.now() / 1000));

  const refresh = useCallback(async () => {
    try {
      const [d, doneRes, toolRes] = await Promise.all([
        getDashboard(),
        getTasks("done"),
        getToolActivity({ limit: 50 }),
      ]);
      setData(d);
      setDoneTasks(doneRes.tasks.slice(0, 10));
      setToolActivity(toolRes.tools);
      setNowSec(Math.floor(Date.now() / 1000));
      setError(null);
    } catch (e) {
      setError(String(e));
    }
  }, []);

  useEffect(() => {
    const initial = setTimeout(refresh, 0);
    const t = setInterval(refresh, POLL_MS);
    return () => {
      clearTimeout(initial);
      clearInterval(t);
    };
  }, [refresh]);

  useEffect(() => {
    startTimeline();
    return () => {
      stopTimeline();
    };
  }, []);

  const chat = useAgentChat();

  const agentsWithStatus: AgentWithStatus[] = useMemo(() => {
    if (!data) return [];
    const allTasks: MissionTask[] = [...data.active_tasks, ...doneTasks];
    return data.agents.map<AgentWithStatus>((a) => {
      let status: AgentStatus = deriveAgentStatus(a, allTasks, nowSec);
      if (a.id === activeAgentId && chat.streaming) status = "thinking";
      return { ...a, status, iconName: agentIconForRole(a.role) };
    });
  }, [data, doneTasks, nowSec, activeAgentId, chat.streaming]);

  const activeAgent: MissionAgent | null = useMemo(() => {
    if (!data) return null;
    return data.agents.find((a) => a.id === activeAgentId) ?? data.agents[0] ?? null;
  }, [data, activeAgentId]);

  const eventsPerMin = useMemo(() => {
    if (!data) return 0;
    const cutoff = nowSec - 60;
    return data.recent_hive.filter((n) => n.created_at >= cutoff).length;
  }, [data, nowSec]);

  async function handlePauseAutonomy() {
    await pauseAutonomy();
    await refresh();
  }

  async function handleResumeAutonomy() {
    await resumeAutonomy();
    await refresh();
  }

  async function handleClearRateLimit() {
    await clearAutonomyRateLimit();
    await refresh();
  }

  async function handleOpenClaudeSession(taskId: string, detail: string) {
    await openClaudeSession(taskId, {
      reason: "User approved Claude Code handoff from Mission UI.",
      detail,
    });
    await refresh();
  }

  if (error) {
    return (
      <div className="p-8 max-w-5xl">
        <h1 className="text-2xl font-semibold mb-4">War Room</h1>
        <div className="rounded-md border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-300">
          Demo data error — {error}. Refresh the page.
        </div>
      </div>
    );
  }

  if (!data || !activeAgent) {
    return <div className="p-8 text-muted text-sm">Loading mission state…</div>;
  }

  const queued = data.active_tasks.filter((t) => t.status === "queued");
  const live = data.active_tasks.filter((t) => t.status === "live");

  return (
    <div className="wr-page">
      <WarRoomCrest
        agentCount={data.agents.length}
        activeCount={live.length}
        eventsPerMin={eventsPerMin}
        autonomy={data.autonomy}
        onPause={handlePauseAutonomy}
        onResume={handleResumeAutonomy}
      />
      <AgentBar agents={agentsWithStatus} activeId={activeAgentId} onSelect={setActiveAgentId} />
      <AutonomyMonitor
        autonomy={data.autonomy}
        tasks={data.active_tasks}
        agents={data.agents}
        tools={toolActivity}
        onClearRateLimit={handleClearRateLimit}
        onOpenClaudeSession={handleOpenClaudeSession}
      />
      <div className="wr-grid">
        <ChatStage
          agents={data.agents}
          activeAgent={activeAgent}
          turns={chat.turns}
          streaming={chat.streaming}
          onSend={chat.send}
          sessionLabel={`session · ${activeAgent.id} · ${chat.turns.length} turns`}
        />
        <div className="wr-rail">
          <TaskPanel active={live} queued={queued} done={doneTasks} agents={data.agents} />
          <ActivityFeed notes={data.recent_hive} agents={data.agents} nowSec={nowSec} />
        </div>
      </div>
      <MemorySignals notes={data.recent_hive} />
    </div>
  );
}
