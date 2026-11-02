import { useLocation } from 'react-router-dom';

import {
  Box,
  Typography,
  Button,
  Divider,
} from '@mui/material';

import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';

interface Props {
  onAskAI: () => void;
}

export default function TopBar({ onAskAI }: Props) {
  const location = useLocation();

  const getPageTitle = () => {
    if (location.pathname.includes('/backlog')) return 'Backlog';
    if (location.pathname.includes('/board')) return 'Board';
    if (location.pathname.includes('/sprints')) return 'Sprints';

    return 'Projects';
  };

  return (
    <Box>
      <Box
        sx={{
          height: 64,
          px: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h6">
          {getPageTitle()}
        </Typography>

        <Button
          variant="outlined"
          startIcon={<AutoAwesomeOutlinedIcon />}
          onClick={onAskAI}
        >
          Ask AI
        </Button>
      </Box>

      <Divider />
    </Box>
  );
}