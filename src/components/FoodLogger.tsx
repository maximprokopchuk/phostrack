import React, { useState, useRef } from 'react';
import { Search, Sparkles, Camera, Loader2, Plus, X } from 'lucide-react';
import { estimatePhosphate, estimatePhosphateFromImage } from '../services/nutritionService';
import { PhosphateEstimate, PrimaryMetric, ModelProvider } from '../types';
import { metricByKey } from '../metrics';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils';

interface FoodLoggerProps {
  onAdd: (estimate: PhosphateEstimate) => void;
  primaryMetric: PrimaryMetric;
  modelProvider: ModelProvider;
}

export const FoodLogger: React.FC<FoodLoggerProps> = ({ onAdd, primaryMetric, modelProvider }) => {
  const [input, setInput] = useState('');
  const [isEstimating, setIsEstimating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estimate, setEstimate] = useState<PhosphateEstimate | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextEstimate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsEstimating(true);
    setError(null);
    try {
      const result = await estimatePhosphate(input, modelProvider);
      setEstimate(result);
    } catch (err: any) {
      console.error('Estimation failed:', err);
      setError(err.message || 'Не удалось оценить блюдо. Проверьте подключение и API ключ.');
    } finally {
      setIsEstimating(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsEstimating(true);
    setError(null);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        try {
          const result = await estimatePhosphateFromImage(base64, 'image/jpeg', modelProvider);
          setEstimate(result);
        } catch (err: any) {
          console.error('Image estimation failed:', err);
          setError(err.message || 'Не удалось распознать еду по фото.');
        } finally {
          setIsEstimating(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('File reading failed:', err);
      setIsEstimating(false);
      setError('Ошибка при чтении файла.');
    }
  };

  const confirmAdd = () => {
    if (estimate) {
      onAdd(estimate);
      setEstimate(null);
      setInput('');
      setError(null);
      (document.activeElement as HTMLElement)?.blur();
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
          className="w-full pl-12 pr-24 py-4 bg-slate-900 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all shadow-sm group-hover:shadow-md text-white"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-900/20 rounded-xl transition-colors"
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

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 bg-red-900/20 border border-red-900/30 rounded-xl text-red-400 text-xs font-medium"
          >
            {error}
          </motion.div>
        )}

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
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>

            {(() => {
              const m = metricByKey[primaryMetric];
              const primaryVal = m.getEstimateValue(estimate);
              const displayPrimary = m.round ? Math.round(primaryVal) : primaryVal.toFixed(1);
              // secondary: show calories if primary is not calories, else phosphorus
              const sec = primaryMetric === 'calories' ? metricByKey['phosphorus'] : metricByKey['calories'];
              const secVal = sec.getEstimateValue(estimate);
              return (
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-white text-lg">{estimate.foodName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn(
                        "text-[10px] uppercase font-bold px-2 py-0.5 rounded-full",
                        estimate.confidence === 'high' ? "bg-emerald-900/30 text-emerald-400" :
                        estimate.confidence === 'medium' ? "bg-amber-900/30 text-amber-400" : "bg-slate-800 text-slate-400"
                      )}>
                        {estimate.confidence === 'high' ? 'Высокая' : estimate.confidence === 'medium' ? 'Средняя' : 'Низкая'} точность
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${m.textClass}`}>
                      {displayPrimary} <span className="text-sm font-normal text-slate-400">{m.unit}</span>
                    </p>
                    <p className="text-sm font-medium text-slate-400">
                      {sec.round ? Math.round(secVal) : secVal.toFixed(1)} {sec.unit}
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Breakdown Grid */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Макросы</p>
                <div className="flex gap-2 text-xs font-bold text-slate-300">
                  <span>Б: {estimate.proteinG}г</span>
                  <span>Ж: {estimate.fatG}г</span>
                  <span>У: {estimate.carbsG}г</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Электролиты</p>
                <div className="flex flex-wrap gap-x-2 gap-y-0 text-xs font-bold text-slate-300">
                  <span>K: {estimate.potassiumMg}мг</span>
                  <span>Na: {estimate.sodiumMg}мг</span>
                  <span>Mg: {estimate.magnesiumMg}мг</span>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-slate-300 mb-4 italic leading-relaxed border-t border-slate-800 pt-3">
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
