import { useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';
import type {
  CreateSprintRequest,
  Sprint,
  StartSprintRequest,
  UpdateSprintRequest,
} from '../../../types/api';

interface SprintDialogBaseProps {
  open: boolean;
  sprint?: Sprint | null;
  isSaving: boolean;
  onClose: () => void;
  onDelete?: () => void;
}

type SprintDialogProps = SprintDialogBaseProps & (
  | {
      mode: 'create';
      onSubmit: (data: CreateSprintRequest) => Promise<void>;
    }
  | {
      mode: 'edit';
      onSubmit: (data: UpdateSprintRequest) => Promise<void>;
    }
  | {
      mode: 'start';
      onSubmit: (data: StartSprintRequest) => Promise<void>;
    }
);

function localDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function defaultStartDate(): string {
  return localDate(new Date());
}

function defaultEndDate(startDate: string): string {
  const date = new Date(`${startDate}T00:00:00`);
  date.setDate(date.getDate() + 14);
  return localDate(date);
}

export default function SprintDialog({
  mode,
  open,
  sprint,
  isSaving,
  onClose,
  onDelete,
  onSubmit,
}: SprintDialogProps) {
  const [name, setName] = useState(sprint?.name ?? '');
  const [goal, setGoal] = useState(sprint?.goal ?? '');
  const [startDate, setStartDate] = useState(() => {
    const today = defaultStartDate();
    return mode === 'start' ? today : sprint?.startDate ?? '';
  });
  const [endDate, setEndDate] = useState(() => {
    const today = defaultStartDate();
    return mode === 'start'
      ? defaultEndDate(today)
      : sprint?.endDate ?? '';
  });
  const [error, setError] = useState<string | null>(null);

  const title =
    mode === 'create'
      ? 'Create sprint'
      : mode === 'edit'
        ? 'Edit sprint'
        : 'Start sprint';

  async function handleSubmit() {
    if (startDate && endDate && endDate < startDate) {
      setError('End date must be on or after the start date.');
      return;
    }

    setError(null);
    try {
      if (mode === 'start') {
        await onSubmit({
          startDate,
          endDate,
        });
      } else if (mode === 'create') {
        await onSubmit({
          ...(name.trim() ? { name: name.trim() } : {}),
          goal: goal.trim(),
          startDate: startDate || null,
          endDate: endDate || null,
        });
      } else {
        await onSubmit({
          name: name.trim(),
          goal: goal.trim(),
          startDate: startDate || null,
          endDate: endDate || null,
        });
      }
      onClose();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Unable to save the sprint.'
      );
    }
  }

  return (
    <Dialog open={open} onClose={isSaving ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 700 }}>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          {mode !== 'start' && (
            <>
              <TextField
                label={mode === 'create' ? 'Name (optional)' : 'Name'}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={mode === 'create' ? 'Sprint name' : undefined}
                slotProps={{ htmlInput: { maxLength: 80 } }}
              />
              <TextField
                label="Goal"
                value={goal}
                onChange={(event) => setGoal(event.target.value)}
                multiline
                minRows={2}
                slotProps={{ htmlInput: { maxLength: 300 } }}
              />
            </>
          )}
          <TextField
            label="Start date"
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="End date"
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        {mode === 'edit' && onDelete ? (
          <Button color="error" onClick={onDelete} disabled={isSaving}>
            Delete sprint
          </Button>
        ) : (
          <span />
        )}
        <Stack direction="row" spacing={1}>
        <Button onClick={onClose} disabled={isSaving}>Cancel</Button>
        <Button
          variant="contained"
          onClick={() => void handleSubmit()}
          disabled={isSaving || (mode === 'edit' && !name.trim())}
        >
          {isSaving ? 'Saving...' : mode === 'start' ? 'Start sprint' : 'Save'}
        </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
