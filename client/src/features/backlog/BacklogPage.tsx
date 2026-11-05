import { useDeferredValue, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useQueries } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { AddOutlined, AutoAwesomeOutlined, BoltOutlined } from '@mui/icons-material';
import type {
  CreateSprintRequest,
  Sprint,
  StartSprintRequest,
  Todo,
  TodoPriority,
  TodoStatus,
  TodoType,
  UpdateSprintRequest,
  UpdateTodoRequest,
} from '../../types/api';
import { listTodos } from '../../api/todos';
import { ApiError, fieldErrors as getFieldErrors } from '../../api/client';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useSprints } from '../../hooks/sprints/useSprints';
import { useSprintMutations } from '../../hooks/sprints/useSprintMutations';
import { useCreateTodo } from '../../hooks/todos/useCreateTodo';
import { useDeleteTodo } from '../../hooks/todos/useDeleteTodo';
import { useMoveTodo } from '../../hooks/todos/useMoveTodo';
import { todoKeys } from '../../hooks/todos/todoKeys';
import { useTodos } from '../../hooks/todos/useTodos';
import { useUpdateTodo } from '../../hooks/todos/useUpdateTodo';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorState from '../../components/ErrorState';
import BacklogHeader from './components/BacklogHeader';
import BacklogList from './components/BacklogList';
import QuickCreateTodo from './components/QuickCreateTodo';
import SprintDialog from './components/SprintDialog';
import SprintSection from './components/SprintSection';
import TodoDetailsDialog from './components/TodoDetailsDialog';
import TodoFilters from './components/TodoFilters';
import { useAssistantActions } from '../ai/AssistantContext';

const sprintStatuses: TodoStatus[] = [
  'todo',
  'in_progress',
  'in_review',
  'done',
];

function isSprintStatus(value: string): value is TodoStatus {
  return sprintStatuses.includes(value as TodoStatus);
}

interface DropList {
  sprintId: string | null;
  status: TodoStatus | null;
}

function parseListId(listId: string): DropList | null {
  if (listId === 'backlog') return { sprintId: null, status: null };
  const separator = listId.lastIndexOf(':');
  if (separator < 1) return { sprintId: listId, status: null };
  const status = listId.slice(separator + 1);
  if (!isSprintStatus(status)) return null;
  return {
    sprintId: listId.slice(0, separator),
    status,
  };
}

export default function BacklogPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const validProjectId = projectId ?? '';
  const navigate = useNavigate();
  const assistantActions = useAssistantActions();

  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState<TodoPriority | ''>('');
  const [type, setType] = useState<TodoType | ''>('');
  const deferredSearch = useDeferredValue(search);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [todoToDelete, setTodoToDelete] = useState<Todo | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [detailsFieldErrors, setDetailsFieldErrors] =
    useState<Record<string, string>>({});
  const [sprintDialogMode, setSprintDialogMode] = useState<
    'create' | 'edit' | 'start' | null
  >(null);
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
  const [sprintToDelete, setSprintToDelete] = useState<Sprint | null>(null);
  const [activeDragTodo, setActiveDragTodo] = useState<Todo | null>(null);

  const allTodosQuery = useTodos(validProjectId, { sprintId: 'backlog' });
  const filteredTodosQuery = useTodos(validProjectId, {
    sprintId: 'backlog',
    search: deferredSearch || undefined,
    priority: priority || undefined,
    type: type || undefined,
  });
  const sprintsQuery = useSprints(validProjectId);
  const allSprints = sprintsQuery.data?.sprints ?? [];
  const plannedSprints = allSprints.filter(
    (sprint) => sprint.status === 'planned'
  );
  const sprintTodosQueries = useQueriesForSprints(validProjectId, plannedSprints);
  const sprintTodosById = useMemo(
    () =>
      new Map(
        plannedSprints.map((sprint, index) => [
          sprint.id,
          sprintTodosQueries[index]?.data?.todos ?? [],
        ])
      ),
    [plannedSprints, sprintTodosQueries]
  );

  const createTodoMutation = useCreateTodo();
  const updateTodoMutation = useUpdateTodo();
  const deleteTodoMutation = useDeleteTodo();
  const moveTodoMutation = useMoveTodo();
  const sprintMutations = useSprintMutations();

  const allTodos = allTodosQuery.data?.todos ?? [];
  const visibleTodos = filteredTodosQuery.data?.todos ?? [];
  const totalPoints = allTodos.reduce(
    (total, todo) => total + (todo.storyPoints ?? 0),
    0
  );
  const filtersActive = Boolean(search.trim() || priority || type);
  const sprintQueryError = sprintTodosQueries.find((query) => query.error)?.error;
  const activeSprintExists = allSprints.some(
    (sprint) => sprint.status === 'active'
  );
  const sprintOptions = allSprints.filter(
    (sprint) => sprint.status === 'planned' || sprint.status === 'active'
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  if (!projectId) {
    return <ErrorState message="Project ID is missing from the URL." />;
  }

  const isLoading =
    allTodosQuery.isLoading ||
    filteredTodosQuery.isLoading ||
    sprintsQuery.isLoading ||
    sprintTodosQueries.some((query) => query.isLoading);
  if (isLoading) {
    return <LoadingSpinner message="Loading backlog..." />;
  }

  const loadError =
    allTodosQuery.error ??
    filteredTodosQuery.error ??
    sprintsQuery.error ??
    sprintQueryError;
  if (loadError) {
    return (
      <ErrorState
        title="Failed to load backlog"
        message={
          loadError instanceof Error ? loadError.message : 'Something went wrong.'
        }
        onRetry={() => {
          void allTodosQuery.refetch();
          void filteredTodosQuery.refetch();
          void sprintsQuery.refetch();
          void Promise.all(sprintTodosQueries.map((query) => query.refetch()));
        }}
      />
    );
  }

  async function handleCreateTodo(title: string) {
    setPageError(null);
    try {
      await createTodoMutation.mutateAsync({
        projectId: validProjectId,
        data: { title },
      });
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Failed to create todo.');
      throw error;
    }
  }

  function handleOpenTodo(todo: Todo) {
    setSelectedTodo(todo);
    setDetailsError(null);
    setDetailsFieldErrors({});
  }

  function handleCloseDetails() {
    setSelectedTodo(null);
    setDetailsError(null);
    setDetailsFieldErrors({});
  }

  async function handleUpdateTodo(data: UpdateTodoRequest) {
    setDetailsError(null);
    setDetailsFieldErrors({});
    if (!selectedTodo) return;

    try {
      await updateTodoMutation.mutateAsync({
        todoId: selectedTodo.id,
        projectId: validProjectId,
        data,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        setDetailsFieldErrors(getFieldErrors(error));
        setDetailsError(error.details?.length ? null : error.message);
      } else {
        setDetailsError(
          error instanceof Error ? error.message : 'Failed to update todo.'
        );
      }
      throw error;
    }
  }

  async function handleDeleteTodo() {
    if (!selectedTodo) return;
    setDetailsError(null);
    try {
      await deleteTodoMutation.mutateAsync({
        todoId: selectedTodo.id,
        projectId: validProjectId,
      });
      setSelectedTodo(null);
    } catch (error) {
      setDetailsError(
        error instanceof Error ? error.message : 'Failed to delete todo.'
      );
      throw error;
    }
  }

  async function handleConfirmDeleteTodo() {
    if (!todoToDelete) return;
    setPageError(null);
    try {
      await deleteTodoMutation.mutateAsync({
        todoId: todoToDelete.id,
        projectId: validProjectId,
      });
      setTodoToDelete(null);
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Failed to delete todo.');
    }
  }

  async function handleMoveTodo(todo: Todo, targetSprintId: string | null) {
    const targetTodos = targetSprintId
      ? (sprintTodosById.get(targetSprintId) ?? []).filter(
          (item) => item.status === todo.status
        )
      : allTodos;
    const targetSprint = allSprints.find((sprint) => sprint.id === targetSprintId);
    const position =
      targetSprint?.status === 'active'
        ? targetSprint.stats.byStatus[todo.status]
        : targetTodos.length;

    setPageError(null);
    try {
      await moveTodoMutation.mutateAsync({
        projectId: validProjectId,
        todoId: todo.id,
        data: {
          sprintId: targetSprintId,
          status: todo.status,
          position,
        },
      });
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Failed to move todo.');
    }
  }

  async function handleReorderTodo(todo: Todo, position: number) {
    const todoList =
      todo.sprintId === null
        ? allTodos
        : (sprintTodosById.get(todo.sprintId) ?? []).filter(
            (item) => item.status === todo.status
          );
    const listLength = todoList.filter((item) => item.id !== todo.id).length + 1;
    const targetPosition =
      position === Number.MAX_SAFE_INTEGER
        ? listLength - 1
        : Math.min(position, listLength - 1);

    setPageError(null);
    try {
      await moveTodoMutation.mutateAsync({
        projectId: validProjectId,
        todoId: todo.id,
        data: {
          sprintId: todo.sprintId,
          status: todo.status,
          position: targetPosition,
        },
      });
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Failed to reorder todo.');
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveDragTodo(null);
    const { active, over } = event;
    if (!over || filtersActive) return;

    const todo = active.data.current?.todo as Todo | undefined;
    const sourceListId = active.data.current?.listId;
    const targetListId =
      over.data.current?.listId ??
      (typeof over.id === 'string' ? over.id : undefined);
    if (!todo || typeof sourceListId !== 'string' || typeof targetListId !== 'string') {
      return;
    }
    if (active.id === over.id) return;
    const target = parseListId(targetListId);
    if (!target) return;

    const targetTodos =
      target.sprintId === null
        ? allTodos
        : (sprintTodosById.get(target.sprintId) ?? []).filter(
            (item) => item.status === todo.status
          );
    const targetTodoId = String(over.id);
    const withoutDragged = targetTodos.filter((item) => item.id !== todo.id);
    const overIndex = withoutDragged.findIndex((item) => item.id === targetTodoId);
    const position =
      over.id === targetListId || overIndex < 0
        ? withoutDragged.length
        : overIndex;
    if (sourceListId === targetListId && todo.order === position) return;

    setPageError(null);
    try {
      await moveTodoMutation.mutateAsync({
        projectId: validProjectId,
        todoId: todo.id,
        data: {
          sprintId: target.sprintId,
          ...(target.status ? { status: target.status } : {}),
          position,
        },
      });
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Failed to move todo.');
    }
  }

  async function handleCreateSprint(data: CreateSprintRequest) {
    const sprintNumbers = allSprints
      .map((sprint) => sprint.name.match(/^Sprint\s+(\d+)$/i)?.[1])
      .filter((number): number is string => Boolean(number))
      .map(Number);
    const nextNumber = Math.max(allSprints.length, ...sprintNumbers, 0) + 1;
    await sprintMutations.create.mutateAsync({
      projectId: validProjectId,
      data: {
        ...data,
        name: data.name?.trim() || `Sprint ${nextNumber}`,
      },
    });
  }

  async function handleEditSprint(data: UpdateSprintRequest) {
    if (!selectedSprint) return;
    await sprintMutations.update.mutateAsync({
      projectId: validProjectId,
      sprintId: selectedSprint.id,
      data,
    });
  }

  async function handleStartSprint(data: StartSprintRequest) {
    if (!selectedSprint) return;
    await sprintMutations.start.mutateAsync({
      projectId: validProjectId,
      sprintId: selectedSprint.id,
      data,
    });
    navigate(`/projects/${validProjectId}/board`);
  }

  async function handleDeleteSprint() {
    if (!sprintToDelete) return;
    try {
      await sprintMutations.remove.mutateAsync({
        projectId: validProjectId,
        sprintId: sprintToDelete.id,
      });
      setSprintToDelete(null);
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Failed to delete sprint.');
      setSprintToDelete(null);
    }
  }

  const openSprintDialog = (mode: 'create' | 'edit' | 'start', sprint?: Sprint) => {
    setSelectedSprint(sprint ?? null);
    setSprintDialogMode(mode);
  };
  const closeSprintDialog = () => {
    setSprintDialogMode(null);
    setSelectedSprint(null);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <BacklogHeader
        totalTasks={allTodos.length}
        totalPoints={totalPoints}
        onAskAI={assistantActions.openAssistant}
      />

      {pageError && (
        <Alert severity="error" onClose={() => setPageError(null)} sx={{ mb: 2 }}>
          {pageError}
        </Alert>
      )}

      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        spacing={1.5}
        sx={{ alignItems: { lg: 'center' }, mb: 3, minWidth: 0 }}
      >
        <TodoFilters
          search={search}
          priority={priority}
          type={type}
          onSearchChange={setSearch}
          onPriorityChange={setPriority}
          onTypeChange={setType}
        />
        <Stack
          direction="row"
          spacing={1}
          sx={{
            width: { xs: '100%', lg: 'auto' },
            flexWrap: 'wrap',
            gap: 1,
            flexShrink: 0,
          }}
        >
          <Button
            sx={{ flex: { xs: '1 1 100%', sm: '0 1 auto' } }}
            variant="outlined"
            startIcon={<AutoAwesomeOutlined />}
            onClick={assistantActions.openGenerateTodos}
          >
            Generate todos with AI
          </Button>
          <Button
            sx={{ flex: { xs: '1 1 100%', sm: '0 1 auto' } }}
            variant="outlined"
            startIcon={<BoltOutlined />}
            onClick={assistantActions.openPlanSprint}
          >
            Plan sprint with AI
          </Button>
          <Button
            sx={{ flex: { xs: '1 1 100%', sm: '0 1 auto' } }}
            variant="contained"
            startIcon={<AddOutlined />}
            onClick={() => openSprintDialog('create')}
          >
            Create sprint
          </Button>
        </Stack>
      </Stack>

      {filtersActive && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Clear search and filters to reorder or drag todos between lists.
        </Alert>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={(event) => {
          const todo = event.active.data.current?.todo;
          setActiveDragTodo(todo && typeof todo === 'object' ? todo as Todo : null);
        }}
        onDragCancel={() => setActiveDragTodo(null)}
        onDragEnd={(event) => void handleDragEnd(event)}
      >
        {plannedSprints.map((sprint) => (
          <SprintSection
            key={sprint.id}
            sprint={sprint}
            todos={sprintTodosById.get(sprint.id) ?? []}
            activeSprintExists={activeSprintExists}
            isDraggable={!filtersActive}
            sprints={sprintOptions}
            onTodoClick={handleOpenTodo}
            onMove={handleMoveTodo}
            onReorder={handleReorderTodo}
            onDelete={setTodoToDelete}
            onEdit={(item) => openSprintDialog('edit', item)}
            onStart={(item) => openSprintDialog('start', item)}
          />
        ))}

        <Paper
          variant="outlined"
          sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}
        >
          <Stack
            direction="row"
            sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Backlog
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {visibleTodos.length} items
            </Typography>
          </Stack>

          {visibleTodos.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                {allTodos.length === 0 ? 'Your backlog is empty' : 'No matching todos'}
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                {allTodos.length === 0
                  ? 'Create your first todo to start organizing your project.'
                  : 'Try changing your search or filters.'}
              </Typography>
              {allTodos.length === 0 && (
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    startIcon={<AddOutlined />}
                    onClick={() => {
                      document
                        .querySelector<HTMLInputElement>(
                          'input[placeholder="Type a title and press Enter"]'
                        )
                        ?.focus();
                    }}
                  >
                    Create todo
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<AutoAwesomeOutlined />}
                    onClick={assistantActions.openGenerateTodos}
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
              listId="backlog"
              isDraggable={!filtersActive}
              sprints={sprintOptions}
              onMove={handleMoveTodo}
              onReorder={handleReorderTodo}
              onDelete={setTodoToDelete}
            />
          )}

          <QuickCreateTodo
            onCreate={handleCreateTodo}
            isCreating={createTodoMutation.isPending}
          />
        </Paper>
        <DragOverlay>
          {activeDragTodo ? (
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'background.paper' }}>
              <Typography sx={{ fontWeight: 600 }}>{activeDragTodo.title}</Typography>
            </Paper>
          ) : null}
        </DragOverlay>
      </DndContext>

      <TodoDetailsDialog
        open={Boolean(selectedTodo)}
        todo={selectedTodo}
        sprints={sprintOptions.map(({ id, name }) => ({ id, name }))}
        onClose={handleCloseDetails}
        onSave={handleUpdateTodo}
        onDelete={handleDeleteTodo}
        isSaving={updateTodoMutation.isPending}
        isDeleting={deleteTodoMutation.isPending}
        fieldErrors={detailsFieldErrors}
        serverError={detailsError}
      />

      <ConfirmDialog
        open={Boolean(todoToDelete)}
        title="Delete todo?"
        description={`Delete "${todoToDelete?.title ?? ''}"? This action cannot be undone.`}
        confirmText="Delete todo"
        loading={deleteTodoMutation.isPending}
        onClose={() => setTodoToDelete(null)}
        onConfirm={() => void handleConfirmDeleteTodo()}
      />

      {sprintDialogMode === 'create' && (
        <SprintDialog
          mode="create"
          open
          isSaving={sprintMutations.create.isPending}
          onClose={closeSprintDialog}
          onSubmit={handleCreateSprint}
        />
      )}
      {sprintDialogMode === 'edit' && selectedSprint && (
        <SprintDialog
          mode="edit"
          open
          sprint={selectedSprint}
          isSaving={sprintMutations.update.isPending}
          onClose={closeSprintDialog}
          onDelete={() => {
            setSprintToDelete(selectedSprint);
            closeSprintDialog();
          }}
          onSubmit={handleEditSprint}
        />
      )}
      {sprintDialogMode === 'start' && selectedSprint && (
        <SprintDialog
          mode="start"
          open
          sprint={selectedSprint}
          isSaving={sprintMutations.start.isPending}
          onClose={closeSprintDialog}
          onSubmit={handleStartSprint}
        />
      )}

      <Dialog
        open={Boolean(sprintToDelete)}
        onClose={() => setSprintToDelete(null)}
      >
        <DialogTitle>Delete sprint?</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            Delete {sprintToDelete?.name}? Its todos will be moved back to the backlog.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSprintToDelete(null)} disabled={sprintMutations.remove.isPending}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => void handleDeleteSprint()}
            disabled={sprintMutations.remove.isPending}
          >
            {sprintMutations.remove.isPending ? 'Deleting...' : 'Delete sprint'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

function useQueriesForSprints(projectId: string, sprints: Sprint[]) {
  return useQueries({
    queries: sprints.map((sprint) => ({
      queryKey: todoKeys.list(projectId, { sprintId: sprint.id }),
      queryFn: () => listTodos(projectId, { sprintId: sprint.id }),
      enabled: Boolean(projectId),
    })),
  });
}
