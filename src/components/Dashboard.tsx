import React, { useState } from 'react';
import { DailyStats, PrimaryMetric, MetricLimits } from '../types';
import { METRICS, metricByKey } from '../metrics';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface DashboardProps {
  stats: DailyStats;
  primaryMetric: PrimaryMetric;
  metricLimits: MetricLimits;
}

export const Dashboard: React.FC<DashboardProps> = ({ stats, primaryMetric, metricLimits }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const active = metricByKey[primaryMetric];
  const value = active.getStatsValue(stats);
  const limit = metricLimits[primaryMetric];
  const pct = limit ? Math.min((value / limit) * 100, 100) : null;
  const displayValue = active.round ? Math.round(value) : value.toFixed(1);
  const isOver = limit !== undefined && value > limit;

  return (
    <div className="p-6 glass-card rounded-3xl mb-6">
      {/* Primary counter */}
      <AnimatePresence mode="wait">
        <motion.div
          key={primaryMetric}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
          className="mb-4"
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{active.label}</h2>
              <p className="text-5xl font-black text-white">
                {displayValue} <span className="text-xl font-normal text-slate-400">{active.unit}</span>
              </p>
            </div>
            {limit !== undefined && (
              <div className="text-right">
                <p className="text-xs font-medium text-slate-400">Лимит: {limit} {active.unit}</p>
                <p className={cn('text-sm font-bold mt-1', isOver ? 'text-red-500' : active.textClass)}>
                  {isOver
                    ? `+${active.round ? Math.round(value - limit) : (value - limit).toFixed(1)}`
                    : `${active.round ? Math.round(limit - value) : (limit - value).toFixed(1)} ост.`}
                </p>
              </div>
            )}
          </div>
          {pct !== null && (
            <div className="relative h-3 w-full bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                className={cn(
                  'h-full rounded-full transition-colors duration-500',
                  pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-amber-500' : active.barClass
                )}
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Spoiler Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors border-t border-slate-800 mt-2 pt-4"
      >
        {isExpanded
          ? <><ChevronUp className="w-4 h-4" /> Скрыть детали</>
          : <><ChevronDown className="w-4 h-4" /> Показать детали</>
        }
      </button>

      {/* Expandable: all other metrics */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 space-y-3">
              {METRICS.filter(m => m.key !== primaryMetric).map(m => {
                const v = m.getStatsValue(stats);
                const lim = metricLimits[m.key];
                const p = lim ? Math.min((v / lim) * 100, 100) : null;
                const disp = m.round ? Math.round(v) : v.toFixed(1);
                return (
                  <div key={m.key}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">{m.label}</span>
                      <span className="font-bold text-slate-300">
                        {disp}{lim ? ` / ${lim}` : ''} {m.unit}
                      </span>
                    </div>
                    {p !== null && (
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={cn('h-full rounded-full', p > 90 ? 'bg-red-500' : p > 70 ? 'bg-amber-500' : m.barClass)}
                          style={{ width: `${p}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
