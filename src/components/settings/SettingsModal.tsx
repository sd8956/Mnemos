import { useEffect, useState } from "react";
import { Check, FolderOpen, X } from "lucide-react";
import { open as openDialog } from "@tauri-apps/plugin-dialog";
import { useSectionStore } from "../../stores/sectionStore";
import { useSettingsStore } from "../../stores/settingsStore";
import { validateEngramDb } from "../../lib/engramBridge";
import { Modal } from "../ui/Modal";

type Validation =
  | { kind: "idle" }
  | { kind: "validating" }
  | { kind: "ok"; projectCount: number; totalObservations: number }
  | { kind: "error"; message: string };

export function SettingsModal() {
  const isOpen = useSectionStore((s) => s.isSettingsModalOpen);
  const closeSettings = useSectionStore((s) => s.closeSettingsModal);
  const reloadEngram = useSectionStore((s) => s.loadEngramSection);
  const clearEngram = useSectionStore((s) => s.clearEngramSection);

  const engramDbPath = useSettingsStore((s) => s.engramDbPath);
  const engramAutoRefresh = useSettingsStore((s) => s.engramAutoRefresh);
  const setEngramDbPath = useSettingsStore((s) => s.setEngramDbPath);
  const setEngramAutoRefresh = useSettingsStore(
    (s) => s.setEngramAutoRefresh,
  );

  const [pathInput, setPathInput] = useState(engramDbPath ?? "");
  const [validation, setValidation] = useState<Validation>({ kind: "idle" });

  useEffect(() => {
    if (isOpen) {
      setPathInput(engramDbPath ?? "");
      setValidation({ kind: "idle" });
    }
  }, [isOpen, engramDbPath]);

  useEffect(() => {
    if (!isOpen) return;
    const trimmed = pathInput.trim();
    if (!trimmed) {
      setValidation({ kind: "idle" });
      return;
    }
    setValidation({ kind: "validating" });
    const handle = setTimeout(async () => {
      try {
        const info = await validateEngramDb(trimmed);
        if (!info.exists) {
          setValidation({ kind: "error", message: "Path does not exist" });
        } else if (!info.readable) {
          setValidation({
            kind: "error",
            message: info.error ?? "Database unreadable",
          });
        } else {
          setValidation({
            kind: "ok",
            projectCount: info.project_count,
            totalObservations: info.total_observations,
          });
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        setValidation({ kind: "error", message });
      }
    }, 400);
    return () => clearTimeout(handle);
  }, [pathInput, isOpen]);

  if (!isOpen) return null;

  const handleBrowse = async () => {
    try {
      const selected = await openDialog({
        multiple: false,
        directory: false,
        filters: [{ name: "SQLite database", extensions: ["db", "sqlite"] }],
      });
      if (typeof selected === "string" && selected.length > 0) {
        setPathInput(selected);
      }
    } catch (e) {
      console.error("Dialog open failed:", e);
    }
  };

  const handleSave = async () => {
    const trimmed = pathInput.trim();
    const next = trimmed === "" ? null : trimmed;
    await setEngramDbPath(next);
    if (next) {
      await reloadEngram();
    } else {
      clearEngram();
    }
    closeSettings();
  };

  return (
    <Modal onClose={closeSettings} zIndex={70}>
      <div className="bg-bg-surface border border-border rounded-md w-full max-w-[600px] max-h-[85vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-text-primary text-[15px] font-medium">
            Settings
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={closeSettings}
            className="w-6 h-6 flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
          <section>
            <h3 className="text-text-muted text-[11px] uppercase tracking-[0.1em] font-mono mb-3">
              Engram integration
            </h3>

            <label className="block text-text-primary text-[13px] mb-1">
              Database path
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={pathInput}
                onChange={(e) => setPathInput(e.target.value)}
                placeholder="~/.engram/engram.db"
                className="flex-1 h-9 px-3 bg-bg-primary text-text-primary placeholder:text-text-muted text-sm font-mono border border-border rounded-md focus:border-accent-blue focus:outline-none"
              />
              <button
                type="button"
                onClick={handleBrowse}
                className="h-9 px-3 flex items-center gap-2 text-[13px] text-text-muted hover:text-text-primary border border-border rounded-md transition"
              >
                <FolderOpen size={14} />
                Browse...
              </button>
            </div>

            <div className="mt-2 min-h-[18px] text-[12px] font-mono">
              {validation.kind === "validating" && (
                <span className="text-text-muted">Checking...</span>
              )}
              {validation.kind === "ok" && (
                <span className="text-accent-green flex items-center gap-1">
                  <Check size={12} />
                  {validation.projectCount} projects,{" "}
                  {validation.totalObservations} observations
                </span>
              )}
              {validation.kind === "error" && (
                <span className="text-accent-red flex items-center gap-1">
                  <X size={12} />
                  {validation.message}
                </span>
              )}
            </div>

            <label className="flex items-center gap-2 mt-4 text-[13px] text-text-primary cursor-pointer">
              <input
                type="checkbox"
                checked={engramAutoRefresh}
                onChange={(e) => void setEngramAutoRefresh(e.target.checked)}
                className="accent-accent-blue"
              />
              Automatically refresh when files change
            </label>
          </section>

          <section>
            <h3 className="text-text-muted text-[11px] uppercase tracking-[0.1em] font-mono mb-3">
              About
            </h3>
            <div className="text-text-muted text-[12px] font-mono leading-relaxed">
              <div>Mnemos v0.1.0</div>
              <div>Tauri 2 + React 19 + xyflow v12</div>
            </div>
          </section>
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t border-border">
          <button
            type="button"
            onClick={closeSettings}
            className="px-3 h-8 text-[13px] text-text-muted hover:text-text-primary rounded-md transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={validation.kind === "error"}
            className="px-4 h-8 text-[13px] font-medium bg-accent-blue text-bg-primary rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition"
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
}
