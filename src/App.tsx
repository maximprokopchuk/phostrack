import { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { FoodLogger } from './components/FoodLogger';
import { LogList } from './components/LogList';
import { DialysisTracker } from './components/DialysisTracker';
import { HistoryView } from './components/HistoryView';
import { RecommendationsModal } from './components/RecommendationsModal';
import { MotivationCard } from './components/MotivationCard';
import { SettingsModal } from './components/SettingsModal';
import { CloseDayModal } from './components/CloseDayModal';
import { BottomNav, Tab } from './components/BottomNav';
import { AppHeader } from './components/AppHeader';
import { useSettings } from './hooks/useSettings';
import { useDayStore } from './hooks/useDayStore';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('phosphorus');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRecommendationsOpen, setIsRecommendationsOpen] = useState(false);
  const [isCloseDayOpen, setIsCloseDayOpen] = useState(false);

  const { metricLimits, setMetricLimits, primaryMetric, setPrimaryMetric } = useSettings();
  const { logs, stats, dayStart, dayHistory, addFood, deleteFood, closeDay } = useDayStore(metricLimits);

  // Force dark mode
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const handleCloseDay = () => {
    closeDay();
    setIsCloseDayOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-24 transition-colors duration-300">
      <AppHeader
        onSettings={() => setIsSettingsOpen(true)}
        onCloseDay={() => setIsCloseDayOpen(true)}
        onRecommendations={() => setIsRecommendationsOpen(true)}
      />

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

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        metricLimits={metricLimits}
        setMetricLimits={setMetricLimits}
        primaryMetric={primaryMetric}
        setPrimaryMetric={setPrimaryMetric}
      />

      <AnimatePresence>
        {isRecommendationsOpen && (
          <RecommendationsModal onClose={() => setIsRecommendationsOpen(false)} />
        )}
      </AnimatePresence>

      <CloseDayModal
        isOpen={isCloseDayOpen}
        onClose={() => setIsCloseDayOpen(false)}
        onConfirm={handleCloseDay}
      />
    </div>
  );
}
