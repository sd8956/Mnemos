import { Plus } from "lucide-react";

type Props = {
  onClick: () => void;
};

export function NewNoteTile({ onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-[130px] border border-dashed border-border rounded-md flex flex-col items-center justify-center gap-1 text-text-muted hover:border-text-muted hover:text-text-primary transition-colors"
    >
      <Plus size={24} />
      <span className="text-[13px]">New note</span>
    </button>
  );
}
