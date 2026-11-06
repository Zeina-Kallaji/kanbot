import { useState } from "react";
import {
  Box,
  Button,
  Collapse,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  KeyboardArrowDownOutlined,
  KeyboardArrowRightOutlined,
  EditOutlined,
  PlayArrowOutlined,
} from "@mui/icons-material";
import type { Sprint, Todo } from "../../../types/api";
import BacklogList from "./BacklogList";

interface SprintSectionProps {
  sprint: Sprint;
  todos: Todo[];
  activeSprintExists: boolean;
  isDraggable: boolean;
  sprints: Sprint[];
  onTodoClick: (todo: Todo) => void;
  onMove: (todo: Todo, sprintId: string | null) => void;
  onReorder: (todo: Todo, position: number) => void;
  onDelete: (todo: Todo) => void;
  onEdit: (sprint: Sprint) => void;
  onStart: (sprint: Sprint) => void;
}

function formatDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    ...(year !== new Date().getFullYear() ? { year: "numeric" } : {}),
  }).format(new Date(year, month - 1, day));
}

function sprintDateRange(sprint: Sprint): string | null {
  if (!sprint.startDate && !sprint.endDate) return null;
  if (sprint.startDate && sprint.endDate) {
    return `${formatDate(sprint.startDate)} – ${formatDate(sprint.endDate)}`;
  }
  if (sprint.startDate) return `Starts ${formatDate(sprint.startDate)}`;
  return sprint.endDate ? `Ends ${formatDate(sprint.endDate)}` : null;
}

export default function SprintSection({
  sprint,
  todos,
  activeSprintExists,
  isDraggable,
  sprints,
  onTodoClick,
  onMove,
  onReorder,
  onDelete,
  onEdit,
  onStart,
}: SprintSectionProps) {
  const [expanded, setExpanded] = useState(true);
  const totalPoints = todos.reduce(
    (total, todo) => total + (todo.storyPoints ?? 0),
    0,
  );
  const dates = sprintDateRange(sprint);

  return (
    <Paper
      variant="outlined"
      sx={{ mb: 2, overflow: "hidden", borderRadius: 2 }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={{ xs: 1, sm: 2 }}
        sx={{
          alignItems: { sm: "center" },
          justifyContent: "space-between",
          minHeight: 40,
          px: { xs: 1, sm: 1.5 },
          py: 0.75,
          bgcolor: "#b9c9ee",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={{ xs: 0.5, sm: 2 }}
          sx={{ alignItems: { sm: "center" }, minWidth: 0, flex: 1 }}
        >
          <Stack
            direction="row"
            spacing={0.75}
            sx={{ alignItems: "center", minWidth: 0 }}
          >
            <IconButton
              size="small"
              onClick={() => setExpanded((value) => !value)}
              aria-label={expanded ? "Collapse sprint" : "Expand sprint"}
              sx={{ p: 0.25 }}
            >
              {expanded ? (
                <KeyboardArrowDownOutlined fontSize="small" />
              ) : (
                <KeyboardArrowRightOutlined fontSize="small" />
              )}
            </IconButton>
            <Typography
              variant="body2"
              sx={{
                color: "text.primary",
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              {sprint.name} ({sprint.status})
            </Typography>
          </Stack>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ pl: { xs: 4, sm: 0 }, whiteSpace: "nowrap" }}
          >
            {[dates, `${todos.length} todos`, `${totalPoints} pts`]
              .filter(Boolean)
              .join(" · ")}
          </Typography>
          {activeSprintExists && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ pl: { xs: 4, sm: 0 } }}
            >
              Another sprint is active. Complete it before starting this sprint.
            </Typography>
          )}
        </Stack>

        <Stack
          direction="row"
          spacing={0.75}
          sx={{
            alignItems: "center",
            justifyContent: "flex-end",
            flexShrink: 0,
          }}
        >
          <Button
            size="small"
            variant="outlined"
            startIcon={<EditOutlined />}
            onClick={() => onEdit(sprint)}
          >
            Edit
          </Button>
          <Tooltip
            title={
              activeSprintExists
                ? "Another sprint is already active. Complete it before starting this sprint."
                : "Start sprint"
            }
          >
            <span>
              <Button
                size= "small"
                variant="contained"
                startIcon={<PlayArrowOutlined />}
                onClick={() => onStart(sprint)}
                disabled={activeSprintExists}
                
              >
                Start sprint
              </Button>
            </span>
          </Tooltip>
        </Stack>
      </Stack>

      <Collapse in={expanded}>
        <Box>
          <BacklogList
            todos={[...todos].sort((a, b) => a.order - b.order)}
            onTodoClick={onTodoClick}
            listId={sprint.id}
            isDraggable={isDraggable}
            sprints={sprints}
            onMove={onMove}
            onReorder={onReorder}
            onDelete={onDelete}
          />
          {todos.length === 0 && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ px: 2, py: 1.5 }}
            >
              No todos in this sprint yet.
            </Typography>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
}
