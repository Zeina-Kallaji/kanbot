import { useEffect, useState } from 'react';

const ACTIVE_PROJECT_KEY = 'kanbot_active_project';

export function useProjectSelection() {
  const [activeProjectId, setActiveProjectId] = useState<string | null>(
    () => localStorage.getItem(ACTIVE_PROJECT_KEY)
  );

  useEffect(() => {
    if (activeProjectId) {
      localStorage.setItem(ACTIVE_PROJECT_KEY, activeProjectId);
    } else {
      localStorage.removeItem(ACTIVE_PROJECT_KEY);
    }
  }, [activeProjectId]);

  function selectProject(projectId: string) {
    setActiveProjectId(projectId);
  }

  function clearSelection() {
    setActiveProjectId(null);
  }

  return {
    activeProjectId,
    selectProject,
    clearSelection,
  };
}