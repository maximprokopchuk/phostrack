import { describe, it, expect } from 'vitest';
import { METRICS, metricByKey } from './metrics';
import { DailyStats, FoodItem } from './types';

const mockStats: DailyStats = {
  totalMg: 500, limitMg: 800, remainingMg: 300, percentage: 62.5,
  totalCalories: 1500, calorieLimit: 2000,
  totalProtein: 80, totalFat: 50, totalCarbs: 200,
  totalPotassium: 1800, totalMagnesium: 250, totalSodium: 1200,
};

const mockItem: FoodItem = {
  id: '1', name: 'Test', phosphateMg: 100, calories: 200,
  proteinG: 15, fatG: 8, carbsG: 30, potassiumMg: 300,
  magnesiumMg: 40, sodiumMg: 150, amountGrams: 150, timestamp: Date.now(),
};

describe('METRICS', () => {
  it('has exactly 8 metrics', () => {
    expect(METRICS).toHaveLength(8);
  });

  it('each metric has required display properties', () => {
    for (const m of METRICS) {
      expect(m.key).toBeTruthy();
      expect(m.label).toBeTruthy();
      expect(m.unit).toBeTruthy();
      expect(m.barClass).toBeTruthy();
      expect(m.textClass).toBeTruthy();
      expect(m.activeClass).toBeTruthy();
    }
  });

  it('getStatsValue returns correct field for each metric', () => {
    expect(metricByKey.phosphorus.getStatsValue(mockStats)).toBe(500);
    expect(metricByKey.calories.getStatsValue(mockStats)).toBe(1500);
    expect(metricByKey.protein.getStatsValue(mockStats)).toBe(80);
    expect(metricByKey.fat.getStatsValue(mockStats)).toBe(50);
    expect(metricByKey.carbs.getStatsValue(mockStats)).toBe(200);
    expect(metricByKey.potassium.getStatsValue(mockStats)).toBe(1800);
    expect(metricByKey.magnesium.getStatsValue(mockStats)).toBe(250);
    expect(metricByKey.sodium.getStatsValue(mockStats)).toBe(1200);
  });

  it('getItemValue returns correct field for each metric', () => {
    expect(metricByKey.phosphorus.getItemValue(mockItem)).toBe(100);
    expect(metricByKey.calories.getItemValue(mockItem)).toBe(200);
    expect(metricByKey.protein.getItemValue(mockItem)).toBe(15);
    expect(metricByKey.fat.getItemValue(mockItem)).toBe(8);
    expect(metricByKey.carbs.getItemValue(mockItem)).toBe(30);
    expect(metricByKey.potassium.getItemValue(mockItem)).toBe(300);
    expect(metricByKey.magnesium.getItemValue(mockItem)).toBe(40);
    expect(metricByKey.sodium.getItemValue(mockItem)).toBe(150);
  });
});

describe('metricByKey', () => {
  it('contains all 8 metric keys', () => {
    const keys = ['calories', 'phosphorus', 'protein', 'fat', 'carbs', 'potassium', 'sodium', 'magnesium'];
    for (const key of keys) {
      expect(metricByKey).toHaveProperty(key);
    }
  });
});
