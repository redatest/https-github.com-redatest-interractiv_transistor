export type MosfetModelId = '2n7000' | 'irf540n' | 'irlz44n' | 'irf9540';

export interface MosfetSimParams {
  chapterId: number;
  exampleId: string;
  catalogId?: string;
  // Ch 1: Floating Gate & Oxide Field
  vgs: number; // 0..12 V
  vdd: number; // 5..12 V
  gateLatched: boolean; // floating C_iss charge memory
  pullDown1M: boolean;
  fingerTouchGate: boolean;
  // Ch 2: Threshold & R_DS(on)
  fetModel: MosfetModelId;
  loadCurrentA: number; // 0.5..12 A
  // Ch 3: N-MOS vs P-MOS & Reverse Polarity
  fetPolarity: 'NMOS' | 'PMOS';
  batteryReversed: boolean;
  highSideSwitchOn: boolean;
  // Ch 4: CMOS Inverter & Shoot-Through
  cmosVin: number; // 0..5 V
  deadTimeEnabled: boolean;
  // Ch 5: Gate Charge, R_G & PWM
  rgOhms: number; // 10..4700
  pwmFreqKHz: number; // 1..100
  pwmDuty: number; // 0..100
  luxLevel: number; // 0..100 (LDR night switch)
  // Ch 6: Flyback & Body Diode
  flybackInstalled: boolean;
  reverseBodyTest: boolean;
  // Ch 7: DC-DC Boost
  boostVin: number; // 3.7..6.0 V
  boostDuty: number; // 0..75 %
  // Ch 8: H-Bridge & Linear Load
  hbridgeState: 'FWD' | 'REV' | 'BRAKE' | 'COAST';
  targetCurrentA: number; // 0.2..4.0 A
  // Tester catalog/tool
  testerType: 'nmos_gds' | 'pmos_gds' | 'shorted_gate';
  testerGateCharged: boolean;
  blackPin: 1 | 2 | 3;
  redPin: 1 | 2 | 3;
  bodyCheck: boolean;
  oscPhase: number;
}

export interface MosfetSimReadout {
  vgs: number;
  vth: number;
  vds: number;
  vout: number;
  igNA: number; // steady-state gate current in nA (~0.1 nA!)
  igPeakMA: number; // transient charging spike mA
  idA: number; // drain current in Amps
  rdsOhms: number; // effective channel resistance
  powerW: number; // heat dissipation I^2 * R_DS(on) or linear Vds*Id
  tempC: number; // junction temperature estimate
  efficiencyPct: number;
  spikeV: number; // inductive or shoot-through spike
  meterDeflection: number; // 0..1 for multimeter tester
  conducting: boolean;
  bodyDiodeActive: boolean;
  shootThrough: boolean;
  region: 'cutoff' | 'linear' | 'ohmic' | 'breakdown';
  statusFr: string;
  statusAr: string;
  statusEn: string;
  warningFr?: string;
  warningAr?: string;
  warningEn?: string;
}

export const FET_SPECS: Record<
  MosfetModelId,
  { name: string; vth: number; fullVgs: number; rdsMin: number; polarity: 'NMOS' | 'PMOS'; cissPF: number }
> = {
  '2n7000': { name: '2N7000 (TO-92)', vth: 2.1, fullVgs: 4.5, rdsMin: 1.8, polarity: 'NMOS', cissPF: 50 },
  irf540n: { name: 'IRF540N (Standard 10 V)', vth: 3.8, fullVgs: 10.0, rdsMin: 0.044, polarity: 'NMOS', cissPF: 1960 },
  irlz44n: { name: 'IRLZ44N (Logic-Level 5 V)', vth: 1.6, fullVgs: 4.5, rdsMin: 0.022, polarity: 'NMOS', cissPF: 1700 },
  irf9540: { name: 'IRF9540 (P-Channel)', vth: 3.6, fullVgs: 10.0, rdsMin: 0.117, polarity: 'PMOS', cissPF: 1300 },
};

export function createDefaultMosfetParams(
  overrides: Partial<MosfetSimParams> = {}
): MosfetSimParams {
  return {
    chapterId: 1,
    exampleId: 'gate-oxide-field',
    vgs: 5.0,
    vdd: 12.0,
    gateLatched: false,
    pullDown1M: true,
    fingerTouchGate: false,
    fetModel: 'irlz44n',
    loadCurrentA: 4.0,
    fetPolarity: 'NMOS',
    batteryReversed: false,
    highSideSwitchOn: true,
    cmosVin: 0.0,
    deadTimeEnabled: true,
    rgOhms: 100,
    pwmFreqKHz: 20,
    pwmDuty: 65,
    luxLevel: 25,
    flybackInstalled: true,
    reverseBodyTest: false,
    boostVin: 5.0,
    boostDuty: 58,
    hbridgeState: 'FWD',
    targetCurrentA: 1.5,
    testerType: 'nmos_gds',
    testerGateCharged: false,
    blackPin: 2,
    redPin: 3,
    bodyCheck: false,
    oscPhase: 0,
    ...overrides,
  };
}

function calcChannelRds(vgsMag: number, spec: (typeof FET_SPECS)['irlz44n']): { rds: number; region: 'cutoff' | 'linear' | 'ohmic' } {
  if (vgsMag < spec.vth) {
    return { rds: 1e7, region: 'cutoff' };
  }
  const overdrive = vgsMag - spec.vth;
  const fullOverdrive = Math.max(0.5, spec.fullVgs - spec.vth);
  const ratio = Math.min(1, overdrive / fullOverdrive);
  if (ratio < 0.72) {
    // Partially open linear/pinch-off region -> dangerous high R_DS!
    const rds = spec.rdsMin + (1 - ratio) * (1 - ratio) * 4.2;
    return { rds, region: 'linear' };
  }
  // Smooth ohmic saturation transition
  const rds = spec.rdsMin * (1 + (1 - ratio) * 1.4);
  return { rds, region: 'ohmic' };
}

export function computeMosfetSimulation(p: MosfetSimParams): MosfetSimReadout {
  // Route catalogId onto unified chapter/specialized physics
  if (p.catalogId) {
    return computeMosfetCatalog(p);
  }

  // CHAPTER 1: Insulated Gate & Floating Memory
  if (p.chapterId === 1) {
    const isFloatingMem = p.exampleId === 'gate-cap-memory' || p.exampleId === 'floating-gate-memory';
    const effectiveVgs = isFloatingMem
      ? p.fingerTouchGate
        ? 4.8
        : p.gateLatched && !p.pullDown1M
        ? 4.4
        : 0
      : p.vgs;

    const spec = FET_SPECS['2n7000'];
    const { rds, region } = calcChannelRds(effectiveVgs, spec);
    const conducting = effectiveVgs >= spec.vth;
    const idA = conducting ? Math.min(0.45, (p.vdd - 2.1) / (22 + rds)) : 0;
    const vds = conducting ? idA * rds : p.vdd;
    const powerW = idA * idA * rds;

    return {
      vgs: effectiveVgs,
      vth: spec.vth,
      vds,
      vout: conducting ? p.vdd - vds : 0,
      igNA: 0.1,
      igPeakMA: 0,
      idA,
      rdsOhms: rds,
      powerW,
      tempC: 25 + powerW * 35,
      efficiencyPct: conducting ? 95 : 100,
      spikeV: 0,
      meterDeflection: 0,
      conducting,
      bodyDiodeActive: false,
      shootThrough: false,
      region,
      statusFr: conducting
        ? isFloatingMem && !p.pullDown1M && p.gateLatched
          ? 'Grille flottante mémorisée (C_iss garde la charge → LED verrouillée ON)'
          : 'Champ électrique actif à travers SiO₂ (I_G ≈ 0,1 nA)'
        : 'Grille déchargée : isolant SiO₂ intact, canal fermé',
      statusAr: conducting
        ? isFloatingMem && !p.pullDown1M && p.gateLatched
          ? 'البوابة العائمة محتفظة بالشحنة في C_iss ← المصباح يبقى مضيئاً!'
          : 'المجال الكهربائي يفتح القناة عبر عازل SiO₂ (تيار البوابة ≈ 0.1 nA)'
        : 'البوابة مفرّغة: القناة مقطوعة تماماً',
      statusEn: conducting
        ? isFloatingMem && !p.pullDown1M && p.gateLatched
          ? 'Floating gate latched (C_iss holds charge → LED stays ON)'
          : 'Electric field open across SiO₂ oxide (I_G ≈ 0.1 nA)'
        : 'Gate discharged: oxide field off, channel pinched',
      warningFr:
        isFloatingMem && !p.pullDown1M
          ? 'Sans résistance pull-down 1 MΩ, la grille flotte comme une antenne !'
          : undefined,
      warningAr:
        isFloatingMem && !p.pullDown1M
          ? 'بدون مقاومة سحب للأسفل 1 MΩ، تبقى البوابة عائمة وتحتفظ بالكهرباء!'
          : undefined,
      warningEn:
        isFloatingMem && !p.pullDown1M
          ? 'Without a 1 MΩ pull-down resistor, the floating gate latches randomly!'
          : undefined,
    };
  }

  // CHAPTER 2: V_GS(th) vs Logic-Level R_DS(on) Heating
  if (p.chapterId === 2) {
    const model = p.fetModel === 'irf9540' ? 'irf540n' : p.fetModel;
    const spec = FET_SPECS[model];
    const { rds, region } = calcChannelRds(p.vgs, spec);
    const conducting = p.vgs >= spec.vth;
    const rLoad = Math.max(0.5, 12 / Math.max(0.5, p.loadCurrentA));
    const idA = conducting ? 12 / (rLoad + rds) : 0;
    const vds = conducting ? idA * rds : 12;
    const powerW = conducting ? idA * idA * rds : 0;
    const tempC = Math.min(210, 25 + powerW * 16); // TO-220 bare ambient ~62°C/W scaled for lab feel
    const eff = conducting ? (1 - vds / 12) * 100 : 100;

    return {
      vgs: p.vgs,
      vth: spec.vth,
      vds,
      vout: conducting ? 12 - vds : 0,
      igNA: 0.1,
      igPeakMA: 0,
      idA,
      rdsOhms: rds,
      powerW,
      tempC,
      efficiencyPct: eff,
      spikeV: 0,
      meterDeflection: 0,
      conducting,
      bodyDiodeActive: false,
      shootThrough: false,
      region: tempC > 150 ? 'breakdown' : region,
      statusFr: !conducting
        ? `Bloqué : V_GS (${p.vgs.toFixed(1)} V) < V_th (${spec.vth.toFixed(1)} V)`
        : region === 'linear'
        ? `ZONE LINÉAIRE PIÈGE ! R_DS = ${rds.toFixed(2)} Ω → chauffe (${powerW.toFixed(1)} W)`
        : `Saturation Ohmique saine : R_DS(on) = ${(rds * 1000).toFixed(0)} mΩ`,
      statusAr: !conducting
        ? `مقطوع: جهد البوابة (${p.vgs.toFixed(1)}V) أقل من العتبة (${spec.vth.toFixed(1)}V)`
        : region === 'linear'
        ? `فخ المنطقة الخطية! مقاومة عالية ${rds.toFixed(2)} Ω ← سخونة مفرطة (${powerW.toFixed(1)} W)`
        : `تشبّع أومي سليم: R_DS(on) = ${(rds * 1000).toFixed(0)} mΩ`,
      statusEn: !conducting
        ? `Cut off: V_GS (${p.vgs.toFixed(1)} V) < V_th (${spec.vth.toFixed(1)} V)`
        : region === 'linear'
        ? `LINEAR TRAP! High R_DS = ${rds.toFixed(2)} Ω → overheating (${powerW.toFixed(1)} W)`
        : `Healthy Ohmic saturation: R_DS(on) = ${(rds * 1000).toFixed(0)} mΩ`,
      warningFr:
        tempC > 95
          ? `Surchauffe (${Math.round(tempC)} °C) ! Un IRF540N à 5 V reste semi-ouvert ; choisissez un Logic-Level IRLZ44N ou montez V_GS à 10 V.`
          : undefined,
      warningAr:
        tempC > 95
          ? `سخونة خطيرة (${Math.round(tempC)}°C)! الترانزستور IRF540N لا ينفتح كلياً عند 5V؛ استعمل IRLZ44N المنطقي.`
          : undefined,
      warningEn:
        tempC > 95
          ? `Overheating (${Math.round(tempC)} °C)! Standard IRF540N is choked at 5 V — switch to logic-level IRLZ44N or raise V_GS to 10 V.`
          : undefined,
    };
  }

  // CHAPTER 3: N-MOS Low-Side vs P-MOS High-Side & Reverse Polarity Guard
  if (p.chapterId === 3) {
    if (p.exampleId === 'pmos-reverse-polarity' || p.exampleId === 'reverse-polarity-pmos') {
      const safe = !p.batteryReversed;
      const spec = FET_SPECS.irf9540;
      const vgsMag = safe ? p.vdd : 0;
      const rds = safe ? spec.rdsMin : 1e7;
      const idA = safe ? p.loadCurrentA : 0;
      const powerW = idA * idA * rds;
      return {
        vgs: safe ? -vgsMag : 0,
        vth: spec.vth,
        vds: safe ? idA * rds : p.vdd,
        vout: safe ? p.vdd - idA * rds : 0,
        igNA: 0.1,
        igPeakMA: 0,
        idA,
        rdsOhms: rds,
        powerW,
        tempC: 25 + powerW * 12,
        efficiencyPct: safe ? 99 : 100,
        spikeV: 0,
        meterDeflection: 0,
        conducting: safe,
        bodyDiodeActive: false,
        shootThrough: false,
        region: safe ? 'ohmic' : 'cutoff',
        statusFr: safe
          ? `Polarité correcte (+12 V) : P-MOS ouvert (chute = ${(idA * rds * 1000).toFixed(0)} mV vs 700 mV diode)`
          : 'BATTERIE INVERSÉE (−12 V) : V_GS = 0 V → P-MOS bloqué net, 0 mA vers le circuit !',
        statusAr: safe
          ? `قطبية صحيحة (+12V): P-MOS مفتوح بهبوط ضئيل جداً (${(idA * rds * 1000).toFixed(0)} mV)`
          : 'البطارية معكوسة (−12V): V_GS = 0V ← P-MOS يمنع التيار تماماً ويحمي الدارة!',
        statusEn: safe
          ? `Correct polarity (+12 V): P-MOS ON (drop = ${(idA * rds * 1000).toFixed(0)} mV vs 700 mV diode)`
          : 'REVERSED BATTERY (−12 V): V_GS = 0 V → P-MOS blocked completely, 0 mA!',
        warningFr: p.batteryReversed
          ? 'Protection active : la diode interne du P-MOS pointe en blocage quand l’alimentation est inversée.'
          : undefined,
        warningAr: p.batteryReversed
          ? 'الحماية نشطة: الدايود الداخلي للترانزستور P-MOS يكون منحازاً عكسياً عند عكس البطارية.'
          : undefined,
        warningEn: p.batteryReversed
          ? 'Guard active: the P-MOS body diode reverse-blocks when the battery leads are swapped.'
          : undefined,
      };
    }

    // N-MOS vs P-MOS high/low-side switch
    const isPMOS = p.fetPolarity === 'PMOS';
    const spec = isPMOS ? FET_SPECS.irf9540 : FET_SPECS.irlz44n;
    const conducting = p.highSideSwitchOn;
    const vgsEff = isPMOS ? (conducting ? -p.vdd : 0) : conducting ? 5.0 : 0;
    const rds = conducting ? spec.rdsMin : 1e7;
    const idA = conducting ? p.loadCurrentA : 0;
    const vout = conducting ? p.vdd - idA * rds : 0;

    return {
      vgs: vgsEff,
      vth: spec.vth,
      vds: conducting ? idA * rds : p.vdd,
      vout,
      igNA: 0.1,
      igPeakMA: 0,
      idA,
      rdsOhms: rds,
      powerW: idA * idA * rds,
      tempC: 25 + idA * idA * rds * 14,
      efficiencyPct: conducting ? 98 : 100,
      spikeV: 0,
      meterDeflection: 0,
      conducting,
      bodyDiodeActive: false,
      shootThrough: false,
      region: conducting ? 'ohmic' : 'cutoff',
      statusFr: isPMOS
        ? conducting
          ? 'P-MOS High-Side (Grille tirée à 0 V → V_GS = −12 V) : Charge alimentée côté +'
          : 'P-MOS High-Side bloqué (Grille remontée à +12 V → V_GS = 0 V)'
        : conducting
        ? 'N-MOS Low-Side (Grille à +5 V) : Charge reliée à la masse GND'
        : 'N-MOS Low-Side bloqué (Grille à 0 V)',
      statusAr: isPMOS
        ? conducting
          ? 'P-MOS بالطرف الموجب High-Side (البوابة عند 0V ← V_GS = −12V)'
          : 'P-MOS بالطرف الموجب مقطوع (البوابة عند +12V ← V_GS = 0V)'
        : conducting
        ? 'N-MOS بالطرف السالب Low-Side (البوابة +5V ← يوصل الحمل بالأرضي)'
        : 'N-MOS بالطرف السالب مقطوع (البوابة 0V)',
      statusEn: isPMOS
        ? conducting
          ? 'P-MOS High-Side ON (Gate pulled to 0 V → V_GS = −12 V)'
          : 'P-MOS High-Side OFF (Gate pulled up to +12 V → V_GS = 0 V)'
        : conducting
        ? 'N-MOS Low-Side ON (Gate at +5 V → sinks load to GND)'
        : 'N-MOS Low-Side OFF (Gate at 0 V)',
    };
  }

  // CHAPTER 4: CMOS Push-Pull & Shoot-Through
  if (p.chapterId === 4) {
    const inTransition = p.cmosVin > 1.3 && p.cmosVin < 3.7;
    const shootThrough = inTransition && !p.deadTimeEnabled;
    const vout = p.cmosVin <= 1.5 ? 5.0 : p.cmosVin >= 3.5 ? 0.0 : 5.0 * (1 - (p.cmosVin - 1.3) / 2.4);
    const idA = shootThrough ? 3.8 : 0.015;
    const powerW = shootThrough ? idA * 5.0 : 0.002;
    const tempC = shootThrough ? 115 : 26;

    return {
      vgs: p.cmosVin,
      vth: 1.6,
      vds: vout,
      vout,
      igNA: 0.2,
      igPeakMA: 18,
      idA,
      rdsOhms: shootThrough ? 1.3 : 0.05,
      powerW,
      tempC,
      efficiencyPct: shootThrough ? 18 : 99.8,
      spikeV: shootThrough ? 5.0 : 0,
      meterDeflection: 0,
      conducting: p.cmosVin >= 3.5 || p.cmosVin <= 1.5,
      bodyDiodeActive: false,
      shootThrough,
      region: shootThrough ? 'breakdown' : 'ohmic',
      statusFr: shootThrough
        ? 'SHOOT-THROUGH ! Q1 (P-MOS) et Q2 (N-MOS) conduisent ensemble → court-circuit 3,8 A !'
        : p.cmosVin < 2.5
        ? 'Entrée BASSE → P-MOS ON, N-MOS OFF → Sortie HAUTE (5,0 V) · 0 mA statique'
        : 'Entrée HAUTE → P-MOS OFF, N-MOS ON → Sortie BASSE (0,0 V) · 0 mA statique',
      statusAr: shootThrough
        ? 'تقاطع توصيل خطير (Shoot-Through)! Q1 و Q2 مفتوحان معاً ← قصر 3.8 A!'
        : p.cmosVin < 2.5
        ? 'الدخل منخفض ← P-MOS مفتوح، N-MOS مقطوع ← الخرج 5.0V (استهلاك صفري)'
        : 'الدخل مرتفع ← P-MOS مقطوع، N-MOS مفتوح ← الخرج 0.0V (استهلاك صفري)',
      statusEn: shootThrough
        ? 'SHOOT-THROUGH! Both P-MOS and N-MOS conduct at once → 3.8 A dead short!'
        : p.cmosVin < 2.5
        ? 'Input LOW → P-MOS ON, N-MOS OFF → Output HIGH (5.0 V) · zero static draw'
        : 'Input HIGH → P-MOS OFF, N-MOS ON → Output LOW (0.0 V) · zero static draw',
      warningFr: shootThrough
        ? 'Activez le temps mort (Dead-Time) ou franchissez rapidement la zone 1,3–3,7 V.'
        : undefined,
      warningAr: shootThrough
        ? 'فعّل زمن الموت (Dead-Time) لفصل الترانزستور الأول قبل تشغيل الثاني.'
        : undefined,
      warningEn: shootThrough
        ? 'Enable Dead-Time blanking so Q1 turns off completely before Q2 turns on.'
        : undefined,
    };
  }

  // CHAPTER 5: Gate Charge C_iss, R_G, Miller Plateau & PWM
  if (p.chapterId === 5) {
    const spec = FET_SPECS.irlz44n;
    const cissNF = 1.7; // nF
    const tauNs = p.rgOhms * cissNF; // R * C in ns
    const swTimeUs = (tauNs * 3.8) / 1000; // switching transition ~ µs
    const igPeakMA = (5.0 / Math.max(10, p.rgOhms)) * 1000;
    const periodUs = 1000 / Math.max(1, p.pwmFreqKHz);
    const swLossRatio = Math.min(0.65, (2 * swTimeUs) / periodUs);
    const idAvg = (p.pwmDuty / 100) * 6.0;
    const condLossW = (p.pwmDuty / 100) * 36 * spec.rdsMin;
    const swLossW = swLossRatio * 12 * 6 * 0.45;
    const powerW = condLossW + swLossW;
    const tempC = Math.min(185, 27 + powerW * 12);
    const eff = Math.max(35, 99 - (powerW / Math.max(1, idAvg * 12)) * 100);

    return {
      vgs: 5.0,
      vth: spec.vth,
      vds: 12 * (1 - p.pwmDuty / 100),
      vout: 12 * (p.pwmDuty / 100),
      igNA: 0.1,
      igPeakMA,
      idA: idAvg,
      rdsOhms: spec.rdsMin,
      powerW,
      tempC,
      efficiencyPct: eff,
      spikeV: p.rgOhms < 18 ? 3.4 : 0.4,
      meterDeflection: 0,
      conducting: p.pwmDuty > 5,
      bodyDiodeActive: false,
      shootThrough: false,
      region: tempC > 110 ? 'linear' : 'ohmic',
      statusFr: `t_commut ≈ ${swTimeUs.toFixed(2)} µs · Pic I_G = ${igPeakMA.toFixed(0)} mA · Pertes = ${powerW.toFixed(2)} W`,
      statusAr: `زمن التبديل ≈ ${swTimeUs.toFixed(2)} µs · نبضة البوابة = ${igPeakMA.toFixed(0)} mA · الفقد = ${powerW.toFixed(2)} W`,
      statusEn: `Switching time ≈ ${swTimeUs.toFixed(2)} µs · Peak I_G = ${igPeakMA.toFixed(0)} mA · Loss = ${powerW.toFixed(2)} W`,
      warningFr:
        swLossW > 2.5
          ? 'R_G trop élevée pour cette fréquence PWM ! Le MOSFET traîne sur le plateau de Miller et chauffe.'
          : p.rgOhms < 22
          ? 'R_G très faible : fort pic de courant sur la broche du microcontrôleur (utilisez un Gate Driver).'
          : undefined,
      warningAr:
        swLossW > 2.5
          ? 'مقاومة البوابة R_G كبيرة على هذا التردد! يبقى الترانزستور في منطقة ميلر ويسخن.'
          : p.rgOhms < 22
          ? 'مقاومة R_G صغيرة جداً: نبضة تيار قوية على الميكروكونترولر (استعمل Gate Driver).'
          : undefined,
      warningEn:
        swLossW > 2.5
          ? 'R_G is too high for this PWM frequency! MOSFET lingers on the Miller plateau and overheats.'
          : p.rgOhms < 22
          ? 'Very low R_G draws sharp current spikes from MCU pins — add a dedicated Gate Driver.'
          : undefined,
    };
  }

  // CHAPTER 6: Inductive Flyback & Body Diode
  if (p.chapterId === 6) {
    if (p.exampleId === 'body-diode-conduction' || p.exampleId === 'body-diode-behavior' || p.reverseBodyTest) {
      return {
        vgs: 0,
        vth: 1.6,
        vds: -0.72,
        vout: 11.28,
        igNA: 0,
        igPeakMA: 0,
        idA: -2.4,
        rdsOhms: 0.3,
        powerW: 2.4 * 0.72,
        tempC: 48,
        efficiencyPct: 94,
        spikeV: 0,
        meterDeflection: 0.72,
        conducting: true,
        bodyDiodeActive: true,
        shootThrough: false,
        region: 'linear',
        statusFr: 'V_GS = 0 V MAIS la Source est à +12 V → La Diode de Corps S→D conduit (V_F ≈ 0,72 V) !',
        statusAr: 'البوابة مطفأة (V_GS = 0V) لكن الدايود الداخلي بين S و D يمرّر التيار عكسياً (0.72V)!',
        statusEn: 'V_GS = 0 V YET Source > Drain → Intrinsic S→D Body Diode conducts (V_F ≈ 0.72 V)!',
        warningFr: 'Un MOSFET ne bloque le courant que dans un sens (D→S) ; jamais en sens inverse !',
        warningAr: 'الموسفيت يقطع التيار في اتجاه واحد فقط (D→S)؛ في الاتجاه المعاكس يمرّ عبر الدايود الداخلي!',
        warningEn: 'A single MOSFET only blocks current D→S; current always flows freely S→D through its body diode!',
      };
    }

    const spikeV = p.flybackInstalled ? 12.7 : 96.0;
    const danger = !p.flybackInstalled;
    return {
      vgs: 0,
      vth: 1.6,
      vds: spikeV,
      vout: 0,
      igNA: 0.1,
      igPeakMA: 0,
      idA: danger ? 0.8 : 0,
      rdsOhms: danger ? 120 : 1e7,
      powerW: danger ? 7.5 : 0.01,
      tempC: danger ? 165 : 30,
      efficiencyPct: 96,
      spikeV,
      meterDeflection: 0,
      conducting: false,
      bodyDiodeActive: false,
      shootThrough: false,
      region: danger ? 'breakdown' : 'cutoff',
      statusFr: danger
        ? 'SURTENSION −L·dI/dt = +96 V à la coupure ! Claquage par avalanche du MOSFET !'
        : 'Diode roue libre 1N5819 active : pic écrêté à 12,7 V, MOSFET 100 % protégé.',
      statusAr: danger
        ? 'ارتفاع جهد حثّي قاتل +96V عند الفصل! انهيار الانهياري للموسفيت!'
        : 'دايود الحماية يمتص الطاقة الحثية: الجهد محصور عند 12.7V والموسفيت آمن.',
      statusEn: danger
        ? 'INDUCTIVE FLYBACK SPIKE +96 V at turn-off! Avalanche breakdown stresses the MOSFET!'
        : 'Flyback Schottky diode clamps kickback safely to 12.7 V — MOSFET protected.',
      warningFr: danger
        ? 'Posez impérativement une diode roue libre en parallèle inverse avec la bobine !'
        : undefined,
      warningAr: danger
        ? 'اربط دايود حماية بالتوازي المعكوس مع الملف أو المحرك فوراً!'
        : undefined,
      warningEn: danger
        ? 'Always connect a reverse flyback diode directly across any motor, solenoid, or relay coil!'
        : undefined,
    };
  }

  // CHAPTER 7: DC-DC Boost Converter
  if (p.chapterId === 7) {
    const D = Math.min(0.78, Math.max(0.02, p.boostDuty / 100));
    const idealVout = p.boostVin / (1 - D);
    const vout = Math.min(28, idealVout - 0.35); // subtract Schottky drop
    const iout = vout / 47; // e.g. 47 Ohm load
    const iin = (iout / (1 - D)) * 1.07;
    const eff = Math.max(78, 95 - D * 12);

    return {
      vgs: 5.0,
      vth: 1.6,
      vds: vout,
      vout,
      igNA: 0.1,
      igPeakMA: 120,
      idA: iin,
      rdsOhms: 0.022,
      powerW: iin * iin * 0.022 + 0.35 * iout,
      tempC: 34 + D * 22,
      efficiencyPct: eff,
      spikeV: vout,
      meterDeflection: 0,
      conducting: D > 0.05,
      bodyDiodeActive: false,
      shootThrough: false,
      region: 'ohmic',
      statusFr: `V_in = ${p.boostVin.toFixed(1)} V · D = ${p.boostDuty}% → V_out = ${vout.toFixed(1)} V (Rendement ${eff.toFixed(0)} %)`,
      statusAr: `الدخل ${p.boostVin.toFixed(1)}V · النسبة ${p.boostDuty}% ← الخرج المرفوع ${vout.toFixed(1)}V (كفاءة ${eff.toFixed(0)}%)`,
      statusEn: `V_in = ${p.boostVin.toFixed(1)} V · D = ${p.boostDuty}% → V_out = ${vout.toFixed(1)} V (${eff.toFixed(0)}% eff.)`,
      warningFr:
        p.boostDuty > 70
          ? 'À rapport cyclique > 70 %, les pertes dans la bobine et le MOSFET augmentent vite.'
          : undefined,
      warningAr:
        p.boostDuty > 70
          ? 'عند نسبة نبضات أكبر من 70% يقلّ مردود الدارة وترتفع خسائر الملف.'
          : undefined,
      warningEn:
        p.boostDuty > 70
          ? 'Above 70% duty cycle, coil & switch losses rise rapidly and voltage gain saturates.'
          : undefined,
    };
  }

  // CHAPTER 8: H-Bridge & Linear Constant-Current Electronic Load
  if (p.chapterId === 8) {
    if (p.exampleId === 'electronic-dc-load' || p.exampleId === 'linear-electronic-load') {
      const idA = p.targetCurrentA;
      const vRshunt = idA * 0.1;
      const vds = Math.max(0.2, p.vdd - vRshunt);
      const powerW = vds * idA;
      const tempC = Math.min(200, 26 + powerW * 6.5);
      return {
        vgs: 2.3 + idA * 0.35,
        vth: 1.6,
        vds,
        vout: vRshunt,
        igNA: 0.1,
        igPeakMA: 0,
        idA,
        rdsOhms: vds / Math.max(0.05, idA),
        powerW,
        tempC,
        efficiencyPct: 100,
        spikeV: 0,
        meterDeflection: 0,
        conducting: idA > 0,
        bodyDiodeActive: false,
        shootThrough: false,
        region: tempC > 135 ? 'breakdown' : 'linear',
        statusFr: `Charge linéaire réglée à ${idA.toFixed(2)} A · P_MOSFET = V_DS × I_D = ${powerW.toFixed(1)} W`,
        statusAr: `تيار مسحوب ثابت = ${idA.toFixed(2)} A · الحرارة المبدّدة = ${powerW.toFixed(1)} W`,
        statusEn: `Linear sink locked at ${idA.toFixed(2)} A · Heat P = V_DS × I_D = ${powerW.toFixed(1)} W`,
        warningFr:
          powerW > 18
            ? `Dissipation ${powerW.toFixed(1)} W en zone linéaire ! Gros radiateur + ventilateur obligatoires.`
            : undefined,
        warningAr:
          powerW > 18
            ? `حرارة عالية ${powerW.toFixed(1)} W! المشتت الحراري والمروحة ضروريان هنا.`
            : undefined,
        warningEn:
          powerW > 18
            ? `High linear heat (${powerW.toFixed(1)} W)! Large heatsink and cooling fan required.`
            : undefined,
      };
    }

    // 4-MOSFET H-Bridge
    const active = p.hbridgeState === 'FWD' || p.hbridgeState === 'REV';
    const brake = p.hbridgeState === 'BRAKE';
    const idA = active ? 2.4 : 0;
    const powerW = active ? idA * idA * 0.09 : 0;

    return {
      vgs: active || brake ? 12 : 0,
      vth: 1.6,
      vds: active ? idA * 0.09 : 0,
      vout: p.hbridgeState === 'FWD' ? 11.8 : p.hbridgeState === 'REV' ? -11.8 : 0,
      igNA: 0.2,
      igPeakMA: 0,
      idA,
      rdsOhms: 0.09,
      powerW,
      tempC: 27 + powerW * 12,
      efficiencyPct: 98,
      spikeV: 0,
      meterDeflection: 0,
      conducting: active || brake,
      bodyDiodeActive: false,
      shootThrough: false,
      region: active || brake ? 'ohmic' : 'cutoff',
      statusFr:
        p.hbridgeState === 'FWD'
          ? 'Pont en H AVANT : Q1 (P-MOS) + Q4 (N-MOS) ouverts → +12 V → Moteur → GND'
          : p.hbridgeState === 'REV'
          ? 'Pont en H ARRIÈRE : Q3 (P-MOS) + Q2 (N-MOS) ouverts → inversion de sens !'
          : p.hbridgeState === 'BRAKE'
          ? 'Freinage dynamique : Q2 + Q4 (Low-Side) court-circuitent la FCEM du moteur'
          : 'Roue libre : les 4 MOSFETs coupés (0 A)',
      statusAr:
        p.hbridgeState === 'FWD'
          ? 'جسر H للأمام: Q1 و Q4 مفتوحان ← يدور المحرك للأمام'
          : p.hbridgeState === 'REV'
          ? 'جسر H للخلف: Q3 و Q2 مفتوحان ← ينعكس اتجاه المحرك!'
          : p.hbridgeState === 'BRAKE'
          ? 'كبح ديناميكي: Q2 و Q4 يفرغان حركة المحرك لإيقافه بسرعة'
          : 'دوران حر: جميع الترانزستورات الأربعة مفصولة',
      statusEn:
        p.hbridgeState === 'FWD'
          ? 'H-Bridge FORWARD: Q1 (P-MOS) + Q4 (N-MOS) ON → clockwise drive'
          : p.hbridgeState === 'REV'
          ? 'H-Bridge REVERSE: Q3 (P-MOS) + Q2 (N-MOS) ON → reversed polarity'
          : p.hbridgeState === 'BRAKE'
          ? 'Dynamic BRAKE: both low-side N-MOSFETs Q2 + Q4 clamp motor terminals'
          : 'COAST: all 4 MOSFETs OFF',
    };
  }

  // Fallback
  return computeMosfetSimulation({ ...p, chapterId: 1 });
}

function computeMosfetCatalog(p: MosfetSimParams): MosfetSimReadout {
  switch (p.catalogId) {
    case 'mos-floating-touch':
      return computeMosfetSimulation({ ...p, catalogId: undefined, chapterId: 1, exampleId: 'floating-gate-memory' });
    case 'mos-5v-trap':
      return computeMosfetSimulation({ ...p, catalogId: undefined, chapterId: 2, exampleId: 'rdson-trap' });
    case 'mos-pmos-highside':
      return computeMosfetSimulation({ ...p, catalogId: undefined, chapterId: 3, exampleId: 'pmos-high-side', fetPolarity: 'PMOS' });
    case 'mos-reverse-polarity':
      return computeMosfetSimulation({ ...p, catalogId: undefined, chapterId: 3, exampleId: 'reverse-polarity-pmos', fetPolarity: 'PMOS' });
    case 'mos-cmos-inverter':
      return computeMosfetSimulation({ ...p, catalogId: undefined, chapterId: 4, exampleId: 'cmos-inverter' });
    case 'mos-night-switch': {
      // Automatic solar garden light via 100k LDR divider -> V_GS
      const ldrKOhm = 1 + Math.pow(p.luxLevel / 100, 1.8) * 180;
      const vgs = p.luxLevel <= 40 ? 4.2 : 1.1;
      const spec = FET_SPECS.irlz44n;
      const conducting = p.luxLevel <= 40;
      const idA = conducting ? 0.35 : 0;
      return {
        vgs,
        vth: spec.vth,
        vds: conducting ? 0.01 : 5.0,
        vout: conducting ? 4.99 : 0,
        igNA: 0.05,
        igPeakMA: 0,
        idA,
        rdsOhms: conducting ? spec.rdsMin : 1e7,
        powerW: conducting ? 0.003 : 0,
        tempC: 25,
        efficiencyPct: 99.9,
        spikeV: 0,
        meterDeflection: 0,
        conducting,
        bodyDiodeActive: false,
        shootThrough: false,
        region: conducting ? 'ohmic' : 'cutoff',
        statusFr: conducting
          ? `Nuit (${p.luxLevel}% lux, LDR ≈ ${Math.round(ldrKOhm)} kΩ) → V_GS = 4,2 V · Strip LED ON`
          : `Jour (${p.luxLevel}% lux) → V_GS = 1,1 V < V_th · 0 µA consommé`,
        statusAr: conducting
          ? `ليل (${p.luxLevel}%) ← V_GS = 4.2V ← شريط الإضاءة يعمل`
          : `نهار (${p.luxLevel}%) ← V_GS = 1.1V ← الاستهلاك صفر تقريباً`,
        statusEn: conducting
          ? `Dark (${p.luxLevel}% light) → V_GS = 4.2 V · LED Strip ON`
          : `Daylight (${p.luxLevel}% light) → V_GS = 1.1 V < V_th · Zero drain`,
      };
    }
    case 'mos-audio-pwm':
      return computeMosfetSimulation({ ...p, catalogId: undefined, chapterId: 5, exampleId: 'pwm-switching-loss' });
    case 'mos-flyback-clamp':
      return computeMosfetSimulation({ ...p, catalogId: undefined, chapterId: 6, exampleId: 'inductive-flyback' });
    case 'mos-boost-12v':
      return computeMosfetSimulation({ ...p, catalogId: undefined, chapterId: 7, exampleId: 'boost-converter' });
    case 'mos-hbridge-drive':
      return computeMosfetSimulation({ ...p, catalogId: undefined, chapterId: 8, exampleId: 'hbridge-motor' });
    case 'mos-dc-load':
      return computeMosfetSimulation({ ...p, catalogId: undefined, chapterId: 8, exampleId: 'linear-electronic-load' });
    case 'mos-multimeter-tester': {
      // Pinout: 1 = Gate, 2 = Drain, 3 = Source
      let deflection = 0.02;
      let conducting = p.testerGateCharged;
      let bodyActive = false;

      if (p.testerType === 'shorted_gate') {
        deflection = 0.96;
        conducting = true;
      } else if (p.blackPin === p.redPin) {
        deflection = 1.0;
      } else if (p.testerType === 'nmos_gds') {
        // N-MOSFET pinout 1=G, 2=D, 3=S
        const dToS = p.blackPin === 2 && p.redPin === 3;
        const sToD = p.blackPin === 3 && p.redPin === 2;
        if (sToD) {
          // Body diode S -> D conducts in Diode/x10 mode!
          deflection = 0.72;
          bodyActive = true;
        } else if (dToS && p.testerGateCharged) {
          // Latched gate holds D->S open!
          deflection = 0.95;
          conducting = true;
        }
      } else {
        // P-MOSFET pinout 1=G, 2=D, 3=S
        const sToD = p.blackPin === 3 && p.redPin === 2;
        const dToS = p.blackPin === 2 && p.redPin === 3;
        if (dToS) {
          deflection = 0.72;
          bodyActive = true;
        } else if (sToD && p.testerGateCharged) {
          deflection = 0.95;
          conducting = true;
        }
      }

      return {
        vgs: p.testerGateCharged ? (p.testerType === 'pmos_gds' ? -3.2 : 3.2) : 0,
        vth: 2.0,
        vds: deflection > 0.7 ? 0.2 : 3.0,
        vout: 0,
        igNA: 0,
        igPeakMA: 0,
        idA: deflection > 0.7 ? 0.05 : 0,
        rdsOhms: deflection > 0.85 ? 0.05 : bodyActive ? 14 : 1e7,
        powerW: 0,
        tempC: 25,
        efficiencyPct: 100,
        spikeV: 0,
        meterDeflection: deflection,
        conducting,
        bodyDiodeActive: bodyActive,
        shootThrough: false,
        region: p.testerType === 'shorted_gate' ? 'breakdown' : conducting ? 'ohmic' : 'cutoff',
        statusFr:
          p.testerType === 'shorted_gate'
            ? 'MOSET HS ! Oxyde percé (court-circuit entre broches)'
            : bodyActive
            ? 'Diode de corps détectée (~0,55 V) : confirme D vs S !'
            : deflection > 0.85
            ? 'VERROUILLAGE GATE ACTIF : D–S proche de 0 Ω même sans toucher la grille !'
            : 'D–S isolé (∞ / OL) — chargez la grille G pour tester la mémoire',
        statusAr:
          p.testerType === 'shorted_gate'
            ? 'موسفيت تالف! قصر داخلي في الأقطاب'
            : bodyActive
            ? 'تم كشف الدايود الداخلي (~0.55V) بين S و D!'
            : deflection > 0.85
            ? 'البوابة مشحونة ومقفلة: المقاومة بين D و S قريبة من 0 Ω!'
            : 'معزول (OL / ∞) — المس البوابة G لشحنها وملاحظة بقاء التوصيل',
        statusEn:
          p.testerType === 'shorted_gate'
            ? 'BLOWN MOSFET! Shorted oxide across pins!'
            : bodyActive
            ? 'Body diode detected (~0.55 V) — confirms Source vs Drain!'
            : deflection > 0.85
            ? 'GATE LATCHED ON: D–S reads near 0 Ω even after moving probe off Gate!'
            : 'D–S Open (∞ / OL) — tap Gate to charge C_iss and test memory',
      };
    }
    default:
      return computeMosfetSimulation({ ...p, catalogId: undefined, chapterId: 1 });
  }
}
