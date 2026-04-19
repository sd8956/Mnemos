import { useState } from "react";
import { X } from "lucide-react";
import type { Section } from "../../types";
import { useSectionStore } from "../../stores/sectionStore";
import { notify } from "../../lib/toast";
import { ConfirmDialog } from "../ui/ConfirmDialog";

function TabButton({
  section,
  isActive,
  onClick,
  onDelete,
}: {
  section: Section;
  isActive: boolean;
  onClick: () => void;
  onDelete?: () => void;
}) {
  const deletable = Boolean(onDelete);
  return (
    <div
      className={[
        "group relative h-12 flex items-center gap-1 border-b-2 transition-colors",
        isActive ? "border-accent-blue" : "border-transparent",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={onClick}
        className={[
          "text-[13px] tracking-[0.1em] uppercase transition-colors",
          isActive
            ? "text-text-primary"
            : "text-text-muted hover:text-text-primary",
        ].join(" ")}
      >
        {section.name}
      </button>
      {deletable && (
        <button
          type="button"
          aria-label={`Delete section ${section.name}`}
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.();
          }}
          className="hidden group-hover:flex w-4 h-4 items-center justify-center text-text-muted hover:text-accent-red transition-colors"
        >
          <X size={10} />
        </button>
      )}
    </div>
  );
}

export function SectionTabs() {
  const engramSections = useSectionStore((s) => s.engramSections);
  const sections = useSectionStore((s) => s.sections);
  const activeSectionId = useSectionStore((s) => s.activeSectionId);
  const setActiveSection = useSectionStore((s) => s.setActiveSection);
  const openNewSection = useSectionStore((s) => s.openNewSectionModal);
  const deleteSection = useSectionStore((s) => s.deleteSection);

  const [pendingDelete, setPendingDelete] = useState<Section | null>(null);

  const handleDeleteRequest = (section: Section) => {
    if (section.categories.length === 0) {
      deleteSection(section.id);
      notify.success("Section deleted");
      return;
    }
    setPendingDelete(section);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    deleteSection(pendingDelete.id);
    notify.success("Section deleted");
    setPendingDelete(null);
  };

  return (
    <>
      <nav className="flex items-center gap-6" aria-label="Sections">
        {engramSections.map((section) => (
          <TabButton
            key={section.id}
            section={section}
            isActive={section.id === activeSectionId}
            onClick={() => setActiveSection(section.id)}
          />
        ))}
        {sections.map((section) => (
          <TabButton
            key={section.id}
            section={section}
            isActive={section.id === activeSectionId}
            onClick={() => setActiveSection(section.id)}
            onDelete={
              section.type === "custom"
                ? () => handleDeleteRequest(section)
                : undefined
            }
          />
        ))}

        <button
          type="button"
          onClick={openNewSection}
          className="h-12 flex items-center text-[13px] tracking-[0.1em] uppercase text-text-muted border-b-2 border-transparent hover:text-text-primary transition-colors"
        >
          + New Section
        </button>
      </nav>

      <ConfirmDialog
        open={pendingDelete !== null}
        title={`Delete "${pendingDelete?.name ?? ""}"?`}
        description={
          pendingDelete
            ? `This section contains ${pendingDelete.categories.length} ${pendingDelete.categories.length === 1 ? "category" : "categories"} with all their notes. They will be deleted too. This cannot be undone.`
            : undefined
        }
        confirmLabel="Delete section"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}
