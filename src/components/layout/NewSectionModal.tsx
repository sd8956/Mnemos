import { useEffect, useRef, useState } from "react";
import { useSectionStore } from "../../stores/sectionStore";
import { notify } from "../../lib/toast";
import { Modal } from "../ui/Modal";

export function NewSectionModal() {
  const isOpen = useSectionStore((s) => s.isNewSectionModalOpen);
  const closeModal = useSectionStore((s) => s.closeNewSectionModal);
  const addSection = useSectionStore((s) => s.addSection);

  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName("");
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    addSection(trimmed);
    notify.success("Section created");
    closeModal();
  };

  return (
    <Modal onClose={closeModal} zIndex={50}>
      <div className="bg-bg-surface border border-border rounded-md w-full max-w-[400px] p-6">
        <h2 className="text-text-primary text-[15px] font-medium mb-4">
          New section
        </h2>

        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
          placeholder="Section name"
          className="w-full h-9 px-3 bg-bg-primary text-text-primary placeholder:text-text-muted text-sm border border-border rounded-md focus:border-accent-blue focus:outline-none"
        />

        <p className="text-text-muted text-[11px] mt-2">
          Custom sections are fully editable — create categories and notes
          like in Personal.
        </p>

        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={closeModal}
            className="px-3 h-8 text-[13px] text-text-muted hover:text-text-primary rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="px-4 h-8 text-[13px] font-medium bg-accent-blue text-bg-primary rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition"
          >
            Create
          </button>
        </div>
      </div>
    </Modal>
  );
}
