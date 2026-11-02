import { useEffect, useState, type FormEvent } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
} from '@mui/material';

import type {
  ProjectWithStats,
  CreateProjectRequest,
  UpdateProjectRequest,
} from '../../types/api';

import { useCreateProject } from '../../hooks/projects/useCreateProject';
import { useUpdateProject } from '../../hooks/projects/useUpdateProject';

import { ApiError, fieldErrors } from '../../api/client';

interface Props {
  open: boolean;
  project: ProjectWithStats | null;
  onClose: () => void;
}

export function ProjectFormDialog({
  open,
  project,
  onClose,
}: Props) {
  const isEditing = Boolean(project);

  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();

  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');

  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isPending =
    createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (open) {
      // Reset form when dialog opens - this is intentional for form initialization
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(project?.name ?? '');
      setKey(project?.key ?? '');
      setDescription(project?.description ?? '');
      setError('');
      setErrors({});
    }
  }, [open, project]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError('');
    setErrors({});

    const normalizedName = name.trim();
    const normalizedKey = key.trim().toUpperCase();
    const normalizedDescription = description.trim();

    if (!normalizedName) {
      setErrors({ name: 'Project name is required.' });
      return;
    }

    if (normalizedKey && !/^[A-Z]{2,6}$/.test(normalizedKey)) {
      setErrors({
        key: 'Key must contain 2–6 English letters.',
      });
      return;
    }

    try {
      if (project) {
        const updateData: UpdateProjectRequest = {
          name: normalizedName,
          description: normalizedDescription,
        };

        // Send key only if the user entered a value.
        if (normalizedKey) {
          updateData.key = normalizedKey;
        }

        await updateMutation.mutateAsync({
          projectId: project.id,
          data: updateData,
        });
      } else {
        const createData: CreateProjectRequest = {
          name: normalizedName,
          description: normalizedDescription,
        };

        // Backend generates the key when this field is omitted.
        if (normalizedKey) {
          createData.key = normalizedKey;
        }

        await createMutation.mutateAsync(createData);
      }

      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setErrors(fieldErrors(err));
      } else {
        setError('Something went wrong. Please try again.');
      }
    }
  }

  return (
    <Dialog 
      open={open} 
      onClose={isPending ? undefined : onClose}
      maxWidth="sm"
      fullWidth
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {isEditing ? 'Edit Project' : 'Create New Project'}
        </DialogTitle>

        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            {error && (
              <Alert severity="error" onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            <TextField
              label="Project Name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              fullWidth
              autoFocus
              disabled={isPending}
              error={Boolean(errors.name)}
              helperText={errors.name}
              slotProps={{
                htmlInput: { maxLength: 80 },
              }}
            />

            <TextField
              label="Project Key"
              value={key}
              onChange={(event) =>
                setKey(event.target.value.toUpperCase())
              }
              fullWidth
              disabled={isPending}
              error={Boolean(errors.key)}
              helperText={errors.key || 'Auto-generated if empty (2-6 letters)'}
              placeholder={isEditing ? project?.key : 'e.g., KAN'}
              slotProps={{
                htmlInput: { maxLength: 6 },
              }}
            />

            <TextField
              label="Description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              fullWidth
              multiline
              rows={4}
              disabled={isPending}
              placeholder="What is this project about?"
              slotProps={{
                htmlInput: { maxLength: 500 },
              }}
              helperText={`${description.length}/500 characters`}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={onClose} disabled={isPending}>
            Cancel
          </Button>

          <Button 
            type="submit" 
            variant="contained"
            disabled={isPending}
          >
            {isPending
              ? 'Saving...'
              : isEditing
                ? 'Save Changes'
                : 'Create Project'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}