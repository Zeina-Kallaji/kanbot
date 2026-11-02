// client/src/features/backlog/components/TodoFilters.tsx

import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';

import type {
  TodoPriority,
  TodoType,
} from '../../../types/api';

interface TodoFiltersProps {
  search: string;
  priority: TodoPriority | '';
  type: TodoType | '';

  onSearchChange: (value: string) => void;
  onPriorityChange: (value: TodoPriority | '') => void;
  onTypeChange: (value: TodoType | '') => void;
}

export default function TodoFilters({
  search,
  priority,
  type,
  onSearchChange,
  onPriorityChange,
  onTypeChange,
}: TodoFiltersProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'minmax(200px, 2fr) 1fr 1fr',
        },
        gap: 2,
        mb: 3,
      }}
    >
      <TextField
        fullWidth
        size="small"
        placeholder="Search todos..."
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />

      <FormControl fullWidth size="small">
        <InputLabel>Priority</InputLabel>

        <Select
          label="Priority"
          value={priority}
          onChange={(event) =>
            onPriorityChange(event.target.value as TodoPriority | '')
          }
        >
          <MenuItem value="">All priorities</MenuItem>
          <MenuItem value="low">Low</MenuItem>
          <MenuItem value="medium">Medium</MenuItem>
          <MenuItem value="high">High</MenuItem>
          <MenuItem value="urgent">Urgent</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth size="small">
        <InputLabel>Type</InputLabel>

        <Select
          label="Type"
          value={type}
          onChange={(event) =>
            onTypeChange(event.target.value as TodoType | '')
          }
        >
          <MenuItem value="">All types</MenuItem>
          <MenuItem value="task">Task</MenuItem>
          <MenuItem value="story">Story</MenuItem>
          <MenuItem value="bug">Bug</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}