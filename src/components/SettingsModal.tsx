import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { METRICS, metricByKey } from '../metrics';
import { MetricLimits, PrimaryMetric, ModelProvider } from '../types';

const MODEL_OPTIONS: { key: ModelProvider; label: string; description: string }[] = [
  { key: 'llama', label: 'Llama', description: 'Meta Llama 3' },
  { key: 'gemini', label: 'Gemini Flash', description: 'Google Gemini 2.0' },
];

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  metricLimits: MetricLimits;
  setMetricLimits: React.Dispatch<React.SetStateAction<MetricLimits>>;
  primaryMetric: PrimaryMetric;
  setPrimaryMetric: (m: PrimaryMetric) => void;
  modelProvider: ModelProvider;
  setModelProvider: (p: ModelProvider) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  metricLimits,
  setMetricLimits,
  primaryMetric,
  setPrimaryMetric,
  modelProvider,
  setModelProvider,
}: SettingsModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="relative w-full sm:max-w-md bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col"
          >
            <div className="p-6 border-b border-slate-800 flex-shrink-0">
              <h2 className="text-xl font-bold text-white">Настройки</h2>
            </div>

            <div className="overflow-y-auto flex-1 p-6 space-y-6">
              {/* Primary metric */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Основной показатель</p>
                <div className="grid grid-cols-4 gap-1.5">
                  {METRICS.map(m => (
                    <button
                      key={m.key}
                      onClick={() => {
                        setPrimaryMetric(m.key);
                      }}
                      className={[
                        'py-2 rounded-xl text-[10px] font-bold transition-all leading-tight',
                        primaryMetric === m.key
                          ? m.activeClass + ' shadow'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      ].join(' ')}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Model */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Модель AI</p>
                <div className="grid grid-cols-2 gap-2">
                  {MODEL_OPTIONS.map(m => (
                    <button
                      key={m.key}
                      onClick={() => setModelProvider(m.key)}
                      className={[
                        'py-3 px-3 rounded-xl text-left transition-all border',
                        modelProvider === m.key
                          ? 'bg-emerald-900/30 border-emerald-700 shadow'
                          : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                      ].join(' ')}
                    >
                      <span className={`text-sm font-bold block ${modelProvider === m.key ? 'text-emerald-400' : 'text-slate-200'}`}>
                        {m.label}
                      </span>
                      <span className="text-[10px] text-slate-400">{m.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Limits */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Дневные лимиты <span className="text-slate-600 normal-case">(опционально)</span></p>
                <div className="space-y-2">
                  {METRICS.map(m => {
                    const val = metricLimits[m.key];
                    return (
                      <div key={m.key} className="flex items-center gap-2">
                        <span className={`text-xs font-bold w-20 flex-shrink-0 ${metricByKey[m.key].textClass}`}>{m.label}</span>
                        <input
                          type="number"
                          min="0"
                          value={val ?? ''}
                          placeholder={m.defaultLimit ? String(m.defaultLimit) : '—'}
                          onChange={e => {
                            const n = e.target.value === '' ? undefined : parseFloat(e.target.value);
                            setMetricLimits(prev => ({ ...prev, [m.key]: n }));
                          }}
                          className="flex-1 px-3 py-2 rounded-xl text-sm"
                        />
                        <span className="text-xs text-slate-500 w-8 flex-shrink-0">{m.unit}</span>
                        {val !== undefined && (
                          <button
                            onClick={() => setMetricLimits(prev => { const next = { ...prev }; delete next[m.key]; return next; })}
                            className="text-slate-600 hover:text-red-400 transition-colors text-xs font-bold px-1"
                            title="Убрать лимит"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-800 flex-shrink-0">
              <button
                onClick={onClose}
                className="w-full py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-colors"
              >
                Готово
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
