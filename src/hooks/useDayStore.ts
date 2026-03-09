import { useState, useEffect, useMemo } from 'react';
import { FoodItem, DailyStats, PhosphateEstimate, DayRecord, DialysisExchange, DailyVitals, MetricLimits } from '../types';
import { STORAGE_KEYS } from '../constants';
import { startOfDay, format } from 'date-fns';

export function useDayStore(metricLimits: MetricLimits) {
  const [dayStart, setDayStart] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DAY_START);
    return saved ? parseInt(saved, 10) : startOfDay(new Date()).getTime();
  });

  const [logs, setLogs] = useState<FoodItem[]>([]);

  const [dayHistory, setDayHistory] = useState<DayRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DAY_HISTORY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const savedLogs = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (savedLogs) {
      try {
        const parsed = JSON.parse(savedLogs);
        setLogs(parsed.filter((log: FoodItem) => log.timestamp >= dayStart));
      } catch (e) {
        console.error('Failed to load logs', e);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DAY_START, String(dayStart));
  }, [dayStart]);

  const stats: DailyStats = useMemo(() => {
    const phosphorLimit = metricLimits.phosphorus ?? 800;
    const totalMg = logs.reduce((sum, item) => sum + item.phosphateMg, 0);
    return {
      totalMg,
      limitMg: phosphorLimit,
      remainingMg: Math.max(0, phosphorLimit - totalMg),
      percentage: (totalMg / phosphorLimit) * 100,
      totalCalories: logs.reduce((sum, item) => sum + (item.calories || 0), 0),
      calorieLimit: metricLimits.calories ?? 2000,
      totalProtein: logs.reduce((sum, item) => sum + (item.proteinG || 0), 0),
      totalFat: logs.reduce((sum, item) => sum + (item.fatG || 0), 0),
      totalCarbs: logs.reduce((sum, item) => sum + (item.carbsG || 0), 0),
      totalPotassium: logs.reduce((sum, item) => sum + (item.potassiumMg || 0), 0),
      totalMagnesium: logs.reduce((sum, item) => sum + (item.magnesiumMg || 0), 0),
      totalSodium: logs.reduce((sum, item) => sum + (item.sodiumMg || 0), 0),
    };
  }, [logs, metricLimits]);

  const addFood = (estimate: PhosphateEstimate) => {
    const newItem: FoodItem = {
      id: crypto.randomUUID(),
      name: estimate.foodName,
      phosphateMg: estimate.phosphateMg,
      calories: estimate.calories,
      proteinG: estimate.proteinG,
      fatG: estimate.fatG,
      carbsG: estimate.carbsG,
      potassiumMg: estimate.potassiumMg,
      magnesiumMg: estimate.magnesiumMg,
      sodiumMg: estimate.sodiumMg,
      amountGrams: 0,
      timestamp: Date.now(),
    };
    setLogs(prev => [newItem, ...prev]);
  };

  const deleteFood = (id: string) => {
    setLogs(prev => prev.filter(item => item.id !== id));
  };

  const closeDay = () => {
    const now = Date.now();

    let dayLogs: FoodItem[] = [];
    try {
      const rawLogs = localStorage.getItem(STORAGE_KEYS.LOGS);
      if (rawLogs) {
        const allLogs: FoodItem[] = JSON.parse(rawLogs);
        dayLogs = allLogs.filter(l => l.timestamp >= dayStart && l.timestamp < now);
      }
    } catch { /* ignore */ }

    let dayExchanges: DialysisExchange[] = [];
    try {
      const rawExchanges = localStorage.getItem(STORAGE_KEYS.EXCHANGES);
      if (rawExchanges) {
        const allExchanges: DialysisExchange[] = JSON.parse(rawExchanges);
        dayExchanges = allExchanges.filter(e => e.timestamp >= dayStart && e.timestamp < now);
      }
    } catch { /* ignore */ }

    let dayVitals: DailyVitals | null = null;
    try {
      const rawVitals = localStorage.getItem(STORAGE_KEYS.VITALS);
      if (rawVitals) {
        const allVitals: DailyVitals[] = JSON.parse(rawVitals);
        const dayDateStr = format(dayStart, 'yyyy-MM-dd');
        dayVitals = allVitals.find(v => v.date === dayDateStr) ?? null;
      }
    } catch { /* ignore */ }

    const record: DayRecord = {
      id: crypto.randomUUID(),
      dayStart,
      dayEnd: now,
      logs: dayLogs,
      exchanges: dayExchanges,
      vitals: dayVitals,
      totalPhosphateMg: dayLogs.reduce((s, l) => s + l.phosphateMg, 0),
      totalCalories: dayLogs.reduce((s, l) => s + (l.calories || 0), 0),
      totalUF: dayExchanges.reduce((s, e) => s + e.uf, 0),
    };

    const updatedHistory = [record, ...dayHistory];
    localStorage.setItem(STORAGE_KEYS.DAY_HISTORY, JSON.stringify(updatedHistory));
    setDayHistory(updatedHistory);
    setDayStart(now);
    setLogs([]);
  };

  return { logs, stats, dayStart, dayHistory, addFood, deleteFood, closeDay };
}
