import {
  Brain,
  Bug,
  Code2,
  Database,
  PenTool,
  Sparkles,
} from "lucide-react";
import type { ComponentType } from "react";
import type { Note } from "../../types";

const TYPE_ICONS: Partial<
  Record<NonNullable<Note["type"]>, ComponentType<{ size?: number; className?: string }>>
> = {
  logic: Brain,
  data: Database,
  ui: PenTool,
  issues: Bug,
  config: Code2,
  architecture: Brain,
  decision: Brain,
  bugfix: Bug,
  discovery: Sparkles,
  learning: Brain,
  pattern: Code2,
  manual: PenTool,
  session_summary: Database,
};

type Props = {
  note: Note;
  dimmed?: boolean;
  onClick: () => void;
};

export function ExpandedNoteCard({ note, dimmed, onClick }: Props) {
  const isEngram = note.source === "engram";
  const TypeIcon = note.type ? TYPE_ICONS[note.type] : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "relative text-left bg-bg-primary border border-border rounded-md p-4 overflow-hidden transition-all duration-150 hover:border-text-muted hover:-translate-y-px min-h-[130px]",
        dimmed ? "opacity-30" : "",
      ].join(" ")}
    >
      {isEngram && (
        <span className="absolute top-2 right-2 bg-accent-purple text-bg-primary text-[9px] font-medium px-1.5 py-[2px] rounded-md tracking-wide">
          AI
        </span>
      )}

      <div className="flex items-center justify-between">
        <span className="text-text-muted text-[10px] uppercase tracking-[0.1em] font-mono">
          {note.type ?? "note"}
        </span>
        {TypeIcon ? (
          <TypeIcon size={12} className="text-text-muted" />
        ) : (
          <Sparkles size={12} className="text-text-muted opacity-0" />
        )}
      </div>

      <div className="text-text-primary text-[15px] font-medium mt-2 truncate pr-8">
        {note.title}
      </div>

      <div className="text-text-muted text-[13px] mt-1.5 line-clamp-3 break-words">
        {note.content}
      </div>
    </button>
  );
}
