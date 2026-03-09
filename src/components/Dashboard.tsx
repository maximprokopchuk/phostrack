import React, { useState } from 'react';
import { DailyStats } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils';
import { ChevronDown, ChevronUp, Zap, Droplets } from 'lucide-react';

type PrimaryMetric = 'calories' | 'phosphorus';

interface DashboardProps {
  stats: DailyStats;
}

export const Dashboard: React.FC<DashboardProps> = ({ stats }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [primary, setPrimary] = useState<PrimaryMetric>(
    () => (localStorage.getItem('phostrack_primary_metric') as PrimaryMetric) ?? 'calories'
  );

  const switchMetric = (m: PrimaryMetric) => {
    setPrimary(m);
    localStorage.setItem('phostrack_primary_metric', m);
  };

  const isOverLimit = stats.totalMg > stats.limitMg;
  const isOverCalorieLimit = stats.totalCalories > stats.calorieLimit;
  const caloriesPct = Math.min((stats.totalCalories / stats.calorieLimit) * 100, 100);
  const phosphorusPct = Math.min(stats.percentage, 100);

  return (
    <div className="p-6 glass-card rounded-3xl mb-6">
      {/* Metric toggle */}
      <div className="flex items-center gap-1 p-1 bg-slate-800/60 rounded-xl w-fit mb-5">
        <button
          onClick={() => switchMetric('calories')}
          className={cn(
            'px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
            primary === 'calories'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-slate-200'
          )}
        >
          Калории
        </button>
        <button
          onClick={() => switchMetric('phosphorus')}
          className={cn(
            'px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
            primary === 'phosphorus'
              ? 'bg-emerald-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-slate-200'
          )}
        >
          Фосфор
        </button>
      </div>

      {/* Primary counter */}
      <AnimatePresence mode="wait">
        {primary === 'calories' ? (
          <motion.div
            key="calories"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="mb-6"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Калории</h2>
                <p className="text-5xl font-black text-white">
                  {stats.totalCalories} <span className="text-xl font-normal text-slate-400">ккал</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-slate-400">Лимит: {stats.calorieLimit} ккал</p>
                <p className={cn('text-sm font-bold mt-1', isOverCalorieLimit ? 'text-red-500' : 'text-amber-400')}>
                  {isOverCalorieLimit
                    ? `+${stats.totalCalories - stats.calorieLimit}`
                    : `${stats.calorieLimit - stats.totalCalories} ост.`}
                </p>
              </div>
            </div>
            <div className="relative h-3 w-full bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${caloriesPct}%` }}
                className={cn(
                  'h-full rounded-full transition-colors duration-500',
                  caloriesPct > 90 ? 'bg-red-500' : caloriesPct > 70 ? 'bg-amber-500' : 'bg-amber-400'
                )}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="phosphorus"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="mb-6"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Фосфор</h2>
                <p className="text-5xl font-black text-white">
                  {stats.totalMg} <span className="text-xl font-normal text-slate-400">мг</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-slate-400">Лимит: {stats.limitMg} мг</p>
                <p className={cn('text-sm font-bold mt-1', isOverLimit ? 'text-red-500' : 'text-emerald-500')}>
                  {isOverLimit
                    ? `+${stats.totalMg - stats.limitMg}`
                    : `${stats.remainingMg} ост.`}
                </p>
              </div>
            </div>
            <div className="relative h-3 w-full bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${phosphorusPct}%` }}
                className={cn(
                  'h-full rounded-full transition-colors duration-500',
                  phosphorusPct > 90 ? 'bg-red-500' : phosphorusPct > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                )}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spoiler Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors border-t border-slate-800 mt-4 pt-4"
      >
        {isExpanded ? (
          <><ChevronUp className="w-4 h-4" /> Скрыть КБЖУ и электролиты</>
        ) : (
          <><ChevronDown className="w-4 h-4" /> Показать КБЖУ и электролиты</>
        )}
      </button>

      {/* Expandable Section */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
              {/* KBJU Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-white font-bold text-sm mb-2">
                  <Zap className="w-4 h-4 text-amber-500" /> КБЖУ
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Калории</span>
                      <span className="font-bold text-slate-300">{stats.totalCalories} / {stats.calorieLimit}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full bg-amber-400', isOverCalorieLimit && 'bg-red-500')}
                        style={{ width: `${caloriesPct}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Фосфор</span>
                      <span className="font-bold text-slate-300">{stats.totalMg} / {stats.limitMg} мг</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full',
                          isOverLimit ? 'bg-red-500' : phosphorusPct > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                        )}
                        style={{ width: `${phosphorusPct}%` }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-slate-800/50 p-2 rounded-xl text-center">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Белки</p>
                      <p className="text-sm font-bold text-slate-200">{stats.totalProtein.toFixed(1)}г</p>
                    </div>
                    <div className="bg-slate-800/50 p-2 rounded-xl text-center">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Жиры</p>
                      <p className="text-sm font-bold text-slate-200">{stats.totalFat.toFixed(1)}г</p>
                    </div>
                    <div className="bg-slate-800/50 p-2 rounded-xl text-center">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Углеводы</p>
                      <p className="text-sm font-bold text-slate-200">{stats.totalCarbs.toFixed(1)}г</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Electrolytes Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-white font-bold text-sm mb-2">
                  <Droplets className="w-4 h-4 text-blue-500" /> Электролиты
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex justify-between items-center p-2 bg-slate-800/50 rounded-xl">
                    <span className="text-xs font-bold text-slate-400 uppercase">Калий (K)</span>
                    <span className="text-sm font-bold text-slate-200">{stats.totalPotassium} мг</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-800/50 rounded-xl">
                    <span className="text-xs font-bold text-slate-400 uppercase">Натрий (Na)</span>
                    <span className="text-sm font-bold text-slate-200">{stats.totalSodium} мг</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-800/50 rounded-xl">
                    <span className="text-xs font-bold text-slate-400 uppercase">Магний (Mg)</span>
                    <span className="text-sm font-bold text-slate-200">{stats.totalMagnesium} мг</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
