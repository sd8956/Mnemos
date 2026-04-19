import { Modal } from "./Modal";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  danger = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <Modal onClose={onCancel} zIndex={80}>
      <div className="bg-bg-surface border border-border rounded-md w-full max-w-[420px] p-6">
        <h2 className="text-text-primary text-[15px] font-medium">{title}</h2>
        {description && (
          <p className="text-text-muted text-[13px] mt-2 leading-relaxed">
            {description}
          </p>
        )}
        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 h-8 text-[13px] text-text-muted hover:text-text-primary rounded-md transition"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={[
              "px-4 h-8 text-[13px] font-medium rounded-md transition hover:brightness-110",
              danger
                ? "bg-accent-red text-bg-primary"
                : "bg-accent-blue text-bg-primary",
            ].join(" ")}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
