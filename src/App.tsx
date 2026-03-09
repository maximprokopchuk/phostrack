import { useState, useEffect, useMemo } from 'react';
import { Dashboard } from './components/Dashboard';
import { FoodLogger } from './components/FoodLogger';
import { LogList } from './components/LogList';
import { DialysisTracker } from './components/DialysisTracker';
import { HistoryView } from './components/HistoryView';
import { FoodItem, DailyStats, PhosphateEstimate, DayRecord, DialysisExchange, DailyVitals, PrimaryMetric, MetricLimits } from './types';
import { METRICS, metricByKey } from './metrics';
import { Settings, LayoutDashboard, Droplets, CalendarCheck, History, BookOpen, Sparkles } from 'lucide-react';
import { RecommendationsModal } from './components/RecommendationsModal';
import { motion, AnimatePresence } from 'motion/react';
import { startOfDay, format } from 'date-fns';

const MOTIVATIONS = [
  { emoji: '🌅', text: 'Диализ — это не конец пути, а его новая глава. Каждый прожитый день наполнен смыслом — даже если кажется обычным.' },
  { emoji: '💪', text: 'Ты справляешься с тем, с чем справляются единицы. Это требует огромной силы — и ты носишь её в себе каждый день.' },
  { emoji: '🏠', text: 'Перитонеальный диализ — это свобода. Ты лечишься дома, в своём темпе, в своей жизни. Это сила, а не ограничение.' },
  { emoji: '❤️', text: 'Рядом с тобой люди, которые тебя любят. Ты нужен им — именно таким, какой ты есть прямо сейчас.' },
  { emoji: '✨', text: 'Нечего бояться. Медицина шагнула далеко вперёд, и тысячи людей на перитонеальном диализе живут активно и радуются жизни.' },
  { emoji: '🎯', text: 'Следить за питанием — это не ограничение, а забота о себе. Каждый правильный выбор на тарелке — маленькая, но настоящая победа.' },
  { emoji: '🌊', text: 'Трудности закаляют, а не ломают. Ты уже прошёл через столько — и стоишь здесь. Это не слабость, это стойкость.' },
  { emoji: '☀️', text: 'Позволь себе радоваться мелочам — утреннему кофе, разговору с близким, хорошей книге. Полная жизнь — это жизнь настоящая.' },
  { emoji: '🦋', text: 'Диализ — часть твоей жизни, но далеко не вся она. Ты — намного, намного больше, чем твой диагноз.' },
  { emoji: '🌙', text: 'Пока ты спишь, аппарат делает свою работу. Ты просыпаешься — и день твой. Это и есть свобода перитонеального диализа.' },
  { emoji: '🔥', text: 'Люди на диализе получают образование, растят детей, строят бизнес и влюбляются. Твои возможности — не позади, они всё ещё впереди.' },
  { emoji: '🗓️', text: 'Ты сам выстраиваешь своё расписание. Перитонеальный диализ даёт тебе это право — распоряжаться своим временем.' },
  { emoji: '🎶', text: 'Жизнь не стала меньше — она стала иной. И в этой новой жизни всё равно есть место музыке, смеху и теплу.' },
  { emoji: '🧭', text: 'Ты знаешь своё тело лучше, чем кто-либо. Ты знаешь свои пределы и как их расширять. Это мудрость, которую не купить.' },
  { emoji: '🌍', text: 'С перитонеальным диализом люди путешествуют, берут расходники с собой и видят мир. Это не клетка — это просто чемодан побольше.' },
  { emoji: '💙', text: 'Каждое утро, которое ты встречаешь — это ещё один шанс. Ещё один день, который принадлежит тебе.' },
  { emoji: '🌱', text: 'Ты вложил столько усилий в своё здоровье — это видно. Организм чувствует заботу. Продолжай — это работает.' },
  { emoji: '⭐', text: 'Самое сложное — это принятие. Ты уже это сделал. Дальше — просто жить. И это прекрасно.' },
  { emoji: '🎉', text: 'Сегодня хороший день уже только потому, что ты в нём. Дай себе это признать.' },
  { emoji: '🕊️', text: 'Страх уходит, когда живёшь настоящим. Не завтра, не вчера — прямо сейчас ты в порядке. И это главное.' },
  { emoji: '🧘', text: 'Лечиться дома — значит оставаться в своей среде, рядом с близкими. Это не просто удобство, это качество жизни.' },
  { emoji: '🌟', text: 'Каждый замер, каждый дневник, каждое взвешивание — это не рутина. Это ты берёшь своё здоровье в собственные руки.' },
];

function MotivationCard() {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * MOTIVATIONS.length));
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % MOTIVATIONS.length);
        setVisible(true);
      }, 400);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const m = MOTIVATIONS[idx];
  return (
    <div className="mt-12 p-6 bg-emerald-900/10 rounded-3xl border border-emerald-900/20 flex gap-4 shadow-sm overflow-hidden">
      <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-emerald-400 flex-shrink-0 mt-0.5">
        <Sparkles className="w-5 h-5" />
      </div>
      <div
        className="transition-opacity duration-400"
        style={{ opacity: visible ? 1 : 0 }}
      >
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-base leading-none">{m.emoji}</span>
          <h4 className="font-bold text-emerald-100 text-sm">На сегодня</h4>
        </div>
        <p className="text-sm text-emerald-300/80 leading-relaxed">{m.text}</p>
      </div>
    </div>
  );
}

type Tab = 'phosphorus' | 'dialysis' | 'history';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('phosphorus');
  const [logs, setLogs] = useState<FoodItem[]>([]);
  const [metricLimits, setMetricLimits] = useState<MetricLimits>(() => {
    try {
      const saved = localStorage.getItem('phostrack_metric_limits');
      if (saved) return JSON.parse(saved);
    } catch {}
    // Migrate from old individual keys
    const oldPhosphor = localStorage.getItem('phostrack_limit');
    const oldCal = localStorage.getItem('phostrack_cal_limit');
    return {
      phosphorus: oldPhosphor ? parseInt(oldPhosphor, 10) : 800,
      calories: oldCal ? parseInt(oldCal, 10) : 2000,
    };
  });
  const [primaryMetric, setPrimaryMetric] = useState<PrimaryMetric>(
    () => (localStorage.getItem('phostrack_primary_metric') as PrimaryMetric) ?? 'calories'
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRecommendationsOpen, setIsRecommendationsOpen] = useState(false);
  const [isCloseDayOpen, setIsCloseDayOpen] = useState(false);
  const [dayStart, setDayStart] = useState<number>(() => {
    const saved = localStorage.getItem('phostrack_day_start');
    return saved ? parseInt(saved, 10) : startOfDay(new Date()).getTime();
  });
  const [dayHistory, setDayHistory] = useState<DayRecord[]>(() => {
    try {
      const saved = localStorage.getItem('phostrack_day_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Force dark mode
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Load data
  useEffect(() => {
    const savedLogs = localStorage.getItem('phostrack_logs');
    if (savedLogs) {
      try {
        const parsed = JSON.parse(savedLogs);
        setLogs(parsed.filter((log: FoodItem) => log.timestamp >= dayStart));
      } catch (e) {
        console.error('Failed to load logs', e);
      }
    }
  }, []);

  // Save logs
  useEffect(() => {
    localStorage.setItem('phostrack_logs', JSON.stringify(logs));
  }, [logs]);

  // Save metric limits
  useEffect(() => {
    localStorage.setItem('phostrack_metric_limits', JSON.stringify(metricLimits));
  }, [metricLimits]);

  // Persist dayStart
  useEffect(() => {
    localStorage.setItem('phostrack_day_start', String(dayStart));
  }, [dayStart]);

  const stats: DailyStats = useMemo(() => {
    const total = logs.reduce((sum, item) => sum + item.phosphateMg, 0);
    const totalCals = logs.reduce((sum, item) => sum + (item.calories || 0), 0);
    const totalProtein = logs.reduce((sum, item) => sum + (item.proteinG || 0), 0);
    const totalFat = logs.reduce((sum, item) => sum + (item.fatG || 0), 0);
    const totalCarbs = logs.reduce((sum, item) => sum + (item.carbsG || 0), 0);
    const totalPotassium = logs.reduce((sum, item) => sum + (item.potassiumMg || 0), 0);
    const totalMagnesium = logs.reduce((sum, item) => sum + (item.magnesiumMg || 0), 0);
    const totalSodium = logs.reduce((sum, item) => sum + (item.sodiumMg || 0), 0);

    const phosphorLimit = metricLimits.phosphorus ?? 800;
    const calLimit = metricLimits.calories ?? 2000;
    return {
      totalMg: total,
      limitMg: phosphorLimit,
      remainingMg: Math.max(0, phosphorLimit - total),
      percentage: (total / phosphorLimit) * 100,
      totalCalories: totalCals,
      calorieLimit: calLimit,
      totalProtein,
      totalFat,
      totalCarbs,
      totalPotassium,
      totalMagnesium,
      totalSodium
    };
  }, [logs, metricLimits]);

  const addFood = (estimate: PhosphateEstimate) => {
    const newItem: FoodItem = {
      id: crypto.randomUUID(),
      name: estimate.foodName,
      phosphateMg: estimate.phosphateMg,
      calories: estimate.calories,
      proteinG: estimate.proteinG,
      fatG: estimate.fatG,
      carbsG: estimate.carbsG,
      potassiumMg: estimate.potassiumMg,
      magnesiumMg: estimate.magnesiumMg,
      sodiumMg: estimate.sodiumMg,
      amountGrams: 0,
      timestamp: Date.now()
    };
    setLogs([newItem, ...logs]);
  };

  const deleteFood = (id: string) => {
    setLogs(logs.filter(item => item.id !== id));
  };

  const closeDay = () => {
    const now = Date.now();

    // Capture food logs for this day
    let dayLogs: FoodItem[] = [];
    try {
      const rawLogs = localStorage.getItem('phostrack_logs');
      if (rawLogs) {
        const allLogs: FoodItem[] = JSON.parse(rawLogs);
        dayLogs = allLogs.filter(l => l.timestamp >= dayStart && l.timestamp < now);
      }
    } catch { /* ignore */ }

    // Capture dialysis exchanges for this day
    let dayExchanges: DialysisExchange[] = [];
    try {
      const rawExchanges = localStorage.getItem('phostrack_exchanges');
      if (rawExchanges) {
        const allExchanges: DialysisExchange[] = JSON.parse(rawExchanges);
        dayExchanges = allExchanges.filter(e => e.timestamp >= dayStart && e.timestamp < now);
      }
    } catch { /* ignore */ }

    // Find vitals for this day (match by date string of dayStart)
    let dayVitals: DailyVitals | null = null;
    try {
      const rawVitals = localStorage.getItem('phostrack_vitals');
      if (rawVitals) {
        const allVitals: DailyVitals[] = JSON.parse(rawVitals);
        const dayDateStr = format(dayStart, 'yyyy-MM-dd');
        dayVitals = allVitals.find(v => v.date === dayDateStr) ?? null;
      }
    } catch { /* ignore */ }

    const record: DayRecord = {
      id: crypto.randomUUID(),
      dayStart,
      dayEnd: now,
      logs: dayLogs,
      exchanges: dayExchanges,
      vitals: dayVitals,
      totalPhosphateMg: dayLogs.reduce((s, l) => s + l.phosphateMg, 0),
      totalCalories: dayLogs.reduce((s, l) => s + (l.calories || 0), 0),
      totalUF: dayExchanges.reduce((s, e) => s + e.uf, 0),
    };

    const updatedHistory = [record, ...dayHistory];
    localStorage.setItem('phostrack_day_history', JSON.stringify(updatedHistory));
    setDayHistory(updatedHistory);

    const newStart = now;
    setDayStart(newStart);
    localStorage.setItem('phostrack_day_start', String(newStart));
    setLogs([]);
    setIsCloseDayOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-24 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/icon.svg" alt="NephroLog" className="w-8 h-8 rounded-lg" />
            <h1 className="text-xl font-bold text-white tracking-tight">NephroLog</h1>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsRecommendationsOpen(true)}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-all"
              title="Рекомендации по питанию"
              aria-label="Рекомендации по питанию"
            >
              <BookOpen className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsCloseDayOpen(true)}
              className="p-2 text-emerald-400 border border-emerald-800/50 bg-emerald-900/20 hover:bg-emerald-900/40 rounded-xl transition-all"
              title="Завершить день"
              aria-label="Завершить день"
            >
              <CalendarCheck className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-all"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-8 pb-24" style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))' }}>
        <AnimatePresence mode="wait">
          {activeTab === 'phosphorus' && (
            <motion.div
              key="phosphorus"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Dashboard stats={stats} primaryMetric={primaryMetric} metricLimits={metricLimits} />
              <div className="mb-10">
                <FoodLogger onAdd={addFood} primaryMetric={primaryMetric} />
              </div>
              <LogList items={logs} onDelete={deleteFood} primaryMetric={primaryMetric} />

              <MotivationCard />
            </motion.div>
          )}
          {activeTab === 'dialysis' && (
            <motion.div
              key="dialysis"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <DialysisTracker dayStart={dayStart} />
            </motion.div>
          )}
          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <HistoryView dayHistory={dayHistory} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-xl border-t border-slate-800 pb-safe z-40">
        <div className="max-w-2xl mx-auto px-8 h-16 flex items-center justify-around">
          <button
            onClick={() => setActiveTab('phosphorus')}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'phosphorus' ? 'text-emerald-500 scale-110' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <LayoutDashboard className="w-6 h-6" />
            <span className="text-xs font-bold uppercase">Фосфор</span>
          </button>
          <button
            onClick={() => setActiveTab('dialysis')}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'dialysis' ? 'text-emerald-500 scale-110' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Droplets className="w-6 h-6" />
            <span className="text-xs font-bold uppercase">Диализ</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'history' ? 'text-emerald-500 scale-110' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <History className="w-6 h-6" />
            <span className="text-xs font-bold uppercase">История</span>
          </button>
        </div>
      </nav>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
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
                          localStorage.setItem('phostrack_primary_metric', m.key);
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
                  onClick={() => setIsSettingsOpen(false)}
                  className="w-full py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-colors"
                >
                  Готово
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Recommendations Modal */}
      <AnimatePresence>
        {isRecommendationsOpen && (
          <RecommendationsModal onClose={() => setIsRecommendationsOpen(false)} />
        )}
      </AnimatePresence>

      {/* Close Day Confirmation Modal */}
      <AnimatePresence>
        {isCloseDayOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCloseDayOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-slate-900 rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-400">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-white">Завершить день?</h2>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                Все записи будут сохранены в истории. Начнётся новый день.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsCloseDayOpen(false)}
                  className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-2xl font-bold hover:bg-slate-700 transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={closeDay}
                  className="flex-1 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-colors"
                >
                  Завершить день
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
