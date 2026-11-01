import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Avatar, Typography, IconButton, Menu, MenuItem, Divider } from '@mui/material';
import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  ViewKanban, 
  FolderOpen, 
  CalendarMonth, 
  Dashboard as DashboardIcon,
  SmartToy,
  Settings as SettingsIcon,
  Logout,
  ExpandMore
} from '@mui/icons-material';
import { useAuth } from '../features/auth/AuthContext';

const SIDEBAR_WIDTH = 240;

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

const navItems: NavItem[] = [
  { label: 'Backlog', icon: <FolderOpen />, path: '/projects/:id/backlog' },
  { label: 'Active Sprint', icon: <ViewKanban />, path: '/projects/:id/board' },
  { label: 'Sprints', icon: <CalendarMonth />, path: '/projects/:id/sprints' },
  { label: 'Board', icon: <DashboardIcon />, path: '/projects/:id/board' },
  { label: 'AI Assistant', icon: <SmartToy />, path: '/projects/:id/ai' },
  { label: 'Settings', icon: <SettingsIcon />, path: '/projects/:id/settings' },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  const isActive = (path: string) => {
    const pathPart = path.split('/:id/')[1] || '';
    return location.pathname.includes(pathPart);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: SIDEBAR_WIDTH,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Logo */}
          <Box 
            sx={{ 
              p: 3, 
              display: 'flex', 
              alignItems: 'center',
              gap: 1.5,
              cursor: 'pointer',
            }}
            onClick={() => navigate('/projects')}
          >
            <Box
              component="img"
              src="/kanbot-icon.svg"
              alt="Kanbot"
              sx={{ width: 32, height: 32 }}
            />
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 700,
                fontSize: '1.25rem',
                color: 'primary.main',
              }}
            >
              Kanbot
            </Typography>
          </Box>

          <Divider />

          {/* Navigation */}
          <List sx={{ flex: 1, px: 2, py: 2 }}>
            {navItems.map((item) => (
              <ListItemButton
                key={item.label}
                selected={isActive(item.path)}
                onClick={() => {
                  console.log(`Navigate to ${item.label}`);
                }}
                sx={{
                  borderRadius: 1.5,
                  mb: 0.5,
                  '&.Mui-selected': {
                    bgcolor: '#EAF0FF',
                    color: 'primary.main',
                    '& .MuiListItemIcon-root': {
                      color: 'primary.main',
                    },
                    '&:hover': {
                      bgcolor: '#EAF0FF',
                    },
                  },
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label}
                  slotProps={{
                    primary: {
                      fontSize: '0.875rem',
                      fontWeight: 500,
                    } as any,
                  }}
                />
              </ListItemButton>
            ))}
          </List>

          <Divider />

          {/* User Account Section */}
          <Box sx={{ p: 2 }}>
            <Box
              onClick={handleMenuOpen}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1.5,
                borderRadius: 1.5,
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: 'primary.main',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
              >
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    color: 'text.primary',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user?.name || 'User'}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'block',
                  }}
                >
                  {user?.email || 'user@example.com'}
                </Typography>
              </Box>
              <IconButton size="small" sx={{ color: 'text.secondary' }}>
                <ExpandMore fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Drawer>

      {/* Account Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        slotProps={{
          paper: {
            sx: {
              width: 200,
              mt: -1,
            },
          },
        }}
      >
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          <ListItemText>Log out</ListItemText>
        </MenuItem>
      </Menu>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          minHeight: '100vh',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}