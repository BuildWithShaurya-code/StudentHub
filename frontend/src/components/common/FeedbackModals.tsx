import React, { useEffect, useRef } from 'react';
import { useFeedback } from '../../context/FeedbackContext';
import { Trash2, AlertTriangle, CheckCircle2, XCircle, Clock, X, Loader2 } from 'lucide-react';

export const DeleteConfirmModal: React.FC = () => {
  const { deleteModal, closeDeleteModal } = useFeedback();

  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!deleteModal.isOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    dialog?.querySelector<HTMLButtonElement>('button:last-of-type')?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !deleteModal.isDeleting) closeDeleteModal();
      if (event.key !== 'Tab' || !dialog) return;
      const buttons = [...dialog.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')];
      const first = buttons[0], last = buttons[buttons.length - 1];
      if (!first) { event.preventDefault(); return; }
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', handleKey);
    return () => { document.removeEventListener('keydown', handleKey); previous?.focus(); };
  }, [deleteModal.isOpen, deleteModal.isDeleting, closeDeleteModal]);

  if (!deleteModal.isOpen || !deleteModal.student) return null;

  const { student, isDeleting, onConfirm } = deleteModal;

  const handleConfirm = async () => {
    if (onConfirm && !isDeleting) {
      await onConfirm();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start gap-4 mb-4">
            <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0 text-red-600">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 id="delete-modal-title" className="text-lg font-bold text-slate-900">
                  Delete Student Record?
                </h3>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                  Critical Action
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Student record #{student.id}
              </p>
            </div>
          </div>

          {/* Student Info Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 mb-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 text-sm">{student.name}</span>
              <span className="text-xs font-mono font-medium bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded">
                Roll: {student.rollNumber}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <span>{student.semester}</span>
              <span>•</span>
              <span>{student.department}</span>
            </div>
          </div>

          {/* Warning Message */}
          <p className="text-xs text-slate-600 leading-relaxed mb-6">
            This action is irreversible. This student record and its overall marks will be permanently removed.
          </p>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleConfirm}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-sm transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Deleting Record...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Student</span>
                </>
              )}
            </button>

            <button
              type="button"
              disabled={isDeleting}
              onClick={closeDeleteModal}
              className="w-full py-2.5 px-4 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-sm transition-colors disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useFeedback();

  if (toasts.length === 0) return null;

  return (
    <div aria-live="polite" className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let icon = <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
        let borderClass = 'border-emerald-200';
        let bgClass = 'bg-white';

        if (toast.type === 'error') {
          icon = <XCircle className="w-5 h-5 text-red-600" />;
          borderClass = 'border-red-200';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-5 h-5 text-amber-600" />;
          borderClass = 'border-amber-200';
        } else if (toast.type === 'info') {
          icon = <Clock className="w-5 h-5 text-blue-600" />;
          borderClass = 'border-blue-200';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-lg ${bgClass} ${borderClass} transition-all duration-200 animate-in slide-in-from-top-2`}
          >
            <div className="shrink-0 mt-0.5">{icon}</div>
            <div className="flex-1 min-w-0">
              {toast.title && (
                <h4 className="text-xs font-semibold text-slate-900 leading-tight">
                  {toast.title}
                </h4>
              )}
              <p className="text-xs text-slate-600 mt-0.5 leading-snug break-words">
                {toast.message}
              </p>
            </div>
            <button
              aria-label="Dismiss notification"
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
