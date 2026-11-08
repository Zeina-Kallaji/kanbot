import { useState } from 'react';
import { Box, Container, Typography, Button, TextField, InputAdornment } from '@mui/material';
import { Add, FolderCopy, FolderOpen, Search } from '@mui/icons-material';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorState from '../../components/ErrorState';
import {
  pageHeaderButtonSx,
  pageHeaderContentSx,
  pageHeaderIconSx,
  pageHeaderSx,
  pageHeaderTitleSx,
} from '../../components/layout/pageHeaderStyles';
import ProjectCard from '../../hooks/projects/ProjectCard';
import ThemeToggle from '../../components/ThemeToggle';
import { ProjectFormDialog } from '../../hooks/projects/ProjectFormDialog';
import { useProjects } from '../../hooks/projects/useProjects';

/**
 * ProjectsPage Component
 * 
 * Main landing page showing list of user projects.
 * Displays empty state when no projects exist, or a grid of project cards.
 */
export default function ProjectsPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data, isLoading, error } = useProjects();
  
  const projects = data?.projects ?? [];
  const hasProjects = projects.length > 0;

  // Filter projects by search query
  const filteredProjects = projects.filter((project) => {
    const query = searchQuery.toLowerCase();
    return (
      project.name.toLowerCase().includes(query) ||
      project.key.toLowerCase().includes(query) ||
      project.description.toLowerCase().includes(query)
    );
  });

  const handleCreateClick = () => {
    setCreateDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <LoadingSpinner />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <ErrorState
            title="Failed to load projects"
            message={error instanceof Error ? error.message : 'Something went wrong'}
          />
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box sx={pageHeaderSx}>
        <Container maxWidth="lg">
          <Box sx={pageHeaderContentSx}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <FolderCopy sx={pageHeaderIconSx} />
                <Typography variant="h1" sx={pageHeaderTitleSx}>
                  Projects
                </Typography>
              </Box>
              {hasProjects && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5, fontSize: '0.875rem' }}
                >
                  {projects.length} {projects.length === 1 ? 'project' : 'projects'}
                </Typography>
              )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ThemeToggle
                variant="onHeader"
                sx={{ display: { xs: 'none', md: 'inline-flex' } }}
              />
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreateClick}
                sx={pageHeaderButtonSx}
              >
                New Project
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Content */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {!hasProjects ? (
          <EmptyState
            icon={<FolderOpen sx={{ fontSize: 64 }} />}
            title="No projects yet"
            description="Create your first project to start organizing your work with sprints and todos."
            action={
              <Button variant="contained" startIcon={<Add />} onClick={handleCreateClick}>
                Create your first project
              </Button>
            }
          />
        ) : (
          <>
            {/* Search Bar */}
            <Box sx={{ mb: 4 }}>
              <TextField
                fullWidth
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ maxWidth: 500 }}
              />
            </Box>

            {/* Projects Grid */}
            {filteredProjects.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary">
                  No projects match your search
                </Typography>
              </Box>
            ) : (
              <Box 
                sx={{ 
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(3, 1fr)',
                  },
                  gap: 3,
                }}
              >
                {filteredProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </Box>
            )}
          </>
        )}
      </Container>

      {/* Create Project Dialog */}
      <ProjectFormDialog
        open={createDialogOpen}
        project={null}
        onClose={() => setCreateDialogOpen(false)}
      />
    </Box>
  );
}