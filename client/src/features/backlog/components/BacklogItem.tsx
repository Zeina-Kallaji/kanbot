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
  Divider,
} from '@mui/material';

import {
  MoreVertOutlined,
  ArrowUpwardOutlined,
  ArrowDownwardOutlined,
  DeleteOutlineOutlined,
} from '@mui/icons-material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import type { Todo } from '../../../types/api';
import type { Sprint } from '../../../types/api';
import TodoLabels from '../../../components/TodoLabels';

interface BacklogItemProps {
  todo: Todo;
  onClick: (todo: Todo) => void;
  listId: string;
  isDraggable: boolean;
  sprints: Sprint[];
  onMove: (todo: Todo, sprintId: string | null) => void;
  onReorder: (todo: Todo, position: number) => void;
  onDelete: (todo: Todo) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  compact: boolean;
  roundBottomCorners: boolean;
}

export default function BacklogItem({
  todo,
  onClick,
  listId,
  isDraggable,
  sprints,
  onMove,
  onReorder,
  onDelete,
  canMoveUp,
  canMoveDown,
  compact,
  roundBottomCorners,
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

  const handleMenuAction = (action: () => void) => (event: React.MouseEvent) => {
    event.stopPropagation();
    handleMenuClose();
    action();
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Paper
      ref={setNodeRef}
      variant="outlined"
      {...attributes}
      {...listeners}
      onClick={() => onClick(todo)}
      sx={{
        transform: CSS.Transform.toString(transform),
        opacity: isDragging ? 0.45 : 1,
        p: compact ? { xs: 1, md: 0.75 } : 2,
        borderRadius: 0,
        ...(roundBottomCorners && {
          borderBottomLeftRadius: 2,
          borderBottomRightRadius: 2,
        }),
        borderLeft: compact ? 0 : undefined,
        borderRight: compact ? 0 : undefined,
        borderTop: compact ? 0 : undefined,
        borderBottom: compact ? 1 : undefined,
        borderColor: compact ? 'divider' : undefined,
        cursor: 'pointer',
        touchAction: isDraggable ? 'none' : 'auto',
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

        <Stack
          direction="row"
          spacing={1.75}
          sx={{
            alignItems: 'center',
            flexShrink: 0,
            justifyContent: { md: 'flex-end' },
            width: { md: 228 },
          }}
        >
          <TodoLabels type={todo.type} priority={todo.priority} />

          <Chip
            size="small"
            variant="outlined"
            label={
              todo.storyPoints !== null
                ? `${todo.storyPoints} pts`
                : '0 pts'
            }
            sx={{
              width: 56,
              height: 24,
              borderRadius: 12,
              '& .MuiChip-label': { px: 0.5, textAlign: 'center' },
            }}
          />
        </Stack>

        <Box sx={{ flexShrink: 0 }}>
          <IconButton
            size="small"
            onPointerDown={(event) => event.stopPropagation()}
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
            <MenuItem
              disabled={!canMoveUp}
              onClick={handleMenuAction(() => onReorder(todo, 0))}
            >
              <ArrowUpwardOutlined sx={{ mr: 1, fontSize: '1.25rem' }} />
              Move up
            </MenuItem>
            <MenuItem
              disabled={!canMoveDown}
              onClick={handleMenuAction(() => onReorder(todo, Number.MAX_SAFE_INTEGER))}
            >
              <ArrowDownwardOutlined sx={{ mr: 1, fontSize: '1.25rem' }} />
              Move down
            </MenuItem>
            <Divider />
            {sprints.map((sprint) => (
              <MenuItem
                key={sprint.id}
                disabled={todo.sprintId === sprint.id}
                onClick={handleMenuAction(() => onMove(todo, sprint.id))}
              >
                Move to {sprint.name}
              </MenuItem>
            ))}
            <MenuItem
              disabled={todo.sprintId === null}
              onClick={handleMenuAction(() => onMove(todo, null))}
            >
              Move to backlog
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={handleMenuAction(() => onDelete(todo))}
              sx={{ color: 'error.main' }}
            >
              <DeleteOutlineOutlined sx={{ mr: 1, fontSize: '1.25rem' }} />
              Delete todo
            </MenuItem>
          </Menu>
        </Box>
      </Stack>
    </Paper>
  );
}