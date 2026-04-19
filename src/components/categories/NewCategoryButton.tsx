import { Plus } from "lucide-react";
import { useSectionStore } from "../../stores/sectionStore";

export function NewCategoryButton() {
  const activeSection = useSectionStore((s) => s.getActiveSection());
  const openModal = useSectionStore((s) => s.openNewCategoryModal);

  if (!activeSection || activeSection.readOnly) return null;

  return (
    <button
      type="button"
      aria-label="New category"
      onClick={openModal}
      className="absolute bottom-6 right-[280px] z-10 w-12 h-12 rounded-md bg-accent-blue text-bg-primary flex items-center justify-center hover:brightness-110 transition shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
    >
      <Plus size={20} />
    </button>
  );
}
