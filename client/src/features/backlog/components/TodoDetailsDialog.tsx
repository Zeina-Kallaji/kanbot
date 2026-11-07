// client/src/features/backlog/components/TodoDetailsDialog.tsx

import { useEffect, useMemo, useState } from 'react';

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
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import type {
  Todo,
  TodoPriority,
  TodoStatus,
  TodoType,
  StoryPoints,
  UpdateTodoRequest,
} from '../../../types/api';

interface SprintOption {
  id: string;
  name: string;
}

interface TodoDetailsDialogProps {
  open: boolean;
  todo: Todo | null;

  sprints?: SprintOption[];

  onClose: () => void;
  onSave: (data: UpdateTodoRequest) => Promise<void>;
  onDelete?: () => Promise<void>;

  isSaving?: boolean;
  isDeleting?: boolean;

  fieldErrors?: Record<string, string>;
  serverError?: string | null;
}

interface TodoFormState {
  title: string;
  description: string;
  type: TodoType;
  status: TodoStatus;
  priority: TodoPriority;
  storyPoints: string;
  labels: string;
  dueDate: string;
  sprintId: string;
}

function createFormState(todo: Todo): TodoFormState {
  return {
    title: todo.title,
    description: todo.description,
    type: todo.type,
    status: todo.status,
    priority: todo.priority,
    storyPoints: todo.storyPoints?.toString() ?? '',
    labels: todo.labels.join(', '),
    dueDate: todo.dueDate ?? '',
    sprintId: todo.sprintId ?? '',
  };
}

export default function TodoDetailsDialog({
  open,
  todo,
  sprints = [],
  onClose,
  onSave,
  onDelete,
  isSaving = false,
  isDeleting = false,
  fieldErrors = {},
  serverError,
}: TodoDetailsDialogProps) {
  const [form, setForm] = useState<TodoFormState | null>(null);
  const [showDiscardConfirmation, setShowDiscardConfirmation] =
    useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] =
    useState(false);
  const theme = useTheme();
  // Phones get a full-screen sheet: the form has 9 fields.
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (open && todo) {
      // Reset form when dialog opens - intentional for form initialization
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm(createFormState(todo));
      setShowDiscardConfirmation(false);
      setShowDeleteConfirmation(false);
    }
  }, [open, todo]);

  const initialForm = useMemo(
    () => (todo ? createFormState(todo) : null),
    [todo]
  );

  const hasChanges =
    form !== null &&
    initialForm !== null &&
    JSON.stringify(form) !== JSON.stringify(initialForm);

  function updateField<K extends keyof TodoFormState>(
    field: K,
    value: TodoFormState[K]
  ) {
    setForm((previous) =>
      previous ? { ...previous, [field]: value } : previous
    );
  }

  function requestClose() {
    if (isSaving || isDeleting) return;

    if (hasChanges) {
      setShowDiscardConfirmation(true);
      return;
    }

    onClose();
  }

  function discardChanges() {
    setShowDiscardConfirmation(false);
    onClose();
  }

  async function handleSave() {
    if (!form || !todo || !form.title.trim()) return;

    const points = form.storyPoints === ''
      ? null
      : Number(form.storyPoints) as StoryPoints;

    const data: UpdateTodoRequest = {
      title: form.title.trim(),
      description: form.description,
      type: form.type,
      status: form.status,
      priority: form.priority,
      storyPoints: points,
      labels: form.labels
        .split(',')
        .map((label) => label.trim())
        .filter(Boolean),
      dueDate: form.dueDate || null,
      sprintId: form.sprintId || null,
    };

    try {
      await onSave(data);
      onClose();
    } catch {
      // The parent component handles the error display.
    }
  }

  async function handleDelete() {
    if (!onDelete) return;

    try {
      await onDelete();
      setShowDeleteConfirmation(false);
      onClose();
    } catch {
      // The parent component handles the error display.
    }
  }

  if (!todo || !form) return null;

  return (
    <>
      <Dialog
        open={open}
        onClose={requestClose}
        fullWidth
        maxWidth="sm"
        fullScreen={fullScreen}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Todo Details
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mt: 0.5 }}
          >
            {todo.key}
          </Typography>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            {serverError && (
              <Alert severity="error">
                {serverError}
              </Alert>
            )}

            <TextField
              label="Title"
              fullWidth
              required
              value={form.title}
              onChange={(event) =>
                updateField('title', event.target.value)
              }
              error={Boolean(fieldErrors.title)}
              helperText={fieldErrors.title}
            />

            <TextField
              label="Description"
              fullWidth
              multiline
              minRows={3}
              value={form.description}
              onChange={(event) =>
                updateField('description', event.target.value)
              }
              error={Boolean(fieldErrors.description)}
              helperText={fieldErrors.description}
            />

            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                label="Type"
                value={form.type}
                onChange={(event) =>
                  updateField('type', event.target.value as TodoType)
                }
              >
                <MenuItem value="task">Task</MenuItem>
                <MenuItem value="story">Story</MenuItem>
                <MenuItem value="bug">Bug</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={form.status}
                onChange={(event) =>
                  updateField('status', event.target.value as TodoStatus)
                }
              >
                <MenuItem value="todo">To do</MenuItem>
                <MenuItem value="in_progress">In progress</MenuItem>
                <MenuItem value="in_review">In review</MenuItem>
                <MenuItem value="done">Done</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                label="Priority"
                value={form.priority}
                onChange={(event) =>
                  updateField(
                    'priority',
                    event.target.value as TodoPriority
                  )
                }
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Story Points</InputLabel>
              <Select
                label="Story Points"
                value={form.storyPoints}
                onChange={(event) =>
                  updateField('storyPoints', event.target.value)
                }
              >
                <MenuItem value="">No points</MenuItem>
                {[1, 2, 3, 5, 8, 13].map((point) => (
                  <MenuItem key={point} value={String(point)}>
                    {point}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Labels"
              fullWidth
              value={form.labels}
              onChange={(event) =>
                updateField('labels', event.target.value)
              }
              helperText="Separate labels with commas."
              error={Boolean(fieldErrors.labels)}
            />

            <TextField
              label="Due Date"
              type="date"
              fullWidth
              value={form.dueDate}
              onChange={(event) =>
                updateField('dueDate', event.target.value)
              }
              slotProps={{
                inputLabel: { shrink: true },
              }}
              error={Boolean(fieldErrors.dueDate)}
              helperText={fieldErrors.dueDate}
            />

            <FormControl fullWidth>
              <InputLabel>Sprint</InputLabel>
              <Select
                label="Sprint"
                value={form.sprintId}
                onChange={(event) =>
                  updateField('sprintId', event.target.value)
                }
              >
                <MenuItem value="">Backlog</MenuItem>

                {sprints.map((sprint) => (
                  <MenuItem key={sprint.id} value={sprint.id}>
                    {sprint.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          {onDelete ? (
            <Button
              color="error"
              onClick={() => setShowDeleteConfirmation(true)}
              disabled={isSaving || isDeleting}
            >
              Delete
            </Button>
          ) : (
            <span />
          )}

          <Stack direction="row" spacing={1} sx={{ '& .MuiButton-root': { whiteSpace: 'nowrap' } }}>
            <Button
              onClick={requestClose}
              disabled={isSaving || isDeleting}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              onClick={handleSave}
              disabled={
                isSaving ||
                isDeleting ||
                !form.title.trim() ||
                !hasChanges
              }
            >
              {isSaving ? 'Saving...' : 'Save changes'}
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>

      {/* Discard changes confirmation */}
      <Dialog
        open={showDiscardConfirmation}
        onClose={() => setShowDiscardConfirmation(false)}
      >
        <DialogTitle>Discard changes?</DialogTitle>

        <DialogContent>
          <Typography color="text.secondary">
            You have unsaved changes. Are you sure you want to discard them?
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setShowDiscardConfirmation(false)}>
            Keep editing
          </Button>

          <Button color="error" onClick={discardChanges}>
            Discard changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog
        open={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
      >
        <DialogTitle>Delete todo?</DialogTitle>

        <DialogContent>
          <Typography color="text.secondary">
            Are you sure you want to delete "{todo.title}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setShowDeleteConfirmation(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}