import { useState } from 'react';
import { Box } from '@mui/material';
import { Drawer } from '@mui/material';
import { Typography } from '@mui/material';

import { Outlet } from 'react-router-dom';

import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function AppShell() {
  const [aiOpen, setAiOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />

      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <TopBar onAskAI={() => setAiOpen(true)} />

        <Box sx={{ p: { xs: 2, md: 4 }, flex: 1 }}>
          <Outlet />
        </Box>
      </Box>

     <Drawer
  anchor="right"
  open={aiOpen}
  onClose={() => setAiOpen(false)}
>
  <Box sx={{ width: 360, p: 3 }}>
    <Typography variant="h6">
      AI Assistant
    </Typography>

    <Typography color="text.secondary" sx={{ mt: 1 }}>
      The AI assistant will be available soon.
    </Typography>
  </Box>
</Drawer>
    </Box>
  );
}