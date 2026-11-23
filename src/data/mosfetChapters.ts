import { ChapterDef } from '../types';

export const MOSFET_CHAPTERS: ChapterDef[] = [
  {
    id: 1,
    slug: 'mosfet-gate-field',
    pageRef: 'Module 1 · 2N7000 / SiO₂',
    title: {
      fr: '1. Comment un champ électrique ouvre le canal sans courant ?',
      ar: '١. كيف يفتح المجال الكهربائي القناة دون تيار بوابة؟',
      en: '1. How Does an Electric Field Open the Channel With Zero Gate Current?',
    },
    subtitle: {
      fr: 'La grille isolée (SiO₂) commande le drain par tension, pas par courant',
      ar: 'البوابة المعزولة (SiO₂) تتحكم بالمصرف بالجهد لا بالتيار',
      en: 'The insulated oxide gate controls drain current by voltage, not base current',
    },
    analogyTitle: {
      fr: 'Analogie : la membrane élastique étanche (I_G = 0)',
      ar: 'التشبيه: الغشاء المرن المعزول (I_G = 0)',
      en: 'Analogy: The Sealed Elastic Diaphragm Valve (I_G = 0)',
    },
    analogyText: {
      fr: 'Contrairement au BJT où un petit filet d’eau (I_B) s’écoule en permanence pour tenir le clapet ouvert, la grille du MOSFET est une poche fermée par une vitre isolante (SiO₂). La pression d’eau V_GS repousse une membrane qui ouvre le passage Drain→Source sans perdre une goutte. Sans résistance de rappel (1 MΩ), la pression reste piégée même quand vous lâchez le fil !',
      ar: 'على عكس الترانزستور ثنائي القطب (BJT) الذي يستهلك تيار قاعدة مستمراً، فإن بوابة الـ MOSFET معزولة بطبقة زجاجية (SiO₂). ضغط الجهد V_GS وحده يفتح القناة بين المصرف (D) والمنبع (S) دون سحب تيار (I_G ≈ 0). ومن دون مقاومة تفريغ (1 MΩ)، تبقى الشحنة محبوسة حتى بعد رفع إصبعك!',
      en: 'Unlike a BJT that needs continuous base current (I_B), a MOSFET gate is sealed behind glass-like oxide (SiO₂). Gate voltage pressure (V_GS) alone pulls carriers into the Drain→Source channel with virtually zero current bleed. Without a 1 MΩ pull-down resistor, charge stays trapped on the gate even after you let go!',
    },
    theory: [
      {
        fr: 'Dans un MOSFET à enrichissement canal N (2N7000, IRF540), la grille (G) est séparée du silicium par une couche ultrafine d’oxyde isolant. En courant continu, la résistance d’entrée dépasse 10¹² Ω : I_G ≈ 0 nA.',
        ar: 'في ترانزستور MOSFET قناة N (مثل 2N7000 و IRF540)، تفصل طبقة أكسيد عازلة البوابة (G) عن جسم السيليكون. في التيار المستمر، تتجاوز مقاومة الدخل 10¹² Ω ويكون تيار البوابة صفراً عملياً.',
        en: 'In an N-channel enhancement MOSFET (2N7000, IRF540), an ultrathin SiO₂ oxide layer insulates the Gate (G) from the silicon channel. DC input impedance exceeds 10¹² Ω, so steady I_G ≈ 0 nA.',
      },
      {
        fr: 'Mais la grille forme un véritable condensateur C_iss (~50 pF à 2 nF). Si vous touchez la grille pour la charger puis retirez le doigt sans résistance pull-down vers la Source, le MOSFET reste verrouillé allumé indéfiniment !',
        ar: 'لكن البوابة تشكّل مكثفاً حقيقياً C_iss. إذا شحنتَ البوابة بلمسة ثم تركتَها معلّقة بدون مقاومة ربط بالأرضي (Pull-down 1 MΩ)، يظلّ الترانزستور في حالة تشغيل مستمر!',
        en: 'However, the gate acts as a real capacitor C_iss (~50 pF to 2 nF). Touching the gate to charge it and leaving it floating without a pull-down resistor keeps the MOSFET latched ON!',
      },
    ],
    formula: 'V_GS > V_th  (I_G ≈ 0)',
    formulaVars: [
      { symbol: 'V_GS', meaning: { fr: 'Tension Grille–Source appliquée', ar: 'الجهد بين البوابة والمنبع', en: 'Applied Gate–Source voltage' }, unit: 'V' },
      { symbol: 'V_th', meaning: { fr: 'Tension de seuil de création du canal', ar: 'جهد العتبة لتكوين القناة', en: 'Channel threshold voltage' }, unit: 'V' },
      { symbol: 'C_iss', meaning: { fr: 'Capacité d’entrée de grille (mémoire)', ar: 'سعة البوابة الداخلية (تخزين الشحنة)', en: 'Gate input capacitance (charge memory)' }, unit: 'pF–nF' },
    ],
    examples: [
      {
        id: 'gate-cap-memory',
        pageRef: 'Exp. 1A · 2N7000',
        title: { fr: 'Mémoire statique sur grille flottante', ar: 'ذاكرة الشحنة على البوابة العائمة', en: 'Floating-Gate Static Memory' },
        summary: {
          fr: 'Chargez la grille d’un 2N7000 par une impulsion, puis observez la LED rester allumée jusqu’à ce que vous activiez la résistance de décharge 1 MΩ.',
          ar: 'اشحن بوابة 2N7000 بنبضة قصيرة ولاحظ بقاء الـ LED مضيئاً حتى تفعّل مقاومة التفريغ 1 MΩ.',
          en: 'Pulse-charge a 2N7000 gate and watch the LED stay latched ON until you enable the 1 MΩ bleed resistor.',
        },
        components: ['2N7000', '1 MΩ (option)', 'LED', '330R', '5V'],
      },
      {
        id: 'logic-level-led',
        pageRef: 'Exp. 1B · Commande CMOS',
        title: { fr: 'Commande directe par tension (0 → 5 V)', ar: 'تحكم مباشر بالجهد (0 → 5 V)', en: 'Direct Voltage Drive (0 → 5 V)' },
        summary: {
          fr: 'Avec une résistance pull-down active, faites varier V_GS : en dessous de V_th le canal est coupé, au-dessus la LED s’illumine avec I_G = 0 µA.',
          ar: 'مع تفعيل مقاومة الربط، غيّر جهد البوابة V_GS: تحت العتبة تنقطع القناة، وفوقها يضيء الـ LED بتيار بوابة صفري.',
          en: 'With pull-down fitted, sweep V_GS: below V_th the channel is pinched off; above V_th the LED lights with zero DC gate current.',
        },
        components: ['2N7000', '1 MΩ Pull-down', 'LED', '220R', '5V'],
      },
    ],
    prediction: {
      question: {
        fr: 'Vous chargez la grille d’un MOSFET à +5 V puis débranchez le fil de commande (aucune résistance sur la grille). Que fait la LED de sortie ?',
        ar: 'شحنتَ بوابة MOSFET بجهد +5V ثم فصلتَ سلك التحكم دون وجود مقاومة سحب للأرضي. ماذا يحدث لمصباح الخرج؟',
        en: 'You charge a MOSFET gate to +5 V and disconnect the wire (no pull-down resistor fitted). What does the output LED do?',
      },
      options: [
        { fr: 'Elle s’éteint immédiatement car V_GS disparaît', ar: 'ينطفئ فوراً لأن السلك فُصل', en: 'It turns off immediately because the wire was unplugged' },
        { fr: 'Elle reste allumée grâce à la charge piégée sur C_iss', ar: 'يبقى مضيئاً بسبب بقاء الشحنة محبوسة في سعة البوابة', en: 'It stays ON thanks to charge trapped on C_iss' },
        { fr: 'Le MOSFET grille par surintensité de grille', ar: 'يحترق الترانزستور بسبب تيار البوابة', en: 'The MOSFET burns from gate overcurrent' },
      ],
      correctIndex: 1,
      explanation: {
        fr: 'L’oxyde SiO₂ isole la grille : la charge électrique piégée dans C_iss maintient V_GS ≈ +5 V, donc le canal reste conducteur jusqu’à ce qu’une fuite ou une résistance pull-down (100 kΩ–1 MΩ) la décharge.',
        ar: 'طبقة الأكسيد عازلة تماماً، فتبقى الشحنة محبوسة داخل سعة البوابة C_iss محافظةً على V_GS ≈ 5V حتى تفرّغها مقاومة السحب.',
        en: 'Because the SiO₂ gate oxide is an insulator, trapped charge in C_iss holds V_GS ≈ +5 V, keeping the channel ON until a pull-down resistor bleeds it down.',
      },
    },
    teacherNote: {
      fr: 'Règle d’or pratique : ne jamais laisser la grille d’un MOSFET flottante ! Toujours placer 10 kΩ à 1 MΩ entre Grille et Source, et éviter les décharges électrostatiques (ESD) qui peuvent percer l’oxyde (~20 V max).',
      ar: 'قاعدة عملية ذهبية: لا تترك بوابة الـ MOSFET عائمة أبداً! ضع دائماً مقاومة 10kΩ–1MΩ بين البوابة والمنبع لحمايتها من التشغيل العشوائي أو الشحنات الساكنة.',
      en: 'Practical rule of thumb: never leave a MOSFET gate floating! Always fit a 10 kΩ–1 MΩ resistor from Gate to Source, and guard against ESD exceeding ±20 V_GS.',
    },
  },
  {
    id: 2,
    slug: 'threshold-and-rdson',
    pageRef: 'Module 2 · IRF540 vs IRLZ44N',
    title: {
      fr: '2. Seuil V_th & Zone Ohmique : le piège des 5 V',
      ar: '٢. جهد العتبة V_th والمقاومة R_DS(on): فخّ الـ 5 فولت',
      en: '2. Threshold V_th & Ohmic Region: The 5 V Drive Trap',
    },
    subtitle: {
      fr: 'Pourquoi un MOSFET standard chauffe à 5 V alors qu’un Logic-Level reste froid',
      ar: 'لماذا يسخن الـ MOSFET القياسي عند 5V بينما يبقى الـ Logic-Level بارداً؟',
      en: 'Why standard MOSFETs overheat at 5 V gate drive while Logic-Level parts stay cool',
    },
    analogyTitle: {
      fr: 'Analogie : vanne entrouverte vs canal grand ouvert',
      ar: 'التشبيه: صمّام نصف مفتوح مقابل مجرى واسع بلا عائق',
      en: 'Analogy: Half-Cracked Gate vs. Wide-Open Pipe',
    },
    analogyText: {
      fr: 'À peine au-dessus de V_th, le canal est encore très étroit (forte résistance R_DS) : l’eau frotte fort et chauffe le tuyau ! Un IRF540 demande 10 V pour ouvrir son canal au maximum (44 mΩ), tandis qu’un IRLZ44N Logic-Level s’ouvre à fond dès 4,5–5 V (22 mΩ).',
      ar: 'فوق جهد العتبة مباشرة تكون القناة ضيقة جداً (مقاومة عالية) فيحتك التيار ويولّد حرارة عالية. يحتاج IRF540 إلى 10V ليفتح بالكامل، بينما يفتح IRLZ44N المنطقي بكامل سعته عند 5V فقط.',
      en: 'Just above V_th, the channel is pinched tight—high friction heats the transistor! A standard IRF540 needs 10 V to flatten R_DS(on) to 44 mΩ, while a Logic-Level IRLZ44N opens fully by 4.5–5 V (22 mΩ).',
    },
    theory: [
      {
        fr: 'V_GS(th) (souvent 2 à 4 V) n’est PAS la tension d’allumage complet : c’est seulement le début de conduction (250 µA !). À V_GS = 5 V, un IRF540 standard reste semi-résistif et dissipe P = I_D² × R_DS.',
        ar: 'جهد العتبة V_GS(th) ليس جهد التشغيل الكامل، بل بداية التوصيل عند 250 ميكروأمبير فقط! لذا عند قيادة IRF540 بـ 5V من متحكم Arduino تبقى مقاومته مرتفعة ويسخن بشدة.',
        en: 'Datasheet V_GS(th) (typically 2–4 V) is NOT full turn-on—it only marks 250 µA of leakage! Driven at 5 V, a standard IRF540 stays partially resistive and dissipates heavy heat P = I_D² × R_DS.',
      },
      {
        fr: 'En régime totalement ouvert (zone ohmique), le MOSFET se comporte comme une minuscule résistance de quelques milliohms : même à 8 A, P = 8² × 0,022 = 1,4 W seulement sur un IRLZ44N.',
        ar: 'عند فتح القناة بالكامل (المنطقة الأومية) يتصرف الـ MOSFET كمقاومة صغيرة جداً ببضع ملّي أوم: عند تيار 8A لا تتجاوز الحرارة 1.4 واط على IRLZ44N.',
        en: 'Once pushed deep into the ohmic region, a MOSFET behaves like a tiny milliohm resistor: even at 8 A, an IRLZ44N dissipates only 8² × 0.022 = 1.4 W.',
      },
    ],
    formula: 'P_loss = I_D² × R_DS(on)',
    formulaVars: [
      { symbol: 'R_DS(on)', meaning: { fr: 'Résistance Drain-Source à l’état passant', ar: 'مقاومة القناة عند التشغيل الكامل', en: 'On-state Drain-Source resistance' }, unit: 'mΩ' },
      { symbol: 'I_D', meaning: { fr: 'Courant traversant le Drain et la charge', ar: 'تيار المصرف المار في الحِمل', en: 'Drain load current' }, unit: 'A' },
      { symbol: 'P_loss', meaning: { fr: 'Puissance dissipée en chaleur', ar: 'القدرة المبددة على شكل حرارة', en: 'Heat dissipation power' }, unit: 'W' },
    ],
    examples: [
      {
        id: 'arduino-5v-trap',
        pageRef: 'Exp. 2A · Arduino 5V',
        title: { fr: 'Piège 5 V : IRF540 vs IRLZ44N', ar: 'مقارنة 5V: IRF540 مقابل IRLZ44N', en: '5 V Trap: IRF540 vs. IRLZ44N' },
        summary: {
          fr: 'Réglez V_GS à 5 V avec une charge de 5 A et comparez la température en basculant entre IRF540N standard et IRLZ44N Logic-Level.',
          ar: 'اضبط V_GS على 5V بتيار 5A وقارن الحرارة بين IRF540N القياسي و IRLZ44N المنطقي.',
          en: 'Set V_GS to 5 V with a 5 A load and switch between standard IRF540N and logic-level IRLZ44N to see the thermal difference.',
        },
        components: ['IRF540N / IRLZ44N', 'Charge 5 A', '12V'],
      },
      {
        id: 'saturation-ohmic',
        pageRef: 'Exp. 2B · Zone Ohmique',
        title: { fr: 'Exploration 0 → 12 V de la grille', ar: 'استكشاف القناة من 0 إلى 12 فولت', en: '0 → 12 V Gate Overdrive Sweep' },
        summary: {
          fr: 'Balayez V_GS de 0 V à 12 V pour voir la transition critique entre blocage, zone résistive chaude et conduction ohmique froide.',
          ar: 'حرّك جهد البوابة من 0V إلى 12V لمراقبة الانتقال من القطع إلى المنطقة الساخنة ثم الفتح الأومي البارد.',
          en: 'Sweep V_GS from 0 V to 12 V to watch the sharp transition from cutoff through hot linear conduction to cool ohmic saturation.',
        },
        components: ['IRF540N', 'Shunt 12V', 'Capteur T°'],
      },
    ],
    prediction: {
      question: {
        fr: 'Un microcontrôleur 3,3 V alimente directement un IRF540N (V_th = 3,5 V) pour piloter une bande LED de 4 A. Que va-t-il se passer ?',
        ar: 'متحكم 3.3V يغذي بوابة IRF540N (عتبته 3.5V) لتشغيل شريط LED يسحب 4A. ماذا سيحدث؟',
        en: 'A 3.3 V MCU drives an IRF540N gate (V_th = 3.5 V) directly to switch a 4 A LED strip. What happens?',
      },
      options: [
        { fr: 'La bande LED brille à 100 % et le transistor reste froid', ar: 'يضيء الشريط 100% ويبقى الترانزستور بارداً', en: 'The strip runs at 100% and the MOSFET stays cool' },
        { fr: 'Le canal reste bloqué ou à peine ouvert et surchauffe', ar: 'تبقى القناة مغلقة أو شبه مغلقة وتسخن بشدة عند الاقتراب من العتبة', en: 'The channel stays off or barely open and overheats near threshold' },
        { fr: 'Le courant de grille détruit le microcontrôleur', ar: 'تيار البوابة يدمر المتحكم', en: 'Gate current destroys the microcontroller' },
      ],
      correctIndex: 1,
      explanation: {
        fr: 'À 3,3 V, V_GS n’atteint même pas le V_th de l’IRF540N : la bande LED reste éteinte (ou si V_th ≈ 3 V, R_DS atteint plusieurs ohms et le transistor brûle). Il faut un MOSFET Logic-Level (ex. IRLZ44N) ou un driver 10 V.',
        ar: 'عند 3.3V بالكاد يصل الجهد إلى عتبة IRF540N، فيبقى الشريط مطفأً أو ترتفع مقاومة القناة فيحترق. الحل هو MOSFET منطقي (Logic-Level) أو درايفر 10V.',
        en: 'At 3.3 V, V_GS barely reaches an IRF540N’s threshold, leaving the strip dark or roasting the package in its resistive region. A logic-level MOSFET or gate driver is required.',
      },
    },
    teacherNote: {
      fr: 'Astuce lecture de datasheet : cherchez toujours à quelle tension V_GS est spécifiée la valeur R_DS(on) (souvent « V_GS = 10 V » pour standard, « V_GS = 4,5 V » pour Logic-Level).',
      ar: 'نصيحة قراءة الداتاشيت: انظر دائماً إلى قيمة V_GS المكتوبة بجانب R_DS(on) (غالباً 10V للنوع القياسي و 4.5V للنوع المنطقي).',
      en: 'Datasheet tip: always check at which V_GS the R_DS(on) rating is guaranteed (typically 10 V for standard parts, 4.5 V for Logic-Level).',
    },
  },
  {
    id: 3,
    slug: 'nmos-vs-pmos',
    pageRef: 'Module 3 · N-MOS & P-MOS',
    title: {
      fr: '3. N-MOS (Low-Side) vs P-MOS (High-Side)',
      ar: '٣. N-MOS (الطرف السالب) مقابل P-MOS (الطرف الموجب)',
      en: '3. N-MOS (Low-Side) vs. P-MOS (High-Side)',
    },
    subtitle: {
      fr: 'Commuter côté masse ou côté +12 V, et bloquer l’inversion de batterie sans perte',
      ar: 'توصيل الحِمل مع الأرضي أو الموجب، وحماية عكس البطارية دون ضياع 0.7V',
      en: 'Low-side vs. high-side switching, plus zero-drop reverse-polarity protection',
    },
    analogyTitle: {
      fr: 'Analogie : robinet d’évacuation vs robinet d’alimentation',
      ar: 'التشبيه: محبس التصريف مقابل محبس التغذية العلوي',
      en: 'Analogy: Bottom Drain Valve vs. Top Supply Valve',
    },
    analogyText: {
      fr: 'Un N-MOS (IRF540) se place en bas (entre charge et 0 V) : il suffit d’élever la grille au-dessus de 0 V (+5/+10 V). Un P-MOS (IRF9540) se place en haut (sur le +12 V) : sa Source étant au +12 V, on l’allume en tirant sa grille VERS LE BAS (V_G = 0 V → V_GS = −12 V).',
      ar: 'يوضع N-MOS أسفل الحِمل نحو الأرضي ويفتح برفع بوابته (+10V). أما P-MOS فيوضع أعلى الحِمل عند +12V ويفتح بخفض بوابته نحو الصفر (ليصبح V_GS = −12V).',
      en: 'An N-MOS sits below the load at 0 V and turns ON when Gate rises above 0 V. A P-MOS sits at the top +12 V rail: with Source at +12 V, pulling Gate DOWN to 0 V gives V_GS = −12 V and turns it ON!',
    },
    theory: [
      {
        fr: 'Dans un P-MOS canal P, la Source est reliée au rail positif (+V_CC). La conduction démarre lorsque V_GS = V_G − V_S devient suffisamment négatif (< −|V_th|, typiquement −4 V à −12 V).',
        ar: 'في ترانزستور P-MOS يتصل المنبع S بالقطب الموجب (+V_CC)، ويبدأ التوصيل عندما يصبح V_GS = V_G − V_S سالباً بما يكفي (< −|V_th|).',
        en: 'In a P-channel MOSFET, Source connects to +V_CC. Conduction starts when V_GS = V_G − V_S becomes sufficiently negative (< −|V_th|, e.g. −4 V to −12 V).',
      },
      {
        fr: 'Application géniale du P-MOS monté « à l’envers » (Drain côté batterie, Grille au 0 V) : si la batterie est à l’endroit, la diode de corps amorce puis le canal P s’ouvre à R_DS(on) ≈ 30 mΩ (presque 0 V de perte vs 0,7 V pour une diode !) ; si la batterie est inversée, V_GS ≥ 0 bloque tout.',
        ar: 'حيلة ذكية بوضع P-MOS لحماية عكس القطبية: عند التركيب الصحيح تفتح القناة بمقاومة شبه معدومة (دون ضياع 0.7V الخاص بالدايود)، وعند قلب البطارية يغلق الترانزستور ويحمي الدارة تماماً.',
        en: 'Clever P-MOS reverse-polarity trick: wired with Drain to battery +, correct polarity lets the body diode start conduction and snaps the P-channel ON (~30 mΩ, near-zero drop vs. 0.7 V for a diode!), while reversed battery leaves V_GS ≥ 0 and blocks current.',
      },
    ],
    formula: 'N-MOS: V_GS > +V_th  |  P-MOS: V_GS < −|V_th|',
    formulaVars: [
      { symbol: 'N-MOS', meaning: { fr: 'Commutation Low-Side (Source à 0 V)', ar: 'تبديل جهة الأرضي (Source = 0V)', en: 'Low-Side switch (Source at 0 V)' }, unit: 'V_G ↑' },
      { symbol: 'P-MOS', meaning: { fr: 'Commutation High-Side (Source à +V_CC)', ar: 'تبديل جهة الموجب (Source = +V)', en: 'High-Side switch (Source at +V_CC)' }, unit: 'V_G ↓' },
    ],
    examples: [
      {
        id: 'nmos-lowside',
        pageRef: 'Exp. 3A · IRF540',
        title: { fr: 'N-MOS Low-Side (+12 V → Charge → D)', ar: 'N-MOS جهة الأرضي (Low-Side)', en: 'N-MOS Low-Side Switch' },
        summary: {
          fr: 'Charge reliée au +12 V, Drain vers Source à la masse : grille haute (+10 V) = ON, grille basse (0 V) = OFF.',
          ar: 'الحِمل موصول بالموجب والمصرف يغلقه نحو الأرضي: بوابة مرتفعة = تشغيل.',
          en: 'Load wired to +12 V, Drain pulls down to GND: Gate HIGH (+10 V) = ON, Gate LOW (0 V) = OFF.',
        },
        components: ['IRF540 (N-MOS)', 'Charge 12 V', '10k Pull-down'],
      },
      {
        id: 'pmos-highside',
        pageRef: 'Exp. 3B · IRF9540',
        title: { fr: 'P-MOS High-Side (+12 V → S → D → Charge)', ar: 'P-MOS جهة الموجب (High-Side)', en: 'P-MOS High-Side Switch' },
        summary: {
          fr: 'Source au +12 V : tirer la grille à 0 V donne V_GS = −12 V (ON) ; mettre la grille à +12 V donne V_GS = 0 V (OFF).',
          ar: 'المنبع عند +12V: سحب البوابة إلى 0V يعطي V_GS = −12V (تشغيل)، ورفعها إلى +12V يفصل الحمل.',
          en: 'Source tied to +12 V: pulling Gate to 0 V yields V_GS = −12 V (ON); tying Gate to +12 V yields V_GS = 0 V (OFF).',
        },
        components: ['IRF9540 (P-MOS)', 'Charge 12 V', '10k Pull-up'],
      },
      {
        id: 'pmos-reverse-polarity',
        pageRef: 'Exp. 3C · Anti-inversion',
        title: { fr: 'Protection anti-inversion sans perte', ar: 'حماية عكس القطبية بدون هبوط جهد', en: 'Zero-Drop Reverse Polarity Guard' },
        summary: {
          fr: 'Inversez la batterie 12 V pour voir le P-MOS protéger instantanément la charge sans aucune chute de diode de 0,7 V en marche normale.',
          ar: 'اقلب البطارية لترى كيف يمنع الـ P-MOS التلف دون خسارة 0.7V المعتادة في الدايود.',
          en: 'Flip the 12 V battery to watch the P-MOS block reverse current cleanly while running nearly lossless in normal polarity.',
        },
        components: ['IRF4905 (P-MOS)', 'Batterie 12 V', 'Zener 12V'],
      },
    ],
    prediction: {
      question: {
        fr: 'Dans un montage High-Side avec un P-MOS dont la Source est au +12 V, on applique +5 V sur la Grille (au lieu de +12 V) pour tenter de l’éteindre. Que se passe-t-il ?',
        ar: 'في دارة High-Side بترانزستور P-MOS منبعه عند +12V، وضعتَ +5V على البوابة (بدلاً من +12V) محاولاً إطفاءه. ماذا يحدث؟',
        en: 'In a P-MOS high-side switch with Source at +12 V, you drive the Gate with +5 V (instead of +12 V) trying to turn it OFF. What happens?',
      },
      options: [
        { fr: 'Il s’éteint proprement car +5 V est positif', ar: 'ينطفئ تماماً لأن +5V جهد موجب', en: 'It turns cleanly OFF because +5 V is positive' },
        { fr: 'Il reste ALLUMÉ car V_GS = 5 − 12 = −7 V (< −4 V) !', ar: 'يبقى مضاءً لأن V_GS = 5 − 12 = −7V وهو سالب يكفي لتشغيله!', en: 'It stays ON because V_GS = 5 − 12 = −7 V (< −4 V)!' },
        { fr: 'Le Drain devient négatif', ar: 'يصبح المصرف سالباً', en: 'The Drain goes negative' },
      ],
      correctIndex: 1,
      explanation: {
        fr: 'Ce qui compte est V_GS = V_G − V_S = 5 V − 12 V = −7 V ! Comme −7 V dépasse largement le seuil de −4 V, le P-MOS reste bloqué ON ! Pour couper un P-MOS sur +12 V depuis un MCU 5 V, il faut un petit N-MOS ou NPN pilote et une résistance pull-up au +12 V.',
        ar: 'المهم هو الفرق V_GS = 5 − 12 = −7V، وهو كافٍ جداً لبقاء الـ P-MOS في حالة تشغيل! لإطفائه من متحكم 5V يلزم سحب بوابته إلى +12V عبر مقاومة وربطها بـ N-MOS مساعد.',
        en: 'Only V_GS = V_G − V_S matters! Here V_GS = 5 − 12 = −7 V, keeping the P-MOS latched ON! Switching a 12 V P-MOS from a 5 V MCU requires an N-MOS/NPN level-shifter plus a pull-up to +12 V.',
      },
    },
    teacherNote: {
      fr: 'Erreur n° 1 sur P-MOS : relier une broche 5 V directement à la grille d’un P-MOS sur rail 12 V. Le courant passe dans les diodes de protection du microcontrôleur et le P-MOS ne s’éteint jamais.',
      ar: 'الخطأ الأكثر شيوعاً في P-MOS: وصل رجل متحكم 5V مباشرة ببوابة P-MOS يعمل على 12V؛ النتيجة أنه لا ينطفئ أبداً.',
      en: '#1 P-MOS rookie bug: wiring a 5 V MCU pin directly to a 12 V P-MOS gate—the load never shuts off and the MCU clamps the pin.',
    },
  },
  {
    id: 4,
    slug: 'cmos-push-pull',
    pageRef: 'Module 4 · CMOS & Shoot-Through',
    title: {
      fr: '4. L’inverseur CMOS & le danger du Shoot-Through',
      ar: '٤. بوابة CMOS المتكاملة وخطر تيار القصر (Shoot-Through)',
      en: '4. The CMOS Push-Pull Pair & Shoot-Through Hazard',
    },
    subtitle: {
      fr: 'Zéro consommation au repos, mais court-circuit transitoire si le basculement chevauche',
      ar: 'استهلاك صفري في السكون، مقابل قصر لحظي خطير إن عَمِل الترانزستوران معاً',
      en: 'Zero static power at rest, yet a brief short-circuit if both FETs overlap',
    },
    analogyTitle: {
      fr: 'Analogie : deux écluses synchronisées (Temps Mort)',
      ar: 'التشبيه: بوابتا ماء متعاكستان مع زمن أمان (Dead-Time)',
      en: 'Analogy: Synchronized Sluice Gates & Dead-Time',
    },
    analogyText: {
      fr: 'Le P-MOS en haut et le N-MOS en bas ne doivent jamais s’ouvrir au même instant : sinon l’eau du réservoir +5 V tombe directement à la vidange 0 V sans passer par la charge ! Insérer un « temps mort » (Dead-Time) garantit que l’un se ferme avant que l’autre ne s’ouvre.',
      ar: 'إذا فُتح الصمّام العلوي (P-MOS) والسفلي (N-MOS) في اللحظة نفسها، يندفع التيار مباشرة من +V إلى الأرضي مسبباً حرارة وانفجاراً لحظياً! الحل هو إضافة «زمن ميت» (Dead-Time) لإغلاق أحدهما قبل فتح الآخر.',
      en: 'The top P-MOS and bottom N-MOS must never open at the exact same instant—otherwise +V dumps straight to 0 V! Dead-time guarantees one gate seals shut before the opposite one cracks open.',
    },
    theory: [
      {
        fr: 'Un P-MOS relié à +V_DD et un N-MOS relié à 0 V forment l’étage CMOS fondamental de toute la logique numérique : lorsque V_in = 0 V, le P-MOS est ON et le N-MOS est bloqué (Sortie = HIGH, I_statique = 0). Inversement à V_in = V_DD.',
        ar: 'تكوّن ثنائية P-MOS في الأعلى و N-MOS في الأسفل الخلية الأساسية لجميع المعالجات الحديثة (CMOS): عندما يكون الدخل 0V يفتح P-MOS ويغلق N-MOS دون أي تيار ساكن، والعكس عند V_DD.',
        en: 'Stacking a top P-MOS and bottom N-MOS builds the CMOS push-pull stage powering every digital chip: at 0 V in, P-MOS pulls HIGH while N-MOS blocks (I_static ≈ 0). At V_DD in, N-MOS pulls LOW while P-MOS blocks.',
      },
      {
        fr: 'À mi-tension (V_in ≈ V_DD / 2), les deux MOSFETs conduisent simultanément : un pic de courant « shoot-through » traverse directement le demi-pont de +V_DD vers GND. Dans les ponts de puissance, on insère un temps mort (dead-time).',
        ar: 'لكن عند المنتصف (V_in ≈ V_DD / 2) يمر كلا الترانزستورين معاً مسبّباً نبضة قصر «Shoot-Through». لذلك تفرض مشغلات الجسور زمناً ميتاً (Dead-Time) يفصل بين نبضتي التشغيل.',
        en: 'Right around mid-rail (V_in ≈ V_DD / 2), both MOSFETs conduct simultaneously—creating a vertical shoot-through short from +V_DD to GND. Power half-bridges insert dead-time to prevent this.',
      },
    ],
    formula: 'I_static ≈ 0  (CMOS)  |  t_dead > t_off',
    formulaVars: [
      { symbol: 'V_out', meaning: { fr: 'Sortie logique inversée (0 ↔ +5 V)', ar: 'الخرج المنطقي المعكوس (0 ↔ +5V)', en: 'Inverted logic output (0 ↔ +5 V)' }, unit: 'V' },
      { symbol: 'I_shoot', meaning: { fr: 'Courant de court-circuit transversal', ar: 'تيار القصر العابر بين التغذية والأرضي', en: 'Cross-conduction shoot-through current' }, unit: 'mA–A' },
    ],
    examples: [
      {
        id: 'cmos-inverter',
        pageRef: 'Exp. 4A · Inverseur CMOS',
        title: { fr: 'Inverseur logique CMOS sans perte', ar: 'عاكس منطقي CMOS بلا استهلاك سكون', en: 'Zero-Idle CMOS Inverter' },
        summary: {
          fr: 'Basculez V_in entre 0 V et 5 V : admirez la consommation nulle aux extrêmes et la zone critique au milieu à 2,5 V.',
          ar: 'بدّل جهد الدخل بين 0V و 5V وراقب انعدام الاستهلاك في الطرفين والذروة الحرجة عند 2.5V.',
          en: 'Swing V_in between 0 V and 5 V: observe near-zero quiescent draw at the rails and the cross-conduction spike at 2.5 V.',
        },
        components: ['2N7000 (N-MOS)', 'BS250 (P-MOS)', '5V'],
      },
      {
        id: 'shoot-through-trap',
        pageRef: 'Exp. 4B · Temps mort',
        title: { fr: 'Protection par Temps Mort (Dead-Time)', ar: 'الحماية بالزمن الميت (Dead-Time)', en: 'Dead-Time Overlap Protection' },
        summary: {
          fr: 'Désactivez puis réactivez le temps mort à mi-course (V_in = 2,5 V) pour observer la suppression immédiate du pic destructeur.',
          ar: 'أوقف ثم فعّل الزمن الميت عند نقطة التبديل 2.5V لمشاهدة إخماد تيار القصر فوراً.',
          en: 'Toggle dead-time protection ON/OFF at the 2.5 V midpoint to watch the destructive shoot-through spike vanish.',
        },
        components: ['Half-Bridge', 'Driver Dead-Time', 'Shunt'],
      },
    ],
    prediction: {
      question: {
        fr: 'Dans un inverseur CMOS alimenté en +5 V, à quel moment la consommation électrique atteint-elle un pic brutal ?',
        ar: 'في بوابة CMOS المغذاة بـ +5V، متى يقفز استهلاك التيار إلى ذروة مفاجئة؟',
        en: 'In a +5 V CMOS inverter, when does supply current spike dramatically?',
      },
      options: [
        { fr: 'Quand V_in = 0 V fixe', ar: 'عند ثبات الدخل على 0V', en: 'When V_in sits steady at 0 V' },
        { fr: 'Quand V_in = +5 V fixe', ar: 'عند ثبات الدخل على +5V', en: 'When V_in sits steady at +5 V' },
        { fr: 'Pendant le passage par V_in ≈ 2,5 V (basculement)', ar: 'أثناء عبور الدخل لنقطة المنتصف ≈ 2.5V', en: 'While V_in crosses the ~2.5 V midpoint during switching' },
      ],
      correctIndex: 2,
      explanation: {
        fr: 'Aux bornes 0 V et 5 V, l’un des deux MOSFETs est complètement bloqué : le chemin est coupé. C’est à mi-course (V_in ≈ 2,5 V) que P-MOS et N-MOS conduisent ensemble : voilà pourquoi la puissance d’un processeur augmente avec sa fréquence d’horloge !',
        ar: 'عند 0V و 5V يكون أحد الترانزستورين مقطوعاً تماماً فينعدم التيار. عند المنتصف 2.5V فقط يمرر الاثنان معاً، وهذا سبب سخونة المعالجات عند رفع ترددها!',
        en: 'At 0 V and 5 V, one transistor is fully OFF, breaking the path. Only near 2.5 V do both conduct simultaneously—which is why CPUs burn power in proportion to switching frequency!',
      },
    },
    teacherNote: {
      fr: 'Lien avec l’informatique : des milliards de paires P-MOS + N-MOS basculent ensemble dans votre CPU. Accélérer la commutation réduit le temps passé dans la zone shoot-through.',
      ar: 'ربط بالواقع: المليارات من أزواج P-MOS + N-MOS تبدّل حالتها في معالج حاسوبك كل ثانية؛ تسريع الحواف يقلّص زمن العبور الخاسر.',
      en: 'Real-world link: billions of P-MOS + N-MOS pairs switch inside your CPU every second; crisp transitions minimize shoot-through loss.',
    },
  },
  {
    id: 5,
    slug: 'gate-charge-pwm',
    pageRef: 'Module 5 · R_G & Plateau Miller',
    title: {
      fr: '5. Résistance de grille R_G, Plateau de Miller & PWM rapide',
      ar: '٥. مقاومة البوابة R_G ومنطقة ميلر في التبديل السريع PWM',
      en: '5. Gate Resistor R_G, Miller Plateau & Fast PWM Switching',
    },
    subtitle: {
      fr: 'En haute fréquence, charger et décharger C_iss exige de vrais ampères transitoires',
      ar: 'في الترددات العالية يتطلب شحن البوابة وتفريغها تياراً لحظياً قوياً',
      en: 'At high PWM frequencies, charging and discharging C_iss demands real peak current',
    },
    analogyTitle: {
      fr: 'Analogie : gonfler vite une chambre à air (t = R_G × C_iss)',
      ar: 'التشبيه: نفخ غرفة الضغط بسرعة عبر خرطوم ضيق أو واسع',
      en: 'Analogy: Inflating an Elastic Bladder Fast (t = R_G × C_iss)',
    },
    analogyText: {
      fr: 'À l’arrêt, la chambre de grille ne fuit pas. Mais pour ouvrir et fermer la vanne 25 000 fois par seconde (25 kHz), il faut remplir puis vider cette poche à chaque cycle ! Un tuyau trop fin (R_G = 1 kΩ) rend la vanne lente : elle passe moitié de son temps entrouverte et chauffe fort.',
      ar: 'في السكون لا يسرّب الغشاء ماءً، لكن إذا أردت فتحه وإغلاقه 25,000 مرة في الثانية يجب ضخّ الماء وسحبه بسرعة في كل دورة! المقاومة الكبيرة (1kΩ) تبطّئ الشحن فيبقى الترانزستور في المنطقة الساخنة طويلاً.',
      en: 'At DC, the chamber never leaks. Yet to slam the valve open and shut 25,000 times per second (25 kHz), fluid must surge in and out every cycle! A narrow hose (R_G = 1 kΩ) slows edges down, trapping the valve half-open and overheating it.',
    },
    theory: [
      {
        fr: 'Un mythe courant dit « un MOSFET ne consomme aucun courant en grille ». C’est faux en PWM ! À chaque front montant/descendant, le pilote doit fournir I_pic = V_drv / R_G pour charger C_iss et traverser le plateau de Miller Q_gd.',
        ar: 'من الخرافات الشائعة أن البوابة لا تسحب تياراً مطلقاً: هذا صحيح في السكون فقط! في إشارات PWM يجب أن يدفع المشغّل تياراً لحظياً I_pic = V_drv / R_G لشحن سعة البوابة وتجاوز هضبة ميلر.',
        en: 'A common myth claims MOSFETs take zero gate current. Only at DC! On every PWM edge, the driver must push peak current I_pic = V_drv / R_G to charge C_iss through the Miller plateau Q_gd.',
      },
      {
        fr: 'Avec R_G = 10 à 47 Ω via un driver dédié, le front bascule en ~50 ns et les pertes de commutation s’effondrent. Avec R_G = 1 kΩ à 50 kHz, les fronts s’arrondissent et la température grimpe en flèche.',
        ar: 'باستخدام مقاومة صغيرة R_G = 10–47Ω ومشغل بوابة قوي، ينتقل الترانزستور في عشرات النانوثانية ويبقى بارداً؛ أما R_G = 1kΩ عند 50kHz فتجعل الموجة مائلة وتضاعف الحرارة.',
        en: 'With R_G = 10–47 Ω from a proper gate driver, switching snaps in ~50 ns with tiny losses. With R_G = 1 kΩ at 50 kHz, slow edges trap the FET in linear heating.',
      },
    ],
    formula: 't_sw ≈ R_G × C_eff  |  I_pic = V_drv / R_G',
    formulaVars: [
      { symbol: 'R_G', meaning: { fr: 'Résistance série de grille (amortissement)', ar: 'مقاومة البوابة التسلسلية', en: 'Series gate drive resistor' }, unit: 'Ω' },
      { symbol: 'Q_g', meaning: { fr: 'Charge totale de grille à injecter', ar: 'الشحنة الكلية المطلوبة للبوابة', en: 'Total gate charge' }, unit: 'nC' },
      { symbol: 'f_PWM', meaning: { fr: 'Fréquence de découpage PWM', ar: 'تردد نبضات PWM', en: 'PWM switching frequency' }, unit: 'kHz' },
    ],
    examples: [
      {
        id: 'pwm-gate-drive',
        pageRef: 'Exp. 5A · Plateau Miller',
        title: { fr: 'Effet de R_G à l’oscilloscope (25 kHz)', ar: 'تأثير R_G على راسم الإشارة (25 kHz)', en: 'Scope View: R_G & Miller Plateau' },
        summary: {
          fr: 'Montez R_G de 10 Ω à 1 kΩ et observez l’arrondissement du signal V_GS et l’explosion des pertes de commutation.',
          ar: 'ارفع R_G من 10Ω إلى 1kΩ وشاهد تحوّل موجة البوابة المربعة إلى منحنى بطيء وارتفاع الحرارة.',
          en: 'Raise R_G from 10 Ω to 1 kΩ to watch the square V_GS trace round off and switching losses climb sharply.',
        },
        components: ['IRLZ44N', 'R_G (10Ω..1k)', 'Driver 10V', 'PWM'],
      },
      {
        id: 'motor-pwm-mosfet',
        pageRef: 'Exp. 5B · Variateur Moteur',
        title: { fr: 'Variateur moteur 12 V à haut rendement', ar: 'متحكم سرعة محرك 12V عالي الكفاءة', en: 'High-Efficiency 12 V Motor PWM' },
        summary: {
          fr: 'Réglez le rapport cyclique (10–100 %) et la fréquence PWM pour contrôler un moteur 12 V sans chaleur.',
          ar: 'اضبط نسبة النبض (10–100%) وتردد PWM للتحكم بسرعة محرك 12V بكفاءة عالية.',
          en: 'Vary duty cycle (10–100%) and PWM frequency to spin a 12 V motor smoothly with minimal heat.',
        },
        components: ['IRLZ44N', 'Moteur 12V', 'Diode Schottky'],
      },
    ],
    prediction: {
      question: {
        fr: 'Vous pilotez un gros MOSFET à 80 kHz avec une résistance de grille trop élevée (R_G = 1 kΩ). Que constatez-vous ?',
        ar: 'تقود MOSFET قدرة بتردد 80 kHz بمقاومة بوابة كبيرة جداً (1 kΩ). ماذا سيحدث؟',
        en: 'You drive a large power MOSFET at 80 kHz through an oversized 1 kΩ gate resistor. What happens?',
      },
      options: [
        { fr: 'La grille est mieux protégée et le MOSFET reste glacé', ar: 'تُحمى البوابة ويبقى الترانزستور بارداً تماماً', en: 'The gate is safer and the MOSFET stays ice cold' },
        { fr: 'Les fronts lents laissent le MOSFET chauffer dans sa zone linéaire', ar: 'بطء الشحن والتفريغ يُبقي الترانزستور في المنطقة الخطية الساخنة', en: 'Slow edges trap the MOSFET in linear heating every cycle' },
        { fr: 'La fréquence PWM double automatiquement', ar: 'يتضاعف تردد PWM تلقائياً', en: 'PWM frequency doubles automatically' },
      ],
      correctIndex: 1,
      explanation: {
        fr: 'À 80 kHz, la période ne vaut que 12,5 µs ! Avec R_G = 1 kΩ et C_iss = 2 nF, τ ≈ 2 µs : le MOSFET passe une fraction énorme de chaque cycle à moitié ouvert avec V_DS et I_D simultanément non nuls.',
        ar: 'عند تردد 80kHz تبلغ مدة الدورة 12.5 ميكروثانية فقط! ومع R_G = 1kΩ يستغرق الانتقال عدة ميكروثوانٍ، فيتزامن وجود تيار وجهد معاً ويولّدان حرارة هائلة.',
        en: 'At 80 kHz, each cycle is just 12.5 µs! With R_G = 1 kΩ and C_iss = 2 nF, slow transitions keep both V_DS and I_D high simultaneously for microseconds per cycle.',
      },
    },
    teacherNote: {
      fr: 'Rôle réel de R_G (10–47 Ω) : non pas ralentir le PWM, mais amortir les oscillations parasites (ringing) dues à l’inductance des pistes du circuit imprimé.',
      ar: 'الدور الحقيقي لـ R_G (10–47Ω) ليس الإبطاء، بل إخماد الرنين الطفيلي في أسلاك التوصيل مع الحفاظ على سرعة الفتح والإغلاق.',
      en: 'True job of R_G (10–47 Ω): damping parasitic trace-inductance ringing without sluggish switching.',
    },
  },
  {
    id: 6,
    slug: 'flyback-and-body-diode',
    pageRef: 'Module 6 · Bobine & Body Diode',
    title: {
      fr: '6. Charges inductives, Roue libre & Diode de corps interne',
      ar: '٦. الأحمال الحثية ودايود الحماية والدايود الداخلي للترانزستور',
      en: '6. Inductive Loads, Flyback Diode & Internal Body Diode',
    },
    subtitle: {
      fr: 'Pourquoi tout MOSFET contient une diode parasite et comment dompter −L·dI/dt',
      ar: 'لماذا يملك كل MOSFET دايوداً طفيلياً داخلياً وكيف نمنع ارتداد الجهد −L·dI/dt؟',
      en: 'Why every MOSFET hides an internal body diode and how to tame −L·dI/dt spikes',
    },
    analogyTitle: {
      fr: 'Analogie : coup de bélier hydraulique & clapet de décharge',
      ar: 'التشبيه: مطرقة الماء عند الإغلاق المفاجئ وصمام الأمان',
      en: 'Analogy: Hydraulic Water Hammer & Relief Check-Valve',
    },
    analogyText: {
      fr: 'Une bobine ou un moteur a de l’inertie comme une longue conduite d’eau lancée à pleine vitesse. Quand le MOSFET coupe d’un coup en quelques nanosecondes, la pression explose (coup de bélier > 80 V) ! La diode de roue libre offre une boucle de retour douce pour vider l’énergie.',
      ar: 'تتصرف الوشيعة مثل تيار ماء ثقيل ذي قصور ذاتي: عند قطعه فجأة خلال نانوثوانٍ يقفز الضغط (مطرقة الماء > 80V) وقد يخرق الترانزستور! يوفّر دايود الحماية مساراً آمناً لتفريغ طاقة الملف.',
      en: 'An inductor has momentum like water rushing through a long pipe. Slamming the MOSFET shut in nanoseconds causes a > 80 V water-hammer spike! A flyback diode provides a safe return loop for coil current.',
    },
    theory: [
      {
        fr: 'Par sa structure physique (substrat P relié à Source N+ sur puce N-MOS), tout MOSFET de puissance possède une véritable diode interne entre Source (anode) et Drain (cathode) : la Body Diode.',
        ar: 'بسبب البنية الفيزيائية الداخلية لرقاقة السيليكون، يحتوي كل MOSFET قدرة على دايود حقيقي مدمج بين المنبع (S) والمصرف (D) يُعرف باسم Body Diode.',
        en: 'Because the silicon body/substrate ties internally to the Source, every power MOSFET inherently has a parasitic P-N diode from Source to Drain—the Body Diode.',
      },
      {
        fr: 'En commutation de bobine (relais, électrovanne, moteur), une diode de roue libre en parallèle sur la charge absorbe le pic V = −L × (dI/dt) à la coupure avant qu’il ne dépasse la tension d’avalanche V_(BR)DSS.',
        ar: 'عند قيادة ملف أو مرحّل، يمتص دايود الحماية (Flyback) الموصول على التوازي مع الملف نبضة الارتفاع العكسي قبل أن تتجاوز جهد انهيار المصرف.',
        en: 'When switching a coil or solenoid, a flyback diode across the inductive load clamps the turn-off spike V = −L·(dI/dt) before it forces Drain-Source avalanche breakdown.',
      },
    ],
    formula: 'V_pic = V_CC − L × (dI / dt)',
    formulaVars: [
      { symbol: 'L', meaning: { fr: 'Inductance de la bobine ou du moteur', ar: 'محاثة الملف أو المحرك', en: 'Coil or motor inductance' }, unit: 'mH' },
      { symbol: 'dI/dt', meaning: { fr: 'Rapidité de coupure du MOSFET', ar: 'سرعة قطع التيار عند الإغلاق', en: 'Turn-off current slew rate' }, unit: 'A/µs' },
      { symbol: 'D_body', meaning: { fr: 'Diode intrinsèque S → D intégrée', ar: 'الدايود الداخلي من S إلى D', en: 'Intrinsic S → D body diode' }, unit: '≈0.7 V' },
    ],
    examples: [
      {
        id: 'inductive-flyback',
        pageRef: 'Exp. 6A · Roue libre',
        title: { fr: 'Coupure de bobine avec / sans diode', ar: 'فصل ملف حثي مع وبدون دايود حماية', en: 'Coil Turn-Off: With vs. Without Flyback Diode' },
        summary: {
          fr: 'Retirez la diode de roue libre 1N5819 pour voir le pic de Drain bondir au-delà de 90 V à la coupure du MOSFET.',
          ar: 'أزل دايود الحماية لترى ارتفاع جهد المصرف فوق 90V لحظة إغلاق الـ MOSFET.',
          en: 'Remove the 1N5819 flyback diode to watch the Drain spike shoot past 90 V on turn-off.',
        },
        components: ['IRF540N', 'Bobine Relais 12V', '1N5819 Flyback'],
      },
      {
        id: 'body-diode-conduction',
        pageRef: 'Exp. 6B · Diode de Corps',
        title: { fr: 'Conduction inverse par la Body Diode', ar: 'التوصيل العكسي عبر Body Diode', en: 'Reverse Conduction via Body Diode' },
        summary: {
          fr: 'Même avec V_GS = 0 V (grille coupée !), appliquez une tension positive sur la Source (ou inversez Drain/Source) : la diode interne conduit à ~0,7 V.',
          ar: 'حتى مع V_GS = 0V (البوابة مغلقة تماماً!)، عكس القطبية يمرر تياراً عبر الدايود الداخلي للترانزستور.',
          en: 'Even with V_GS = 0 V (gate completely OFF!), reverse Drain-Source polarity conducts ~0.7 V straight through the internal body diode.',
        },
        components: ['IRF540N', 'Charge R', 'Test Inverse'],
      },
    ],
    prediction: {
      question: {
        fr: 'Vous essayez de couper un courant continu allant de Source vers Drain en mettant V_GS = 0 V sur un MOSFET seul. Pourquoi le courant passe-t-il quand même ?',
        ar: 'تحاول منع تيار يسير من المنبع S نحو المصرف D بجعل V_GS = 0V في MOSFET واحد. لماذا يستمر التيار بالمرور؟',
        en: 'You try to block reverse current flowing from Source to Drain by holding V_GS = 0 V on a single N-MOSFET. Why does current still flow?',
      },
      options: [
        { fr: 'Parce que V_GS = 0 V ouvre le canal N', ar: 'لأن V_GS = 0V يفتح القناة N', en: 'Because V_GS = 0 V turns the N-channel ON' },
        { fr: 'Parce que la Body Diode interne laisse passer de S vers D', ar: 'لأن الدايود الداخلي (Body Diode) يمرر التيار في اتجاه S → D', en: 'Because the intrinsic Body Diode conducts freely from S to D' },
        { fr: 'Parce que la grille fuit vers le Drain', ar: 'لأن البوابة تسرّب للمصرف', en: 'Because the gate leaks into the Drain' },
      ],
      correctIndex: 1,
      explanation: {
        fr: 'La Body Diode est toujours présente dans un MOSFET à 3 broches : de S vers D, elle conduit comme une diode ordinaire même grille à 0 V. Pour bloquer dans les deux sens (ex. chargeur/BMS), on monte deux MOSFETs dos à dos.',
        ar: 'الدايود الداخلي موصول دائماً من S إلى D، لذا يمرر التيار في هذا الاتجاه حتى والترانزستور مطفأ. لمنع التيار في الاتجاهين معاً نصل ترانزستورين متقابلين (Back-to-Back).',
        en: 'The body diode always points from S to D in a 3-pin N-MOSFET, conducting like a regular diode even at V_GS = 0 V. Blocking both directions (e.g., battery BMS) requires two back-to-back MOSFETs.',
      },
    },
    teacherNote: {
      fr: 'En convertisseurs synchrones et ponts en H, on met à profit cette Body Diode (roue libre naturelle pendant le temps mort) avant de réactiver le canal ohmique !',
      ar: 'في الجسور الحديثة والمحولات المتزامنة، يُستفاد من هذا الدايود الداخلي لحماية الترانزستور خلال فترة الزمن الميت!',
      en: 'In synchronous converters and H-bridges, the body diode actually provides automatic freewheeling during dead-time!',
    },
  },
  {
    id: 7,
    slug: 'mosfet-boost-dcdc',
    pageRef: 'Module 7 · Hacheur Élévateur Boost',
    title: {
      fr: '7. Convertisseur Élévateur (Boost DC-DC) à MOSFET',
      ar: '٧. محوّل رفع الجهد (Boost DC-DC) بالـ MOSFET',
      en: '7. MOSFET DC-DC Boost Converter (Step-Up)',
    },
    subtitle: {
      fr: 'Stocker l’énergie dans la bobine puis l’additionner à la batterie via Schottky',
      ar: 'تخزين الطاقة المغناطيسية في الملف ثم إضافتها إلى البطارية لرفع الجهد',
      en: 'Store magnetic energy in an inductor, then stack it atop the input rail via Schottky',
    },
    analogyTitle: {
      fr: 'Analogie : l’élan du bélier pour hisser l’eau plus haut',
      ar: 'التشبيه: دفع عمود الماء إلى خزان أعلى بالقصور الذاتي',
      en: 'Analogy: Hydraulic Ram Pumping Water Above Source Level',
    },
    analogyText: {
      fr: 'Quand le MOSFET est fermé (D), le courant prend de la vitesse dans la bobine L vers la masse. Dès que le MOSFET coupe (1 − D), le courant lancé force le passage par la diode Schottky et s’empile AU-DESSUS de V_in pour gonfler le condensateur de sortie à 12 V ou 20 V !',
      ar: 'عند إغلاق الـ MOSFET يتسارع التيار في الملف نحو الأرضي؛ وما إن يفتح فجأة حتى يندفع القصور المغناطيسي عبر دايود شوتكي ليضاف فوق جهد البطارية ويرفع الخرج إلى 12V أو 20V!',
      en: 'While the MOSFET is ON (duty D), current ramps up inside inductor L to ground. The instant it snaps OFF (1 − D), inductor momentum forces current through the Schottky diode, stacking atop V_in to pump the output capacitor up to 12–20 V!',
    },
    theory: [
      {
        fr: 'C’est la version moderne à haut rendement (> 90 %) du « Voleur de Joule » vu au chapitre 7 BJT : une inductance L, un MOSFET rapide (faible R_DS(on)), une diode Schottky rapide et un condensateur de sortie.',
        ar: 'هذه هي النسخة الحديثة عالية الكفاءة (> 90%) لدائرة «سارق الجول» التي رأيناها في قسم BJT: ملف حثي + MOSFET سريع + دايود شوتكي + مكثف تنعيم.',
        en: 'This is the > 90%-efficient modern cousin of the BJT Joule Thief: one inductor L, a low-R_DS(on) MOSFET, a fast Schottky rectifier, and an output storage capacitor.',
      },
      {
        fr: 'En régime continu idéal, le rapport cyclique D (0 à 80 %) multiplie la tension selon V_out = V_in / (1 − D). Par exemple avec V_in = 5 V et D = 60 %, V_out = 5 / (1 − 0,6) = 12,5 V !',
        ar: 'في النظام المثالي ترفع نسبة النبض D الجهد وفق القانون: V_out = V_in / (1 − D). مثلاً عند دخل 5V ونسبة 60% نحصل على 12.5V!',
        en: 'In ideal continuous mode, duty cycle D boosts voltage according to V_out = V_in / (1 − D). For example, V_in = 5 V at D = 60% yields V_out = 5 / 0.4 = 12.5 V!',
      },
    ],
    formula: 'V_out = V_in / (1 − D)',
    formulaVars: [
      { symbol: 'V_in', meaning: { fr: 'Tension batterie d’entrée', ar: 'جهد الدخل من البطارية', en: 'Input supply voltage' }, unit: 'V' },
      { symbol: 'D', meaning: { fr: 'Rapport cyclique (temps ON du MOSFET)', ar: 'نسبة التشغيل PWM (Duty Cycle)', en: 'PWM Duty cycle (MOSFET ON share)' }, unit: '%' },
      { symbol: 'V_out', meaning: { fr: 'Tension régulée en sortie', ar: 'الجهد المرفوع على المكثف', en: 'Boosted output voltage' }, unit: 'V' },
    ],
    examples: [
      {
        id: 'dc-boost-converter',
        pageRef: 'Exp. 7A · Boost 5→15V',
        title: { fr: 'Élévateur DC-DC 5 V → 15 V régulé', ar: 'رافع جهد DC-DC من 5V إلى 15V', en: '5 V → 15 V Boost Converter' },
        summary: {
          fr: 'Ajustez V_in et le rapport cyclique D pour élever la tension et observer la loi V_in / (1 − D) en direct à l’oscilloscope.',
          ar: 'عدّل جهد الدخل ونسبة النبض D وشاهد تضاعف الجهد على المكثف وفق المعادلة.',
          en: 'Tune V_in and duty cycle D to step voltage up and verify V_in / (1 − D) live on the scope.',
        },
        components: ['IRLZ44N', 'Inductance 100 µH', '1N5819 Schottky', '470 µF'],
      },
      {
        id: 'strobe-driver',
        pageRef: 'Exp. 7B · Rampe LEDs',
        title: { fr: 'Alimentation haute tension pour LEDs en série', ar: 'تشغيل مصابيح متسلسلة بجهد مرفوع', en: 'High-Voltage Series LED Driver' },
        summary: {
          fr: 'Montez D au-delà de 65 % à partir d’une batterie 3,7 V Li-Ion pour dépasser le seuil d’une branche de 3 LEDs blanches (≈ 10 V).',
          ar: 'ارفع نسبة D فوق 65% من بطارية 3.7V لتتجاوز عتبة 3 مصابيح بيضاء على التوالي (≈ 10V).',
          en: 'Push duty cycle past 65% from a single 3.7 V cell to drive a 3-LED white string (~10 V).',
        },
        components: ['MOSFET N-CH', 'Bobine 47 µH', '3×LED Blanches'],
      },
    ],
    prediction: {
      question: {
        fr: 'Un hacheur Boost reçoit V_in = 5 V avec un rapport cyclique D = 75 % (le MOSFET est ON 75 % du temps). Quelle tension idéale V_out obtient-on ?',
        ar: 'محوّل Boost يستقبل 5V بنسبة نبض D = 75%. ما هو الجهد المثالي الناتج V_out؟',
        en: 'A Boost converter takes V_in = 5 V at D = 75% duty cycle. What ideal output voltage V_out does it produce?',
      },
      options: [
        { fr: '3,75 V (5 × 0,75)', ar: '3.75 فولت (5 × 0.75)', en: '3.75 V (5 × 0.75)' },
        { fr: '10,0 V', ar: '10.0 فولت', en: '10.0 V' },
        { fr: '20,0 V (5 / (1 − 0,75))', ar: '20.0 فولت (5 ÷ 0.25)', en: '20.0 V (5 / (1 − 0.75))' },
      ],
      correctIndex: 2,
      explanation: {
        fr: 'D’après V_out = V_in / (1 − D), avec D = 0,75 on a 1 − D = 0,25, donc 5 V / 0,25 = 20 V ! (En pratique, si D approche 95 %, les pertes de bobine limitent la montée.)',
        ar: 'حسب القانون V_out = 5 / (1 − 0.75) = 5 / 0.25 = 20V! عملياً عند تجاوز 85–90% تحدّ مقاومة الملف من الارتفاع.',
        en: 'By V_out = V_in / (1 − D), at D = 0.75 we get 5 V / 0.25 = 20 V! (Real inductor resistance limits extreme > 85% duty ratios.)',
      },
    },
    teacherNote: {
      fr: 'Attention sécurité : ne jamais faire tourner un convertisseur Boost à vide sans boucle de régulation ni charge, sinon la tension grimpe jusqu’au claquage du condensateur ou du MOSFET.',
      ar: 'تنبيه: تشغيل محول Boost بدون حِمل أو تغذية راجعة قد يرفع الجهد إلى حدود تدمّر المكثف أو الـ MOSFET.',
      en: 'Safety note: never run an unregulated boost converter completely open-circuit—output voltage climbs until the capacitor or MOSFET breaks down.',
    },
  },
  {
    id: 8,
    slug: 'hbridge-and-linear-load',
    pageRef: 'Module 8 · Pont en H & Charge DC',
    title: {
      fr: '8. Pont en H à 4 MOSFETs & Charge Électronique Linéaire',
      ar: '٨. جسر H بأربعة MOSFETs والحِمل الإلكتروني الخطي',
      en: '8. 4-MOSFET H-Bridge Motor Drive & Linear Current Sink',
    },
    subtitle: {
      fr: 'Inverser la rotation d’un moteur ou réguler un courant constant au milliampère près',
      ar: 'عكس اتجاه المحرك أو تثبيت التيار في المنطقة الخطية بدقة عالية',
      en: 'Bidirectional motor reversal or precision constant-current regulation',
    },
    analogyTitle: {
      fr: 'Analogie : croisement de 4 vannes ou régulateur à contre-pression',
      ar: 'التشبيه: 4 صمّامات لعكس الجريان أو صمّام موازنة دقيق للتيار',
      en: 'Analogy: 4-Valve Flow Reverser & Precision Pressure Balance',
    },
    analogyText: {
      fr: 'En disposant 4 vannes MOSFET autour du moteur (Pont en H), ouvrir la diagonale Q1+Q4 fait tourner dans un sens, ouvrir Q2+Q3 inverse le courant et le sens ! En mode Charge Électronique, un AOP ajuste finement V_GS pour garder le courant I_D rigoureusement fixe sur R_shunt.',
      ar: 'بوضع 4 صمّامات MOSFET على شكل حرف H حول المحرك، فتح القطر الأول (Q1+Q4) يديره للأمام، وفتح القطر المعاكس (Q2+Q3) يعكس الدوران! أما في وضع الحِمل الخطي فيضبط مكبّر العمليات V_GS ليحافظ على تيار I_D ثابتاً مهما تغيّر الجهد.',
      en: 'Arranging 4 MOSFET valves around a motor in an “H” drives forward on Q1+Q4 or reverses on Q2+Q3! In linear Current-Sink mode, an op-amp trims V_GS dynamically so I_D × R_shunt stays locked to V_ref.',
    },
    theory: [
      {
        fr: 'Le Pont en H utilise deux demi-ponts (P-MOS en haut Q1/Q2, N-MOS en bas Q3/Q4). Fermer Q1 + Q4 alimente le moteur en Avant ; fermer Q2 + Q3 inverse le sens (Arrière) ; fermer les deux du bas Q3 + Q4 court-circuite le moteur en Frein électromagnétique !',
        ar: 'يتألف جسر H من نصفي جسر حول المحرك: غلق Q1+Q4 يدير للأمام، Q2+Q3 يعكس للخلف، وغلق السفليين Q3+Q4 معاً يطبّق فرملة كهرومغناطيسية فورية!',
        en: 'An H-Bridge wraps two half-bridges (top P-MOS Q1/Q2, bottom N-MOS Q3/Q4) around a motor: Q1+Q4 drives Forward, Q2+Q3 drives Reverse, and closing both bottom switches Q3+Q4 applies dynamic electromagnetic Braking!',
      },
      {
        fr: 'Contrairement au chapitre 8 BJT où le courant passait par V_BE, un MOSFET régulé par ampli-op + résistance shunt R_shunt fonctionne sans erreur de courant de base : I_D = V_ref / R_shunt.',
        ar: 'وعلى غرار منبع التيار الثابت في قسم BJT، تتيح حلقة التغذية الراجعة بمكبر عمليات ومقاومة R_shunt تثبيت التيار عند I_D = V_ref / R_shunt بدقة عالية دون أي خطأ تيار قاعدة.',
        en: 'Just like the BJT constant-current regulator, an op-amp plus emitter/source shunt fixes I_D = V_ref / R_shunt cleanly with zero base-current error (used in battery capacity testers and DC loads).',
      },
    ],
    formula: 'Avant: Q1+Q4  |  I_D = V_ref / R_shunt',
    formulaVars: [
      { symbol: 'Q1+Q4', meaning: { fr: 'Diagonale marche Avant (+ → −)', ar: 'القطر الأول: دوران للأمام', en: 'Forward diagonal (+ → −)' }, unit: 'FWD' },
      { symbol: 'Q2+Q3', meaning: { fr: 'Diagonale marche Arrière (− → +)', ar: 'القطر المعاكس: دوران للخلف', en: 'Reverse diagonal (− → +)' }, unit: 'REV' },
      { symbol: 'I_D', meaning: { fr: 'Courant constant régulé par shunt', ar: 'التيار الثابت المضبوط بالمقاومة', en: 'Shunt-regulated constant current' }, unit: 'A' },
    ],
    examples: [
      {
        id: 'h-bridge-motor',
        pageRef: 'Exp. 8A · Pont en H',
        title: { fr: 'Pont en H (Avant / Frein / Arrière)', ar: 'جسر H (أمام / فرملة / خلف)', en: '4-MOSFET H-Bridge (FWD / Brake / REV)' },
        summary: {
          fr: 'Commandez les 4 MOSFETs pour inverser la polarité sur le moteur DC ou activer le freinage magnétique instantané.',
          ar: 'تحكّم بالمفاتيح الأربعة لعكس دوران المحرك أو تفعيل الفرملة المغناطيسية الفورية.',
          en: 'Switch the 4 MOSFETs to reverse motor polarity or engage dynamic electromagnetic braking.',
        },
        components: ['2×IRF9540 (P)', '2×IRF540 (N)', 'Moteur DC', '12V'],
      },
      {
        id: 'electronic-dc-load',
        pageRef: 'Exp. 8B · Charge Active',
        title: { fr: 'Charge électronique à courant constant', ar: 'حِمل إلكتروني بتيار ثابت', en: 'Constant-Current Electronic Load' },
        summary: {
          fr: 'Faites varier la tension de batterie testée (5 → 18 V) tout en maintenant le courant I_D parfaitement constant grâce au shunt 0,1 Ω.',
          ar: 'غيّر جهد البطارية المختبرة (5–18V) بينما يثبت التيار بدقة تامة بفضل مقاومة 0.1Ω.',
          en: 'Sweep test battery voltage (5 → 18 V) while the MOSFET holds I_D rock-steady via the 0.1 Ω shunt.',
        },
        components: ['IRFP250N', 'AOP LM358', 'Shunt 0,1 Ω', 'Radiateur'],
      },
    ],
    prediction: {
      question: {
        fr: 'Dans un Pont en H, que se passe-t-il si vous fermez par erreur Q1 (haut gauche) et Q3 (bas gauche) en même temps ?',
        ar: 'في جسر H، ماذا يحدث إذا أغلقتَ عن طريق الخطأ Q1 (أعلى اليسار) و Q3 (أسفل اليسار) في الوقت نفسه؟',
        en: 'In an H-Bridge, what happens if you accidentally turn ON Q1 (top-left) and Q3 (bottom-left) at the exact same time?',
      },
      options: [
        { fr: 'Le moteur tourne deux fois plus vite', ar: 'يدور المحرك بسرعة مضاعفة', en: 'The motor spins twice as fast' },
        { fr: 'Court-circuit direct (Shoot-Through) de la batterie à travers Q1 et Q3 !', ar: 'قصر مباشر للبطارية عبر Q1 و Q3 يحرق الترانزستورات!', en: 'Dead short (Shoot-Through) across the battery through Q1 and Q3!' },
        { fr: 'Le moteur freine en douceur sans courant', ar: 'يتوقف المحرك بلطف دون تيار', en: 'The motor coasts to a gentle stop' },
      ],
      correctIndex: 1,
      explanation: {
        fr: 'Q1 et Q3 forment une jambe verticale directe entre +12 V et 0 V : leur R_DS(on) total vaut ~0,08 Ω, laissant passer des dizaines ou centaines d’ampères en court-circuit ! Il ne faut jamais activer le haut et le bas d’un même côté.',
        ar: 'يشكّل Q1 و Q3 خطاً عمودياً مباشراً بين +12V و 0V بمقاومة بضع ملّي أوم فقط، مما يسبب تيار قصر هائلاً يدمرهما! يُمنع جمع مفتاحي العمود الواحد أبداً.',
        en: 'Q1 and Q3 sit on the same vertical leg from +12 V to 0 V: ~0.08 Ω total resistance dumps massive short-circuit current straight through them! Never enable top and bottom of the same half-bridge.',
      },
    },
    teacherNote: {
      fr: 'Comparaison finale BJT vs MOSFET : pour les petits signaux audio analogiques (Ch. 9 BJT), le BJT reste très linéaire ; pour la commutation de puissance (> 1 A), le MOSFET domine grâce à I_G ≈ 0 et R_DS(on) en milliohms.',
      ar: 'مقارنة ختامية BJT مقابل MOSFET: لتضخيم الإشارات التناظرية الصغيرة يتفوق الـ BJT خطياً، بينما في تبديل القدرة (> 1A) يسيطر الـ MOSFET بفضل انعدام تيار البوابة ومقاومته الملّي أومية.',
      en: 'Final BJT vs. MOSFET takeaway: BJTs shine in simple small-signal analog amplifiers, while MOSFETs dominate power switching (> 1 A) thanks to zero DC gate draw and milliohm R_DS(on).',
    },
  },
];
