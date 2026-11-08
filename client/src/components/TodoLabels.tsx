import type { ReactElement } from 'react';
import { Box, Chip, Stack, useTheme } from '@mui/material';
import {
  ArrowDownwardOutlined,
  ArrowUpwardOutlined,
  BugReportOutlined,
  CheckBoxOutlined,
  ErrorOutlineOutlined,
  MenuBookOutlined,
} from '@mui/icons-material';
import type { TodoPriority, TodoType } from '../types/api';

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
  const theme = useTheme();
  const priorityIcons: Record<TodoPriority, ReactElement> = {
    urgent: (
      <ErrorOutlineOutlined
        sx={{ color: theme.palette.custom.priorityUrgent }}
      />
    ),
    high: (
      <ArrowUpwardOutlined
        sx={{ color: theme.palette.custom.priorityHigh }}
      />
    ),
    medium: (
      <Box
        component="span"
        aria-hidden="true"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 14,
          height: 14,
          color: theme.palette.custom.priorityMedium,
          fontSize: 14,
          fontWeight: 800,
          lineHeight: 1,
        }}
      >
        =
      </Box>
    ),
    low: (
      <ArrowDownwardOutlined
        sx={{ color: theme.palette.custom.priorityLow }}
      />
    ),
  };
  const typeColors: Record<TodoType, string> = {
    task: theme.palette.custom.typeTaskBg,
    bug: theme.palette.custom.typeBugBg,
    story: theme.palette.custom.typeStoryBg,
  };
  const typeTextColors: Record<TodoType, string> = {
    task: theme.palette.custom.typeTaskText,
    bug: theme.palette.custom.typeBugText,
    story: theme.palette.custom.typeStoryText,
  };
  const typeBorderColors: Record<TodoType, string> = {
    task: theme.palette.custom.typeTaskBorder,
    bug: theme.palette.custom.typeBugBorder,
    story: theme.palette.custom.typeStoryBorder,
  };
  const typeIcons: Record<TodoType, ReactElement> = {
    task: (
      <CheckBoxOutlined sx={{ color: theme.palette.custom.typeTaskIcon }} />
    ),
    bug: <BugReportOutlined sx={{ color: theme.palette.custom.typeBugIcon }} />,
    story: (
      <MenuBookOutlined sx={{ color: theme.palette.custom.typeStoryIcon }} />
    ),
  };
  const priorityBackgroundColors: Record<TodoPriority, string> = {
    urgent: theme.palette.custom.priorityUrgentBg,
    high: theme.palette.custom.priorityHighBg,
    medium: theme.palette.custom.priorityMediumBg,
    low: theme.palette.custom.priorityLowBg,
  };
  const priorityTextColors: Record<TodoPriority, string> = {
    urgent: theme.palette.custom.priorityUrgentText,
    high: theme.palette.custom.priorityHighText,
    medium: theme.palette.custom.priorityMediumText,
    low: theme.palette.custom.priorityLowText,
  };
  const priorityBorderColors: Record<TodoPriority, string> = {
    urgent: theme.palette.custom.priorityUrgentBorder,
    high: theme.palette.custom.priorityHighBorder,
    medium: theme.palette.custom.priorityMediumBorder,
    low: theme.palette.custom.priorityLowBorder,
  };

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
          color: typeTextColors[type],
          borderColor: typeBorderColors[type],
        }}
      />
      <Chip
        size="small"
        label={priority}
        icon={priorityIcons[priority]}
        sx={{
          ...labelSx,
          backgroundColor: priorityBackgroundColors[priority],
          color: priorityTextColors[priority],
          ...(theme.palette.mode === 'dark' && { border: '1px solid' }),
          borderColor: priorityBorderColors[priority],
        }}
      />
    </Stack>
  );
}
