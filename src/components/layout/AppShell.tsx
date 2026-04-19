import { Toaster } from "sonner";
import { useFlushOnClose } from "../../hooks/useFlushOnClose";
import { useHydration } from "../../hooks/useHydration";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts";
import { ErrorBoundary } from "../ErrorBoundary";
import { Canvas } from "../canvas/Canvas";
import { LoadingScreen } from "./LoadingScreen";
import { ShortcutsModal } from "./ShortcutsModal";
import { TopBar } from "./TopBar";

export function AppShell() {
  const isHydrated = useHydration();
  useFlushOnClose();
  useKeyboardShortcuts();

  if (!isHydrated) {
    return <LoadingScreen />;
  }

  return (
    <div className="h-screen flex flex-col bg-bg-primary">
      <ErrorBoundary label="TopBar">
        <TopBar />
      </ErrorBoundary>
      <main className="flex-1 min-h-0">
        <ErrorBoundary label="Canvas">
          <Canvas />
        </ErrorBoundary>
      </main>
      <ShortcutsModal />
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#1e2030",
            border: "1px solid #292e42",
            color: "#c0caf5",
            fontSize: "13px",
            fontFamily:
              "ui-sans-serif, system-ui, -apple-system, sans-serif",
          },
        }}
      />
    </div>
  );
}
