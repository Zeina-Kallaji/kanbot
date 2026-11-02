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
  DeleteOutlined,
  DriveFileMoveOutlined,
} from '@mui/icons-material';

import type { Todo } from '../../../types/api';

interface BacklogItemProps {
  todo: Todo;
  onClick: (todo: Todo) => void;
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
}: BacklogItemProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

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

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    handleMenuClose();
    // Delete functionality to be connected later
  };

  const handleMove = (event: React.MouseEvent) => {
    event.stopPropagation();
    handleMenuClose();
    // Move functionality to be connected later
  };

  return (
    <Paper
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
        p: 2,
        borderRadius: 2,
        cursor: 'pointer',
        transition: 'border-color 0.2s, background-color 0.2s',
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
        direction="row"
        spacing={2}
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Label and Title */}
        <Stack
          direction="row"
          spacing={1.5}
          sx={{
            alignItems: 'center',
            flex: 1,
            minWidth: 0,
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

          <Typography
            sx={{
              fontWeight: 600,
              flex: 1,
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {todo.title}
          </Typography>
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

            <MenuItem onClick={handleMove}>
              <DriveFileMoveOutlined sx={{ mr: 1, fontSize: '1.25rem' }} />
              Move to sprint
            </MenuItem>

            <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
              <DeleteOutlined sx={{ mr: 1, fontSize: '1.25rem' }} />
              Delete
            </MenuItem>
          </Menu>
        </Box>
      </Stack>
    </Paper>
  );
}