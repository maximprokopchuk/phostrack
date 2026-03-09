export interface FoodItem {
  id: string;
  name: string;
  phosphateMg: number;
  calories: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
  potassiumMg: number;
  magnesiumMg: number;
  sodiumMg: number;
  amountGrams: number;
  timestamp: number;
}

export interface PhosphateEstimate {
  foodName: string;
  phosphateMg: number;
  calories: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
  potassiumMg: number;
  magnesiumMg: number;
  sodiumMg: number;
  confidence: 'low' | 'medium' | 'high';
  explanation: string;
}

export interface DailyStats {
  totalMg: number;
  limitMg: number;
  remainingMg: number;
  percentage: number;
  totalCalories: number;
  calorieLimit: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
  totalPotassium: number;
  totalMagnesium: number;
  totalSodium: number;
}

export interface DialysisExchange {
  id: string;
  timestamp: number;
  fillVolume: number;
  drainVolume: number;
  uf: number;
  solutionType: string;
}

export interface DailyVitals {
  id: string;
  date: string;
  weight: number;
  systolic: number;
  diastolic: number;
  temperature: number;
}

export interface DayRecord {
  id: string;
  dayStart: number;
  dayEnd: number;
  logs: FoodItem[];
  exchanges: DialysisExchange[];
  vitals: DailyVitals | null;
  totalPhosphateMg: number;
  totalCalories: number;
  totalUF: number;
}
