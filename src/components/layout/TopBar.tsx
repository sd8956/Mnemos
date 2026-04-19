import { Keyboard, RefreshCw, Settings } from "lucide-react";
import { useSectionStore } from "../../stores/sectionStore";
import { useSettingsStore } from "../../stores/settingsStore";
import { notify } from "../../lib/toast";
import { SearchBar } from "./SearchBar";
import { SectionTabs } from "./SectionTabs";

export function TopBar() {
  const openSettings = useSectionStore((s) => s.openSettingsModal);
  const openShortcuts = useSectionStore((s) => s.openShortcutsModal);
  const activeSectionId = useSectionStore((s) => s.activeSectionId);
  const engramLoading = useSectionStore((s) => s.engramLoading);
  const engramError = useSectionStore((s) => s.engramError);
  const loadEngramSection = useSectionStore((s) => s.loadEngramSection);
  const engramDbPath = useSettingsStore((s) => s.engramDbPath);

  const isEngram = activeSectionId === "engram";
  const canRefresh = isEngram && Boolean(engramDbPath);
  const synced = !engramError;

  const handleRefresh = async () => {
    await loadEngramSection();
    if (!useSectionStore.getState().engramError) {
      notify.success("Engram data refreshed");
    }
  };

  return (
    <header className="h-12 bg-bg-primary border-b border-border flex items-center px-4">
      <div className="flex items-center">
        <span className="font-mono font-bold text-accent-blue tracking-[2px] text-sm">
          Mnemos
        </span>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <SectionTabs />
      </div>

      <div className="flex items-center gap-3">
        <SearchBar />

        {canRefresh && (
          <button
            type="button"
            aria-label="Refresh Engram"
            onClick={() => void handleRefresh()}
            disabled={engramLoading}
            className="h-8 w-8 flex items-center justify-center rounded-md text-text-muted hover:text-text-primary disabled:opacity-50 transition-colors"
          >
            <RefreshCw
              size={16}
              className={engramLoading ? "animate-spin" : ""}
            />
          </button>
        )}

        <button
          type="button"
          aria-label="Keyboard shortcuts"
          onClick={openShortcuts}
          className="h-8 w-8 flex items-center justify-center rounded-md text-text-muted hover:text-text-primary transition-colors"
        >
          <Keyboard size={16} />
        </button>

        <button
          type="button"
          aria-label="Settings"
          onClick={openSettings}
          className="h-8 w-8 flex items-center justify-center rounded-md text-text-muted hover:text-text-primary transition-colors"
        >
          <Settings size={16} />
        </button>

        <span
          aria-label={synced ? "Synced" : "Error"}
          title={synced ? "Synced" : "Error"}
          className={[
            "w-2 h-2 rounded-full",
            engramLoading
              ? "bg-accent-orange animate-pulse"
              : synced
                ? "bg-accent-green"
                : "bg-accent-red",
          ].join(" ")}
        />
      </div>
    </header>
  );
}
