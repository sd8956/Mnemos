import { Minus, Plus } from "lucide-react";
import { useReactFlow, useViewport } from "@xyflow/react";

export function ZoomIndicator() {
  const { zoom } = useViewport();
  const { zoomIn, zoomOut } = useReactFlow();

  return (
    <div className="absolute bottom-4 left-4 z-10 flex items-center gap-1 bg-bg-surface border border-border rounded-md py-1 px-3 font-mono text-[12px] text-text-primary">
      <button
        type="button"
        aria-label="Zoom out"
        onClick={() => zoomOut()}
        className="flex items-center justify-center w-5 h-5 text-text-muted hover:text-text-primary transition-colors"
      >
        <Minus size={14} />
      </button>
      <span className="w-12 text-center">{Math.round(zoom * 100)}%</span>
      <button
        type="button"
        aria-label="Zoom in"
        onClick={() => zoomIn()}
        className="flex items-center justify-center w-5 h-5 text-text-muted hover:text-text-primary transition-colors"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
