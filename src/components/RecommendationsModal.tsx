import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../utils';

interface RecommendationsModalProps {
  onClose: () => void;
}

interface Section {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  accentClass: string;
  content: React.ReactNode;
}

const SECTIONS: Section[] = [
  {
    id: 'phosphorus',
    emoji: '🧪',
    title: 'Фосфор',
    subtitle: 'Лимит 800–1000 мг/сут',
    accentClass: 'border-emerald-800/60 bg-emerald-900/10',
    content: (
      <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
        <p>
          При ХБП 5 стадии почки не выводят фосфор. Его избыток вызывает вторичный гиперпаратиреоз,
          кальцификацию сосудов и костную болезнь.
        </p>
        <div>
          <p className="font-bold text-white mb-1">⚠️ Главное правило: органический ≠ неорганический</p>
          <p>
            Фосфор из натуральных продуктов (мясо, яйца, бобовые) усваивается на 40–60%.
            Неорганические фосфатные добавки <span className="text-red-400 font-bold">E338–E343</span> усваиваются почти на 100% — их нужно избегать полностью.
          </p>
        </div>
        <div>
          <p className="font-bold text-red-400 mb-1">Запрещено / строго ограничить:</p>
          <ul className="space-y-0.5 text-slate-400 list-disc list-inside">
            <li>Газированные напитки (особенно cola — до 500 мг/банка)</li>
            <li>Переработанные мясные изделия: сосиски, колбаса, ветчина</li>
            <li>Плавленый сыр, фаст-фуд, полуфабрикаты</li>
            <li>Консервы с добавками на этикетке</li>
            <li>Орехи, семена, отруби, цельнозерновые в большом количестве</li>
          </ul>
        </div>
        <div>
          <p className="font-bold text-emerald-400 mb-1">Разрешено умеренно:</p>
          <ul className="space-y-0.5 text-slate-400 list-disc list-inside">
            <li>Яйца (белок — меньше фосфора, чем в желтке)</li>
            <li>Мясо и рыба: 1 порция ~90–120 г в день</li>
            <li>Белый рис, макароны из белой муки, белый хлеб</li>
          </ul>
        </div>
        <div className="p-3 bg-slate-800/60 rounded-xl text-xs text-slate-400">
          <strong className="text-slate-200">Фосфат-связывающие препараты</strong> (карбонат кальция, севеламер и др.) принимаются
          строго <strong className="text-slate-200">во время еды</strong>, а не до и не после — только так они связывают фосфор из пищи.
        </div>
      </div>
    ),
  },
  {
    id: 'protein',
    emoji: '🥩',
    title: 'Белок',
    subtitle: '1.2–1.5 г/кг массы тела в сутки',
    accentClass: 'border-blue-800/60 bg-blue-900/10',
    content: (
      <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
        <p>
          В отличие от додиализных стадий, при перитонеальном диализе потребность в белке
          <span className="text-white font-bold"> повышена</span> — диализат уносит до 5–15 г белка в сутки (альбумин, аминокислоты).
          Недоедание белка ведёт к гипоальбуминемии и повышенной смертности.
        </p>
        <div>
          <p className="font-bold text-blue-400 mb-1">Рекомендуемые источники:</p>
          <ul className="space-y-0.5 text-slate-400 list-disc list-inside">
            <li>Куриная грудка, индейка (высокий белок, умеренный фосфор)</li>
            <li>Яичный белок — идеальное соотношение белок/фосфор</li>
            <li>Рыба нежирная: треска, минтай, судак</li>
            <li>Говядина нежирная (умеренно)</li>
          </ul>
        </div>
        <div className="p-3 bg-slate-800/60 rounded-xl text-xs text-slate-400">
          <strong className="text-slate-200">Практика:</strong> при весе 70 кг цель — 84–105 г белка в сутки.
          Это ~3 порции мяса/рыбы/яиц по 150 г каждая.
        </div>
      </div>
    ),
  },
  {
    id: 'calories',
    emoji: '⚡',
    title: 'Калории',
    subtitle: '25–35 ккал/кг массы тела в сутки',
    accentClass: 'border-amber-800/60 bg-amber-900/10',
    content: (
      <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
        <p>
          При перитонеальном диализе организм <strong className="text-white">всасывает глюкозу из диализата</strong> — в среднем
          100–200 г в сутки (400–800 ккал). Это нужно учитывать при планировании питания.
        </p>
        <div>
          <p className="font-bold text-amber-400 mb-1">Важные нюансы:</p>
          <ul className="space-y-1 text-slate-400 list-disc list-inside">
            <li>При использовании 4.25% раствора калорийность из диализата выше — снижайте еду соответственно</li>
            <li>Избыток калорий из диализата → ожирение, гипергликемия, гиперлипидемия</li>
            <li>Недостаток калорий из еды → катаболизм белка (мышечное истощение)</li>
          </ul>
        </div>
        <div className="p-3 bg-slate-800/60 rounded-xl text-xs text-slate-400">
          Предпочтительные источники энергии: оливковое масло, сливочное масло, белый рис,
          макароны, хлеб — продукты с низким содержанием калия, фосфора и натрия.
        </div>
      </div>
    ),
  },
  {
    id: 'potassium',
    emoji: '🍌',
    title: 'Калий',
    subtitle: '2000–2500 мг/сут (при сохранении диуреза — до 3000)',
    accentClass: 'border-violet-800/60 bg-violet-900/10',
    content: (
      <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
        <p>
          Перитонеальный диализ выводит калий менее эффективно, чем гемодиализ.
          Гиперкалиемия опасна аритмиями. При сохранённом диурезе ограничение мягче.
        </p>
        <div>
          <p className="font-bold text-red-400 mb-1">Высокий калий — ограничить:</p>
          <ul className="space-y-0.5 text-slate-400 list-disc list-inside">
            <li>Бананы, авокадо, курага, изюм, чернослив</li>
            <li>Картофель (вымачивать!), помидоры, шпинат</li>
            <li>Орехи, бобовые, шоколад, кофе</li>
            <li>Апельсиновый и томатный сок</li>
          </ul>
        </div>
        <div>
          <p className="font-bold text-emerald-400 mb-1">Техника снижения калия в овощах:</p>
          <p className="text-slate-400">
            Очистить → нарезать мелко → замочить в холодной воде на 2+ часа → слить воду → варить
            в большом объёме воды → слить отвар. Снижает калий на 30–50%.
          </p>
        </div>
        <div>
          <p className="font-bold text-violet-400 mb-1">Низкий калий — можно:</p>
          <ul className="space-y-0.5 text-slate-400 list-disc list-inside">
            <li>Яблоки, груши, виноград, черника</li>
            <li>Капуста, огурцы, лук, чеснок</li>
            <li>Белый рис, макароны, хлеб</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: 'sodium',
    emoji: '🧂',
    title: 'Натрий',
    subtitle: '1500–2000 мг/сут (менее 5 г поваренной соли)',
    accentClass: 'border-cyan-800/60 bg-cyan-900/10',
    content: (
      <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
        <p>
          Избыток натрия вызывает жажду → избыточный приём жидкости → перегрузка объёмом →
          гипертония, отёки, сердечная недостаточность. Контроль натрия — основа контроля жидкости.
        </p>
        <div>
          <p className="font-bold text-red-400 mb-1">Скрытый натрий — главная ловушка:</p>
          <ul className="space-y-0.5 text-slate-400 list-disc list-inside">
            <li>Хлеб и выпечка (до 400 мг/100 г)</li>
            <li>Сыр (300–700 мг/100 г)</li>
            <li>Соусы: соевый, кетчуп, горчица</li>
            <li>Консервы, маринады, соленья</li>
            <li>Готовые бульоны, кубики, суповые смеси</li>
          </ul>
        </div>
        <div className="p-3 bg-slate-800/60 rounded-xl text-xs text-slate-400">
          <strong className="text-slate-200">Практика:</strong> готовьте дома без соли, добавляйте
          в тарелке только щепотку. Используйте лимон, зелень, чеснок, специи без соли.
          Не используйте <strong className="text-red-400">заменители соли с калием</strong> (KCl) — они резко повышают калий.
        </div>
      </div>
    ),
  },
  {
    id: 'fluid',
    emoji: '💧',
    title: 'Жидкость',
    subtitle: 'Диурез + 500–800 мл в сутки',
    accentClass: 'border-sky-800/60 bg-sky-900/10',
    content: (
      <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
        <p>
          Объём жидкости зависит от остаточного диуреза. Ориентир: суточный диурез + 500–800 мл.
          При снижении диуреза — строже ограничение.
        </p>
        <div>
          <p className="font-bold text-white mb-1">Учитывать как жидкость:</p>
          <ul className="space-y-0.5 text-slate-400 list-disc list-inside">
            <li>Вода, чай, кофе, сок, молоко</li>
            <li>Суп, бульон, желе, мороженое</li>
            <li>Фрукты и овощи с высоким содержанием воды (арбуз, огурец)</li>
          </ul>
        </div>
        <div>
          <p className="font-bold text-sky-400 mb-1">Советы при жажде:</p>
          <ul className="space-y-0.5 text-slate-400 list-disc list-inside">
            <li>Замораживать воду в кубики льда — сосать вместо питья</li>
            <li>Полоскать рот холодной водой</li>
            <li>Леденцы без сахара (стимулируют слюноотделение)</li>
            <li>Главное — ограничить соль, чтобы снизить жажду</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: 'vitamins',
    emoji: '💊',
    title: 'Витамины и минералы',
    subtitle: 'Водорастворимые теряются при диализе',
    accentClass: 'border-pink-800/60 bg-pink-900/10',
    content: (
      <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
        <div>
          <p className="font-bold text-red-400 mb-1">⚠️ Избегать жирорастворимых витаминов A, E без назначения врача</p>
          <p className="text-slate-400">Они накапливаются и могут быть токсичны при ХБП.</p>
        </div>
        <div>
          <p className="font-bold text-pink-400 mb-1">Обычно назначают:</p>
          <ul className="space-y-0.5 text-slate-400 list-disc list-inside">
            <li><strong className="text-slate-200">Витамин D₃ / кальцитриол</strong> — активная форма; почки не синтезируют</li>
            <li><strong className="text-slate-200">Витамины группы B</strong> (B6, B12, фолиевая) — теряются с диализатом</li>
            <li><strong className="text-slate-200">Витамин C</strong> — не более 60–100 мг/сут (избыток → оксалаты)</li>
          </ul>
        </div>
        <div>
          <p className="font-bold text-slate-300 mb-1">Кальций:</p>
          <p className="text-slate-400">
            Часто повышен из-за фосфат-связывающих препаратов на основе кальция.
            Контролируйте с нефрологом, избыток → кальцификация сосудов.
          </p>
        </div>
        <div className="p-3 bg-slate-800/60 rounded-xl text-xs text-slate-400">
          Все добавки и витамины — только по назначению нефролога. Многие безрецептурные
          витаминные комплексы содержат калий, фосфор и витамин А в опасных дозах для диализных пациентов.
        </div>
      </div>
    ),
  },
  {
    id: 'practical',
    emoji: '🍽️',
    title: 'Практические советы',
    subtitle: 'Планирование питания на каждый день',
    accentClass: 'border-orange-800/60 bg-orange-900/10',
    content: (
      <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
        <div>
          <p className="font-bold text-orange-400 mb-2">Пример безопасного дневного меню:</p>
          <div className="space-y-1.5 text-slate-400 text-xs">
            <div className="flex gap-2"><span className="text-slate-500 w-20 flex-shrink-0">Завтрак</span><span>Яичница из 2 белков, белый тост, чай без сахара</span></div>
            <div className="flex gap-2"><span className="text-slate-500 w-20 flex-shrink-0">Обед</span><span>Куриная грудка 120 г + белый рис 150 г + огурец, масло оливковое</span></div>
            <div className="flex gap-2"><span className="text-slate-500 w-20 flex-shrink-0">Полдник</span><span>Яблоко или груша, 2–3 крекера без соли</span></div>
            <div className="flex gap-2"><span className="text-slate-500 w-20 flex-shrink-0">Ужин</span><span>Треска на пару 120 г + отварная капуста + макароны 100 г</span></div>
          </div>
        </div>
        <div>
          <p className="font-bold text-white mb-1">Читайте этикетки — ищите:</p>
          <ul className="space-y-0.5 text-slate-400 list-disc list-inside text-xs">
            <li>E338 (фосфорная кислота), E339–E343 (фосфаты) — полный отказ</li>
            <li>«Натрий» или «Na» в составе — считайте как соль</li>
            <li>«Обогащён» — часто содержит фосфаты, калий или витамин D</li>
          </ul>
        </div>
        <div>
          <p className="font-bold text-white mb-1">Регулярный мониторинг:</p>
          <ul className="space-y-0.5 text-slate-400 list-disc list-inside text-xs">
            <li>Анализ крови на фосфор, калий, кальций — каждые 1–3 месяца</li>
            <li>Альбумин — маркер питательного статуса (цель &gt;35 г/л)</li>
            <li>Еженедельное взвешивание — контроль жидкости</li>
          </ul>
        </div>
      </div>
    ),
  },
];

export const RecommendationsModal: React.FC<RecommendationsModalProps> = ({ onClose }) => {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => setOpenId(prev => prev === id ? null : id);

  return (
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
        className="relative w-full sm:max-w-lg bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white">Рекомендации по питанию</h2>
            <p className="text-xs text-slate-500 mt-0.5">ХБП 5 ст. · Перитонеальный диализ</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-4 py-4 space-y-2">
          {SECTIONS.map(section => (
            <div
              key={section.id}
              className={cn('rounded-2xl border overflow-hidden transition-colors', section.accentClass)}
            >
              <button
                onClick={() => toggle(section.id)}
                className="w-full flex items-center justify-between px-4 py-3.5 text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl leading-none">{section.emoji}</span>
                  <div>
                    <p className="font-bold text-white text-sm">{section.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{section.subtitle}</p>
                  </div>
                </div>
                {openId === section.id
                  ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                }
              </button>

              <AnimatePresence initial={false}>
                {openId === section.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 border-t border-slate-800/60 pt-3">
                      {section.content}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          <p className="text-center text-[11px] text-slate-600 py-3">
            Рекомендации носят информационный характер.<br />
            Все решения — с лечащим нефрологом и диетологом.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
