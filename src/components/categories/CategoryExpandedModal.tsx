import { useState } from "react";
import { Trash2, X } from "lucide-react";
import { useSectionStore } from "../../stores/sectionStore";
import { noteMatches } from "../../lib/search";
import { notify } from "../../lib/toast";
import { Modal } from "../ui/Modal";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { ExpandedNoteCard } from "../notes/ExpandedNoteCard";
import { NewNoteTile } from "../notes/NewNoteTile";

export function CategoryExpandedModal() {
  const expandedCategoryId = useSectionStore((s) => s.expandedCategoryId);
  const closeCategory = useSectionStore((s) => s.closeCategory);
  const openNoteEditor = useSectionStore((s) => s.openNoteEditor);
  const openNewNoteEditor = useSectionStore((s) => s.openNewNoteEditor);
  const deleteCategory = useSectionStore((s) => s.deleteCategory);
  const searchQuery = useSectionStore((s) => s.searchQuery.trim().toLowerCase());

  const category = useSectionStore((s) =>
    expandedCategoryId ? s.findCategoryById(expandedCategoryId) : undefined,
  );
  const readOnly = useSectionStore((s) => {
    if (!category) return false;
    const section =
      s.engramSections.find((sec) => sec.id === category.sectionId) ??
      s.sections.find((sec) => sec.id === category.sectionId);
    return section?.readOnly ?? false;
  });

  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!expandedCategoryId || !category) return null;

  const noteCount = category.notes.length;

  const handleDeleteClick = () => {
    if (noteCount === 0) {
      deleteCategory(category.id);
      notify.success("Category deleted");
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteCategory(category.id);
    notify.success("Category deleted");
    setConfirmOpen(false);
  };

  return (
    <Modal onClose={closeCategory} backdropClassName="bg-black/70" zIndex={40}>
      <div className="bg-bg-surface border border-border rounded-md w-full max-w-[900px] max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-accent-red" />
            <span className="w-3 h-3 rounded-full bg-accent-orange" />
            <span className="w-3 h-3 rounded-full bg-accent-green" />
          </div>
          <span className="flex-1 text-center text-text-primary text-[13px] font-medium truncate px-4">
            {category.name}
          </span>
          {!readOnly && (
            <button
              type="button"
              aria-label="Delete category"
              onClick={handleDeleteClick}
              className="w-6 h-6 flex items-center justify-center text-text-muted hover:text-accent-red transition-colors"
            >
              <Trash2 size={14} />
            </button>
          )}
          <button
            type="button"
            aria-label="Close"
            onClick={closeCategory}
            className="w-6 h-6 flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-8 overflow-y-auto">
          <h2
            className="text-[28px] font-medium"
            style={{ color: category.accentColor }}
          >
            {category.name}
          </h2>

          <div className="grid grid-cols-3 gap-4 mt-8">
            {category.notes.map((note) => (
              <ExpandedNoteCard
                key={note.id}
                note={note}
                dimmed={!!searchQuery && !noteMatches(note, searchQuery)}
                onClick={() => openNoteEditor(note.id)}
              />
            ))}
            {!readOnly && (
              <NewNoteTile onClick={() => openNewNoteEditor(category.id)} />
            )}
          </div>
        </div>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        title={`Delete "${category.name}"?`}
        description={`This category contains ${noteCount} ${noteCount === 1 ? "note" : "notes"}. They will be deleted too. This cannot be undone.`}
        confirmLabel="Delete category"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </Modal>
  );
}
