import { Plus } from "lucide-react";
import { useSectionStore } from "../../stores/sectionStore";

export function PersonalEmptyState() {
  const openModal = useSectionStore((s) => s.openNewCategoryModal);

  return (
    <div className="h-full flex flex-col items-center justify-center text-center gap-4 px-8">
      <div className="w-16 h-16 rounded-md border border-dashed border-border flex items-center justify-center">
        <Plus size={28} className="text-text-muted" />
      </div>
      <h3 className="text-text-primary text-[18px] font-medium">
        No categories yet
      </h3>
      <p className="text-text-muted text-[14px] max-w-[420px]">
        Group related notes together. Create your first category to get
        started.
      </p>
      <button
        type="button"
        onClick={openModal}
        className="mt-2 px-4 h-8 text-[13px] font-medium bg-accent-blue text-bg-primary rounded-md hover:brightness-110 transition"
      >
        Create category
      </button>
    </div>
  );
}
