import React from 'react';
import { ArrowRight, BookOpen, Cpu, GitFork } from 'lucide-react';
import { Lang, tr } from '../types';

interface Props {
  lang: Lang;
  bjtChapterCount: number;
  bjtCatalogCount: number;
  mosfetChapterCount: number;
  mosfetCatalogCount: number;
  kirchhoffChapterCount: number;
  kirchhoffCatalogCount: number;
  onSelectTrack: (track: 'bjt' | 'mosfet' | 'kirchhoff') => void;
}

export const TrackSelectorView: React.FC<Props> = ({
  lang,
  bjtChapterCount,
  bjtCatalogCount,
  mosfetChapterCount,
  mosfetCatalogCount,
  kirchhoffChapterCount,
  kirchhoffCatalogCount,
  onSelectTrack,
}) => {
  return (
    <div className="flex flex-col gap-8 py-2">
      {/* Editorial Header */}
      <section className="max-w-5xl">
        <p className="text-xs font-mono-num text-amber-700 dark:text-amber-400">
          {tr(
            lang,
            'Laboratoire interactif d’électronique · Trilingue FR / EN / AR',
            'مختبر الإلكترونيات التفاعلي · ثلاثي اللغات',
            'Interactive Electronics Lab · Trilingual FR / EN / AR'
          )}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-50 mt-2 leading-tight">
          {tr(
            lang,
            'Choisissez votre filière d’apprentissage en électronique',
            'اختر مسارك لتعلّم الإلكترونيات',
            'Choose Your Electronics Learning Track'
          )}
        </h1>
        <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 mt-3 leading-relaxed">
          {tr(
            lang,
            'Explorez la physique concrète des circuits et composants avec platine PCB 3D, schémas normalisés, analogie hydraulique, catalogue de montages réels et outils de diagnostic.',
            'تعلّم فيزياء الدارات والمكوّنات عملياً عبر لوحة PCB ثلاثية الأبعاد، ومخططات قياسية، وتشبيه مائي، ودليل دارات حقيقية، وأدوات الفحص.',
            'Explore circuit physics through 3D PCBs, IEEE schematics, hydraulic analogies, real circuit catalogs, and interactive lab tools.'
          )}
        </p>
      </section>

      {/* Three Primary Track Cards */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* TRACK 1: BJT */}
        <article className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/75 overflow-hidden flex flex-col justify-between transition-colors hover:border-amber-500/60">
          <div>
            {/* Schematic Visual Header */}
            <div className="workbench-mat border-b border-stone-800/50 p-5 flex items-center justify-between gap-4">
              <div className="text-stone-100">
                <div className="text-xs font-mono-num text-amber-400">
                  {tr(lang, 'FILIÈRE 01 · BIPOLAIRE', 'المسار 01 · ثنائي القطب', 'TRACK 01 · BIPOLAR')}
                </div>
                <h2 className="text-2xl font-bold mt-1">
                  {tr(lang, 'Transistors BJT', 'ترانزستورات BJT', 'BJT Transistors')}
                </h2>
                <p className="text-xs font-mono-num text-stone-300 mt-1" dir="ltr">
                  NPN BC547 · PNP BC557 · I_C = β · I_B
                </p>
              </div>

              {/* Clean IEEE BJT Symbol */}
              <svg viewBox="0 0 110 100" className="w-24 h-24 shrink-0" direction="ltr" aria-hidden="true">
                <circle cx="58" cy="50" r="38" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />
                <line x1="16" y1="50" x2="46" y2="50" stroke="#38bdf8" strokeWidth="2.5" />
                <line x1="46" y1="30" x2="46" y2="70" stroke="#e2e8f0" strokeWidth="3.5" />
                <line x1="46" y1="40" x2="72" y2="22" stroke="#f59e0b" strokeWidth="2.5" />
                <line x1="46" y1="60" x2="72" y2="78" stroke="#f59e0b" strokeWidth="2.5" />
                <polygon points="70,76 58,74 64,65" fill="#f59e0b" />
                <text x="10" y="45" fontSize="9" fontFamily="monospace" fontWeight="700" fill="#38bdf8">B</text>
                <text x="76" y="24" fontSize="9" fontFamily="monospace" fontWeight="700" fill="#f59e0b">C</text>
                <text x="76" y="83" fontSize="9" fontFamily="monospace" fontWeight="700" fill="#f59e0b">E</text>
              </svg>
            </div>

            <div className="p-5 flex flex-col gap-4">
              <p className="text-sm text-stone-700 dark:text-stone-200 leading-relaxed">
                {tr(
                  lang,
                  'Le cours complet « 1-100 Transistor Circuits » : jonction Base-Émetteur 0,7 V, amplification en courant, paires Darlington, temporisations RC, trigger de Schmitt, oscillateurs, voleurs de joules et sources de courant constant.',
                  'المنهج الكامل المستوحى من كتاب «1-100 Transistor Circuits»: وصلة القاعدة 0.7V، مضاعفة التيار، ثنائي دارلنغتون، المؤقتات، المذبذبات، وسارق الجول.',
                  'The full “1-100 Transistor Circuits” curriculum: 0.7 V Base–Emitter turn-on, current gain, Darlington pairs, RC delays, Schmitt triggers, oscillators, Joule thieves, and constant-current sinks.'
                )}
              </p>

              <dl className="grid grid-cols-3 gap-3 pt-3 border-t border-stone-200 dark:border-stone-800 text-xs">
                <div>
                  <dt className="text-stone-500 dark:text-stone-400">{tr(lang, 'Commande', 'التحكم', 'Control')}</dt>
                  <dd className="font-mono-num font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                    {tr(lang, 'Courant I_B', 'بالتيار I_B', 'Current I_B')}
                  </dd>
                </div>
                <div>
                  <dt className="text-stone-500 dark:text-stone-400">{tr(lang, 'Chapitres', 'الفصول', 'Chapters')}</dt>
                  <dd className="font-mono-num font-bold text-amber-700 dark:text-amber-400 mt-0.5">
                    {bjtChapterCount}
                  </dd>
                </div>
                <div>
                  <dt className="text-stone-500 dark:text-stone-400">{tr(lang, 'Montages', 'الدارات', 'Circuits')}</dt>
                  <dd className="font-mono-num font-bold text-amber-700 dark:text-amber-400 mt-0.5">
                    {bjtCatalogCount}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="p-5 pt-0 flex items-center justify-between gap-3">
            <span className="text-xs font-mono-num text-stone-500 dark:text-stone-400">
              {tr(lang, 'Multimètre ×10/×10k · Code couleurs', 'فاحص BJT · ألوان المقاومات', 'BJT Tester · Color Code')}
            </span>
            <button
              type="button"
              onClick={() => onSelectTrack('bjt')}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 transition-colors"
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>{tr(lang, 'Ouvrir le cours BJT', 'دخول مسار BJT', 'Open BJT Course')}</span>
              <ArrowRight className={`w-4 h-4 shrink-0 ${lang === 'ar' ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </article>

        {/* TRACK 2: MOSFET */}
        <article className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/75 overflow-hidden flex flex-col justify-between transition-colors hover:border-sky-500/60">
          <div>
            {/* Schematic Visual Header */}
            <div className="workbench-mat border-b border-stone-800/50 p-5 flex items-center justify-between gap-4">
              <div className="text-stone-100">
                <div className="text-xs font-mono-num text-sky-400">
                  {tr(lang, 'FILIÈRE 02 · EFFET DE CHAMP', 'المسار 02 · تأثير المجال', 'TRACK 02 · FIELD-EFFECT')}
                </div>
                <h2 className="text-2xl font-bold mt-1">
                  {tr(lang, 'Transistors MOSFET', 'ترانزستورات MOSFET', 'MOSFET Transistors')}
                </h2>
                <p className="text-xs font-mono-num text-stone-300 mt-1" dir="ltr">
                  IRLZ44N · IRF9540 · V_GS &gt; V_th · I_G ≈ 0
                </p>
              </div>

              {/* Clean IEEE MOSFET Symbol */}
              <svg viewBox="0 0 110 100" className="w-24 h-24 shrink-0" direction="ltr" aria-hidden="true">
                <circle cx="58" cy="50" r="38" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
                <line x1="16" y1="62" x2="43" y2="62" stroke="#38bdf8" strokeWidth="2.5" />
                <line x1="43" y1="30" x2="43" y2="68" stroke="#38bdf8" strokeWidth="3" />
                <line x1="51" y1="30" x2="51" y2="39" stroke="#e2e8f0" strokeWidth="3" />
                <line x1="51" y1="45" x2="51" y2="55" stroke="#e2e8f0" strokeWidth="3" />
                <line x1="51" y1="61" x2="51" y2="70" stroke="#e2e8f0" strokeWidth="3" />
                <line x1="51" y1="34" x2="73" y2="34" stroke="#f59e0b" strokeWidth="2.2" />
                <line x1="73" y1="18" x2="73" y2="34" stroke="#f59e0b" strokeWidth="2.2" />
                <line x1="51" y1="50" x2="73" y2="50" stroke="#e2e8f0" strokeWidth="2" />
                <line x1="51" y1="66" x2="73" y2="66" stroke="#e2e8f0" strokeWidth="2.2" />
                <line x1="73" y1="50" x2="73" y2="82" stroke="#e2e8f0" strokeWidth="2.2" />
                <polygon points="54,50 63,46 63,54" fill="#38bdf8" />
                <text x="10" y="57" fontSize="9" fontFamily="monospace" fontWeight="700" fill="#38bdf8">G</text>
                <text x="79" y="26" fontSize="9" fontFamily="monospace" fontWeight="700" fill="#f59e0b">D</text>
                <text x="79" y="80" fontSize="9" fontFamily="monospace" fontWeight="700" fill="#e2e8f0">S</text>
              </svg>
            </div>

            <div className="p-5 flex flex-col gap-4">
              <p className="text-sm text-stone-700 dark:text-stone-200 leading-relaxed">
                {tr(
                  lang,
                  'Maîtrisez la commande en tension sans courant permanent : grille isolée SiO₂ et mémoire flottante, piège du 5 V Arduino (R_DS(on)), P-MOS anti-inversion, paires CMOS & shoot-through, plateau de Miller, diode de corps, Boost et pont en H.',
                  'أتقن التحكم بالجهد دون تيار دائم: عازل SiO₂، فخ تشغيل 5V (R_DS(on))، حماية عكس القطبية بـ P-MOS، أزواج CMOS، هضبة ميلر، رافع الجهد Boost وجسر H.',
                  'Master voltage-driven switching: insulated SiO₂ gate & floating memory, the 5 V Logic-Level R_DS(on) trap, P-MOS reverse-polarity guard, CMOS & shoot-through, Miller plateau, body diode, Boost DC-DC, and H-Bridge drives.'
                )}
              </p>

              <dl className="grid grid-cols-3 gap-3 pt-3 border-t border-stone-200 dark:border-stone-800 text-xs">
                <div>
                  <dt className="text-stone-500 dark:text-stone-400">{tr(lang, 'Commande', 'التحكم', 'Control')}</dt>
                  <dd className="font-mono-num font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                    {tr(lang, 'Tension V_GS', 'بالجهد V_GS', 'Voltage V_GS')}
                  </dd>
                </div>
                <div>
                  <dt className="text-stone-500 dark:text-stone-400">{tr(lang, 'Chapitres', 'الفصول', 'Chapters')}</dt>
                  <dd className="font-mono-num font-bold text-sky-700 dark:text-sky-400 mt-0.5">
                    {mosfetChapterCount}
                  </dd>
                </div>
                <div>
                  <dt className="text-stone-500 dark:text-stone-400">{tr(lang, 'Montages', 'الدارات', 'Circuits')}</dt>
                  <dd className="font-mono-num font-bold text-sky-700 dark:text-sky-400 mt-0.5">
                    {mosfetCatalogCount}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="p-5 pt-0 flex items-center justify-between gap-3">
            <span className="text-xs font-mono-num text-stone-500 dark:text-stone-400">
              {tr(lang, 'Test verrouillage · Calcul thermique R_DS', 'فاحص قفل البوابة · حاسبة الحرارة', 'Gate-Latch Tester · Thermal Calc')}
            </span>
            <button
              type="button"
              onClick={() => onSelectTrack('mosfet')}
              className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 transition-colors"
            >
              <Cpu className="w-4 h-4 shrink-0" />
              <span>{tr(lang, 'Ouvrir le cours MOSFET', 'دخول مسار MOSFET', 'Open MOSFET Course')}</span>
              <ArrowRight className={`w-4 h-4 shrink-0 ${lang === 'ar' ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </article>
        {/* TRACK 3: KIRCHHOFF (MAILLES & NOEUDS) */}
        <article className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/75 overflow-hidden flex flex-col justify-between transition-colors hover:border-emerald-500/60">
          <div>
            <div className="workbench-mat border-b border-stone-800/50 p-5 flex items-center justify-between gap-4">
              <div className="text-stone-100">
                <div className="text-xs font-mono-num text-emerald-300">
                  {tr(lang, 'FILIÈRE 03 · KIRCHHOFF & THÉVENIN', 'المسار 03 · كيرشوف وثيفنان', 'TRACK 03 · KIRCHHOFF & THÉVENIN')}
                </div>
                <h2 className="text-2xl font-bold mt-1">
                  {tr(lang, 'Mailles, Nœuds & Thévenin', 'الحلقات والعقد وثيفنان', 'KVL, KCL & Thévenin')}
                </h2>
                <p className="text-xs font-mono-num text-stone-300 mt-1" dir="ltr">
                  KVL ∑U = 0 · KCL ∑I = 0 · Thévenin
                </p>
              </div>

              {/* Clean KVL/KCL Loop & Node Emblem */}
              <svg viewBox="0 0 110 100" className="w-24 h-24 shrink-0" direction="ltr" aria-hidden="true">
                <circle cx="55" cy="50" r="38" fill="#0f172a" stroke="#10b981" strokeWidth="2" />
                <rect x="26" y="28" width="58" height="44" rx="4" fill="none" stroke="#34d399" strokeWidth="2.2" />
                <line x1="55" y1="28" x2="55" y2="72" stroke="#38bdf8" strokeWidth="2.2" />
                <circle cx="55" cy="28" r="4.5" fill="#fbbf24" />
                <circle cx="55" cy="72" r="4.5" fill="#2dd4bf" />
                <path d="M 35 55 A 7 7 0 1 1 46 55" fill="none" stroke="#fbbf24" strokeWidth="1.6" />
                <path d="M 64 55 A 7 7 0 1 1 75 55" fill="none" stroke="#38bdf8" strokeWidth="1.6" />
                <text x="55" y="20" textAnchor="middle" fontSize="8" fontFamily="monospace" fontWeight="700" fill="#fbbf24">Nœud A</text>
              </svg>
            </div>

            <div className="p-5 flex flex-col gap-4">
              <p className="text-sm text-stone-700 dark:text-stone-200 leading-relaxed">
                {tr(
                  lang,
                  'Les lois fondamentales de l’analyse de circuits : loi des mailles (∑U = 0), pont diviseur en charge, loi des nœuds (∑I = 0), piège des LEDs parallèles, théorème de Millman, pont de Wheatstone, pile r_i et théorème de Thévenin (E_th, R_th).',
                  'قواعد تحليل الدارات الأساسية: قانون الحلقات (∑U = 0)، المقسّم المحمّل، قانون العقد (∑I = 0)، فخ مصابيح LED، ميلمان، جسر ويتستون ومبرهنة ثيفنان (E_th, R_th).',
                  'Core circuit laws: Kirchhoff’s Voltage Law (∑U = 0), loaded dividers, KCL current conservation, parallel LED traps, Millman 2-mesh solver, Wheatstone bridge, battery r_i, and Thévenin’s theorem (E_th, R_th).'
                )}
              </p>

              <dl className="grid grid-cols-3 gap-3 pt-3 border-t border-stone-200 dark:border-stone-800 text-xs">
                <div>
                  <dt className="text-stone-500 dark:text-stone-400">{tr(lang, 'Lois', 'القوانين', 'Laws')}</dt>
                  <dd className="font-mono-num font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                    KVL · KCL · Thév.
                  </dd>
                </div>
                <div>
                  <dt className="text-stone-500 dark:text-stone-400">{tr(lang, 'Chapitres', 'الفصول', 'Chapters')}</dt>
                  <dd className="font-mono-num font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                    {kirchhoffChapterCount}
                  </dd>
                </div>
                <div>
                  <dt className="text-stone-500 dark:text-stone-400">{tr(lang, 'Montages', 'الدارات', 'Circuits')}</dt>
                  <dd className="font-mono-num font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                    {kirchhoffCatalogCount}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="p-5 pt-0 flex items-center justify-between gap-3">
            <span className="text-xs font-mono-num text-stone-500 dark:text-stone-400">
              {tr(lang, 'Résolveur 2 mailles · Défis', 'حلّال الحلقات · تمارين', '2-Mesh Solver · Puzzles')}
            </span>
            <button
              type="button"
              onClick={() => onSelectTrack('kirchhoff')}
              className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 transition-colors"
            >
              <GitFork className="w-4 h-4 shrink-0" />
              <span>{tr(lang, 'Ouvrir Mailles & Nœuds', 'دخول مسار كيرشوف', 'Open Kirchhoff Track')}</span>
              <ArrowRight className={`w-4 h-4 shrink-0 ${lang === 'ar' ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </article>
      </section>

      {/* Concise Side-by-Side Comparison Strip */}
      <section className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/70 p-5">
        <h3 className="text-sm font-bold text-stone-900 dark:text-stone-50 mb-3">
          {tr(lang, 'Repère comparatif rapide : BJT vs MOSFET vs Kirchhoff', 'مقارنة سريعة بين المسارات الثلاثة', 'Quick Reference: BJT vs MOSFET vs Kirchhoff')}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start border-collapse">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400">
                <th className="py-2 pe-4 font-semibold">{tr(lang, 'Critère', 'المعيار', 'Criterion')}</th>
                <th className="py-2 pe-4 font-semibold text-amber-700 dark:text-amber-400">BJT (BC547 / 2N3055)</th>
                <th className="py-2 pe-4 font-semibold text-sky-700 dark:text-sky-400">MOSFET (IRLZ44N / IRF9540)</th>
                <th className="py-2 font-semibold text-emerald-700 dark:text-emerald-400">Kirchhoff (KVL / KCL)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200/70 dark:divide-stone-800/70 text-stone-700 dark:text-stone-300">
              <tr>
                <td className="py-2.5 pe-4 font-medium">{tr(lang, 'Objet', 'المحور', 'Focus')}</td>
                <td className="py-2.5 pe-4 font-mono-num">Base (B) · Collector (C) · Emitter (E)</td>
                <td className="py-2.5 pe-4 font-mono-num">Gate (G) · Drain (D) · Source (S)</td>
                <td className="py-2.5 font-mono-num">{tr(lang, 'Mailles (∑U=0) · Nœuds (∑I=0) · Thévenin', 'الحلقات (∑U=0) · العقد · ثيفنان', 'KVL Loops · KCL Nodes · Thévenin')}</td>
              </tr>
              <tr>
                <td className="py-2.5 pe-4 font-medium">{tr(lang, 'Mécanisme', 'المبدأ', 'Core Principle')}</td>
                <td className="py-2.5 pe-4">{tr(lang, 'Courant permanent I_B (V_BE ≈ 0,7 V)', 'تيار مستمر بالقاعدة (V_BE ≈ 0.7V)', 'Continuous Base current I_B (V_BE ≈ 0.7 V)')}</td>
                <td className="py-2.5 pe-4">{tr(lang, 'Champ électrique sans courant (V_GS > V_th, I_G ≈ 0)', 'مجال كهربائي بالجهد بدون تيار مستمر (I_G ≈ 0)', 'Electric field voltage drive (V_GS > V_th, I_G ≈ 0)')}</td>
                <td className="py-2.5">{tr(lang, 'Conservation (U, I) & réduction (E_th, R_th)', 'حفظ الطاقة والتيار والاختزال المكافئ', 'Energy/charge conservation & (E_th, R_th) reduction')}</td>
              </tr>
              <tr>
                <td className="py-2.5 pe-4 font-medium">{tr(lang, 'Outils labo', 'أدوات المختبر', 'Lab Tools')}</td>
                <td className="py-2.5 pe-4 font-mono-num">{tr(lang, 'Multimètre ×10/×10k · Code couleurs', 'فاحص BJT · ألوان المقاومات', 'BJT Tester · Color Code')}</td>
                <td className="py-2.5 pe-4 font-mono-num">{tr(lang, 'Verrouillage G · Calcul thermique', 'فاحص قفل البوابة · حاسبة الحرارة', 'Gate Latch · Thermal Calc')}</td>
                <td className="py-2.5 font-mono-num">{tr(lang, 'Solveur Millman · Réducteur Thévenin', 'حلّال ميلمان · مختزل ثيفنان', 'Millman Solver · Thévenin Reducer')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
