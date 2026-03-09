import { LayoutDashboard, Droplets, History } from 'lucide-react';

export type Tab = 'phosphorus' | 'dialysis' | 'history';

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-xl border-t border-slate-800 pb-safe z-40">
      <div className="max-w-2xl mx-auto px-8 h-16 flex items-center justify-around">
        <button
          onClick={() => onTabChange('phosphorus')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'phosphorus' ? 'text-emerald-500 scale-110' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <LayoutDashboard className="w-6 h-6" />
          <span className="text-xs font-bold uppercase">Фосфор</span>
        </button>
        <button
          onClick={() => onTabChange('dialysis')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'dialysis' ? 'text-emerald-500 scale-110' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Droplets className="w-6 h-6" />
          <span className="text-xs font-bold uppercase">Диализ</span>
        </button>
        <button
          onClick={() => onTabChange('history')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'history' ? 'text-emerald-500 scale-110' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <History className="w-6 h-6" />
          <span className="text-xs font-bold uppercase">История</span>
        </button>
      </div>
    </nav>
  );
}
