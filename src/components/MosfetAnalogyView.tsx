import React from 'react';
import { Lang, tr } from '../types';
import { MosfetSimParams, MosfetSimReadout } from '../utils/mosfetPhysics';

interface Props {
  params: MosfetSimParams;
  sim: MosfetSimReadout;
  lang: Lang;
}

export const MosfetAnalogyView: React.FC<Props> = ({ params, sim, lang }) => {
  const aperture = sim.conducting ? (sim.region === 'ohmic' ? 38 : 14) : 0;
  const pressurePsi = Math.min(100, Math.round((Math.abs(sim.vgs) / 10) * 100));

  return (
    <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/75 p-4 sm:p-5 flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
            {tr(
              lang,
              'Analogie hydraulique : La vanne à membrane souple étanche (SiO₂)',
              'التشبيه المائي: صمّام الغشاء المرن المعزول تماماً (SiO₂)',
              'Hydraulic Analogy: Sealed Elastic Membrane Valve (SiO₂)'
            )}
          </h3>
          <p className="text-xs text-stone-600 dark:text-stone-300 mt-0.5">
            {tr(
              lang,
              'Contrairement au BJT qui consomme un petit courant d’eau sur la Base, la Grille pousse contre une membrane en caoutchouc étanche (0 goutte perdue = I_G = 0) !',
              'على عكس BJT الذي يستهلك تياراً في القاعدة، تدفع البوابة غشاءً مطاطياً معزولاً دون تسريب قطرة واحدة (I_G = 0)!',
              'Unlike a BJT valve that consumes steady Base flow, the MOSFET Gate pushes against a sealed rubber diaphragm — zero fluid crosses (I_G = 0)!'
            )}
          </p>
        </div>

        <span className="text-xs font-mono-num font-bold text-sky-700 dark:text-sky-400">
          {tr(lang, 'Pression Grille', 'ضغط البوابة', 'Gate Pressure')}: {pressurePsi}%
        </span>
      </div>

      <svg viewBox="0 0 540 235" className="w-full h-auto bg-stone-50 dark:bg-stone-950/70 rounded-lg border border-stone-200 dark:border-stone-800" direction="ltr">
        {/* Drain Pipe (Top -> Right) */}
        <path d="M 40 70 H 250 V 110 H 490" fill="none" stroke="#94a3b8" strokeWidth="44" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 40 70 H 250 V 110 H 490" fill="none" stroke="#0f172a" strokeWidth="36" strokeLinecap="round" strokeLinejoin="round" />

        {/* Flowing Water in Drain->Source Pipe */}
        {sim.conducting && (
          <path
            d="M 40 70 H 250 V 110 H 490"
            fill="none"
            stroke="#0284c7"
            strokeWidth={Math.max(8, aperture)}
            strokeDasharray="14 10"
            className="flow-active"
          />
        )}

        {/* Valve Chamber Throat */}
        <rect x="218" y="42" width="64" height="96" rx="8" fill="#1e293b" stroke="#64748b" strokeWidth="2.5" />

        {/* Movable Piston Gate Bar */}
        <rect
          x="228"
          y={sim.conducting ? (sim.region === 'ohmic' ? 46 : 64) : 84}
          width="44"
          height="32"
          rx="4"
          fill={sim.region === 'saturation' ? '#f59e0b' : '#38bdf8'}
          className="transition-all duration-300"
        />

        {/* Sealed SiO2 Rubber Membrane (between Control Chamber & Valve) */}
        <path
          d={`M 218 145 Q 250 ${145 - (pressurePsi / 100) * 18}, 282 145`}
          fill="none"
          stroke="#fbbf24"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <text x="250" y="138" textAnchor="middle" fill="#fbbf24" fontSize="9.5" fontFamily="monospace" fontWeight="700">
          SiO₂ MEMBRANE (0 LEAK)
        </text>

        {/* Gate Chamber Below */}
        <rect x="218" y="150" width="64" height="58" rx="6" fill={pressurePsi > 15 ? 'rgba(56,189,248,0.28)' : 'rgba(148,163,184,0.12)'} stroke="#0284c7" strokeWidth="2" />
        <line x1="120" y1="184" x2="218" y2="184" stroke="#0284c7" strokeWidth="14" />
        <text x="72" y="188" textAnchor="middle" fill="#0284c7" fontSize="11" fontFamily="monospace" fontWeight="700">
          GATE ({sim.vgs.toFixed(1)}V)
        </text>

        {/* 1 MOhm Bleed Bypass Pipe */}
        {params.pullDown1M && (
          <g>
            <line x1="170" y1="184" x2="170" y2="220" stroke="#64748b" strokeWidth="6" />
            <text x="170" y="231" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace" fontWeight="700">
              1MΩ BLEED
            </text>
          </g>
        )}

        {/* Body Diode One-Way Flapper Valve */}
        <g>
          <path d="M 335 70 V 30 H 420 V 92" fill="none" stroke="#64748b" strokeWidth="10" strokeLinejoin="round" />
          <polygon
            points="375,20 390,30 375,40"
            fill={sim.bodyDiodeActive ? '#f43f5e' : '#94a3b8'}
          />
          <text x="378" y="18" textAnchor="middle" fill={sim.bodyDiodeActive ? '#f43f5e' : '#64748b'} fontSize="9.5" fontFamily="monospace" fontWeight="700">
            BODY DIODE (S→D)
          </text>
        </g>

        {/* Labels */}
        <text x="64" y="42" fill="#0284c7" fontSize="11" fontFamily="monospace" fontWeight="700">
          DRAIN (+{params.vdd.toFixed(0)}V)
        </text>
        <text x="435" y="148" fill="#64748b" fontSize="11" fontFamily="monospace" fontWeight="700">
          SOURCE ({sim.idA.toFixed(2)} A)
        </text>
      </svg>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        <div className="rounded-lg bg-stone-100 dark:bg-stone-950 p-2.5 border border-stone-200 dark:border-stone-800">
          <div className="font-semibold text-sky-700 dark:text-sky-400">
            {tr(lang, 'Pression statique seule', 'ضغط ساكن فقط', 'Static Pressure Only')}
          </div>
          <div className="text-stone-600 dark:text-stone-300 mt-0.5">
            {tr(lang, 'La membrane gonfle avec V_GS sans laisser passer I_G.', 'ينتفخ الغشاء بالجهد دون استهلاك تيار.', 'Membrane flexes via voltage with zero flow.')}
          </div>
        </div>
        <div className="rounded-lg bg-stone-100 dark:bg-stone-950 p-2.5 border border-stone-200 dark:border-stone-800">
          <div className="font-semibold text-amber-700 dark:text-amber-400">
            {tr(lang, 'Ouverture canal = R_DS(on)', 'فتحة القناة = R_DS(on)', 'Aperture = R_DS(on)')}
          </div>
          <div className="text-stone-600 dark:text-stone-300 mt-0.5">
            {tr(lang, 'Mi-ouverte = friction et chaleur ! Ouverte à fond = frottement nul.', 'نصف مفتوحة تسبب حرارة عالية!', 'Half-open = friction & heat; full = milliohms.')}
          </div>
        </div>
        <div className="rounded-lg bg-stone-100 dark:bg-stone-950 p-2.5 border border-stone-200 dark:border-stone-800">
          <div className="font-semibold text-rose-700 dark:text-rose-400">
            {tr(lang, 'Clapet anti-retour interne', 'صمّام عدم رجوع داخلي', 'Internal One-Way Flapper')}
          </div>
          <div className="text-stone-600 dark:text-stone-300 mt-0.5">
            {tr(lang, 'L’eau revient toujours librement de la Source vers le Drain.', 'يمرر الماء عكسياً دائماً من S إلى D.', 'Fluid bypasses freely from Source back to Drain.')}
          </div>
        </div>
      </div>
    </div>
  );
};
