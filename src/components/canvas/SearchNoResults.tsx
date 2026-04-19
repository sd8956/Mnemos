import { SearchX } from "lucide-react";
import { useSectionStore } from "../../stores/sectionStore";

export function SearchNoResults() {
  const query = useSectionStore((s) => s.searchQuery);
  const clear = useSectionStore((s) => s.setSearchQuery);

  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 bg-bg-surface border border-border rounded-md px-4 py-2 flex items-center gap-3 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
      <SearchX size={14} className="text-text-muted" />
      <span className="text-text-primary text-[12px]">
        No notes match{" "}
        <span className="text-accent-blue font-mono">"{query}"</span>
      </span>
      <button
        type="button"
        onClick={() => clear("")}
        className="text-[11px] text-text-muted hover:text-text-primary transition-colors"
      >
        Clear
      </button>
    </div>
  );
}
