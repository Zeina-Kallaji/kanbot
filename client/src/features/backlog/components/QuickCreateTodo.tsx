// client/src/features/backlog/components/QuickCreateTodo.tsx

import { useRef, useState } from 'react';

import {
  InputAdornment,
  TextField,
} from '@mui/material';

import { AddOutlined } from '@mui/icons-material';
import type { KeyboardEvent } from 'react';

interface QuickCreateTodoProps {
  onCreate: (title: string) => Promise<void>;
  isCreating?: boolean;
}

export default function QuickCreateTodo({
  onCreate,
  isCreating = false,
}: QuickCreateTodoProps) {
  const [title, setTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleCreate() {
    const trimmedTitle = title.trim();

    if (!trimmedTitle || isCreating) return;

    try {
      await onCreate(trimmedTitle);

      setTitle('');

      // Keep focus for creating the next todo.
      inputRef.current?.focus();
    } catch {
      // The parent component is responsible for showing the error.
    }
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === 'Enter') {
      event.preventDefault();
      void handleCreate();
    }

    if (event.key === 'Escape') {
      setTitle('');
      inputRef.current?.blur();
    }
  }

  return (
    <TextField
      fullWidth
      inputRef={inputRef}
      value={title}
      onChange={(event) => setTitle(event.target.value)}
      onKeyDown={handleKeyDown}
      disabled={isCreating}
      placeholder="Type a title and press Enter"
      size="medium"
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <AddOutlined color="action" />
            </InputAdornment>
          ),
        },
      }}
      sx={{
        mt: 2,
        '& .MuiOutlinedInput-root': {
          borderRadius: 2,
          bgcolor: 'background.paper',
        },
      }}
    />
  );
}