import { useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import type { CompleteSprintRequest, Sprint } from '../../types/api';

interface CompleteSprintDialogProps {
  open: boolean;
  sprint: Sprint;
  plannedSprints: Sprint[];
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (data: CompleteSprintRequest) => Promise<void>;
}

export default function CompleteSprintDialog({
  open,
  sprint,
  plannedSprints,
  isSaving,
  onClose,
  onSubmit,
}: CompleteSprintDialogProps) {
  const [moveUnfinishedTo, setMoveUnfinishedTo] = useState('backlog');
  const [error, setError] = useState<string | null>(null);
  const unfinishedCount = sprint.stats.totalTodos - sprint.stats.doneTodos;

  async function handleSubmit() {
    setError(null);
    try {
      await onSubmit({ moveUnfinishedTo });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Unable to complete the sprint.'
      );
    }
  }

  return (
    <Dialog
      open={open}
      onClose={isSaving ? undefined : onClose}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle sx={{ fontWeight: 700 }}>Complete {sprint.name}?</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <Typography color="text.secondary">
            {sprint.stats.doneTodos} done · {unfinishedCount} unfinished
          </Typography>
          {unfinishedCount > 0 && (
            <FormControl fullWidth>
              <InputLabel id="unfinished-todos-label">
                Move unfinished todos to
              </InputLabel>
              <Select
                labelId="unfinished-todos-label"
                label="Move unfinished todos to"
                value={moveUnfinishedTo}
                onChange={(event) => setMoveUnfinishedTo(event.target.value)}
              >
                <MenuItem value="backlog">Backlog</MenuItem>
                {plannedSprints.map((plannedSprint) => (
                  <MenuItem key={plannedSprint.id} value={plannedSprint.id}>
                    {plannedSprint.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={isSaving}>Cancel</Button>
        <Button
          color="primary"
          variant="contained"
          onClick={() => void handleSubmit()}
          disabled={isSaving}
        >
          {isSaving ? 'Completing...' : 'Complete sprint'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
