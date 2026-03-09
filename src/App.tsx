import React, { useState, useEffect, useMemo } from 'react';
import { Dashboard } from './components/Dashboard';
import { FoodLogger } from './components/FoodLogger';
import { LogList } from './components/LogList';
import { DialysisTracker } from './components/DialysisTracker';
import { FoodItem, DailyStats, PhosphateEstimate } from './types';
import { Settings, Activity, LayoutDashboard, Droplets, CalendarCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { startOfDay } from 'date-fns';

type Tab = 'phosphorus' | 'dialysis';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('phosphorus');
  const [logs, setLogs] = useState<FoodItem[]>([]);
  const [limit, setLimit] = useState(800);
  const [calorieLimit, setCalorieLimit] = useState(2000);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCloseDayOpen, setIsCloseDayOpen] = useState(false);
  const [dayStart, setDayStart] = useState<number>(() => {
    const saved = localStorage.getItem('phostrack_day_start');
    return saved ? parseInt(saved, 10) : startOfDay(new Date()).getTime();
  });

  // Force dark mode
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Load data
  useEffect(() => {
    const savedLogs = localStorage.getItem('phostrack_logs');
    const savedLimit = localStorage.getItem('phostrack_limit');
    const savedCalLimit = localStorage.getItem('phostrack_cal_limit');

    if (savedLogs) {
      try {
        const parsed = JSON.parse(savedLogs);
        setLogs(parsed.filter((log: FoodItem) => log.timestamp >= dayStart));
      } catch (e) {
        console.error('Failed to load logs', e);
      }
    }

    if (savedLimit) setLimit(parseInt(savedLimit, 10));
    if (savedCalLimit) setCalorieLimit(parseInt(savedCalLimit, 10));
  }, []);

  // Save logs and settings
  useEffect(() => {
    localStorage.setItem('phostrack_logs', JSON.stringify(logs));
    localStorage.setItem('phostrack_limit', limit.toString());
    localStorage.setItem('phostrack_cal_limit', calorieLimit.toString());
  }, [logs, limit, calorieLimit]);

  // Persist dayStart
  useEffect(() => {
    localStorage.setItem('phostrack_day_start', String(dayStart));
  }, [dayStart]);

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

  const closeDay = () => {
    const newStart = Date.now();
    setDayStart(newStart);
    localStorage.setItem('phostrack_day_start', String(newStart));
    setLogs([]);
    setIsCloseDayOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-24 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
              <Activity className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">PhosTrack</h1>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsCloseDayOpen(true)}
              className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-xl transition-all"
              title="Завершить день"
            >
              <CalendarCheck className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-all"
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
                <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-amber-400 flex-shrink-0">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-amber-100 mb-1">ХБП 5 стадия: Важные правила</h4>
                  <p className="text-sm text-amber-300/80 leading-relaxed">
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
              <DialysisTracker dayStart={dayStart} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-xl border-t border-slate-800 pb-safe z-40">
        <div className="max-w-2xl mx-auto px-8 h-16 flex items-center justify-around">
          <button
            onClick={() => setActiveTab('phosphorus')}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'phosphorus' ? 'text-emerald-500 scale-110' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <LayoutDashboard className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase">Фосфор</span>
          </button>
          <button
            onClick={() => setActiveTab('dialysis')}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'dialysis' ? 'text-emerald-500 scale-110' : 'text-slate-500 hover:text-slate-300'}`}
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
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-slate-900 rounded-3xl p-8 shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Настройки</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">
                    Дневной лимит фосфора (мг)
                  </label>
                  <input
                    type="number"
                    value={limit}
                    onChange={(e) => setLimit(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">
                    Дневной лимит калорий (ккал)
                  </label>
                  <input
                    type="number"
                    value={calorieLimit}
                    onChange={(e) => setCalorieLimit(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-lg text-white"
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

      {/* Close Day Confirmation Modal */}
      <AnimatePresence>
        {isCloseDayOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCloseDayOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-slate-900 rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-400">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-white">Завершить день?</h2>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                Все записи будут сохранены в истории. Начнётся новый день.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsCloseDayOpen(false)}
                  className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-2xl font-bold hover:bg-slate-700 transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={closeDay}
                  className="flex-1 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-colors"
                >
                  Завершить день
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
