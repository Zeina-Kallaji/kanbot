import { useNavigate, useParams } from 'react-router-dom';

import {
  Box,
  Typography,
  Button,
  Divider,
  Stack,
} from '@mui/material';

import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import ViewKanbanOutlinedIcon from '@mui/icons-material/ViewKanbanOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';

import ProjectSwitcher from './ProjectSwitcher';
import { useContext } from 'react';
import { AuthContext } from '../../features/auth/AuthContext';


export default function Sidebar() {
  const navigate = useNavigate();
  const { projectId } = useParams();

  const auth = useContext(AuthContext);

  const navItems = [
    {
      label: 'Backlog',
      path: 'backlog',
      icon: <DashboardOutlinedIcon />,
    },
    {
      label: 'Board',
      path: 'board',
      icon: <ViewKanbanOutlinedIcon />,
    },
    {
      label: 'Sprints',
      path: 'sprints',
      icon: <CalendarMonthOutlinedIcon />,
    },
  ];

  return (
    <Box
      component="aside"
      sx={{
        width: 240,
        flexShrink: 0,
        minHeight: '100vh',
        bgcolor: 'background.paper',
        borderRight: '1px solid',
        borderColor: 'divider',
        p: 2.5,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 4 }}>
        Kanbot
      </Typography>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mb: 1 }}
      >
        WORKSPACE
      </Typography>

      <ProjectSwitcher />

      <Button
        startIcon={<FolderOutlinedIcon />}
        sx={{ justifyContent: 'flex-start', mt: 2, mb: 2 }}
        onClick={() => navigate('/projects')}
      >
        All Projects
      </Button>

      <Divider sx={{ mb: 2 }} />

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mb: 1 }}
      >
        PROJECT
      </Typography>

      <Stack spacing={0.5}>
        {navItems.map((item) => (
          <Button
            key={item.path}
            fullWidth
            disabled={!projectId}
            startIcon={item.icon}
            onClick={() =>
              navigate(`/projects/${projectId}/${item.path}`)
            }
            sx={{
              justifyContent: 'flex-start',
              color: 'text.secondary',
            }}
          >
            {item.label}
          </Button>
        ))}
      </Stack>

      <Box sx={{ flex: 1 }} />

      <Divider sx={{ mb: 2 }} />

      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {auth?.user?.name ?? 'User'}
      </Typography>

      <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
        {auth?.user?.email ?? ''}
      </Typography>

      <Button
        color="inherit"
        startIcon={<LogoutOutlinedIcon />}
        onClick={() => auth?.logout()}
        sx={{ justifyContent: 'flex-start' }}
      >
        Log out
      </Button>
    </Box>
  );
}