"use client";

import type { AutonomyStatus } from "@/lib/mission";

export function WarRoomCrest({
  agentCount,
  activeCount,
  eventsPerMin,
  autonomy,
  onPause,
  onResume,
}: {
  agentCount: number;
  activeCount: number;
  eventsPerMin: number;
  autonomy?: AutonomyStatus;
  onPause?: () => void;
  onResume?: () => void;
}) {
  const now = new Date();
  const stamp = now
    .toISOString()
    .slice(0, 16)
    .replace("T", " · ")
    .replace(/-/g, "·");

  return (
    <header className="wr-crest">
      <div className="wr-crest-left">
        <div className="wr-crest-mark">
          <span className="wr-crest-glyph">◉</span>
        </div>
        <div>
          <div className="wr-crest-title">War Room</div>
          <div className="wr-crest-sub">MISSION · {stamp} LOCAL</div>
        </div>
      </div>
      <div className="wr-crest-right">
        {autonomy ? (
          <span className="wr-crest-stat">
            <span className="wr-crest-num">{autonomy.status.toUpperCase()}</span>
            {autonomy.enabled ? "AUTO" : "PAUSED"}
          </span>
        ) : null}
        <span className="wr-crest-stat">
          <span className="wr-crest-num">{agentCount}</span>AGENTS
        </span>
        <span className="wr-crest-stat">
          <span className="wr-crest-num">{activeCount}</span>ACTIVE
        </span>
        <span className="wr-crest-stat">
          <span className="wr-crest-num">{eventsPerMin}</span>EVENTS/MIN
        </span>
        {autonomy ? (
          <button
            onClick={autonomy.enabled ? onPause : onResume}
            className="wr-autonomy-toggle"
            title={autonomy.enabled ? "Pause background agents" : "Resume background agents"}
          >
            {autonomy.enabled ? "Pause" : "Resume"}
          </button>
        ) : null}
        <span className="wr-crest-pulse" />
      </div>
    </header>
  );
}
