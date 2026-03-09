import React, { useState } from 'react';
import { FoodItem, PrimaryMetric } from '../types';
import { metricByKey } from '../metrics';
import { Trash2, Clock, Utensils } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';

interface LogListProps {
  items: FoodItem[];
  onDelete: (id: string) => void;
  primaryMetric: PrimaryMetric;
}

export const LogList: React.FC<LogListProps> = ({ items, onDelete, primaryMetric }) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const metric = metricByKey[primaryMetric];

  const toggleItem = (id: string) => {
    const newSet = new Set(expandedItems);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedItems(newSet);
  };

  if (items.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <Utensils className="w-8 h-8 text-slate-600" />
        </div>
        <p className="text-slate-500 font-medium">Сегодня вы еще ничего не добавили</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Сегодняшние записи</h3>
      <AnimatePresence mode="popLayout">
        {items.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all shadow-sm hover:shadow-md"
          >
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-900/20 rounded-xl flex items-center justify-center text-emerald-400">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white">{item.name}</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{format(item.timestamp, 'HH:mm', { locale: ru })}</span>
                    </div>
                    <span className="text-slate-700">•</span>
                    <span>{item.calories} ккал</span>
                    <button 
                      onClick={() => toggleItem(item.id)}
                      className="text-emerald-400 font-bold hover:underline flex items-center gap-0.5"
                    >
                      {expandedItems.has(item.id) ? 'Скрыть' : 'Детали'}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <p className={`font-bold ${metric.textClass}`}>
                  {metric.round
                    ? Math.round(metric.getItemValue(item))
                    : metric.getItemValue(item).toFixed(1)
                  }{' '}
                  <span className="text-[10px] font-normal text-slate-400 uppercase">{metric.unit}</span>
                </p>
                <button
                  onClick={() => onDelete(item.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-900/20 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <AnimatePresence>
              {expandedItems.has(item.id) && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="bg-slate-800/30 border-t border-slate-800 px-4 py-3"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Макросы</p>
                      <div className="flex gap-3 text-xs font-bold text-slate-400">
                        <span>Б: {item.proteinG}г</span>
                        <span>Ж: {item.fatG}г</span>
                        <span>У: {item.carbsG}г</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Электролиты</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs font-bold text-slate-400">
                        <span>K: {item.potassiumMg}мг</span>
                        <span>Na: {item.sodiumMg}мг</span>
                        <span>Mg: {item.magnesiumMg}мг</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
