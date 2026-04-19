import { Loader2 } from "lucide-react";

export function EngramLoadingState() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center gap-4">
      <Loader2 size={40} className="text-accent-blue animate-spin" />
      <p className="text-text-muted text-[13px]">Loading Engram data...</p>
    </div>
  );
}
