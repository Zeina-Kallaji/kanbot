import type { ReactElement } from 'react';
import { Box, Chip, Stack } from '@mui/material';
import {
  ArrowDownwardOutlined,
  ArrowUpwardOutlined,
  BugReportOutlined,
  CheckBoxOutlined,
  ErrorOutlineOutlined,
  MenuBookOutlined,
} from '@mui/icons-material';
import type { TodoPriority, TodoType } from '../types/api';

const priorityColors: Record<TodoPriority, 'default' | 'info' | 'warning' | 'error'> = {
  urgent: 'error',
  high: 'warning',
  medium: 'info',
  low: 'default',
};

const priorityIcons: Record<TodoPriority, ReactElement> = {
  urgent: <ErrorOutlineOutlined sx={{ color: '#b83229' }} />,
  high: <ArrowUpwardOutlined sx={{ color: '#a44b12' }} />,
  medium: <Box
    component="span"
    aria-hidden="true"
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 14,
      height: 14,
      color: '#98600d',
      fontSize: 14,
      fontWeight: 800,
      lineHeight: 1,
    }}
  >
    =
  </Box>,
  low: <ArrowDownwardOutlined sx={{ color: '#555555' }} />,
};

const typeColors: Record<TodoType, string> = {
  task: '#bbddc4',
  bug: '#f7aed1',
  story: '#d0c0f7',
};

const typeIcons: Record<TodoType, ReactElement> = {
  task: <CheckBoxOutlined sx={{ color: '#3D674B' }} />,
  bug: <BugReportOutlined sx={{ color: '#A13F39' }} />,
  story: <MenuBookOutlined sx={{ color: '#5D4C7B' }} />,
};

const labelSx = {
  boxSizing: 'border-box',
  width: 76,
  minWidth: 76,
  height: 24,
  flexShrink: 0,
  justifyContent: 'center',
  borderRadius: 12,
  '& .MuiChip-icon': {
    fontSize: 14,
    margin: 0,
    marginRight: '4px',
  },
  '& .MuiChip-label': {
    px: 0.5,
    py: 0,
    whiteSpace: 'nowrap',
  },
};

interface TodoLabelsProps {
  type: TodoType;
  priority: TodoPriority;
}

export default function TodoLabels({ type, priority }: TodoLabelsProps) {
  return (
    <Stack direction="row" spacing={1.75} sx={{ minWidth: 0 }}>
      <Chip
        size="small"
        label={type}
        icon={typeIcons[type]}
        variant="outlined"
        sx={{
          ...labelSx,
          backgroundColor: typeColors[type],
        }}
      />
      <Chip
        size="small"
        label={priority}
        icon={priorityIcons[priority]}
        color={priorityColors[priority]}
        sx={labelSx}
      />
    </Stack>
  );
}
