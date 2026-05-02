export function ArchitectureDiagram() {
  return (
    <section className="px-8 py-16 max-w-5xl mx-auto">
      <h2 className="text-2xl font-semibold mb-2">How it really works</h2>
      <p className="text-sm text-muted mb-8 max-w-2xl">
        The real system runs as two processes on my workstation: a Next.js frontend
        on <code>:3000</code> and a FastAPI backend on <code>:8000</code>. The backend
        routes work between local Ollama (fast) and Gemini (deep reasoning), and
        retrieves context from my Obsidian vault. This demo replaces the backend
        with scripted in-memory data so you can see the UI without any of that.
      </p>
      <div className="rounded-lg border border-border bg-panel p-6 overflow-x-auto">
        <svg viewBox="0 0 720 240" className="w-full h-auto" role="img" aria-label="Architecture diagram">
          <defs>
            <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L0,6 L9,3 z" fill="rgba(232,69,69,0.7)" />
            </marker>
          </defs>
          <g fontFamily="ui-sans-serif, system-ui" fontSize="13" fill="currentColor">
            <rect x="20" y="90" width="180" height="60" rx="8" fill="none" stroke="currentColor" strokeOpacity="0.4" />
            <text x="110" y="118" textAnchor="middle">Next.js frontend</text>
            <text x="110" y="136" textAnchor="middle" fillOpacity="0.6" fontSize="11">:3000</text>

            <rect x="270" y="90" width="180" height="60" rx="8" fill="none" stroke="currentColor" strokeOpacity="0.4" />
            <text x="360" y="118" textAnchor="middle">FastAPI backend</text>
            <text x="360" y="136" textAnchor="middle" fillOpacity="0.6" fontSize="11">:8000</text>

            <rect x="520" y="20" width="180" height="50" rx="8" fill="none" stroke="currentColor" strokeOpacity="0.4" />
            <text x="610" y="48" textAnchor="middle">Ollama (local)</text>

            <rect x="520" y="105" width="180" height="50" rx="8" fill="none" stroke="currentColor" strokeOpacity="0.4" />
            <text x="610" y="133" textAnchor="middle">Gemini Deep Mode</text>

            <rect x="520" y="190" width="180" height="40" rx="8" fill="none" stroke="currentColor" strokeOpacity="0.4" />
            <text x="610" y="213" textAnchor="middle">Obsidian Vault</text>

            <line x1="200" y1="120" x2="265" y2="120" stroke="rgba(232,69,69,0.7)" strokeWidth="2" markerEnd="url(#arrow)" />
            <line x1="450" y1="115" x2="515" y2="55" stroke="rgba(232,69,69,0.5)" strokeWidth="2" markerEnd="url(#arrow)" />
            <line x1="450" y1="120" x2="515" y2="125" stroke="rgba(232,69,69,0.5)" strokeWidth="2" markerEnd="url(#arrow)" />
            <line x1="450" y1="130" x2="515" y2="205" stroke="rgba(232,69,69,0.5)" strokeWidth="2" markerEnd="url(#arrow)" />
          </g>
        </svg>
      </div>
    </section>
  );
}
