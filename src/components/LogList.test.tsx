import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LogList } from './LogList';
import { FoodItem } from '../types';

const items: FoodItem[] = [
  {
    id: 'abc123', name: 'Гречка', phosphateMg: 150, calories: 330,
    proteinG: 12, fatG: 3, carbsG: 65, potassiumMg: 460,
    magnesiumMg: 200, sodiumMg: 5, amountGrams: 200, timestamp: Date.now(),
  },
];

describe('LogList', () => {
  it('shows empty state when no items', () => {
    render(<LogList items={[]} onDelete={vi.fn()} primaryMetric="calories" />);
    expect(screen.getByText(/ничего/i)).toBeInTheDocument();
  });

  it('renders food item name', () => {
    render(<LogList items={items} onDelete={vi.fn()} primaryMetric="calories" />);
    expect(screen.getByText('Гречка')).toBeInTheDocument();
  });

  it('calls onDelete with item id when delete clicked', () => {
    const onDelete = vi.fn();
    render(<LogList items={items} onDelete={onDelete} primaryMetric="calories" />);
    const deleteBtn = screen.getByRole('button', { name: /удалить/i });
    fireEvent.click(deleteBtn);
    expect(onDelete).toHaveBeenCalledWith('abc123');
  });
});
