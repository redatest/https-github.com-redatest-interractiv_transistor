import React, { useMemo, useState } from 'react';
import { Lang, tr } from '../types';

interface Props {
  lang: Lang;
}

type MysteryMosfetId = 'nmos_gds' | 'pmos_gds' | 'shorted';
type PinIdx = 1 | 2 | 3;

const MYSTERY_MOSFETS: Record<
  MysteryMosfetId,
  {
    type: 'N-MOSFET' | 'P-MOSFET' | 'BLOWN';
    pins: Record<PinIdx, 'G' | 'D' | 'S'>;
    fr: string;
    ar: string;
    en: string;
  }
> = {
  nmos_gds: {
    type: 'N-MOSFET',
    pins: { 1: 'G', 2: 'D', 3: 'S' },
    fr: 'IRLZ44N (Canal N · Brochage standard 1:G - 2:D - 3:S)',
    ar: 'IRLZ44N (قناة N · الأقطاب 1:G - 2:D - 3:S)',
    en: 'IRLZ44N (N-Channel · Pinout 1:G - 2:D - 3:S)',
  },
  pmos_gds: {
    type: 'P-MOSFET',
    pins: { 1: 'G', 2: 'D', 3: 'S' },
    fr: 'IRF9540 (Canal P · Brochage 1:G - 2:D - 3:S)',
    ar: 'IRF9540 (قناة P · الأقطاب 1:G - 2:D - 3:S)',
    en: 'IRF9540 (P-Channel · Pinout 1:G - 2:D - 3:S)',
  },
  shorted: {
    type: 'BLOWN',
    pins: { 1: 'G', 2: 'D', 3: 'S' },
    fr: 'MOSFET claqué : oxyde SiO₂ percé, court-circuit permanent !',
    ar: 'موسفيت محترق: ثقب في العازل SiO₂ وقصر دائم!',
    en: 'Blown MOSFET: punctured SiO₂ gate oxide — permanent short!',
  },
};

export const MosfetToolsView: React.FC<Props> = ({ lang }) => {
  // Tool 1: MOSFET Gate-Latch Tester State
  const [mystery, setMystery] = useState<MysteryMosfetId>('nmos_gds');
  const [blackPin, setBlackPin] = useState<PinIdx>(2);
  const [redPin, setRedPin] = useState<PinIdx>(3);
  const [gateLatched, setGateLatched] = useState(false);
  const [reveal, setReveal] = useState(false);

  // Tool 2: R_DS(on) Thermal & Gate Resistor Calculator State
  const [idAmps, setIdAmps] = useState(8.0);
  const [rdsMilliOhms, setRdsMilliOhms] = useState(44); // e.g. IRF540N 44 mOhm
  const [rthJA, setRthJA] = useState(62); // 62 C/W bare TO-220, 12 C/W medium heatsink
  const [rgOhms, setRgOhms] = useState(100);
  const [cissNF, setCissNF] = useState(1.7);

  const meterReadout = useMemo(() => {
    const info = MYSTERY_MOSFETS[mystery];
    if (blackPin === redPin) return { defl: 1.0, text: '0.00 Ω (Sondes reliées)' };
    if (info.type === 'BLOWN') return { defl: 0.96, text: '0.2 Ω — BIP COURT-CIRCUIT !' };

    const pB = info.pins[blackPin];
    const pR = info.pins[redPin];

    if (info.type === 'N-MOSFET') {
      if (pB === 'S' && pR === 'D') return { defl: 0.72, text: '0.54 V (Diode de corps S→D)' };
      if (pB === 'D' && pR === 'S' && gateLatched) return { defl: 0.94, text: '0.03 Ω (VERROUILLÉ ON !)' };
      return { defl: 0.02, text: 'OL / ∞ (Canal bloqué)' };
    } else {
      if (pB === 'D' && pR === 'S') return { defl: 0.72, text: '0.56 V (Diode de corps D→S)' };
      if (pB === 'S' && pR === 'D' && gateLatched) return { defl: 0.94, text: '0.11 Ω (VERROUILLÉ ON !)' };
      return { defl: 0.02, text: 'OL / ∞ (Canal bloqué)' };
    }
  }, [mystery, blackPin, redPin, gateLatched]);

  const needleAngle = -48 + meterReadout.defl * 96;

  // Thermal Calculations
  const rdsOhms = rdsMilliOhms / 1000;
  const condPowerW = idAmps * idAmps * rdsOhms;
  const junctionTempC = 25 + condPowerW * rthJA;
  const igPeakMA = (5 / Math.max(10, rgOhms)) * 1000;
  const triseUs = (2.2 * rgOhms * cissNF) / 1000;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* TOOL 1: MOSFET GATE-LATCH MULTIMETER TESTER */}
      <section className="lg:col-span-6 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/70 p-5 flex flex-col gap-5">
        <div>
          <div className="text-xs font-mono-num text-sky-700 dark:text-sky-400">
            {tr(lang, 'Atelier MOSFET · Test à l’ohmmètre / mode diode', 'مختبر الموسفيت · الفحص بالأفوميتر', 'MOSFET Bench · Multimeter & Diode Mode')}
          </div>
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-50 mt-0.5">
            {tr(lang, 'Tester un MOSFET par verrouillage de grille', 'فحص الموسفيت بقفل شحنة البوابة', 'Gate-Latch MOSFET Multimeter Tester')}
          </h2>
          <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 leading-relaxed">
            {tr(
              lang,
              'Procédure : 1) Repérez la diode de corps entre D et S (~0,55 V). 2) Chargez brièvement la grille G (+), puis revenez sur D–S : si la résistance reste proche de 0 Ω, le MOSFET mémorise bien sa charge !',
              'الخطوات: 1) ابحث عن الدايود الداخلي بين D و S (~0.55V). 2) المس البوابة G لشحنها ثم عد إلى D–S: بقاء التوصيل يؤكد سلامة العازل والترانزستور!',
              'Procedure: 1) Find the ~0.55 V body diode across D–S. 2) Briefly tap Gate G (+) then probe D–S again: staying near 0 Ω proves the oxide gate latches!'
            )}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {(['nmos_gds', 'pmos_gds', 'shorted'] as MysteryMosfetId[]).map((mId, i) => (
            <button
              key={mId}
              type="button"
              onClick={() => {
                setMystery(mId);
                setGateLatched(false);
                setReveal(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                mystery === mId
                  ? 'bg-stone-900 text-white dark:bg-sky-400 dark:text-stone-950 border-transparent'
                  : 'border-stone-300 dark:border-stone-700'
              }`}
            >
              {tr(lang, `MOSFET #${i + 1}`, `موسفيت #${i + 1}`, `MOSFET #${i + 1}`)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-stone-100/70 dark:bg-stone-950/60 rounded-xl p-4 border border-stone-200 dark:border-stone-800">
          <svg viewBox="0 0 220 150" className="w-full max-w-[230px] mx-auto" direction="ltr">
            <rect x="8" y="8" width="204" height="134" rx="10" fill="#0f172a" stroke="#475569" strokeWidth="2" />
            <rect x="20" y="18" width="180" height="78" rx="6" fill="#f8fafc" />
            <path d="M 38 78 A 74 74 0 0 1 182 78" fill="none" stroke="#1e293b" strokeWidth="2" />
            <text x="34" y="68" fontSize="11" fontWeight="700" fill="#dc2626">OL</text>
            <text x="110" y="34" textAnchor="middle" fontSize="9" fontWeight="700" fill="#0284c7">DIODE / Ω</text>
            <text x="178" y="68" fontSize="11" fontWeight="700" fill="#16a34a">0 Ω</text>
            <g transform={`translate(110, 92) rotate(${needleAngle})`} className="transition-transform duration-300 ease-out">
              <line x1="0" y1="0" x2="0" y2="-62" stroke="#dc2626" strokeWidth="2.4" strokeLinecap="round" />
              <circle cx="0" cy="0" r="5" fill="#0f172a" />
            </g>
            <text x="110" y="124" textAnchor="middle" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="700">
              {meterReadout.text}
            </text>
          </svg>

          <div className="flex flex-col items-center gap-2">
            <svg viewBox="0 0 180 120" className="w-40 h-auto" direction="ltr">
              <rect x="48" y="8" width="84" height="16" rx="2" fill="#cbd5e1" />
              <circle cx="90" cy="16" r="4.5" fill="#475569" />
              <rect x="48" y="24" width="84" height="42" rx="4" fill="#18181b" stroke="#52525b" strokeWidth="2" />
              <text x="90" y="49" textAnchor="middle" fill="#38bdf8" fontSize="11" fontFamily="monospace" fontWeight="700">
                {reveal ? MYSTERY_MOSFETS[mystery].type : 'TO-220 ???'}
              </text>
              {[1, 2, 3].map((pin) => {
                const px = 45 + pin * 22.5;
                return (
                  <g key={pin}>
                    <line x1={px} y1="66" x2={px} y2="100" stroke="#94a3b8" strokeWidth="4" />
                    <text x={px} y="114" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="currentColor">
                      {reveal ? `${pin}:${MYSTERY_MOSFETS[mystery].pins[pin as PinIdx]}` : `P${pin}`}
                    </text>
                    {blackPin === pin && <circle cx={px} cy="88" r="6.5" fill="#09090b" stroke="#fff" strokeWidth="2" />}
                    {redPin === pin && <circle cx={px} cy="75" r="6.5" fill="#e11d48" stroke="#fff" strokeWidth="2" />}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex flex-col gap-1">
            <span className="font-semibold">{tr(lang, 'Sonde NOIRE (+)', 'المجس الأسود (+)', 'BLACK Probe (+)')}</span>
            <div className="flex gap-1">
              {([1, 2, 3] as PinIdx[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setBlackPin(p)}
                  className={`flex-1 py-1.5 rounded border font-mono-num font-bold cursor-pointer ${blackPin === p ? 'bg-stone-900 text-white' : 'border-stone-300 dark:border-stone-700'}`}
                >
                  P{p}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-rose-600 dark:text-rose-400">{tr(lang, 'Sonde ROUGE (−)', 'المجس الأحمر (−)', 'RED Probe (−)')}</span>
            <div className="flex gap-1">
              {([1, 2, 3] as PinIdx[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setRedPin(p)}
                  className={`flex-1 py-1.5 rounded border font-mono-num font-bold cursor-pointer ${redPin === p ? 'bg-rose-600 text-white' : 'border-stone-300 dark:border-stone-700'}`}
                >
                  P{p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-200 dark:border-stone-800">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setGateLatched(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white cursor-pointer"
            >
              {tr(lang, '1. Charger Grille (G)', '1. شحن البوابة G', '1. Charge Gate (G)')}
            </button>
            <button
              type="button"
              onClick={() => setGateLatched(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-stone-300 dark:border-stone-700 cursor-pointer"
            >
              {tr(lang, '2. Décharger (G↔S)', '2. تفريغ (G↔S)', '2. Discharge (G↔S)')}
            </button>
          </div>
          <button
            type="button"
            onClick={() => setReveal((v) => !v)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-stone-300 dark:border-stone-700 cursor-pointer"
          >
            {reveal ? tr(lang, 'Masquer', 'إخفاء', 'Hide') : tr(lang, 'Révéler', 'كشف', 'Reveal')}
          </button>
        </div>

        {reveal && (
          <div className="text-xs font-mono-num bg-sky-50 dark:bg-sky-950/30 border border-sky-400/50 rounded-lg p-3 text-sky-900 dark:text-sky-200">
            {tr(lang, MYSTERY_MOSFETS[mystery].fr, MYSTERY_MOSFETS[mystery].ar, MYSTERY_MOSFETS[mystery].en)}
          </div>
        )}
      </section>

      {/* TOOL 2: R_DS(on) THERMAL & GATE DRIVER CALCULATOR */}
      <section className="lg:col-span-6 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/70 p-5 flex flex-col gap-5">
        <div>
          <div className="text-xs font-mono-num text-amber-700 dark:text-amber-400">
            {tr(lang, 'Dimensionnement puissance · P = I² · R_DS(on)', 'حسابات القدرة والحرارة · P = I² · R_DS(on)', 'Power Sizing · P = I² · R_DS(on)')}
          </div>
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-50 mt-0.5">
            {tr(lang, 'Calculateur thermique R_DS(on) & Résistance Grille R_G', 'حاسبة حرارة الموسفيت ومقاومة البوابة R_G', 'R_DS(on) Thermal & Gate Resistor Calculator')}
          </h2>
          <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 leading-relaxed">
            {tr(
              lang,
              'Vérifiez immédiatement si votre MOSFET tiendra sans radiateur et si la broche d’un Arduino/ESP32 supporte le pic de charge de grille.',
              'تحقّق فوراً مما إذا كان الموسفيت يحتاج إلى مشتت حراري أو مقاومة بوابة لحماية منفذ Arduino/ESP32.',
              'Instantly check whether your MOSFET runs cool without a heatsink and if an Arduino/ESP32 pin safely handles the gate charge spike.'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <label className="flex flex-col gap-1">
            <div className="flex justify-between font-semibold">
              <span>{tr(lang, 'Courant de charge I_D', 'تيار الحمل I_D', 'Load current I_D')}</span>
              <span className="font-mono-num text-amber-600 dark:text-amber-400">{idAmps.toFixed(1)} A</span>
            </div>
            <input type="range" min={1} max={30} step={0.5} value={idAmps} onChange={(e) => setIdAmps(Number(e.target.value))} className="w-full accent-amber-600 cursor-pointer" />
          </label>

          <label className="flex flex-col gap-1">
            <div className="flex justify-between font-semibold">
              <span>R_DS(on)</span>
              <span className="font-mono-num text-sky-600 dark:text-sky-400">{rdsMilliOhms} mΩ</span>
            </div>
            <input type="range" min={4} max={250} step={2} value={rdsMilliOhms} onChange={(e) => setRdsMilliOhms(Number(e.target.value))} className="w-full accent-sky-600 cursor-pointer" />
          </label>

          <label className="flex flex-col gap-1">
            <div className="flex justify-between font-semibold">
              <span>{tr(lang, 'Résistance R_G (Grille)', 'مقاومة البوابة R_G', 'Gate resistor R_G')}</span>
              <span className="font-mono-num">{rgOhms} Ω</span>
            </div>
            <input type="range" min={10} max={1000} step={10} value={rgOhms} onChange={(e) => setRgOhms(Number(e.target.value))} className="w-full accent-sky-600 cursor-pointer" />
          </label>

          <label className="flex flex-col gap-1">
            <div className="flex justify-between font-semibold">
              <span>C_iss</span>
              <span className="font-mono-num">{cissNF.toFixed(1)} nF</span>
            </div>
            <input type="range" min={0.2} max={5.0} step={0.1} value={cissNF} onChange={(e) => setCissNF(Number(e.target.value))} className="w-full accent-emerald-600 cursor-pointer" />
          </label>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          {[
            { label: tr(lang, 'Boîtier nu (62 °C/W)', 'بدون مشتت (62 °C/W)', 'Bare TO-220 (62 °C/W)'), rth: 62 },
            { label: tr(lang, 'Petit radiateur (18 °C/W)', 'مشتت صغير (18 °C/W)', 'Small heatsink (18 °C/W)'), rth: 18 },
            { label: tr(lang, 'Gros radiateur (6 °C/W)', 'مشتت كبير (6 °C/W)', 'Large heatsink (6 °C/W)'), rth: 6 },
          ].map((opt) => (
            <button
              key={opt.rth}
              type="button"
              onClick={() => setRthJA(opt.rth)}
              className={`px-3 py-1.5 rounded-lg border font-semibold cursor-pointer ${
                rthJA === opt.rth ? 'bg-stone-900 text-white dark:bg-amber-400 dark:text-stone-950 border-transparent' : 'border-stone-300 dark:border-stone-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 bg-stone-100/80 dark:bg-stone-950/70 rounded-xl p-4 border border-stone-200 dark:border-stone-800 text-xs">
          <div>
            <div className="text-stone-500">{tr(lang, 'Pertes conduction', 'طاقة الحرارة', 'Conduction Loss')}</div>
            <div className="font-mono-num text-xl font-bold text-amber-700 dark:text-amber-400 mt-0.5" dir="ltr">
              {condPowerW.toFixed(2)} W
            </div>
          </div>
          <div>
            <div className="text-stone-500">{tr(lang, 'Température puce T_J', 'حرارة الوصلة T_J', 'Junction Temp T_J')}</div>
            <div
              className={`font-mono-num text-xl font-bold mt-0.5 ${
                junctionTempC > 135 ? 'text-rose-600 dark:text-rose-400' : junctionTempC > 85 ? 'text-amber-600' : 'text-emerald-600 dark:text-emerald-400'
              }`}
              dir="ltr"
            >
              {Math.round(junctionTempC)} °C
            </div>
          </div>
          <div>
            <div className="text-stone-500">{tr(lang, 'Pic courant broche MCU', 'ذروة تيار البوابة', 'MCU Pin Peak I_G')}</div>
            <div
              className={`font-mono-num text-base font-bold mt-0.5 ${igPeakMA > 40 ? 'text-rose-600 dark:text-rose-400' : 'text-sky-700 dark:text-sky-400'}`}
              dir="ltr"
            >
              {igPeakMA.toFixed(0)} mA {igPeakMA > 40 ? '(> 40 mA!)' : '(OK)'}
            </div>
          </div>
          <div>
            <div className="text-stone-500">{tr(lang, 'Temps de montée t_r', 'زمن الصعود t_r', 'Rise Time t_r')}</div>
            <div className="font-mono-num text-base font-bold mt-0.5" dir="ltr">
              {triseUs.toFixed(2)} µs
            </div>
          </div>
        </div>

        <div className="text-xs font-medium text-stone-700 dark:text-stone-300 bg-stone-50 dark:bg-stone-950 rounded-lg p-3 border border-stone-200 dark:border-stone-800">
          {junctionTempC > 135
            ? tr(lang, 'Critique (> 135 °C) : réduisez R_DS(on) (ex. IRLB8721 à 8 mΩ) ou ajoutez un radiateur !', 'حرارة حرجة! قلّل R_DS(on) أو استعمل مشتتاً أكبر.', 'Critical (> 135 °C): pick a lower R_DS(on) MOSFET or add a larger heatsink!')
            : tr(lang, 'Dimensionnement sain : le canal reste dans la plage sûre de fonctionnement.', 'الحجم آمن: درجة الحرارة ضمن الحدود المسموحة.', 'Safe sizing: MOSFET stays within safe thermal limits.')}
        </div>
      </section>
    </div>
  );
};
