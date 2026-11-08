import {
  Alert,
  Avatar,
  Box,
  Button,
  Divider,
  Drawer,
  FormControl,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Select,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useRef, useState } from 'react';
import { Outlet, useNavigate, useLocation, useParams } from 'react-router-dom';
import { 
  ViewKanban, 
  FolderOpen, 
  CalendarMonth, 
  FolderCopy,
  SmartToy,
  Logout,
  ExpandMore,
  MenuOutlined,
} from '@mui/icons-material';
import { useAuth } from '../features/auth/AuthContext';
import { useProjects } from '../hooks/projects/useProjects';
import { colors } from '../theme/theme';
import TopBar from '../components/layout/TopBar';
import AssistantDrawer, { type AssistantDrawerHandle } from '../features/ai/AssistantDrawer';
import { AssistantContext } from '../features/ai/AssistantContext';

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
  { label: 'AI Assistant', icon: <SmartToy />, path: '/projects/:id/ai' },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = useParams<{ projectId: string }>();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const assistantRef = useRef<AssistantDrawerHandle>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const {
    data,
    isLoading: isProjectsLoading,
    isError: projectsFailed,
    refetch: refetchProjects,
  } = useProjects();
  const projects = data?.projects ?? [];
  const selectedProjectId = projects.some(
    (project) => project.id === projectId,
  )
    ? projectId
    : '';

  const navigateAndCloseSidebar = (path: string) => {
    navigate(path);
    setMobileSidebarOpen(false);
  };

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
    // Exact match for /projects
    if (path === '/projects') {
      return location.pathname === '/projects';
    }
    // For other paths, extract the route section and do exact match
    const pathPart = path.split('/:id/')[1];
    if (pathPart) {
      // Extract the corresponding part from the current location
      const locationParts = location.pathname.split('/');
      // Path structure: /projects/:id/:section
      const currentSection = locationParts[3]; // Index 3 is the section after /projects/:id/
      return currentSection === pathPart;
    }
    return false;
  };

  const openAssistant = () => setAssistantOpen(true);
  const openGenerateTodos = () => {
    assistantRef.current?.openGenerateTodos();
    setAssistantOpen(true);
  };
  const openPlanSprint = () => {
    assistantRef.current?.openPlanSprint();
    setAssistantOpen(true);
  };
  const mobileNavBeforePageHeader =
    isMobile &&
    (location.pathname.includes('/board') ||
      location.pathname.includes('/sprints'));
  const mobileNavigation = isMobile ? (
    <Box
      component="header"
      sx={{
        display: 'flex',
        alignItems: 'center',
        height: 56,
        px: 1,
        position: 'sticky',
        top: 0,
        zIndex: (t) => t.zIndex.appBar,
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <IconButton
        aria-label="Open navigation"
        onClick={() => setMobileSidebarOpen(true)}
        sx={{ width: 44, height: 44 }}
      >
        <MenuOutlined />
      </IconButton>
      <Box
        component="img"
        src="/kanbot-logo.svg"
        alt="Kanbot"
        sx={{
          display: 'block',
          width: 104,
          maxWidth: 'calc(100vw - 80px)',
          height: 'auto',
          ml: 1,
        }}
      />
    </Box>
  ) : null;

  return (
    <AssistantContext.Provider
      value={{ openAssistant, openGenerateTodos, openPlanSprint }}
    >
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      {/* Sidebar */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileSidebarOpen : undefined}
        onClose={() => setMobileSidebarOpen(false)}
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          display: { xs: 'block', md: 'block' },
          '& .MuiDrawer-paper': {
            width: SIDEBAR_WIDTH,
            maxWidth: '85vw',
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
            onClick={() => navigateAndCloseSidebar('/projects')}
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

          <Box sx={{ px: 2, pb: 2 }}>
            <FormControl fullWidth size="small">
              <Select
                value={selectedProjectId}
                displayEmpty
                disabled={
                  isProjectsLoading ||
                  projectsFailed ||
                  projects.length === 0
                }
                inputProps={{ 'aria-label': 'Select project' }}
                onChange={(event) => {
                  const selectedId = event.target.value;
                  if (projects.some((project) => project.id === selectedId)) {
                    navigateAndCloseSidebar(`/projects/${selectedId}/backlog`);
                  }
                }}
                renderValue={(selected) => {
                  const selectedProject = projects.find(
                    (project) => project.id === selected,
                  );
                  if (selectedProject) {
                    return (
                      <Typography
                        variant="body2"
                        noWrap
                        title={selectedProject.name}
                      >
                        {selectedProject.name}
                      </Typography>
                    );
                  }

                  return (
                    <Typography variant="body2" noWrap color="text.secondary">
                      {isProjectsLoading
                        ? 'Loading projects...'
                        : projectsFailed
                          ? 'Projects unavailable'
                          : projects.length === 0
                            ? 'No projects yet'
                            : 'Select a project'}
                    </Typography>
                  );
                }}
                sx={{
                  '& .MuiSelect-select': {
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  },
                }}
              >
                {projects.map((project) => (
                  <MenuItem
                    key={project.id}
                    value={project.id}
                    title={project.name}
                  >
                    <Typography variant="body2" noWrap sx={{ minWidth: 0 }}>
                      {project.name} ({project.key})
                    </Typography>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ px: 3, pt: 1, pb: 0.5 }}
          >
            PROJECT
          </Typography>

          {/* Main project navigation */}
          <List sx={{ flex: '0 0 auto', px: 2, py: 0.5 }}>
            {navItems.map((item) => {
              const selected = isActive(item.path);
              const isProjectRoute = item.path.includes('/:id/');
              return (
                <ListItemButton
                  key={item.label}
                  selected={selected}
                  disabled={isProjectRoute && !projectId}
                  onClick={() => {
                    if (item.label === 'AI Assistant') {
                      openAssistant();
                      setMobileSidebarOpen(false);
                      return;
                    }
                    navigateAndCloseSidebar(item.path.replace(':id', projectId ?? ''));
                  }}
                  sx={{
                    borderRadius: 1.5,
                    mb: 0.5,
                    color: selected ? 'primary.main' : 'text.secondary',
                    bgcolor: 'transparent',
                    '&.Mui-selected': {
                      bgcolor: '#EAF0FF',
                      color: 'primary.main',
                      '& .MuiListItemIcon-root': {
                        color: 'primary.main',
                      },
                      '&:hover': {
                        bgcolor: '#E0E7FF',
                      },
                    },
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 40,
                      color: selected ? 'primary.main' : 'text.secondary',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    slotProps={{
                      primary: {
                        fontSize: '0.875rem',
                        fontWeight: selected ? 600 : 500,
                      } as unknown as object,
                    }}
                  />
                </ListItemButton>
              );
            })}
          </List>

          <Divider sx={{ mx: 2, my: 1.5 }} />

          <Box sx={{ px: 2, flex: 1, minHeight: 0, overflowY: 'auto' }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', px: 1, mb: 0.5 }}
            >
              PROJECTS
            </Typography>

            <ListItemButton
              selected={location.pathname === '/projects'}
              onClick={() => navigateAndCloseSidebar('/projects')}
              sx={{
                mt: 0.5,
                borderRadius: 1.5,
                '&.Mui-selected': {
                  bgcolor: colors.primary.soft,
                  color: 'primary.main',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <FolderCopy fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="All Projects"
                slotProps={{ primary: { sx: { fontSize: '0.875rem' } } }}
              />
            </ListItemButton>

            {projectsFailed ? (
              <Alert
                severity="error"
                action={
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => void refetchProjects()}
                  >
                    Retry
                  </Button>
                }
                sx={{ px: 1, py: 0, alignItems: 'center', fontSize: '0.75rem' }}
              >
                Projects could not be loaded.
              </Alert>
            ) : isProjectsLoading ? (
              <Typography variant="body2" color="text.secondary" sx={{ px: 1, py: 1 }}>
                Loading projects...
              </Typography>
            ) : projects.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ px: 1, py: 1 }}>
                No projects yet.
              </Typography>
            ) : (
              projects.map((project) => (
                <ListItemButton
                  key={project.id}
                  selected={project.id === projectId}
                  onClick={() => navigateAndCloseSidebar(`/projects/${project.id}/backlog`)}
                  title={project.name}
                  sx={{
                    minWidth: 0,
                    px: 1.5,
                    py: 0.75,
                    borderRadius: 1.5,
                    '&.Mui-selected': {
                      bgcolor: colors.primary.soft,
                      color: 'primary.main',
                    },
                    '&.Mui-selected:hover': {
                      bgcolor: colors.primary.soft,
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 32,
                      color: project.id === projectId ? 'primary.main' : 'text.secondary',
                    }}
                  >
                    <FolderOpen fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={project.name}
                    slotProps={{
                      primary: {
                        noWrap: true,
                        sx: { fontSize: '0.875rem' },
                      },
                    }}
                  />
                </ListItemButton>
              ))
            )}
          </Box>

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
          minWidth: 0,
          bgcolor: 'background.default',
          minHeight: '100dvh',
        }}
      >
        {mobileNavBeforePageHeader && mobileNavigation}
        <TopBar onAskAI={openAssistant} disabled={!projectId} />
        {!mobileNavBeforePageHeader && mobileNavigation}
        <Outlet />
      </Box>
      <AssistantDrawer
        ref={assistantRef}
        key={projectId ?? 'no-project'}
        projectId={projectId ?? ''}
        open={assistantOpen}
        onClose={() => setAssistantOpen(false)}
      />
    </Box>
    </AssistantContext.Provider>
  );
}
