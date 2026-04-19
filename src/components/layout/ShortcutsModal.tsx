import { X } from "lucide-react";
import { useSectionStore } from "../../stores/sectionStore";
import { Modal } from "../ui/Modal";

type Shortcut = { keys: string[]; description: string };
type Group = { title: string; items: Shortcut[] };

const isMac =
  typeof navigator !== "undefined" &&
  /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);
const CMD = isMac ? "⌘" : "Ctrl";

const GROUPS: Group[] = [
  {
    title: "Navigation",
    items: [
      { keys: [CMD, "K"], description: "Focus search" },
      { keys: [CMD, "1..9"], description: "Switch to section N" },
      { keys: [CMD, ","], description: "Open settings" },
      { keys: ["?"], description: "Open this shortcuts help" },
      { keys: ["Esc"], description: "Close topmost modal" },
    ],
  },
  {
    title: "Editing",
    items: [
      { keys: [CMD, "N"], description: "New category (Personal only)" },
      { keys: [CMD, "Shift", "N"], description: "New note (in expanded category)" },
      { keys: [CMD, "S"], description: "Save and close note" },
      { keys: [CMD, "Enter"], description: "Save note, keep editor open" },
    ],
  },
  {
    title: "Canvas",
    items: [
      { keys: [CMD, "0"], description: "Reset zoom to 100%" },
      { keys: [CMD, "="], description: "Zoom in" },
      { keys: [CMD, "-"], description: "Zoom out" },
    ],
  },
];

function Kbd({ children }: { children: string }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 text-[11px] font-mono bg-bg-surface border border-border text-text-primary rounded-md">
      {children}
    </kbd>
  );
}

export function ShortcutsModal() {
  const isOpen = useSectionStore((s) => s.isShortcutsModalOpen);
  const close = useSectionStore((s) => s.closeShortcutsModal);

  if (!isOpen) return null;

  return (
    <Modal onClose={close} zIndex={70}>
      <div className="bg-bg-surface border border-border rounded-md w-full max-w-[560px] max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-text-primary text-[15px] font-medium">
            Keyboard shortcuts
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={close}
            className="w-6 h-6 flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex flex-col gap-6">
          {GROUPS.map((group) => (
            <section key={group.title}>
              <h3 className="text-text-muted text-[11px] uppercase tracking-[0.1em] font-mono mb-3">
                {group.title}
              </h3>
              <ul className="flex flex-col gap-2">
                {group.items.map((item) => (
                  <li
                    key={item.description}
                    className="flex items-center justify-between gap-4"
                  >
                    <span className="text-text-primary text-[13px]">
                      {item.description}
                    </span>
                    <span className="flex items-center gap-1">
                      {item.keys.map((k, idx) => (
                        <span key={idx} className="flex items-center gap-1">
                          {idx > 0 && (
                            <span className="text-text-muted text-[11px]">
                              +
                            </span>
                          )}
                          <Kbd>{k}</Kbd>
                        </span>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </Modal>
  );
}
