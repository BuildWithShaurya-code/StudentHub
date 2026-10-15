import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ToastMessage, Student } from '../types/student';

interface DeleteModalState {
  isOpen: boolean;
  student: Student | null;
  isDeleting: boolean;
  onConfirm?: () => Promise<void>;
  onCancel?: () => void;
}

interface FeedbackContextType {
  toasts: ToastMessage[];
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  deleteModal: DeleteModalState;
  openDeleteModal: (student: Student, onConfirm: () => Promise<void>) => void;
  closeDeleteModal: () => void;
  setDeleteLoading: (loading: boolean) => void;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export const FeedbackProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    isOpen: false,
    student: null,
    isDeleting: false,
  });

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, title, message, duration = 4000 }: Omit<ToastMessage, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
      const newToast: ToastMessage = { id, type, title, message, duration };
      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const openDeleteModal = useCallback(
    (student: Student, onConfirm: () => Promise<void>) => {
      setDeleteModal({
        isOpen: true,
        student,
        isDeleting: false,
        onConfirm,
        onCancel: () => {
          setDeleteModal((prev) => ({ ...prev, isOpen: false, student: null }));
        },
      });
    },
    []
  );

  const closeDeleteModal = useCallback(() => {
    setDeleteModal((prev) => ({ ...prev, isOpen: false, isDeleting: false, student: null }));
  }, []);

  const setDeleteLoading = useCallback((loading: boolean) => {
    setDeleteModal((prev) => ({ ...prev, isDeleting: loading }));
  }, []);

  return (
    <FeedbackContext.Provider
      value={{
        toasts,
        showToast,
        removeToast,
        deleteModal,
        openDeleteModal,
        closeDeleteModal,
        setDeleteLoading,
      }}
    >
      {children}
    </FeedbackContext.Provider>
  );
};

export function useFeedback(): FeedbackContextType {
  const ctx = useContext(FeedbackContext);
  if (!ctx) {
    throw new Error('useFeedback must be used within FeedbackProvider');
  }
  return ctx;
}
