import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { MOTIVATIONS } from '../motivations';

export function MotivationCard() {
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
