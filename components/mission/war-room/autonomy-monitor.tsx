"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  CirclePause,
  Clock3,
  Code2,
  Eye,
  EyeOff,
  Radio,
  RotateCcw,
  Terminal,
  Wrench,
} from "lucide-react";

import {
  type AutonomyStatus,
  type MissionAgent,
  type MissionEvent,
  type MissionTask,
  type ToolActivity,
  relTime,
} from "@/lib/mission";

function agentName(agents: MissionAgent[], id: string | null | undefined): string {
  if (!id) return "system";
  return agents.find((a) => a.id === id)?.name ?? id;
}

function statusCopy(autonomy?: AutonomyStatus): string {
  if (!autonomy) return "checking";
  if (!autonomy.loop_running) return "worker offline";
  if (!autonomy.enabled) return "paused";
  if (autonomy.status === "processing") return "working";
  if (autonomy.status === "rate_limited") return "rate limited";
  if (autonomy.status === "error") return "needs attention";
  return "watching";
}

function eventLabel(event: MissionEvent): string {
  const payload = event.payload ?? {};
  const text =
    typeof payload.text === "string"
      ? payload.text
      : typeof payload.result_summary === "string"
        ? payload.result_summary
        : typeof payload.message === "string"
          ? payload.message
          : "";
  if (event.type === "task_claimed") return "started background task";
  if (event.type === "task_auto_assigned") return "assigned task to agent";
  if (event.type === "task_tool_call") return `tool call: ${String(payload.name ?? "unknown")}`;
  if (event.type === "task_tool_result") return `tool result: ${String(payload.name ?? "unknown")}`;
  if (event.type === "task_text") return text || "agent wrote an update";
  if (event.type === "task_finished") return text || "finished task";
  if (event.type === "task_error") return text || "task failed";
  if (event.type === "task_escalation") return "Claude Code handoff requested";
  if (event.type === "manual_claude_session_started") return "Claude Code terminal opened";
  if (event.type === "manual_claude_session_finished") return "Claude Code handed task back";
  if (event.type === "worker_rate_limited") return "hourly auto-run limit reached";
  if (event.type === "schedule_trigger") return `scheduled ${String(payload.job ?? "job")}`;
  if (event.type === "worker_idle") return "no queued work found";
  return event.type.replaceAll("_", " ");
}

function payloadText(event: MissionEvent): string {
  const payload = event.payload ?? {};
  if (typeof payload.text === "string") return payload.text;
  if (typeof payload.result_summary === "string") return payload.result_summary;
  if (typeof payload.error === "string") return payload.error;
  return JSON.stringify(payload, null, 2);
}

export function AutonomyMonitor({
  autonomy,
  tasks,
  agents,
  tools,
  onClearRateLimit,
  onOpenClaudeSession,
}: {
  autonomy?: AutonomyStatus;
  tasks: MissionTask[];
  agents: MissionAgent[];
  tools: ToolActivity[];
  onClearRateLimit?: () => void;
  onOpenClaudeSession?: (taskId: string, detail: string) => void;
}) {
  const [detail, setDetail] = useState(false);
  const activeTask = useMemo(() => {
    if (!autonomy?.active_task_id) return tasks.find((t) => t.status === "live") ?? null;
    return tasks.find((t) => t.id === autonomy.active_task_id) ?? null;
  }, [autonomy?.active_task_id, tasks]);

  const events = autonomy?.recent_events ?? [];
  const visibleEvents = detail ? events.slice(0, 18) : events.slice(0, 6);
  const activeTools = activeTask
    ? tools.filter((t) => t.task_id === activeTask.id).slice(0, detail ? 12 : 4)
    : tools.slice(0, detail ? 12 : 4);
  const lastEvent = events[0] ?? null;
  const queueCount = tasks.filter((t) => t.status === "queued").length;
  const isProblem = autonomy?.status === "error" || autonomy?.status === "rate_limited";
  const StatusIcon = !autonomy?.enabled
    ? CirclePause
    : isProblem
      ? AlertTriangle
      : autonomy?.status === "processing"
        ? Radio
        : CheckCircle2;

  return (
    <section className={`wr-monitor ${detail ? "wr-monitor-detail" : ""}`}>
      <div className="wr-monitor-main">
        <div className={`wr-monitor-status wr-monitor-${autonomy?.status ?? "unknown"}`}>
          <StatusIcon className="h-4 w-4" />
          <div>
            <div className="wr-monitor-label">BACKGROUND WORK</div>
            <div className="wr-monitor-state">{statusCopy(autonomy)}</div>
          </div>
        </div>
        <div className="wr-monitor-work">
          <div className="wr-monitor-label">NOW</div>
          <div className="wr-monitor-title">
            {activeTask ? activeTask.title : lastEvent ? eventLabel(lastEvent) : "No active task"}
          </div>
          <div className="wr-monitor-sub">
            {activeTask
              ? `${agentName(agents, activeTask.agent_id)} · ${relTime(activeTask.updated_at)}`
              : `${queueCount} queued · heartbeat ${
                  autonomy?.last_heartbeat ? relTime(autonomy.last_heartbeat) : "unknown"
                }`}
          </div>
        </div>
        <div className="wr-monitor-metrics">
          <div>
            <span>{queueCount}</span>
            <small>queued</small>
          </div>
          <div>
            <span>
              {autonomy?.recent_claims ?? 0}/{autonomy?.max_tasks_per_hour ?? 0}
            </span>
            <small>per hour</small>
          </div>
        </div>
        {autonomy?.status === "rate_limited" ? (
          <button
            type="button"
            className="wr-monitor-toggle wr-monitor-unblock"
            onClick={onClearRateLimit}
            title="Clear the current hourly cap and let the worker continue"
          >
            <RotateCcw className="h-4 w-4" />
            <span>UNBLOCK</span>
          </button>
        ) : null}
        <button
          type="button"
          className="wr-monitor-toggle"
          onClick={() => setDetail((v) => !v)}
          title={detail ? "Hide detail feed" : "Show detail feed"}
        >
          {detail ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          <span>{detail ? "LESS" : "DETAIL"}</span>
        </button>
      </div>

      {autonomy?.last_error ? (
        <div className="wr-monitor-error">{autonomy.last_error}</div>
      ) : null}

      <div className="wr-monitor-feed">
        <div className="wr-monitor-column">
          <div className="wr-feed-title">
            <Activity className="h-3.5 w-3.5" />
            live events
          </div>
          {visibleEvents.length === 0 ? (
            <div className="wr-feed-empty">No worker events yet.</div>
          ) : (
            visibleEvents.map((event) => (
              <div key={event.id} className="wr-monitor-event">
                <Clock3 className="h-3 w-3" />
                <div className="wr-monitor-event-body">
                  <div className="wr-monitor-event-top">
                    <span>{agentName(agents, event.agent_id)}</span>
                    <small>{relTime(event.created_at)}</small>
                  </div>
                  <div className="wr-monitor-event-text">{eventLabel(event)}</div>
                  {event.type === "task_escalation" && event.task_id && onOpenClaudeSession ? (
                    <button
                      type="button"
                      className="wr-monitor-inline-action"
                      onClick={() => onOpenClaudeSession(event.task_id as string, payloadText(event))}
                      title="Open a local Claude Code terminal for this Mission task"
                    >
                      <Terminal className="h-3.5 w-3.5" />
                      <span>OPEN CLAUDE</span>
                    </button>
                  ) : null}
                  {detail && payloadText(event) !== "{}" ? (
                    <pre className="wr-monitor-code">{payloadText(event)}</pre>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="wr-monitor-column">
          <div className="wr-feed-title">
            <Wrench className="h-3.5 w-3.5" />
            tools and code feed
          </div>
          {activeTools.length === 0 ? (
            <div className="wr-feed-empty">No tool calls yet.</div>
          ) : (
            activeTools.map((tool) => (
              <div key={tool.id} className="wr-monitor-event">
                <Code2 className="h-3 w-3" />
                <div className="wr-monitor-event-body">
                  <div className="wr-monitor-event-top">
                    <span>
                      {tool.kind === "call" ? "called" : "returned"} ·{" "}
                      {agentName(agents, tool.agent_id)}
                    </span>
                    <small>{relTime(tool.created_at)}</small>
                  </div>
                  <pre className="wr-monitor-code">{tool.summary}</pre>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
