import type { ProjectWithStats } from '../../../types/api';

export function filterProjects(
  projects: ProjectWithStats[],
  search: string
): ProjectWithStats[] {
  const normalizedSearch = search.trim().toLowerCase();

  if (!normalizedSearch) {
    return projects;
  }

  return projects.filter((project) => {
    return (
      project.name.toLowerCase().includes(normalizedSearch) ||
      project.key.toLowerCase().includes(normalizedSearch) ||
      project.description.toLowerCase().includes(normalizedSearch)
    );
  });
}

export function getProjectCount(
  projects: ProjectWithStats[]
): number {
  return projects.length;
}