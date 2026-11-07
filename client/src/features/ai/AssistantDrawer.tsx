import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  FormControl,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  AddOutlined,
  AutoAwesomeOutlined,
  CloseOutlined,
  ReplayOutlined,
  SendOutlined,
  SmartToy,
} from '@mui/icons-material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import kanbotLogoCircle from '../../../../design/logo/kanbot-logo-circle.svg';
import type {
  ChatMessage,
  DraftTodo,
  StoryPoints,
  Todo,
  TodoPriority,
  TodoType,
} from '../../types/api';
import { getAiStatus, generateTodos, planSprint, sendChat, summarizeSprint } from '../../api/ai';
import { createTodos } from '../../api/todos';
import { useTodos } from '../../hooks/todos/useTodos';
import { useSprints } from '../../hooks/sprints/useSprints';
import { useSprintMutations } from '../../hooks/sprints/useSprintMutations';
import { sprintKeys } from '../../hooks/sprints/sprintKeys';
import { todoKeys } from '../../hooks/todos/todoKeys';
import { projectKeys } from '../../hooks/projects/projectKeys';
import { colors } from '../../theme/theme';

interface AssistantDrawerProps {
  projectId: string;
  open: boolean;
  onClose: () => void;
}

export interface AssistantDrawerHandle {
  openGenerateTodos: () => void;
  openPlanSprint: () => void;
}

interface DraftItem {
  id: number;
  selected: boolean;
  draft: DraftTodo;
}

const todoTypes: TodoType[] = ['task', 'story', 'bug'];
const priorities: TodoPriority[] = ['low', 'medium', 'high', 'urgent'];
const storyPoints: (StoryPoints | '')[] = ['', 1, 2, 3, 5, 8, 13];
const sprintLengthOptions = [1, 2, 3, 4];
const planFieldSx = {
  overflow: 'visible',
  '& .MuiOutlinedInput-root': {
    overflow: 'visible',
    borderRadius: 1,
    '& .MuiOutlinedInput-notchedOutline': {
      overflow: 'visible',
      borderColor: 'divider',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: 'text.secondary',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#2c5282',
      borderWidth: 2,
    },
  },
  '& .MuiInputLabel-root': {
    overflow: 'visible',
    color: 'text.secondary',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#2c5282',
  },
};

const AssistantDrawer = forwardRef<AssistantDrawerHandle, AssistantDrawerProps>(
function AssistantDrawer({
  projectId,
  open,
  onClose,
}, ref) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const queryClient = useQueryClient();
  const sprintMutations = useSprintMutations();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatText, setChatText] = useState('');
  const [chatPending, setChatPending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [lastChatPrompt, setLastChatPrompt] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [summaryPending, setSummaryPending] = useState(false);
  const [summaryRetrySprintId, setSummaryRetrySprintId] = useState<string | null>(null);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [generatePrompt, setGeneratePrompt] = useState('');
  const [generateCount, setGenerateCount] = useState(5);
  const [drafts, setDrafts] = useState<DraftItem[]>([]);
  const [draftsPending, setDraftsPending] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [planOpen, setPlanOpen] = useState(false);
  const [capacity, setCapacity] = useState('21');
  const [sprintLengthWeeks, setSprintLengthWeeks] = useState(2);
  const [focus, setFocus] = useState('');
  const [planPending, setPlanPending] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const [planErrorAction, setPlanErrorAction] = useState<'suggest' | 'create'>('suggest');
  const [plan, setPlan] = useState<Awaited<ReturnType<typeof planSprint>> | null>(null);
  const [selectedTodoIds, setSelectedTodoIds] = useState<string[]>([]);
  const [planGoal, setPlanGoal] = useState('');
  const [createSprintPending, setCreateSprintPending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    openGenerateTodos: () => {
      setGenerateError(null);
      setGenerateOpen(true);
    },
    openPlanSprint: () => {
      setPlanError(null);
      setPlan(null);
      setPlanOpen(true);
    },
  }), []);

  const aiStatusQuery = useQuery({
    queryKey: ['ai', 'status'],
    queryFn: getAiStatus,
    staleTime: Infinity,
    retry: 1,
    enabled: Boolean(projectId) && open,
  });
  const sprintsQuery = useSprints(projectId, open);
  const backlogQuery = useTodos(projectId, { sprintId: 'backlog' }, open);
  const sprints = sprintsQuery.data?.sprints ?? [];
  const backlogTodos = useMemo(
    () => backlogQuery.data?.todos ?? [],
    [backlogQuery.data?.todos]
  );
  const summarizableSprint =
    sprints.find((sprint) => sprint.status === 'active') ??
    sprints.find((sprint) => sprint.status === 'completed') ??
    null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatPending]);

  async function submitChat(prompt: string) {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt || chatPending) return;
    const userMessage: ChatMessage = { role: 'user', content: trimmedPrompt };
    const conversation = [...messages.slice(-29), userMessage];
    setMessages(conversation);
    setChatText('');
    setChatPending(true);
    setChatError(null);
    setLastChatPrompt(trimmedPrompt);
    try {
      const response = await sendChat(projectId, { messages: conversation });
      setMessages((current) => [...current, response.message]);
    } catch (error) {
      setMessages((current) =>
        current.at(-1)?.role === 'user'
          ? current.slice(0, -1)
          : current
      );
      setChatError(error instanceof Error ? error.message : 'Unable to send your message.');
      setChatText(trimmedPrompt);
    } finally {
      setChatPending(false);
    }
  }

  async function runSummary(
    sprintId: string,
    addPrompt = true,
    regenerate = false
  ) {
    const savedSummary = sprints.find((sprint) => sprint.id === sprintId)?.summary;
    const savedAiSummary = savedSummary?.source === 'ai' ? savedSummary : null;
    if (savedAiSummary && !regenerate) {
      if (addPrompt) {
        setMessages((current) => [
          ...current,
          { role: 'user', content: 'Summarize sprint' },
        ]);
      }
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: `${savedAiSummary.content}\n\n_Generated ${new Date(savedAiSummary.generatedAt).toLocaleString()}._`,
        },
      ]);
      return;
    }

    setSummaryPending(true);
    setActionError(null);
    setSummaryRetrySprintId(sprintId);
    if (addPrompt) {
      setMessages((current) => [
        ...current,
        { role: 'user', content: 'Summarize sprint' },
      ]);
    }
    try {
      const response = await summarizeSprint(projectId, sprintId);
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: `${response.summary.content}\n\n_Generated ${new Date(response.summary.generatedAt).toLocaleString()}._`,
        },
      ]);
      setSummaryRetrySprintId(null);
      await queryClient.invalidateQueries({ queryKey: sprintKeys.list(projectId) });
      await queryClient.invalidateQueries({ queryKey: sprintKeys.board(sprintId) });
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to summarize this sprint.');
    } finally {
      setSummaryPending(false);
    }
  }

  async function handleGenerate() {
    if (generatePrompt.trim().length < 3 || draftsPending) return;
    setDraftsPending(true);
    setGenerateError(null);
    try {
      const response = await generateTodos(projectId, {
        prompt: generatePrompt.trim(),
        count: generateCount,
      });
      setDrafts(response.todos.map((draft, id) => ({ id, selected: true, draft })));
    } catch (error) {
      setGenerateError(error instanceof Error ? error.message : 'Unable to generate todos.');
    } finally {
      setDraftsPending(false);
    }
  }

  async function handleAddDrafts() {
    const selectedDrafts = drafts.filter((item) => item.selected);
    if (selectedDrafts.length === 0 || draftsPending) return;
    setDraftsPending(true);
    setGenerateError(null);
    try {
      await createTodos(projectId, {
        todos: selectedDrafts.map(({ draft }) => ({
          title: draft.title,
          description: draft.description,
          type: draft.type,
          priority: draft.priority,
          storyPoints: draft.storyPoints,
        })),
      });
      await queryClient.invalidateQueries({ queryKey: todoKeys.projectLists(projectId) });
      await queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      setGenerateOpen(false);
      setDrafts([]);
      setGeneratePrompt('');
      setMessages((current) => [
        ...current,
        { role: 'assistant', content: `Added ${selectedDrafts.length} todo${selectedDrafts.length === 1 ? '' : 's'} to the backlog.` },
      ]);
    } catch (error) {
      setGenerateError(error instanceof Error ? error.message : 'Unable to add todos to the backlog.');
    } finally {
      setDraftsPending(false);
    }
  }

  async function handlePlan() {
    const parsedCapacity = Number(capacity);
    if (!Number.isInteger(parsedCapacity) || parsedCapacity < 1 || parsedCapacity > 200) {
      setPlanError('Capacity must be a whole number from 1 to 200.');
      return;
    }
    setPlanPending(true);
    setPlanError(null);
    setPlanErrorAction('suggest');
    try {
      const response = await planSprint(projectId, {
        capacity: parsedCapacity,
        sprintLengthWeeks,
        ...(focus.trim() ? { focus: focus.trim() } : {}),
      });
      setPlan(response);
      setPlanGoal(response.goal);
      setSelectedTodoIds(response.todoIds);
    } catch (error) {
      setPlanError(error instanceof Error ? error.message : 'Unable to plan a sprint.');
    } finally {
      setPlanPending(false);
    }
  }

  async function handleCreatePlannedSprint() {
    if (!plan || createSprintPending) return;
    setCreateSprintPending(true);
    setPlanError(null);
    setPlanErrorAction('create');
    try {
      const nextNumber = sprints.length + 1;
      await sprintMutations.create.mutateAsync({
        projectId,
        data: {
          name: `Sprint ${nextNumber}`,
          goal: planGoal.trim(),
          todoIds: selectedTodoIds,
        },
      });
      await queryClient.invalidateQueries({ queryKey: sprintKeys.list(projectId) });
      await queryClient.invalidateQueries({ queryKey: todoKeys.projectLists(projectId) });
      setPlanOpen(false);
      setPlan(null);
      setMessages((current) => [
        ...current,
        { role: 'assistant', content: `Created Sprint ${nextNumber} with ${selectedTodoIds.length} todo${selectedTodoIds.length === 1 ? '' : 's'}.` },
      ]);
    } catch (error) {
      setPlanError(error instanceof Error ? error.message : 'Unable to create the sprint.');
    } finally {
      setCreateSprintPending(false);
    }
  }

  function updateDraft(id: number, patch: Partial<DraftTodo>) {
    setDrafts((current) =>
      current.map((item) =>
        item.id === id ? { ...item, draft: { ...item.draft, ...patch } } : item
      )
    );
  }

  function toggleTodo(todoId: string) {
    setSelectedTodoIds((current) =>
      current.includes(todoId)
        ? current.filter((id) => id !== todoId)
        : [...current, todoId]
    );
  }

  const selectedPlanPoints = useMemo(
    () =>
      backlogTodos
        .filter((todo) => selectedTodoIds.includes(todo.id))
        .reduce((total, todo) => total + (todo.storyPoints ?? 0), 0),
    [backlogTodos, selectedTodoIds]
  );
  const parsedCapacity = Number(capacity);
  const capacityIsValid =
    Number.isInteger(parsedCapacity) && parsedCapacity >= 1 && parsedCapacity <= 200;
  const plannedBacklogTodos = useMemo(() => {
    if (!plan) return [];
    const suggestedOrder = new Map(plan.todoIds.map((todoId, index) => [todoId, index]));
    return [...backlogTodos].sort((a, b) => {
      const aIndex = suggestedOrder.get(a.id);
      const bIndex = suggestedOrder.get(b.id);
      if (aIndex !== undefined && bIndex !== undefined) return aIndex - bIndex;
      if (aIndex !== undefined) return -1;
      if (bIndex !== undefined) return 1;
      return a.order - b.order;
    });
  }, [backlogTodos, plan]);
  const selectedDraftCount = drafts.filter((item) => item.selected).length;

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        slotProps={{
          paper: {
            sx: {
              width: { xs: '100%', sm: 380 },
              maxWidth: '100vw',
              display: 'flex',
              flexDirection: 'column',
            },
          },
        }}
      >
        <Box sx={{ px: 2, pt: 1.5, pb: 1 }}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <SmartToy sx={{ fontSize: 24, color: '#2d4e94', flexShrink: 0 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Kanbot Assistant
              </Typography>
              {aiStatusQuery.data?.mode === 'mock' && (
                <Typography
                  variant="caption"
                  sx={{ px: 0.75, py: 0.25, borderRadius: 1, bgcolor: 'warning.light' }}
                >
                  Mock AI
                </Typography>
              )}
              {aiStatusQuery.isLoading && <CircularProgress size={14} />}
            </Stack>
            <IconButton aria-label="Close assistant" onClick={onClose} size="small">
              <CloseOutlined fontSize="small" />
            </IconButton>
          </Stack>
        </Box>
        <Divider />
        <Stack
          direction="row"
          spacing={0.75}
          sx={{ p: 1.5, overflowX: 'auto', flexShrink: 0 }}
        >
          <Button size="small" variant="outlined" onClick={() => { setGenerateError(null); setGenerateOpen(true); }}>
            Create todos
          </Button>
          <Button size="small" variant="outlined" onClick={() => { setPlanError(null); setPlan(null); setPlanOpen(true); }}>
            Plan sprint
          </Button>
          <Button
            size="small"
            variant="outlined"
            disabled={!summarizableSprint || summaryPending}
            onClick={() =>
              summarizableSprint && void runSummary(summarizableSprint.id)
            }
          >
            {summaryPending
              ? <CircularProgress size={16} />
              : summarizableSprint?.summary
                ? 'View summary'
                : 'Summarize sprint'}
          </Button>
          {summarizableSprint?.summary && (
            <Button
              size="small"
              variant="outlined"
              aria-label="Regenerate sprint summary"
              title="Regenerate sprint summary"
              disabled={summaryPending}
              onClick={() => void runSummary(summarizableSprint.id, false, true)}
              sx={{ minWidth: 36, px: 0.75 }}
            >
              <ReplayOutlined fontSize="small" />
            </Button>
          )}
        </Stack>
        <Divider />
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            px: 1.5,
            py: 1,
          }}
        >
          <Stack spacing={1.5}>
            <Typography variant="caption" color="text.secondary">
              Today
            </Typography>
            {aiStatusQuery.error && (
              <Alert
                severity="error"
                action={
                  <Button color="inherit" size="small" onClick={() => void aiStatusQuery.refetch()}>
                    Try again
                  </Button>
                }
              >
                AI status is unavailable: {aiStatusQuery.error.message}
              </Alert>
            )}
            {messages.length === 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                <Box sx={{ maxWidth: '90%', p: 1.25, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                  <Typography variant="body2">
                    Ask a question about your project or choose a quick action above.
                  </Typography>
                </Box>
              </Box>
            )}
            {messages.map((message, index) => (
              <Stack
                key={`${index}-${message.role}`}
                direction={message.role === 'assistant' ? 'row' : 'row-reverse'}
                spacing={0.75}
                sx={{ alignItems: 'flex-start' }}
              >
                {message.role === 'assistant' && (
                  <Box
                    component="img"
                    src={kanbotLogoCircle}
                    alt=""
                    aria-hidden="true"
                    sx={{ width: 22, height: 22, flexShrink: 0 }}
                  />
                )}
                <Box
                  sx={{
                    maxWidth: '88%',
                    px: 1.25,
                    py: 0.75,
                    borderRadius: 2,
                    bgcolor: message.role === 'user' ? 'action.selected' : 'info.light',
                    border: message.role === 'assistant' ? '1px solid' : 'none',
                    borderColor: 'divider',
                    '& p': { my: 0.5 },
                    '& ul, & ol': { mt: 0.5, mb: 0.5, pl: 2.5 },
                    '& pre': { overflowX: 'auto' },
                  }}
                >
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </Box>
              </Stack>
            ))}
            {actionError && (
              <Alert
                severity="error"
                action={
                  summaryRetrySprintId ? (
                    <Button
                      color="inherit"
                      size="small"
                      onClick={() => void runSummary(summaryRetrySprintId, false)}
                    >
                      Try again
                    </Button>
                  ) : undefined
                }
              >
                {actionError}
              </Alert>
            )}
            {chatError && (
              <Alert
                severity="error"
                action={
                  lastChatPrompt ? (
                    <Button color="inherit" size="small" onClick={() => void submitChat(lastChatPrompt)}>
                      Try again
                    </Button>
                  ) : undefined
                }
              >
                {chatError}
              </Alert>
            )}
            {chatPending && (
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', color: 'text.secondary' }}>
                <CircularProgress size={16} />
                <Typography variant="body2">Thinking…</Typography>
              </Stack>
            )}
            <div ref={messagesEndRef} />
          </Stack>
        </Box>
        <Divider />
        <Box sx={{ p: 1.5 }}>
          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'flex-end' }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              size="small"
              placeholder="Ask Kanbot…"
              value={chatText}
              disabled={chatPending}
              onChange={(event) => setChatText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  void submitChat(chatText);
                }
              }}
              slotProps={{ htmlInput: { 'aria-label': 'Message Kanbot' } }}
            />
            <Button
              variant="contained"
              aria-label="Send message"
              onClick={() => void submitChat(chatText)}
              disabled={!chatText.trim() || chatPending}
              sx={{ minWidth: 44, px: 1.25, py: 1 }}
            >
              <SendOutlined fontSize="small" />
            </Button>
          </Stack>
          <Stack direction="row" sx={{ justifyContent: 'space-between', mt: 0.75 }}>
            <Typography variant="caption" color="text.secondary">
              AI can make mistakes. Review before saving.
            </Typography>
            <Button
              size="small"
              onClick={() => {
                setMessages([]);
                setChatError(null);
                setActionError(null);
                setLastChatPrompt('');
              }}
              sx={{ minWidth: 0, p: 0, fontSize: 11 }}
            >
              New chat
            </Button>
          </Stack>
        </Box>
      </Drawer>

      <Dialog
        open={generateOpen}
        onClose={draftsPending ? undefined : () => setGenerateOpen(false)}
        fullWidth
        maxWidth="md"
        fullScreen={isSmallScreen}
        slotProps={{
          paper: {
            sx: {
              display: 'flex',
              flexDirection: 'column',
              width: { xs: '100%', sm: 'calc(100vw - 48px)' },
              maxWidth: { xs: '100%', sm: 820 },
              height: { xs: '100dvh', sm: 'auto' },
              maxHeight: { xs: '100dvh', sm: 'calc(100% - 48px)' },
              m: { xs: 0, sm: 3 },
              borderRadius: { xs: 0, sm: '20px' },
              overflow: 'hidden',
            },
          },
        }}
      >
        <DialogTitle sx={{ px: { xs: '20px', sm: '20px' }, pt: '20px', pb: 0 }}>
          Generate todos
        </DialogTitle>
        <DialogContent
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            overscrollBehavior: 'contain',
            p: '20px',
            pt: '32px',
          }}
        >
          <Stack sx={{ width: '100%', maxWidth: 680, mx: 'auto', gap: '20px' }}>
            {generateError && (
              <Alert
                severity="error"
                action={
                  drafts.length === 0 ? (
                    <Button color="inherit" size="small" onClick={() => void handleGenerate()}>
                      Try again
                    </Button>
                  ) : undefined
                }
              >
                {generateError}
              </Alert>
            )}
            <TextField
              label="Describe a feature…"
              multiline
              minRows={2}
              fullWidth
              value={generatePrompt}
              onChange={(event) => setGeneratePrompt(event.target.value)}
              disabled={draftsPending || drafts.length > 0}
              sx={{
                width: '100%',
                maxWidth: 'none',
                alignSelf: 'center',
                mt: '8px',
                overflow: 'visible',
                '& .MuiOutlinedInput-root': {
                  overflow: 'visible',
                  backgroundColor: colors.neutral.surface,
                },
                '& .MuiOutlinedInput-notchedOutline legend': {
                  height: '14px',
                },
                '& .MuiInputLabel-root': {
                  overflow: 'visible',
                },
              }}
            />
            <TextField
              label="Number of todos"
              type="number"
              value={generateCount}
              onChange={(event) => {
                const count = Number(event.target.value);
                setGenerateCount(
                  Number.isInteger(count) ? Math.max(1, Math.min(10, count)) : 5
                );
              }}
              slotProps={{ htmlInput: { min: 1, max: 10 } }}
              disabled={draftsPending || drafts.length > 0}
              sx={{
                width: 260,
                maxWidth: '100%',
                alignSelf: 'flex-start',
                '& .MuiOutlinedInput-root': {
                  backgroundColor: colors.neutral.surface,
                },
              }}
            />
            {draftsPending && drafts.length === 0 && (
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <CircularProgress size={20} />
                <Typography>Generating draft todos…</Typography>
              </Stack>
            )}
            {drafts.length > 0 && (
              <Stack sx={{ gap: '20px' }}>
                {drafts.map((item) => (
                  <Box
                    key={item.id}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: 'minmax(0, 1fr)',
                        sm: '40px minmax(0, 1fr) 40px',
                      },
                      justifyContent: 'center',
                      alignItems: 'start',
                      p: { xs: '16px', sm: '20px' },
                      backgroundColor: colors.neutral.todoCard,
                      border: '1px solid',
                      borderColor: colors.neutral.todoCardBorder,
                      borderRadius: '14px',
                      boxShadow: 'none',
                      opacity: item.selected ? 1 : 0.6,
                      transition: 'opacity 200ms ease, border-color 200ms ease',
                      '&:hover': {
                        borderColor: 'secondary.main',
                      },
                    }}
                  >
                    <Stack
                      direction="row"
                      sx={{
                        gridColumn: { xs: '1', sm: '1' },
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <Checkbox
                        checked={item.selected}
                        onChange={(event) =>
                          setDrafts((current) =>
                            current.map((draft) =>
                              draft.id === item.id ? { ...draft, selected: event.target.checked } : draft
                            )
                          )
                        }
                        slotProps={{ input: { 'aria-label': `Add ${item.draft.title}` } }}
                        sx={{ p: 0.5 }}
                      />
                      <Typography sx={{ display: { xs: 'block', sm: 'none' } }}>
                        Include
                      </Typography>
                    </Stack>
                    <Stack
                      sx={{
                        gap: '12px',
                        gridColumn: { xs: '1', sm: '2' },
                        width: '100%',
                        maxWidth: 560,
                        minWidth: 0,
                        justifySelf: 'center',
                      }}
                    >
                      <TextField
                        size="small"
                        label="Title"
                        value={item.draft.title}
                        onChange={(event) => updateDraft(item.id, { title: event.target.value })}
                        sx={{
                          width: '100%',
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: colors.neutral.surface,
                          },
                        }}
                      />
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: {
                            xs: 'repeat(2, minmax(0, 1fr))',
                            sm: 'repeat(3, minmax(0, 1fr))',
                          },
                          gap: '12px',
                          '@media (max-width:359px)': {
                            gridTemplateColumns: 'minmax(0, 1fr)',
                          },
                        }}
                      >
                        <FormControl
                          size="small"
                          fullWidth
                          sx={{
                            minWidth: 0,
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: colors.neutral.surface,
                            },
                          }}
                        >
                          <InputLabel>Type</InputLabel>
                          <Select
                            label="Type"
                            value={item.draft.type}
                            onChange={(event) => updateDraft(item.id, { type: event.target.value as TodoType })}
                          >
                            {todoTypes.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                          </Select>
                        </FormControl>
                        <FormControl
                          size="small"
                          fullWidth
                          sx={{
                            minWidth: 0,
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: colors.neutral.surface,
                            },
                          }}
                        >
                          <InputLabel>Priority</InputLabel>
                          <Select
                            label="Priority"
                            value={item.draft.priority}
                            onChange={(event) => updateDraft(item.id, { priority: event.target.value as TodoPriority })}
                          >
                            {priorities.map((priority) => <MenuItem key={priority} value={priority}>{priority}</MenuItem>)}
                          </Select>
                        </FormControl>
                        <FormControl
                          size="small"
                          fullWidth
                          sx={{
                            minWidth: 0,
                            gridColumn: { xs: '1 / -1', sm: 'auto' },
                            '@media (max-width:359px)': {
                              gridColumn: 'auto',
                            },
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: colors.neutral.surface,
                            },
                          }}
                        >
                          <InputLabel>Points</InputLabel>
                          <Select
                            label="Points"
                            value={item.draft.storyPoints ?? ''}
                            onChange={(event) => {
                              const selectedValue = String(event.target.value);
                              updateDraft(item.id, {
                                storyPoints:
                                  selectedValue === ''
                                    ? null
                                    : Number(selectedValue) as StoryPoints,
                              });
                            }}
                          >
                            {storyPoints.map((points) => (
                              <MenuItem key={points || 'none'} value={points}>
                                {points === '' ? 'None' : points}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </Stack>
        </DialogContent>
        <DialogActions
          sx={{
            flexShrink: 0,
            flexWrap: 'wrap',
            gap: 1,
            px: '20px',
            py: '16px',
            pb: { xs: 'calc(16px + env(safe-area-inset-bottom))', sm: '16px' },
            borderTop: 1,
            borderColor: 'divider',
            backgroundColor: 'background.paper',
          }}
        >
          <Button onClick={() => setGenerateOpen(false)} disabled={draftsPending}>Cancel</Button>
          {drafts.length === 0 ? (
            <Button
              variant="contained"
              onClick={() => void handleGenerate()}
              disabled={draftsPending || generatePrompt.trim().length < 3}
              startIcon={draftsPending ? <CircularProgress size={16} /> : <AutoAwesomeOutlined />}
            >
              Generate
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={() => void handleAddDrafts()}
              disabled={draftsPending || selectedDraftCount === 0}
              startIcon={draftsPending ? <CircularProgress size={16} /> : <AddOutlined />}
            >
              Add {selectedDraftCount} to backlog
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Dialog
        open={planOpen}
        onClose={planPending || createSprintPending ? undefined : () => setPlanOpen(false)}
        fullWidth
        maxWidth="lg"
        slotProps={{
          paper: {
            sx: {
              width: 'min(980px, calc(100vw - 32px))',
              maxWidth: 'none',
              borderRadius: 2,
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: { xs: 2, sm: 3 },
            py: 2,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', color: 'primary.main' }}>
            <AutoAwesomeOutlined fontSize="small" />
            <Typography component="span" variant="h2" color="text.primary">
              Plan sprint with AI
            </Typography>
          </Stack>
          <IconButton
            aria-label="Close sprint planner"
            onClick={() => setPlanOpen(false)}
            disabled={planPending || createSprintPending}
            size="small"
          >
            <CloseOutlined />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 }, pt: 2.5, pb: 2.5 }}>
          <Stack spacing={2.5}>
            {planError && (
              <Alert
                severity="error"
                action={
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() =>
                      void (planErrorAction === 'create'
                        ? handleCreatePlannedSprint()
                        : handlePlan())
                    }
                  >
                    Try again
                  </Button>
                }
              >
                {planError}
              </Alert>
            )}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'minmax(0, 1fr)',
                  sm: 'repeat(2, minmax(0, 1fr))',
                  lg: 'minmax(150px, 0.9fr) minmax(145px, 0.8fr) minmax(220px, 2fr) auto',
                },
                gap: 1.5,
                alignItems: 'end',
                overflow: 'visible',
                pt: 2,
              }}
            >
              <TextField
                label="Capacity (story points)"
                type="number"
                required
                fullWidth
                value={capacity}
                onChange={(event) => setCapacity(event.target.value)}
                slotProps={{ htmlInput: { min: 1, max: 200, step: 1 } }}
                disabled={planPending || createSprintPending}
                sx={planFieldSx}
              />
              <FormControl
                fullWidth
                disabled={planPending || createSprintPending}
                sx={planFieldSx}
              >
                <InputLabel id="sprint-length-label">Sprint Length</InputLabel>
                <Select
                  labelId="sprint-length-label"
                  label="Sprint Length"
                  value={sprintLengthWeeks}
                  onChange={(event) => setSprintLengthWeeks(Number(event.target.value))}
                >
                  {sprintLengthOptions.map((weeks) => (
                    <MenuItem key={weeks} value={weeks}>
                      {weeks} {weeks === 1 ? 'week' : 'weeks'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Focus / goal (optional)"
                value={focus}
                fullWidth
                onChange={(event) => setFocus(event.target.value)}
                slotProps={{ htmlInput: { maxLength: 300 } }}
                disabled={planPending || createSprintPending}
                sx={planFieldSx}
              />
              <Button
                variant="contained"
                onClick={() => void handlePlan()}
                disabled={planPending || createSprintPending}
                startIcon={planPending ? <CircularProgress size={16} /> : <AutoAwesomeOutlined />}
                sx={{ minHeight: 40, whiteSpace: 'nowrap' }}
              >
                Suggest plan
              </Button>
            </Box>
            {plan && (
              <Stack spacing={2} sx={{ pt: 0.5 }}>
                <Divider />
                <TextField
                  label="Suggested sprint goal"
                  value={planGoal}
                  fullWidth
                  onChange={(event) => setPlanGoal(event.target.value)}
                  disabled={createSprintPending}
                />
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: 'minmax(0, 1fr)',
                      md: 'minmax(0, 1.6fr) minmax(260px, 1fr)',
                    },
                    gap: 2,
                    alignItems: 'stretch',
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ mb: 1, color: 'primary.dark', fontWeight: 600 }}
                    >
                      Selected backlog todos
                    </Typography>
                    {backlogQuery.isLoading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress size={22} />
                      </Box>
                    ) : backlogQuery.error ? (
                      <Alert severity="error">{backlogQuery.error.message}</Alert>
                    ) : plannedBacklogTodos.length === 0 ? (
                      <Box
                        sx={{
                          p: 2,
                          border: 1,
                          borderColor: 'divider',
                          borderRadius: 1,
                          bgcolor: 'background.paper',
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          The backlog is empty.
                        </Typography>
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          maxHeight: { xs: 240, sm: 320 },
                          overflowY: 'auto',
                          border: 1,
                          borderColor: 'divider',
                          borderRadius: 1,
                        }}
                      >
                        {plannedBacklogTodos.map((todo: Todo, index) => (
                          <Stack
                            key={todo.id}
                            direction="row"
                            spacing={1}
                            sx={{
                              minHeight: 44,
                              px: 1,
                              alignItems: 'center',
                              borderBottom:
                                index < plannedBacklogTodos.length - 1 ? 1 : 0,
                              borderColor: 'divider',
                            }}
                          >
                            <Checkbox
                              size="small"
                              checked={selectedTodoIds.includes(todo.id)}
                              onChange={() => toggleTodo(todo.id)}
                              disabled={createSprintPending}
                              slotProps={{ input: { 'aria-label': `Include ${todo.title}` } }}
                              sx={{ p: 0.5, color: 'primary.main' }}
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ flexShrink: 0 }}
                            >
                              {todo.key}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ flex: 1, minWidth: 0, overflowWrap: 'anywhere' }}
                            >
                              {todo.title}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                flexShrink: 0,
                                px: 0.75,
                                py: 0.25,
                                borderRadius: 1,
                                bgcolor: 'secondary.soft',
                                color: 'text.secondary',
                              }}
                            >
                              {todo.storyPoints ?? 0} pts
                            </Typography>
                          </Stack>
                        ))}
                        <Stack
                          direction={{ xs: 'column', sm: 'row' }}
                          spacing={1.5}
                          sx={{
                            px: 1.5,
                            py: 1.25,
                            alignItems: { xs: 'stretch', sm: 'center' },
                            bgcolor: 'background.default',
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ flexShrink: 0, fontWeight: 600 }}
                          >
                            Total
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={
                              capacityIsValid
                                ? Math.min((selectedPlanPoints / parsedCapacity) * 100, 100)
                                : 0
                            }
                            sx={{
                              flex: 1,
                              height: 6,
                              borderRadius: 3,
                              bgcolor: 'action.hover',
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 3,
                                bgcolor:
                                  selectedPlanPoints > parsedCapacity
                                    ? 'error.main'
                                    : 'primary.main',
                              },
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{ flexShrink: 0, fontWeight: 600 }}
                          >
                            {selectedPlanPoints} / {parsedCapacity || 0} pts
                          </Typography>
                        </Stack>
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ mb: 1, color: 'primary.dark', fontWeight: 600 }}
                    >
                      Why this plan?
                    </Typography>
                    <Box
                      sx={{
                        height: { xs: 'auto', md: 'calc(100% - 28px)' },
                        minHeight: 180,
                        p: 2,
                        border: 1,
                        borderColor: 'primary.light',
                        borderRadius: 1,
                        bgcolor: 'primary.soft',
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="text.primary"
                        sx={{ whiteSpace: 'pre-line', overflowWrap: 'anywhere' }}
                      >
                        {plan.reasoning}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                {selectedPlanPoints > parsedCapacity && (
                  <Alert severity="warning">
                    Selected todos exceed the sprint capacity. Remove todos before creating the sprint.
                  </Alert>
                )}
              </Stack>
            )}
          </Stack>
        </DialogContent>
        <DialogActions
          sx={{
            p: { xs: 2, sm: 2.5 },
            borderTop: 1,
            borderColor: 'divider',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Button
            onClick={() => setPlanOpen(false)}
            disabled={planPending || createSprintPending}
            sx={{ flex: { xs: 1, sm: 'initial' } }}
          >
            Cancel
          </Button>
          {plan && (
            <Button
              variant="contained"
              onClick={() => void handleCreatePlannedSprint()}
              disabled={
                createSprintPending ||
                selectedTodoIds.length === 0 ||
                !capacityIsValid ||
                selectedPlanPoints > parsedCapacity
              }
              startIcon={createSprintPending ? <CircularProgress size={16} /> : <AddOutlined />}
              sx={{ flex: { xs: 1, sm: 'initial' }, bgcolor: 'primary.main' }}
            >
              Create sprint with {selectedTodoIds.length} todos
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
});

export default AssistantDrawer;
