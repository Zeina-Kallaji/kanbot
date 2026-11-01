import { toast as sonnerToast } from 'sonner';

/**
 * Toast Utility
 * 
 * Centralized toast notification system.
 * Wraps the sonner library with our app's conventions.
 */

export const toast = {
  success: (message: string) => {
    sonnerToast.success(message);
  },
  
  error: (message: string) => {
    sonnerToast.error(message);
  },
  
  info: (message: string) => {
    sonnerToast.info(message);
  },
  
  warning: (message: string) => {
    sonnerToast.warning(message);
  },
  
  loading: (message: string) => {
    return sonnerToast.loading(message);
  },
  
  dismiss: (toastId?: string | number) => {
    sonnerToast.dismiss(toastId);
  },
};
