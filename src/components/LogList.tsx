import React, { useState } from 'react';
import { FoodItem } from '../types';
import { Trash2, Clock, Utensils } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';

interface LogListProps {
  items: FoodItem[];
  onDelete: (id: string) => void;
}

export const LogList: React.FC<LogListProps> = ({ items, onDelete }) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    const newSet = new Set(expandedItems);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedItems(newSet);
  };

  if (items.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="w-16 h-16 dark:bg-slate-800 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Utensils className="w-8 h-8 dark:text-slate-600 text-gray-400" />
        </div>
        <p className="dark:text-slate-500 text-gray-400 font-medium">Сегодня вы еще ничего не добавили</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold dark:text-slate-500 text-gray-400 uppercase tracking-widest mb-4">Сегодняшние записи</h3>
      <AnimatePresence mode="popLayout">
        {items.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="group dark:bg-slate-900 bg-white dark:border-slate-800 border-gray-200 border rounded-2xl overflow-hidden dark:hover:border-slate-700 hover:border-gray-300 transition-all shadow-sm hover:shadow-md"
          >
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-900/20 rounded-xl flex items-center justify-center text-emerald-400">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold dark:text-white text-gray-900">{item.name}</h4>
                  <div className="flex items-center gap-3 text-xs dark:text-slate-500 text-gray-400 mt-0.5">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{format(item.timestamp, 'HH:mm', { locale: ru })}</span>
                    </div>
                    <span className="dark:text-slate-700 text-gray-300">•</span>
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
                <p className="font-bold dark:text-slate-300 text-gray-700">{item.phosphateMg} <span className="text-[10px] font-normal dark:text-slate-400 text-gray-500 uppercase">мг</span></p>
                <button
                  onClick={() => onDelete(item.id)}
                  className="p-2 dark:text-slate-500 text-gray-400 hover:text-red-500 hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
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
                  className="dark:bg-slate-800/30 bg-gray-50 dark:border-slate-800 border-gray-200 border-t px-4 py-3"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold dark:text-slate-400 text-gray-500 uppercase">Макросы</p>
                      <div className="flex gap-3 text-[11px] font-bold dark:text-slate-400 text-gray-500">
                        <span>Б: {item.proteinG}г</span>
                        <span>Ж: {item.fatG}г</span>
                        <span>У: {item.carbsG}г</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold dark:text-slate-400 text-gray-500 uppercase">Электролиты</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-bold dark:text-slate-400 text-gray-500">
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
