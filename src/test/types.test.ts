import { describe, it, expect } from 'vitest'
import type { FoodItem, PhosphateEstimate, DailyStats, DialysisExchange, DailyVitals } from '../types'

describe('FoodItem type', () => {
  it('has all required fields', () => {
    const item: FoodItem = {
      id: 'abc',
      name: 'Яйцо',
      phosphateMg: 95,
      calories: 78,
      proteinG: 6,
      fatG: 5,
      carbsG: 0.6,
      potassiumMg: 69,
      magnesiumMg: 6,
      sodiumMg: 71,
      amountGrams: 50,
      timestamp: Date.now(),
    }
    expect(item.id).toBe('abc')
    expect(item.phosphateMg).toBe(95)
    expect(typeof item.timestamp).toBe('number')
  })
})

describe('PhosphateEstimate type', () => {
  it('supports all confidence levels', () => {
    const low: PhosphateEstimate['confidence'] = 'low'
    const medium: PhosphateEstimate['confidence'] = 'medium'
    const high: PhosphateEstimate['confidence'] = 'high'
    expect(['low', 'medium', 'high']).toContain(low)
    expect(['low', 'medium', 'high']).toContain(medium)
    expect(['low', 'medium', 'high']).toContain(high)
  })

  it('has all nutritional fields', () => {
    const estimate: PhosphateEstimate = {
      foodName: 'Творог',
      phosphateMg: 150,
      calories: 120,
      proteinG: 14,
      fatG: 5,
      carbsG: 3,
      potassiumMg: 100,
      magnesiumMg: 15,
      sodiumMg: 40,
      confidence: 'high',
      explanation: 'Стандартная порция творога 100г',
    }
    expect(estimate.confidence).toBe('high')
    expect(estimate.phosphateMg).toBeGreaterThan(0)
  })
})

describe('DailyStats type', () => {
  it('has phosphorus tracking fields', () => {
    const stats: DailyStats = {
      totalMg: 400,
      limitMg: 800,
      remainingMg: 400,
      percentage: 50,
      totalCalories: 1000,
      calorieLimit: 2000,
      totalProtein: 60,
      totalFat: 40,
      totalCarbs: 100,
      totalPotassium: 800,
      totalMagnesium: 150,
      totalSodium: 1200,
    }
    expect(stats.percentage).toBe(50)
    expect(stats.remainingMg).toBe(stats.limitMg - stats.totalMg)
  })
})

describe('DialysisExchange type', () => {
  it('has volume and solution fields', () => {
    const exchange: DialysisExchange = {
      id: 'ex1',
      timestamp: Date.now(),
      fillVolume: 2000,
      drainVolume: 2300,
      uf: 300,
      solutionType: '1.5%',
    }
    expect(exchange.uf).toBe(exchange.drainVolume - exchange.fillVolume)
  })
})

describe('DailyVitals type', () => {
  it('has blood pressure and weight fields', () => {
    const vitals: DailyVitals = {
      id: 'v1',
      date: '2026-03-09',
      weight: 70.5,
      systolic: 120,
      diastolic: 80,
    }
    expect(vitals.systolic).toBeGreaterThan(vitals.diastolic)
  })
})
