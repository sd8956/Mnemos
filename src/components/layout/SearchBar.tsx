import { useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { useSectionStore } from "../../stores/sectionStore";

export function SearchBar() {
  const query = useSectionStore((s) => s.searchQuery);
  const setQuery = useSectionStore((s) => s.setSearchQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <label className="relative flex items-center">
      <Search
        size={16}
        className="absolute left-2.5 text-text-muted pointer-events-none"
      />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
        className="h-8 w-60 pl-8 pr-8 rounded-md bg-bg-surface text-text-primary placeholder:text-text-muted text-sm border border-transparent focus:border-accent-blue focus:outline-none"
      />
      {query && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => setQuery("")}
          className="absolute right-2 text-text-muted hover:text-text-primary transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </label>
  );
}
