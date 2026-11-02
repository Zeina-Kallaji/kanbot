import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';

interface Props {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmText = 'Confirm',
  loading = false,
  onClose,
  onConfirm,
}: Props) {
  return (
    <Dialog open={open} onClose={loading ? undefined : onClose}>
      <DialogTitle>{title}</DialogTitle>

      <DialogContent>
        <Typography color="text.secondary">
          {description}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>

        <Button
          color="error"
          variant="contained"
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? 'Deleting...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}