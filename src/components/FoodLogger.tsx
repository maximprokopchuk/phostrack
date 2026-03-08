import React, { useState, useRef } from 'react';
import { Search, Sparkles, Camera, Loader2, Plus, X } from 'lucide-react';
import { estimatePhosphate, estimatePhosphateFromImage } from '../services/geminiService';
import { PhosphateEstimate } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils';

interface FoodLoggerProps {
  onAdd: (estimate: PhosphateEstimate) => void;
}

export const FoodLogger: React.FC<FoodLoggerProps> = ({ onAdd }) => {
  const [input, setInput] = useState('');
  const [isEstimating, setIsEstimating] = useState(false);
  const [estimate, setEstimate] = useState<PhosphateEstimate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextEstimate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setError(null);
    setIsEstimating(true);
    try {
      const result = await estimatePhosphate(input);
      setEstimate(result);
    } catch (err) {
      console.error('Estimation failed:', err);
      setError('Не удалось оценить блюдо. Проверьте подключение и попробуйте ещё раз.');
    } finally {
      setIsEstimating(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsEstimating(true);
    const mimeType = file.type || 'image/jpeg';
    const reader = new FileReader();
    reader.onerror = () => {
      setError('Не удалось прочитать файл. Попробуйте другое изображение.');
      setIsEstimating(false);
    };
    reader.onloadend = async () => {
      try {
        const base64 = (reader.result as string).split(',')[1];
        const result = await estimatePhosphateFromImage(base64, mimeType);
        setEstimate(result);
      } catch (err) {
        console.error('Image estimation failed:', err);
        setError('Не удалось распознать изображение. Попробуйте ещё раз.');
      } finally {
        setIsEstimating(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const confirmAdd = () => {
    if (estimate) {
      onAdd(estimate);
      setEstimate(null);
      setInput('');
      setError(null);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleTextEstimate} className="relative group">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Что вы съели? (например, '2 яйца и тост')"
          className="w-full pl-12 pr-24 py-4 dark:bg-slate-900 bg-white dark:border-slate-800 border-gray-200 border rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all shadow-sm group-hover:shadow-md dark:text-white text-gray-900"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 dark:text-slate-400 text-gray-400 w-5 h-5" />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 dark:text-slate-400 text-gray-400 hover:text-emerald-600 hover:bg-emerald-900/20 rounded-xl transition-colors"
            title="Сфотографировать еду"
          >
            <Camera className="w-5 h-5" />
          </button>
          <button
            type="submit"
            disabled={isEstimating || !input.trim()}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {isEstimating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span className="hidden sm:inline">Оценить</span>
          </button>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />
      </form>

      {error && (
        <div className="px-4 py-3 bg-red-900/20 border border-red-700/40 rounded-xl text-sm text-red-400 dark:text-red-300">
          {error}
        </div>
      )}

      <AnimatePresence>
        {estimate && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-5 glass-card rounded-2xl border-emerald-900/30 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />

            <button
              onClick={() => setEstimate(null)}
              className="absolute top-3 right-3 dark:text-slate-400 text-gray-400 dark:hover:text-slate-200 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold dark:text-white text-gray-900 text-lg">{estimate.foodName}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn(
                    "text-[10px] uppercase font-bold px-2 py-0.5 rounded-full",
                    estimate.confidence === 'high' ? "bg-emerald-900/30 text-emerald-400" :
                    estimate.confidence === 'medium' ? "bg-amber-900/30 text-amber-400" : "dark:bg-slate-800 bg-gray-100 dark:text-slate-400 text-gray-500"
                  )}>
                    Уверенность: {estimate.confidence === 'high' ? 'Высокая' : estimate.confidence === 'medium' ? 'Средняя' : 'Низкая'}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-emerald-600">{estimate.phosphateMg} <span className="text-sm font-normal dark:text-slate-400 text-gray-500">мг</span></p>
                <p className="text-sm font-medium dark:text-slate-400 text-gray-500">{estimate.calories} ккал</p>
              </div>
            </div>

            {/* Breakdown Grid */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold dark:text-slate-400 text-gray-500 uppercase">Макросы</p>
                <div className="flex gap-2 text-xs font-bold dark:text-slate-300 text-gray-700">
                  <span>Б: {estimate.proteinG}г</span>
                  <span>Ж: {estimate.fatG}г</span>
                  <span>У: {estimate.carbsG}г</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold dark:text-slate-400 text-gray-500 uppercase">Электролиты</p>
                <div className="flex flex-wrap gap-x-2 gap-y-0 text-xs font-bold dark:text-slate-300 text-gray-700">
                  <span>K: {estimate.potassiumMg}мг</span>
                  <span>Na: {estimate.sodiumMg}мг</span>
                  <span>Mg: {estimate.magnesiumMg}мг</span>
                </div>
              </div>
            </div>

            <p className="text-sm dark:text-slate-300 text-gray-600 mb-4 italic leading-relaxed dark:border-slate-800 border-gray-200 border-t pt-3">
              "{estimate.explanation}"
            </p>

            <button
              onClick={confirmAdd}
              className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Добавить в журнал
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
