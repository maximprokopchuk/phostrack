import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Dashboard } from './Dashboard';
import { DailyStats } from '../types';

const stats: DailyStats = {
  totalMg: 450, limitMg: 800, remainingMg: 350, percentage: 56.25,
  totalCalories: 1200, calorieLimit: 2000,
  totalProtein: 60, totalFat: 40, totalCarbs: 150,
  totalPotassium: 1500, totalMagnesium: 200, totalSodium: 900,
};

describe('Dashboard', () => {
  it('renders the primary metric value', () => {
    render(<Dashboard stats={stats} primaryMetric="calories" metricLimits={{ calories: 2000 }} />);
    expect(screen.getByText('1200')).toBeInTheDocument();
  });

  it('shows limit text when limit is set', () => {
    render(<Dashboard stats={stats} primaryMetric="calories" metricLimits={{ calories: 2000 }} />);
    expect(screen.getByText(/Лимит/)).toBeInTheDocument();
  });

  it('does not show limit text when no limit configured', () => {
    render(<Dashboard stats={stats} primaryMetric="calories" metricLimits={{}} />);
    expect(screen.queryByText(/Лимит/)).not.toBeInTheDocument();
  });

  it('expands details when toggle button clicked', () => {
    render(<Dashboard stats={stats} primaryMetric="calories" metricLimits={{}} />);
    const btn = screen.getByText(/Показать детали/);
    fireEvent.click(btn);
    expect(screen.getByText('КБЖУ')).toBeInTheDocument();
  });
});
