import React, { useState, useEffect } from 'react';
import { DialysisExchange, DailyVitals } from '../types';
import { Plus, Trash2, Activity, Scale, Droplets, Clock, Save } from 'lucide-react';
import { format, startOfDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';

export const DialysisTracker: React.FC = () => {
  const [exchanges, setExchanges] = useState<DialysisExchange[]>([]);
  const [vitals, setVitals] = useState<DailyVitals[]>([]);
  const [showAddExchange, setShowAddExchange] = useState(false);

  // Form states
  const [fill, setFill] = useState('2000');
  const [drain, setDrain] = useState('');
  const [solution, setSolution] = useState('1.5%');
  const [drainError, setDrainError] = useState<string | null>(null);

  const [weight, setWeight] = useState('');
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');

  // Load data
  useEffect(() => {
    const savedExchanges = localStorage.getItem('phostrack_exchanges');
    const savedVitals = localStorage.getItem('phostrack_vitals');
    if (savedExchanges) setExchanges(JSON.parse(savedExchanges));
    if (savedVitals) setVitals(JSON.parse(savedVitals));
  }, []);

  // Save data
  useEffect(() => {
    localStorage.setItem('phostrack_exchanges', JSON.stringify(exchanges));
    localStorage.setItem('phostrack_vitals', JSON.stringify(vitals));
  }, [exchanges, vitals]);

  const addExchange = () => {
    const f = parseInt(fill) || 0;
    const d = parseInt(drain) || 0;

    if (d < 0) {
      setDrainError('Объём слитого не может быть отрицательным.');
      return;
    }
    setDrainError(null);

    const newExchange: DialysisExchange = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      fillVolume: f,
      drainVolume: d,
      uf: d - f,
      solutionType: solution
    };
    setExchanges([newExchange, ...exchanges]);
    setShowAddExchange(false);
    setDrain('');
  };

  const deleteExchange = (id: string) => {
    setExchanges(exchanges.filter(e => e.id !== id));
  };

  const saveVitals = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const newVital: DailyVitals = {
      id: crypto.randomUUID(),
      date: today,
      weight: parseFloat(weight) || 0,
      systolic: parseInt(systolic) || 0,
      diastolic: parseInt(diastolic) || 0
    };

    // Update or add
    const existingIndex = vitals.findIndex(v => v.date === today);
    if (existingIndex > -1) {
      const updated = [...vitals];
      updated[existingIndex] = newVital;
      setVitals(updated);
    } else {
      setVitals([newVital, ...vitals]);
    }
  };

  const todayVitals = vitals.find(v => v.date === format(new Date(), 'yyyy-MM-dd'));
  const todayExchanges = exchanges.filter(e => startOfDay(e.timestamp).getTime() === startOfDay(new Date()).getTime());
  // Sort by timestamp ascending so #1 = first exchange of the day
  const sortedExchanges = [...todayExchanges].sort((a, b) => a.timestamp - b.timestamp);
  const totalUF = todayExchanges.reduce((sum, e) => sum + e.uf, 0);

  return (
    <div className="space-y-6">
      {/* Daily Vitals Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-4 rounded-2xl">
          <div className="flex items-center gap-2 dark:text-slate-400 text-gray-500 text-xs font-bold uppercase mb-2">
            <Scale className="w-4 h-4 text-blue-400" /> Вес
          </div>
          <div className="flex items-end gap-1">
            <span className="text-2xl font-black dark:text-white text-gray-900">{todayVitals?.weight || '--'}</span>
            <span className="text-xs dark:text-slate-500 text-gray-400 mb-1">кг</span>
          </div>
        </div>
        <div className="glass-card p-4 rounded-2xl">
          <div className="flex items-center gap-2 dark:text-slate-400 text-gray-500 text-xs font-bold uppercase mb-2">
            <Activity className="w-4 h-4 text-red-400" /> Давление
          </div>
          <div className="flex items-end gap-1">
            <span className="text-2xl font-black dark:text-white text-gray-900">
              {todayVitals ? `${todayVitals.systolic}/${todayVitals.diastolic}` : '--/--'}
            </span>
            <span className="text-xs dark:text-slate-500 text-gray-400 mb-1">мм</span>
          </div>
        </div>
      </div>

      {/* UF Summary */}
      <div className="glass-card p-6 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Droplets className="w-24 h-24 text-emerald-500" />
        </div>
        <h3 className="text-sm font-bold dark:text-slate-400 text-gray-500 uppercase tracking-wider mb-4">Ультрафильтрация (Сегодня)</h3>
        <div className="flex items-baseline gap-2">
          <span className={`text-5xl font-black ${totalUF >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {totalUF > 0 ? `+${totalUF}` : totalUF}
          </span>
          <span className="dark:text-slate-500 text-gray-400 font-bold">мл</span>
        </div>
        <p className="text-xs dark:text-slate-400 text-gray-500 mt-2">Всего обменов: {todayExchanges.length}</p>
      </div>

      {/* Vitals Form */}
      <div className="glass-card p-6 rounded-3xl">
        <h3 className="text-sm font-bold dark:text-white text-gray-900 mb-4">Замер показателей</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold dark:text-slate-500 text-gray-400 uppercase">Вес (кг)</label>
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm"
              placeholder="0.0"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold dark:text-slate-500 text-gray-400 uppercase">САД</label>
            <input
              type="number"
              value={systolic}
              onChange={e => setSystolic(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm"
              placeholder="120"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold dark:text-slate-500 text-gray-400 uppercase">ДАД</label>
            <input
              type="number"
              value={diastolic}
              onChange={e => setDiastolic(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm"
              placeholder="80"
            />
          </div>
        </div>
        <button
          onClick={saveVitals}
          className="w-full mt-4 py-3 dark:bg-slate-800 bg-gray-100 dark:hover:bg-slate-700 hover:bg-gray-200 dark:text-white text-gray-900 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <Save className="w-4 h-4" /> Сохранить замеры
        </button>
      </div>

      {/* Exchanges List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold dark:text-slate-500 text-gray-400 uppercase tracking-widest">Протокол обменов</h3>
          <button
            onClick={() => setShowAddExchange(true)}
            className="p-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <AnimatePresence>
          {sortedExchanges.map((ex, idx) => (
            <motion.div
              key={ex.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-4 rounded-2xl flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 dark:bg-slate-800 bg-gray-100 rounded-xl flex items-center justify-center dark:text-slate-400 text-gray-500 font-bold text-xs">
                  #{idx + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold dark:text-white text-gray-900">{ex.solutionType}</span>
                    <span className="text-[10px] dark:text-slate-500 text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {format(ex.timestamp, 'HH:mm')}
                    </span>
                  </div>
                  <p className="text-xs dark:text-slate-400 text-gray-500 mt-0.5">
                    Влито: {ex.fillVolume} | Слито: {ex.drainVolume}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`font-black ${ex.uf >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {ex.uf > 0 ? `+${ex.uf}` : ex.uf}
                </span>
                <button
                  onClick={() => deleteExchange(ex.id)}
                  className="p-2 text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Exchange Modal */}
      <AnimatePresence>
        {showAddExchange && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddExchange(false)}
              className="absolute inset-0 dark:bg-slate-950/80 bg-gray-900/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm glass-card p-6 rounded-3xl"
            >
              <h3 className="text-xl font-bold dark:text-white text-gray-900 mb-6">Новый обмен</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold dark:text-slate-500 text-gray-400 uppercase mb-2">Раствор</label>
                  <div className="flex gap-2">
                    {['1.5%', '2.5%', '4.25%', 'Экстранил'].map(type => (
                      <button
                        key={type}
                        onClick={() => setSolution(type)}
                        className={`flex-1 py-2 rounded-xl text-[10px] font-bold transition-all ${
                          solution === type ? 'bg-emerald-600 text-white' : 'dark:bg-slate-800 bg-gray-100 dark:text-slate-400 text-gray-600'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold dark:text-slate-500 text-gray-400 uppercase">Влито (мл)</label>
                    <input
                      type="number"
                      value={fill}
                      onChange={e => setFill(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold dark:text-slate-500 text-gray-400 uppercase">Слито (мл)</label>
                    <input
                      type="number"
                      value={drain}
                      onChange={e => { setDrain(e.target.value); setDrainError(null); }}
                      className="w-full px-4 py-3 rounded-xl"
                      placeholder="2200"
                    />
                    {drainError && (
                      <p className="text-xs text-red-400 mt-1">{drainError}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={addExchange}
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold mt-4 hover:bg-emerald-700 transition-colors"
                >
                  Добавить обмен
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
