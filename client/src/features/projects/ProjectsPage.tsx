import { Box, Container, Typography, Button } from '@mui/material';
import { Add, FolderOpen } from '@mui/icons-material';
import EmptyState from '../../components/EmptyState';

/**
 * ProjectsPage Component
 * 
 * Main landing page showing list of user projects.
 * For Day 1, this is a placeholder with proper styling.
 * Will be fully implemented in Day 2.
 */
export default function ProjectsPage() {
  // Placeholder - will integrate with API in Day 2
  const hasProjects = false;

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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h1" sx={{ fontSize: '1.875rem', fontWeight: 600 }}>
              Projects
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              sx={{ borderRadius: 2 }}
            >
              New Project
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Content */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {!hasProjects && (
          <EmptyState
            icon={<FolderOpen sx={{ fontSize: 64 }} />}
            title="No projects yet"
            description="Create your first project to start organizing your work with sprints and todos."
            action={
              <Button variant="contained" startIcon={<Add />}>
                Create your first project
              </Button>
            }
          />
        )}
      </Container>
    </Box>
  );
}