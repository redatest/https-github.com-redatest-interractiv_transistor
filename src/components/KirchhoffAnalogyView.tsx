import React from 'react';
import { Lang, tr } from '../types';
import { KirchhoffSimParams, KirchhoffSimReadout } from '../utils/kirchhoffPhysics';

interface Props {
  params: KirchhoffSimParams;
  sim: KirchhoffSimReadout;
  lang: Lang;
}

export const KirchhoffAnalogyView: React.FC<Props> = ({ params, sim, lang }) => {
  const isThevenin = params.topology === 'thevenin-equiv';
  const isKclFocused =
    params.topology === 'parallel-2' ||
    params.topology === 'parallel-3' ||
    params.topology === 'loaded-divider' ||
    params.topology === 'two-mesh-millman' ||
    params.topology === 'led-parallel-trap';

  const eMax = Math.max(isThevenin ? sim.eTh : params.e1, 1);
  const vAH = Math.max(8, Math.min(110, (sim.vA / eMax) * 105));
  const vTopH = 115;

  const pipeW1 = Math.max(4, Math.min(18, Math.abs(sim.i1MA) * 0.6));
  const pipeW2 = Math.max(3, Math.min(18, Math.abs(sim.i2MA) * 0.6));
  const pipeWTot = Math.max(6, Math.min(26, Math.abs(sim.iTotalMA) * 0.55));

  return (
    <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-gradient-to-b from-sky-50/70 to-emerald-50/40 dark:from-stone-900 dark:to-stone-900/90 p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between text-xs font-mono-num">
        <span className="font-bold text-sky-800 dark:text-sky-300">
          {isThevenin
            ? tr(lang, 'Analogie Hydraulique · Boîte Noire de Thévenin (E_th, R_th)', 'التشبيه المائي · الصندوق الأسود لثيفنان (E_th, R_th)', 'Hydraulic Analogy · Thévenin Black Box (E_th, R_th)')
            : isKclFocused
            ? tr(lang, 'Analogie Hydraulique · Nœud de Débit (KCL)', 'التشبيه المائي · تفرّع التدفق عند العقدة', 'Hydraulic Analogy · Flow Junction (KCL)')
            : tr(lang, 'Analogie Hydraulique · Boucle d’Altitude (KVL)', 'التشبيه المائي · ميزان الارتفاع في الحلقة', 'Hydraulic Analogy · Elevation Loop (KVL)')}
        </span>
        <span className="text-emerald-700 dark:text-emerald-400 font-bold">
          {isThevenin
            ? `E_th = ${sim.eTh.toFixed(2)}V · R_th = ${sim.rTh.toFixed(0)}Ω`
            : isKclFocused
            ? `∑Q = ${sim.iTotalMA.toFixed(1)} mA`
            : `ΔH = ${params.e1.toFixed(1)} m (V)`}
        </span>
      </div>

      {!isKclFocused ? (
        /* KVL ELEVATION STAIRCASE */
        <svg viewBox="0 0 460 205" className="w-full h-auto" direction="ltr">
          {/* Ground Sump Basin (0V) */}
          <rect x="25" y="162" width="410" height="24" rx="4" fill="#0f766e" fillOpacity="0.25" stroke="#14b8a6" strokeWidth="1.8" />
          <text x="230" y="178" textAnchor="middle" fontSize="10" fontFamily="monospace" fontWeight="700" fill="#0f766e">
            GND · Bassin 0.00 m (0.00 V)
          </text>

          {/* Left Pump Column (+E1) */}
          <rect x="45" y={162 - vTopH} width="54" height={vTopH} rx="6" fill="#f59e0b" fillOpacity="0.25" stroke="#d97706" strokeWidth="2" />
          <text x="72" y={162 - vTopH / 2} textAnchor="middle" fontSize="10" fontFamily="monospace" fontWeight="700" fill="#b45309">
            Pompe E₁
          </text>
          <text x="72" y={162 - vTopH / 2 + 14} textAnchor="middle" fontSize="9.5" fontFamily="monospace" fontWeight="700" fill="#d97706">
            +{params.e1.toFixed(1)}m
          </text>

          {/* Top aqueduct */}
          <line
            x1="99"
            y1={162 - vTopH + 12}
            x2="195"
            y2={162 - vTopH + 12}
            stroke="#f59e0b"
            strokeWidth="7"
            className={sim.iTotalMA > 0.05 ? 'flow-pulse-high' : ''}
          />

          {/* First Waterfall Drop U1 */}
          <rect x="195" y={162 - vTopH} width="12" height={Math.max(10, vTopH - vAH)} fill="#fb923c" />
          <text x="201" y={162 - vTopH - 6} textAnchor="middle" fontSize="9" fontFamily="monospace" fontWeight="700" fill="#c2410c">
            −U₁ ({sim.u1.toFixed(2)}V)
          </text>

          {/* Intermediate Terrace V_A */}
          <rect x="207" y={162 - vAH} width="105" height={vAH} rx="5" fill="#0284c7" fillOpacity="0.22" stroke="#0284c7" strokeWidth="2" />
          <text x="259" y={162 - vAH - 6} textAnchor="middle" fontSize="9.5" fontFamily="monospace" fontWeight="700" fill="#0369a1">
            Palier V_A = {sim.vA.toFixed(2)}V
          </text>

          {/* Second Waterfall Drop U2 back to 0 */}
          <rect x="312" y={162 - vAH} width="12" height={vAH} fill="#38bdf8" />
          <text x="372" y={162 - vAH / 2} textAnchor="middle" fontSize="9.5" fontFamily="monospace" fontWeight="700" fill="#0284c7">
            −U₂ ({sim.u2.toFixed(2)}V)
          </text>
        </svg>
      ) : (
        /* KCL MANIFOLD PIPE SPLIT */
        <svg viewBox="0 0 460 205" className="w-full h-auto" direction="ltr">
          {/* Main Incoming Pipe */}
          <line
            x1="35"
            y1="95"
            x2="175"
            y2="95"
            stroke="#f59e0b"
            strokeWidth={pipeWTot}
            strokeLinecap="round"
            className="flow-pulse-high"
          />
          <text x="95" y="72" textAnchor="middle" fontSize="10" fontFamily="monospace" fontWeight="700" fill="#b45309">
            I_in = {(params.topology === 'two-mesh-millman' ? sim.i1MA : sim.iTotalMA).toFixed(1)} mA
          </text>

          {/* Brass Manifold Node A */}
          <circle cx="195" cy="95" r="24" fill="#0f172a" stroke="#fbbf24" strokeWidth="3" />
          <text x="195" y="92" textAnchor="middle" fontSize="9" fontFamily="monospace" fontWeight="700" fill="#fef08a">
            Nœud A
          </text>
          <text x="195" y="105" textAnchor="middle" fontSize="8.5" fontFamily="monospace" fontWeight="700" fill="#38bdf8">
            {sim.vA.toFixed(2)}V
          </text>

          {/* Branch 1 Outflow */}
          <path
            d="M 218 82 L 420 50"
            fill="none"
            stroke="#fb923c"
            strokeWidth={pipeW1}
            strokeLinecap="round"
            className={Math.abs(sim.i1MA) > 0.05 ? 'flow-pulse-load' : ''}
          />
          <text x="355" y="40" textAnchor="middle" fontSize="9.5" fontFamily="monospace" fontWeight="700" fill="#c2410c">
            Branche 1 : {(params.topology === 'loaded-divider' ? sim.i2MA : sim.i1MA).toFixed(1)} mA
          </text>

          {/* Branch 2 Outflow */}
          <path
            d="M 218 108 L 420 142"
            fill="none"
            stroke="#0284c7"
            strokeWidth={pipeW2}
            strokeLinecap="round"
            className={Math.abs(sim.i2MA) > 0.05 || Math.abs(sim.iLoadMA) > 0.05 ? 'flow-pulse-ctrl' : ''}
          />
          <text x="355" y="166" textAnchor="middle" fontSize="9.5" fontFamily="monospace" fontWeight="700" fill="#0369a1">
            Branche 2 : {(params.topology === 'loaded-divider' ? sim.iLoadMA : sim.i2MA).toFixed(1)} mA
          </text>

          {/* KCL conservation caption */}
          <text x="230" y="192" textAnchor="middle" fontSize="9.5" fontFamily="monospace" fontWeight="700" fill="#047857">
            ∑ Débit entrant = ∑ Débits sortants (aucune fuite au raccord !)
          </text>
        </svg>
      )}

      <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
        {isKclFocused
          ? tr(
              lang,
              'Le diamètre et la vitesse des flux illustrent la loi des nœuds : chaque milliampère qui pénètre dans le raccord en cuivre doit ressortir exactement par les branches connectées.',
              'يوضح سُمك التدفق قانون العقد: كل ملي أمبير يدخل الوصلة النحاسية يخرج بالكامل عبر الفروع دون أي فقد أو تراكم.',
              'Stream thickness reflects branch current: every milliamp entering the brass manifold must leave across the outgoing pipes.'
            )
          : tr(
              lang,
              'La hauteur d’eau représente le potentiel (V). En parcourant la boucle fermée, les chutes U₁ + U₂ ramènent exactement la pression au niveau 0 du bassin de masse.',
              'يمثل ارتفاع عمود الماء قيمة الجهد الكهربائي (V)، ومجموع الهبوط عبر الشلالات يعيد الضغط إلى مستوى الصفر عند الأرضي.',
              'Water height represents electric potential (V). Summing every drop around the loop brings pressure back to ground 0 V.'
            )}
      </p>
    </div>
  );
};
