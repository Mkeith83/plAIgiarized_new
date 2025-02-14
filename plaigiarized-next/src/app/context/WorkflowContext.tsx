'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface WorkflowState {
  currentStep: number;
  steps: string[];
  isComplete: boolean;
}

interface WorkflowContextType {
  workflow: WorkflowState;
  nextStep: () => void;
  prevStep: () => void;
  setStep: (step: number) => void;
  completeWorkflow: () => void;
  resetWorkflow: () => void;
}

const WorkflowContext = createContext<WorkflowContextType | null>(null);

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const [workflow, setWorkflow] = useState<WorkflowState>({
    currentStep: 0,
    steps: ['upload', 'analyze', 'review', 'submit'],
    isComplete: false
  });

  const nextStep = () => {
    setWorkflow(prev => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, prev.steps.length - 1)
    }));
  };

  const prevStep = () => {
    setWorkflow(prev => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 0)
    }));
  };

  const setStep = (step: number) => {
    setWorkflow(prev => ({
      ...prev,
      currentStep: Math.max(0, Math.min(step, prev.steps.length - 1))
    }));
  };

  const completeWorkflow = () => {
    setWorkflow(prev => ({
      ...prev,
      isComplete: true
    }));
  };

  const resetWorkflow = () => {
    setWorkflow({
      currentStep: 0,
      steps: ['upload', 'analyze', 'review', 'submit'],
      isComplete: false
    });
  };

  return (
    <WorkflowContext.Provider value={{
      workflow,
      nextStep,
      prevStep,
      setStep,
      completeWorkflow,
      resetWorkflow
    }}>
      {children}
    </WorkflowContext.Provider>
  );
}

export function useWorkflow() {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
} 