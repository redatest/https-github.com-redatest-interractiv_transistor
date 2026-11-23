import React, { useState } from 'react';
import { Lang, tr } from '../types';
import { MosfetSimParams, MosfetSimReadout } from '../utils/mosfetPhysics';

interface Props {
  params: MosfetSimParams;
  sim: MosfetSimReadout;
  lang: Lang;
  onQuickAction?: (action: string) => void;
}

const PART_INFO: Record<string, { name: string; fr: string; ar: string; en: string }> = {
  mosfet: {
    name: 'MOSFET TO-220 (G–D–S)',
    fr: 'Grille isolée par SiO₂ (I_G ≈ 0). Le champ électrique ouvre un canal entre Drain et Source avec R_DS(on) très faible.',
    ar: 'بوابة معزولة بأكسيد SiO₂ (تيار ≈ 0). يفتح المجال الكهربائي قناة بين Drain و Source بمقاومة ضئيلة.',
    en: 'Insulated SiO₂ Gate (I_G ≈ 0). Electric field opens a low-resistance channel between Drain and Source.',
  },
  pulldown: {
    name: '1 MΩ Gate Pull-Down',
    fr: 'Décharge la capacité de grille C_iss vers GND dès qu’aucun signal n’est appliqué (évite le déclenchement statique).',
    ar: 'تفرّغ شحنة مكثف البوابة نحو الأرضي لمنع بقاء الترانزستور مفتوحاً عشوائياً.',
    en: 'Bleeds gate capacitance C_iss to GND whenever floating so static charge cannot latch the MOSFET ON.',
  },
  rg: {
    name: 'R_G Gate Resistor',
    fr: 'Limite le pic de courant transitoire à l’entrée du microcontrôleur et calme les oscillations parasites.',
    ar: 'تحدّ من ذروة تيار شحن البوابة لحماية منفذ الميكروكونترولر ومنع الرنين.',
    en: 'Limits transient gate charging current spikes and damps parasitic ringing.',
  },
  flyback: {
    name: '1N5819 Flyback Diode',
    fr: 'Absorbe la surtension −L·dI/dt d’un moteur ou d’une bobine à la coupure pour protéger le Drain.',
    ar: 'تمتص قفزة الجهد الحثّية عند إطفاء المحرك أو الملف لحماية الموسفيت من الانهيار.',
    en: 'Clamps inductive −L·dI/dt voltage spikes across motors/coils so the Drain never breaks down.',
  },
  inductor: {
    name: 'Inductance L / Moteur',
    fr: 'Stocke l’énergie magnétique (½·L·I²) lorsque le MOSFET conduit et la restitue quand il bloque.',
    ar: 'يخزّن الطاقة المغناطيسية أثناء توصيل الموسفيت ثم يفرّغها بجهد أعلى أو في الحمل.',
    en: 'Stores magnetic energy (½·L·I²) during ON-time and releases it on turn-off.',
  },
  load: {
    name: 'Charge Puissance / LED',
    fr: 'Reçoit la quasi-totalité de la tension grâce à R_DS(on) de quelques milliohms.',
    ar: 'يحصل على الجهد الكامل تقريباً بفضل المقاومة الضئيلة للقناة المفتوحة.',
    en: 'Receives nearly full rail voltage thanks to milliohm R_DS(on) drop.',
  },
};

export const MosfetBoard3D: React.FC<Props> = ({ params, sim, lang, onQuickAction }) => {
  const [selectedPart, setSelectedPart] = useState<string>('mosfet');

  const cid = params.catalogId;
  const isHBridge =
    (params.chapterId === 8 && (params.exampleId === 'h-bridge-motor' || params.exampleId === 'hbridge-motor')) ||
    cid === 'mos-hbridge-drive';
  const isCMOS = params.chapterId === 4 || cid === 'mos-cmos-inverter';
  const isBoost = params.chapterId === 7 || cid === 'mos-boost-12v';
  const isTester = cid === 'mos-multimeter-tester';

  const hotGlow = sim.tempC > 75;
  const criticalHeat = sim.tempC > 130;
  const powerFlow = sim.conducting || sim.bodyDiodeActive;
  const isPMOS =
    params.fetPolarity === 'PMOS' ||
    params.exampleId === 'pmos-reverse-polarity' ||
    params.exampleId === 'pmos-highside' ||
    cid === 'mos-pmos-highside' ||
    cid === 'mos-reverse-polarity';

  const fetLabel =
    params.chapterId === 1 || cid === 'mos-floating-touch'
      ? '2N7000'
      : isPMOS
      ? 'IRF9540'
      : params.fetModel === 'irf540n'
      ? 'IRF540N'
      : 'IRLZ44N';

  const inspector = PART_INFO[selectedPart] ?? PART_INFO.mosfet;

  return (
    <div className="flex flex-col gap-3">
      <div className="workbench-mat rounded-xl p-4 sm:p-6 border border-stone-800/40 relative overflow-hidden">
        <div
          className="flex items-center justify-between text-xs font-mono-num text-stone-300 mb-3"
          dir="ltr"
        >
          <span>
            {isTester
              ? 'ANALOG / DIODE MOSFET TEST BENCH'
              : isHBridge
              ? '4-MOSFET H-BRIDGE PCB'
              : isCMOS
              ? 'CMOS COMPLEMENTARY PAIR'
              : isBoost
              ? 'BOOST DC-DC CONVERTER'
              : `${fetLabel} WORKBENCH PCB`}
          </span>
          <span className={criticalHeat ? 'text-rose-400 font-bold' : hotGlow ? 'text-amber-400 font-bold' : 'text-sky-300'}>
            T_J ≈ {Math.round(sim.tempC)} °C · R_DS = {sim.rdsOhms >= 100 ? '∞' : sim.rdsOhms < 1 ? `${(sim.rdsOhms * 1000).toFixed(0)} mΩ` : `${sim.rdsOhms.toFixed(2)} Ω`}
          </span>
        </div>

        {/* 3D Tilted Green PCB */}
        <div style={{ perspective: '900px' }} className="w-full flex justify-center">
          <div
            style={{
              transform: 'rotateX(12deg) rotateZ(-1.5deg)',
              transformStyle: 'preserve-3d',
            }}
            className="w-full max-w-[560px] rounded-xl bg-gradient-to-br from-[#0f4734] via-[#0c3b2c] to-[#08291f] border-2 border-[#1e6a4e] shadow-[0_22px_36px_rgba(0,0,0,0.55)] p-3"
          >
            <svg viewBox="0 0 520 250" className="w-full h-auto select-none" direction="ltr">
              <defs>
                <filter id="mos-glow" x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Corner PCB mounting holes */}
              {[
                [14, 14],
                [506, 14],
                [14, 236],
                [506, 236],
              ].map(([cx, cy], idx) => (
                <g key={idx}>
                  <circle cx={cx} cy={cy} r="6" fill="#061913" stroke="#d4af37" strokeWidth="2" />
                </g>
              ))}

              {/* Copper rails */}
              <path d="M 38 42 H 482" stroke={params.batteryReversed ? '#e11d48' : '#b87333'} strokeWidth="5" opacity="0.7" />
              <path d="M 38 212 H 482" stroke="#64748b" strokeWidth="5" opacity="0.75" />
              <text x="42" y="34" fill={params.batteryReversed ? '#fb7185' : '#fbbf24'} fontSize="10" fontFamily="monospace" fontWeight="700">
                {params.batteryReversed
                  ? '−12V REVERSED!'
                  : `+${isCMOS ? '5.0' : isBoost ? params.boostVin.toFixed(1) : params.vdd.toFixed(0)}V RAIL`}
              </text>
              <text x="42" y="229" fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="700">
                GND (0 V)
              </text>

              {isTester ? (
                /* Tester layout on PCB */
                <g>
                  <rect x="44" y="58" width="175" height="135" rx="10" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
                  <rect x="58" y="70" width="147" height="72" rx="6" fill="#fefce8" />
                  <path d="M 74 128 A 58 58 0 0 1 188 128" fill="none" stroke="#1c1917" strokeWidth="2" />
                  <text x="68" y="122" fontSize="10" fontWeight="700" fill="#dc2626">∞</text>
                  <text x="176" y="122" fontSize="10" fontWeight="700" fill="#16a34a">0 Ω</text>
                  <g transform={`translate(131, 134) rotate(${-45 + sim.meterDeflection * 90})`}>
                    <line x1="0" y1="0" x2="0" y2="-50" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="0" cy="0" r="4" fill="#0f172a" />
                  </g>
                  <text x="131" y="170" textAnchor="middle" fill={sim.conducting ? '#34d399' : '#e2e8f0'} fontSize="11" fontFamily="monospace" fontWeight="700">
                    {params.testerGateCharged ? 'GATE LATCHED!' : sim.bodyDiodeActive ? 'BODY DIODE ~0.55V' : 'G–D–S PROBE'}
                  </text>

                  {/* TO-220 under test */}
                  <g onClick={() => setSelectedPart('mosfet')} className="cursor-pointer">
                    <rect x="305" y="74" width="74" height="58" rx="4" fill="#18181b" stroke="#71717a" strokeWidth="2" />
                    <rect x="305" y="58" width="74" height="18" rx="2" fill="#cbd5e1" />
                    <circle cx="342" cy="67" r="4.5" fill="#0f4734" />
                    <text x="342" y="106" textAnchor="middle" fill="#38bdf8" fontSize="11" fontFamily="monospace" fontWeight="700">
                      {params.testerType === 'pmos_gds' ? 'IRF9540' : 'IRLZ44N'}
                    </text>
                    {[1, 2, 3].map((pin) => {
                      const px = 300 + pin * 21;
                      const isB = params.blackPin === pin;
                      const isR = params.redPin === pin;
                      return (
                        <g key={pin}>
                          <line x1={px} y1="132" x2={px} y2="180" stroke="#cbd5e1" strokeWidth="4.5" />
                          <text x={px} y="196" textAnchor="middle" fill="#e2e8f0" fontSize="11" fontFamily="monospace" fontWeight="700">
                            {pin === 1 ? '1:G' : pin === 2 ? '2:D' : '3:S'}
                          </text>
                          {isB && <circle cx={px} cy="166" r="6" fill="#09090b" stroke="#fff" strokeWidth="2" />}
                          {isR && <circle cx={px} cy="152" r="6" fill="#e11d48" stroke="#fff" strokeWidth="2" />}
                        </g>
                      );
                    })}
                  </g>
                </g>
              ) : isHBridge ? (
                /* 4 MOSFET H-Bridge layout */
                <g>
                  {[
                    { id: 'Q1', x: 105, y: 66, label: 'Q1 P-MOS', on: params.hbridgeState === 'FWD' },
                    { id: 'Q3', x: 355, y: 66, label: 'Q3 P-MOS', on: params.hbridgeState === 'REV' },
                    { id: 'Q2', x: 105, y: 152, label: 'Q2 N-MOS', on: params.hbridgeState === 'REV' || params.hbridgeState === 'BRAKE' },
                    { id: 'Q4', x: 355, y: 152, label: 'Q4 N-MOS', on: params.hbridgeState === 'FWD' || params.hbridgeState === 'BRAKE' },
                  ].map((q) => (
                    <g key={q.id} onClick={() => setSelectedPart('mosfet')} className="cursor-pointer">
                      <rect
                        x={q.x}
                        y={q.y}
                        width="64"
                        height="36"
                        rx="4"
                        fill={q.on ? '#0369a1' : '#18181b'}
                        stroke={q.on ? '#38bdf8' : '#52525b'}
                        strokeWidth="2"
                      />
                      <text x={q.x + 32} y={q.y + 22} textAnchor="middle" fill="#f8fafc" fontSize="10" fontFamily="monospace" fontWeight="700">
                        {q.label}
                      </text>
                    </g>
                  ))}

                  {/* Traces */}
                  <path d="M 137 42 V 66 M 387 42 V 66 M 137 188 V 212 M 387 188 V 212" stroke="#d4af37" strokeWidth="3" />
                  <path
                    d="M 137 102 V 152 M 387 102 V 152"
                    stroke="#64748b"
                    strokeWidth="3"
                  />
                  {/* Active Motor Current Path */}
                  <path
                    d="M 137 127 H 222 M 298 127 H 387"
                    stroke={
                      params.hbridgeState === 'FWD'
                        ? '#38bdf8'
                        : params.hbridgeState === 'REV'
                        ? '#fbbf24'
                        : params.hbridgeState === 'BRAKE'
                        ? '#fb7185'
                        : '#64748b'
                    }
                    strokeWidth="3.5"
                    className={
                      params.hbridgeState === 'FWD'
                        ? 'flow-active'
                        : params.hbridgeState === 'REV'
                        ? 'flow-active-rev'
                        : ''
                    }
                  />

                  {/* Center Motor (rotor cleanly centered inside circle) */}
                  <g onClick={() => setSelectedPart('inductor')} className="cursor-pointer">
                    <circle
                      cx="260"
                      cy="127"
                      r="34"
                      fill="#1e293b"
                      stroke={
                        params.hbridgeState === 'BRAKE'
                          ? '#fb7185'
                          : powerFlow
                          ? '#fbbf24'
                          : '#64748b'
                      }
                      strokeWidth="3"
                    />
                    <g transform="translate(260, 127)">
                      <g
                        className={
                          params.hbridgeState === 'FWD'
                            ? 'fan-spin'
                            : params.hbridgeState === 'REV'
                            ? 'fan-spin-rev'
                            : ''
                        }
                      >
                        <rect x="-24" y="-3.5" width="48" height="7" rx="3.5" fill="#fbbf24" />
                        <rect x="-3.5" y="-24" width="7" height="48" rx="3.5" fill="#38bdf8" />
                      </g>
                    </g>
                    <circle cx="260" cy="127" r="10" fill="#0f172a" stroke="#e2e8f0" strokeWidth="1.5" />
                    <text x="260" y="130.5" textAnchor="middle" fill="#fff" fontSize="9.5" fontFamily="monospace" fontWeight="700">
                      M
                    </text>
                  </g>

                  {/* Direction label below motor */}
                  <text x="260" y="177" textAnchor="middle" fill="#e2e8f0" fontSize="9.5" fontFamily="monospace" fontWeight="700">
                    {params.hbridgeState === 'FWD'
                      ? '↻ FWD (CW)'
                      : params.hbridgeState === 'REV'
                      ? '↺ REV (CCW)'
                      : params.hbridgeState === 'BRAKE'
                      ? '■ BRAKE'
                      : '○ COAST'}
                  </text>
                </g>
              ) : isCMOS ? (
                /* CMOS stacked P-MOS + N-MOS inverter */
                <g>
                  {sim.shootThrough && (
                    <rect x="218" y="48" width="96" height="156" rx="12" fill="rgba(244,63,94,0.28)" filter="url(#mos-glow)" />
                  )}
                  <path
                    d="M 266 42 V 212"
                    stroke={sim.shootThrough ? '#f43f5e' : '#fbbf24'}
                    strokeWidth={sim.shootThrough ? '5' : '3'}
                    className={sim.shootThrough ? 'flow-active' : ''}
                  />
                  <g onClick={() => setSelectedPart('mosfet')} className="cursor-pointer">
                    <rect x="228" y="64" width="76" height="42" rx="4" fill="#18181b" stroke={params.cmosVin < 3.5 ? '#38bdf8' : '#52525b'} strokeWidth="2" />
                    <text x="266" y="88" textAnchor="middle" fill="#38bdf8" fontSize="11" fontFamily="monospace" fontWeight="700">
                      Q1 P-MOS
                    </text>
                    <rect x="228" y="144" width="76" height="42" rx="4" fill="#18181b" stroke={params.cmosVin > 1.5 ? '#fbbf24' : '#52525b'} strokeWidth="2" />
                    <text x="266" y="168" textAnchor="middle" fill="#fbbf24" fontSize="11" fontFamily="monospace" fontWeight="700">
                      Q2 N-MOS
                    </text>
                  </g>
                  <path d="M 118 125 H 196 V 85 H 228 M 196 125 V 165 H 228" stroke="#38bdf8" strokeWidth="3" fill="none" />
                  <rect x="64" y="108" width="68" height="34" rx="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
                  <text x="98" y="129" textAnchor="middle" fill="#e0f2fe" fontSize="11" fontFamily="monospace" fontWeight="700">
                    IN {params.cmosVin.toFixed(1)}V
                  </text>
                  <path d="M 266 125 H 378" stroke="#34d399" strokeWidth="3.5" />
                  <rect x="378" y="106" width="96" height="38" rx="6" fill="#0f172a" stroke="#34d399" strokeWidth="2" />
                  <text x="426" y="129" textAnchor="middle" fill="#34d399" fontSize="11" fontFamily="monospace" fontWeight="700">
                    OUT {sim.vout.toFixed(1)}V
                  </text>
                </g>
              ) : (
                /* Standard Power / Gate Control PCB layout */
                <g>
                  {/* Copper Traces */}
                  <path
                    d="M 88 148 H 170 H 228"
                    stroke={Math.abs(sim.vgs) > 0.5 ? '#38bdf8' : '#64748b'}
                    strokeWidth="3.5"
                    fill="none"
                  />
                  <path
                    d="M 272 42 V 82 M 272 135 V 188 M 305 188 H 430 V 42"
                    stroke={powerFlow ? '#fbbf24' : '#b87333'}
                    strokeWidth="4"
                    fill="none"
                    className={powerFlow ? 'flow-active' : ''}
                  />

                  {/* Gate Input Pad / MCU */}
                  <g
                    onClick={() =>
                      onQuickAction?.(
                        params.exampleId === 'gate-cap-memory' ||
                          params.exampleId === 'floating-gate-memory' ||
                          cid === 'mos-floating-touch'
                          ? 'touch-gate'
                          : 'pulse'
                      )
                    }
                    className="cursor-pointer"
                  >
                    <rect x="36" y="126" width="84" height="44" rx="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
                    <text x="78" y="145" textAnchor="middle" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="700">
                      GATE IN
                    </text>
                    <text x="78" y="160" textAnchor="middle" fill="#f8fafc" fontSize="11" fontFamily="monospace" fontWeight="700">
                      {sim.vgs.toFixed(1)} V
                    </text>
                  </g>

                  {/* R_G Gate Resistor */}
                  <g onClick={() => setSelectedPart('rg')} className="cursor-pointer">
                    <rect x="140" y="139" width="44" height="18" rx="4" fill="#d6b47c" stroke="#92400e" strokeWidth="1.5" />
                    <text x="162" y="151" textAnchor="middle" fill="#1c1917" fontSize="9" fontFamily="monospace" fontWeight="700">
                      R_G
                    </text>
                  </g>

                  {/* 1 MOhm Pull-Down */}
                  <g onClick={() => setSelectedPart('pulldown')} className="cursor-pointer">
                    <line x1="200" y1="148" x2="200" y2="212" stroke="#64748b" strokeWidth="2.5" />
                    <rect
                      x="189"
                      y="165"
                      width="22"
                      height="30"
                      rx="3"
                      fill={params.pullDown1M ? '#3b82f6' : '#334155'}
                      opacity={params.pullDown1M ? 1 : 0.35}
                    />
                    <text x="200" y="183" textAnchor="middle" fill="#fff" fontSize="8" fontFamily="monospace" fontWeight="700">
                      {params.pullDown1M ? '1MΩ' : 'OFF'}
                    </text>
                  </g>

                  {/* Thermal halo on MOSFET */}
                  {hotGlow && (
                    <circle
                      cx="272"
                      cy="126"
                      r="52"
                      fill={criticalHeat ? 'rgba(244,63,94,0.38)' : 'rgba(245,158,11,0.3)'}
                      filter="url(#mos-glow)"
                    />
                  )}

                  {/* Main TO-220 MOSFET */}
                  <g onClick={() => setSelectedPart('mosfet')} className="cursor-pointer">
                    <rect x="234" y="80" width="76" height="22" rx="2" fill="#cbd5e1" stroke="#64748b" />
                    <circle cx="272" cy="91" r="5" fill="#0f4734" />
                    <rect
                      x="234"
                      y="102"
                      width="76"
                      height="52"
                      rx="4"
                      fill="#18181b"
                      stroke={hotGlow ? '#f43f5e' : powerFlow ? '#38bdf8' : '#71717a'}
                      strokeWidth="2.5"
                    />
                    <text x="272" y="124" textAnchor="middle" fill="#f8fafc" fontSize="11" fontFamily="monospace" fontWeight="700">
                      {fetLabel}
                    </text>
                    <text x="272" y="141" textAnchor="middle" fill={powerFlow ? '#34d399' : '#94a3b8'} fontSize="9.5" fontFamily="monospace">
                      {sim.rdsOhms < 1 ? `${(sim.rdsOhms * 1000).toFixed(0)} mΩ` : sim.rdsOhms > 1e5 ? 'OFF' : `${sim.rdsOhms.toFixed(1)} Ω`}
                    </text>
                    {/* Leads G D S */}
                    <line x1="248" y1="154" x2="248" y2="188" stroke="#cbd5e1" strokeWidth="4" />
                    <line x1="272" y1="154" x2="272" y2="188" stroke="#cbd5e1" strokeWidth="4" />
                    <line x1="296" y1="154" x2="296" y2="188" stroke="#cbd5e1" strokeWidth="4" />
                    <text x="248" y="200" textAnchor="middle" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="700">G</text>
                    <text x="272" y="200" textAnchor="middle" fill="#fbbf24" fontSize="10" fontFamily="monospace" fontWeight="700">D</text>
                    <text x="296" y="200" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="700">S</text>
                    <path d="M 296 188 V 212" stroke="#94a3b8" strokeWidth="3.5" />
                  </g>

                  {/* Load / Inductor / LED / Boost Stage */}
                  <g onClick={() => setSelectedPart(isBoost ? 'inductor' : 'load')} className="cursor-pointer">
                    <rect
                      x="372"
                      y="76"
                      width="102"
                      height="76"
                      rx="10"
                      fill={powerFlow ? 'rgba(251,191,36,0.16)' : '#0f172a'}
                      stroke={powerFlow ? '#fbbf24' : '#475569'}
                      strokeWidth="2.5"
                    />
                    <text x="423" y="108" textAnchor="middle" fill="#fbbf24" fontSize="11" fontFamily="monospace" fontWeight="700">
                      {isBoost
                        ? `BOOST ${sim.vout.toFixed(1)}V`
                        : params.chapterId === 6 || cid === 'mos-flyback-clamp'
                        ? 'COIL / MOTOR'
                        : 'LOAD'}
                    </text>
                    <text x="423" y="130" textAnchor="middle" fill="#e2e8f0" fontSize="12" fontFamily="monospace" fontWeight="700">
                      {sim.idA.toFixed(2)} A
                    </text>
                  </g>

                  {/* Optional Flyback Diode badge on Ch 6 */}
                  {(params.chapterId === 6 || cid === 'mos-flyback-clamp') && (
                    <g onClick={() => setSelectedPart('flyback')} className="cursor-pointer">
                      <rect
                        x="372"
                        y="164"
                        width="102"
                        height="26"
                        rx="5"
                        fill={params.flybackInstalled ? '#064e3b' : '#7f1d1d'}
                        stroke={params.flybackInstalled ? '#34d399' : '#f87171'}
                      />
                      <text x="423" y="181" textAnchor="middle" fill="#fff" fontSize="9.5" fontFamily="monospace" fontWeight="700">
                        {params.flybackInstalled ? '1N5819 DIODE OK' : 'NO DIODE! +96V'}
                      </text>
                    </g>
                  )}
                </g>
              )}
            </svg>
          </div>
        </div>
      </div>

      {/* Clickable Part Inspector */}
      <div className="rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/70 px-3.5 py-2.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="font-mono-num font-bold text-sky-700 dark:text-sky-400 me-2">
            {inspector.name}
          </span>
          <span className="text-stone-700 dark:text-stone-300">
            {tr(lang, inspector.fr, inspector.ar, inspector.en)}
          </span>
        </div>
        <span className="text-[11px] text-stone-400 shrink-0">
          {tr(lang, 'Cliquez un composant sur le PCB', 'انقر على أي مكوّن للفحص', 'Click any PCB component')}
        </span>
      </div>
    </div>
  );
};
