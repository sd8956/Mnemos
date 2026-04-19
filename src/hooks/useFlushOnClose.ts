import { useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { flushSave } from "../stores/sectionStore";

export function useFlushOnClose(): void {
  useEffect(() => {
    let unlisten: (() => void) | undefined;
    const window = getCurrentWindow();

    window
      .onCloseRequested(async (event) => {
        event.preventDefault();
        await flushSave();
        await window.destroy();
      })
      .then((fn) => {
        unlisten = fn;
      });

    return () => {
      unlisten?.();
    };
  }, []);
}
