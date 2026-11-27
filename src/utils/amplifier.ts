import type { SimParams } from './physics';

/**
 * Chapitre 10 — Amplification de tension.
 *
 * Étage à émetteur commun résolu avec la vraie caractéristique exponentielle du transistor :
 *   I_C = I_C0 · exp(Δv_BE / V_T),   v_in = Δv_BE + (R_E/α)·(I_C − I_C0)
 * Le gain petit-signal A_v = −α·R_C / (r_e + R_E), avec r_e = V_T / I_C0, en est la linéarisation.
 * Les distorsions (harmoniques, écrêtage aux rails) ressortent donc de la physique, pas d'un artifice.
 *
 * Le pré-ampli à contre-réaction du livre (p. 60) est modélisé par la formule du gain en boucle fermée
 * A_cl = 1 / (β_fb + 1/A_ol) avec β_fb = R_E/(R_E + R_F) — A_ol (gain en boucle ouverte) est une
 * hypothèse de modélisation : le livre ne la donne pas.
 */

/** Tension thermique kT/q à 300 K (V). */
export const VT = 0.02585;
/** Gain en boucle ouverte supposé du couple direct BC547 + BC557 (hypothèse de modélisation). */
export const PREAMP_OPEN_LOOP_GAIN = 5000;
const VCE_SAT_AMP = 0.2;
const ALPHA_BETA = 200;
const SAMPLES = 256;

export type AmpMode = 'ce' | 'degen' | 'preamp';

export interface AmpParams {
  mode: AmpMode;
  vcc: number; // V
  rcOhm: number;
  reOhm: number; // résistance d'émetteur (0 = aucune)
  rfOhm: number; // contre-réaction (préampli uniquement)
  icQuiescentA: number; // courant collecteur au repos
  vinPeakV: number; // amplitude crête du signal d'entrée
}

export interface AmpResult {
  mode: AmpMode;
  vcc: number;
  rcOhm: number;
  reOhm: number;
  rfOhm: number;
  icA: number; // courant de repos (A)
  reIntOhm: number; // r_e = V_T / I_C
  vc0: number; // tension de repos du collecteur / de la sortie (V)
  headroomUp: number; // excursion positive possible (V)
  headroomDown: number; // excursion négative possible (V)
  avSmallSignal: number; // gain linéarisé, négatif = sortie inversée
  avMeasured: number; // crête-à-crête sortie / crête-à-crête entrée (signe du gain)
  gainDb: number; // 20·log10|A_v mesuré|
  voutPeakV: number; // amplitude crête de la sortie (V, composante alternative)
  clipped: boolean;
  thdPercent: number;
  maxCleanVinV: number; // entrée max avant écrêtage rails (approx. petit signal)
  /** Échantillons sur une période : entrée et sortie (composantes alternatives, V). */
  vin: number[];
  vout: number[];
}

export const AMP_DEFAULTS: Record<string, { icUA: number; vinMV: number; re: number; rf: number }> = {
  'ce-gain': { icUA: 114, vinMV: 5, re: 0, rf: 10000 },
  'emitter-degeneration': { icUA: 400, vinMV: 20, re: 100, rf: 10000 },
  'book-preamp': { icUA: 400, vinMV: 5, re: 100, rf: 10000 },
};

/** Construit les paramètres du modèle à partir des paramètres de simulation de l'appli. */
export function ampParamsFromSim(p: SimParams): AmpParams {
  const d = AMP_DEFAULTS[p.exampleId] ?? AMP_DEFAULTS['ce-gain'];
  const icUA = p.ampIcUA ?? d.icUA;
  const vinMV = p.ampVinMV ?? d.vinMV;
  const re = p.ampRe ?? d.re;
  const rf = p.ampRf ?? d.rf;
  if (p.exampleId === 'emitter-degeneration') {
    return { mode: 'degen', vcc: 9, rcOhm: 10000, reOhm: re, rfOhm: rf, icQuiescentA: icUA * 1e-6, vinPeakV: vinMV / 1000 };
  }
  if (p.exampleId === 'book-preamp') {
    return { mode: 'preamp', vcc: 9, rcOhm: 10000, reOhm: re, rfOhm: rf, icQuiescentA: icUA * 1e-6, vinPeakV: vinMV / 1000 };
  }
  return { mode: 'ce', vcc: 5, rcOhm: 22000, reOhm: 0, rfOhm: rf, icQuiescentA: icUA * 1e-6, vinPeakV: vinMV / 1000 };
}

/** Résout Δv_BE/V_T = x pour une entrée v_in donnée (Newton sur une fonction monotone). */
function solveX(vin: number, k: number, xStart: number): number {
  let x = xStart;
  for (let i = 0; i < 40; i++) {
    const ex = Math.exp(Math.min(x, 40));
    const f = VT * x + k * (ex - 1) - vin;
    const df = VT + k * ex;
    let step = f / df;
    // Amortissement : jamais plus de 3 unités de V_T par itération
    step = Math.max(-3, Math.min(3, step));
    x -= step;
    if (Math.abs(step) < 1e-10) break;
  }
  return x;
}

function thd(samples: number[]): number {
  const n = samples.length;
  const mean = samples.reduce((a, b) => a + b, 0) / n;
  const harm = (h: number) => {
    let re = 0;
    let im = 0;
    for (let i = 0; i < n; i++) {
      const a = (2 * Math.PI * h * i) / n;
      re += (samples[i] - mean) * Math.cos(a);
      im += (samples[i] - mean) * Math.sin(a);
    }
    return (2 / n) * Math.hypot(re, im);
  };
  const f1 = harm(1);
  if (f1 < 1e-12) return 0;
  let sq = 0;
  for (let h = 2; h <= 9; h++) sq += harm(h) ** 2;
  return (Math.sqrt(sq) / f1) * 100;
}

export function computeAmplifier(p: AmpParams): AmpResult {
  const vin: number[] = [];
  const vout: number[] = [];
  let avSmall: number;
  let vc0: number;
  let headUp: number;
  let headDown: number;
  let ic0 = p.icQuiescentA;
  let reInt = VT / Math.max(1e-9, ic0);
  let clipped = false;
  let swing: number[];

  if (p.mode === 'preamp') {
    // Couple direct, sortie centrée à mi-tension d'alimentation
    const beta = p.reOhm / (p.reOhm + p.rfOhm);
    const acl = 1 / (beta + 1 / PREAMP_OPEN_LOOP_GAIN);
    avSmall = acl; // non inverseuse : le signal entre sur la base de Q1, la boucle ramène sur son émetteur
    vc0 = p.vcc / 2;
    headUp = p.vcc / 2 - 0.5;
    headDown = p.vcc / 2 - 0.5;
    ic0 = p.icQuiescentA;
    reInt = VT / Math.max(1e-9, ic0);
    swing = [];
    for (let i = 0; i < SAMPLES; i++) {
      const vi = p.vinPeakV * Math.sin((2 * Math.PI * i) / SAMPLES);
      const lin = acl * vi;
      // Écrêtage doux aux rails : tanh, tangente unité à l'origine
      const vo = headUp * Math.tanh(lin / headUp);
      if (Math.abs(lin) > headUp * 0.98) clipped = true;
      vin.push(vi);
      vout.push(vo);
      swing.push(vo);
    }
  } else {
    const alpha = ALPHA_BETA / (ALPHA_BETA + 1);
    const k = (p.reOhm * ic0) / alpha;
    avSmall = (-alpha * p.rcOhm) / (reInt + p.reOhm);
    vc0 = p.vcc - ic0 * p.rcOhm;
    const vFloor = VCE_SAT_AMP + (p.reOhm * ic0) / alpha;
    headUp = p.vcc - vc0;
    headDown = Math.max(0, vc0 - vFloor);
    swing = [];
    let x = 0;
    for (let i = 0; i < SAMPLES; i++) {
      const vi = p.vinPeakV * Math.sin((2 * Math.PI * i) / SAMPLES);
      x = solveX(vi, k, x);
      const ic = ic0 * Math.exp(Math.min(x, 40));
      let vc = p.vcc - ic * p.rcOhm;
      const vFloorNow = VCE_SAT_AMP + (p.reOhm * ic) / alpha;
      if (vc > p.vcc) vc = p.vcc;
      if (vc < vFloorNow) {
        vc = vFloorNow;
        clipped = true;
      }
      if (ic * p.rcOhm >= p.vcc * 0.999) clipped = true;
      const vo = vc - vc0;
      vin.push(vi);
      vout.push(vo);
      swing.push(vo);
    }
  }

  const maxOut = Math.max(...vout);
  const minOut = Math.min(...vout);
  const vinPP = 2 * p.vinPeakV;
  const outPP = maxOut - minOut;
  const sign = avSmall < 0 ? -1 : 1;
  const avMeasured = vinPP > 0 ? sign * (outPP / vinPP) : avSmall;
  const gainDb = 20 * Math.log10(Math.max(1e-6, Math.abs(avMeasured)));
  const vOutPeak = Math.max(Math.abs(maxOut), Math.abs(minOut));
  const maxClean = Math.min(headUp, headDown) / Math.max(1e-9, Math.abs(avSmall));

  return {
    mode: p.mode,
    vcc: p.vcc,
    rcOhm: p.rcOhm,
    reOhm: p.reOhm,
    rfOhm: p.rfOhm,
    icA: ic0,
    reIntOhm: reInt,
    vc0,
    headroomUp: headUp,
    headroomDown: headDown,
    avSmallSignal: avSmall,
    avMeasured,
    gainDb,
    voutPeakV: vOutPeak,
    clipped,
    thdPercent: thd(swing),
    maxCleanVinV: maxClean,
    vin,
    vout,
  };
}
