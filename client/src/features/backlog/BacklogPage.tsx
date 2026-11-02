// client/src/features/backlog/BacklogPage.tsx

import { useDeferredValue, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
} from '@mui/material';

import {
  AutoAwesomeOutlined,
  AddOutlined,
  BoltOutlined,
} from '@mui/icons-material';

import type {
  Todo,
  TodoPriority,
  TodoType,
  UpdateTodoRequest,
} from '../../types/api';

import { ApiError, fieldErrors as getFieldErrors } from '../../api/client';

import { useTodos } from '../../hooks/todos/useTodos';
import { useCreateTodo } from '../../hooks/todos/useCreateTodo';
import { useUpdateTodo } from '../../hooks/todos/useUpdateTodo';
import { useDeleteTodo } from '../../hooks/todos/useDeleteTodo';

import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorState from '../../components/ErrorState';

import BacklogHeader from './components/BacklogHeader';
import BacklogList from './components/BacklogList';
import QuickCreateTodo from './components/QuickCreateTodo';
import TodoDetailsDialog from './components/TodoDetailsDialog';
import TodoFilters from './components/TodoFilters';

export default function BacklogPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const validProjectId = projectId ?? '';

  // Search and filter states
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState<TodoPriority | ''>('');
  const [type, setType] = useState<TodoType | ''>('');

  // Delay applying search until the user pauses typing.
  const deferredSearch = useDeferredValue(search);

  // Selected todo for the details dialog
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);

  // Error states
  const [pageError, setPageError] = useState<string | null>(null);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [detailsFieldErrors, setDetailsFieldErrors] =
    useState<Record<string, string>>({});

  // Fetch the complete backlog for header statistics.
  const {
    data: allData,
    isLoading: isLoadingAll,
    error: allError,
    refetch: refetchAll,
  } = useTodos(projectId ?? '', {
    sprintId: 'backlog',
  });

  // Fetch the filtered backlog for the visible list.
  const {
    data: filteredData,
    isLoading: isLoadingFiltered,
    error: filteredError,
    refetch: refetchFiltered,
  } = useTodos(projectId ?? '', {
    sprintId: 'backlog',
    search: deferredSearch || undefined,
    priority: priority || undefined,
    type: type || undefined,
  });

  // Mutations
  const createMutation = useCreateTodo();
  const updateMutation = useUpdateTodo();
  const deleteMutation = useDeleteTodo();

  const allTodos = useMemo(() => allData?.todos ?? [], [allData]);
  const visibleTodos = filteredData?.todos ?? [];

  // Header statistics
  const stats = useMemo(() => ({
    totalTasks: allTodos.length,
    totalPoints: allTodos.reduce(
      (total, todo) => total + (todo.storyPoints ?? 0),
      0
    ),
  }), [allTodos]);

  // Check project ID
  if (!projectId) {
    return (
      <ErrorState message="Project ID is missing from the URL." />
    );
  }

  // Loading state
  if (isLoadingAll || isLoadingFiltered) {
    return <LoadingSpinner message="Loading backlog..." />;
  }

  // Loading error
  if (allError || filteredError) {
    const error = allError ?? filteredError;

    return (
      <ErrorState
        title="Failed to load backlog"
        message={
          error instanceof Error
            ? error.message
            : 'Something went wrong.'
        }
        onRetry={() => {
          void refetchAll();
          void refetchFiltered();
        }}
      />
    );
  }

  // Create todo
  async function handleCreateTodo(title: string) {
    setPageError(null);

    try {
     await createMutation.mutateAsync({
  projectId: validProjectId,
  data: {
    title,
  },
});
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : 'Failed to create todo.'
      );

      throw error;
    }
  }

  // Open todo details
  function handleOpenTodo(todo: Todo) {
    setSelectedTodo(todo);
    setDetailsError(null);
    setDetailsFieldErrors({});
  }

  // Close todo details
  function handleCloseDetails() {
    setSelectedTodo(null);
    setDetailsError(null);
    setDetailsFieldErrors({});
  }

  // Update todo
  async function handleUpdateTodo(data: UpdateTodoRequest) {
    setDetailsError(null);
    setDetailsFieldErrors({});

    if (!selectedTodo) return;

    try {
     await updateMutation.mutateAsync({
  todoId: selectedTodo.id,
  projectId: validProjectId,
  data,
});
    } catch (error) {
      if (error instanceof ApiError) {
        setDetailsFieldErrors(getFieldErrors(error));
        setDetailsError(
          error.details?.length
            ? null
            : error.message
        );
      } else {
        setDetailsError(
          error instanceof Error
            ? error.message
            : 'Failed to update todo.'
        );
      }

      throw error;
    }
  }

  // Delete todo
  async function handleDeleteTodo() {
    if (!selectedTodo) return;

    setDetailsError(null);

    try {
      await deleteMutation.mutateAsync({
  todoId: selectedTodo.id,
  projectId: validProjectId,
});

      setSelectedTodo(null);
    } catch (error) {
      setDetailsError(
        error instanceof Error
          ? error.message
          : 'Failed to delete todo.'
      );

      throw error;
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>

      {/* Header and statistics */}
      <BacklogHeader
        totalTasks={stats.totalTasks}
        totalPoints={stats.totalPoints}
      />

      {/* Page error */}
      {pageError && (
        <Alert
          severity="error"
          onClose={() => setPageError(null)}
          sx={{ mb: 2 }}
        >
          {pageError}
        </Alert>
      )}

      {/* Filters */}
      <TodoFilters
        search={search}
        priority={priority}
        type={type}
        onSearchChange={setSearch}
        onPriorityChange={setPriority}
        onTypeChange={setType}
      />

      {/* Action buttons */}
      <Stack
        direction="row"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Button
          variant="outlined"
          startIcon={<AutoAwesomeOutlined />}
          disabled
          title="AI generation will be connected after checking the AI API contract."
        >
          Generate todos with AI
        </Button>

        <Button
          variant="outlined"
          startIcon={<BoltOutlined />}
          disabled
          title="Sprint planning with AI coming soon."
        >
          Plan sprint with AI
        </Button>

        <Button
          variant="contained"
          startIcon={<AddOutlined />}
          disabled
          title="Sprint creation coming soon."
        >
          Create sprint
        </Button>
      </Stack>

      {/* Backlog list */}
      <Paper
        variant="outlined"
        sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}
      >
        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Backlog Items
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {visibleTodos.length} items
          </Typography>
        </Stack>

        {visibleTodos.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, mb: 1 }}
            >
              {allTodos.length === 0
                ? 'Your backlog is empty'
                : 'No matching todos'}
            </Typography>

            <Typography color="text.secondary" sx={{ mb: 2 }}>
              {allTodos.length === 0
                ? 'Create your first todo to start organizing your project.'
                : 'Try changing your search or filters.'}
            </Typography>

            {allTodos.length === 0 && (
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                sx={{ justifyContent: 'center' }}
              >
                <Button
                  variant="contained"
                  startIcon={<AddOutlined />}
                  onClick={() => {
                    document
                      .querySelector<HTMLInputElement>(
                        'input[placeholder="+ Create todo"]'
                      )
                      ?.focus();
                  }}
                >
                  Create todo
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<AutoAwesomeOutlined />}
                  disabled
                  title="AI generation will be connected after checking the AI API contract."
                >
                  Generate todos with AI
                </Button>
              </Stack>
            )}
          </Box>
        ) : (
          <BacklogList
            todos={visibleTodos}
            onTodoClick={handleOpenTodo}
          />
        )}

        {/* Quick create */}
        <QuickCreateTodo
          onCreate={handleCreateTodo}
          isCreating={createMutation.isPending}
        />
      </Paper>

      {/* Todo details dialog */}
      <TodoDetailsDialog
        open={Boolean(selectedTodo)}
        todo={selectedTodo}
        onClose={handleCloseDetails}
        onSave={handleUpdateTodo}
        onDelete={handleDeleteTodo}
        isSaving={updateMutation.isPending}
        isDeleting={deleteMutation.isPending}
        fieldErrors={detailsFieldErrors}
        serverError={detailsError}
      />
    </Container>
  );
}