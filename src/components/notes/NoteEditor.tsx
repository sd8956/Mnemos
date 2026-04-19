import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useSectionStore } from "../../stores/sectionStore";
import { notify } from "../../lib/toast";
import { Modal } from "../ui/Modal";
import type { NoteCategory } from "../../types";

const TYPE_OPTIONS: Array<{ value: NoteCategory | ""; label: string }> = [
  { value: "", label: "None" },
  { value: "logic", label: "Logic" },
  { value: "data", label: "Data" },
  { value: "ui", label: "UI" },
  { value: "issues", label: "Issues" },
  { value: "config", label: "Config" },
];

function parseTags(input: string): string[] {
  return input
    .split(",")
    .map((t) => t.trim().replace(/^#+/, ""))
    .filter((t) => t.length > 0)
    .map((t) => `#${t}`);
}

function formatTags(tags: string[]): string {
  return tags.map((t) => t.replace(/^#+/, "")).join(", ");
}

export function NoteEditor() {
  const editingNoteId = useSectionStore((s) => s.editingNoteId);
  const creatingNoteInCategoryId = useSectionStore(
    (s) => s.creatingNoteInCategoryId,
  );
  const closeNoteEditor = useSectionStore((s) => s.closeNoteEditor);
  const addNote = useSectionStore((s) => s.addNote);
  const updateNote = useSectionStore((s) => s.updateNote);
  const deleteNote = useSectionStore((s) => s.deleteNote);
  const existingNote = useSectionStore((s) =>
    editingNoteId ? s.findNote(editingNoteId) : undefined,
  );

  const [title, setTitle] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [type, setType] = useState<NoteCategory | "">("");
  const [content, setContent] = useState("");
  const [pendingDelete, setPendingDelete] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  const isEditMode = Boolean(existingNote && existingNote.source !== "engram");
  const isCreateMode = Boolean(creatingNoteInCategoryId);
  const isOpen = isEditMode || isCreateMode;

  useEffect(() => {
    if (!isOpen) return;
    if (existingNote) {
      setTitle(existingNote.title);
      setTagsInput(formatTags(existingNote.tags));
      setType(existingNote.type ?? "");
      setContent(existingNote.content);
    } else {
      setTitle("");
      setTagsInput("");
      setType("");
      setContent("");
    }
    setPendingDelete(false);
    requestAnimationFrame(() => titleRef.current?.focus());
  }, [isOpen, existingNote]);

  if (!isOpen) return null;

  const persist = () => {
    const trimmed = title.trim();
    if (!trimmed) return false;
    const tags = parseTags(tagsInput);
    const typeValue = type === "" ? undefined : type;

    if (isCreateMode && creatingNoteInCategoryId) {
      addNote(creatingNoteInCategoryId, {
        categoryId: creatingNoteInCategoryId,
        title: trimmed,
        content,
        tags,
        type: typeValue,
        source: "user",
      });
      notify.success("Note created");
    } else if (isEditMode && existingNote) {
      updateNote(existingNote.id, {
        title: trimmed,
        content,
        tags,
        type: typeValue,
      });
      notify.success("Note saved");
    }
    return true;
  };

  const handleSave = () => {
    if (persist()) closeNoteEditor();
  };

  const handleSaveStay = () => {
    persist();
  };

  const handleDeleteConfirmed = () => {
    if (!existingNote) return;
    deleteNote(existingNote.id);
    notify.success("Note deleted");
    closeNoteEditor();
  };

  return (
    <Modal onClose={closeNoteEditor} zIndex={60}>
      <div
        className="bg-bg-surface border border-border rounded-md w-full max-w-[600px] max-h-[85vh] overflow-hidden flex flex-col"
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
            e.preventDefault();
            handleSave();
          }
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault();
            handleSaveStay();
          }
        }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <span className="text-text-muted text-[11px] uppercase tracking-[0.1em] font-mono">
            {isEditMode ? "Edit note" : "New note"}
          </span>
          <button
            type="button"
            aria-label="Close"
            onClick={closeNoteEditor}
            className="w-6 h-6 flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4">
          <input
            ref={titleRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full bg-transparent text-text-primary text-[18px] font-medium placeholder:text-text-muted focus:outline-none"
          />

          <div className="flex gap-3">
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="tag1, tag2"
              className="flex-1 h-8 px-2 bg-bg-primary text-text-muted placeholder:text-text-muted text-[12px] font-mono border border-border rounded-md focus:border-accent-blue focus:outline-none"
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value as NoteCategory | "")}
              className="h-8 px-2 bg-bg-primary text-text-muted text-[12px] font-mono border border-border rounded-md focus:border-accent-blue focus:outline-none"
            >
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your note in markdown..."
            className="w-full min-h-[200px] flex-1 p-3 bg-bg-primary text-text-primary text-[14px] font-mono border border-border rounded-md focus:border-accent-blue focus:outline-none resize-none"
          />
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <div>
            {isEditMode && !pendingDelete && (
              <button
                type="button"
                onClick={() => setPendingDelete(true)}
                className="px-3 h-8 text-[13px] text-accent-red hover:brightness-125 rounded-md transition"
              >
                Delete
              </button>
            )}
            {isEditMode && pendingDelete && (
              <div className="flex items-center gap-2">
                <span className="text-text-muted text-[12px]">
                  Are you sure?
                </span>
                <button
                  type="button"
                  onClick={handleDeleteConfirmed}
                  className="px-2 h-7 text-[12px] bg-accent-red text-bg-primary rounded-md hover:brightness-110 transition"
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setPendingDelete(false)}
                  className="px-2 h-7 text-[12px] text-text-muted hover:text-text-primary rounded-md transition"
                >
                  No
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={closeNoteEditor}
              className="px-3 h-8 text-[13px] text-text-muted hover:text-text-primary rounded-md transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!title.trim()}
              className="px-4 h-8 text-[13px] font-medium bg-accent-blue text-bg-primary rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
