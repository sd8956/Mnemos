import { AlertCircle } from "lucide-react";
import { useSectionStore } from "../../stores/sectionStore";

export function EngramErrorState() {
  const engramError = useSectionStore((s) => s.engramError);
  const reload = useSectionStore((s) => s.loadEngramSection);
  const openSettings = useSectionStore((s) => s.openSettingsModal);

  return (
    <div className="h-full flex flex-col items-center justify-center text-center gap-4 px-8">
      <AlertCircle size={48} className="text-accent-red" />
      <h3 className="text-text-primary text-[18px] font-medium">
        Engram load failed
      </h3>
      <p className="text-text-muted text-[13px] font-mono max-w-[500px] break-words">
        {engramError ?? "Unknown error"}
      </p>
      <div className="flex gap-2 mt-2">
        <button
          type="button"
          onClick={() => void reload()}
          className="px-4 h-8 text-[13px] font-medium bg-accent-blue text-bg-primary rounded-md hover:brightness-110 transition"
        >
          Retry
        </button>
        <button
          type="button"
          onClick={openSettings}
          className="px-4 h-8 text-[13px] text-text-muted hover:text-text-primary rounded-md transition"
        >
          Open settings
        </button>
      </div>
    </div>
  );
}
