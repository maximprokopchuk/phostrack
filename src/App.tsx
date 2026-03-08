import React, { useState, useEffect, useMemo } from 'react';
import { Dashboard } from './components/Dashboard';
import { FoodLogger } from './components/FoodLogger';
import { LogList } from './components/LogList';
import { DialysisTracker } from './components/DialysisTracker';
import { FoodItem, DailyStats, PhosphateEstimate } from './types';
import { Settings, Activity, LayoutDashboard, Droplets, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { startOfDay, isSameDay } from 'date-fns';

type Tab = 'phosphorus' | 'dialysis';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('phosphorus');
  const [logs, setLogs] = useState<FoodItem[]>([]);
  const [limit, setLimit] = useState(800);
  const [calorieLimit, setCalorieLimit] = useState(2000);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Theme: read from localStorage or system preference
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('phostrack_theme');
    if (saved !== null) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply/remove dark class on <html>
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('phostrack_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  // Load data
  useEffect(() => {
    const savedLogs = localStorage.getItem('phostrack_logs');
    const savedLimit = localStorage.getItem('phostrack_limit');
    const savedCalLimit = localStorage.getItem('phostrack_cal_limit');

    if (savedLogs) {
      try {
        const parsed = JSON.parse(savedLogs);
        const today = startOfDay(new Date());
        setLogs(parsed.filter((log: FoodItem) => isSameDay(new Date(log.timestamp), today)));
      } catch (e) {
        console.error('Failed to load logs', e);
      }
    }

    if (savedLimit) setLimit(parseInt(savedLimit, 10));
    if (savedCalLimit) setCalorieLimit(parseInt(savedCalLimit, 10));
  }, []);

  // Save data
  useEffect(() => {
    localStorage.setItem('phostrack_logs', JSON.stringify(logs));
    localStorage.setItem('phostrack_limit', limit.toString());
    localStorage.setItem('phostrack_cal_limit', calorieLimit.toString());
  }, [logs, limit, calorieLimit]);

  const stats: DailyStats = useMemo(() => {
    const total = logs.reduce((sum, item) => sum + item.phosphateMg, 0);
    const totalCals = logs.reduce((sum, item) => sum + (item.calories || 0), 0);
    const totalProtein = logs.reduce((sum, item) => sum + (item.proteinG || 0), 0);
    const totalFat = logs.reduce((sum, item) => sum + (item.fatG || 0), 0);
    const totalCarbs = logs.reduce((sum, item) => sum + (item.carbsG || 0), 0);
    const totalPotassium = logs.reduce((sum, item) => sum + (item.potassiumMg || 0), 0);
    const totalMagnesium = logs.reduce((sum, item) => sum + (item.magnesiumMg || 0), 0);
    const totalSodium = logs.reduce((sum, item) => sum + (item.sodiumMg || 0), 0);

    return {
      totalMg: total,
      limitMg: limit,
      remainingMg: Math.max(0, limit - total),
      percentage: (total / limit) * 100,
      totalCalories: totalCals,
      calorieLimit: calorieLimit,
      totalProtein,
      totalFat,
      totalCarbs,
      totalPotassium,
      totalMagnesium,
      totalSodium
    };
  }, [logs, limit, calorieLimit]);

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
      timestamp: Date.now()
    };
    setLogs([newItem, ...logs]);
  };

  const deleteFood = (id: string) => {
    setLogs(logs.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen dark:bg-slate-950 bg-gray-50 pb-24 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-10 dark:bg-slate-900/80 bg-white/80 backdrop-blur-lg dark:border-slate-800 border-gray-200 border-b">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
              <Activity className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold dark:text-white text-gray-900 tracking-tight">PhosTrack</h1>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="p-2 dark:text-slate-400 text-gray-500 dark:hover:text-slate-200 hover:text-gray-700 dark:hover:bg-slate-800 hover:bg-gray-100 rounded-xl transition-all"
              title={isDark ? 'Светлая тема' : 'Тёмная тема'}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 dark:text-slate-400 text-gray-500 dark:hover:text-slate-200 hover:text-gray-700 dark:hover:bg-slate-800 hover:bg-gray-100 rounded-xl transition-all"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'phosphorus' ? (
            <motion.div
              key="phosphorus"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Dashboard stats={stats} />
              <div className="mb-10">
                <FoodLogger onAdd={addFood} />
              </div>
              <LogList items={logs} onDelete={deleteFood} />

              <div className="mt-12 p-6 bg-amber-900/10 rounded-3xl border border-amber-900/20 flex gap-4 shadow-sm">
                <div className="w-10 h-10 dark:bg-slate-800 bg-amber-100 rounded-xl flex items-center justify-center text-amber-400 flex-shrink-0">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-amber-700 dark:text-amber-100 mb-1">ХБП 5 стадия: Важные правила</h4>
                  <p className="text-sm text-amber-600/80 dark:text-amber-300/80 leading-relaxed">
                    При 5 стадии почки почти не выводят фосфор. Избегайте <b>неорганических фосфатов</b> (пищевые добавки E338-E343), так как они всасываются полностью.
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="dialysis"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <DialysisTracker />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 dark:bg-slate-900/90 bg-white/90 backdrop-blur-xl dark:border-slate-800 border-gray-200 border-t pb-safe z-40">
        <div className="max-w-2xl mx-auto px-8 h-16 flex items-center justify-around">
          <button
            onClick={() => setActiveTab('phosphorus')}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'phosphorus' ? 'text-emerald-500 scale-110' : 'dark:text-slate-500 text-gray-400 dark:hover:text-slate-300 hover:text-gray-600'}`}
          >
            <LayoutDashboard className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase">Фосфор</span>
          </button>
          <button
            onClick={() => setActiveTab('dialysis')}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'dialysis' ? 'text-emerald-500 scale-110' : 'dark:text-slate-500 text-gray-400 dark:hover:text-slate-300 hover:text-gray-600'}`}
          >
            <Droplets className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase">Диализ</span>
          </button>
        </div>
      </nav>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="absolute inset-0 dark:bg-slate-950/80 bg-gray-900/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md dark:bg-slate-900 bg-white rounded-3xl p-8 shadow-2xl"
            >
              <h2 className="text-2xl font-bold dark:text-white text-gray-900 mb-6">Настройки</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold dark:text-slate-300 text-gray-700 mb-2">
                    Дневной лимит фосфора (мг)
                  </label>
                  <input
                    type="number"
                    value={limit}
                    onChange={(e) => setLimit(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-4 py-3 dark:bg-slate-800 bg-gray-100 dark:border-slate-700 border-gray-200 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-lg dark:text-white text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold dark:text-slate-300 text-gray-700 mb-2">
                    Дневной лимит калорий (ккал)
                  </label>
                  <input
                    type="number"
                    value={calorieLimit}
                    onChange={(e) => setCalorieLimit(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-4 py-3 dark:bg-slate-800 bg-gray-100 dark:border-slate-700 border-gray-200 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-lg dark:text-white text-gray-900"
                  />
                </div>

                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-colors"
                >
                  Сохранить и закрыть
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
