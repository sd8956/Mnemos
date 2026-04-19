import type { MouseEvent } from "react";
import type { Note } from "../../types";

type NoteCardProps = {
  note: Note;
  dimmed?: boolean;
  onClick?: (note: Note) => void;
};

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function NoteCard({ note, dimmed, onClick }: NoteCardProps) {
  const isEngram = note.source === "engram";

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (onClick) onClick(note);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={[
        "nodrag relative text-left w-full min-h-[80px] overflow-hidden bg-bg-primary border border-border rounded-md p-[10px] transition-all duration-150 hover:border-text-muted hover:-translate-y-px",
        dimmed ? "opacity-30" : "",
      ].join(" ")}
    >
      {isEngram && (
        <span className="absolute top-1.5 right-1.5 bg-accent-purple text-bg-primary text-[9px] font-medium px-1.5 py-[2px] rounded-md tracking-wide">
          AI
        </span>
      )}

      <div className="text-text-primary text-[13px] font-medium truncate pr-8">
        {note.title}
      </div>

      <div className="text-text-muted text-[11px] mt-1 line-clamp-2 break-words">
        {note.content}
      </div>

      <div className="flex items-center justify-between gap-2 mt-2 min-w-0">
        <div className="flex gap-1.5 flex-wrap min-w-0">
          {note.tags.map((tag) => (
            <span
              key={tag}
              className="text-accent-blue text-[10px] font-mono truncate max-w-[120px]"
            >
              {tag.startsWith("#") ? tag : `#${tag}`}
            </span>
          ))}
        </div>
        <span className="text-text-muted text-[10px] font-mono shrink-0">
          {formatTimestamp(note.updatedAt)}
        </span>
      </div>
    </button>
  );
}
