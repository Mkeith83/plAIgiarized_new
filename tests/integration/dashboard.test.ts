import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TeacherDashboard } from '@/app/components/dashboard/TeacherDashboard';
import { StudentDashboard } from '@/app/components/dashboard/StudentDashboard';

describe('Dashboard Integration', () => {
  describe('TeacherDashboard', () => {
    it('should load and display teacher dashboard', async () => {
      render(<TeacherDashboard teacherId="test-teacher" />);

      await waitFor(() => {
        expect(screen.getByText('Class Metrics')).toBeInTheDocument();
        expect(screen.getByText('Student Progress')).toBeInTheDocument();
      });
    });

    it('should handle alerts interaction', async () => {
      render(<TeacherDashboard teacherId="test-teacher" />);

      await waitFor(() => {
        const alerts = screen.getAllByRole('alert');
        expect(alerts.length).toBeGreaterThan(0);
      });

      const alert = screen.getAllByRole('alert')[0];
      fireEvent.click(alert);

      expect(screen.getByText(/Student Details/i)).toBeInTheDocument();
    });
  });

  describe('StudentDashboard', () => {
    it('should load and display student dashboard', async () => {
      render(<StudentDashboard studentId="test-student" />);

      await waitFor(() => {
        expect(screen.getByText('Progress Overview')).toBeInTheDocument();
        expect(screen.getByText('Recent Essays')).toBeInTheDocument();
      });
    });

    it('should display recommendations', async () => {
      render(<StudentDashboard studentId="test-student" />);

      await waitFor(() => {
        const recommendations = screen.getAllByRole('article');
        expect(recommendations.length).toBeGreaterThan(0);
      });
    });
  });
});
