import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import {
  ArrowBackOutlined,
  AutoAwesomeOutlined,
  CheckCircleOutlined,
  ReplayOutlined,
} from '@mui/icons-material';
import { differenceInCalendarDays, format, parseISO } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import type {
  CompleteSprintRequest,
  SprintSummary,
  Todo,
  TodoStatus,
  UpdateTodoRequest,
} from '../../types/api';
import { ApiError, fieldErrors as getFieldErrors } from '../../api/client';
import { useSprints } from '../../hooks/sprints/useSprints';
import { useSummarizeSprint } from '../../hooks/sprints/useSummarizeSprint';
import { useSprintBoard } from '../../hooks/sprints/useSprintBoard';
import { useSprintMutations } from '../../hooks/sprints/useSprintMutations';
import { useMoveTodo } from '../../hooks/todos/useMoveTodo';
import { useUpdateTodo } from '../../hooks/todos/useUpdateTodo';
import { toast } from '../../lib/toast';
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

function formatSprintDates(startDate: string | null, endDate: string | null) {
  const dateRange = startDate && endDate
    ? `${format(parseISO(startDate), 'MMM d')} – ${format(parseISO(endDate), 'MMM d')}`
    : startDate
      ? `Starts ${format(parseISO(startDate), 'MMM d')}`
      : endDate
        ? `Ends ${format(parseISO(endDate), 'MMM d')}`
        : 'No dates set';

  if (!endDate) return dateRange;
  const daysLeft = differenceInCalendarDays(parseISO(endDate), new Date());
  if (daysLeft > 0) return `${dateRange} · ${daysLeft} days left`;
  if (daysLeft === 0) return `${dateRange} · Ends today`;
  return `${dateRange} · ${Math.abs(daysLeft)} days overdue`;
}

interface BoardColumnProps {
  status: TodoStatus;
  label: string;
  count: number;
  children: React.ReactNode;
}

function BoardColumn({ status, label, count, children }: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { status },
  });

  return (
    <Paper
      ref={setNodeRef}
      variant="outlined"
      sx={{
        p: { xs: 1.5, sm: 2 },
        minWidth: 0,
        overflow: 'hidden',
        outline: isOver ? '2px solid' : 'none',
        outlineColor: 'primary.main',
        bgcolor: isOver ? 'primary.50' : 'background.paper',
        transition: 'background-color 120ms ease, outline-color 120ms ease',
      }}
    >
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {label}
        </Typography>
        <Chip size="small" label={count} />
      </Stack>
      {children}
    </Paper>
  );
}

interface BoardTodoCardProps {
  todo: Todo;
  onClick: () => void;
}

function BoardTodoCard({ todo, onClick }: BoardTodoCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: todo.id,
    data: { todo },
  });

  return (
    <Card
      ref={setNodeRef}
      variant="outlined"
      onClick={onClick}
      {...attributes}
      {...listeners}
      sx={{
        minWidth: 0,
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'none',
        opacity: isDragging ? 0.45 : 1,
        transform: CSS.Translate.toString(transform),
      }}
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
  );
}

export default function BoardPage() {
  const { projectId = '' } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const sprintsQuery = useSprints(projectId);
  const summarizeMutation = useSummarizeSprint();
  const sprints = sprintsQuery.data?.sprints ?? [];
  const activeSprint = sprints.find((sprint) => sprint.status === 'active') ?? null;
  const boardQuery = useSprintBoard(activeSprint?.id ?? '');
  const mutations = useSprintMutations();
  const moveTodoMutation = useMoveTodo();
  const updateTodoMutation = useUpdateTodo();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [boardError, setBoardError] = useState<string | null>(null);
  const [summaryPending, setSummaryPending] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [summaryResult, setSummaryResult] = useState<{
    sprintId: string;
    summary: SprintSummary;
  } | null>(null);
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
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
  const currentSummary =
    summaryResult?.sprintId === sprint.id
      ? summaryResult.summary
      : sprint.summary?.source === 'ai'
        ? sprint.summary
        : null;

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
    const response = await mutations.complete.mutateAsync({
      projectId,
      sprintId: sprint.id,
      data,
    });
    setCompleteDialogOpen(false);
    if (response.summaryError) {
      toast.error(response.summaryError);
    }
    navigate(
      data.generateAiSummary
        ? `/projects/${projectId}/sprints/${sprint.id}`
        : `/projects/${projectId}/backlog`
    );
  }

  async function handleSummarizeSprint(regenerate = false) {
    setSummaryError(null);
    if (currentSummary && !regenerate) {
      setSummaryDialogOpen(true);
      return;
    }

    setSummaryDialogOpen(true);
    setSummaryPending(true);
    try {
      const response = await summarizeMutation.mutateAsync({
        projectId,
        sprintId: sprint.id,
      });
      setSummaryResult({ sprintId: sprint.id, summary: response.summary });
    } catch (error) {
      setSummaryError(
        error instanceof Error ? error.message : 'Unable to summarize this sprint.'
      );
    } finally {
      setSummaryPending(false);
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const todo = active.data.current?.todo as Todo | undefined;
    const targetStatus = over.data.current?.status;
    const targetColumn = columns.find((column) => column.status === targetStatus);
    if (
      !todo ||
      !targetColumn ||
      targetColumn.status === todo.status
    ) {
      return;
    }

    setBoardError(null);
    try {
      await moveTodoMutation.mutateAsync({
        projectId,
        todoId: todo.id,
        data: {
          sprintId: sprint.id,
          status: targetColumn.status,
          position: board[targetColumn.status].filter(
            (item) => item.id !== todo.id
          ).length,
        },
      });
      await boardQuery.refetch();
    } catch (error) {
      setBoardError(error instanceof Error ? error.message : 'Failed to move todo.');
    }
  }

  const todoSprints = sprints.filter(
    (item) => item.status === 'planned' || item.status === 'active'
  );

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 }, minWidth: 0 }}>
      <Stack spacing={2.5}>
        <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ alignItems: { sm: 'flex-start' }, justifyContent: 'space-between' }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={{ xs: 0.25, sm: 1.5 }}
                sx={{ alignItems: { sm: 'baseline' }, minWidth: 0 }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {sprint.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatSprintDates(sprint.startDate, sprint.endDate)}
                </Typography>
              </Stack>
              {sprint.goal && (
                <Typography variant="body2" sx={{ mt: 0.25, color: 'text.primary' }}>
                  Goal: {sprint.goal}
                </Typography>
              )}
            </Box>
            <Stack
              direction="row"
              spacing={1}
              sx={{ flexShrink: 0, alignSelf: { xs: 'stretch', sm: 'auto' } }}
            >
              <Button
                variant="outlined"
                size="small"
                startIcon={<AutoAwesomeOutlined />}
                onClick={() => void handleSummarizeSprint()}
                disabled={summaryPending}
              >
                {summaryPending
                  ? 'Summarizing…'
                  : currentSummary
                    ? 'View summary'
                    : 'Summarize'}
              </Button>
              {isActiveSprint && (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<CheckCircleOutlined />}
                  onClick={() => setCompleteDialogOpen(true)}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  Complete sprint
                </Button>
              )}
            </Stack>
          </Stack>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ alignItems: { sm: 'center' }, mt: 1.5 }}
          >
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ flex: 1, height: 8, borderRadius: 4 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
              {sprint.stats.donePoints} / {sprint.stats.totalPoints} pts done
            </Typography>
          </Stack>
        </Paper>

        {boardError && (
          <Alert severity="error" onClose={() => setBoardError(null)}>
            {boardError}
          </Alert>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(event) => void handleDragEnd(event)}
        >
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
              <BoardColumn
                key={status}
                status={status}
                label={label}
                count={board[status].length}
              >
                <Stack spacing={1} sx={{ minHeight: 40 }}>
                  {board[status].map((todo) => (
                    <BoardTodoCard
                      key={todo.id}
                      todo={todo}
                      onClick={() => setSelectedTodo(todo)}
                    />
                  ))}
                  {board[status].length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                      No todos
                    </Typography>
                  )}
                </Stack>
              </BoardColumn>
            ))}
          </Box>
        </DndContext>
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
      <Dialog
        open={summaryDialogOpen}
        onClose={() => setSummaryDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 700 }}>{sprint.name} summary</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ pt: 1 }}>
            {summaryPending && (
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <CircularProgress size={20} />
                <Typography color="text.secondary">Generating sprint summary…</Typography>
              </Stack>
            )}
            {summaryError && (
              <Alert
                severity="error"
                action={
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => void handleSummarizeSprint(true)}
                  >
                    Try again
                  </Button>
                }
              >
                {summaryError}
              </Alert>
            )}
            {currentSummary && (
              <>
                <Typography variant="caption" color="text.secondary">
                  Generated {new Date(currentSummary.generatedAt).toLocaleString()}
                  {currentSummary.source === 'mock' ? ' · Mock AI' : ''}
                </Typography>
                <Box sx={{ '& p': { my: 1 }, '& ul, & ol': { pl: 3 } }}>
                  <ReactMarkdown>{currentSummary.content}</ReactMarkdown>
                </Box>
              </>
            )}
            <Typography variant="caption" color="text.secondary">
              AI can make mistakes. Review before sharing or acting on this summary.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Button
            startIcon={summaryPending ? <CircularProgress size={16} /> : <ReplayOutlined />}
            onClick={() => void handleSummarizeSprint(true)}
            disabled={summaryPending}
          >
            Regenerate
          </Button>
          <Button onClick={() => setSummaryDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
