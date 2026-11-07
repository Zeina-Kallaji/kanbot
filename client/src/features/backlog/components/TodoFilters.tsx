// client/src/features/backlog/components/TodoFilters.tsx

import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Stack,
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
    <Stack
      direction="row"
      sx={{
        gap: 1.5,
        flex: 1,
        minWidth: 0,
        flexWrap: { xs: 'wrap', md: 'nowrap' },
      }}
    >
      <TextField
        type="search"
        slotProps={{ htmlInput: { 'aria-label': 'Search todos' } }}
        sx={{ flex: { xs: '1 1 100%', md: 1 }, minWidth: { md: 200 } }}
        size="small"
        placeholder="Search todos..."
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />

      <FormControl sx={{ flex: { xs: '1 1 0', md: '0 0 auto' }, minWidth: { xs: 120, md: 150 } }} size="small">
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

      <FormControl sx={{ flex: { xs: '1 1 0', md: '0 0 auto' }, minWidth: { xs: 120, md: 130 } }} size="small">
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
    </Stack>
  );
}