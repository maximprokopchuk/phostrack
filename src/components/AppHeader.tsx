import { Settings, CalendarCheck, BookOpen } from 'lucide-react';

interface AppHeaderProps {
  onSettings: () => void;
  onCloseDay: () => void;
  onRecommendations: () => void;
}

export function AppHeader({ onSettings, onCloseDay, onRecommendations }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800">
      <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src="/icon.svg" alt="NephroLog" className="w-8 h-8 rounded-lg" />
          <h1 className="text-xl font-bold text-white tracking-tight">NephroLog</h1>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onRecommendations}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-all"
            title="Рекомендации по питанию"
            aria-label="Рекомендации по питанию"
          >
            <BookOpen className="w-5 h-5" />
          </button>
          <button
            onClick={onCloseDay}
            className="p-2 text-emerald-400 border border-emerald-800/50 bg-emerald-900/20 hover:bg-emerald-900/40 rounded-xl transition-all"
            title="Завершить день"
            aria-label="Завершить день"
          >
            <CalendarCheck className="w-5 h-5" />
          </button>
          <button
            onClick={onSettings}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-all"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
