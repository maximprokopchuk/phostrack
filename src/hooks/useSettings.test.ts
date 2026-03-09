import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSettings } from './useSettings';

describe('useSettings', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('returns default limits when nothing in localStorage', () => {
    const { result } = renderHook(() => useSettings());
    expect(result.current.metricLimits.phosphorus).toBe(800);
    expect(result.current.metricLimits.calories).toBe(2000);
  });

  it('reads saved metricLimits from localStorage', () => {
    localStorage.setItem('phostrack_metric_limits', JSON.stringify({ phosphorus: 600, calories: 1800 }));
    const { result } = renderHook(() => useSettings());
    expect(result.current.metricLimits.phosphorus).toBe(600);
    expect(result.current.metricLimits.calories).toBe(1800);
  });

  it('defaults primaryMetric to calories', () => {
    const { result } = renderHook(() => useSettings());
    expect(result.current.primaryMetric).toBe('calories');
  });

  it('reads primaryMetric from localStorage', () => {
    localStorage.setItem('phostrack_primary_metric', 'phosphorus');
    const { result } = renderHook(() => useSettings());
    expect(result.current.primaryMetric).toBe('phosphorus');
  });

  it('setPrimaryMetric updates state and persists to localStorage', () => {
    const { result } = renderHook(() => useSettings());
    act(() => {
      result.current.setPrimaryMetric('protein');
    });
    expect(result.current.primaryMetric).toBe('protein');
    expect(localStorage.getItem('phostrack_primary_metric')).toBe('protein');
  });

  it('setMetricLimits persists to localStorage', () => {
    const { result } = renderHook(() => useSettings());
    act(() => {
      result.current.setMetricLimits({ phosphorus: 700 });
    });
    expect(JSON.parse(localStorage.getItem('phostrack_metric_limits')!)).toEqual({ phosphorus: 700 });
  });
});
