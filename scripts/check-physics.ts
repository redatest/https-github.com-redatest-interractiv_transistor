// Contrôles de cohérence des modèles. Lancer : npm run check:physics
import { computeCatalogSimulation, createDefaultSimParams, R_220, VLED, VS_9V } from '../src/utils/physics';
import { computeMosfetSimulation, createDefaultMosfetParams, FET_SPECS, MosfetModelId, solveFetDc } from '../src/utils/mosfetPhysics';

let failures = 0;
const check = (name: string, ok: boolean, detail = '') => {
  if (!ok) failures++;
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
};

// 1. BJT : loi des mailles V_cc = V_LED + R·I_C + V_CE sur toute la plage de pression (circuit le plus simple)
for (const vs of [6, 9]) {
  let worst = 0;
  for (let pr = 0; pr <= 100; pr += 5) {
    const sim = computeCatalogSimulation(createDefaultSimParams({ catalogId: 'worlds-simplest', pressure: pr, supplySelect6or9: vs as 6 | 9 }));
    const residual = Math.abs(vs - VLED - (sim.icMA / 1000) * R_220 - sim.vce);
    worst = Math.max(worst, residual);
  }
  check(`KVL BJT ${vs} V`, worst < 1e-9, `résidu max ${worst.toExponential(2)} V`);
}

// 2. MOSFET : le modèle à température fixe (25 °C) est continu en V_GS, y compris à la frontière saturation/triode
for (const model of ['irf540n', 'irlz44n', '2n7000'] as MosfetModelId[]) {
  let maxJump = 0;
  let prevId = 0;
  let regimes = new Set<string>();
  // On part à V_ov = 0,2 V : juste au-dessus du seuil, I_D ∝ V_ov² varie naturellement très vite.
  for (let v = FET_SPECS[model].vth + 0.2; v <= 12; v += 0.01) {
    const op = solveFetDc(FET_SPECS[model], v, 12, 3, 25);
    regimes.add(op.region);
    if (prevId > 0) maxJump = Math.max(maxJump, Math.abs(op.idA - prevId) / prevId);
    prevId = op.idA;
  }
  check(`Continuité I_D(V_GS) ${model} (25 °C)`, maxJump < 0.2, `saut relatif max par pas de 10 mV = ${(maxJump * 100).toFixed(1)} % ; régimes : ${[...regimes].join(', ')}`);
}

// 3. MOSFET ch.2 : cohérence de la droite de charge, V_DS + R_L·I_D = 12 V
{
  const rl = 12 / 4;
  const s = computeMosfetSimulation(createDefaultMosfetParams({ chapterId: 2, exampleId: 'x', fetModel: 'irlz44n', vgs: 5, loadCurrentA: 4 }));
  check('Droite de charge IRLZ44N 5 V', Math.abs(s.vds + rl * s.idA - 12) < 1e-6, `V_DS=${s.vds.toFixed(3)} V, I_D=${s.idA.toFixed(2)} A, R_DS=${(s.rdsOhms * 1000).toFixed(1)} mΩ`);
}

// 4. Cas pédagogique : l'IRF540N sous 5 V ne doit pas être « sain », l'IRLZ44N si
{
  const a = computeMosfetSimulation(createDefaultMosfetParams({ chapterId: 2, exampleId: 'x', fetModel: 'irf540n', vgs: 5, loadCurrentA: 4 }));
  const b = computeMosfetSimulation(createDefaultMosfetParams({ chapterId: 2, exampleId: 'x', fetModel: 'irlz44n', vgs: 5, loadCurrentA: 4 }));
  check('IRF540N @5 V en difficulté', a.tempC > 95 && a.region !== 'ohmic', `${a.region}, ${Math.round(a.tempC)} °C, I_D=${a.idA.toFixed(2)} A`);
  check('IRLZ44N @5 V sain', b.tempC < 80 && b.region === 'ohmic', `${b.region}, ${Math.round(b.tempC)} °C`);
}

void VS_9V;
process.exit(failures ? 1 : 0);
