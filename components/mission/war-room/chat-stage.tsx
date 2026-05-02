"use client";

import { useState } from "react";
import { ArrowUp, Brain } from "lucide-react";

import type { MissionAgent } from "@/lib/mission";
import { DelegationBadge } from "./delegation-badge";
import { parseDelegations } from "@/lib/mission-derive";

export type Turn =
  | { role: "user"; text: string }
  | { role: "agent"; text: string };

export function ChatStage({
  agents,
  activeAgent,
  turns,
  streaming,
  onSend,
  sessionLabel,
}: {
  agents: MissionAgent[];
  activeAgent: MissionAgent;
  turns: Turn[];
  streaming: boolean;
  onSend: (text: string) => void;
  sessionLabel: string;
}) {
  const [val, setVal] = useState("");

  function submit() {
    const text = val.trim();
    if (!text || streaming) return;
    onSend(text);
    setVal("");
  }

  return (
    <section className="wr-stage">
      <div className="wr-stage-head">
        <div className="wr-stage-title">
          <Brain className="h-4 w-4" />
          <span>{activeAgent.name}</span>
          <span className="wr-stage-tag">PRIMARY · DEEP MODE</span>
        </div>
        <div className="wr-stage-meta">{sessionLabel}</div>
      </div>
      <div className="wr-stream">
        {turns.length === 0 ? (
          <div className="text-sm text-muted py-2">
            Ask {activeAgent.name} — tag @builder, @research, @supapara, @memory to route directly.
          </div>
        ) : (
          turns.map((t, i) => {
            const dels = t.role === "agent" ? parseDelegations(t.text) : [];
            return (
              <div key={i} className={`wr-turn wr-turn-${t.role}`}>
                <div className="wr-turn-rail" />
                <div className="wr-turn-body">
                  <div className="wr-turn-label">{t.role === "user" ? "you" : activeAgent.name.toLowerCase()}</div>
                  <div className="wr-turn-text whitespace-pre-wrap">{t.text}</div>
                  {dels.length > 0 && (
                    <div className="wr-deleg-row">
                      {dels.map((d, j) => (
                        <DelegationBadge key={j} d={d} agents={agents} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        {streaming && (
          <div className="wr-typing">
            <span /><span /><span />
            <span className="wr-typing-label">{activeAgent.name.toUpperCase()} IS DRAFTING…</span>
          </div>
        )}
      </div>
      <div className="wr-composer">
        <textarea
          className="wr-composer-input"
          rows={1}
          placeholder={`Ask ${activeAgent.name} — tag @agent to route directly`}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
        />
        <button type="button" className="wr-send" onClick={submit} disabled={streaming}>
          <ArrowUp className="h-3 w-3" /> SEND
        </button>
      </div>
    </section>
  );
}
