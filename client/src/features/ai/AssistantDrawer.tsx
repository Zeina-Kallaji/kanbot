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
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  AddOutlined,
  AutoAwesomeOutlined,
  CloseOutlined,
  ReplayOutlined,
  SendOutlined,
} from '@mui/icons-material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
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

const AssistantDrawer = forwardRef<AssistantDrawerHandle, AssistantDrawerProps>(
function AssistantDrawer({
  projectId,
  open,
  onClose,
}, ref) {
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
  const [focus, setFocus] = useState('');
  const [planPending, setPlanPending] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);
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
    if (savedSummary && !regenerate) {
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
          content: `${savedSummary.content}\n\n_Generated ${new Date(savedSummary.generatedAt).toLocaleString()}._`,
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
      const response = await summarizeSprint(sprintId);
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
    try {
      const response = await planSprint(projectId, {
        capacity: parsedCapacity,
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
              <AutoAwesomeOutlined color="primary" fontSize="small" />
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
                    src="/kanbot-icon.svg"
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
      >
        <DialogTitle>Generate todos</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
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
              value={generatePrompt}
              onChange={(event) => setGeneratePrompt(event.target.value)}
              disabled={draftsPending || drafts.length > 0}
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
              sx={{ maxWidth: 180 }}
            />
            {draftsPending && drafts.length === 0 && (
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <CircularProgress size={20} />
                <Typography>Generating draft todos…</Typography>
              </Stack>
            )}
            {drafts.map((item) => (
              <Stack
                key={item.id}
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                sx={{ p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}
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
                  sx={{ alignSelf: 'flex-start', mt: -0.5 }}
                />
                <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }}>
                  <TextField
                    size="small"
                    label="Title"
                    value={item.draft.title}
                    onChange={(event) => updateDraft(item.id, { title: event.target.value })}
                  />
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <FormControl size="small" fullWidth>
                      <InputLabel>Type</InputLabel>
                      <Select
                        label="Type"
                        value={item.draft.type}
                        onChange={(event) => updateDraft(item.id, { type: event.target.value as TodoType })}
                      >
                        {todoTypes.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                      </Select>
                    </FormControl>
                    <FormControl size="small" fullWidth>
                      <InputLabel>Priority</InputLabel>
                      <Select
                        label="Priority"
                        value={item.draft.priority}
                        onChange={(event) => updateDraft(item.id, { priority: event.target.value as TodoPriority })}
                      >
                        {priorities.map((priority) => <MenuItem key={priority} value={priority}>{priority}</MenuItem>)}
                      </Select>
                    </FormControl>
                    <FormControl size="small" fullWidth>
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
                  </Stack>
                </Stack>
              </Stack>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
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
        maxWidth="sm"
      >
        <DialogTitle>Plan sprint</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {planError && (
              <Alert
                severity="error"
                action={
                  <Button color="inherit" size="small" onClick={() => void (plan ? handleCreatePlannedSprint() : handlePlan())}>
                    Try again
                  </Button>
                }
              >
                {planError}
              </Alert>
            )}
            <TextField
              label="Capacity (story points)"
              type="number"
              required
              value={capacity}
              onChange={(event) => setCapacity(event.target.value)}
              slotProps={{ htmlInput: { min: 1, max: 200, step: 1 } }}
              disabled={planPending || Boolean(plan)}
            />
            <TextField
              label="Focus (optional)"
              value={focus}
              onChange={(event) => setFocus(event.target.value)}
              slotProps={{ htmlInput: { maxLength: 300 } }}
              disabled={planPending || Boolean(plan)}
            />
            {!plan && (
              <Button
                variant="contained"
                onClick={() => void handlePlan()}
                disabled={planPending}
                startIcon={planPending ? <CircularProgress size={16} /> : <AutoAwesomeOutlined />}
              >
                Suggest plan
              </Button>
            )}
            {plan && (
              <>
                <TextField
                  label="Suggested sprint goal"
                  value={planGoal}
                  onChange={(event) => setPlanGoal(event.target.value)}
                />
                <Typography variant="body2" color="text.secondary">
                  {plan.reasoning}
                </Typography>
                {backlogQuery.isLoading ? (
                  <CircularProgress size={22} />
                ) : backlogQuery.error ? (
                  <Alert severity="error">{backlogQuery.error.message}</Alert>
                ) : backlogTodos.length === 0 ? (
                  <Typography color="text.secondary">The backlog is empty.</Typography>
                ) : (
                  <Stack spacing={0.5}>
                    {backlogTodos
                      .filter((todo) => plan.todoIds.includes(todo.id))
                      .map((todo: Todo) => (
                        <Stack key={todo.id} direction="row" sx={{ alignItems: 'center' }}>
                          <Checkbox
                            checked={selectedTodoIds.includes(todo.id)}
                            onChange={() => toggleTodo(todo.id)}
                            slotProps={{ input: { 'aria-label': `Include ${todo.title}` } }}
                          />
                          <Typography variant="body2" sx={{ flex: 1 }}>
                            {todo.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {todo.storyPoints ?? 0} pts
                          </Typography>
                        </Stack>
                      ))}
                  </Stack>
                )}
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {selectedPlanPoints} / {capacity} points selected
                </Typography>
                {selectedPlanPoints > Number(capacity) && (
                  <Alert severity="warning">
                    Selected todos exceed the sprint capacity. Remove todos before creating the sprint.
                  </Alert>
                )}
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setPlanOpen(false)} disabled={planPending || createSprintPending}>Cancel</Button>
          {plan && (
            <Button
              variant="contained"
              onClick={() => void handleCreatePlannedSprint()}
              disabled={
                createSprintPending ||
                selectedTodoIds.length === 0 ||
                selectedPlanPoints > Number(capacity)
              }
              startIcon={createSprintPending ? <CircularProgress size={16} /> : <AddOutlined />}
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
