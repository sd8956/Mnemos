import { FolderSearch } from "lucide-react";
import { useSectionStore } from "../../stores/sectionStore";
import { useSettingsStore } from "../../stores/settingsStore";

export function EngramEmptyState() {
  const openSettings = useSectionStore((s) => s.openSettingsModal);
  const engramDbPath = useSettingsStore((s) => s.engramDbPath);

  const hasPath = Boolean(engramDbPath);

  return (
    <div className="h-full flex flex-col items-center justify-center text-center gap-4 px-8">
      <FolderSearch size={48} className="text-text-muted" />
      <h3 className="text-text-primary text-[18px] font-medium">
        {hasPath ? "No Engram data found" : "No Engram data configured"}
      </h3>
      <p className="text-text-muted text-[14px] max-w-[420px]">
        {hasPath
          ? "The configured database is empty or has no matching observations yet."
          : "Configure your Engram database path in settings to see your agent-generated notes here."}
      </p>
      <button
        type="button"
        onClick={openSettings}
        className="mt-2 px-4 h-8 text-[13px] font-medium bg-accent-blue text-bg-primary rounded-md hover:brightness-110 transition"
      >
        Open settings
      </button>
    </div>
  );
}
