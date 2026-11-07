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
      className="sprint-container"
      sx={{
        mb: 2,
        overflow: "hidden !important",
        borderRadius: 2,
        '& [data-drop-list] > .MuiPaper-root:last-child': {
          borderBottomLeftRadius: '20px !important',
          borderBottomRightRadius: '20px !important',
          borderTopLeftRadius: '0 !important',
          borderTopRightRadius: '0 !important',
        },
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={{ xs: 1, md: 2 }}
        sx={{
          alignItems: { md: "center" },
          justifyContent: "space-between",
          minHeight: 40,
          px: { xs: 1, sm: 1.5 },
          py: 0.75,
          bgcolor: "#b9c9ee",
        }}
      >
        <Stack
          direction="row"
          sx={{
            alignItems: "center",
            flexWrap: "wrap",
            columnGap: 2,
            rowGap: 0.25,
            minWidth: 0,
            flex: 1,
          }}
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
                overflowWrap: "anywhere",
              }}
            >
              {sprint.name} ({sprint.status})
            </Typography>
          </Stack>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ pl: { xs: 4, md: 0 } }}
          >
            {[dates, `${todos.length} todos`, `${totalPoints} pts`]
              .filter(Boolean)
              .join(" · ")}
          </Typography>
         
        </Stack>

        <Stack
          direction="row"
          spacing={0.75}
          sx={{
            alignItems: "center",
            justifyContent: { xs: "flex-start", md: "flex-end" },
            flexShrink: 0,
            pl: { xs: 4, md: 0 },
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
        <Box
          sx={{
            overflow: "hidden",
            borderBottomLeftRadius: 2,
            borderBottomRightRadius: 2,
          }}
        >
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
