import { useEffect, useRef, useState } from "react";
import { useReactFlow } from "@xyflow/react";
import { useSectionStore } from "../../stores/sectionStore";
import { notify } from "../../lib/toast";
import { Modal } from "../ui/Modal";

const ACCENT_OPTIONS = [
  "#7aa2f7",
  "#bb9af7",
  "#7dcfff",
  "#9ece6a",
  "#ff9e64",
  "#f7768e",
];

export function NewCategoryModal() {
  const isOpen = useSectionStore((s) => s.isNewCategoryModalOpen);
  const closeModal = useSectionStore((s) => s.closeNewCategoryModal);
  const activeSectionId = useSectionStore((s) => s.activeSectionId);
  const addCategory = useSectionStore((s) => s.addCategory);

  const [name, setName] = useState("");
  const [accent, setAccent] = useState(ACCENT_OPTIONS[0]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  useEffect(() => {
    if (isOpen) {
      setName("");
      setAccent(ACCENT_OPTIONS[0]);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const position = screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });
    addCategory(activeSectionId, trimmed, accent, position);
    notify.success("Category created");
    closeModal();
  };

  return (
    <Modal onClose={closeModal} zIndex={50}>
      <div className="bg-bg-surface border border-border rounded-md w-full max-w-[400px] p-6">
        <h2 className="text-text-primary text-[15px] font-medium mb-4">
          New category
        </h2>

        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
          placeholder="Category name"
          className="w-full h-9 px-3 bg-bg-primary text-text-primary placeholder:text-text-muted text-sm border border-border rounded-md focus:border-accent-blue focus:outline-none"
        />

        <div className="mt-4">
          <div className="text-text-muted text-[11px] uppercase tracking-[0.1em] mb-2">
            Accent
          </div>
          <div className="flex gap-2">
            {ACCENT_OPTIONS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setAccent(c)}
                className={[
                  "w-7 h-7 rounded-md transition-all",
                  accent === c
                    ? "ring-2 ring-offset-2 ring-offset-bg-surface ring-text-primary"
                    : "",
                ].join(" ")}
                style={{ backgroundColor: c }}
                aria-label={`Accent ${c}`}
              />
            ))}
          </div>
        </div>

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
