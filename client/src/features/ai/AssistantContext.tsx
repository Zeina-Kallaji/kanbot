import { createContext, useContext } from 'react';

interface AssistantActions {
  openAssistant: () => void;
  openGenerateTodos: () => void;
  openPlanSprint: () => void;
}

export const AssistantContext = createContext<AssistantActions>({
  openAssistant: () => undefined,
  openGenerateTodos: () => undefined,
  openPlanSprint: () => undefined,
});

export function useAssistantActions() {
  return useContext(AssistantContext);
}
