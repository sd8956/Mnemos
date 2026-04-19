import { Folder, Lock, Maximize2, Plus } from "lucide-react";
import type { Node, NodeProps } from "@xyflow/react";
import type { Category } from "../../types";
import { useSectionStore } from "../../stores/sectionStore";
import { categoryMatches, noteMatches } from "../../lib/search";
import { NoteCard } from "../notes/NoteCard";

export type CategoryNodeData = {
  category: Category;
};

export type CategoryNodeType = Node<CategoryNodeData, "category">;

export function CategoryNode({ data }: NodeProps<CategoryNodeType>) {
  const { category } = data;

  const readOnly = useSectionStore((s) => {
    const section =
      s.engramSections.find((sec) => sec.id === category.sectionId) ??
      s.sections.find((sec) => sec.id === category.sectionId);
    return section?.readOnly ?? false;
  });
  const sectionType = useSectionStore((s) => {
    const section =
      s.engramSections.find((sec) => sec.id === category.sectionId) ??
      s.sections.find((sec) => sec.id === category.sectionId);
    return section?.type;
  });
  const openCategory = useSectionStore((s) => s.openCategory);
  const openNewNoteEditor = useSectionStore((s) => s.openNewNoteEditor);
  const searchQuery = useSectionStore((s) =>
    s.searchQuery.trim().toLowerCase(),
  );

  const isEngram = sectionType === "engram";
  const categoryDimmed = Boolean(
    searchQuery && !categoryMatches(category, searchQuery),
  );

  return (
    <div
      style={{
        width: 320,
        minHeight: 280,
        opacity: categoryDimmed ? 0.3 : 1,
        transition: "opacity 120ms ease",
      }}
      className="relative bg-bg-surface border border-border rounded-md shadow-[0_4px_24px_rgba(0,0,0,0.4)] overflow-hidden"
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-md"
        style={{ backgroundColor: category.accentColor }}
      />

      <div className="flex items-center gap-2 p-4 pl-5">
        <Folder size={16} style={{ color: category.accentColor }} />
        <span className="text-text-primary text-[15px] font-medium flex-1 truncate">
          {category.name}
        </span>
        {isEngram && <Lock size={12} className="text-text-muted" />}
        <button
          type="button"
          aria-label="Expand category"
          onClick={(e) => {
            e.stopPropagation();
            openCategory(category.id);
          }}
          className="nodrag w-5 h-5 flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
        >
          <Maximize2 size={14} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 px-4 pb-4">
        {category.notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            dimmed={Boolean(searchQuery && !noteMatches(note, searchQuery))}
            onClick={() => openCategory(category.id)}
          />
        ))}
      </div>

      {!readOnly && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openNewNoteEditor(category.id);
          }}
          className="nodrag flex items-center gap-1 px-4 pb-4 text-text-muted hover:text-text-primary text-[12px] transition-colors"
        >
          <Plus size={12} />
          Add note
        </button>
      )}
    </div>
  );
}
