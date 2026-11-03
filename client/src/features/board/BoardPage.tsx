import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { ArrowBackOutlined, CheckCircleOutlined } from '@mui/icons-material';
import type {
  CompleteSprintRequest,
  Todo,
  TodoStatus,
  UpdateTodoRequest,
} from '../../types/api';
import { ApiError, fieldErrors as getFieldErrors } from '../../api/client';
import { useSprints } from '../../hooks/sprints/useSprints';
import { useSprintBoard } from '../../hooks/sprints/useSprintBoard';
import { useSprintMutations } from '../../hooks/sprints/useSprintMutations';
import { useUpdateTodo } from '../../hooks/todos/useUpdateTodo';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorState from '../../components/ErrorState';
import TodoDetailsDialog from '../backlog/components/TodoDetailsDialog';
import CompleteSprintDialog from './CompleteSprintDialog';

const columns: { status: TodoStatus; label: string }[] = [
  { status: 'todo', label: 'To do' },
  { status: 'in_progress', label: 'In progress' },
  { status: 'in_review', label: 'In review' },
  { status: 'done', label: 'Done' },
];

export default function BoardPage() {
  const { projectId = '' } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const sprintsQuery = useSprints(projectId);
  const sprints = sprintsQuery.data?.sprints ?? [];
  const activeSprint = sprints.find((sprint) => sprint.status === 'active') ?? null;
  const boardQuery = useSprintBoard(activeSprint?.id ?? '');
  const mutations = useSprintMutations();
  const updateTodoMutation = useUpdateTodo();
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [detailsFieldErrors, setDetailsFieldErrors] =
    useState<Record<string, string>>({});

  if (!projectId) {
    return <ErrorState message="Project ID is missing from the URL." />;
  }
  if (sprintsQuery.isLoading) {
    return <LoadingSpinner message="Loading sprint..." />;
  }
  if (sprintsQuery.error) {
    return (
      <ErrorState
        title="Failed to load sprint"
        message={sprintsQuery.error.message}
        onRetry={() => void sprintsQuery.refetch()}
      />
    );
  }
  if (!activeSprint) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 4 }, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>
            No active sprint
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Plan and start a sprint from the backlog to use the board.
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBackOutlined />}
            onClick={() => navigate(`/projects/${projectId}/backlog`)}
          >
            Go to backlog
          </Button>
        </Paper>
      </Container>
    );
  }
  if (boardQuery.isLoading) {
    return <LoadingSpinner message="Loading sprint board..." />;
  }
  if (boardQuery.error) {
    return (
      <ErrorState
        title="Failed to load sprint board"
        message={boardQuery.error.message}
        onRetry={() => void boardQuery.refetch()}
      />
    );
  }
  if (!boardQuery.data) {
    return <ErrorState message="Sprint board data is unavailable." />;
  }

  const sprint = boardQuery.data.sprint;
  const board = boardQuery.data.columns;
  const isActiveSprint = sprint.status === 'active';
  const progress =
    sprint.stats.totalPoints > 0
      ? (sprint.stats.donePoints / sprint.stats.totalPoints) * 100
      : 0;
  const plannedSprints = sprints.filter((item) => item.status === 'planned');

  async function handleUpdateTodo(data: UpdateTodoRequest) {
    if (!selectedTodo) return;
    setDetailsError(null);
    setDetailsFieldErrors({});
    try {
      await updateTodoMutation.mutateAsync({
        projectId,
        todoId: selectedTodo.id,
        data,
      });
      await boardQuery.refetch();
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

  async function handleCompleteSprint(data: CompleteSprintRequest) {
    await mutations.complete.mutateAsync({
      projectId,
      sprintId: sprint.id,
      data,
    });
    setCompleteDialogOpen(false);
    navigate(`/projects/${projectId}/backlog`);
  }

  const todoSprints = sprints.filter(
    (item) => item.status === 'planned' || item.status === 'active'
  );

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 }, minWidth: 0 }}>
      <Stack spacing={2.5}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, overflowWrap: 'anywhere' }}>
              {sprint.name}
            </Typography>
            {sprint.goal && (
              <Typography color="text.secondary">{sprint.goal}</Typography>
            )}
            <Typography variant="body2" color="text.secondary">
              {sprint.startDate ?? 'No start date'} – {sprint.endDate ?? 'No end date'}
            </Typography>
          </Box>
          {isActiveSprint && (
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircleOutlined />}
              onClick={() => setCompleteDialogOpen(true)}
              sx={{ alignSelf: { xs: 'stretch', sm: 'auto' }, whiteSpace: 'nowrap' }}
            >
              Complete sprint
            </Button>
          )}
        </Stack>

        <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            sx={{ justifyContent: 'space-between', mb: 1 }}
          >
            <Typography variant="body2">
              {sprint.stats.donePoints} / {sprint.stats.totalPoints} points
            </Typography>
            <Typography variant="body2">
              {sprint.stats.doneTodos} / {sprint.stats.totalTodos} todos
            </Typography>
          </Stack>
          <LinearProgress variant="determinate" value={progress} />
        </Paper>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'minmax(0, 1fr)',
              sm: 'repeat(2, minmax(0, 1fr))',
              lg: 'repeat(4, minmax(0, 1fr))',
            },
            gap: 1.5,
            alignItems: 'start',
          }}
        >
          {columns.map(({ status, label }) => (
            <Paper
              key={status}
              variant="outlined"
              sx={{ p: { xs: 1.5, sm: 2 }, minWidth: 0, overflow: 'hidden' }}
            >
              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {label}
                </Typography>
                <Chip size="small" label={board[status].length} />
              </Stack>
              <Stack spacing={1}>
                {board[status].map((todo) => (
                  <Card
                    key={todo.id}
                    variant="outlined"
                    onClick={() => setSelectedTodo(todo)}
                    sx={{ minWidth: 0, cursor: 'pointer' }}
                  >
                    <CardContent sx={{ p: '12px !important' }}>
                      <Typography variant="caption" color="text.secondary">
                        {todo.key}
                      </Typography>
                      <Typography sx={{ my: 0.5, fontWeight: 600, overflowWrap: 'anywhere' }}>
                        {todo.title}
                      </Typography>
                      <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                        <Chip size="small" label={todo.type} variant="outlined" />
                        <Chip size="small" label={todo.priority} />
                        <Chip size="small" label={`${todo.storyPoints ?? 0} pts`} variant="outlined" />
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
                {board[status].length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                    No todos
                  </Typography>
                )}
              </Stack>
            </Paper>
          ))}
        </Box>
      </Stack>

      <TodoDetailsDialog
        open={Boolean(selectedTodo)}
        todo={selectedTodo}
        sprints={todoSprints.map(({ id, name }) => ({ id, name }))}
        onClose={() => {
          setSelectedTodo(null);
          setDetailsError(null);
          setDetailsFieldErrors({});
        }}
        onSave={handleUpdateTodo}
        isSaving={updateTodoMutation.isPending}
        fieldErrors={detailsFieldErrors}
        serverError={detailsError}
      />
      <CompleteSprintDialog
        open={isActiveSprint && completeDialogOpen}
        sprint={sprint}
        plannedSprints={plannedSprints}
        isSaving={mutations.complete.isPending}
        onClose={() => setCompleteDialogOpen(false)}
        onSubmit={handleCompleteSprint}
      />
    </Container>
  );
}
