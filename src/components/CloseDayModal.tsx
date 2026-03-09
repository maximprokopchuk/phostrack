import { motion, AnimatePresence } from 'motion/react';
import { CalendarCheck } from 'lucide-react';

interface CloseDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function CloseDayModal({ isOpen, onClose, onConfirm }: CloseDayModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
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
                onClick={onClose}
                className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-2xl font-bold hover:bg-slate-700 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-colors"
              >
                Завершить день
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
