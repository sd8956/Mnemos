import { X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useSectionStore } from "../../stores/sectionStore";
import { Modal } from "../ui/Modal";

export function NoteReader() {
  const editingNoteId = useSectionStore((s) => s.editingNoteId);
  const closeNoteEditor = useSectionStore((s) => s.closeNoteEditor);
  const note = useSectionStore((s) =>
    editingNoteId ? s.findNote(editingNoteId) : undefined,
  );

  if (!note || note.source !== "engram") return null;

  return (
    <Modal onClose={closeNoteEditor} zIndex={60}>
      <div className="bg-bg-surface border border-border rounded-md w-full max-w-[600px] max-h-[85vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="bg-accent-purple text-bg-primary text-[9px] font-medium px-1.5 py-[2px] rounded-md tracking-wide">
              AI
            </span>
            <span className="text-text-muted text-[11px] uppercase tracking-[0.1em] font-mono">
              {note.type ?? "note"}
            </span>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={closeNoteEditor}
            className="w-6 h-6 flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <h2 className="text-text-primary text-[22px] font-medium mb-2">
            {note.title}
          </h2>
          {note.tags.length > 0 && (
            <div className="flex gap-2 mb-4">
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-accent-blue text-[11px] font-mono"
                >
                  {tag.startsWith("#") ? tag : `#${tag}`}
                </span>
              ))}
            </div>
          )}
          <div className="text-text-primary text-[14px] leading-relaxed prose-invert">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {note.content}
            </ReactMarkdown>
          </div>
        </div>

        <div className="flex justify-end px-6 py-4 border-t border-border">
          <button
            type="button"
            onClick={closeNoteEditor}
            className="px-4 h-8 text-[13px] font-medium bg-accent-blue text-bg-primary rounded-md hover:brightness-110 transition"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
