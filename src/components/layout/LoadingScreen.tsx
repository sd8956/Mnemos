export function LoadingScreen() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-bg-primary gap-2">
      <span className="font-mono font-bold text-accent-blue tracking-[2px] text-sm">
        Mnemos
      </span>
      <span className="text-text-muted text-[13px]">Loading...</span>
    </div>
  );
}
