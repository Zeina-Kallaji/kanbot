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
    if (location.pathname.includes('/sprints')) return 'Sprints';
    if (location.pathname.includes('/board') || location.pathname.includes('/sprint')) return 'Active Sprint';

    return 'Projects';
  };

  return (
    <Box>
      <Box
        sx={{
          height: 48,
          px: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
          {getPageTitle()}
        </Typography>

        <Button
          variant="outlined"
          size="small"
          startIcon={<AutoAwesomeOutlinedIcon />}
          onClick={onAskAI}
          sx={{ px: 1.25, py: 0.25, minWidth: 0, fontSize: 12 }}
        >
          Ask AI
        </Button>
      </Box>

      <Divider />
    </Box>
  );
}