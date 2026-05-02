import { Search } from "lucide-react";
import Link from "next/link";

export function Topbar() {
  return (
    <header className="h-12 border-b border-border bg-panel px-4 flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm font-semibold tracking-tight">
        <span>🧠 Second Brain Hub</span>
        <span
          className="text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded border"
          style={{
            color: "rgba(232,69,69,1)",
            borderColor: "rgba(232,69,69,0.5)",
            backgroundColor: "rgba(232,69,69,0.08)",
          }}
        >
          Demo
        </span>
      </div>
      <div className="flex items-center gap-3 text-muted">
        <button className="flex items-center gap-1.5 text-xs hover:text-fg transition-colors">
          <Search className="h-3.5 w-3.5" />
          <span>⌘K</span>
        </button>
        <Link
          href="https://github.com/unohisname12/second-brain-hub-demo"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs hover:text-fg transition-colors"
        >
          GitHub
        </Link>
      </div>
    </header>
  );
}
