import { useNavigate, useParams } from 'react-router-dom';

import {
  FormControl,
  Select,
  MenuItem,
  Typography,
} from '@mui/material';

import { useProjects } from '../../hooks/projects/useProjects';

export default function ProjectSwitcher() {
  const navigate = useNavigate();
  const { projectId } = useParams();

  const { data, isLoading } = useProjects();

  const projects = data?.projects ?? [];

  return (
    <FormControl fullWidth size="small">
      <Select
        value={projectId ?? ''}
        displayEmpty
        disabled={isLoading || projects.length === 0}
        onChange={(event) => {
          const selectedId = event.target.value;

          navigate(`/projects/${selectedId}/backlog`);
        }}
        renderValue={(selected) => {
          const selectedProject = projects.find(
            (project) => project.id === selected,
          );

          return selectedProject ? (
            selectedProject.name
          ) : (
            <Typography color="text.secondary">
              Select a project
            </Typography>
          );
        }}
      >
        {projects.map((project) => (
          <MenuItem key={project.id} value={project.id}>
            {project.name} ({project.key})
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}