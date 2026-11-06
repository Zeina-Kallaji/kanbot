import { useLocation } from 'react-router-dom';

import {
  Box,
  Typography,
  Button,
  Stack,
} from '@mui/material';

import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import FolderCopyIcon from '@mui/icons-material/FolderCopy';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import {
  pageHeaderButtonSx,
  pageHeaderIconSx,
  pageHeaderSx,
  pageHeaderTitleSx,
} from './pageHeaderStyles';

interface Props {
  onAskAI?: () => void;
  disabled?: boolean;
}

export default function TopBar({ onAskAI, disabled = false }: Props) {
  const location = useLocation();
  const isProjectsList = location.pathname === '/projects';
  const isBacklog = location.pathname.endsWith('/backlog');

  if (isProjectsList || isBacklog) return null;

  const getPageTitle = () => {
    if (location.pathname.includes('/backlog')) return 'Backlog';
    if (location.pathname.includes('/sprints')) return 'Sprints';
    if (location.pathname.includes('/board') || location.pathname.includes('/sprint')) return 'Active Sprint';

    return 'Projects';
  };

  const getPageIcon = () => {
    if (location.pathname.includes('/sprints')) {
      return <CalendarMonthIcon sx={pageHeaderIconSx} />;
    }
    if (location.pathname.includes('/board') || location.pathname.includes('/sprint')) {
      return <ViewKanbanIcon sx={pageHeaderIconSx} />;
    }
    return <FolderCopyIcon sx={pageHeaderIconSx} />;
  };

  return (
    <Box component="header" sx={pageHeaderSx}>
      <Box
        sx={{
          width: '100%',
          px: { xs: 2, sm: 3 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
          {getPageIcon()}
          <Typography variant="h1" sx={pageHeaderTitleSx}>
            {getPageTitle()}
          </Typography>
        </Stack>

        <Button
          variant="outlined"
          size="small"
          startIcon={<AutoAwesomeOutlinedIcon />}
          onClick={onAskAI}
          disabled={disabled}
          sx={{ ...pageHeaderButtonSx, minWidth: 0 }}
        >
          Ask AI
        </Button>
      </Box>
    </Box>
  );
}