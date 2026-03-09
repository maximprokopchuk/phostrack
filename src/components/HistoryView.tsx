import React, { useState } from 'react';
import { DayRecord } from '../types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';
import { History, ChevronDown, ChevronUp, Utensils, Droplets, CalendarCheck } from 'lucide-react';

interface HistoryViewProps {
  dayHistory: DayRecord[];
}

export const HistoryView: React.FC<HistoryViewProps> = ({ dayHistory }) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    const next = new Set(expandedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedIds(next);
  };

  if (dayHistory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center">
          <History className="w-10 h-10 text-slate-600" />
        </div>
        <p className="text-slate-500 font-medium text-base">Нет закрытых дней</p>
        <p className="text-slate-600 text-sm text-center max-w-xs leading-relaxed">
          Нажмите на <CalendarCheck className="inline w-3.5 h-3.5 text-slate-500 align-text-bottom mx-0.5" /> в шапке, чтобы завершить день и сохранить его в историю
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">История дней</h3>

      <AnimatePresence initial={false}>
        {dayHistory.map((record) => {
          const isOpen = expandedIds.has(record.id);
          const dateLabel = `${format(record.dayStart, 'd MMMM HH:mm', { locale: ru })} — ${format(record.dayEnd, 'd MMMM HH:mm', { locale: ru })}`;

          return (
            <motion.div
              key={record.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-card rounded-3xl overflow-hidden"
            >
              {/* Card Header */}
              <button
                onClick={() => toggleExpand(record.id)}
                className="w-full p-5 text-left"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-bold text-slate-300">{dateLabel}</p>
                  {isOpen
                    ? <ChevronUp className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  }
                </div>

                {/* Summary badges */}
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-emerald-900/30 border border-emerald-800/40 rounded-full text-xs font-bold text-emerald-400">
                    {record.totalPhosphateMg} мг P
                  </span>
                  <span className="px-3 py-1 bg-blue-900/30 border border-blue-800/40 rounded-full text-xs font-bold text-blue-400">
                    {record.totalCalories} ккал
                  </span>
                  <span className="px-3 py-1 bg-slate-800/60 border border-slate-700/40 rounded-full text-xs font-bold text-slate-400">
                    {record.exchanges.length} обменов
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${record.totalUF >= 0 ? 'bg-teal-900/30 border-teal-800/40 text-teal-400' : 'bg-red-900/30 border-red-800/40 text-red-400'}`}>
                    УФ: {record.totalUF > 0 ? `+${record.totalUF}` : record.totalUF} мл
                  </span>
                </div>
              </button>

              {/* Expandable content */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden border-t border-slate-800/60"
                  >
                    <div className="p-5 space-y-5">
                      {/* Food log */}
                      <div>
                        <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-3">
                          <Utensils className="w-3.5 h-3.5" /> Еда ({record.logs.length})
                        </div>
                        {record.logs.length === 0 ? (
                          <p className="text-xs text-slate-600">Записей нет</p>
                        ) : (
                          <div className="space-y-1.5">
                            {record.logs.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between py-1.5 px-3 bg-slate-800/40 rounded-xl"
                              >
                                <span className="text-sm text-slate-300 font-medium truncate mr-3">{item.name}</span>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                  <span className="text-xs font-bold text-emerald-400">{item.phosphateMg} мг</span>
                                  <span className="text-xs text-slate-500">{item.calories} ккал</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Exchanges */}
                      {record.exchanges.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-3">
                            <Droplets className="w-3.5 h-3.5" /> Обмены ({record.exchanges.length})
                          </div>
                          <div className="space-y-1.5">
                            {record.exchanges.map((ex) => (
                              <div
                                key={ex.id}
                                className="flex items-center justify-between py-1.5 px-3 bg-slate-800/40 rounded-xl"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold text-slate-300">{ex.solutionType}</span>
                                  <span className="text-xs text-slate-500">
                                    {ex.fillVolume}↑ / {ex.drainVolume}↓
                                  </span>
                                </div>
                                <span className={`text-xs font-bold ${ex.uf >= 0 ? 'text-teal-400' : 'text-red-400'}`}>
                                  УФ: {ex.uf > 0 ? `+${ex.uf}` : ex.uf} мл
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Vitals */}
                      {record.vitals && (
                        <div className="flex gap-3">
                          <div className="flex-1 bg-slate-800/40 rounded-xl p-3 text-center">
                            <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Вес</p>
                            <p className="text-sm font-bold text-slate-200">{record.vitals.weight} кг</p>
                          </div>
                          <div className="flex-1 bg-slate-800/40 rounded-xl p-3 text-center">
                            <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Давление</p>
                            <p className="text-sm font-bold text-slate-200">{record.vitals.systolic}/{record.vitals.diastolic}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
