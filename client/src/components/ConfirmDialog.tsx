import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography 
} from '@mui/material';
import type { ReactNode } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: 'primary' | 'error' | 'warning';
  loading?: boolean;
}

/**
 * ConfirmDialog Component
 * 
 * A reusable confirmation dialog for destructive or important actions.
 * Supports custom labels, colors, and loading states.
 */
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmColor = 'primary',
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby="confirm-dialog-title"
    >
      <DialogTitle id="confirm-dialog-title">
        {title}
      </DialogTitle>
      
      <DialogContent>
        {typeof message === 'string' ? (
          <Typography variant="body2" color="text.secondary">
            {message}
          </Typography>
        ) : (
          message
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={confirmColor}
          disabled={loading}
          autoFocus
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
