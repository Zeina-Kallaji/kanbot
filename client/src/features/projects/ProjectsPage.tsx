import { useState } from 'react';
import { Box, Container, Typography, Button, TextField, InputAdornment } from '@mui/material';
import { Add, FolderOpen, Search } from '@mui/icons-material';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorState from '../../components/ErrorState';
import ProjectCard from '../../hooks/projects/ProjectCard';
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
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: 3,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h1" sx={{ fontSize: '1.875rem', fontWeight: 600 }}>
                Projects
              </Typography>
              {hasProjects && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {projects.length} {projects.length === 1 ? 'project' : 'projects'}
                </Typography>
              )}
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreateClick}
              sx={{ borderRadius: 2 }}
            >
              New Project
            </Button>
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