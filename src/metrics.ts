import { PrimaryMetric, DailyStats, FoodItem, PhosphateEstimate } from './types';

export interface MetricConfig {
  key: PrimaryMetric;
  label: string;
  unit: string;
  activeClass: string;   // button active bg + text
  textClass: string;     // value text color
  barClass: string;      // progress bar color
  getStatsValue: (s: DailyStats) => number;
  getItemValue: (item: FoodItem) => number;
  getEstimateValue: (e: PhosphateEstimate) => number;
  round?: boolean;       // round to integer
  defaultLimit?: number; // suggested placeholder for limit input
}

export const METRICS: MetricConfig[] = [
  {
    key: 'calories',
    label: 'Калории',
    unit: 'ккал',
    activeClass: 'bg-amber-500 text-slate-950',
    textClass: 'text-amber-400',
    barClass: 'bg-amber-400',
    getStatsValue: s => s.totalCalories,
    getItemValue: i => i.calories,
    getEstimateValue: e => e.calories,
    round: true,
    defaultLimit: 2000,
  },
  {
    key: 'phosphorus',
    label: 'Фосфор',
    unit: 'мг',
    activeClass: 'bg-emerald-500 text-slate-950',
    textClass: 'text-emerald-400',
    barClass: 'bg-emerald-500',
    getStatsValue: s => s.totalMg,
    getItemValue: i => i.phosphateMg,
    getEstimateValue: e => e.phosphateMg,
    round: true,
    defaultLimit: 800,
  },
  {
    key: 'protein',
    label: 'Белки',
    unit: 'г',
    activeClass: 'bg-blue-500 text-slate-950',
    textClass: 'text-blue-400',
    barClass: 'bg-blue-500',
    getStatsValue: s => s.totalProtein,
    getItemValue: i => i.proteinG,
    getEstimateValue: e => e.proteinG,
    defaultLimit: 60,
  },
  {
    key: 'fat',
    label: 'Жиры',
    unit: 'г',
    activeClass: 'bg-orange-500 text-slate-950',
    textClass: 'text-orange-400',
    barClass: 'bg-orange-400',
    getStatsValue: s => s.totalFat,
    getItemValue: i => i.fatG,
    getEstimateValue: e => e.fatG,
    defaultLimit: 70,
  },
  {
    key: 'carbs',
    label: 'Углеводы',
    unit: 'г',
    activeClass: 'bg-yellow-400 text-slate-950',
    textClass: 'text-yellow-400',
    barClass: 'bg-yellow-400',
    getStatsValue: s => s.totalCarbs,
    getItemValue: i => i.carbsG,
    getEstimateValue: e => e.carbsG,
    defaultLimit: 250,
  },
  {
    key: 'potassium',
    label: 'Калий',
    unit: 'мг',
    activeClass: 'bg-violet-500 text-white',
    textClass: 'text-violet-400',
    barClass: 'bg-violet-500',
    getStatsValue: s => s.totalPotassium,
    getItemValue: i => i.potassiumMg,
    getEstimateValue: e => e.potassiumMg,
    round: true,
    defaultLimit: 2000,
  },
  {
    key: 'sodium',
    label: 'Натрий',
    unit: 'мг',
    activeClass: 'bg-cyan-500 text-slate-950',
    textClass: 'text-cyan-400',
    barClass: 'bg-cyan-400',
    getStatsValue: s => s.totalSodium,
    getItemValue: i => i.sodiumMg,
    getEstimateValue: e => e.sodiumMg,
    round: true,
    defaultLimit: 1500,
  },
  {
    key: 'magnesium',
    label: 'Магний',
    unit: 'мг',
    activeClass: 'bg-teal-500 text-slate-950',
    textClass: 'text-teal-400',
    barClass: 'bg-teal-500',
    getStatsValue: s => s.totalMagnesium,
    getItemValue: i => i.magnesiumMg,
    getEstimateValue: e => e.magnesiumMg,
    round: true,
    defaultLimit: 300,
  },
];

export const metricByKey = Object.fromEntries(METRICS.map(m => [m.key, m])) as Record<PrimaryMetric, MetricConfig>;
