import React, { useMemo, useState } from 'react';
import { Play, Search } from 'lucide-react';
import { CatalogCategory, CatalogCircuit, Lang, tr } from '../types';

interface Props {
  circuits: CatalogCircuit[];
  lang: Lang;
  onLaunchCatalogSim: (circuitId: string) => void;
  track?: 'bjt' | 'mosfet' | 'kirchhoff';
}

const CATEGORIES: { id: CatalogCategory; fr: string; ar: string; en: string }[] = [
  { id: 'all', fr: 'Tous', ar: 'الكل', en: 'All' },
  { id: 'basics', fr: 'Bases', ar: 'الأساسيات', en: 'Basics' },
  { id: 'leds', fr: 'LEDs & Clignotants', ar: 'مصابيح ووماضات', en: 'LEDs & Flashers' },
  { id: 'sensors', fr: 'Capteurs & Tactile', ar: 'حساسات ولمس', en: 'Sensors & Touch' },
  { id: 'audio', fr: 'Audio & Sirènes', ar: 'صوتيات وصفارات', en: 'Audio & Sirens' },
  { id: 'power', fr: 'Énergie & Solaire', ar: 'طاقة وشحن شمسي', en: 'Power & Solar' },
  { id: 'testers', fr: 'Testeurs', ar: 'أجهزة فحص', en: 'Testers' },
];

export const CatalogView: React.FC<Props> = ({ circuits, lang, onLaunchCatalogSim, track = 'bjt' }) => {
  const [cat, setCat] = useState<CatalogCategory>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return circuits.filter((c) => {
      if (cat !== 'all' && c.category !== cat) return false;
      if (!q) return true;
      return (
        c.title.toLowerCase().includes(q) ||
        c.titleBi[lang].toLowerCase().includes(q) ||
        c.parts.some((p) => p.toLowerCase().includes(q)) ||
        String(c.page).includes(q)
      );
    });
  }, [circuits, cat, query, lang]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-5">
        <div>
          <p
            className={`text-xs font-mono-num ${
              track === 'mosfet'
                ? 'text-sky-700 dark:text-sky-400'
                : track === 'kirchhoff'
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-amber-700 dark:text-amber-400'
            }`}
          >
            {track === 'mosfet'
              ? tr(lang, 'Filière MOSFET · Montages de puissance & commande', 'مسار MOSFET · دارات القدرة والتحكم', 'MOSFET Track · Power & Switching Circuits')
              : track === 'kirchhoff'
              ? tr(lang, 'Filière Mailles & Nœuds · Lois de Kirchhoff (KVL & KCL)', 'مسار الحلقات والعقد · قوانين كيرشوف', 'Kirchhoff Track · KVL Loops & KCL Nodes')
              : '1-100 Transistor Circuits · Colin Mitchell'}
          </p>
          <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-50 mt-1">
            {track === 'mosfet'
              ? tr(lang, 'Explorateur de montages MOSFET', 'دليل دارات الموسفيت التطبيقية', 'MOSFET Circuit Explorer')
              : track === 'kirchhoff'
              ? tr(lang, 'Explorateur de réseaux KVL / KCL', 'دليل شبكات كيرشوف التطبيقية', 'Kirchhoff Circuit Explorer')
              : tr(lang, 'Explorateur de circuits concrets', 'دليل الدارات التطبيقية من الكتاب', 'Hands-On Circuit Explorer')}
          </h2>
          <p className="text-sm text-stone-600 dark:text-stone-300 mt-1 max-w-2xl">
            {track === 'mosfet'
              ? tr(
                  lang,
                  'Parcourez les montages MOSFET essentiels (N-MOS, P-MOS, CMOS, Boost, Pont en H, charge constante) et lancez directement leur simulation.',
                  'تصفّح أهم دارات الموسفيت العملية (N-MOS و P-MOS و CMOS و Boost وجسر H) وافتح محاكاتها التفاعلية مباشرة.',
                  'Browse essential MOSFET circuits (N-MOS, P-MOS, CMOS, Boost, H-Bridge, linear sink) and launch live interactive simulations.'
                )
              : track === 'kirchhoff'
              ? tr(
                  lang,
                  'Testez des réseaux concrets : pont diviseur en charge, deux sources, nœuds KCL, piège des LEDs parallèles, Millman, pont de Wheatstone et pile r_i.',
                  'اختبر شبكات عملية: المقسّم المحمّل، مصدرين، فخ مصابيح LED، ميلمان، جسر ويتستون وبطارية r_i.',
                  'Test hands-on networks: loaded dividers, dual sources, parallel nodes, LED traps, Millman 2-mesh, Wheatstone bridge, and battery r_i.'
                )
              : tr(
                  lang,
                  'Parcourez les montages emblématiques du livre avec leur page exacte, leurs composants et lancez directement leur simulation interactive.',
                  'تصفّح أشهر دارات الكتاب مع رقم الصفحة والمكوّنات الحقيقية وافتح محاكاتها التفاعلية مباشرة.',
                  'Browse iconic circuits from the book with exact page numbers and real components, then launch their interactive simulations.'
                )}
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute top-1/2 -translate-y-1/2 start-3 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              track === 'mosfet'
                ? tr(lang, 'Chercher (IRLZ44N, P-MOS, Boost...)', 'ابحث (IRLZ44N، P-MOS، Boost...)', 'Search (IRLZ44N, P-MOS, Boost...)')
                : track === 'kirchhoff'
                ? tr(lang, 'Chercher (KVL, Millman, Pont...)', 'ابحث (KVL، ميلمان، جسر...)', 'Search (KVL, Millman, Bridge...)')
                : tr(lang, 'Chercher (BC547, LDR, p. 50...)', 'ابحث (BC547، LDR، صفحة 50...)', 'Search (BC547, LDR, p. 50...)')
            }
            className="w-full ps-9 pe-3 py-2 text-sm rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Category Filter Buttons */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-200/70 dark:bg-stone-800/80 rounded-lg w-fit">
        {CATEGORIES.map((c) => {
          const active = cat === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setCat(c.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                active
                  ? 'bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              {c[lang]}
            </button>
          );
        })}
      </div>

      {/* Circuit Cards Grid */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center text-sm text-stone-500 dark:text-stone-400 border border-dashed border-stone-300 dark:border-stone-700 rounded-xl">
          {tr(lang, 'Aucun circuit ne correspond à votre recherche.', 'لا توجد دارات مطابقة لبحثك.', 'No circuits match your search.')}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((item) => {
            const num = circuits.findIndex((c) => c.id === item.id) + 1;
            return (
              <article
                key={item.id}
                className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/70 p-5 flex flex-col justify-between gap-4 hover:border-stone-300 dark:hover:border-stone-700 transition-colors"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs font-mono-num text-stone-500 dark:text-stone-400">
                    <span className="font-bold text-amber-700 dark:text-amber-400">#{num}</span>
                    <span aria-hidden="true">·</span>
                    <span>p. {item.page}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.transistors.join(' + ')}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.supply}</span>
                  </div>
                  <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                    {item.titleBi[lang]}
                  </h3>
                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                    {item.concept[lang]}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-200/70 dark:border-stone-800 flex items-center justify-between gap-3">
                  <span className="text-xs font-mono-num text-stone-500 dark:text-stone-400 truncate">
                    {item.parts.slice(0, 4).join(' · ')}
                  </span>
                  <button
                    type="button"
                    onClick={() => onLaunchCatalogSim(item.id)}
                    className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-stone-950 text-xs font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer whitespace-nowrap transition-colors"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{tr(lang, 'Simuler', 'محاكاة', 'Simulate')}</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
