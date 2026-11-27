import { Lang, tr } from '../types';
import {
  BETA_200,
  fingerResistance,
  R_220,
  SimParams,
  SimReadout,
  VBE,
  VLED,
  VS_9V,
} from './physics';
import {
  FET_SPECS,
  MosfetSimParams,
  MosfetSimReadout,
} from './mosfetPhysics';
import { KirchhoffSimParams, KirchhoffSimReadout } from './kirchhoffPhysics';
import { ampParamsFromSim, computeAmplifier, PREAMP_OPEN_LOOP_GAIN, VT } from './amplifier';

export interface VoltageCalcStep {
  label: string;
  formula: string;
  substitution: string;
  result: string;
  tone?: 'amber' | 'sky' | 'emerald' | 'rose';
}

export interface VoltageCalcReport {
  headerTitle: string;
  summaryEquation: string;
  steps: VoltageCalcStep[];
}

function fmtR(ohms: number): string {
  if (ohms >= 1e6) return `${(ohms / 1e6).toFixed(2)} MΩ`;
  if (ohms >= 1000) return `${(ohms / 1000).toFixed(ohms % 1000 === 0 ? 0 : 1)} kΩ`;
  return `${ohms.toFixed(ohms < 10 ? 2 : 0)} Ω`;
}

// ============================================================================
// 1. BJT TRACK — ALL 9 CHAPTERS & ALL 26 EXAMPLES
// ============================================================================
export function computeBjtVoltageSteps(
  p: SimParams,
  sim: SimReadout,
  lang: Lang
): VoltageCalcReport {
  const ex = p.exampleId;

  // CHAPTER 1
  if (p.chapterId === 1) {
    if (ex === 'plant') {
      const rSoil = 5000 + Math.pow(1 - p.pressure / 100, 2) * 800000;
      const vR220k = 3.0 - sim.vbe;
      const vLedDrop = Math.max(0, 3.0 - sim.vc);
      return {
        headerTitle: tr(lang, 'Détail des tensions · Capteur plante (3 V)', 'تفصيل الجهود · حساس التربة (3V)', 'Voltage Breakdown · Plant Sensor (3 V)'),
        summaryEquation: `V_CC (3.00 V) = V_LED (${vLedDrop.toFixed(2)} V) + V_CE (${sim.vce.toFixed(2)} V)`,
        steps: [
          {
            label: tr(lang, '1. Résistance du sol + protection 220 kΩ', '1. جهد المقاومة ووصلة القاعدة', '1. Soil + 220 kΩ base drop'),
            formula: 'U_base = V_CC − V_BE',
            substitution: `3.00 V − ${sim.vbe.toFixed(2)} V  (R_sol=${fmtR(rSoil)})`,
            result: `${Math.max(0, vR220k).toFixed(2)} V`,
            tone: 'sky',
          },
          {
            label: tr(lang, '2. Chute aux bornes de la LED collecteur', '2. هبوط الجهد على الـ LED', '2. Collector LED voltage drop'),
            formula: 'V_LED = V_CC − V_C',
            substitution: `3.00 V − ${sim.vc.toFixed(2)} V`,
            result: `${vLedDrop.toFixed(2)} V`,
            tone: 'amber',
          },
          {
            label: tr(lang, '3. Tension Collecteur-Émetteur (V_CE)', '3. جهد المجمّع-الباعث V_CE', '3. Collector–Emitter voltage (V_CE)'),
            formula: 'V_CE = V_CC − V_LED',
            substitution: `3.00 V − ${vLedDrop.toFixed(2)} V`,
            result: `${sim.vce.toFixed(2)} V`,
            tone: 'emerald',
          },
        ],
      };
    }

    if (ex === 'staircase') {
      const rf = fingerResistance(p.pressure);
      const vDiv = 9 * (100000 / (100000 + rf));
      const nLeds = sim.staircaseLeds;
      const vChain = nLeds * 0.6;
      return {
        headerTitle: tr(lang, 'Détail des tensions · Échelle à 4 LEDs (9 V)', 'تفصيل الجهود · السلم التدريجي (9V)', 'Voltage Breakdown · 4-LED Staircase (9 V)'),
        summaryEquation: `V_diviseur = ${vDiv.toFixed(2)} V  →  ${nLeds} × 0.60 V = ${vChain.toFixed(2)} V`,
        steps: [
          {
            label: tr(lang, '1. Pont diviseur doigt / 100 kΩ', '1. جهد مقسّم الإصبع و 100kΩ', '1. Finger / 100 kΩ divider node'),
            formula: 'V_base = V_CC · R_100k / (R_100k + R_peau)',
            substitution: `9.00 V × 100k / (100k + ${fmtR(rf)})`,
            result: `${vDiv.toFixed(2)} V`,
            tone: 'sky',
          },
          {
            label: tr(lang, '2. Seuil d’amorçage cumulé des étages', '2. عتبة التشغيل المتصاعدة للدرجات', '2. Staircase threshold needed'),
            formula: 'V_seuil(N) = N × 0.60 V',
            substitution: `${nLeds} étage(s) × 0.60 V`,
            result: `${vChain.toFixed(2)} V`,
            tone: 'amber',
          },
          {
            label: tr(lang, '3. Tension collecteur V_CE (étages actifs)', '3. جهد المجمّع-الباعث V_CE', '3. Output transistor V_CE'),
            formula: 'V_CE = V_CC − U_LED(sat)',
            substitution: nLeds > 0 ? '9.00 V − 8.80 V (saturé)' : '9.00 V − 0.00 V (bloqué)',
            result: `${sim.vce.toFixed(2)} V`,
            tone: 'emerald',
          },
        ],
      };
    }

    // default Ch. 1: 'simplest'
    const rf = fingerResistance(p.pressure);
    const uR220 = (sim.icMA / 1000) * R_220;
    const uFinger = VS_9V - sim.vbe;
    return {
      headerTitle: tr(lang, 'Détail des tensions · Circuit le plus simple (9 V)', 'تفصيل الجهود · أبسط دارة ترانزستور (9V)', 'Voltage Breakdown · World’s Simplest Circuit (9 V)'),
      summaryEquation: `9.00 V = V_LED (${VLED.toFixed(2)} V) + U_220Ω (${uR220.toFixed(2)} V) + V_CE (${sim.vce.toFixed(2)} V)`,
      steps: [
        {
          label: tr(lang, '1. Maille Base : chute sur le doigt', '1. حلقة القاعدة: الهبوط على الإصبع', '1. Base loop: drop across finger'),
          formula: 'U_doigt = V_CC − V_BE',
          substitution: `9.00 V − ${sim.vbe.toFixed(2)} V  (R=${fmtR(rf)})`,
          result: `${uFinger.toFixed(2)} V`,
          tone: 'sky',
        },
        {
          label: tr(lang, '2. Chute aux bornes de R_C (220 Ω)', '2. الهبوط على المقاومة 220Ω', '2. Drop across R_C (220 Ω)'),
          formula: 'U_R = R_C · I_C',
          substitution: `220 Ω × ${sim.icMA.toFixed(2)} mA`,
          result: `${uR220.toFixed(2)} V`,
          tone: 'amber',
        },
        {
          label: tr(lang, '3. Tension Collecteur-Émetteur (V_CE)', '3. الجهد المتبقي على الترانزستور V_CE', '3. Collector–Emitter voltage (V_CE)'),
          formula: 'V_CE = V_CC − V_LED − U_R',
          substitution: `9.00 − ${VLED.toFixed(2)} − ${uR220.toFixed(2)}`,
          result: `${sim.vce.toFixed(2)} V`,
          tone: 'emerald',
        },
      ],
    };
  }

  // CHAPTER 2
  if (p.chapterId === 2) {
    if (ex === 'logic-probe') {
      const isH = p.logicInput === 'HIGH';
      const isL = p.logicInput === 'LOW';
      const vTip = isH ? 5.0 : isL ? 0.0 : 1.5;
      const uDropR = isH || isL ? 3.0 - VLED - 0.2 : 0;
      return {
        headerTitle: tr(lang, 'Détail des tensions · Sonde logique NPN/PNP (3 V)', 'تفصيل الجهود · مسبار المنطق NPN/PNP (3V)', 'Voltage Breakdown · NPN/PNP Logic Probe (3 V)'),
        summaryEquation: isH
          ? `V_tip (5.0 V) > V_rail (3.0 V) → NPN Q1 saturé (V_CE = 0.20 V)`
          : isL
          ? `V_tip (0.0 V) → PNP Q2 saturé (V_EC = 0.20 V)`
          : `Pointe flottante : 3.00 V < V_LED_R (1.8 V) + V_LED_G (2.0 V) + 2·V_BE`,
        steps: [
          {
            label: tr(lang, '1. Potentiel sur la pointe de mesure', '1. جهد مجسّ الفحص', '1. Probe tip potential'),
            formula: 'V_pointe',
            substitution: isH ? 'Signal logique HIGH (+5 V)' : isL ? 'Masse logique LOW (0 V)' : 'Pointe en l’air (repos)',
            result: `${vTip.toFixed(2)} V`,
            tone: 'sky',
          },
          {
            label: tr(lang, '2. Tension sur les résistances de LED', '2. الجهد على مقاومة الـ LED', '2. LED series resistor drop'),
            formula: 'U_R = V_CC − V_LED − V_CE(sat)',
            substitution: isH || isL ? `3.00 V − 2.00 V − 0.20 V` : '0.00 V (chaîne bloquée)',
            result: `${uDropR.toFixed(2)} V`,
            tone: 'amber',
          },
          {
            label: tr(lang, '3. Tension de sortie V_CE / V_EC', '3. جهد الخرج V_CE / V_EC', '3. Active transistor drop V_CE'),
            formula: 'V_CE = V_CC − U_charge',
            substitution: isH || isL ? 'Jonction passante saturée' : 'Bloqué (aucun courant)',
            result: `${sim.vce.toFixed(2)} V`,
            tone: 'emerald',
          },
        ],
      };
    }

    // 'tester'
    const ok = (p.transistorType === 'NPN') !== p.batteryReversed;
    const uR220 = (sim.icMA / 1000) * R_220;
    return {
      headerTitle: tr(lang, `Détail des tensions · Testeur ${p.transistorType} (9 V)`, `تفصيل الجهود · فاحص ${p.transistorType} (9V)`, `Voltage Breakdown · ${p.transistorType} Tester (9 V)`),
      summaryEquation: ok
        ? `Polarisation correcte : 9.00 V = 2.00 V (LED) + ${uR220.toFixed(2)} V (R) + ${sim.vce.toFixed(2)} V (V_CE)`
        : `Polarisation inverse : jonction bloquée → I_C = 0 mA, V_CE = 9.00 V`,
      steps: [
        {
          label: tr(lang, '1. Tension Base-Émetteur (V_BE)', '1. جهد القاعدة-الباعث V_BE', '1. Base–Emitter forward drop (V_BE)'),
          formula: ok ? 'V_BE ≈ 0.60 V (passant)' : 'V_BE = 0 V (inverse)',
          substitution: `${p.transistorType} · Batterie ${p.batteryReversed ? 'inversée' : 'normale'}`,
          result: `${sim.vbe.toFixed(2)} V`,
          tone: ok ? 'sky' : 'rose',
        },
        {
          label: tr(lang, '2. Chute sur R_C (220 Ω) et LED', '2. هبوط الجهد على المقاومة والـ LED', '2. Drop across R_C (220 Ω) + LED'),
          formula: 'U_charge = V_LED + R_C · I_C',
          substitution: ok ? `2.00 V + ${uR220.toFixed(2)} V` : '0.00 V + 0.00 V',
          result: `${ok ? (VLED + uR220).toFixed(2) : '0.00'} V`,
          tone: 'amber',
        },
        {
          label: tr(lang, '3. Tension Collecteur-Émetteur (V_CE)', '3. جهد المجمّع-الباعث V_CE', '3. Collector–Emitter voltage (V_CE)'),
          formula: 'V_CE = V_CC − U_charge',
          substitution: ok ? `9.00 − ${(VLED + uR220).toFixed(2)}` : '9.00 − 0.00',
          result: `${sim.vce.toFixed(2)} V`,
          tone: 'emerald',
        },
      ],
    };
  }

  // CHAPTER 3
  if (p.chapterId === 3) {
    const vcc = ex === 'courtesy-light' ? 12.0 : 6.0;
    const vCap = p.capTriggered ? Math.min(vcc - 0.6, p.capCharge * (vcc - 0.6)) : 0;
    const uCharge = Math.max(0, vcc - sim.vce);
    return {
      headerTitle: tr(lang, `Détail des tensions · Temporisation C (${p.capValueUF} µF)`, `تفصيل الجهود · مؤقت المكثف (${p.capValueUF} µF)`, `Voltage Breakdown · Capacitor Timer (${p.capValueUF} µF)`),
      summaryEquation: `V_CC (${vcc.toFixed(1)} V) = U_cap (${vCap.toFixed(2)} V) + V_BE (${sim.vbe.toFixed(2)} V) + U_R`,
      steps: [
        {
          label: tr(lang, '1. Tension accumulée aux bornes de C', '1. الجهد المتراكم على المكثف C', '1. Capacitor accumulated voltage V_C'),
          formula: 'V_cap(t) = V_max · Charge%',
          substitution: `${(vcc - 0.6).toFixed(1)} V × ${Math.round(p.capCharge * 100)}%`,
          result: `${vCap.toFixed(2)} V`,
          tone: 'sky',
        },
        {
          label: tr(lang, '2. Tension utile sur la charge (Lampe/LED)', '2. الجهد الفعّال على الحمل', '2. Voltage delivered to load'),
          formula: 'U_charge = V_CC − V_CE(t)',
          substitution: `${vcc.toFixed(1)} V − ${sim.vce.toFixed(2)} V`,
          result: `${uCharge.toFixed(2)} V`,
          tone: 'amber',
        },
        {
          label: tr(lang, '3. Tension Collecteur-Émetteur V_CE(t)', '3. جهد المجمّع-الباعث V_CE(t)', '3. Transistor V_CE(t)'),
          formula: 'V_CE(t) = V_CC − U_charge',
          substitution: sim.conducting ? 'Rampe vers V_CC en fin de charge' : 'Bloqué (= V_CC)',
          result: `${sim.vce.toFixed(2)} V`,
          tone: 'emerald',
        },
      ],
    };
  }

  // CHAPTER 4
  if (p.chapterId === 4) {
    const isField = ex === 'mains-hum' || ex === 'eight-million';
    const vcc = isField || ex === 'second-simplest' ? 6.0 : 9.0;
    const stages = ex === 'second-simplest' ? 2 : isField ? 3 : p.stages;
    const vbeTotal = stages * VBE;
    const uLoad = Math.max(0, vcc - sim.vce);
    return {
      headerTitle: tr(lang, `Détail des tensions · Darlington ${stages} étage(s)`, `تفصيل الجهود · دارلنغتون (${stages} مراحل)`, `Voltage Breakdown · ${stages}-Stage Darlington`),
      summaryEquation: `∑V_BE = ${stages} × 0.60 V = ${vbeTotal.toFixed(2)} V  |  V_CC = ${vcc.toFixed(1)} V`,
      steps: [
        {
          label: tr(lang, '1. Somme des jonctions Base-Émetteur en série', '1. مجموع عتبات القاعدة-الباعث', '1. Stacked Base–Emitter drops'),
          formula: 'V_BE(tot) = N_étages × 0.60 V',
          substitution: `${stages} × 0.60 V  (${isField ? `dist=${p.proximityCm} cm` : `β=${sim.betaEff.toLocaleString('fr-FR')}`})`,
          result: `${sim.vbe.toFixed(2)} V`,
          tone: 'sky',
        },
        {
          label: tr(lang, '2. Tension sur LED + résistance série', '2. الهبوط على الـ LED والمقاومة', '2. Collector LED + resistor drop'),
          formula: 'U_charge = V_CC − V_CE',
          substitution: `${vcc.toFixed(1)} V − ${sim.vce.toFixed(2)} V`,
          result: `${uLoad.toFixed(2)} V`,
          tone: 'amber',
        },
        {
          label: tr(lang, '3. Tension collecteur finale V_CE', '3. الجهد المتبقي V_CE', '3. Output transistor V_CE'),
          formula: 'V_CE = V_CC − U_charge',
          substitution: `${vcc.toFixed(1)} − ${uLoad.toFixed(2)}`,
          result: `${sim.vce.toFixed(2)} V`,
          tone: 'emerald',
        },
      ],
    };
  }

  // CHAPTER 5
  if (p.chapterId === 5) {
    const vcc = ex === 'night-light' ? 12.0 : ex === 'motor-pwm' ? 3.0 : ex === 'motor-relay' ? 9.0 : 6.0;
    const uLoad = Math.max(0, vcc - sim.vce);
    const step1 =
      ex === 'motor-pwm'
        ? {
            label: tr(lang, '1. Tension moyenne moteur sous PWM', '1. متوسط جهد المحرك بنبضات PWM', '1. Effective PWM motor voltage'),
            formula: 'V_moy = V_CC × Duty%',
            substitution: `3.00 V × ${p.pwmDuty}%`,
            result: `${(3.0 * (p.pwmDuty / 100)).toFixed(2)} V`,
            tone: 'sky' as const,
          }
        : ex === 'motor-relay'
        ? {
            label: tr(lang, '1. Chute sur résistance de base 10 kΩ', '1. الهبوط على مقاومة القاعدة 10kΩ', '1. 10 kΩ base resistor drop'),
            formula: 'U_Rb = V_in − V_BE',
            substitution: `${p.vinSwitch.toFixed(2)} V − ${sim.vbe.toFixed(2)} V`,
            result: `${Math.max(0, p.vinSwitch - sim.vbe).toFixed(2)} V`,
            tone: 'sky' as const,
          }
        : ex === 'night-light' || ex === 'dark-schmitt'
        ? {
            label: tr(lang, '1. Potentiel du pont LDR', '1. جهد مقسّم حساس الضوء LDR', '1. LDR divider voltage'),
            formula: 'V_LDR ≈ f(Lux)',
            substitution: `Luminosité = ${p.luxLevel}% → ${sim.conducting ? 'V_B ≥ 0.60 V' : 'V_B < 0.60 V'}`,
            result: `${sim.vbe.toFixed(2)} V`,
            tone: 'sky' as const,
          }
        : {
            label: tr(lang, '1. Tension de commande base V_BE', '1. جهد تحكم القاعدة V_BE', '1. Control junction V_BE'),
            formula: 'V_BE(actif) ≈ 0.60 V',
            substitution: sim.conducting ? 'Verrou / impulsion active' : 'Au repos (0 V)',
            result: `${sim.vbe.toFixed(2)} V`,
            tone: 'sky' as const,
          };

    return {
      headerTitle: tr(lang, `Détail des tensions · Commutation & Capteur (${vcc} V)`, `تفصيل الجهود · التبديل والحساسات (${vcc}V)`, `Voltage Breakdown · Switching & Sensor (${vcc} V)`),
      summaryEquation: `V_CC (${vcc.toFixed(1)} V) = U_charge (${uLoad.toFixed(2)} V) + V_CE (${sim.vce.toFixed(2)} V)`,
      steps: [
        step1,
        {
          label: tr(lang, '2. Tension disponible sur la charge', '2. الجهد المتاح للحمل', '2. Voltage across load'),
          formula: 'U_charge = V_CC − V_CE',
          substitution: `${vcc.toFixed(1)} V − ${sim.vce.toFixed(2)} V`,
          result: `${uLoad.toFixed(2)} V`,
          tone: 'amber',
        },
        {
          label: tr(lang, '3. Chute collecteur-émetteur (V_CE)', '3. هبوط المجمّع-الباعث V_CE', '3. Collector–Emitter V_CE'),
          formula: 'V_CE = V_CC − U_charge',
          substitution: sim.conducting ? 'Saturé / Passant' : 'Bloqué (= V_CC)',
          result: `${sim.vce.toFixed(2)} V`,
          tone: 'emerald',
        },
      ],
    };
  }

  // CHAPTER 6
  if (p.chapterId === 6) {
    const vcc = ex === 'flipflop-2led' ? 9.0 : 6.0;
    const fHz = sim.freqHz ?? 1;
    const vCapSwing = -(vcc - VBE);
    return {
      headerTitle: tr(lang, `Détail des tensions · Oscillateur (${vcc} V · ${fHz.toFixed(1)} Hz)`, `تفصيل الجهود · المذبذب (${vcc}V)`, `Voltage Breakdown · Oscillator (${vcc} V · ${fHz.toFixed(1)} Hz)`),
      summaryEquation: `Bascule alternée : V_C(ON) ≈ 0.20 V · V_C(OFF) = ${vcc.toFixed(1)} V · V_B(min) = ${vCapSwing.toFixed(1)} V`,
      steps: [
        {
          label: tr(lang, '1. Tension négative momentanée sur la base bloquée', '1. الجهد السالب اللحظي على القاعدة المطفأة', '1. Negative base kick from coupling C'),
          formula: 'V_B(bascule) = −(V_CC − V_BE)',
          substitution: `−(${vcc.toFixed(1)} V − 0.60 V)`,
          result: `${vCapSwing.toFixed(2)} V`,
          tone: 'rose',
        },
        {
          label: tr(lang, '2. Collecteur du transistor conducteur (ON)', '2. جهد مجمّع الترانزستور المفتوح ON', '2. Conducting collector voltage'),
          formula: 'V_CE(sat)',
          substitution: `Transistor actif saturé (I_C ≈ ${sim.icMA.toFixed(1)} mA)`,
          result: '0.20 V',
          tone: 'emerald',
        },
        {
          label: tr(lang, '3. Collecteur du transistor bloqué (OFF)', '3. جهد مجمّع الترانزستور المطفأ OFF', '3. Blocked collector voltage'),
          formula: 'V_C(OFF) ≈ V_CC − V_LED',
          substitution: ex === 'siren-tick' ? 'Alimentation HP 6.00 V' : `${vcc.toFixed(1)} V − 2.00 V`,
          result: `${(ex === 'siren-tick' ? vcc : vcc - 2.0).toFixed(2)} V`,
          tone: 'amber',
        },
      ],
    };
  }

  // CHAPTER 7
  if (p.chapterId === 7) {
    if (ex === 'charge-pump') {
      const vCap = Math.max(0, p.cellVoltage - 0.2);
      const vTotal = p.pumpPhase === 'B' ? p.cellVoltage + 1.0 : p.cellVoltage;
      return {
        headerTitle: tr(lang, 'Détail des tensions · Pompe de charge 1,5 V', 'تفصيل الجهود · مضخة الشحنة 1.5V', 'Voltage Breakdown · 1.5 V Charge Pump'),
        summaryEquation: `Phase ${p.pumpPhase} : V_sortie = ${vTotal.toFixed(2)} V`,
        steps: [
          {
            label: tr(lang, '1. Tension pile mesurée', '1. جهد البطارية الفعلي', '1. Fresh/worn cell voltage'),
            formula: 'E_pile',
            substitution: 'Tension nominale réglée',
            result: `${p.cellVoltage.toFixed(2)} V`,
            tone: 'sky',
          },
          {
            label: tr(lang, '2. Charge stockée sur le condensateur 1 µF', '2. الجهد المخزّن في المكثف 1µF', '2. Stored voltage across 1 µF'),
            formula: 'V_C ≈ E_pile − V_CE(sat)',
            substitution: `${p.cellVoltage.toFixed(2)} V − 0.20 V`,
            result: `${vCap.toFixed(2)} V`,
            tone: 'amber',
          },
          {
            label: tr(lang, '3. Tension additionnée sur la LED', '3. الجهد المجموع على الـ LED', '3. Summed voltage across LED'),
            formula: p.pumpPhase === 'B' ? 'V_LED = E_pile + V_C' : 'Phase A (charge C uniquement)',
            substitution: p.pumpPhase === 'B' ? `${p.cellVoltage.toFixed(2)} V + 1.00 V` : 'C se charge, LED hors circuit',
            result: `${vTotal.toFixed(2)} V`,
            tone: 'emerald',
          },
        ],
      };
    }

    // bike-flasher & joule-thief
    const vFlyback = sim.vc - p.cellVoltage;
    return {
      headerTitle: tr(lang, `Détail des tensions · Élévateur inductif (${p.cellVoltage.toFixed(2)} V)`, `تفصيل الجهود · رافع الجهد بالملف`, `Voltage Breakdown · Inductive Booster`),
      summaryEquation: `V_crête = E_pile (${p.cellVoltage.toFixed(2)} V) + V_L (${Math.max(0, vFlyback).toFixed(2)} V) = ${sim.vc.toFixed(2)} V`,
      steps: [
        {
          label: tr(lang, '1. Tension d’alimentation pile', '1. جهد البطارية الأولي', '1. Single-cell EMF'),
          formula: 'E_pile',
          substitution: 'En dessous du seuil LED blanche (3.2 V)',
          result: `${p.cellVoltage.toFixed(2)} V`,
          tone: 'sky',
        },
        {
          label: tr(lang, '2. Force contre-électromotrice induite (L · dI/dt)', '2. الجهد الحثّي المتولد في الملف', '2. Inductive flyback boost (L · dI/dt)'),
          formula: 'U_bobine = −L · (dI / dt)',
          substitution: 'À la coupure brusque de BC337',
          result: `+${Math.max(0, vFlyback).toFixed(2)} V`,
          tone: 'amber',
        },
        {
          label: tr(lang, '3. Crête totale clampée sur la charge LED', '3. الذروة الكلية على الـ LED', '3. Clamped peak collector voltage'),
          formula: 'V_C(pic) = E_pile + U_bobine',
          substitution: `${p.cellVoltage.toFixed(2)} + ${Math.max(0, vFlyback).toFixed(2)}`,
          result: `${sim.vc.toFixed(2)} V`,
          tone: 'emerald',
        },
      ],
    };
  }

  // CHAPTER 8
  if (p.chapterId === 8) {
    if (ex === 'constant-current') {
      const uRsense = (sim.icMA / 1000) * p.rSense;
      const uLed = Math.max(0, p.supplyV - sim.vce - uRsense);
      return {
        headerTitle: tr(lang, 'Détail des tensions · Source de courant constant', 'تفصيل الجهود · مصدر التيار الثابت', 'Voltage Breakdown · Constant Current Source'),
        summaryEquation: `V_CC (${p.supplyV.toFixed(1)} V) = V_LED (${uLed.toFixed(2)} V) + V_CE (${sim.vce.toFixed(2)} V) + U_sense (${uRsense.toFixed(2)} V)`,
        steps: [
          {
            label: tr(lang, '1. Référence V_BE de Q1 sur R_sense', '1. مرجع قاعدة Q1 على مقاومة الاستشعار', '1. Sense voltage locked by Q1 V_BE'),
            formula: 'U_sense = I_C × R_sense ≈ 0.62 V',
            substitution: `${sim.icMA.toFixed(1)} mA × ${p.rSense} Ω`,
            result: `${uRsense.toFixed(2)} V`,
            tone: 'sky',
          },
          {
            label: tr(lang, '2. Tension absorbée par les LEDs en série', '2. الجهد على مصابيح الـ LED', '2. Series LED forward drop'),
            formula: 'U_LED',
            substitution: `${p.ledSeriesCount ?? 1} LED(s) (~${uLed.toFixed(2)} V)`,
            result: `${uLed.toFixed(2)} V`,
            tone: 'amber',
          },
          {
            label: tr(lang, '3. Excédent absorbé par Q2 (V_CE régulateur)', '3. الفائض الذي يمتصّه الترانزستور Q2', '3. Headroom dropped by Q2 (V_CE)'),
            formula: 'V_CE(Q2) = V_CC − U_LED − U_sense',
            substitution: `${p.supplyV.toFixed(1)} − ${uLed.toFixed(2)} − ${uRsense.toFixed(2)}`,
            result: `${sim.vce.toFixed(2)} V`,
            tone: 'emerald',
          },
        ],
      };
    }

    // solar-charger
    const panelV = 18.0;
    return {
      headerTitle: tr(lang, 'Détail des tensions · Régulateur solaire shunt', 'تفصيل الجهود · منظم الشحن الشمسي', 'Voltage Breakdown · Solar Shunt Regulator'),
      summaryEquation: p.solarDiverted
        ? `Coupure ≥ 13.7 V : panneau dérivé vers 100 Ω`
        : `Charge active : V_panneau (18.0 V) − V_diode (0.7 V) → V_batt (${p.battVoltage.toFixed(1)} V)`,
      steps: [
        {
          label: tr(lang, '1. Tension à vide du panneau solaire', '1. جهد اللوح الشمسي', '1. Solar panel voltage'),
          formula: 'V_panneau',
          substitution: 'Panneau 18 V nominal',
          result: `${panelV.toFixed(1)} V`,
          tone: 'amber',
        },
        {
          label: tr(lang, '2. Tension mesurée aux bornes de la batterie', '2. جهد البطارية المقاس', '2. Battery terminal voltage'),
          formula: 'V_batt (Hystérésis 12.5–13.7 V)',
          substitution: p.solarDiverted ? 'Pleine (dérivation active)' : 'En cours de charge',
          result: `${p.battVoltage.toFixed(2)} V`,
          tone: 'sky',
        },
        {
          label: tr(lang, '3. Différence aux bornes du transistor de dérivation', '3. الجهد على ترانزستور التحويل', '3. Shunt transistor V_CE'),
          formula: 'V_CE(shunt)',
          substitution: p.solarDiverted ? 'Saturé (dérive vers 100 Ω)' : 'Bloqué (= V_batt)',
          result: `${sim.vce.toFixed(2)} V`,
          tone: 'emerald',
        },
      ],
    };
  }

  // CHAPTER 10: Voltage amplification and gain factor
  if (p.chapterId === 10) {
    const ap = ampParamsFromSim(p);
    const amp = computeAmplifier(ap);
    const vinMv = ap.vinPeakV * 1000;
    const avAbs = Math.abs(amp.avMeasured);
    const outTone: 'emerald' | 'rose' = amp.clipped ? 'rose' : 'emerald';
    const outStep = {
      label: tr(lang, '4. Tension de sortie et marge aux rails', '4. جهد الخرج وهامش الحدّين', '4. Output voltage and rail headroom'),
      formula: 'V_out = |A_v| × V_in',
      substitution: `${avAbs.toFixed(1)} × ${vinMv.toFixed(1)} mV  (marge ±${Math.min(amp.headroomUp, amp.headroomDown).toFixed(2)} V)`,
      result: `${amp.voutPeakV.toFixed(2)} V crête${amp.clipped ? ' · ÉCRÊTÉ' : ''}`,
      tone: outTone,
    };
    if (ap.mode === 'preamp') {
      const beta = ap.reOhm / (ap.reOhm + ap.rfOhm);
      return {
        headerTitle: tr(lang, 'Détail du gain · Pré-ampli micro (p. 60, 9 V)', 'تفصيل الكسب · مضخّم الميكروفون الأولي (ص ٦٠، 9V)', 'Gain Breakdown · Mic Pre-Amp (p. 60, 9 V)'),
        summaryEquation: `V_out = A_v × V_in = ${amp.avMeasured.toFixed(1)} × ${vinMv.toFixed(1)} mV = ${amp.voutPeakV.toFixed(2)} V`,
        steps: [
          {
            label: tr(lang, '1. Fraction de sortie ramenée sur l’émetteur', '1. الجزء المُعاد من الخرج إلى الباعث', '1. Fraction of output fed back to the emitter'),
            formula: 'β = R_E / (R_E + R_F)',
            substitution: `${fmtR(ap.reOhm)} / (${fmtR(ap.reOhm)} + ${fmtR(ap.rfOhm)})`,
            result: beta.toFixed(4),
            tone: 'sky',
          },
          {
            label: tr(lang, '2. Gain en boucle fermée', '2. الكسب بالحلقة المغلقة', '2. Closed-loop gain'),
            formula: 'A_v = 1 / (β + 1/A_ol)',
            substitution: `1 / (${beta.toFixed(4)} + 1/${PREAMP_OPEN_LOOP_GAIN})  (A_ol supposé)`,
            result: `${amp.avSmallSignal.toFixed(1)}  (${(20 * Math.log10(Math.abs(amp.avSmallSignal))).toFixed(1)} dB)`,
            tone: 'amber',
          },
          {
            label: tr(lang, '3. Gain idéal fixé par les résistances', '3. الكسب المثالي الذي تحدده المقاومات', '3. Ideal gain set by the resistors'),
            formula: 'A_v ≈ 1 + R_F / R_E',
            substitution: `1 + ${fmtR(ap.rfOhm)} / ${fmtR(ap.reOhm)}`,
            result: (1 + ap.rfOhm / ap.reOhm).toFixed(1),
            tone: 'sky',
          },
          outStep,
        ],
      };
    }
    return {
      headerTitle: tr(lang, `Détail du gain · Émetteur commun (${ap.vcc} V)`, `تفصيل الكسب · باعث مشترك (${ap.vcc}V)`, `Gain Breakdown · Common Emitter (${ap.vcc} V)`),
      summaryEquation: `V_out = A_v × V_in = ${amp.avMeasured.toFixed(1)} × ${vinMv.toFixed(1)} mV = ${amp.voutPeakV.toFixed(2)} V`,
      steps: [
        {
          label: tr(lang, '1. Point de repos du collecteur', '1. جهد راحة المجمّع', '1. Quiescent collector voltage'),
          formula: 'V_C = V_CC − I_C × R_C',
          substitution: `${ap.vcc.toFixed(2)} V − ${(amp.icA * 1000).toFixed(3)} mA × ${fmtR(ap.rcOhm)}`,
          result: `${amp.vc0.toFixed(2)} V`,
          tone: 'amber',
        },
        {
          label: tr(lang, '2. Résistance d’émetteur interne', '2. مقاومة الباعث الداخلية', '2. Internal emitter resistance'),
          formula: 'r_e = V_T / I_C',
          substitution: `${(VT * 1000).toFixed(2)} mV / ${(amp.icA * 1000).toFixed(3)} mA`,
          result: `${amp.reIntOhm.toFixed(0)} Ω`,
          tone: 'sky',
        },
        {
          label: tr(lang, '3. Gain en tension (petit signal)', '3. كسب الجهد (إشارة صغيرة)', '3. Voltage gain (small signal)'),
          formula: 'A_v = −R_C / (r_e + R_E)',
          substitution: `−${fmtR(ap.rcOhm)} / (${amp.reIntOhm.toFixed(0)} Ω + ${ap.reOhm.toFixed(0)} Ω)`,
          result: `${amp.avSmallSignal.toFixed(1)}  (${(20 * Math.log10(Math.abs(amp.avSmallSignal))).toFixed(1)} dB)`,
          tone: 'emerald',
        },
        outStep,
      ],
    };
  }

  // CHAPTER 9: Self-Bias CE Amplifier
  const rb = 100000 * Math.pow(100, p.rbSlider / 100);
  const uRb = 5.0 - VBE;
  const uRc = (sim.icMA / 1000) * 22000;
  return {
    headerTitle: tr(lang, 'Détail des tensions · Polarisation EC (5 V)', 'تفصيل الجهود · نقطة التشغيل EC (5V)', 'Voltage Breakdown · Self-Bias CE Amp (5 V)'),
    summaryEquation: `V_CC (5.00 V) = U_Rc (${uRc.toFixed(2)} V) + V_C (${sim.vc.toFixed(2)} V)`,
    steps: [
      {
        label: tr(lang, '1. Chute dans la résistance de base R_B', '1. هبوط الجهد على مقاومة القاعدة R_B', '1. Base resistor R_B drop'),
        formula: 'U_Rb = V_C − V_BE (contre-réaction)',
        substitution: `${sim.vc.toFixed(2)} V − 0.60 V  (R_B=${fmtR(rb)})`,
        result: `${Math.max(0, sim.vc - VBE).toFixed(2)} V  (réf ${uRb.toFixed(2)} V)`,
        tone: 'sky',
      },
      {
        label: tr(lang, '2. Chute dans la résistance collecteur R_C (22 kΩ)', '2. هبوط الجهد على مقاومة المجمّع R_C (22kΩ)', '2. Collector resistor R_C (22 kΩ) drop'),
        formula: 'U_Rc = R_C · I_C',
        substitution: `22 kΩ × ${sim.icMA.toFixed(3)} mA`,
        result: `${uRc.toFixed(2)} V`,
        tone: 'amber',
      },
      {
        label: tr(lang, '3. Point de repos Collecteur V_C (cible = V_CC/2 = 2,50 V)', '3. جهد نقطة السكون V_C (الهدف = 2.50V)', '3. Q-Point collector voltage V_C (target 2.50 V)'),
        formula: 'V_C = V_CC − U_Rc',
        substitution: `5.00 V − ${uRc.toFixed(2)} V`,
        result: `${sim.vc.toFixed(2)} V`,
        tone: 'emerald',
      },
    ],
  };
}

// ============================================================================
// 2. MOSFET TRACK — ALL 8 CHAPTERS & ALL 17 EXAMPLES
// ============================================================================
export function computeMosfetVoltageSteps(
  p: MosfetSimParams,
  sim: MosfetSimReadout,
  lang: Lang
): VoltageCalcReport {
  const ex = p.exampleId;

  // CH 1
  if (p.chapterId === 1) {
    const vLed = sim.conducting ? 2.1 : 0;
    const uRes = Math.max(0, 9.0 - vLed - sim.vds);
    return {
      headerTitle: tr(lang, `Détail des tensions · Grille isolée SiO₂ (9 V)`, `تفصيل الجهود · البوابة المعزولة SiO₂ (9V)`, `Voltage Breakdown · Insulated SiO₂ Gate (9 V)`),
      summaryEquation: `V_DD (9.00 V) = V_LED (${vLed.toFixed(2)} V) + U_R (${uRes.toFixed(2)} V) + V_DS (${sim.vds.toFixed(2)} V)`,
      steps: [
        {
          label: tr(lang, '1. Tension Grille-Source V_GS (commandant C_iss)', '1. جهد البوابة-المصدر V_GS', '1. Gate–Source field voltage V_GS'),
          formula: 'V_GS = V_G − V_S  (I_G ≈ 0 nA)',
          substitution: ex === 'gate-cap-memory'
            ? (p.gateLatched ? 'Charge piégée sur SiO₂' : 'Déchargée (0 V)')
            : `${p.vgs.toFixed(2)} V appliqués sur la grille`,
          result: `${sim.vgs.toFixed(2)} V`,
          tone: 'sky',
        },
        {
          label: tr(lang, '2. Tension utile sur la charge LED + R', '2. الجهد الفعّال على الحمل', '2. Voltage dropped across LED + R'),
          formula: 'U_charge = V_DD − V_DS',
          substitution: `9.00 V − ${sim.vds.toFixed(2)} V`,
          result: `${(9.0 - sim.vds).toFixed(2)} V`,
          tone: 'amber',
        },
        {
          label: tr(lang, '3. Chute Drain-Source V_DS', '3. هبوط الجهد المصرف-المصدر V_DS', '3. Drain–Source drop V_DS'),
          formula: 'V_DS = I_D × R_DS(on)',
          substitution: sim.conducting ? `${sim.idA.toFixed(3)} A × ${sim.rdsOhms.toFixed(3)} Ω` : 'Canal pincé (bloqué)',
          result: `${sim.vds.toFixed(3)} V`,
          tone: 'emerald',
        },
      ],
    };
  }

  // CH 2
  if (p.chapterId === 2) {
    const model = p.fetModel === 'irf9540' ? 'irf540n' : p.fetModel;
    const spec = FET_SPECS[model];
    const vLoad = sim.conducting ? 12.0 - sim.vds : 0;
    return {
      headerTitle: tr(lang, `Détail des tensions · Seuil V_th vs R_DS(on) (${spec.name})`, `تفصيل الجهود · جهد العتبة و R_DS(on)`, `Voltage Breakdown · V_th & R_DS(on) (${spec.name})`),
      summaryEquation: `12.00 V = V_charge (${vLoad.toFixed(2)} V) + V_DS (${sim.vds.toFixed(2)} V)`,
      steps: [
        {
          label: tr(lang, '1. Marge de grille au-dessus du seuil (V_GS − V_th)', '1. هامش القيادة فوق جهد العتبة', '1. Gate overdrive (V_GS − V_th)'),
          formula: 'V_ov = V_GS − V_th',
          substitution: `${p.vgs.toFixed(1)} V − ${spec.vth.toFixed(1)} V`,
          result: `${(p.vgs - spec.vth).toFixed(2)} V`,
          tone: p.vgs >= spec.vth ? 'sky' : 'rose',
        },
        {
          label: tr(lang, '2. Chute parasite dans le MOSFET V_DS', '2. الهبوط الضائع على قناة الموسفيت V_DS', '2. Conduction loss drop V_DS'),
          formula: 'V_DS = I_D × R_DS(V_GS)',
          substitution: `${sim.idA.toFixed(2)} A × ${sim.rdsOhms < 10 ? sim.rdsOhms.toFixed(3) : '∞'} Ω`,
          result: `${sim.vds.toFixed(2)} V`,
          tone: sim.vds > 1.0 ? 'rose' : 'emerald',
        },
        {
          label: tr(lang, '3. Tension réelle reçue par la charge', '3. الجهد الفعلي الواصل للحمل', '3. Actual voltage across load'),
          formula: 'V_charge = V_DD − V_DS',
          substitution: `12.00 V − ${sim.vds.toFixed(2)} V`,
          result: `${vLoad.toFixed(2)} V`,
          tone: 'amber',
        },
      ],
    };
  }

  // CH 3
  if (p.chapterId === 3) {
    if (ex === 'pmos-reverse-polarity') {
      const safe = !p.batteryReversed;
      return {
        headerTitle: tr(lang, 'Détail des tensions · Anti-inversion P-MOS (12 V)', 'تفصيل الجهود · حماية عكس القطبية بـ P-MOS', 'Voltage Breakdown · P-MOS Reverse Guard (12 V)'),
        summaryEquation: safe
          ? `Polarité +12 V : V_GS = −12.0 V → perte V_DS = ${(sim.vds * 1000).toFixed(0)} mV seulement`
          : `Inversion −12 V : V_GS = 0 V → P-MOS bloqué (V_sortie = 0.00 V)`,
        steps: [
          {
            label: tr(lang, '1. Tension Grille-Source du P-MOS (V_G − V_S)', '1. جهد البوابة-المصدر V_GS', '1. P-MOS Gate–Source voltage'),
            formula: 'V_GS = V_G(0 V) − V_S(+V)',
            substitution: safe ? `0 V − ${p.vdd.toFixed(1)} V` : '0 V − 0 V (inversé)',
            result: `${sim.vgs.toFixed(1)} V`,
            tone: safe ? 'sky' : 'rose',
          },
          {
            label: tr(lang, '2. Chute directe D–S (comparée à 0,7 V diode)', '2. الهبوط المباشر D–S مقارنة بالدايود 0.7V', '2. Forward D–S drop (vs 0.7 V diode)'),
            formula: 'V_DS = I_D × R_DS(on)',
            substitution: safe ? `${sim.idA.toFixed(2)} A × ${(sim.rdsOhms * 1000).toFixed(0)} mΩ` : 'Bloqué',
            result: safe ? `${(sim.vds * 1000).toFixed(1)} mV` : `${sim.vds.toFixed(2)} V`,
            tone: 'emerald',
          },
          {
            label: tr(lang, '3. Tension délivrée à l’électronique protégée', '3. الجهد الواصل للدارة المحمية', '3. Protected output voltage'),
            formula: 'V_out = V_DD − V_DS',
            substitution: safe ? `${p.vdd.toFixed(1)} V − ${sim.vds.toFixed(3)} V` : '0.00 V (sécurité)',
            result: `${sim.vout.toFixed(2)} V`,
            tone: 'amber',
          },
        ],
      };
    }

    const isPMOS = p.fetPolarity === 'PMOS';
    return {
      headerTitle: tr(lang, `Détail des tensions · ${isPMOS ? 'P-MOS High-Side' : 'N-MOS Low-Side'}`, `تفصيل الجهود · مفتاح ${isPMOS ? 'P-MOS علوي' : 'N-MOS سفلي'}`, `Voltage Breakdown · ${isPMOS ? 'P-MOS High-Side' : 'N-MOS Low-Side'}`),
      summaryEquation: `V_DD (${p.vdd.toFixed(1)} V) = V_charge (${sim.vout.toFixed(2)} V) + V_DS (${sim.vds.toFixed(2)} V)`,
      steps: [
        {
          label: tr(lang, '1. Tension de grille relative à la Source (V_GS)', '1. جهد البوابة بالنسبة للمصدر V_GS', '1. Gate–Source control voltage V_GS'),
          formula: isPMOS ? 'V_GS = V_G − V_DD' : 'V_GS = V_G − 0 V',
          substitution: isPMOS
            ? (p.highSideSwitchOn ? `0.0 V − ${p.vdd.toFixed(1)} V` : `${p.vdd.toFixed(1)} V − ${p.vdd.toFixed(1)} V`)
            : (p.highSideSwitchOn ? '5.0 V − 0.0 V' : '0.0 V − 0.0 V'),
          result: `${sim.vgs.toFixed(1)} V`,
          tone: 'sky',
        },
        {
          label: tr(lang, '2. Tension sur le transistor V_DS', '2. الجهد على الترانزستور V_DS', '2. Transistor drop V_DS'),
          formula: 'V_DS = V_DD − V_charge',
          substitution: sim.conducting ? `${sim.idA.toFixed(2)} A × ${sim.rdsOhms.toFixed(3)} Ω` : 'Bloqué',
          result: `${sim.vds.toFixed(2)} V`,
          tone: 'emerald',
        },
        {
          label: tr(lang, '3. Tension effective aux bornes de la charge', '3. الجهد الفعّال على الحمل', '3. Load terminal voltage'),
          formula: 'V_charge = V_DD − V_DS',
          substitution: sim.conducting ? `${p.vdd.toFixed(1)} V − ${sim.vds.toFixed(3)} V` : '0.00 V (charge coupée)',
          result: `${sim.vout.toFixed(2)} V`,
          tone: 'amber',
        },
      ],
    };
  }

  // CH 4: CMOS
  if (p.chapterId === 4) {
    const vgsP = p.cmosVin - 5.0;
    const vdsP = 5.0 - sim.vout;
    return {
      headerTitle: tr(lang, 'Détail des tensions · Paire CMOS Push-Pull (5 V)', 'تفصيل الجهود · بوابة CMOS العاكسة (5V)', 'Voltage Breakdown · CMOS Push-Pull (5 V)'),
      summaryEquation: `V_DD (5.00 V) = V_SD(Q1 P-MOS) (${vdsP.toFixed(2)} V) + V_DS(Q2 N-MOS) (${sim.vout.toFixed(2)} V)`,
      steps: [
        {
          label: tr(lang, '1. Tension grille N-MOS bas (V_GS2)', '1. جهد بوابة N-MOS السفلي', '1. Bottom N-MOS V_GS2'),
          formula: 'V_GS2 = V_in − 0 V',
          substitution: `Entrée CMOS réglée à ${p.cmosVin.toFixed(2)} V`,
          result: `${p.cmosVin.toFixed(2)} V`,
          tone: 'sky',
        },
        {
          label: tr(lang, '2. Tension grille P-MOS haut (V_GS1)', '2. جهد بوابة P-MOS العلوي', '2. Top P-MOS V_GS1'),
          formula: 'V_GS1 = V_in − V_DD',
          substitution: `${p.cmosVin.toFixed(2)} V − 5.00 V`,
          result: `${vgsP.toFixed(2)} V`,
          tone: 'amber',
        },
        {
          label: tr(lang, '3. Tension de sortie CMOS V_out', '3. جهد الخرج V_out', '3. CMOS output voltage V_out'),
          formula: 'V_out = V_DS(N-MOS)',
          substitution: sim.shootThrough ? 'Zone transition : Q1 & Q2 passants !' : p.cmosVin < 2.5 ? 'Q1 P-MOS tire à +5 V' : 'Q2 N-MOS tire à 0 V',
          result: `${sim.vout.toFixed(2)} V`,
          tone: sim.shootThrough ? 'rose' : 'emerald',
        },
      ],
    };
  }

  // CH 5: PWM & Miller
  if (p.chapterId === 5) {
    const vAvg = 12.0 * (p.pwmDuty / 100);
    return {
      headerTitle: tr(lang, `Détail des tensions · Commutation PWM (${p.pwmFreqKHz} kHz)`, `تفصيل الجهود · نبضات PWM و R_G`, `Voltage Breakdown · PWM Switching (${p.pwmFreqKHz} kHz)`),
      summaryEquation: `V_moy = 12.00 V × ${p.pwmDuty}% = ${vAvg.toFixed(2)} V  ·  V_Miller ≈ 2.80 V`,
      steps: [
        {
          label: tr(lang, '1. Plateau de Miller durant la transition de V_DS', '1. هضبة ميلر أثناء هبوط V_DS', '1. Gate Miller plateau voltage'),
          formula: 'V_GS(plateau) ≈ V_th + I_D / g_fs',
          substitution: `C_iss = 1.7 nF chargé via R_G = ${p.rgOhms} Ω`,
          result: '2.80 V (palier)',
          tone: 'sky',
        },
        {
          label: tr(lang, '2. Tension moyenne aux bornes de la charge PWM', '2. متوسط الجهد على الحمل', '2. Average PWM load voltage'),
          formula: 'V_moy = V_DD × Duty%',
          substitution: `12.00 V × ${(p.pwmDuty / 100).toFixed(2)}`,
          result: `${vAvg.toFixed(2)} V`,
          tone: 'amber',
        },
        {
          label: tr(lang, '3. Chute moyenne Drain-Source (V_DS moy)', '3. متوسط جهد V_DS', '3. Average V_DS across switch'),
          formula: 'V_DS(moy) = V_DD × (1 − Duty%)',
          substitution: `12.00 V × ${(1 - p.pwmDuty / 100).toFixed(2)}`,
          result: `${sim.vds.toFixed(2)} V`,
          tone: 'emerald',
        },
      ],
    };
  }

  // CH 6: Inductive Flyback & Body Diode
  if (p.chapterId === 6) {
    if (ex === 'body-diode-conduction' || p.reverseBodyTest) {
      return {
        headerTitle: tr(lang, 'Détail des tensions · Conduction Diode de Corps (S → D)', 'تفصيل الجهود · توصيل الدايود الداخلي (S → D)', 'Voltage Breakdown · Body Diode (S → D)'),
        summaryEquation: `V_S (12.00 V) − V_F (0.72 V) = V_D (11.28 V) malgré V_GS = 0 V !`,
        steps: [
          {
            label: tr(lang, '1. Commande de grille bloquée', '1. البوابة مطفأة تماماً', '1. Gate bias voltage'),
            formula: 'V_GS = 0.00 V',
            substitution: 'Canal principal MOSFET fermé',
            result: '0.00 V',
            tone: 'sky',
          },
          {
            label: tr(lang, '2. Tension directe de la diode de corps S → D', '2. الجهد الأمامي للدايود الداخلي S → D', '2. Intrinsic body diode forward drop'),
            formula: 'V_F(diode) = V_S − V_D',
            substitution: '12.00 V − 11.28 V',
            result: '0.72 V',
            tone: 'rose',
          },
          {
            label: tr(lang, '3. Potentiel qui s’échappe au Drain', '3. الجهد المهرّب على المصرف', '3. Drain output voltage leaked'),
            formula: 'V_D = V_S − V_F',
            substitution: '12.00 V − 0.72 V',
            result: `${sim.vout.toFixed(2)} V`,
            tone: 'amber',
          },
        ],
      };
    }

    const vL = sim.spikeV - 12.0;
    return {
      headerTitle: tr(lang, 'Détail des tensions · Surtension inductive (−L · dI/dt)', 'تفصيل الجهود · النبضة الحثّية (−L·dI/dt)', 'Voltage Breakdown · Inductive Flyback Spike'),
      summaryEquation: p.flybackInstalled
        ? `V_D(pic) = 12.0 V + V_Schottky (0.7 V) = 12.70 V (Protégé)`
        : `V_D(pic) = 12.0 V + 84.0 V (L·dI/dt) = 96.0 V (AVALANCHE !)`,
      steps: [
        {
          label: tr(lang, '1. Tension d’alimentation repos', '1. جهد البطارية الأساسي', '1. Supply rail voltage'),
          formula: 'V_DD',
          substitution: 'Référence haute bobine',
          result: '12.00 V',
          tone: 'sky',
        },
        {
          label: tr(lang, '2. Tension générée aux bornes de la bobine à la coupure', '2. الجهد المتولد على الملف عند الفصل', '2. Kickback voltage across coil'),
          formula: 'U_bobine = −L · (dI / dt)',
          substitution: p.flybackInstalled ? 'Clampée par diode 1N5819 (V_F)' : 'Circuit ouvert : pic non clampé !',
          result: `+${vL.toFixed(2)} V`,
          tone: p.flybackInstalled ? 'emerald' : 'rose',
        },
        {
          label: tr(lang, '3. Pic total vu par le Drain V_DS(pic)', '3. الذروة الكلية على المصرف V_DS(pic)', '3. Peak Drain–Source voltage'),
          formula: 'V_DS(pic) = V_DD + U_bobine',
          substitution: `12.00 V + ${vL.toFixed(2)} V`,
          result: `${sim.spikeV.toFixed(2)} V`,
          tone: p.flybackInstalled ? 'amber' : 'rose',
        },
      ],
    };
  }

  // CH 7: Boost DC-DC
  if (p.chapterId === 7) {
    const D = Math.min(0.78, Math.max(0.02, p.boostDuty / 100));
    const vIdeal = p.boostVin / (1 - D);
    const vInductorBoost = Math.max(0, sim.vout + 0.35 - p.boostVin);
    return {
      headerTitle: tr(lang, 'Détail des tensions · Convertisseur Boost DC-DC', 'تفصيل الجهود · رافع الجهد Boost DC-DC', 'Voltage Breakdown · Boost DC-DC Converter'),
      summaryEquation: `V_out = V_in / (1 − D) − V_diode = ${vIdeal.toFixed(2)} − 0.35 = ${sim.vout.toFixed(2)} V`,
      steps: [
        {
          label: tr(lang, '1. Tension idéale par conservation du flux magnétique', '1. الجهد النظري حسب نسبة النبضات D', '1. Ideal Boost step-up voltage'),
          formula: 'V_idéal = V_in / (1 − D)',
          substitution: `${p.boostVin.toFixed(1)} V / (1 − ${D.toFixed(2)})`,
          result: `${vIdeal.toFixed(2)} V`,
          tone: 'sky',
        },
        {
          label: tr(lang, '2. Surtension ajoutée par la bobine (V_L)', '2. الإضافة الناتجة عن الملف V_L', '2. Inductor step-up contribution'),
          formula: 'V_L(moy) = V_idéal − V_in',
          substitution: `${vIdeal.toFixed(2)} V − ${p.boostVin.toFixed(1)} V`,
          result: `+${vInductorBoost.toFixed(2)} V`,
          tone: 'amber',
        },
        {
          label: tr(lang, '3. Tension de sortie utile après diode Schottky (0,35 V)', '3. جهد الخرج الفعلي بعد دايود شوتكي', '3. Net output V_out after 0.35 V Schottky'),
          formula: 'V_out = V_idéal − 0.35 V',
          substitution: `${Math.min(28.35, vIdeal).toFixed(2)} V − 0.35 V`,
          result: `${sim.vout.toFixed(2)} V`,
          tone: 'emerald',
        },
      ],
    };
  }

  // CH 8: Electronic Load & H-Bridge
  if (ex === 'electronic-dc-load') {
    const vShunt = p.targetCurrentA * 0.1;
    return {
      headerTitle: tr(lang, 'Détail des tensions · Charge linéaire électronique', 'تفصيل الجهود · الحمل الخطي للتيار الثابت', 'Voltage Breakdown · Linear DC Electronic Load'),
      summaryEquation: `V_alim (${p.vdd.toFixed(1)} V) = V_DS (${sim.vds.toFixed(2)} V) + V_shunt (${vShunt.toFixed(3)} V)`,
      steps: [
        {
          label: tr(lang, '1. Tension de mesure sur le shunt 0,1 Ω', '1. جهد الاستشعار على مقاومة 0.1Ω', '1. 0.1 Ω sense shunt voltage'),
          formula: 'V_shunt = I_D × R_shunt',
          substitution: `${p.targetCurrentA.toFixed(2)} A × 0.10 Ω`,
          result: `${vShunt.toFixed(3)} V`,
          tone: 'sky',
        },
        {
          label: tr(lang, '2. Grille pilotée par l’AOP en zone linéaire', '2. جهد البوابة المضبوط عبر المضخم', '2. Op-amp controlled gate voltage'),
          formula: 'V_GS(linéaire) ≈ V_th + ΔV(I_D)',
          substitution: `Régulation continue pour maintenir ${p.targetCurrentA.toFixed(2)} A`,
          result: `${sim.vgs.toFixed(2)} V`,
          tone: 'amber',
        },
        {
          label: tr(lang, '3. Chute absorbée en chaleur par le MOSFET (V_DS)', '3. الجهد المبدّد كحرارة على الموسفيت V_DS', '3. Linear dissipation voltage V_DS'),
          formula: 'V_DS = V_alim − V_shunt',
          substitution: `${p.vdd.toFixed(1)} V − ${vShunt.toFixed(3)} V  (P=${sim.powerW.toFixed(1)} W)`,
          result: `${sim.vds.toFixed(2)} V`,
          tone: sim.powerW > 18 ? 'rose' : 'emerald',
        },
      ],
    };
  }

  // H-Bridge
  const active = p.hbridgeState === 'FWD' || p.hbridgeState === 'REV';
  const vMotor = active ? (p.hbridgeState === 'FWD' ? 11.78 : -11.78) : 0;
  return {
    headerTitle: tr(lang, 'Détail des tensions · Pont en H à 4 MOSFETs (12 V)', 'تفصيل الجهود · جسر H بأربعة موسفيت (12V)', 'Voltage Breakdown · 4-MOSFET H-Bridge (12 V)'),
    summaryEquation: active
      ? `V_DD (12.00 V) = V_SD(High) (0.11 V) + |V_moteur| (11.78 V) + V_DS(Low) (0.11 V)`
      : `État ${p.hbridgeState} : V_moteur = 0.00 V`,
    steps: [
      {
        label: tr(lang, '1. Chute totale sur les 2 MOSFETs en série', '1. الهبوط على الترانزستورين العاملين', '1. Total drop across 2 series MOSFETs'),
        formula: 'U_2FET = I_M × (R_DS(H) + R_DS(L))',
        substitution: active ? '2.40 A × (0.045 + 0.045 Ω)' : '0 A (moteur arrêté)',
        result: active ? '0.22 V' : '0.00 V',
        tone: 'sky',
      },
      {
        label: tr(lang, '2. Tension différentielle aux bornes du moteur (V_A − V_B)', '2. فرق الجهد على طرفي المحرك', '2. Motor differential voltage (V_A − V_B)'),
        formula: 'V_moteur = V_DD − U_2FET',
        substitution: p.hbridgeState === 'FWD' ? '+11.89 V − 0.11 V' : p.hbridgeState === 'REV' ? '0.11 V − 11.89 V (inversée)' : '0 V − 0 V',
        result: `${vMotor.toFixed(2)} V`,
        tone: 'amber',
      },
      {
        label: tr(lang, '3. Chute par transistor conducteur V_DS', '3. هبوط كل ترانزستور V_DS', '3. Single switch drop V_DS'),
        formula: 'V_DS ≈ 0.5 × U_2FET',
        substitution: active ? 'Saturation ohmique froide' : 'Coupé / Freinage',
        result: active ? '0.11 V' : '0.00 V',
        tone: 'emerald',
      },
    ],
  };
}

// ============================================================================
// 3. KIRCHHOFF & THÉVENIN TRACK — ALL 9 CHAPTERS & ALL 17 EXAMPLES
// ============================================================================
export function computeKirchhoffVoltageSteps(
  p: KirchhoffSimParams,
  sim: KirchhoffSimReadout,
  lang: Lang
): VoltageCalcReport {
  const top = p.topology;

  if (top === 'series-2r') {
    const rTot = p.r1 + p.r2;
    return {
      headerTitle: tr(lang, 'Calcul des tensions · Maille série à 2 dipôles', 'حساب الجهود · حلقة توالي بمقاومتين', 'Voltage Calculation · 2-Resistor Series KVL'),
      summaryEquation: `∑U = +${p.e1.toFixed(2)} − ${sim.u1.toFixed(2)} − ${sim.u2.toFixed(2)} = ${sim.kvlLoop1ResidualV.toFixed(2)} V`,
      steps: [
        {
          label: tr(lang, '1. Chute aux bornes de R₁ (U₁)', '1. الهبوط على R₁ (U₁)', '1. Voltage drop across R₁ (U₁)'),
          formula: 'U₁ = E₁ × R₁ / (R₁ + R₂)',
          substitution: p.faultMode === 'open' ? 'Circuit ouvert : I = 0 → U₁ = 0' : p.faultMode === 'short' ? 'R₂ court-circuitée → U₁ = E₁' : `${p.e1.toFixed(1)} × ${p.r1} / ${rTot}`,
          result: `${sim.u1.toFixed(2)} V`,
          tone: 'amber',
        },
        {
          label: tr(lang, '2. Chute aux bornes de R₂ (U₂)', '2. الهبوط على R₂ (U₂)', '2. Voltage drop across R₂ (U₂)'),
          formula: 'U₂ = E₁ × R₂ / (R₁ + R₂)',
          substitution: p.faultMode === 'open' ? 'Coupure sur R₂ → absorbe E₁' : p.faultMode === 'short' ? 'Court-circuit sur R₂ → 0 V' : `${p.e1.toFixed(1)} × ${p.r2} / ${rTot}`,
          result: `${sim.u2.toFixed(2)} V`,
          tone: 'sky',
        },
        {
          label: tr(lang, '3. Potentiel intermédiaire au nœud A (V_A)', '3. جهد العقدة الوسطى V_A', '3. Midpoint node potential V_A'),
          formula: 'V_A = E₁ − U₁ = U₂',
          substitution: `${p.e1.toFixed(2)} V − ${sim.u1.toFixed(2)} V`,
          result: `${sim.vA.toFixed(2)} V`,
          tone: 'emerald',
        },
      ],
    };
  }

  if (top === 'series-3r') {
    const rTot = p.r1 + p.r2 + p.r3;
    return {
      headerTitle: tr(lang, 'Calcul des tensions · Maille série à 3 dipôles', 'حساب الجهود · حلقة توالي بـ 3 مقاومات', 'Voltage Calculation · 3-Resistor Series KVL'),
      summaryEquation: `∑U = +${p.e1.toFixed(2)} − ${sim.u1.toFixed(2)} − ${sim.u2.toFixed(2)} − ${sim.u3.toFixed(2)} = ${sim.kvlLoop1ResidualV.toFixed(2)} V`,
      steps: [
        {
          label: tr(lang, '1. Chute sur R₁ (U₁)', '1. الهبوط على R₁ (U₁)', '1. Drop across R₁ (U₁)'),
          formula: 'U₁ = E₁ × R₁ / (R₁ + R₂ + R₃)',
          substitution: `${p.e1.toFixed(1)} × ${p.r1} / ${rTot}  (I = ${sim.iTotalMA.toFixed(2)} mA)`,
          result: `${sim.u1.toFixed(2)} V`,
          tone: 'amber',
        },
        {
          label: tr(lang, '2. Chute sur R₂ (U₂) & potentiel V_A', '2. الهبوط على R₂ (U₂) وجهد العقدة A', '2. Drop across R₂ (U₂) & Node V_A'),
          formula: 'U₂ = R₂ · I   ·   V_A = E₁ − U₁',
          substitution: `U₂ = ${sim.u2.toFixed(2)} V   |   V_A = ${p.e1.toFixed(2)} − ${sim.u1.toFixed(2)}`,
          result: `U₂=${sim.u2.toFixed(2)} V · V_A=${sim.vA.toFixed(2)} V`,
          tone: 'sky',
        },
        {
          label: tr(lang, '3. Chute sur R₃ (U₃ = V_B)', '3. الهبوط على R₃ (U₃ = V_B)', '3. Drop across R₃ (U₃ = V_B)'),
          formula: 'U₃ = E₁ − U₁ − U₂',
          substitution: `${p.e1.toFixed(2)} − ${sim.u1.toFixed(2)} − ${sim.u2.toFixed(2)}`,
          result: `${sim.u3.toFixed(2)} V`,
          tone: 'emerald',
        },
      ],
    };
  }

  if (top === 'loaded-divider') {
    const rEq = p.loadConnected ? (p.r2 * p.rLoad) / (p.r2 + p.rLoad) : p.r2;
    const vIdeal = p.e1 * (p.r2 / (p.r1 + p.r2));
    return {
      headerTitle: tr(lang, 'Calcul des tensions · Pont diviseur en charge', 'حساب الجهود · مقسّم الجهد تحت الحمل', 'Voltage Calculation · Loaded Voltage Divider'),
      summaryEquation: `E₁ (${p.e1.toFixed(2)} V) = U₁ (${sim.u1.toFixed(2)} V) + V_out (${sim.vOut.toFixed(2)} V)  [à vide : ${vIdeal.toFixed(2)} V]`,
      steps: [
        {
          label: tr(lang, '1. Résistance équivalente du bas R_éq = R₂ // R_L', '1. المقاومة المكافئة السفلية R₂ // R_L', '1. Parallel lower leg R_eq = R₂ // R_L'),
          formula: p.loadConnected ? 'R_eq = (R₂ × R_L) / (R₂ + R_L)' : 'R_eq = R₂ (à vide)',
          substitution: p.loadConnected ? `(${p.r2} × ${p.rLoad}) / (${p.r2} + ${p.rLoad})` : `${p.r2} Ω`,
          result: `${fmtR(rEq)}`,
          tone: 'sky',
        },
        {
          label: tr(lang, '2. Chute dans la résistance haute R₁ (U₁)', '2. الهبوط في المقاومة العلوية R₁', '2. Upstream drop across R₁ (U₁)'),
          formula: 'U₁ = R₁ · (I₂ + I_L)',
          substitution: `${fmtR(p.r1)} × ${sim.i1MA.toFixed(2)} mA`,
          result: `${sim.u1.toFixed(2)} V`,
          tone: 'amber',
        },
        {
          label: tr(lang, '3. Tension de sortie réelle V_out', '3. جهد المخرج الحقيقي V_out', '3. Actual loaded V_out'),
          formula: 'V_out = E₁ × R_eq / (R₁ + R_eq)',
          substitution: `${p.e1.toFixed(1)} × ${rEq.toFixed(0)} / ${(p.r1 + rEq).toFixed(0)}`,
          result: `${sim.vOut.toFixed(2)} V`,
          tone: 'emerald',
        },
      ],
    };
  }

  if (top === 'dual-sources') {
    const eNet = p.e1 + (p.secondSourceOpposing ? -p.e2 : p.e2);
    return {
      headerTitle: tr(lang, 'Calcul des tensions · Boucle à 2 sources', 'حساب الجهود · حلقة بمصدرين', 'Voltage Calculation · Dual-Source KVL Loop'),
      summaryEquation: `∑U = +${p.e1.toFixed(2)} ${p.secondSourceOpposing ? '−' : '+'} ${p.e2.toFixed(2)} − (${sim.u1.toFixed(2)}) − (${sim.u2.toFixed(2)}) = ${sim.kvlLoop1ResidualV.toFixed(2)} V`,
      steps: [
        {
          label: tr(lang, '1. Force électromotrice nette E_net', '1. محصلة القوى الدافعة E_net', '1. Net loop EMF E_net'),
          formula: p.secondSourceOpposing ? 'E_net = E₁ − E₂' : 'E_net = E₁ + E₂',
          substitution: `${p.e1.toFixed(1)} V ${p.secondSourceOpposing ? '−' : '+'} ${p.e2.toFixed(1)} V`,
          result: `${eNet.toFixed(2)} V`,
          tone: 'sky',
        },
        {
          label: tr(lang, '2. Chute sur R₁ (U₁)', '2. الهبوط على R₁ (U₁)', '2. Drop across R₁ (U₁)'),
          formula: 'U₁ = R₁ · I = E_net × R₁ / (R₁ + R₂)',
          substitution: `${p.r1} Ω × ${sim.iTotalMA.toFixed(2)} mA`,
          result: `${sim.u1.toFixed(2)} V`,
          tone: 'amber',
        },
        {
          label: tr(lang, '3. Chute sur R₂ (U₂) & potentiel intermédiaire V_A', '3. الهبوط على R₂ (U₂) وجهد V_A', '3. Drop across R₂ (U₂) & node V_A'),
          formula: 'U₂ = R₂ · I   ·   V_A = E₁ − U₁',
          substitution: `U₂ = ${sim.u2.toFixed(2)} V   |   V_A = ${p.e1.toFixed(2)} − (${sim.u1.toFixed(2)})`,
          result: `V_A = ${sim.vA.toFixed(2)} V`,
          tone: 'emerald',
        },
      ],
    };
  }

  if (top === 'parallel-2' || top === 'parallel-3') {
    const isShort = p.faultMode === 'short';
    return {
      headerTitle: tr(lang, `Calcul des tensions · Branches parallèles (KCL)`, `حساب الجهود · الفروع المتوازية`, `Voltage Calculation · Parallel KCL Bus`),
      summaryEquation: isShort
        ? `Court-circuit : V_bus effondré à 0.00 V`
        : `V_nœud A = E₁ (${p.e1.toFixed(2)} V) identique sur chaque branche`,
      steps: [
        {
          label: tr(lang, '1. Potentiel commun du nœud supérieur A', '1. الجهد المشترك على العقدة A', '1. Shared top bus node voltage V_A'),
          formula: 'U₁ = U₂ = V_A = E₁',
          substitution: isShort ? 'Branche court-circuitée tire le bus à 0 V' : `Toutes les branches reliées entre +E₁ et GND`,
          result: `${sim.vA.toFixed(2)} V`,
          tone: isShort ? 'rose' : 'sky',
        },
        {
          label: tr(lang, '2. Tension appliquée à R₁ et R₂', '2. الجهد المطبق على R₁ و R₂', '2. Voltage across R₁ and R₂'),
          formula: 'U₁ = R₁·I₁   ·   U₂ = R₂·I₂',
          substitution: `${p.r1} Ω × ${sim.i1MA.toFixed(2)} mA  |  ${p.r2} Ω × ${sim.i2MA.toFixed(2)} mA`,
          result: `U₁=${sim.u1.toFixed(2)} V · U₂=${sim.u2.toFixed(2)} V`,
          tone: 'amber',
        },
        {
          label: tr(lang, '3. Vérification des nœuds (KCL)', '3. التحقق من قانون العقد KCL', '3. KCL junction balance check'),
          formula: '∑I_sortants = I_total',
          substitution: `${sim.i1MA.toFixed(1)} + ${sim.i2MA.toFixed(1)}${top === 'parallel-3' ? ` + ${sim.i3MA.toFixed(1)}` : ''} mA`,
          result: `${sim.iTotalMA.toFixed(2)} mA`,
          tone: 'emerald',
        },
      ],
    };
  }

  if (top === 'led-series-kvl') {
    const vfTot = p.vfLed1 + (p.loadConnected ? p.vfLed2 : 0);
    return {
      headerTitle: tr(lang, 'Calcul des tensions · Maille LED série', 'حساب الجهود · حلقة LED توالي', 'Voltage Calculation · Series LED KVL'),
      summaryEquation: `E₁ (${p.e1.toFixed(2)} V) = U_R₁ (${sim.u1.toFixed(2)} V) + ∑V_F (${sim.u2.toFixed(2)} V)`,
      steps: [
        {
          label: tr(lang, '1. Somme des tensions de seuil ∑V_F', '1. مجموع عتبات المصابيح ∑V_F', '1. Sum of LED forward thresholds ∑V_F'),
          formula: '∑V_F = V_F1 (+ V_F2)',
          substitution: p.loadConnected ? `${p.vfLed1.toFixed(1)} V + ${p.vfLed2.toFixed(1)} V` : `${p.vfLed1.toFixed(1)} V (1 LED)`,
          result: `${vfTot.toFixed(2)} V`,
          tone: 'sky',
        },
        {
          label: tr(lang, '2. Tension restante sur la résistance R₁ (U_R)', '2. الجهد المتبقي على المقاومة R₁', '2. Remaining drop across resistor R₁'),
          formula: 'U_R = max(0, E₁ − ∑V_F)',
          substitution: `${p.e1.toFixed(2)} V − ${vfTot.toFixed(2)} V`,
          result: `${sim.u1.toFixed(2)} V`,
          tone: 'amber',
        },
        {
          label: tr(lang, '3. Courant déduit dans la maille', '3. التيار الناتج في الحلقة', '3. Resulting loop LED current'),
          formula: 'I_LED = U_R / R₁',
          substitution: `${sim.u1.toFixed(2)} V / ${p.r1} Ω`,
          result: `${sim.iTotalMA.toFixed(2)} mA`,
          tone: 'emerald',
        },
      ],
    };
  }

  if (top === 'led-parallel-trap') {
    return {
      headerTitle: tr(lang, 'Calcul des tensions · Piège des LEDs parallèles', 'حساب الجهود · فخ LEDs على التوازي', 'Voltage Calculation · Parallel LEDs Trap'),
      summaryEquation: p.separateLedResistors
        ? `2 branches indépendantes : U_R1 = ${sim.u1.toFixed(2)} V · U_R2 = ${sim.u2.toFixed(2)} V`
        : `Nœud A bloqué à V_F(min) = ${sim.vA.toFixed(2)} V < ${p.vfLed2.toFixed(1)} V (LED2 éteinte)`,
      steps: [
        {
          label: tr(lang, '1. Potentiel au nœud A des anodes', '1. الجهد عند العقدة A للمصابيح', '1. Shared anode node V_A'),
          formula: p.separateLedResistors ? 'Chaque branche isolée à +E₁' : 'V_A = min(V_F1, V_F2)',
          substitution: p.separateLedResistors ? `Bus à ${p.e1.toFixed(2)} V` : `min(${p.vfLed1.toFixed(1)} V, ${p.vfLed2.toFixed(1)} V)`,
          result: `${sim.vA.toFixed(2)} V`,
          tone: p.separateLedResistors ? 'emerald' : 'rose',
        },
        {
          label: tr(lang, '2. Chute sur la/les résistance(s)', '2. الهبوط على المقاومة/المقاومات', '2. Resistor voltage drop'),
          formula: p.separateLedResistors ? 'U_R1 = E₁ − V_F1  ·  U_R2 = E₁ − V_F2' : 'U_R1 = E₁ − V_A',
          substitution: p.separateLedResistors
            ? `${p.e1.toFixed(1)} − ${p.vfLed1.toFixed(1)} = ${sim.u1.toFixed(2)} V | ${p.e1.toFixed(1)} − ${p.vfLed2.toFixed(1)} = ${sim.u2.toFixed(2)} V`
            : `${p.e1.toFixed(2)} V − ${sim.vA.toFixed(2)} V`,
          result: p.separateLedResistors ? `${sim.u1.toFixed(2)} / ${sim.u2.toFixed(2)} V` : `${sim.u1.toFixed(2)} V`,
          tone: 'amber',
        },
        {
          label: tr(lang, '3. Répartition des courants LED1 / LED2', '3. توزع التيار بين LED1 و LED2', '3. Resulting LED1 / LED2 currents'),
          formula: 'I_LED = U_R / R',
          substitution: `LED1 (${p.vfLed1} V) vs LED2 (${p.vfLed2} V)`,
          result: `${sim.i1MA.toFixed(1)} mA / ${sim.i2MA.toFixed(1)} mA`,
          tone: 'sky',
        },
      ],
    };
  }

  if (top === 'two-mesh-millman') {
    const gSum = 1 / p.r1 + 1 / p.r2 + 1 / p.r3;
    const num = p.e1 / p.r1 + p.e2 / p.r2;
    return {
      headerTitle: tr(lang, 'Calcul des tensions · Théorème de Millman (2 Mailles)', 'حساب الجهود · مبرهنة ميلمان (حلقتين)', 'Voltage Calculation · Millman 2-Mesh Solver'),
      summaryEquation: `M1: +${p.e1.toFixed(1)} − (${sim.u1.toFixed(2)}) − ${sim.u3.toFixed(2)} = 0  |  M2: +${p.e2.toFixed(1)} − (${sim.u2.toFixed(2)}) − ${sim.u3.toFixed(2)} = 0`,
      steps: [
        {
          label: tr(lang, '1. Potentiel central V_A (Théorème de Millman)', '1. جهد العقدة الوسطى V_A (ميلمان)', '1. Central node V_A via Millman'),
          formula: 'V_A = (E₁/R₁ + E₂/R₂) / (1/R₁ + 1/R₂ + 1/R₃)',
          substitution: `${(num * 1000).toFixed(2)} mA / ${(gSum * 1000).toFixed(3)} mS`,
          result: `${sim.vA.toFixed(2)} V`,
          tone: 'emerald',
        },
        {
          label: tr(lang, '2. Tension signée sur R₁ (U₁ = E₁ − V_A)', '2. فرق الجهد على R₁ (U₁ = E₁ − V_A)', '2. Drop across R₁ (U₁ = E₁ − V_A)'),
          formula: 'U₁ = E₁ − V_A',
          substitution: `${p.e1.toFixed(2)} V − ${sim.vA.toFixed(2)} V`,
          result: `${sim.u1.toFixed(2)} V`,
          tone: 'amber',
        },
        {
          label: tr(lang, '3. Tension signée sur R₂ (U₂ = E₂ − V_A)', '3. فرق الجهد على R₂ (U₂ = E₂ − V_A)', '3. Drop across R₂ (U₂ = E₂ − V_A)'),
          formula: 'U₂ = E₂ − V_A',
          substitution: `${p.e2.toFixed(2)} V − ${sim.vA.toFixed(2)} V`,
          result: `${sim.u2.toFixed(2)} V`,
          tone: 'sky',
        },
      ],
    };
  }

  if (top === 'wheatstone-bridge') {
    const dv = sim.vA - sim.vB;
    return {
      headerTitle: tr(lang, 'Calcul des tensions · Pont de Wheatstone', 'حساب الجهود · جسر ويتستون', 'Voltage Calculation · Wheatstone Bridge'),
      summaryEquation: `ΔV_AB = V_A (${sim.vA.toFixed(2)} V) − V_B (${sim.vB.toFixed(2)} V) = ${dv.toFixed(2)} V`,
      steps: [
        {
          label: tr(lang, '1. Potentiel bras gauche V_A', '1. جهد الذراع الأيسر V_A', '1. Left arm potential V_A'),
          formula: 'V_A ≈ E₁ × R₂ / (R₁ + R₂)',
          substitution: `${p.e1.toFixed(1)} × ${p.r2} / (${p.r1} + ${p.r2})`,
          result: `${sim.vA.toFixed(2)} V`,
          tone: 'sky',
        },
        {
          label: tr(lang, '2. Potentiel bras droit V_B', '2. جهد الذراع الأيمن V_B', '2. Right arm potential V_B'),
          formula: 'V_B ≈ E₁ × R_L / (R₃ + R_L)',
          substitution: `${p.e1.toFixed(1)} × ${p.rLoad} / (${p.r3} + ${p.rLoad})`,
          result: `${sim.vB.toFixed(2)} V`,
          tone: 'amber',
        },
        {
          label: tr(lang, '3. Tension différentielle du pont ΔV_AB', '3. فرق الجهد التفاضلي ΔV_AB', '3. Differential bridge voltage ΔV_AB'),
          formula: 'ΔV_AB = V_A − V_B',
          substitution: `${sim.vA.toFixed(2)} V − ${sim.vB.toFixed(2)} V`,
          result: `${dv.toFixed(2)} V`,
          tone: sim.balancedBridge ? 'emerald' : 'rose',
        },
      ],
    };
  }

  if (top === 'internal-resistance') {
    return {
      headerTitle: tr(lang, 'Calcul des tensions · Pile avec résistance interne r_i', 'حساب الجهود · البطارية والمقاومة الداخلية r_i', 'Voltage Calculation · Battery Internal r_i'),
      summaryEquation: `E (${p.e1.toFixed(2)} V) = r_i·I (${sim.uInternal.toFixed(2)} V) + V_bornes (${sim.uLoad.toFixed(2)} V)`,
      steps: [
        {
          label: tr(lang, '1. Courant tiré par la charge', '1. التيار المسحوب عبر الحمل', '1. Load current drawn'),
          formula: 'I = E / (r_i + R_L)',
          substitution: p.loadConnected ? `${p.e1.toFixed(1)} V / (${p.rInternal.toFixed(1)} + ${p.rLoad} Ω)` : 'Charge débranchée',
          result: `${sim.iTotalMA.toFixed(1)} mA`,
          tone: 'sky',
        },
        {
          label: tr(lang, '2. Chute interne perdue dans la pile (u_ri)', '2. الهبوط المفقود داخل البطارية (u_ri)', '2. Internal battery sag (u_ri = r_i · I)'),
          formula: 'u_ri = r_i · I',
          substitution: `${p.rInternal.toFixed(1)} Ω × ${(sim.iTotalMA / 1000).toFixed(3)} A`,
          result: `${sim.uInternal.toFixed(2)} V`,
          tone: 'rose',
        },
        {
          label: tr(lang, '3. Tension réelle aux bornes (V_bornes)', '3. الجهد الطرفي الفعلي (V_bornes)', '3. Loaded terminal voltage V_term'),
          formula: 'V_bornes = E − r_i · I',
          substitution: `${p.e1.toFixed(2)} V − ${sim.uInternal.toFixed(2)} V`,
          result: `${sim.uLoad.toFixed(2)} V`,
          tone: 'emerald',
        },
      ],
    };
  }

  // CH 9: THÉVENIN EQUIVALENT ('thevenin-equiv')
  const isDual = p.exampleId === 'thevenin-dual-mesh';
  return {
    headerTitle: tr(lang, 'Calcul des tensions · Modèle de Thévenin (E_th, R_th)', 'حساب الجهود · نموذج ثيفنان المكافئ (E_th, R_th)', 'Voltage Calculation · Thévenin Equivalent (E_th, R_th)'),
    summaryEquation: `E_th (${sim.eTh.toFixed(2)} V) = R_th·I_L (${sim.u3.toFixed(2)} V) + V_L (${sim.uLoad.toFixed(2)} V)`,
    steps: [
      {
        label: tr(lang, '1. Tension de Thévenin à vide E_th (R_L retirée)', '1. جهد ثيفنان عند الفراغ E_th', '1. Open-circuit Thévenin EMF E_th'),
        formula: isDual ? 'E_th = (E₁/R₁ + E₂/R₂) / (1/R₁ + 1/R₂)' : 'E_th = E₁ × R₂ / (R₁ + R₂)',
        substitution: isDual
          ? `(${p.e1.toFixed(1)}/${p.r1} + ${p.e2.toFixed(1)}/${p.r2}) / (1/${p.r1} + 1/${p.r2})`
          : `${p.e1.toFixed(1)} × ${p.r2} / (${p.r1} + ${p.r2})`,
        result: `${sim.eTh.toFixed(2)} V`,
        tone: 'emerald',
      },
      {
        label: tr(lang, '2. Résistance équivalente R_th (sources éteintes)', '2. المقاومة المكافئة R_th (إطفاء المصادر)', '2. Equivalent resistance R_th (sources shorted)'),
        formula: 'R_th = (R₁ × R₂) / (R₁ + R₂)',
        substitution: `(${p.r1} × ${p.r2}) / (${p.r1} + ${p.r2})  →  I_N = ${sim.iNortonMA.toFixed(2)} mA`,
        result: `${fmtR(sim.rTh)}`,
        tone: 'sky',
      },
      {
        label: tr(lang, '3. Tension réelle aux bornes de la charge V_L', '3. جهد الحمل الفعلي V_L', '3. Load terminal voltage V_L'),
        formula: p.loadConnected ? 'V_L = E_th × R_L / (R_th + R_L)' : 'V_L = E_th (à vide)',
        substitution: p.loadConnected
          ? `${sim.eTh.toFixed(2)} × ${p.rLoad} / (${sim.rTh.toFixed(0)} + ${p.rLoad})`
          : 'Bornes A–B ouvertes',
        result: `${sim.uLoad.toFixed(2)} V`,
        tone: 'amber',
      },
    ],
  };
}
