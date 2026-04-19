import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type ModalProps = {
  onClose: () => void;
  backdropClassName?: string;
  children: ReactNode;
  zIndex?: number;
};

export function Modal({
  onClose,
  backdropClassName,
  children,
  zIndex = 50,
}: ModalProps) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = prev;
    };
  }, []);

  return createPortal(
    <div
      className={[
        "fixed inset-0 flex items-center justify-center transition-opacity duration-150 ease-out",
        backdropClassName ?? "bg-black/60",
        entered ? "opacity-100" : "opacity-0",
      ].join(" ")}
      style={{ zIndex }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={[
          "w-full flex items-center justify-center px-4 transition-transform duration-150 ease-out",
          entered ? "translate-y-0" : "translate-y-2",
        ].join(" ")}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
