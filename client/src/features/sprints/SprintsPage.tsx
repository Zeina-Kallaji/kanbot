import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { AutoAwesomeOutlined, ReplayOutlined } from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import ErrorState from '../../components/ErrorState';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useSprintBoard } from '../../hooks/sprints/useSprintBoard';
import { useSummarizeSprint } from '../../hooks/sprints/useSummarizeSprint';
import { useSprints } from '../../hooks/sprints/useSprints';
import type { Sprint, TodoStatus } from '../../types/api';

const statusLabelMap: Record<Sprint['status'], string> = {
  active: 'Active',
  planned: 'Planned',
  completed: 'Completed',
};

const statusColorMap: Record<Sprint['status'], 'primary' | 'warning' | 'success'> = {
  active: 'primary',
  planned: 'warning',
  completed: 'success',
};

const todoStatusLabelMap: Record<TodoStatus, string> = {
  todo: 'To do',
  in_progress: 'In progress',
  in_review: 'In review',
  done: 'Done',
};

function formatSprintDates(startDate: string | null, endDate: string | null) {
  if (!startDate && !endDate) return 'No dates set';
  if (startDate && endDate) {
    return `${format(parseISO(startDate), 'MMM d')} – ${format(parseISO(endDate), 'MMM d')}`;
  }
  if (startDate) return `Starts ${format(parseISO(startDate), 'MMM d')}`;
  return `Ends ${format(parseISO(endDate!), 'MMM d')}`;
}

function buildStats(sprint: Sprint) {
  const totalTodos = sprint.stats.totalTodos;
  const doneTodos = sprint.stats.doneTodos;
  const totalPoints = sprint.stats.totalPoints;
  const donePoints = sprint.stats.donePoints;
  const carriedOver = sprint.completedStats?.carriedOver ?? 0;
  const completion = totalTodos > 0 ? Math.round((doneTodos / totalTodos) * 100) : 0;

  return {
    totalTodos,
    doneTodos,
    totalPoints,
    donePoints,
    carriedOver,
    completion,
  };
}

export default function SprintsPage() {
  const navigate = useNavigate();
  const { projectId = '', sprintId } = useParams<{ projectId: string; sprintId?: string }>();

  const sprintsQuery = useSprints(projectId);
  const sprints = sprintsQuery.data?.sprints ?? [];

  const selectedSprint = sprintId
    ? sprints.find((sprint) => sprint.id === sprintId) ?? sprints[0] ?? null
    : sprints[0] ?? null;

  const boardQuery = useSprintBoard(selectedSprint?.id ?? '');
  const summarizeMutation = useSummarizeSprint();
  const [pendingSprintIds, setPendingSprintIds] = useState<Set<string>>(
    () => new Set()
  );
  const [summaryError, setSummaryError] = useState<{
    sprintId: string;
    message: string;
  } | null>(null);

  const handleSelectSprint = (nextSprint: Sprint) => {
    navigate(`/projects/${projectId}/sprints/${nextSprint.id}`);
  };

  if (!projectId) {
    return <ErrorState message="Project ID is missing from the URL." />;
  }

  if (sprintsQuery.isLoading) {
    return <LoadingSpinner message="Loading sprints..." />;
  }

  if (sprintsQuery.error) {
    return (
      <ErrorState
        title="Failed to load sprints"
        message={sprintsQuery.error.message}
        onRetry={() => void sprintsQuery.refetch()}
      />
    );
  }

  if (!sprints.length) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 4 }, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            No sprints yet
          </Typography>
          <Typography color="text.secondary">
            Create a sprint from the backlog to start tracking delivery history.
          </Typography>
        </Paper>
      </Container>
    );
  }

  const selectedSprintId = selectedSprint?.id ?? sprints[0].id;
  const currentSprint =
    boardQuery.data?.sprint.id === selectedSprintId
      ? boardQuery.data.sprint
      : selectedSprint ?? sprints[0];
  const stats = buildStats(currentSprint);
  const currentSummary =
    currentSprint.summary?.source === 'ai' ? currentSprint.summary : null;
  const hasAiSummary = Boolean(currentSummary?.content);
  const isGeneratingSummary = pendingSprintIds.has(currentSprint.id);
  const currentSummaryError =
    summaryError?.sprintId === currentSprint.id ? summaryError.message : null;
  const boardColumns = boardQuery.data?.columns ?? { todo: [], in_progress: [], in_review: [], done: [] };
  const flatTodoList = (Object.keys(todoStatusLabelMap) as TodoStatus[]).flatMap((status) =>
    boardColumns[status].map((todo) => ({ ...todo, status }))
  );

  const handleGenerateSummary = async () => {
    if (pendingSprintIds.has(currentSprint.id)) return;
    setPendingSprintIds((current) => new Set(current).add(currentSprint.id));
    setSummaryError(null);
    try {
      await summarizeMutation.mutateAsync({
        projectId,
        sprintId: currentSprint.id,
      });
    } catch (error) {
      setSummaryError({
        sprintId: currentSprint.id,
        message:
          error instanceof Error
            ? error.message
            : 'Unable to generate the sprint summary. Try again.',
      });
    } finally {
      setPendingSprintIds((current) => {
        const next = new Set(current);
        next.delete(currentSprint.id);
        return next;
      });
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '360px minmax(0, 1fr)' }, gap: 3 }}>
        <Paper variant="outlined" sx={{ p: 2, height: 'fit-content' }}>
          <Typography variant="h2" sx={{ fontWeight: 700, mb: 2 }}>
            All sprints
          </Typography>

          <Stack spacing={1.5}>
            {sprints.map((sprint) => {
              const sprintStats = buildStats(sprint);
              const isSelected = sprint.id === selectedSprintId;

              return (
                <Paper
                  key={sprint.id}
                  variant={isSelected ? 'elevation' : 'outlined'}
                  onClick={() => handleSelectSprint(sprint)}
                  sx={{
                    p: 1.75,
                    borderColor: isSelected ? 'primary.main' : 'divider',
                    backgroundColor: isSelected ? 'action.hover' : 'background.paper',
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mb: 0.5 }}>
                    <Typography variant="h6" sx={{ fontSize: '1.05rem', fontWeight: 700 }}>
                      {sprint.name}
                    </Typography>
                    <Chip
                      label={statusLabelMap[sprint.status]}
                      size="small"
                      color={statusColorMap[sprint.status]}
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {formatSprintDates(sprint.startDate, sprint.endDate)}
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    {sprintStats.donePoints}/{sprintStats.totalPoints} pts
                  </Typography>
                </Paper>
              );
            })}
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="h2" sx={{ fontWeight: 700, mb: 0.5 }}>
                {currentSprint.name}
              </Typography>
              <Typography color="text.secondary">
                {formatSprintDates(currentSprint.startDate, currentSprint.endDate)}
              </Typography>
            </Box>
            <Chip label={statusLabelMap[currentSprint.status]} color={statusColorMap[currentSprint.status]} />
          </Box>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[
              { label: 'Completed todos', value: `${stats.doneTodos}` },
              { label: 'Points done', value: `${stats.donePoints}/${stats.totalPoints}` },
              { label: 'Carried over', value: String(stats.carriedOver) },
              { label: 'Completion %', value: `${stats.completion}%` },
            ].map((item) => (
              <Grid key={item.label} size={{ xs: 12, sm: 6, lg: 3 }}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {item.label}
                  </Typography>
                  <Typography variant="h2" sx={{ fontWeight: 700 }}>
                    {item.value}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              Sprint details
            </Typography>

            {currentSprint.goal && (
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {currentSprint.goal}
              </Typography>
            )}

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Todo list
                  </Typography>
                  <Stack spacing={1}>
                    {flatTodoList.length > 0 ? (
                      flatTodoList.map((todo) => (
                        <Box
                          key={todo.id}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 2,
                            p: 1,
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'divider',
                          }}
                        >
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {todo.key}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {todo.title}
                            </Typography>
                          </Box>
                          <Chip
                            label={todoStatusLabelMap[todo.status]}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      ))
                    ) : (
                      <Typography color="text.secondary">No todos in this sprint.</Typography>
                    )}
                  </Stack>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 1.5,
                      mb: 1.5,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      AI summary
                    </Typography>
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      startIcon={
                        isGeneratingSummary ? (
                          <CircularProgress size={16} color="inherit" />
                        ) : hasAiSummary ? (
                          <ReplayOutlined />
                        ) : (
                          <AutoAwesomeOutlined />
                        )
                      }
                      disabled={isGeneratingSummary}
                      onClick={() => void handleGenerateSummary()}
                    >
                      {isGeneratingSummary
                        ? hasAiSummary
                          ? 'Regenerating...'
                          : 'Generating...'
                        : hasAiSummary
                          ? 'Regenerate'
                          : 'Generate Summary'}
                    </Button>
                  </Box>

                  {currentSummaryError && (
                    <Alert severity="error" sx={{ mb: 1.5 }}>
                      {currentSummaryError}
                    </Alert>
                  )}

                  {currentSummary?.content ? (
                    <Box sx={{ '& > * + *': { mt: 2 } }}>
                      <ReactMarkdown>{currentSummary.content}</ReactMarkdown>
                      <Typography variant="caption" color="text.secondary">
                        Generated {format(parseISO(currentSummary.generatedAt), 'PPp')}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography color="text.secondary">
                      No AI summary generated for this sprint yet.
                    </Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Box>

          {boardQuery.isLoading && (
            <Box sx={{ py: 2 }}>
              <LoadingSpinner message="Loading sprint details..." />
            </Box>
          )}

          {boardQuery.error && (
            <ErrorState
              title="Failed to load sprint details"
              message={boardQuery.error.message}
              onRetry={() => void boardQuery.refetch()}
            />
          )}
        </Paper>
      </Box>
    </Container>
  );
}
