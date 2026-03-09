import React, { useState, useEffect } from 'react';
import { DialysisExchange, DailyVitals } from '../types';
import { Plus, Trash2, Activity, Scale, Droplets, Clock, Save, Thermometer } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';

interface DialysisTrackerProps {
  dayStart: number;
}

export const DialysisTracker: React.FC<DialysisTrackerProps> = ({ dayStart }) => {
  const [exchanges, setExchanges] = useState<DialysisExchange[]>([]);
  const [vitals, setVitals] = useState<DailyVitals[]>([]);
  const [showAddExchange, setShowAddExchange] = useState(false);

  // Form states
  const [fill, setFill] = useState('2000');
  const [drain, setDrain] = useState('');
  const [solution, setSolution] = useState('1.5%');

  const [weight, setWeight] = useState('');
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [temperature, setTemperature] = useState('');
  const [savedPulse, setSavedPulse] = useState(false);

  // Load data
  useEffect(() => {
    const savedExchanges = localStorage.getItem('phostrack_exchanges');
    const savedVitals = localStorage.getItem('phostrack_vitals');
    if (savedExchanges) setExchanges(JSON.parse(savedExchanges));
    if (savedVitals) setVitals(JSON.parse(savedVitals));
  }, []);

  // Pre-fill form with today's saved vitals
  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const saved = vitals.find(v => v.date === today);
    if (saved) {
      setWeight(saved.weight ? String(saved.weight) : '');
      setSystolic(saved.systolic ? String(saved.systolic) : '');
      setDiastolic(saved.diastolic ? String(saved.diastolic) : '');
      setTemperature(saved.temperature ? String(saved.temperature) : '');
    }
  }, [vitals]);

  // Save data
  useEffect(() => {
    localStorage.setItem('phostrack_exchanges', JSON.stringify(exchanges));
    localStorage.setItem('phostrack_vitals', JSON.stringify(vitals));
  }, [exchanges, vitals]);

  const addExchange = () => {
    const f = parseInt(fill) || 0;
    const d = parseInt(drain) || 0;
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
      diastolic: parseInt(diastolic) || 0,
      temperature: parseFloat(temperature) || 0
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

    setSavedPulse(true);
    setTimeout(() => setSavedPulse(false), 2000);
  };

  const todayVitals = vitals.find(v => v.date === format(new Date(), 'yyyy-MM-dd'));
  const todayExchanges = exchanges.filter(e => e.timestamp >= dayStart);
  const totalUF = todayExchanges.reduce((sum, e) => sum + e.uf, 0);

  return (
    <div className="space-y-6">
      {/* Daily Vitals Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4 rounded-2xl">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase mb-2">
            <Scale className="w-4 h-4 text-blue-400" /> Вес
          </div>
          <div className="flex items-end gap-1">
            <span className="text-2xl font-black text-white">{todayVitals?.weight || '--'}</span>
            <span className="text-xs text-slate-500 mb-1">кг</span>
          </div>
        </div>
        <div className="glass-card p-4 rounded-2xl">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase mb-2">
            <Activity className="w-4 h-4 text-red-400" /> Давление
          </div>
          <div className="flex items-end gap-1">
            <span className="text-xl font-black text-white">
              {todayVitals ? `${todayVitals.systolic}/${todayVitals.diastolic}` : '--/--'}
            </span>
            <span className="text-xs text-slate-500 mb-1">мм</span>
          </div>
        </div>
        <div className="glass-card p-4 rounded-2xl">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase mb-2">
            <Thermometer className="w-4 h-4 text-orange-400" /> Темп.
          </div>
          <div className="flex items-end gap-1">
            <span className="text-2xl font-black text-white">{todayVitals?.temperature || '--'}</span>
            <span className="text-xs text-slate-500 mb-1">°C</span>
          </div>
        </div>
      </div>

      {/* UF Summary */}
      <div className="glass-card p-6 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Droplets className="w-24 h-24 text-emerald-500" />
        </div>
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Ультрафильтрация (Сегодня)</h3>
        <div className="flex items-baseline gap-2">
          <span className={`text-5xl font-black ${totalUF >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {totalUF > 0 ? `+${totalUF}` : totalUF}
          </span>
          <span className="text-slate-500 font-bold">мл</span>
        </div>
        <p className="text-xs text-slate-400 mt-2">Всего обменов: {todayExchanges.length}</p>
      </div>

      {/* Vitals Form */}
      <div className="glass-card p-6 rounded-3xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white">Замер показателей</h3>
          {(weight || systolic || diastolic || temperature) && (
            <button
              onClick={() => { setWeight(''); setSystolic(''); setDiastolic(''); setTemperature(''); }}
              className="text-[10px] font-bold text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-wide"
            >
              Сброс
            </button>
          )}
        </div>

        {/* Row 1: Weight + Temperature */}
        <div className="grid grid-cols-2 gap-3 mb-3" onKeyDown={e => { if (e.key === 'Enter') saveVitals(); }}>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
              <Scale className="w-3 h-3 text-blue-400" /> Вес, кг
            </label>
            <input
              type="number"
              step="0.1"
              min="20"
              max="250"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl text-sm ${weight && (parseFloat(weight) < 20 || parseFloat(weight) > 250) ? 'ring-2 ring-red-500' : ''}`}
              placeholder="70.0"
            />
            {weight && (parseFloat(weight) < 20 || parseFloat(weight) > 250) && (
              <p className="text-[10px] text-red-400">20–250 кг</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
              <Thermometer className="w-3 h-3 text-orange-400" /> Температура, °C
            </label>
            <input
              type="number"
              step="0.1"
              min="35"
              max="42"
              value={temperature}
              onChange={e => setTemperature(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl text-sm ${temperature && (parseFloat(temperature) < 35 || parseFloat(temperature) > 42) ? 'ring-2 ring-red-500' : ''}`}
              placeholder="36.6"
            />
            {temperature && (parseFloat(temperature) < 35 || parseFloat(temperature) > 42) && (
              <p className="text-[10px] text-red-400">35.0–42.0 °C</p>
            )}
          </div>
        </div>

        {/* Row 2: Blood pressure group */}
        <div className="space-y-2" onKeyDown={e => { if (e.key === 'Enter') saveVitals(); }}>
          <p className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
            <Activity className="w-3 h-3 text-red-400" /> Артериальное давление, мм рт.ст.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-600 uppercase">Систолическое (верхнее)</label>
              <input
                type="number"
                min="60"
                max="250"
                value={systolic}
                onChange={e => setSystolic(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl text-sm ${systolic && (parseInt(systolic) < 60 || parseInt(systolic) > 250) ? 'ring-2 ring-red-500' : ''}`}
                placeholder="120"
              />
              {systolic && (parseInt(systolic) < 60 || parseInt(systolic) > 250) && (
                <p className="text-[10px] text-red-400">60–250</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-slate-600 uppercase">Диастолическое (нижнее)</label>
              <input
                type="number"
                min="40"
                max="150"
                value={diastolic}
                onChange={e => setDiastolic(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl text-sm ${diastolic && (parseInt(diastolic) < 40 || parseInt(diastolic) > 150) ? 'ring-2 ring-red-500' : ''}`}
                placeholder="80"
              />
              {diastolic && (parseInt(diastolic) < 40 || parseInt(diastolic) > 150) && (
                <p className="text-[10px] text-red-400">40–150</p>
              )}
            </div>
          </div>
        </div>

        {(() => {
          const allFilled = weight && systolic && diastolic && temperature;
          const weightOk = !weight || (parseFloat(weight) >= 20 && parseFloat(weight) <= 250);
          const systolicOk = !systolic || (parseInt(systolic) >= 60 && parseInt(systolic) <= 250);
          const diastolicOk = !diastolic || (parseInt(diastolic) >= 40 && parseInt(diastolic) <= 150);
          const temperatureOk = !temperature || (parseFloat(temperature) >= 35 && parseFloat(temperature) <= 42);
          const hasInvalid = (weight && !weightOk) || (systolic && !systolicOk) || (diastolic && !diastolicOk) || (temperature && !temperatureOk);
          const valid = allFilled && weightOk && systolicOk && diastolicOk && temperatureOk;
          return (
            <button
              onClick={saveVitals}
              disabled={!valid}
              className={`w-full mt-4 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                savedPulse
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 cursor-pointer'
                  : valid
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/30 cursor-pointer'
                  : hasInvalid
                  ? 'bg-red-900/40 text-red-400 cursor-not-allowed'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Save className="w-4 h-4" />
              {savedPulse ? 'Сохранено!' : hasInvalid ? 'Проверьте значения' : allFilled ? 'Сохранить замеры' : 'Заполните все поля'}
            </button>
          );
        })()}
      </div>

      {/* Exchanges List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Протокол обменов</h3>
          <button
            onClick={() => setShowAddExchange(true)}
            className="p-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <AnimatePresence>
          {todayExchanges.map((ex, idx) => (
            <motion.div
              key={ex.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-4 rounded-2xl flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 font-bold text-xs">
                  #{todayExchanges.length - idx}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{ex.solutionType}</span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {format(ex.timestamp, 'HH:mm')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
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
                  className="p-2 text-slate-500 hover:text-red-500 transition-all"
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
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm glass-card p-6 rounded-3xl"
            >
              <h3 className="text-xl font-bold text-white mb-6">Новый обмен</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Раствор</label>
                  <div className="flex gap-2">
                    {['1.5%', '2.5%', '4.25%', 'Экстранил'].map(type => (
                      <button
                        key={type}
                        onClick={() => setSolution(type)}
                        className={`flex-1 py-2 rounded-xl text-[10px] font-bold transition-all ${
                          solution === type ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Влито (мл)</label>
                    <input
                      type="number"
                      value={fill}
                      onChange={e => setFill(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Слито (мл)</label>
                    <input
                      type="number"
                      value={drain}
                      onChange={e => setDrain(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl"
                      placeholder="2200"
                      autoFocus
                    />
                  </div>
                </div>
                <button
                  onClick={addExchange}
                  disabled={!drain}
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold mt-4 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
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
