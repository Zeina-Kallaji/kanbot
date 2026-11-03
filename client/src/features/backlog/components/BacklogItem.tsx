// client/src/features/backlog/components/BacklogItem.tsx

import { useState } from 'react';

import {
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Typography,
} from '@mui/material';

import {
  MoreVertOutlined,
  EditOutlined,
  DriveFileMoveOutlined,
  DragIndicatorOutlined,
} from '@mui/icons-material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import type { Todo } from '../../../types/api';
import type { Sprint } from '../../../types/api';

interface BacklogItemProps {
  todo: Todo;
  onClick: (todo: Todo) => void;
  listId: string;
  isDraggable: boolean;
  sprints: Sprint[];
  onMove: (todo: Todo, sprintId: string | null) => void;
  compact: boolean;
}

const priorityColors = {
  low: 'default',
  medium: 'info',
  high: 'warning',
  urgent: 'error',
} as const;

export default function BacklogItem({
  todo,
  onClick,
  listId,
  isDraggable,
  sprints,
  onMove,
  compact,
}: BacklogItemProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: todo.id,
    disabled: !isDraggable,
    data: { listId, todo },
  });

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = (event: React.MouseEvent) => {
    event.stopPropagation();
    handleMenuClose();
    onClick(todo);
  };

  return (
    <Paper
      ref={setNodeRef}
      variant="outlined"
      role="button"
      tabIndex={0}
      onClick={() => onClick(todo)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick(todo);
        }
      }}
      sx={{
        transform: CSS.Transform.toString(transform),
        opacity: isDragging ? 0.45 : 1,
        p: compact ? { xs: 1, md: 0.75 } : 2,
        borderRadius: compact ? 0 : 2,
        borderLeft: compact ? 0 : undefined,
        borderRight: compact ? 0 : undefined,
        borderTop: compact ? 0 : undefined,
        borderBottom: compact ? 1 : undefined,
        borderColor: compact ? 'divider' : undefined,
        cursor: 'pointer',
        transition: transition
          ? `${transition}, border-color 0.2s, background-color 0.2s`
          : 'border-color 0.2s, background-color 0.2s',
        '&:hover': {
          borderColor: 'primary.main',
          bgcolor: 'action.hover',
        },
        '&:focus-visible': {
          outline: '2px solid',
          outlineColor: 'primary.main',
        },
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={compact ? 1 : 2}
        sx={{
          alignItems: { xs: 'stretch', md: 'center' },
          justifyContent: 'space-between',
        }}
      >
        {/* Label and Title */}
        <Stack
          direction="row"
          spacing={compact ? 1 : 1.5}
          sx={{
            alignItems: 'center',
            flex: 1,
            minWidth: 0,
            flexWrap: { xs: 'wrap', md: 'nowrap' },
          }}
        >
          <IconButton
            size="small"
            aria-label={`Drag ${todo.key}`}
            disabled={!isDraggable}
            {...attributes}
            {...listeners}
            onClick={(event) => event.stopPropagation()}
            sx={{ cursor: isDraggable ? 'grab' : 'default', flexShrink: 0 }}
          >
            <DragIndicatorOutlined fontSize="small" />
          </IconButton>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontWeight: 600,
              fontSize: '0.75rem',
              flexShrink: 0,
            }}
          >
            {todo.key}
          </Typography>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {todo.title}
            </Typography>
            {todo.labels.length > 0 && (
              <Stack direction="row" spacing={0.5} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
                {todo.labels.map((label) => (
                  <Chip key={label} size="small" label={label} variant="outlined" />
                ))}
              </Stack>
            )}
          </Box>
        </Stack>

        {/* Type, Priority, Points chips */}
        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <Chip
            size="small"
            label={todo.type}
            variant="outlined"
          />

          <Chip
            size="small"
            label={todo.priority}
            color={priorityColors[todo.priority]}
          />

          <Chip
            size="small"
            variant="outlined"
            label={
              todo.storyPoints !== null
                ? `${todo.storyPoints} SP`
                : '0 SP'
            }
          />
        </Stack>

        {/* Three-dot menu */}
        <Box sx={{ flexShrink: 0 }}>
          <IconButton
            size="small"
            onClick={handleMenuClick}
            aria-label="More options"
            aria-controls={open ? 'todo-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
          >
            <MoreVertOutlined />
          </IconButton>

          <Menu
            id="todo-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleEdit}>
              <EditOutlined sx={{ mr: 1, fontSize: '1.25rem' }} />
              Edit
            </MenuItem>

            <MenuItem disabled>
              <DriveFileMoveOutlined sx={{ mr: 1, fontSize: '1.25rem' }} />
              Move to
            </MenuItem>
            <MenuItem
              disabled={todo.sprintId === null}
              onClick={(event) => {
                event.stopPropagation();
                handleMenuClose();
                onMove(todo, null);
              }}
            >
              Backlog
            </MenuItem>
            {sprints.map((sprint) => (
              <MenuItem
                key={sprint.id}
                disabled={todo.sprintId === sprint.id}
                onClick={(event) => {
                  event.stopPropagation();
                  handleMenuClose();
                  onMove(todo, sprint.id);
                }}
              >
                {sprint.name}
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Stack>
    </Paper>
  );
}