"use client";

import { useEffect, useRef, useState } from "react";
import { Save, Sparkles } from "lucide-react";

import type { HiveNote } from "@/lib/mission";

type Toast = {
  id: string;
  kind: "saved" | "learned";
  text: string;
  ts: number;
};

const TTL_MS = 8000;
const MAX_VISIBLE = 3;

function classify(kind: HiveNote["kind"]): Toast["kind"] | null {
  if (kind === "summary") return "saved";
  if (kind === "decision") return "learned";
  return null;
}

export function MemorySignals({ notes }: { notes: HiveNote[] }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const seenRef = useRef<Set<string>>(new Set());
  const initRef = useRef(false);

  // First render — record existing IDs as already-seen so the page doesn't
  // belch a stack of toasts on mount.
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    for (const n of notes) seenRef.current.add(n.id);
  }, [notes]);

  // Diff incoming notes against seen set on every prop change.
  useEffect(() => {
    if (!initRef.current) return;
    const fresh: Toast[] = [];
    for (const n of notes) {
      if (seenRef.current.has(n.id)) continue;
      seenRef.current.add(n.id);
      const k = classify(n.kind);
      if (!k) continue;
      fresh.push({
        id: n.id,
        kind: k,
        text: n.content.slice(0, 200),
        ts: Date.now(),
      });
    }
    if (!fresh.length) return;
    // Defer the state update so it doesn't fire synchronously inside the
    // effect (cascading-render rule). Cancel on unmount/re-run.
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setToasts((prev) => [...fresh, ...prev].slice(0, MAX_VISIBLE));
    });
    return () => {
      cancelled = true;
    };
  }, [notes]);

  // Reap expired toasts.
  useEffect(() => {
    if (!toasts.length) return;
    const timer = setInterval(() => {
      const now = Date.now();
      setToasts((prev) => prev.filter((t) => now - t.ts < TTL_MS));
    }, 500);
    return () => clearInterval(timer);
  }, [toasts.length]);

  if (!toasts.length) return null;

  return (
    <div className="wr-memory">
      {toasts.map((m) => (
        <div key={m.id} className={`wr-mem wr-mem-${m.kind}`}>
          {m.kind === "saved" ? <Save className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
          <span className="wr-mem-kind">
            {m.kind === "saved" ? "MEMORY SAVED" : "PATTERN LEARNED"}
          </span>
          <span className="wr-mem-text">{m.text}</span>
        </div>
      ))}
    </div>
  );
}
