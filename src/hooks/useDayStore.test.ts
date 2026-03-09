import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDayStore } from './useDayStore';
import { PhosphateEstimate } from '../types';

const mockEstimate: PhosphateEstimate = {
  foodName: 'Куриная грудка',
  phosphateMg: 200,
  calories: 165,
  proteinG: 31,
  fatG: 3.6,
  carbsG: 0,
  potassiumMg: 256,
  magnesiumMg: 29,
  sodiumMg: 74,
  confidence: 'high',
  explanation: 'test',
};

describe('useDayStore', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('starts with empty logs', () => {
    const { result } = renderHook(() => useDayStore({}));
    expect(result.current.logs).toHaveLength(0);
  });

  it('addFood adds an item to logs', () => {
    const { result } = renderHook(() => useDayStore({}));
    act(() => {
      result.current.addFood(mockEstimate);
    });
    expect(result.current.logs).toHaveLength(1);
    expect(result.current.logs[0].name).toBe('Куриная грудка');
    expect(result.current.logs[0].phosphateMg).toBe(200);
  });

  it('deleteFood removes item by id', () => {
    const { result } = renderHook(() => useDayStore({}));
    act(() => { result.current.addFood(mockEstimate); });
    const id = result.current.logs[0].id;
    act(() => { result.current.deleteFood(id); });
    expect(result.current.logs).toHaveLength(0);
  });

  it('stats.totalMg sums phosphorus', () => {
    const { result } = renderHook(() => useDayStore({}));
    act(() => { result.current.addFood(mockEstimate); });
    act(() => { result.current.addFood({ ...mockEstimate, phosphateMg: 100 }); });
    expect(result.current.stats.totalMg).toBe(300);
  });

  it('stats.totalCalories sums calories', () => {
    const { result } = renderHook(() => useDayStore({}));
    act(() => { result.current.addFood(mockEstimate); });
    expect(result.current.stats.totalCalories).toBe(165);
  });

  it('stats uses metricLimits for limitMg', () => {
    const { result } = renderHook(() => useDayStore({ phosphorus: 600 }));
    expect(result.current.stats.limitMg).toBe(600);
  });

  it('closeDay clears logs', () => {
    const { result } = renderHook(() => useDayStore({}));
    act(() => { result.current.addFood(mockEstimate); });
    expect(result.current.logs).toHaveLength(1);
    act(() => { result.current.closeDay(); });
    expect(result.current.logs).toHaveLength(0);
  });
});
