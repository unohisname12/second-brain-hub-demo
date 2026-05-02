import { Radar, FileText, Brain } from "lucide-react";

const FEATURES = [
  {
    title: "War Room",
    body: "Mission control for AI agents. Watch tasks queue, run, and complete in real time.",
    icon: Radar,
  },
  {
    title: "Vault Retrieval",
    body: "Semantic search over a personal Obsidian vault. Notes, decisions, and history.",
    icon: FileText,
  },
  {
    title: "Ambient Brain",
    body: "Context-aware suggestions, daily briefs, and recent edits — always one click away.",
    icon: Brain,
  },
];

export function FeatureStrip() {
  return (
    <section className="px-8 py-16 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="rounded-lg border border-border bg-panel p-6"
          >
            <f.icon className="h-6 w-6 mb-3" style={{ color: "rgba(232,69,69,1)" }} />
            <h3 className="font-semibold mb-2">{f.title}</h3>
            <p className="text-sm text-muted">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
