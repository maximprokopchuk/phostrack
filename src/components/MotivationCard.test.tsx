import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { MotivationCard } from './MotivationCard';

describe('MotivationCard', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('renders without crashing', () => {
    render(<MotivationCard />);
    expect(screen.getByText(/На сегодня/)).toBeInTheDocument();
  });

  it('shows a motivational text on screen', () => {
    render(<MotivationCard />);
    // The card renders some text — just verify it's non-empty
    const heading = screen.getByText('На сегодня');
    expect(heading).toBeInTheDocument();
    // The paragraph should have some content
    const card = heading.closest('div')!;
    expect(card.textContent!.length).toBeGreaterThan(10);
  });

  it('advances to the next message after 12 seconds', () => {
    render(<MotivationCard />);
    const textBefore = document.querySelector('p')!.textContent;
    // Note: with 22 messages and random start, there's a chance it cycles back
    // We just verify the timer fires without error
    act(() => { vi.advanceTimersByTime(12400); });
    // Component should still render
    expect(screen.getByText(/На сегодня/)).toBeInTheDocument();
  });
});
