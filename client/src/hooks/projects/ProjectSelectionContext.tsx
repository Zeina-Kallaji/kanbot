/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

interface ProjectSelectionContextType {
  activeProjectId: string | null;
  selectProject: (projectId: string) => void;
  clearSelection: () => void;
}

const ProjectSelectionContext =
  createContext<ProjectSelectionContextType | undefined>(undefined);

const ACTIVE_PROJECT_KEY = 'kanbot_active_project';

interface Props {
  children: ReactNode;
}

export function ProjectSelectionProvider({ children }: Props) {
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

  return (
    <ProjectSelectionContext.Provider
      value={{
        activeProjectId,
        selectProject,
        clearSelection,
      }}
    >
      {children}
    </ProjectSelectionContext.Provider>
  );
}

export function useProjectSelection() {
  const context = useContext(ProjectSelectionContext);

  if (!context) {
    throw new Error(
      'useProjectSelection must be used within ProjectSelectionProvider'
    );
  }

  return context;
}