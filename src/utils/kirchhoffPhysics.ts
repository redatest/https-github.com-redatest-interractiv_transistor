export type KirchhoffTopology =
  | 'series-2r'
  | 'series-3r'
  | 'loaded-divider'
  | 'dual-sources'
  | 'parallel-2'
  | 'parallel-3'
  | 'led-series-kvl'
  | 'led-parallel-trap'
  | 'two-mesh-millman'
  | 'wheatstone-bridge'
  | 'internal-resistance';

export type KirchhoffFaultMode = 'none' | 'open' | 'short';

export interface KirchhoffSimParams {
  chapterId: number;
  exampleId: string;
  catalogId?: string;
  topology: KirchhoffTopology;
  e1: number; // Main supply voltage (V)
  e2: number; // Secondary supply voltage (V)
  secondSourceOpposing: boolean; // True = opposing polarity in loop
  r1: number; // Branch / top resistor (Ohms)
  r2: number; // Branch / bottom resistor (Ohms)
  r3: number; // Center / 3rd branch resistor (Ohms)
  rLoad: number; // Load / bridge sensor resistor (Ohms)
  rInternal: number; // Battery internal resistance ri (Ohms)
  loadConnected: boolean; // Connect load across output node
  separateLedResistors: boolean; // False = parallel LED trap sharing R1
  vfLed1: number; // Forward voltage of LED1 (e.g. 1.9V Red)
  vfLed2: number; // Forward voltage of LED2 (e.g. 3.1V Blue)
  faultMode: KirchhoffFaultMode; // 'none' | 'open' | 'short'
}

export interface KirchhoffSimReadout {
  topology: KirchhoffTopology;
  // Node potentials relative to GND (0V)
  vPlus: number;
  vA: number;
  vB: number;
  vOut: number;
  // Element voltage drops (signed along loop convention)
  u1: number;
  u2: number;
  u3: number;
  uLoad: number;
  uInternal: number;
  // Branch currents in mA
  iTotalMA: number;
  i1MA: number;
  i2MA: number;
  i3MA: number;
  iLoadMA: number;
  iBridgeMA: number;
  // Law verification residuals (must be ~0.00)
  kvlLoop1ResidualV: number;
  kvlLoop2ResidualV: number;
  kclNodeResidualMA: number;
  // Power & efficiency
  totalPowerMW: number;
  loadPowerMW: number;
  efficiencyPct: number;
  // Diagnostic & status flags
  faultActive: KirchhoffFaultMode;
  overloadWarning: boolean;
  balancedBridge: boolean;
  led1Lit: boolean;
  led2Lit: boolean;
  statusFr: string;
  statusAr: string;
  statusEn: string;
  warningFr?: string;
  warningAr?: string;
  warningEn?: string;
}

export function createDefaultKirchhoffParams(
  overrides: Partial<KirchhoffSimParams> = {}
): KirchhoffSimParams {
  return {
    chapterId: 1,
    exampleId: 'kvl-2r-loop',
    topology: 'series-2r',
    e1: 9.0,
    e2: 4.5,
    secondSourceOpposing: true,
    r1: 1000,
    r2: 2000,
    r3: 1500,
    rLoad: 1000,
    rInternal: 2.0,
    loadConnected: true,
    separateLedResistors: false,
    vfLed1: 1.9,
    vfLed2: 3.1,
    faultMode: 'none',
    ...overrides,
  };
}

export function computeKirchhoffSimulation(params: KirchhoffSimParams): KirchhoffSimReadout {
  const e1 = Math.max(0.5, params.e1);
  const e2 = Math.max(0, params.e2);
  const r1 = Math.max(10, params.r1);
  const r2 = Math.max(10, params.r2);
  const r3 = Math.max(10, params.r3);
  const rLoad = Math.max(10, params.rLoad);
  const ri = Math.max(0.1, params.rInternal);

  let vPlus = e1;
  let vA = 0;
  let vB = 0;
  let vOut = 0;
  let u1 = 0;
  let u2 = 0;
  let u3 = 0;
  let uLoad = 0;
  let uInternal = 0;
  let iTotalMA = 0;
  let i1MA = 0;
  let i2MA = 0;
  let i3MA = 0;
  let iLoadMA = 0;
  let iBridgeMA = 0;
  let kvlLoop1ResidualV = 0;
  let kvlLoop2ResidualV = 0;
  let kclNodeResidualMA = 0;
  let totalPowerMW = 0;
  let loadPowerMW = 0;
  let efficiencyPct = 100;
  let overloadWarning = false;
  let balancedBridge = false;
  let led1Lit = false;
  let led2Lit = false;
  let statusFr = '';
  let statusAr = '';
  let statusEn = '';
  let warningFr: string | undefined;
  let warningAr: string | undefined;
  let warningEn: string | undefined;

  switch (params.topology) {
    case 'series-2r': {
      if (params.faultMode === 'open') {
        iTotalMA = 0;
        i1MA = 0;
        i2MA = 0;
        u1 = 0;
        u2 = e1; // Full source voltage appears across the open break!
        vA = e1;
        vOut = e1;
        kvlLoop1ResidualV = e1 - u1 - u2;
        statusFr = `Circuit ouvert sur R₂ : I = 0 mA, toute la tension (${e1.toFixed(1)} V) apparaît aux bornes de la coupure.`;
        statusAr = `دارة مفتوحة عند R₂: التيار = 0 mA، وكامل الجهد (${e1.toFixed(1)} V) يظهر على طرفي القطع.`;
        statusEn = `Open fault on R₂: I = 0 mA, full supply (${e1.toFixed(1)} V) appears across the break.`;
        warningFr = `Piège classique : un circuit ouvert ne donne pas 0 V partout, il bloque le courant et prend toute la tension E₁ !`;
        warningAr = `تنبيه: القطع لا يجعل الجهد صفراً في كل مكان؛ بل يمنع التيار ويحمل كامل جهد البطارية!`;
        warningEn = `Classic diagnostic rule: an open branch carries 0 mA and drops the entire loop EMF E₁!`;
      } else if (params.faultMode === 'short') {
        const iA = e1 / r1;
        iTotalMA = iA * 1000;
        i1MA = iTotalMA;
        i2MA = iTotalMA;
        u1 = e1;
        u2 = 0; // Shorted component has 0 V across it
        vA = 0;
        vOut = 0;
        totalPowerMW = e1 * iTotalMA;
        kvlLoop1ResidualV = e1 - u1 - u2;
        overloadWarning = iTotalMA > 45;
        statusFr = `Court-circuit sur R₂ : U₂ = 0,00 V, donc U₁ absorbe toute la source (${u1.toFixed(2)} V).`;
        statusAr = `قصر على R₂: الجهد U₂ = 0.00 V، لذلك تتحمل R₁ كامل الجهد (${u1.toFixed(2)} V).`;
        statusEn = `Short across R₂: U₂ = 0.00 V, forcing R₁ to drop the entire ${u1.toFixed(2)} V supply.`;
        warningFr = `En court-circuit sur R₂, V_A chute à 0 V et le courant I = E₁/R₁ augmente fortement (${iTotalMA.toFixed(1)} mA).`;
        warningAr = `عند قصر R₂ يهبط جهد النقطة A إلى 0V ويرتفع التيار إلى ${iTotalMA.toFixed(1)} mA.`;
        warningEn = `With R₂ shorted, V_A collapses to 0 V and current surges to E₁/R₁ = ${iTotalMA.toFixed(1)} mA.`;
      } else {
        const iA = e1 / (r1 + r2);
        iTotalMA = iA * 1000;
        i1MA = iTotalMA;
        i2MA = iTotalMA;
        u1 = iA * r1;
        u2 = iA * r2;
        vA = u2;
        vOut = u2;
        totalPowerMW = e1 * iTotalMA;
        loadPowerMW = u2 * iTotalMA;
        efficiencyPct = (u2 / e1) * 100;
        kvlLoop1ResidualV = e1 - u1 - u2;
        statusFr = `Maille fermée : E₁ (${e1.toFixed(2)} V) = U₁ (${u1.toFixed(2)} V) + U₂ (${u2.toFixed(2)} V).`;
        statusAr = `حلقة مغلقة: E₁ (${e1.toFixed(2)} V) = U₁ (${u1.toFixed(2)} V) + U₂ (${u2.toFixed(2)} V).`;
        statusEn = `Closed loop: E₁ (${e1.toFixed(2)} V) = U₁ (${u1.toFixed(2)} V) + U₂ (${u2.toFixed(2)} V).`;
      }
      break;
    }

    case 'series-3r': {
      if (params.faultMode === 'open') {
        iTotalMA = 0;
        u1 = 0;
        u2 = 0;
        u3 = e1;
        vA = e1;
        vB = e1;
        vOut = e1;
        kvlLoop1ResidualV = e1 - u1 - u2 - u3;
        statusFr = `Rupture sur R₃ : I = 0 mA, U₁ = 0 V, U₂ = 0 V et U₃ = ${e1.toFixed(2)} V.`;
        statusAr = `قطع في R₃: التيار = 0 mA، وبالتالي U₁ = U₂ = 0V و U₃ = ${e1.toFixed(2)} V.`;
        statusEn = `Open fault at R₃: I = 0 mA, U₁ = 0 V, U₂ = 0 V, U₃ = ${e1.toFixed(2)} V.`;
      } else if (params.faultMode === 'short') {
        const iA = e1 / (r1 + r2);
        iTotalMA = iA * 1000;
        i1MA = iTotalMA;
        i2MA = iTotalMA;
        i3MA = iTotalMA;
        u1 = iA * r1;
        u2 = iA * r2;
        u3 = 0;
        vA = e1 - u1;
        vB = 0;
        vOut = 0;
        totalPowerMW = e1 * iTotalMA;
        kvlLoop1ResidualV = e1 - u1 - u2 - u3;
        statusFr = `Court-circuit sur R₃ : U₃ = 0 V, la tension se répartit sur R₁ + R₂ seulement.`;
        statusAr = `قصر على R₃: الجهد U₃ = 0 V، ويتوزع الجهد على R₁ و R₂ فقط.`;
        statusEn = `Short on R₃: U₃ = 0 V, source divides across R₁ + R₂ only.`;
      } else {
        const rTot = r1 + r2 + r3;
        const iA = e1 / rTot;
        iTotalMA = iA * 1000;
        i1MA = iTotalMA;
        i2MA = iTotalMA;
        i3MA = iTotalMA;
        u1 = iA * r1;
        u2 = iA * r2;
        u3 = iA * r3;
        vA = e1 - u1;
        vB = u3;
        vOut = u3;
        totalPowerMW = e1 * iTotalMA;
        loadPowerMW = u3 * iTotalMA;
        efficiencyPct = (u3 / e1) * 100;
        kvlLoop1ResidualV = e1 - u1 - u2 - u3;
        statusFr = `KVL 3 dipôles : ${u1.toFixed(2)} V + ${u2.toFixed(2)} V + ${u3.toFixed(2)} V = ${e1.toFixed(2)} V.`;
        statusAr = `قانون الحلقات لـ3 مقاومات: ${u1.toFixed(2)} + ${u2.toFixed(2)} + ${u3.toFixed(2)} = ${e1.toFixed(2)} V.`;
        statusEn = `3-resistor KVL: ${u1.toFixed(2)} V + ${u2.toFixed(2)} V + ${u3.toFixed(2)} V = ${e1.toFixed(2)} V.`;
      }
      break;
    }

    case 'loaded-divider': {
      const rEq = params.loadConnected ? (r2 * rLoad) / (r2 + rLoad) : r2;
      const i1A = e1 / (r1 + rEq);
      vOut = i1A * rEq;
      vA = vOut;
      u1 = e1 - vOut;
      u2 = vOut;
      uLoad = params.loadConnected ? vOut : 0;
      i1MA = i1A * 1000;
      iTotalMA = i1MA;
      i2MA = (vOut / r2) * 1000;
      iLoadMA = params.loadConnected ? (vOut / rLoad) * 1000 : 0;
      kvlLoop1ResidualV = e1 - u1 - u2;
      kvlLoop2ResidualV = params.loadConnected ? u2 - uLoad : 0;
      kclNodeResidualMA = i1MA - i2MA - iLoadMA;
      totalPowerMW = e1 * iTotalMA;
      loadPowerMW = uLoad * iLoadMA;
      efficiencyPct = totalPowerMW > 0 ? (loadPowerMW / totalPowerMW) * 100 : 0;

      const unloadedV = e1 * (r2 / (r1 + r2));
      const sagPct = unloadedV > 0 ? ((unloadedV - vOut) / unloadedV) * 100 : 0;

      if (!params.loadConnected) {
        statusFr = `Pont diviseur à vide : V_out = ${vOut.toFixed(2)} V (I_charge = 0 mA).`;
        statusAr = `مقسّم الجهد دون حمل: V_out = ${vOut.toFixed(2)} V (تيار الحمل = 0 mA).`;
        statusEn = `Unloaded divider: V_out = ${vOut.toFixed(2)} V (I_load = 0 mA).`;
      } else {
        statusFr = `En charge (${rLoad} Ω) : V_out chute à ${vOut.toFixed(2)} V (−${sagPct.toFixed(0)} %), car I₁ = I₂ + I_L.`;
        statusAr = `تحت الحمل (${rLoad} Ω): يهبط الجهد إلى ${vOut.toFixed(2)} V (−${sagPct.toFixed(0)}%) لأن I₁ = I₂ + I_L.`;
        statusEn = `Loaded (${rLoad} Ω): V_out sags to ${vOut.toFixed(2)} V (−${sagPct.toFixed(0)}%) as I₁ splits into I₂ + I_L.`;
        if (sagPct > 20) {
          warningFr = `R_L (${rLoad} Ω) est trop faible face à R₂ (${r2} Ω) : le pont s’écroule de ${sagPct.toFixed(0)} % !`;
          warningAr = `مقاومة الحمل R_L (${rLoad} Ω) صغيرة جداً مقارنة بـ R₂ (${r2} Ω)، لذا ينهار الجهد بنسبة ${sagPct.toFixed(0)}% !`;
          warningEn = `Load R_L (${rLoad} Ω) is too low relative to R₂ (${r2} Ω), collapsing V_out by ${sagPct.toFixed(0)}%!`;
        }
      }
      break;
    }

    case 'dual-sources': {
      const e2Signed = params.secondSourceOpposing ? -e2 : e2;
      const eNet = e1 + e2Signed;
      const iA = eNet / (r1 + r2);
      iTotalMA = iA * 1000;
      i1MA = iTotalMA;
      i2MA = iTotalMA;
      u1 = iA * r1;
      u2 = iA * r2;
      vPlus = e1;
      vA = e1 - u1;
      vB = params.secondSourceOpposing ? e2 : -e2;
      vOut = vA;
      // KVL clockwise: +E1 - U1 - U2 (+E2 if aiding, -E2 if opposing) = 0
      kvlLoop1ResidualV = e1 - u1 - u2 + e2Signed;
      totalPowerMW = Math.abs(e1 * iTotalMA) + Math.abs(e2 * iTotalMA);
      loadPowerMW = Math.abs(u1 * iTotalMA) + Math.abs(u2 * iTotalMA);
      efficiencyPct = 100;

      if (Math.abs(eNet) < 0.05) {
        statusFr = `Équilibre parfait : E₁ (${e1.toFixed(1)} V) annule E₂ (${e2.toFixed(1)} V) → I = 0,00 mA.`;
        statusAr = `توازن تام: E₁ (${e1.toFixed(1)} V) تعادل E₂ (${e2.toFixed(1)} V) ← التيار = 0.00 mA.`;
        statusEn = `Exact balance: E₁ (${e1.toFixed(1)} V) cancels opposing E₂ (${e2.toFixed(1)} V) → I = 0.00 mA.`;
      } else if (iTotalMA < 0) {
        statusFr = `E₂ (${e2.toFixed(1)} V) domine E₁ (${e1.toFixed(1)} V) ! Le courant s’inverse (${iTotalMA.toFixed(2)} mA).`;
        statusAr = `المصدر E₂ (${e2.toFixed(1)} V) يتغلب على E₁ (${e1.toFixed(1)} V)! ينعكس التيار (${iTotalMA.toFixed(2)} mA).`;
        statusEn = `E₂ (${e2.toFixed(1)} V) overpowers E₁ (${e1.toFixed(1)} V) — current reverses (${iTotalMA.toFixed(2)} mA)!`;
        warningFr = `Sens inversé : E₂ recharge E₁ (ou circule à contre-sens) selon la somme algébrique des mailles.`;
        warningAr = `اتجاه معكوس: E₂ يدفع التيار عكس E₁ حسب المجموع الجبري للحلقة.`;
        warningEn = `Reversed current: algebraic KVL sum gives negative current flowing back into E₁.`;
      } else {
        statusFr = params.secondSourceOpposing
          ? `Sources en opposition : E_net = ${e1.toFixed(1)} − ${e2.toFixed(1)} = ${eNet.toFixed(1)} V → I = ${iTotalMA.toFixed(2)} mA.`
          : `Sources additives : E_net = ${e1.toFixed(1)} + ${e2.toFixed(1)} = ${eNet.toFixed(1)} V → I = ${iTotalMA.toFixed(2)} mA.`;
        statusAr = params.secondSourceOpposing
          ? `مصدران متعاكسان: المحصلة = ${e1.toFixed(1)} − ${e2.toFixed(1)} = ${eNet.toFixed(1)} V ← التيار = ${iTotalMA.toFixed(2)} mA.`
          : `مصدران متعاضدان: المحصلة = ${e1.toFixed(1)} + ${e2.toFixed(1)} = ${eNet.toFixed(1)} V ← التيار = ${iTotalMA.toFixed(2)} mA.`;
        statusEn = params.secondSourceOpposing
          ? `Opposing sources: E_net = ${e1.toFixed(1)} − ${e2.toFixed(1)} = ${eNet.toFixed(1)} V → I = ${iTotalMA.toFixed(2)} mA.`
          : `Aiding sources: E_net = ${e1.toFixed(1)} + ${e2.toFixed(1)} = ${eNet.toFixed(1)} V → I = ${iTotalMA.toFixed(2)} mA.`;
      }
      break;
    }

    case 'parallel-2': {
      if (params.faultMode === 'short') {
        const iShortA = e1 / 0.5;
        iTotalMA = iShortA * 1000;
        i1MA = 0;
        i2MA = iTotalMA;
        vA = 0;
        vOut = 0;
        u1 = 0;
        u2 = 0;
        overloadWarning = true;
        totalPowerMW = e1 * iTotalMA;
        statusFr = `Court-circuit en parallèle : V_A s’effondre à 0 V, le courant dévie vers la faute !`;
        statusAr = `قصر على التوازي: ينهار جهد العقدة A إلى 0V ويهرب كل التيار نحو القصر!`;
        statusEn = `Parallel short-circuit: node V_A collapses to 0 V and current surges through the fault!`;
        warningFr = `Contrairement au montage série, un court-circuit en parallèle prive TOUTES les autres branches de tension.`;
        warningAr = `في التوازي، القصر في فرع واحد يُسقط الجهد عن جميع الفروع الأخرى!`;
        warningEn = `In parallel networks, one shorted branch starves every parallel branch of voltage.`;
      } else {
        i1MA = (e1 / r1) * 1000;
        i2MA = params.faultMode === 'open' ? 0 : (e1 / r2) * 1000;
        iTotalMA = i1MA + i2MA;
        vA = e1;
        vOut = e1;
        u1 = e1;
        u2 = params.faultMode === 'open' ? 0 : e1;
        kvlLoop1ResidualV = e1 - u1;
        kvlLoop2ResidualV = params.faultMode === 'open' ? 0 : u1 - u2;
        kclNodeResidualMA = iTotalMA - i1MA - i2MA;
        totalPowerMW = e1 * iTotalMA;
        loadPowerMW = totalPowerMW;
        statusFr =
          params.faultMode === 'open'
            ? `Branche 2 coupée (I₂ = 0) : I₁ reste ${i1MA.toFixed(2)} mA et I_tot = I₁.`
            : `Nœud A (KCL) : I_tot (${iTotalMA.toFixed(2)} mA) = I₁ (${i1MA.toFixed(2)} mA) + I₂ (${i2MA.toFixed(2)} mA).`;
        statusAr =
          params.faultMode === 'open'
            ? `قطع في الفرع الثاني (I₂ = 0): يبقى I₁ = ${i1MA.toFixed(2)} mA دون تأثر.`
            : `العقدة A (قانون العقد): I_tot (${iTotalMA.toFixed(2)} mA) = I₁ (${i1MA.toFixed(2)} mA) + I₂ (${i2MA.toFixed(2)} mA).`;
        statusEn =
          params.faultMode === 'open'
            ? `Branch 2 open (I₂ = 0 mA): Branch 1 stays untouched at ${i1MA.toFixed(2)} mA.`
            : `Node A (KCL): I_tot (${iTotalMA.toFixed(2)} mA) = I₁ (${i1MA.toFixed(2)} mA) + I₂ (${i2MA.toFixed(2)} mA).`;
      }
      break;
    }

    case 'parallel-3': {
      i1MA = (e1 / r1) * 1000;
      i2MA = (e1 / r2) * 1000;
      i3MA = params.faultMode === 'open' ? 0 : (e1 / r3) * 1000;
      iTotalMA = i1MA + i2MA + i3MA;
      vA = e1;
      vOut = e1;
      u1 = e1;
      u2 = e1;
      u3 = params.faultMode === 'open' ? 0 : e1;
      kvlLoop1ResidualV = e1 - u1;
      kvlLoop2ResidualV = u1 - u2;
      kclNodeResidualMA = iTotalMA - i1MA - i2MA - i3MA;
      totalPowerMW = e1 * iTotalMA;
      loadPowerMW = totalPowerMW;
      statusFr = `Nœud à 3 branches : ${i1MA.toFixed(1)} + ${i2MA.toFixed(1)} + ${i3MA.toFixed(1)} = ${iTotalMA.toFixed(1)} mA.`;
      statusAr = `عقدة بثلاثة فروع: ${i1MA.toFixed(1)} + ${i2MA.toFixed(1)} + ${i3MA.toFixed(1)} = ${iTotalMA.toFixed(1)} mA.`;
      statusEn = `3-branch KCL junction: ${i1MA.toFixed(1)} + ${i2MA.toFixed(1)} + ${i3MA.toFixed(1)} = ${iTotalMA.toFixed(1)} mA.`;
      break;
    }

    case 'led-series-kvl': {
      const vfTot = params.vfLed1 + (params.loadConnected ? params.vfLed2 : 0);
      if (e1 <= vfTot) {
        iTotalMA = 0;
        i1MA = 0;
        u1 = 0;
        u2 = e1;
        vA = e1;
        vOut = e1;
        led1Lit = false;
        led2Lit = false;
        kvlLoop1ResidualV = e1 - u1 - u2;
        statusFr = `Tension E₁ (${e1.toFixed(1)} V) ≤ ∑V_F (${vfTot.toFixed(1)} V) : les LED restent bloquées (I = 0 mA).`;
        statusAr = `الجهد E₁ (${e1.toFixed(1)} V) ≤ مجموع V_F (${vfTot.toFixed(1)} V): تبقى المصابيح مطفأة (I = 0 mA).`;
        statusEn = `Supply E₁ (${e1.toFixed(1)} V) ≤ ∑V_F (${vfTot.toFixed(1)} V): LEDs do not reach forward threshold (I = 0 mA).`;
      } else {
        u1 = e1 - vfTot;
        u2 = vfTot;
        iTotalMA = (u1 / r1) * 1000;
        i1MA = iTotalMA;
        vA = vfTot;
        vOut = vfTot;
        led1Lit = iTotalMA >= 0.5;
        led2Lit = params.loadConnected && iTotalMA >= 0.5;
        kvlLoop1ResidualV = e1 - u1 - u2;
        totalPowerMW = e1 * iTotalMA;
        loadPowerMW = vfTot * iTotalMA;
        efficiencyPct = (vfTot / e1) * 100;
        overloadWarning = iTotalMA > 28;
        statusFr = `KVL LED : U_R = ${e1.toFixed(1)} − ${vfTot.toFixed(1)} = ${u1.toFixed(2)} V → I_LED = ${iTotalMA.toFixed(2)} mA.`;
        statusAr = `حلقة LED: U_R = ${e1.toFixed(1)} − ${vfTot.toFixed(1)} = ${u1.toFixed(2)} V ← التيار = ${iTotalMA.toFixed(2)} mA.`;
        statusEn = `LED KVL: U_R = ${e1.toFixed(1)} − ${vfTot.toFixed(1)} = ${u1.toFixed(2)} V → I_LED = ${iTotalMA.toFixed(2)} mA.`;
        if (overloadWarning) {
          warningFr = `Courant LED élevé (${iTotalMA.toFixed(1)} mA > 25 mA) : augmentez R₁ !`;
          warningAr = `تيار LED مرتفع جداً (${iTotalMA.toFixed(1)} mA > 25 mA): ارفع قيمة المقاومة R₁!`;
          warningEn = `High LED current (${iTotalMA.toFixed(1)} mA > 25 mA): increase series resistor R₁!`;
        }
      }
      break;
    }

    case 'led-parallel-trap': {
      const vf1 = params.vfLed1;
      const vf2 = params.vfLed2;
      if (!params.separateLedResistors) {
        // Both LEDs tied directly in parallel after R1: lower Vf clamps the node!
        const vfMin = Math.min(vf1, vf2);
        if (e1 <= vfMin) {
          vA = e1;
          iTotalMA = 0;
          i1MA = 0;
          i2MA = 0;
          u1 = 0;
        } else {
          vA = vfMin;
          u1 = e1 - vfMin;
          iTotalMA = (u1 / r1) * 1000;
          if (Math.abs(vf1 - vf2) < 0.08) {
            i1MA = iTotalMA * 0.55;
            i2MA = iTotalMA * 0.45;
            led1Lit = true;
            led2Lit = true;
          } else if (vf1 < vf2) {
            i1MA = iTotalMA;
            i2MA = 0;
            led1Lit = true;
            led2Lit = false;
          } else {
            i1MA = 0;
            i2MA = iTotalMA;
            led1Lit = false;
            led2Lit = true;
          }
        }
        vOut = vA;
        u2 = vA;
        u3 = vA;
        kvlLoop1ResidualV = e1 - u1 - vA;
        kclNodeResidualMA = iTotalMA - i1MA - i2MA;
        totalPowerMW = e1 * iTotalMA;
        overloadWarning = i1MA > 24 || i2MA > 24;
        statusFr = `Piège parallèle : la LED ${vf1 <= vf2 ? '1' : '2'} (${vfMin.toFixed(1)} V) verrouille V_A à ${vfMin.toFixed(1)} V et coupe l’autre !`;
        statusAr = `فخ التوازي: الثنائي الأقل جهداً (${vfMin.toFixed(1)} V) يثبّت جهد العقدة A ويحرم الآخر من الإضاءة!`;
        statusEn = `Parallel trap: lower-V_F LED (${vfMin.toFixed(1)} V) clamps V_A and starves the higher-V_F LED!`;
        warningFr = `Sans résistances séparées, V_A ne peut pas atteindre ${Math.max(vf1, vf2).toFixed(1)} V et tout le courant (${iTotalMA.toFixed(1)} mA) passe dans une seule LED !`;
        warningAr = `دون مقاومتي حماية منفصلتين يمر كامل التيار (${iTotalMA.toFixed(1)} mA) في LED واحدة فقط!`;
        warningEn = `Without separate resistors, V_A can never reach ${Math.max(vf1, vf2).toFixed(1)} V and one LED hogs all ${iTotalMA.toFixed(1)} mA!`;
      } else {
        // Two independent parallel branches each with its own resistor (r1 and r2)
        i1MA = e1 > vf1 ? ((e1 - vf1) / r1) * 1000 : 0;
        i2MA = e1 > vf2 ? ((e1 - vf2) / r2) * 1000 : 0;
        iTotalMA = i1MA + i2MA;
        led1Lit = i1MA >= 0.5;
        led2Lit = i2MA >= 0.5;
        vA = e1;
        vOut = e1;
        u1 = e1 > vf1 ? e1 - vf1 : 0;
        u2 = e1 > vf2 ? e1 - vf2 : 0;
        kclNodeResidualMA = iTotalMA - i1MA - i2MA;
        kvlLoop1ResidualV = e1 - u1 - (e1 > vf1 ? vf1 : e1);
        kvlLoop2ResidualV = e1 - u2 - (e1 > vf2 ? vf2 : e1);
        totalPowerMW = e1 * iTotalMA;
        statusFr = `2 mailles propres : LED1 = ${i1MA.toFixed(1)} mA (${vf1} V) · LED2 = ${i2MA.toFixed(1)} mA (${vf2} V).`;
        statusAr = `فرعان مستقلان: تيار LED1 = ${i1MA.toFixed(1)} mA وتيار LED2 = ${i2MA.toFixed(1)} mA.`;
        statusEn = `Independent branches: LED1 = ${i1MA.toFixed(1)} mA (${vf1} V) · LED2 = ${i2MA.toFixed(1)} mA (${vf2} V).`;
      }
      break;
    }

    case 'two-mesh-millman': {
      // Node A connects E1 via R1, E2 via R2, and GND via R3
      const g1 = 1 / r1;
      const g2 = 1 / r2;
      const g3 = params.faultMode === 'open' ? 0 : 1 / r3;
      vA = (e1 * g1 + e2 * g2) / (g1 + g2 + g3);
      vOut = vA;
      vB = e2;
      const i1A = (e1 - vA) / r1; // Positive = enters Node A from E1
      const i2A = (e2 - vA) / r2; // Positive = enters Node A from E2
      const i3A = vA * g3;        // Positive = flows from Node A down to GND
      i1MA = i1A * 1000;
      i2MA = i2A * 1000;
      i3MA = i3A * 1000;
      iTotalMA = i3MA;
      u1 = e1 - vA;
      u2 = e2 - vA;
      u3 = vA;
      kclNodeResidualMA = i1MA + i2MA - i3MA;
      kvlLoop1ResidualV = e1 - u1 - u3;
      kvlLoop2ResidualV = e2 - u2 - u3;
      totalPowerMW = Math.max(0, e1 * i1MA) + Math.max(0, e2 * i2MA);
      loadPowerMW = u3 * i3MA;
      efficiencyPct = totalPowerMW > 0 ? Math.min(100, (loadPowerMW / totalPowerMW) * 100) : 0;

      if (i2MA < -0.05) {
        statusFr = `Millman : V_A = ${vA.toFixed(2)} V (> E₂). I₁ (${i1MA.toFixed(2)} mA) se divise vers R₃ et refoule vers E₂ (${i2MA.toFixed(2)} mA).`;
        statusAr = `ميلمان: V_A = ${vA.toFixed(2)} V (> E₂). التيار I₁ ينقسم نحو R₃ ويرتد نحو E₂ (${i2MA.toFixed(2)} mA).`;
        statusEn = `Millman: V_A = ${vA.toFixed(2)} V (> E₂). I₁ (${i1MA.toFixed(2)} mA) feeds R₃ and flows back into E₂ (${i2MA.toFixed(2)} mA).`;
      } else if (i1MA < -0.05) {
        statusFr = `Millman : V_A = ${vA.toFixed(2)} V (> E₁). E₂ domine et refoule ${Math.abs(i1MA).toFixed(2)} mA vers E₁.`;
        statusAr = `ميلمان: V_A = ${vA.toFixed(2)} V (> E₁). المصدر E₂ يدفع التيار عكسياً نحو E₁.`;
        statusEn = `Millman: V_A = ${vA.toFixed(2)} V (> E₁). E₂ dominates and pushes ${Math.abs(i1MA).toFixed(2)} mA back into E₁.`;
      } else {
        statusFr = `Millman & KCL : V_A = ${vA.toFixed(2)} V · I₁ (${i1MA.toFixed(2)}) + I₂ (${i2MA.toFixed(2)}) = I₃ (${i3MA.toFixed(2)} mA).`;
        statusAr = `عقدة A: V_A = ${vA.toFixed(2)} V · I₁ (${i1MA.toFixed(2)}) + I₂ (${i2MA.toFixed(2)}) = I₃ (${i3MA.toFixed(2)} mA).`;
        statusEn = `Millman & KCL: V_A = ${vA.toFixed(2)} V · I₁ (${i1MA.toFixed(2)}) + I₂ (${i2MA.toFixed(2)}) = I₃ (${i3MA.toFixed(2)} mA).`;
      }
      break;
    }

    case 'wheatstone-bridge': {
      // Left leg: R1 top, R2 bottom -> Node A. Right leg: R3 top, rLoad bottom -> Node B.
      // Bridge resistor (optional voltmeter/galvanometer) 10k or direct open voltmeter
      const rBridge = params.loadConnected ? 1000 : 1e9;
      if (!params.loadConnected) {
        vA = e1 * (r2 / (r1 + r2));
        vB = e1 * (rLoad / (r3 + rLoad));
        i1MA = (e1 / (r1 + r2)) * 1000;
        i2MA = (e1 / (r3 + rLoad)) * 1000;
        iBridgeMA = 0;
        iTotalMA = i1MA + i2MA;
      } else {
        // Exact nodal 2x2 conductance matrix for V_A and V_B
        const gA1 = 1 / r1;
        const gA2 = 1 / r2;
        const gB3 = 1 / r3;
        const gBL = 1 / rLoad;
        const gBr = 1 / rBridge;
        const a11 = gA1 + gA2 + gBr;
        const a12 = -gBr;
        const a22 = gB3 + gBL + gBr;
        const b1 = e1 * gA1;
        const b2 = e1 * gB3;
        const det = a11 * a22 - a12 * a12;
        vA = (b1 * a22 - a12 * b2) / det;
        vB = (a11 * b2 - a12 * b1) / det;
        iBridgeMA = ((vA - vB) / rBridge) * 1000;
        i1MA = ((e1 - vA) / r1) * 1000;
        i2MA = ((e1 - vB) / r3) * 1000;
        iTotalMA = i1MA + i2MA;
      }
      u1 = e1 - vA;
      u2 = vA;
      u3 = e1 - vB;
      uLoad = vB;
      vOut = vA - vB;
      balancedBridge = Math.abs(vA - vB) < 0.03;
      kvlLoop1ResidualV = e1 - u1 - u2;
      kvlLoop2ResidualV = u1 + (vA - vB) - u3;
      kclNodeResidualMA = i1MA - (vA / r2) * 1000 - iBridgeMA;
      totalPowerMW = e1 * iTotalMA;

      if (balancedBridge) {
        statusFr = `Pont équilibré ! V_A = V_B = ${vA.toFixed(2)} V → ΔV_AB ≈ 0,00 V (R₁·R_L = R₂·R₃).`;
        statusAr = `الجسر متوازن! V_A = V_B = ${vA.toFixed(2)} V ← فرق الجهد ≈ 0.00 V.`;
        statusEn = `Bridge balanced! V_A = V_B = ${vA.toFixed(2)} V → ΔV_AB ≈ 0.00 V (R₁·R_L = R₂·R₃).`;
      } else {
        statusFr = `Déséquilibre : V_A = ${vA.toFixed(2)} V, V_B = ${vB.toFixed(2)} V → ΔV_AB = ${(vA - vB).toFixed(2)} V.`;
        statusAr = `عدم توازن: V_A = ${vA.toFixed(2)} V و V_B = ${vB.toFixed(2)} V ← ΔV_AB = ${(vA - vB).toFixed(2)} V.`;
        statusEn = `Unbalanced: V_A = ${vA.toFixed(2)} V, V_B = ${vB.toFixed(2)} V → ΔV_AB = ${(vA - vB).toFixed(2)} V.`;
      }
      break;
    }

    case 'internal-resistance': {
      if (params.faultMode === 'open' || !params.loadConnected) {
        iTotalMA = 0;
        uInternal = 0;
        uLoad = e1;
        vA = e1;
        vOut = e1;
        efficiencyPct = 100;
        statusFr = `À vide (I = 0) : aucune chute sur r_i, V_bornes = FEM E = ${e1.toFixed(2)} V.`;
        statusAr = `دون حمل (I = 0): لا يوجد هبوط على r_i، الجهد الطرفي = القوة الدافعة ${e1.toFixed(2)} V.`;
        statusEn = `No-load (I = 0): zero drop across r_i, terminal voltage equals EMF E = ${e1.toFixed(2)} V.`;
      } else {
        const effLoad = params.faultMode === 'short' ? 0.5 : rLoad;
        const iA = e1 / (ri + effLoad);
        iTotalMA = iA * 1000;
        i1MA = iTotalMA;
        iLoadMA = iTotalMA;
        uInternal = iA * ri;
        uLoad = iA * effLoad;
        vA = uLoad;
        vOut = uLoad;
        u1 = uInternal;
        u2 = uLoad;
        totalPowerMW = e1 * iTotalMA;
        loadPowerMW = uLoad * iTotalMA;
        efficiencyPct = (uLoad / e1) * 100;
        kvlLoop1ResidualV = e1 - uInternal - uLoad;
        overloadWarning = efficiencyPct < 60 || params.faultMode === 'short';

        statusFr = `En charge : V_bornes = E − r_i·I = ${e1.toFixed(2)} − ${uInternal.toFixed(2)} = ${uLoad.toFixed(2)} V (η = ${efficiencyPct.toFixed(0)} %).`;
        statusAr = `تحت الحمل: الجهد الطرفي = E − r_i·I = ${e1.toFixed(2)} − ${uInternal.toFixed(2)} = ${uLoad.toFixed(2)} V (الكفاءة ${efficiencyPct.toFixed(0)}%).`;
        statusEn = `Under load: V_term = E − r_i·I = ${e1.toFixed(2)} − ${uInternal.toFixed(2)} = ${uLoad.toFixed(2)} V (η = ${efficiencyPct.toFixed(0)}%).`;
        if (overloadWarning) {
          warningFr = `Chute interne sévère (${uInternal.toFixed(2)} V perdus en chaleur dans la pile) !`;
          warningAr = `هبوط جهد داخلي حاد (${uInternal.toFixed(2)} V تضيع كحرارة داخل البطارية)!`;
          warningEn = `Severe internal sag (${uInternal.toFixed(2)} V lost as heat inside the battery)!`;
        }
      }
      break;
    }
  }

  return {
    topology: params.topology,
    vPlus,
    vA,
    vB,
    vOut,
    u1,
    u2,
    u3,
    uLoad,
    uInternal,
    iTotalMA,
    i1MA,
    i2MA,
    i3MA,
    iLoadMA,
    iBridgeMA,
    kvlLoop1ResidualV,
    kvlLoop2ResidualV,
    kclNodeResidualMA,
    totalPowerMW,
    loadPowerMW,
    efficiencyPct,
    faultActive: params.faultMode,
    overloadWarning,
    balancedBridge,
    led1Lit,
    led2Lit,
    statusFr,
    statusAr,
    statusEn,
    warningFr,
    warningAr,
    warningEn,
  };
}
