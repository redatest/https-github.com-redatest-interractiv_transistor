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
    name: 'MOSFET (G – D – S)',
    fr: 'Grille (G) isolée par SiO₂ (I_G ≈ 0). La tension entre G et S ouvre un canal conducteur entre Drain (D) et Source (S).',
    ar: 'البوابة (G) معزولة بأكسيد SiO₂ (تيار ≈ 0). يفتح الجهد بين G و S قناة بين المصرف (D) والمنبع (S).',
    en: 'Gate (G) is insulated by SiO₂ (I_G ≈ 0). Voltage between G and S opens a conductive channel between Drain (D) and Source (S).',
  },
  pulldown: {
    name: '1 MΩ Gate Pull-Down',
    fr: 'Décharge la capacité de grille C_iss vers GND dès qu’aucun signal n’est appliqué sur la broche G.',
    ar: 'تفرّغ شحنة مكثف البوابة G نحو الأرضي عند انقطاع إشارة التحكم.',
    en: 'Bleeds gate capacitance C_iss on pin G to GND whenever floating.',
  },
  rg: {
    name: 'R_G Gate Resistor',
    fr: 'Placée en série devant la broche G (Grille) pour limiter le pic transitoire du microcontrôleur.',
    ar: 'تُربط على التوالي مع البوابة G للحدّ من ذروة تيار الشحن اللحظي.',
    en: 'Series resistor into pin G (Gate) to damp ringing and cap MCU peak current.',
  },
  flyback: {
    name: '1N5819 Flyback Diode',
    fr: 'Protège la broche Drain (D) contre la surtension −L·dI/dt d’un moteur ou d’une bobine à la coupure.',
    ar: 'تحمي المصرف (D) من قفزة الجهد الحثّية عند إطفاء المحرك أو الملف.',
    en: 'Clamps inductive −L·dI/dt voltage spikes to protect the Drain (D) pin.',
  },
  inductor: {
    name: 'Charge / Moteur / Bobine',
    fr: 'Reçoit le flux de puissance lorsque le canal D ↔ S conduit. Observez le sens du courant à travers S et D.',
    ar: 'تستقبل تيار القدرة عندما تنفتح القناة بين D و S. لاحظ اتجاه السهم عبر الأقطاب.',
    en: 'Receives power flow when the D ↔ S channel conducts. Watch current flow through S and D.',
  },
  load: {
    name: 'Charge Puissance / LED',
    fr: 'Alimentée avec une chute minimale grâce à R_DS(on) de quelques milliohms entre D et S.',
    ar: 'تتغذّى بهبوط جهد ضئيل جداً بفضل مقاومة R_DS(on) بين D و S.',
    en: 'Powered with near-zero voltage drop thanks to milliohm R_DS(on) across D and S.',
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

  // Helper to render a compact 3-pin MOSFET package for H-Bridge & CMOS (always showing G, D, S pins!)
  const renderPinMosfet = ({
    id,
    x,
    y,
    polarity,
    active,
    gateDriveLabel,
    gateHigh,
    gateSide,
    topPin,
    bottomPin,
  }: {
    id: string;
    x: number;
    y: number;
    polarity: 'P-MOS' | 'N-MOS';
    active: boolean;
    gateDriveLabel: string;
    gateHigh: boolean;
    gateSide: 'left' | 'right';
    topPin: 'S' | 'D';
    bottomPin: 'S' | 'D';
  }) => {
    const w = 68;
    const h = 42;
    const cx = x + w / 2;
    const gatePinX = gateSide === 'left' ? x - 14 : x + w + 14;
    const gateBodyX = gateSide === 'left' ? x : x + w;
    const bodyColor = polarity === 'P-MOS' ? '#38bdf8' : '#fbbf24';

    return (
      <g key={id} onClick={() => setSelectedPart('mosfet')} className="cursor-pointer">
        {/* Top vertical lead (S or D) */}
        <line x1={cx} y1={y - 12} x2={cx} y2={y} stroke="#cbd5e1" strokeWidth="4" />
        <circle cx={cx} cy={y - 12} r="3.5" fill={active ? bodyColor : '#94a3b8'} />
        <text
          x={cx + 8}
          y={y - 4}
          fill={topPin === 'S' ? '#e2e8f0' : '#fbbf24'}
          fontSize="9"
          fontFamily="monospace"
          fontWeight="700"
        >
          {topPin}
        </text>

        {/* Bottom vertical lead (D or S) */}
        <line x1={cx} y1={y + h} x2={cx} y2={y + h + 12} stroke="#cbd5e1" strokeWidth="4" />
        <circle cx={cx} cy={y + h + 12} r="3.5" fill={active ? bodyColor : '#94a3b8'} />
        <text
          x={cx + 8}
          y={y + h + 11}
          fill={bottomPin === 'S' ? '#e2e8f0' : '#fbbf24'}
          fontSize="9"
          fontFamily="monospace"
          fontWeight="700"
        >
          {bottomPin}
        </text>

        {/* Gate horizontal lead (G) */}
        <line x1={gatePinX} y1={y + h / 2} x2={gateBodyX} y2={y + h / 2} stroke={gateHigh ? '#38bdf8' : '#94a3b8'} strokeWidth="3.5" />
        <circle cx={gatePinX} cy={y + h / 2} r="3.5" fill={gateHigh ? '#38bdf8' : '#64748b'} />
        <text
          x={gateSide === 'left' ? gatePinX + 5 : gatePinX - 11}
          y={y + h / 2 - 5}
          fill="#38bdf8"
          fontSize="9"
          fontFamily="monospace"
          fontWeight="700"
        >
          G
        </text>
        <text
          x={gateSide === 'left' ? gatePinX - 4 : gatePinX + 4}
          y={y + h / 2 + 12}
          textAnchor={gateSide === 'left' ? 'end' : 'start'}
          fill={active ? '#34d399' : '#94a3b8'}
          fontSize="8.5"
          fontFamily="monospace"
          fontWeight="700"
        >
          {gateDriveLabel}
        </text>

        {/* Epoxy Package Body */}
        <rect
          x={x}
          y={y}
          width={w}
          height={h}
          rx="4"
          fill={active ? (polarity === 'P-MOS' ? '#0c4a6e' : '#451a03') : '#18181b'}
          stroke={active ? bodyColor : '#52525b'}
          strokeWidth="2.2"
        />
        <text x={cx} y={y + 17} textAnchor="middle" fill="#f8fafc" fontSize="10" fontFamily="monospace" fontWeight="700">
          {id}
        </text>
        <text x={cx} y={y + 31} textAnchor="middle" fill={bodyColor} fontSize="8.5" fontFamily="monospace" fontWeight="700">
          {polarity} {active ? 'ON' : 'OFF'}
        </text>
      </g>
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="workbench-mat rounded-xl p-4 sm:p-6 border border-stone-800/40 relative overflow-hidden">
        <div className="flex items-center justify-between text-xs font-mono-num text-stone-300 mb-3" dir="ltr">
          <span>
            {isTester
              ? 'ANALOG / DIODE MOSFET TEST BENCH'
              : isHBridge
              ? '4-MOSFET H-BRIDGE PCB (PINS G·D·S)'
              : isCMOS
              ? 'CMOS COMPLEMENTARY PAIR (PINS G·D·S)'
              : isBoost
              ? 'BOOST DC-DC CONVERTER (PINS G·D·S)'
              : `${fetLabel} WORKBENCH PCB (PINS G·D·S)`}
          </span>
          <span className={criticalHeat ? 'text-rose-400 font-bold' : hotGlow ? 'text-amber-400 font-bold' : 'text-sky-300'}>
            T_J ≈ {Math.round(sim.tempC)} °C · R_DS ={' '}
            {sim.rdsOhms >= 100 ? '∞' : sim.rdsOhms < 1 ? `${(sim.rdsOhms * 1000).toFixed(0)} mΩ` : `${sim.rdsOhms.toFixed(2)} Ω`}
          </span>
        </div>

        {/* 3D Tilted Green PCB */}
        <div style={{ perspective: '900px' }} className="w-full flex justify-center">
          <div
            style={{
              transform: 'rotateX(12deg) rotateZ(-1.5deg)',
              transformStyle: 'preserve-3d',
            }}
            className="w-full max-w-[560px] rounded-xl bg-gradient-to-br from-[#1f8a5e] via-[#18734d] to-[#125d3e] border-2 border-[#42b883] shadow-[0_20px_34px_rgba(0,0,0,0.42)] p-3"
          >
            <svg viewBox="0 0 520 265" className="w-full h-auto select-none" direction="ltr">
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
                [14, 251],
                [506, 251],
              ].map(([cx, cy], idx) => (
                <circle key={idx} cx={cx} cy={cy} r="6" fill="#2a6b70" stroke="#e2c044" strokeWidth="2" />
              ))}

              {/* Copper Supply & Ground Rails */}
              <path d="M 38 36 H 482" stroke={params.batteryReversed ? '#e11d48' : '#d4af37'} strokeWidth="5" opacity="0.88" />
              <path d="M 38 230 H 482" stroke="#cbd5e1" strokeWidth="5" opacity="0.85" />
              <text x="42" y="28" fill={params.batteryReversed ? '#fda4af' : '#fde047'} fontSize="10" fontFamily="monospace" fontWeight="700">
                {params.batteryReversed
                  ? '−12V REVERSED!'
                  : `+${isCMOS ? '5.0' : isBoost ? params.boostVin.toFixed(1) : params.vdd.toFixed(0)}V RAIL`}
              </text>
              <text x="42" y="247" fill="#e2e8f0" fontSize="10" fontFamily="monospace" fontWeight="700">
                GND (0 V)
              </text>

              {isTester ? (
                /* Tester layout on PCB with explicit 1:G, 2:D, 3:S pins */
                <g>
                  <rect x="44" y="58" width="175" height="145" rx="10" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
                  <rect x="58" y="70" width="147" height="76" rx="6" fill="#fefce8" />
                  <path d="M 74 132 A 58 58 0 0 1 188 132" fill="none" stroke="#1c1917" strokeWidth="2" />
                  <text x="68" y="126" fontSize="10" fontWeight="700" fill="#dc2626">∞</text>
                  <text x="176" y="126" fontSize="10" fontWeight="700" fill="#16a34a">0 Ω</text>
                  <g transform={`translate(131, 138) rotate(${-45 + sim.meterDeflection * 90})`}>
                    <line x1="0" y1="0" x2="0" y2="-50" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="0" cy="0" r="4" fill="#0f172a" />
                  </g>
                  <text x="131" y="178" textAnchor="middle" fill={sim.conducting ? '#34d399' : '#e2e8f0'} fontSize="11" fontFamily="monospace" fontWeight="700">
                    {params.testerGateCharged ? 'GATE LATCHED!' : sim.bodyDiodeActive ? 'BODY DIODE ~0.55V' : 'G–D–S PROBE'}
                  </text>

                  <g onClick={() => setSelectedPart('mosfet')} className="cursor-pointer">
                    <rect x="305" y="76" width="78" height="58" rx="4" fill="#18181b" stroke="#71717a" strokeWidth="2" />
                    <rect x="305" y="58" width="78" height="18" rx="2" fill="#cbd5e1" />
                    <circle cx="344" cy="67" r="4.5" fill="#18734d" />
                    <text x="344" y="108" textAnchor="middle" fill="#38bdf8" fontSize="11" fontFamily="monospace" fontWeight="700">
                      {params.testerType === 'pmos_gds' ? 'IRF9540' : 'IRLZ44N'}
                    </text>
                    {[1, 2, 3].map((pin) => {
                      const px = 301 + pin * 21.5;
                      const isB = params.blackPin === pin;
                      const isR = params.redPin === pin;
                      return (
                        <g key={pin}>
                          <line x1={px} y1="134" x2={px} y2="188" stroke="#cbd5e1" strokeWidth="4.5" />
                          <text x={px} y="206" textAnchor="middle" fill={pin === 1 ? '#38bdf8' : pin === 2 ? '#fbbf24' : '#e2e8f0'} fontSize="11" fontFamily="monospace" fontWeight="700">
                            {pin === 1 ? '1:G' : pin === 2 ? '2:D' : '3:S'}
                          </text>
                          {isB && <circle cx={px} cy="172" r="6" fill="#09090b" stroke="#fff" strokeWidth="2" />}
                          {isR && <circle cx={px} cy="156" r="6" fill="#e11d48" stroke="#fff" strokeWidth="2" />}
                        </g>
                      );
                    })}
                  </g>
                </g>
              ) : isHBridge ? (
                /* 4-MOSFET H-Bridge PCB — every MOSFET drawn with S, D, G pins & copper flow */
                <g>
                  {/* Supply links into Q1.S & Q3.S */}
                  <path
                    d="M 124 36 V 52"
                    stroke={params.hbridgeState === 'FWD' ? '#fbbf24' : '#b87333'}
                    strokeWidth="3.5"
                    className={params.hbridgeState === 'FWD' ? 'flow-active' : ''}
                  />
                  <path
                    d="M 396 36 V 52"
                    stroke={params.hbridgeState === 'REV' ? '#fbbf24' : '#b87333'}
                    strokeWidth="3.5"
                    className={params.hbridgeState === 'REV' ? 'flow-active' : ''}
                  />

                  {/* Ground links out of Q2.S & Q4.S */}
                  <path
                    d="M 124 214 V 230"
                    stroke={params.hbridgeState === 'REV' ? '#38bdf8' : params.hbridgeState === 'BRAKE' ? '#fb7185' : '#64748b'}
                    strokeWidth="3.5"
                    className={params.hbridgeState === 'REV' ? 'flow-active' : ''}
                  />
                  <path
                    d="M 396 214 V 230"
                    stroke={params.hbridgeState === 'FWD' ? '#38bdf8' : params.hbridgeState === 'BRAKE' ? '#fb7185' : '#64748b'}
                    strokeWidth="3.5"
                    className={params.hbridgeState === 'FWD' ? 'flow-active' : ''}
                  />

                  {/* Left Drain bus: Q1.D <-> Motor Left <-> Q2.D */}
                  <path
                    d="M 124 118 V 148"
                    stroke={params.hbridgeState === 'FWD' || params.hbridgeState === 'REV' ? '#38bdf8' : params.hbridgeState === 'BRAKE' ? '#fb7185' : '#64748b'}
                    strokeWidth="3.5"
                  />
                  {/* Right Drain bus: Q3.D <-> Motor Right <-> Q4.D */}
                  <path
                    d="M 396 118 V 148"
                    stroke={params.hbridgeState === 'FWD' || params.hbridgeState === 'REV' ? '#fbbf24' : params.hbridgeState === 'BRAKE' ? '#fb7185' : '#64748b'}
                    strokeWidth="3.5"
                  />

                  {/* Active Motor Horizontal Bus */}
                  <path
                    d="M 124 133 H 222 M 298 133 H 396"
                    stroke={
                      params.hbridgeState === 'FWD'
                        ? '#38bdf8'
                        : params.hbridgeState === 'REV'
                        ? '#fbbf24'
                        : params.hbridgeState === 'BRAKE'
                        ? '#fb7185'
                        : '#64748b'
                    }
                    strokeWidth="4"
                    className={
                      params.hbridgeState === 'FWD'
                        ? 'flow-active'
                        : params.hbridgeState === 'REV'
                        ? 'flow-active-rev'
                        : ''
                    }
                  />

                  {/* 4 Real 3-Pin MOSFETs (Q1..Q4) */}
                  {renderPinMosfet({
                    id: 'Q1',
                    x: 90,
                    y: 64,
                    polarity: 'P-MOS',
                    active: params.hbridgeState === 'FWD',
                    gateDriveLabel: params.hbridgeState === 'FWD' ? '0 V' : '+12V',
                    gateHigh: params.hbridgeState === 'FWD',
                    gateSide: 'left',
                    topPin: 'S',
                    bottomPin: 'D',
                  })}
                  {renderPinMosfet({
                    id: 'Q3',
                    x: 362,
                    y: 64,
                    polarity: 'P-MOS',
                    active: params.hbridgeState === 'REV',
                    gateDriveLabel: params.hbridgeState === 'REV' ? '0 V' : '+12V',
                    gateHigh: params.hbridgeState === 'REV',
                    gateSide: 'right',
                    topPin: 'S',
                    bottomPin: 'D',
                  })}
                  {renderPinMosfet({
                    id: 'Q2',
                    x: 90,
                    y: 160,
                    polarity: 'N-MOS',
                    active: params.hbridgeState === 'REV' || params.hbridgeState === 'BRAKE',
                    gateDriveLabel: params.hbridgeState === 'REV' || params.hbridgeState === 'BRAKE' ? '+12V' : '0 V',
                    gateHigh: params.hbridgeState === 'REV' || params.hbridgeState === 'BRAKE',
                    gateSide: 'left',
                    topPin: 'D',
                    bottomPin: 'S',
                  })}
                  {renderPinMosfet({
                    id: 'Q4',
                    x: 362,
                    y: 160,
                    polarity: 'N-MOS',
                    active: params.hbridgeState === 'FWD' || params.hbridgeState === 'BRAKE',
                    gateDriveLabel: params.hbridgeState === 'FWD' || params.hbridgeState === 'BRAKE' ? '+12V' : '0 V',
                    gateHigh: params.hbridgeState === 'FWD' || params.hbridgeState === 'BRAKE',
                    gateSide: 'right',
                    topPin: 'D',
                    bottomPin: 'S',
                  })}

                  {/* Center Motor (rotor centered cleanly at 260, 133) */}
                  <g onClick={() => setSelectedPart('inductor')} className="cursor-pointer">
                    <circle
                      cx="260"
                      cy="133"
                      r="34"
                      fill="#1e293b"
                      stroke={params.hbridgeState === 'BRAKE' ? '#fb7185' : powerFlow ? '#fbbf24' : '#64748b'}
                      strokeWidth="3"
                    />
                    <g transform="translate(260, 133)">
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
                    <circle cx="260" cy="133" r="10" fill="#0f172a" stroke="#e2e8f0" strokeWidth="1.5" />
                    <text x="260" y="136.5" textAnchor="middle" fill="#fff" fontSize="9.5" fontFamily="monospace" fontWeight="700">
                      M
                    </text>
                  </g>

                  <text x="260" y="185" textAnchor="middle" fill="#e2e8f0" fontSize="9.5" fontFamily="monospace" fontWeight="700">
                    {params.hbridgeState === 'FWD'
                      ? '↻ FWD (Q1.S→D → M → Q4.D→S)'
                      : params.hbridgeState === 'REV'
                      ? '↺ REV (Q3.S→D → M → Q2.D→S)'
                      : params.hbridgeState === 'BRAKE'
                      ? '■ BRAKE (Q2 + Q4 → GND)'
                      : '○ COAST (ALL OFF)'}
                  </text>
                </g>
              ) : isCMOS ? (
                /* CMOS Inverter PCB — Q1 P-MOS & Q2 N-MOS with real G, D, S pins & voltage flow */
                <g>
                  {sim.shootThrough && (
                    <rect x="206" y="48" width="114" height="174" rx="12" fill="rgba(244,63,94,0.26)" filter="url(#mos-glow)" />
                  )}

                  {/* +5V Rail into Q1.S */}
                  <path
                    d="M 262 36 V 52"
                    stroke={params.cmosVin < 3.5 ? '#38bdf8' : '#b87333'}
                    strokeWidth="4"
                    className={sim.shootThrough || params.cmosVin <= 1.5 ? 'flow-active' : ''}
                  />

                  {/* Shared Drain Junction (Q1.D <-> Q2.D) -> OUT */}
                  <path
                    d="M 262 118 V 148 M 262 133 H 376"
                    stroke={sim.shootThrough ? '#f43f5e' : sim.vout > 2.5 ? '#38bdf8' : '#fbbf24'}
                    strokeWidth="4"
                    className={sim.shootThrough || params.cmosVin <= 1.5 || params.cmosVin >= 3.5 ? 'flow-active' : ''}
                  />

                  {/* Q2.S down to GND */}
                  <path
                    d="M 262 214 V 230"
                    stroke={sim.shootThrough ? '#f43f5e' : params.cmosVin >= 3.5 ? '#fbbf24' : '#64748b'}
                    strokeWidth="4"
                    className={sim.shootThrough || params.cmosVin >= 3.5 ? 'flow-active' : ''}
                  />

                  {/* Input V_in copper bus feeding BOTH Gate pins (Q1.G & Q2.G) */}
                  <path
                    d="M 118 133 H 188 V 85 H 214 M 188 133 V 181 H 214"
                    stroke={params.cmosVin >= 2.5 ? '#38bdf8' : '#64748b'}
                    strokeWidth="3.5"
                    fill="none"
                  />

                  {/* Real 3-Pin Q1 P-MOS & Q2 N-MOS */}
                  {renderPinMosfet({
                    id: 'Q1',
                    x: 228,
                    y: 64,
                    polarity: 'P-MOS',
                    active: params.cmosVin < 3.5 && (!sim.shootThrough ? params.cmosVin <= 1.5 || !params.deadTimeEnabled : true),
                    gateDriveLabel: `${params.cmosVin.toFixed(1)}V`,
                    gateHigh: params.cmosVin >= 2.5,
                    gateSide: 'left',
                    topPin: 'S',
                    bottomPin: 'D',
                  })}
                  {renderPinMosfet({
                    id: 'Q2',
                    x: 228,
                    y: 160,
                    polarity: 'N-MOS',
                    active: params.cmosVin > 1.5 && (!sim.shootThrough ? params.cmosVin >= 3.5 || !params.deadTimeEnabled : true),
                    gateDriveLabel: `${params.cmosVin.toFixed(1)}V`,
                    gateHigh: params.cmosVin >= 2.5,
                    gateSide: 'left',
                    topPin: 'D',
                    bottomPin: 'S',
                  })}

                  {/* Input & Output Blocks */}
                  <rect x="44" y="114" width="76" height="38" rx="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
                  <text x="82" y="131" textAnchor="middle" fill="#38bdf8" fontSize="9.5" fontFamily="monospace" fontWeight="700">
                    GATE IN
                  </text>
                  <text x="82" y="145" textAnchor="middle" fill="#e0f2fe" fontSize="11" fontFamily="monospace" fontWeight="700">
                    {params.cmosVin.toFixed(1)} V
                  </text>

                  <rect x="376" y="112" width="102" height="42" rx="6" fill="#0f172a" stroke={sim.shootThrough ? '#f43f5e' : '#34d399'} strokeWidth="2" />
                  <text x="427" y="130" textAnchor="middle" fill="#94a3b8" fontSize="9.5" fontFamily="monospace" fontWeight="700">
                    DRAIN OUT
                  </text>
                  <text x="427" y="146" textAnchor="middle" fill={sim.shootThrough ? '#fb7185' : '#34d399'} fontSize="11" fontFamily="monospace" fontWeight="700">
                    {sim.vout.toFixed(1)} V
                  </text>
                </g>
              ) : (
                /* Standard Power / Gate Control PCB — copper traces connect directly into exact G, D, S pads */
                <g>
                  {/* 1) Copper trace from GATE IN -> R_G -> 1MΩ node -> Gate pin G (x=250, y=194) */}
                  <path
                    d="M 118 148 H 198 V 194 H 250"
                    stroke={Math.abs(sim.vgs) > 0.5 ? '#38bdf8' : '#64748b'}
                    strokeWidth="3.5"
                    fill="none"
                  />

                  {/* 2) Copper power trace through exact Drain (x=274) and Source (x=298) pins */}
                  {isPMOS ? (
                    <>
                      {/* P-MOS High-Side / Reverse Guard: +Rail -> S (x=298) -> D (x=274) -> Load -> GND */}
                      <path
                        d="M 298 36 V 194"
                        stroke={powerFlow ? '#38bdf8' : params.batteryReversed ? '#fb7185' : '#b87333'}
                        strokeWidth="4"
                        fill="none"
                        className={powerFlow ? 'flow-active' : ''}
                      />
                      <path
                        d="M 274 194 V 208 H 424 V 156 M 424 78 V 230"
                        stroke={powerFlow ? '#fbbf24' : '#64748b'}
                        strokeWidth="4"
                        fill="none"
                        className={powerFlow ? 'flow-active' : ''}
                      />
                    </>
                  ) : (
                    <>
                      {/* N-MOS Low-Side: +Rail -> Load -> Drain pin D (x=274) -> Source pin S (x=298) -> GND */}
                      <path
                        d="M 424 36 V 78 M 424 156 V 208 H 274 V 194"
                        stroke={powerFlow ? '#fbbf24' : '#b87333'}
                        strokeWidth="4"
                        fill="none"
                        className={powerFlow ? 'flow-active' : ''}
                      />
                      <path
                        d="M 298 194 V 230"
                        stroke={powerFlow ? '#38bdf8' : '#64748b'}
                        strokeWidth="4"
                        fill="none"
                        className={powerFlow ? 'flow-active' : ''}
                      />
                    </>
                  )}

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
                    <rect x="34" y="126" width="84" height="44" rx="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
                    <text x="76" y="145" textAnchor="middle" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="700">
                      GATE IN
                    </text>
                    <text x="76" y="160" textAnchor="middle" fill="#f8fafc" fontSize="11" fontFamily="monospace" fontWeight="700">
                      {sim.vgs.toFixed(1)} V
                    </text>
                  </g>

                  {/* R_G Gate Resistor */}
                  <g onClick={() => setSelectedPart('rg')} className="cursor-pointer">
                    <rect x="136" y="139" width="42" height="18" rx="4" fill="#d6b47c" stroke="#92400e" strokeWidth="1.5" />
                    <text x="157" y="151" textAnchor="middle" fill="#1c1917" fontSize="9" fontFamily="monospace" fontWeight="700">
                      R_G
                    </text>
                  </g>

                  {/* 1 MOhm Pull-Down from Gate node to GND */}
                  <g onClick={() => setSelectedPart('pulldown')} className="cursor-pointer">
                    <line x1="198" y1="148" x2="198" y2="230" stroke="#64748b" strokeWidth="2.5" />
                    <rect
                      x="187"
                      y="174"
                      width="22"
                      height="30"
                      rx="3"
                      fill={params.pullDown1M ? '#3b82f6' : '#334155'}
                      opacity={params.pullDown1M ? 1 : 0.35}
                    />
                    <text x="198" y="192" textAnchor="middle" fill="#fff" fontSize="8" fontFamily="monospace" fontWeight="700">
                      {params.pullDown1M ? '1MΩ' : 'OFF'}
                    </text>
                  </g>

                  {/* Thermal halo on MOSFET */}
                  {hotGlow && (
                    <circle
                      cx="274"
                      cy="126"
                      r="52"
                      fill={criticalHeat ? 'rgba(244,63,94,0.38)' : 'rgba(245,158,11,0.3)'}
                      filter="url(#mos-glow)"
                    />
                  )}

                  {/* Main TO-220 MOSFET with explicit copper solder pads & G / D / S pin names */}
                  <g onClick={() => setSelectedPart('mosfet')} className="cursor-pointer">
                    <rect x="236" y="76" width="76" height="22" rx="2" fill="#cbd5e1" stroke="#64748b" />
                    <circle cx="274" cy="87" r="5" fill="#18734d" />
                    <rect
                      x="236"
                      y="98"
                      width="76"
                      height="56"
                      rx="4"
                      fill="#18181b"
                      stroke={hotGlow ? '#f43f5e' : powerFlow ? '#38bdf8' : '#71717a'}
                      strokeWidth="2.5"
                    />
                    <text x="274" y="121" textAnchor="middle" fill="#f8fafc" fontSize="11" fontFamily="monospace" fontWeight="700">
                      {fetLabel}
                    </text>
                    <text x="274" y="138" textAnchor="middle" fill={powerFlow ? '#34d399' : '#94a3b8'} fontSize="9.5" fontFamily="monospace">
                      {sim.rdsOhms < 1 ? `${(sim.rdsOhms * 1000).toFixed(0)} mΩ` : sim.rdsOhms > 1e5 ? 'OFF' : `${sim.rdsOhms.toFixed(1)} Ω`}
                    </text>

                    {/* Leads G (250), D (274), S (298) down to PCB solder pads at y=194 */}
                    <line x1="250" y1="154" x2="250" y2="194" stroke="#cbd5e1" strokeWidth="4.5" />
                    <line x1="274" y1="154" x2="274" y2="194" stroke="#cbd5e1" strokeWidth="4.5" />
                    <line x1="298" y1="154" x2="298" y2="194" stroke="#cbd5e1" strokeWidth="4.5" />

                    {/* Copper pads */}
                    <circle cx="250" cy="194" r="5" fill={Math.abs(sim.vgs) > 0.5 ? '#38bdf8' : '#94a3b8'} stroke="#0f172a" strokeWidth="1.5" />
                    <circle cx="274" cy="194" r="5" fill={powerFlow ? '#fbbf24' : '#94a3b8'} stroke="#0f172a" strokeWidth="1.5" />
                    <circle cx="298" cy="194" r="5" fill={powerFlow ? '#38bdf8' : '#94a3b8'} stroke="#0f172a" strokeWidth="1.5" />

                    {/* Clear Pin Labels + Pin Voltages */}
                    <text x="250" y="182" textAnchor="end" dx="-7" fill="#38bdf8" fontSize="10.5" fontFamily="monospace" fontWeight="700">
                      G
                    </text>
                    <text x="274" y="176" textAnchor="middle" fill="#fbbf24" fontSize="10.5" fontFamily="monospace" fontWeight="700">
                      D
                    </text>
                    <text x="298" y="182" textAnchor="start" dx="7" fill="#e2e8f0" fontSize="10.5" fontFamily="monospace" fontWeight="700">
                      S
                    </text>

                    {/* Pin voltage telemetry underneath pads */}
                    <text x="250" y="216" textAnchor="middle" fill="#38bdf8" fontSize="8.5" fontFamily="monospace">
                      {sim.vgs.toFixed(1)}V
                    </text>
                    <text x="274" y="223" textAnchor="middle" fill="#fbbf24" fontSize="8.5" fontFamily="monospace">
                      {sim.vds.toFixed(1)}V
                    </text>
                    <text x="298" y="216" textAnchor="middle" fill="#cbd5e1" fontSize="8.5" fontFamily="monospace">
                      {isPMOS ? `+${params.vdd.toFixed(0)}V` : '0V'}
                    </text>
                  </g>

                  {/* Load / Inductor / Boost Stage */}
                  <g onClick={() => setSelectedPart(isBoost ? 'inductor' : 'load')} className="cursor-pointer">
                    <rect
                      x="372"
                      y="78"
                      width="104"
                      height="78"
                      rx="10"
                      fill={powerFlow ? 'rgba(251,191,36,0.16)' : '#0f172a'}
                      stroke={powerFlow ? '#fbbf24' : '#475569'}
                      strokeWidth="2.5"
                    />
                    <text x="424" y="110" textAnchor="middle" fill="#fbbf24" fontSize="11" fontFamily="monospace" fontWeight="700">
                      {isBoost
                        ? `BOOST ${sim.vout.toFixed(1)}V`
                        : params.chapterId === 6 || cid === 'mos-flyback-clamp'
                        ? 'COIL / MOTOR'
                        : 'LOAD'}
                    </text>
                    <text x="424" y="132" textAnchor="middle" fill="#e2e8f0" fontSize="12" fontFamily="monospace" fontWeight="700">
                      {sim.idA.toFixed(2)} A
                    </text>
                  </g>

                  {/* Optional Flyback Diode badge on Ch 6 */}
                  {(params.chapterId === 6 || cid === 'mos-flyback-clamp') && (
                    <g onClick={() => setSelectedPart('flyback')} className="cursor-pointer">
                      <rect
                        x="372"
                        y="168"
                        width="104"
                        height="26"
                        rx="5"
                        fill={params.flybackInstalled ? '#064e3b' : '#7f1d1d'}
                        stroke={params.flybackInstalled ? '#34d399' : '#f87171'}
                      />
                      <text x="424" y="185" textAnchor="middle" fill="#fff" fontSize="9.5" fontFamily="monospace" fontWeight="700">
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
