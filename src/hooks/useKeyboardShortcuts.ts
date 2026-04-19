import { useEffect } from "react";
import { useSectionStore } from "../stores/sectionStore";

function isTypingInField(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (target.isContentEditable) return true;
  return false;
}

export function useKeyboardShortcuts(): void {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const state = useSectionStore.getState();
      const mod = e.metaKey || e.ctrlKey;
      const typing = isTypingInField(e.target);

      if (e.key === "Escape") {
        if (state.editingNoteId || state.creatingNoteInCategoryId) {
          state.closeNoteEditor();
          return;
        }
        if (state.isShortcutsModalOpen) {
          state.closeShortcutsModal();
          return;
        }
        if (state.isSettingsModalOpen) {
          state.closeSettingsModal();
          return;
        }
        if (state.expandedCategoryId) {
          state.closeCategory();
          return;
        }
        if (state.isNewCategoryModalOpen) {
          state.closeNewCategoryModal();
          return;
        }
        if (state.isNewSectionModalOpen) {
          state.closeNewSectionModal();
          return;
        }
        return;
      }

      // Shortcuts help: `?` or Cmd/Ctrl + /
      if (!typing && (e.key === "?" || (mod && e.key === "/"))) {
        e.preventDefault();
        state.openShortcutsModal();
        return;
      }

      if (!mod) return;

      if (e.key === ",") {
        e.preventDefault();
        state.openSettingsModal();
        return;
      }

      if (e.key.toLowerCase() === "n" && e.shiftKey) {
        e.preventDefault();
        if (state.expandedCategoryId) {
          state.openNewNoteEditor(state.expandedCategoryId);
        }
        return;
      }

      if (e.key.toLowerCase() === "n") {
        e.preventDefault();
        const section = state.getActiveSection();
        if (section && !section.readOnly) {
          state.openNewCategoryModal();
        }
        return;
      }

      // Section switch: Cmd/Ctrl + 1..9
      if (/^[1-9]$/.test(e.key) && !e.shiftKey) {
        const index = parseInt(e.key, 10) - 1;
        const all = [...state.engramSections, ...state.sections];
        const target = all[index];
        if (target) {
          e.preventDefault();
          state.setActiveSection(target.id);
        }
        return;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
}
