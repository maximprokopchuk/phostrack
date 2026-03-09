import { useState, useEffect } from 'react';
import { PrimaryMetric, MetricLimits } from '../types';
import { STORAGE_KEYS } from '../constants';

export function useSettings() {
  const [metricLimits, setMetricLimits] = useState<MetricLimits>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.METRIC_LIMITS);
      if (saved) return JSON.parse(saved);
    } catch {}
    const oldPhosphor = localStorage.getItem('phostrack_limit');
    const oldCal = localStorage.getItem('phostrack_cal_limit');
    return {
      phosphorus: oldPhosphor ? parseInt(oldPhosphor, 10) : 800,
      calories: oldCal ? parseInt(oldCal, 10) : 2000,
    };
  });

  const [primaryMetric, setPrimaryMetricState] = useState<PrimaryMetric>(
    () => (localStorage.getItem(STORAGE_KEYS.PRIMARY_METRIC) as PrimaryMetric) ?? 'calories'
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.METRIC_LIMITS, JSON.stringify(metricLimits));
  }, [metricLimits]);

  const setPrimaryMetric = (m: PrimaryMetric) => {
    setPrimaryMetricState(m);
    localStorage.setItem(STORAGE_KEYS.PRIMARY_METRIC, m);
  };

  return { metricLimits, setMetricLimits, primaryMetric, setPrimaryMetric };
}
