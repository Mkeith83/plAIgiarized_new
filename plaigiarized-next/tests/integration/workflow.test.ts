import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WorkflowProvider, useWorkflow } from '@/app/context/WorkflowContext';

const TestComponent = () => {
  const { workflow, nextStep, prevStep } = useWorkflow();
  return (
    <div>
      <span>Step {workflow.currentStep}</span>
      <button onClick={nextStep}>Next</button>
      <button onClick={prevStep}>Previous</button>
    </div>
  );
};

describe('Workflow Integration', () => {
  it('should manage workflow state', () => {
    render(
      <WorkflowProvider>
        <TestComponent />
      </WorkflowProvider>
    );

    expect(screen.getByText('Step 0')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('Step 1')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Previous'));
    expect(screen.getByText('Step 0')).toBeInTheDocument();
  });

  it('should handle workflow completion', async () => {
    const TestComplete = () => {
      const { workflow, completeWorkflow } = useWorkflow();
      return (
        <div>
          <span>Complete: {workflow.isComplete.toString()}</span>
          <button onClick={completeWorkflow}>Complete</button>
        </div>
      );
    };

    render(
      <WorkflowProvider>
        <TestComplete />
      </WorkflowProvider>
    );

    expect(screen.getByText('Complete: false')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Complete'));
    expect(screen.getByText('Complete: true')).toBeInTheDocument();
  });

  it('should reset workflow state', () => {
    const TestReset = () => {
      const { workflow, nextStep, resetWorkflow } = useWorkflow();
      return (
        <div>
          <span>Step {workflow.currentStep}</span>
          <button onClick={nextStep}>Next</button>
          <button onClick={resetWorkflow}>Reset</button>
        </div>
      );
    };

    render(
      <WorkflowProvider>
        <TestReset />
      </WorkflowProvider>
    );

    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('Step 1')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Reset'));
    expect(screen.getByText('Step 0')).toBeInTheDocument();
  });
}); 