import { ChapterDef } from '../types';

export const CHAPTERS: ChapterDef[] = [
  {
    id: 1,
    slug: 'base-current',
    pageRef: 'pp. 3, 5, 15, 27, 50, 57',
    title: {
      fr: '1. Comment un doigt allume-t-il une LED ?',
      ar: '١. كيف يضيء إصبعٌ مصباحاً؟',
      en: '1. How Can a Finger Light an LED?',
    },
    subtitle: {
      fr: 'Le courant de base commande le courant collecteur',
      ar: 'تيار القاعدة الصغير يتحكم في تيار المجمّع الكبير',
      en: 'A tiny base current controls a large collector current',
    },
    analogyTitle: {
      fr: 'Analogie du livre : la vanne hydraulique (p. 5, Schéma C)',
      ar: 'تشبيه الكتاب: صمّام الماء (ص ٥، الشكل C)',
      en: 'Book Analogy: The Water Valve (p. 5, Diagram C)',
    },
    analogyText: {
      fr: 'Imaginez le transistor comme un clapet dans un tuyau : une minuscule pression d’eau sur le levier de base (I_B) ouvre le grand passage entre le collecteur (C) et l’émetteur (E). Plus vous appuyez sur les fils, plus votre peau laisse passer de micro-ampères.',
      ar: 'تخيّل الترانزستور كصمّام ماء: تيار ضئيل يدخل القاعدة (B) يفتح المجرى الواسع بين المجمّع (C) والباعث (E). كلما ضغطتَ أقوى على السلكين، قلّت مقاومة جلدك وزاد تيار القاعدة.',
      en: 'Think of a transistor as a flapper valve in a pipe: a tiny push on the base lever (I_B) opens the wide flow between Collector (C) and Emitter (E). The harder you press, the more microamps pass through your skin.',
    },
    theory: [
      {
        fr: 'Un transistor bipolaire n’est pas un interrupteur commandé par une tension seule : il faut un courant réel entrant dans sa base (au-delà du seuil V_BE ≈ 0,6 V) pour qu’il conduise.',
        ar: 'لا يعمل الترانزستور بالجهد وحده، بل يحتاج إلى تيار فعلي يدخل القاعدة (بعد تجاوز عتبة V_BE ≈ 0.6 V) ليسمح بمرور تيار المجمّع.',
        en: 'A bipolar transistor is not a voltage-only switch: it needs real current entering its base (above V_BE ≈ 0.6 V) to conduct.',
      },
      {
        fr: 'Dans le « Circuit le plus simple au monde » (p. 27), la résistance de votre peau laisse passer quelques micro-ampères dans la base, multipliés par le gain β (≈ 100 à 200) entre C et E.',
        ar: 'في «أبسط دارة في العالم» (ص ٢٧)، تمرّر مقاومة إصبعك بضعة ميكروأمبيرات إلى القاعدة، فيضاعفها الترانزستور بنحو β (١٠٠ إلى ٢٠٠ مرة) لإضاءة الـ LED.',
        en: 'In the “World’s Simplest Circuit” (p. 27), skin resistance lets a few microamps into the base, multiplied by gain β (≈ 100–200) between C and E.',
      },
    ],
    formula: 'I_C = β × I_B',
    formulaVars: [
      { symbol: 'I_B', meaning: { fr: 'Courant de base (commande)', ar: 'تيار القاعدة (التحكم)', en: 'Base current (control)' }, unit: 'µA' },
      { symbol: 'β (h_FE)', meaning: { fr: 'Gain en courant du BC547', ar: 'معامل التضخيم β', en: 'BC547 current gain' }, unit: '×200' },
      { symbol: 'I_C', meaning: { fr: 'Courant collecteur (charge)', ar: 'تيار المجمّع (الحِمل)', en: 'Collector current (load)' }, unit: 'mA' },
    ],
    examples: [
      {
        id: 'simplest',
        pageRef: 'p. 3 & p. 27',
        title: { fr: 'Circuit le plus simple (doigt)', ar: 'أبسط دارة (مفتاح الإصبع)', en: 'World’s Simplest Circuit (finger)' },
        summary: {
          fr: 'Deux doigts relient la base au +9 V. Plus la pression augmente, plus R_peau chute (2 MΩ → 20 kΩ) et la LED brille.',
          ar: 'إصبعان يصلان القاعدة بالموجب. كلما اشتد الضغط هبطت مقاومة الجلد وسطع الـ LED.',
          en: 'Two fingers bridge base to +9 V. Pressing harder lowers skin resistance (2 MΩ → 20 kΩ) and brightens the LED.',
        },
        howItWorks: {
          fr: 'Le doigt agit comme une résistance variable entre le +9 V et la base B du BC547. Dès que la tension de base atteint V_BE ≈ 0,6 V, un minuscule courant de base I_B (quelques microampères) circule de B vers E. Le transistor amplifie ce courant par β ≈ 200 entre le collecteur C et l’émetteur E : le flux principal traverse la résistance de protection 220 Ω et la LED, l’illuminant proportionnellement à la pression du doigt.',
          ar: 'يعمل الإصبع كمقاومة متغيرة تصل +9V بقاعدة الترانزستور B. وبمجرد وصول جهد القاعدة إلى 0.6V يمر تيار ضئيل I_B (بضعة ميكروأمبيرات) من القاعدة إلى الباعث، فيضخّمه BC547 بمقدار β ≈ 200 بين المجمّع C والباعث E ليمر عبر المقاومة 220Ω والـ LED فتضيء حسب قوة الضغط.',
          en: 'Your finger acts as a variable resistor bridging +9 V to the BC547 base. Once the base passes V_BE ≈ 0.6 V, a tiny microamp current I_B enters B→E. The transistor multiplies I_B by β ≈ 200 between Collector and Emitter, pulling current through the 220 Ω limiter and LED so brightness tracks finger pressure.',
        },
        components: ['BC547', 'LED', '220R', 'Pile 9V'],
      },
      {
        id: 'plant',
        pageRef: 'p. 14–15',
        title: { fr: 'Détecteur plante à arroser', ar: 'كاشف جفاف تربة النبات', en: 'Plant Watering Detector' },
        summary: {
          fr: 'Montage à 3 V avec 220 kΩ en base : les sondes dans la terre modulent I_B selon l’humidité du sol (courant limité à ~2 mA sans résistance de LED).',
          ar: 'دارة ٣ فولت بمقاومة قاعدة 220k: رطوبة التربة تغيّر المقاومة بين المسبارين وتتحكم بسطوع الـ LED بتيار آمن (~2mA).',
          en: '3 V circuit with 220 kΩ base resistor: soil probes modulate I_B by moisture (safely capped near ~2 mA without an LED resistor).',
        },
        howItWorks: {
          fr: 'Les deux sondes métalliques plongées dans le terreau jouent le rôle d’une résistance sensible à l’humidité, en série avec la 220 kΩ de sécurité vers la base. Quand la terre est humide, l’eau minéralisée conduit un faible courant I_B ≈ (3 − 0,6) / (220 kΩ + R_sol) qui suffit à allumer la LED rouge (alimentée en 3 V, la 220 kΩ plafonne naturellement I_C autour de 2 mA sans risquer de brûler la LED). Quand la terre sèche, R_sol grimpe vers l’infini et la LED s’éteint pour alerter.',
          ar: 'يعمل المسباران داخل التربة كمقاومة متغيرة بالرطوبة موصولة على التوالي مع مقاومة الحماية 220kΩ نحو القاعدة. في التربة الرطبة تمرر الأملاح تيار قاعدة صغيراً يضيء الـ LED بأمان (تحدّ مقاومة 220kΩ تيار المجمّع نحو ~2mA عند 3V)، وعندما تجفّ التربة ترتفع مقاومتها فينقطع I_B وتنطفئ الـ LED لتنبهك بالسقي.',
          en: 'Two soil probes act as a moisture-dependent resistor in series with the 220 kΩ base limiter. Moist soil conducts enough microamps into the BC547 base to light the red LED (under 3 V, the 220 kΩ cap naturally limits collector current near ~2 mA with no extra LED resistor). As the pot dries out, soil resistance soars, I_B vanishes, and the LED goes dark.',
        },
        components: ['BC547', '220k', 'LED Rouge', '3V'],
      },
      {
        id: 'staircase',
        pageRef: 'p. 49–50 & p. 57',
        title: { fr: 'Détecteur de mensonge / Force', ar: 'كاشف الكذب / مقياس الضغط', en: 'Lie / Grip Strength Detector' },
        summary: {
          fr: 'Montage en escalier (4 LEDs) : chaque étage ajoute 0,6 V (diode 1N4148 ou jonction B-E). Plus on serre les bornes, plus le nombre de LEDs allumées grimpe !',
          ar: 'دارة متدرجة بـ ٤ مصابيح LED: كل درجة تضيف 0.6V، فكلما ضغطتَ أقوى أضاءت مصابيح أكثر بالتتابع.',
          en: 'Staircase 4-LED circuit: each stage adds 0.6 V (1N4148 or B-E junction). Squeezing harder lights more LEDs in sequence!',
        },
        howItWorks: {
          fr: 'Les quatre transistors BC547 ont leurs bases alimentées par une échelle de diodes 1N4148 en série : il faut ~0,6 V pour allumer Q1, ~1,2 V pour Q2, ~1,8 V pour Q3 et ~2,4 V pour Q4. Lorsque la peau serre plus fort entre les bornes d’entrée, le courant qui descend dans la chaîne augmente la tension d’entrée : les seuils de 0,6 V sont franchis un par un, allumant les 4 LEDs comme un vumètre progressif.',
          ar: 'ترتبط قواعد الترانزستورات الأربعة عبر سلّم من الدايودات 1N4148 على التوالي؛ فيحتاج كل طابق إلى 0.6V إضافية فوق السابق (~0.6V للأول، 1.2V للثاني، 1.8V للثالث، 2.4V للرابع). كلما زاد ضغط الأصابع زاد التيار وارتفع الجهد التدريجي لتشتعل المصابيح الأربعة واحداً تلو الآخر كمؤشر مستوى.',
          en: 'Four BC547 stages sit behind a series ladder of 1N4148 diodes, raising the turn-on threshold by ~0.6 V per step (0.6 V, 1.2 V, 1.8 V, 2.4 V). Squeezing the touch pads harder boosts input voltage up the ladder, crossing each 0.6 V threshold in turn to light all 4 LEDs sequentially like a bargraph.',
        },
        components: ['4×BC547', '3×1N4148', '4×LED', '100R', '9V'],
      },
    ],
    prediction: {
      question: {
        fr: 'Vous serrez plus fort les deux fils avec vos doigts. Que deviennent la résistance de votre peau et le courant de base I_B ?',
        ar: 'تضغط أقوى على السلكين بأصابعك. ماذا يحدث لمقاومة جلدك ولتيار القاعدة I_B؟',
        en: 'You squeeze the two wires harder with your fingers. What happens to skin resistance and base current I_B?',
      },
      options: [
        { fr: 'La résistance augmente et I_B diminue', ar: 'تزداد المقاومة وينقص I_B', en: 'Resistance increases and I_B decreases' },
        { fr: 'La résistance diminue et I_B augmente', ar: 'تنقص المقاومة ويزداد I_B', en: 'Resistance decreases and I_B increases' },
        { fr: 'Seule la tension augmente, I_B reste nul', ar: 'يرتفع الجهد فقط ويبقى I_B صفراً', en: 'Only voltage rises, I_B stays zero' },
      ],
      correctIndex: 1,
      explanation: {
        fr: 'En appuyant plus fort, la surface de contact et la conductivité augmentent : R_peau chute fortement, donc I_B = (V_CC − 0,6 V) / R_peau augmente, et I_C = β × I_B illumine davantage la LED (p. 3, Schéma F).',
        ar: 'عند زيادة الضغط تزداد مساحة التلامس وتقلّ مقاومة الإصبع، فيزداد تيار القاعدة I_B، وبما أن I_C = β × I_B يزداد سطوع الـ LED (ص ٣، الشكل F).',
        en: 'Pressing harder grows contact area and conductivity: R_skin drops, so I_B = (V_CC − 0.6 V) / R_skin increases and I_C = β × I_B brightens the LED (p. 3, Diagram F).',
      },
    },
    teacherNote: {
      fr: 'Note du livre (p. 3 & p. 27) : le livre cite β ≈ 100 p. 3 et ≈ 200 p. 27. En régime saturé avec R_LED = 220 Ω sous 9 V, I_C plafonne à I_max ≈ (9 − 2 − 0,2) / 220 ≈ 30,9 mA (31,8 mA si l’on néglige V_CE(sat) = 0,2 V).',
      ar: 'ملاحظة: يذكر الكتاب تضخيماً نحو ١٠٠ في ص٣ ونحو ٢٠٠ في ص٢٧. عند التشبّع بـ 9V ومقاومة 220Ω، يحدّ الحِمل التيار عند I_max ≈ 30.9 mA (31.8 mA si V_CE(sat) ≈ 0).',
      en: 'Book note (pp. 3 & 27): text cites β ≈ 100 on p. 3 and ≈ 200 on p. 27. In saturation with R_LED = 220 Ω at 9 V, I_C caps at I_max ≈ (9 − 2 − 0.2) / 220 ≈ 30.9 mA (31.8 mA if V_CE(sat) is neglected).',
    },
  },
  {
    id: 2,
    slug: 'npn-vs-pnp',
    pageRef: 'pp. 1, 21–24, 55',
    title: {
      fr: '2. NPN ou PNP : polarités opposées',
      ar: '٢. NPN أم PNP: القطبية المعكوسة',
      en: '2. NPN vs. PNP: Opposite Polarities',
    },
    subtitle: {
      fr: 'Deux familles complémentaires qui exigent une alimentation inversée',
      ar: 'نوعان متكاملان يعملان بقطبية بطارية متعاكسة',
      en: 'Two complementary families requiring reversed supply polarity',
    },
    analogyTitle: {
      fr: 'Erreur courante traitée : le câblage identique',
      ar: 'الخطأ الشائع: توصيل النوعين بنفس الطريقة',
      en: 'Common Mistake: Wiring Them Identically',
    },
    analogyText: {
      fr: 'Sur le symbole NPN (BC547), la flèche de l’émetteur pointe vers l’extérieur (« Ne Pointe Pas » dedans) : le courant entre par C et B et sort par E. Sur le PNP (BC557), la flèche pointe vers l’intérieur : le courant entre par E et sort par B et C.',
      ar: 'في رمز NPN (مثل BC547) يتجه السهم للخارج: يدخل التيار من C و B ويخرج من E. أما في PNP (مثل BC557) فيتجه السهم للداخل: يدخل من E ويخرج من B و C.',
      en: 'On the NPN symbol (BC547), the emitter arrow points out (“Never Points iN”): current enters C and B and exits E. On PNP (BC557), it points in: current enters E and exits B and C.',
    },
    theory: [
      {
        fr: 'Dans le « Testeur de transistor le plus simple » (p. 23–24), une pile de 9 V, une résistance de 1 kΩ et une LED suffisent à distinguer NPN et PNP : pour tester un PNP dans le même montage, il faut retourner la pile.',
        ar: 'في «أبسط فاحص ترانزستور» (ص ٢٣–٢٤)، يكفي 9V و1k وLED للتمييز بينهما: لاختبار PNP يجب قلب أقطاب البطارية.',
        en: 'In the “Simplest Transistor Tester” (pp. 23–24), a 9 V battery, 1 kΩ resistor, and LED tell NPN from PNP: flip the battery to test a PNP.',
      },
      {
        fr: 'En combinant un NPN et un PNP côte à côte (comme dans la Sonde Logique p. 55), on détecte à la fois les niveaux HAUT (> 2,3 V) et BAS (0 V) sans consommer de courant au repos !',
        ar: 'بجمع NPN و PNP معاً (مثل المجسّ المنطقي ص ٥٥)، نكشف الحالة المرتفعة (HIGH) والمنخفضة (LOW) دون استهلاك تيار في وضع السكون.',
        en: 'Pairing NPN and PNP side by side (like the Logic Probe on p. 55) detects both HIGH (> 2.3 V) and LOW (0 V) levels with zero idle draw!',
      },
    ],
    formula: 'NPN ⇄ PNP',
    formulaVars: [
      { symbol: 'NPN (BC547)', meaning: { fr: 'C > E, courant I_B entrant dans B', ar: 'C أعلى جهداً من E، وتيار B يدخل القاعدة', en: 'C > E, I_B flows into B' }, unit: '+V_BE' },
      { symbol: 'PNP (BC557)', meaning: { fr: 'E > C, courant I_B sortant de B', ar: 'E أعلى جهداً من C، وتيار B يخرج من القاعدة', en: 'E > C, I_B flows out of B' }, unit: '−V_BE' },
    ],
    examples: [
      {
        id: 'tester',
        pageRef: 'p. 23–24',
        title: { fr: 'Testeur NPN / PNP à pile 9V', ar: 'فاحص NPN / PNP ببطارية 9V', en: '9 V NPN / PNP Tester' },
        summary: {
          fr: 'Choisissez BC337 (NPN) ou BC327 (PNP) et inversez la polarité de la batterie : la LED ne s’allume que lorsque type et polarité concordent.',
          ar: 'اختر NPN أو PNP واقلب البطارية: لا يضيء الـ LED إلا إذا تطابق نوع الترانزستور مع قطبية المصدر.',
          en: 'Select BC337 (NPN) or BC327 (PNP) and flip polarity: the LED lights only when type and battery polarity match.',
        },
        howItWorks: {
          fr: 'Pour conduire, un NPN demande que C et B soient positifs par rapport à E (le courant entre par B et sort par E). À l’inverse, un PNP exige que E soit plus positif que B et C (le courant entre par E et sort par B et C). En touchant les broches de test avec la résistance de 1 kΩ et la LED en série sur le collecteur, seule la bonne polarité de pile polarise la jonction Base-Émetteur en direct (0,6 V) et allume la LED ; à l’envers, les jonctions bloquent.',
          ar: 'لكي يمرر NPN التيار يجب أن يكون جهدا C و B أعلى من E (تيار القاعدة يدخل إلى B). أما PNP فيشترط أن يكون الباعث E أكثر إيجابية من B و C (التيار يخرج من B). بوجود مقاومة الحماية 1kΩ والـ LED، لا تنحاز وصلة القاعدة-الباعث أمامياً (0.6V) إلا عندما تتطابق قطبية البطارية مع نوع الترانزستور، بينما تنسدّ تماماً عند عكس القطبية.',
          en: 'An NPN conducts only when Collector and Base are positive relative to Emitter (I_B flows into B). A PNP requires the exact opposite: Emitter positive relative to Base and Collector (I_B flows out of B). With the 1 kΩ resistor and LED on the test loop, only matching battery polarity forward-biases the 0.6 V B–E junction and lights the LED.',
        },
        components: ['BC547 / BC557', '1k', 'LED', '9V'],
      },
      {
        id: 'logic-probe',
        pageRef: 'p. 55',
        title: { fr: 'Sonde logique complémentaire', ar: 'المجسّ المنطقي البسيط (HIGH / LOW)', en: 'Complementary Logic Probe' },
        summary: {
          fr: 'Sonde du livre : à vide (2,1 + 0,6 + 1,7 + 0,6 = 5 V > 3 V), aucune LED ne s’allume. Sur LOW (0 V), le BC557 allume la LED verte. Sur HIGH (> 2,3 V), le BC547 allume la LED rouge.',
          ar: 'عند السكون لا يضيء أي مصباح لأن مجموع الجهود (5V) أكبر من 3V. عند لمس LOW يضيء الأخضر عبر PNP، وعند HIGH يضيء الأحمر عبر NPN.',
          en: 'Floating (2.1+0.6+1.7+0.6 = 5 V > 3 V): both LEDs off. On LOW (0 V), BC557 lights green; on HIGH (> 2.3 V), BC547 lights red.',
        },
        howItWorks: {
          fr: 'L’astuce repose sur la somme des seuils entre +3 V et 0 V : de haut en bas, LED verte (2,1 V) + V_EB du BC557 (0,6 V) + V_BE du BC547 (0,6 V) + LED rouge (1,7 V) demandent 5,0 V au total ! Sous une pile de 3 V, aucune branche ne peut amorcer seule à vide. Si la pointe touche 0 V (LOW), du courant sort de la base du PNP (BC557) à travers la 10 kΩ et allume la LED verte. Si elle touche +3 V (HIGH), du courant entre dans la base du NPN (BC547) et allume la LED rouge.',
          ar: 'تقوم الفكرة على جمع جهود العتبات بين +3V و 0V: من الأعلى للأسفل لدينا LED خضراء (2.1V) + BC557 (0.6V) + BC547 (0.6V) + LED حمراء (1.7V) بمجموع 5.0V، وهو أكبر من بطارية 3V لذلك تبقى كلتا الإضاءتين مطفأتين في وضع السكون! عند ملامسة 0V (LOW) يخرج تيار من قاعدة PNP فيضيء الأخضر، وعند ملامسة +3V (HIGH) يدخل تيار لقاعدة NPN فيضيء الأحمر.',
          en: 'The trick relies on threshold stacking across the 3 V supply: green LED (2.1 V) + PNP V_EB (0.6 V) + NPN V_BE (0.6 V) + red LED (1.7 V) total 5.0 V—more than 3 V, so both LEDs stay dead off when floating! Touching LOW (0 V) pulls current out of the BC557 PNP base via 10 kΩ to light green; touching HIGH (>2.3 V) pushes current into the BC547 NPN base to light red.',
        },
        components: ['BC547', 'BC557', 'LED Verte', 'LED Rouge', '2×10k', '2×100R', '3V'],
      },
    ],
    prediction: {
      question: {
        fr: 'On branche un PNP (BC557) avec le « + » côté collecteur (comme pour un NPN) et on appuie fort sur les fils de test. La LED s’allume-t-elle ?',
        ar: 'وصلتَ ترانزستور PNP كما يُوصل NPN (الموجب جهة المجمّع) وضغطتَ بقوة. هل يضيء الـ LED؟',
        en: 'You wire a PNP (BC557) with “+” on the collector (like an NPN) and press firmly. Does the LED light up?',
      },
      options: [
        { fr: 'Oui, elle brille normalement', ar: 'نعم، يضيء بشكل عادي', en: 'Yes, it glows normally' },
        { fr: 'Non, elle reste totalement éteinte', ar: 'لا، يبقى مطفأً تماماً', en: 'No, it stays completely off' },
        { fr: 'Elle clignote rapidement', ar: 'يومض بسرعة', en: 'It blinks rapidly' },
      ],
      correctIndex: 1,
      explanation: {
        fr: 'Non ! Pour polariser la jonction Base-Émetteur d’un PNP en direct, l’émetteur doit être plus positif que la base et le collecteur. Il faut inverser la batterie (p. 24).',
        ar: 'لا! لأن ترانزستور PNP يحتاج أن يكون الباعث E أكثر إيجابية من القاعدة والمجمّع، لذا لا يعمل إلا عند عكس البطارية (ص ٢٤).',
        en: 'No! To forward-bias a PNP Base–Emitter junction, the emitter must be more positive than base and collector. Reverse the battery (p. 24).',
      },
    },
    teacherNote: {
      fr: 'Astuce du livre (p. 2) : BC547 peut être remplacé par presque tout petit NPN (BC337, 2N2222, 2N3904) et BC557 par tout petit PNP (BC327, 2N3906), en vérifiant le brochage E-B-C.',
      ar: 'معلومة من الكتاب (ص ٢): يمكن استبدال BC547 بأي NPN شائع مثل BC337 أو 2N2222، وBC557 بأي PNP مثل BC327 بعد التأكد من ترتيب الأرجل.',
      en: 'Book tip (p. 2): BC547 swaps with most small NPNs (BC337, 2N2222, 2N3904) and BC557 with small PNPs (BC327, 2N3906)—just verify E-B-C pins.',
    },
  },
  {
    id: 3,
    slug: 'capacitor-timing',
    pageRef: 'pp. 5–6 (H, I) & p. 64',
    title: {
      fr: '3. Condensateur & Transistor : Flashs et Temporisation',
      ar: '٣. المكثف والترانزستور: الوميض والتأخير الزمني',
      en: '3. Capacitor & Transistor: Flashes & Timing',
    },
    subtitle: {
      fr: 'Un condensateur laisse passer le courant jusqu’à sa charge complète',
      ar: 'يمرّر المكثف التيار فقط أثناء شحنه ثم يقطعه عند الامتلاء',
      en: 'A capacitor passes current only until it is fully charged',
    },
    analogyTitle: {
      fr: 'Schémas H & I du livre (pp. 5–6) : le réservoir qui se remplit',
      ar: 'الشكلان H و I في الكتاب (ص ٥–٦): الخزّان الذي يمتلئ',
      en: 'Book Diagrams H & I (pp. 5–6): The Filling Tank',
    },
    analogyText: {
      fr: 'Un condensateur déchargé agit d’abord comme un fil : le courant de charge traverse la base et allume vivement la LED. Dès qu’il est plein, plus aucun courant continu ne circule : la LED s’éteint. Il faut le décharger pour recommencer !',
      ar: 'المكثف الفارغ يمرّر تياراً لحظياً يشغّل الترانزستور بقوة، لكن ما إن يمتلئ بالشحنة حتى يتوقف التيار وتنطفئ الـ LED. لإعادة التجربة لا بد من تفريغ المكثف.',
      en: 'An empty capacitor acts like a wire at first: charging current drives the base and lights the LED brightly. Once full, DC current stops and the LED turns off—discharge to repeat!',
    },
    theory: [
      {
        fr: 'Schéma H (p. 5–6) : placé sur la base, un grand condensateur (ex. 100 µF ou 220 µF) maintient le courant de base plus longtemps avant de se bloquer. La durée suit la constante de temps τ = R × C.',
        ar: 'الشكل H: عند وضع مكثف على القاعدة، تزداد مدة إضاءة الـ LED كلما كبرت سعة المكثف وفق الثابت الزمني τ = R × C.',
        en: 'Diagram H (pp. 5–6): a larger base capacitor (e.g., 100 µF or 220 µF) sustains base current longer before cutting off, set by time constant τ = R × C.',
      },
      {
        fr: 'Dans l’« Extenseur d’éclairage voiture MkII » (p. 64), quand la portière se ferme, un condensateur de 47 µF se charge lentement à travers 100 kΩ et garde le plafonnier allumé plusieurs secondes pour que le passager s’installe.',
        ar: 'في «ممدّد إضاءة السيارة MkII» (ص ٦٤)، يحافظ مكثف 47µF على إضاءة المصباح الداخلي لعدة ثوانٍ بعد إغلاق الباب ثم يطفئه تدريجياً.',
        en: 'In “Car Courtesy Light Extender MkII” (p. 64), closing the door slowly charges 47 µF via 100 kΩ, keeping the dome light on for several seconds.',
      },
    ],
    formula: 'τ = R × C',
    formulaVars: [
      { symbol: 'τ', meaning: { fr: 'Constante de temps (≈ 63 % de charge)', ar: 'الثابت الزمني للشحن', en: 'Time constant (≈ 63% charge)' }, unit: 's' },
      { symbol: 'R', meaning: { fr: 'Résistance de charge / base', ar: 'مقاومة الشحن', en: 'Charging / base resistance' }, unit: 'kΩ' },
      { symbol: 'C', meaning: { fr: 'Capacité du condensateur', ar: 'سعة المكثف', en: 'Capacitance' }, unit: 'µF' },
    ],
    examples: [
      {
        id: 'cap-base',
        pageRef: 'p. 5–6 (Schéma H)',
        title: { fr: 'Condensateur sur la base', ar: 'مكثف على القاعدة (الشكل H)', en: 'Capacitor on the Base' },
        summary: {
          fr: 'Appuyez sur « Toucher » : la LED s’allume puis s’éteint dès que C est chargé. Cliquez sur « Décharger » pour réarmer.',
          ar: 'المس السلكين: يضيء الـ LED ثم ينطفئ عند تمام شحن المكثف. اضغط «تفريغ» لإعادة المحاولة.',
          en: 'Press “Touch”: the LED lights up then fades off as C fills. Click “Discharge” to reset.',
        },
        howItWorks: {
          fr: 'Lorsque le condensateur est vide (0 V), fermer le contact relie le +6 V à travers C directement sur la base du premier BC547 : un fort courant de charge traverse C et la base pendant quelques dixièmes à plusieurs secondes (selon τ = R × C), saturant la paire Darlington qui allume vivement la LED. À mesure que C se charge vers 5,4 V, le courant de charge décroît exponentiellement jusqu’à zéro et la LED s’éteint d’elle-même.',
          ar: 'عندما يكون المكثف فارغاً (0V)، يعمل لحظة التوصيل كسلك مغلق يمرّر تيار شحنٍ كبيراً من +6V إلى قاعدة الترانزستور، فتتضاعف الشحنة وتضيء الـ LED بقوة. ومع امتلاء المكثف تدريجياً بالجهد نحو ~5.4V يتلاشى تيار الشحن وفق الثابت الزمني τ = R×C حتى يتوقف تماماً فتنطفئ الـ LED تلقائياً إلى أن يتم تفريغ المكثف.',
          en: 'When the capacitor starts empty (0 V), closing the switch sends a surge of charging current from +6 V straight through C into the transistor base, turning the output LED brightly ON. As C fills toward ~5.4 V, charging current decays exponentially on timescale τ = R × C until steady-state DC reaches zero and the LED smoothly fades off until discharged.',
        },
        components: ['2×BC547', 'Condensateur 10–470µF', '100k', '220R', 'LED', '6V'],
      },
      {
        id: 'courtesy-light',
        pageRef: 'p. 64',
        title: { fr: 'Extenseur d’éclairage voiture MkII', ar: 'مؤخّر إطفاء ضوء السيارة (ص ٦٤)', en: 'Car Courtesy Light Extender MkII' },
        summary: {
          fr: 'À la fermeture de la porte, le BC557 + BD679 maintiennent la lampe allumée le temps que le 47 µF se charge via 100 kΩ.',
          ar: 'عند غلق الباب، يبقى المصباح مضيئاً ريثما يشحن مكثف 47µF عبر مقاومة 100k.',
          en: 'When the door shuts, BC557 + BD679 hold the lamp lit while the 47 µF cap charges via 100 kΩ.',
        },
        howItWorks: {
          fr: 'Porte ouverte, le contacteur de porte met la base à la masse et décharge instantanément le condensateur 47 µF tout en maintenant l’ampoule allumée. Dès que la porte se referme, le 47 µF se recharge lentement à travers la 100 kΩ : ce courant de charge polarise le PNP BC557 qui commande à son tour le Darlington de puissance BD679, gardant le plafonnier 12 V allumé pendant ~5 à 10 secondes avant une extinction progressive.',
          ar: 'عند فتح الباب، يفرّغ مفتاح الباب المكثف 47µF فوراً ويشغل مصباح السقف. وفور إغلاق الباب يبدأ المكثف بالشحن البطيء عبر مقاومة 100kΩ؛ فيمر تيار الشحن عبر قاعدة الترانزستور BC557 الذي يقود ترانزستور القدرة BD679 ليبقى المصباح 12V مضيئاً عدة ثوانٍ قبل أن يخبو وينطفئ تدريجياً.',
          en: 'Opening the car door grounds the sense line, discharging the 47 µF capacitor instantly and lighting the dome lamp. Once the door closes, the 47 µF cap slowly recharges through 100 kΩ; that trickle drives PNP BC557, which holds power Darlington BD679 ON so the 12 V cabin lamp lingers for several seconds before dimming out.',
        },
        components: ['BC557', 'BD679', '47µF', '2×100k', '10k', 'Lampe 12V'],
      },
    ],
    prediction: {
      question: {
        fr: 'Dans le Schéma H (p. 6), on remplace le condensateur de 10 µF par un 220 µF déchargé et on touche les fils. Que se passe-t-il ?',
        ar: 'في الشكل H (ص ٦)، استبدلنا مكثف 10µF بآخر سعته 220µF فارغ ولمسنا السلكين. ماذا يحدث؟',
        en: 'In Diagram H (p. 6), we swap 10 µF for an empty 220 µF cap and touch the leads. What happens?',
      },
      options: [
        { fr: 'La LED reste allumée beaucoup plus longtemps avant de s’éteindre', ar: 'يبقى الـ LED مضيئاً مدة أطول بكثير قبل أن ينطفئ', en: 'The LED stays lit much longer before going off' },
        { fr: 'La LED ne s’allume plus du tout', ar: 'لا يضيء الـ LED إطلاقاً', en: 'The LED stays completely off' },
        { fr: 'La LED reste allumée pour toujours', ar: 'يبقى مضيئاً إلى الأبد', en: 'The LED stays lit forever' },
      ],
      correctIndex: 0,
      explanation: {
        fr: 'Un condensateur 22 fois plus grand stocke 22 fois plus de charge pour une même tension : le courant de charge circule donc beaucoup plus longtemps dans la base avant de s’annuler.',
        ar: 'المكثف الأكبر يستوعب شحنة أكبر قبل أن يمتلئ، فيستمر تيار القاعدة مدة أطول (τ = R × C) قبل أن يتوقف عند اكتمال الشحن.',
        en: 'A 22× larger capacitor holds 22× more charge at the same voltage, so base charging current flows far longer before dropping to zero.',
      },
    },
    teacherNote: {
      fr: 'Attention (p. 6) : si on oublie de décharger le condensateur (bouton ou diode de décharge 1N4148 comme p. 41 & 64), la seconde touche ne produit plus aucun flash !',
      ar: 'ملاحظة (ص ٦ و٦٤): إذا لم يُفرَّغ المكثف (عبر زر أو ثنائي 1N4148 كما في ص٤١ و٦٤)، فلن تضيء الدارة عند المحاولة الثانية.',
      en: 'Heads-up (p. 6): if you forget to discharge the capacitor (via button or 1N4148 diode as on pp. 41 & 64), the second touch produces no flash!',
    },
  },
  {
    id: 4,
    slug: 'darlington-8million',
    pageRef: 'pp. 24, 28, 29',
    title: {
      fr: '4. Cascade Darlington & Gain de 8 Millions',
      ar: '٤. الترانزستورات المتتالية وتضخيم ٨ ملايين مرة',
      en: '4. Darlington Cascade & 8 Million Gain',
    },
    subtitle: {
      fr: 'Les gains en courant se multiplient d’un étage à l’autre',
      ar: 'التضخيم يتضاعف بالضرب لا بالجمع عبر المراحل',
      en: 'Current gains multiply stage by stage',
    },
    analogyTitle: {
      fr: 'De « Second Simplest Circuit » à « 8 Million Gain » (p. 28–29)',
      ar: 'من «ثاني أبسط دارة» إلى «تضخيم ٨ ملايين» (ص ٢٨–٢٩)',
      en: 'From “Second Simplest” to “8 Million Gain” (pp. 28–29)',
    },
    analogyText: {
      fr: 'Au lieu d’un seul transistor (β = 200), l’émetteur de Q1 alimente directement la base de Q2, puis Q2 alimente Q3. Chaque étage multiplie le courant par 200 : 200 × 200 = 40 000, puis 200³ = 8 000 000 !',
      ar: 'بدل ترانزستور واحد، يغذّي باعث Q1 قاعدة Q2، ثم يغذّي Q2 قاعدة Q3. كل مرحلة تضرب التيار في ٢٠٠: من ٤٠ ألفاً بترانزستورين إلى ٨ ملايين بثلاثة!',
      en: 'Instead of one transistor (β = 200), Q1’s emitter feeds Q2’s base, and Q2 feeds Q3. Each stage multiplies by 200: 200 × 200 = 40,000, then 200³ = 8,000,000!',
    },
    theory: [
      {
        fr: 'À 2 transistors (paire Super-Alpha / Darlington, p. 28), un effleurement imperceptible suffit à saturer la LED.',
        ar: 'بترانزستورين (الزوج الفائق Darlington، ص ٢٨)، يكفي أخفّ لمسة لإشباع الـ LED بالكامل.',
        en: 'With 2 transistors (Super-Alpha / Darlington pair, p. 28), a feather-light touch saturates the LED.',
      },
      {
        fr: 'À 3 transistors (p. 28–29), l’impédance d’entrée devient si colossale qu’une simple antenne ou piste de cuivre détecte l’électricité statique de votre main à distance et le ronflement 50 Hz des câbles secteur à 2 cm à travers le mur !',
        ar: 'بثلاثة ترانزستورات (ص ٢٨–٢٩)، تصبح الحساسية هائلة لدرجة أن صفيحة نحاسية صغيرة تلتقط كهرباء اليد الساكنة عن بُعد أو طنين أسلاك الكهرباء 50Hz داخل الجدار من مسافة 2cm دون تلامس!',
        en: 'With 3 transistors (pp. 28–29), input impedance is so huge that a small copper pad senses hand static from afar or 50 Hz mains cables 2 cm inside a wall!',
      },
    ],
    formula: 'β_total = β₁ × β₂ × β₃',
    formulaVars: [
      { symbol: 'n = 1', meaning: { fr: '1 transistor (Simple)', ar: 'ترانزستور واحد', en: '1 transistor (Single)' }, unit: 'β = 200' },
      { symbol: 'n = 2', meaning: { fr: 'Paire Darlington', ar: 'زوج دارلنغتون', en: 'Darlington pair' }, unit: 'β = 40 000' },
      { symbol: 'n = 3', meaning: { fr: '8 Million Gain (p. 28)', ar: 'كسب ٨ ملايين (ص ٢٨)', en: '8 Million Gain (p. 28)' }, unit: 'β = 8 000 000' },
    ],
    examples: [
      {
        id: 'darlington-stages',
        pageRef: 'p. 28',
        title: { fr: 'Cascade à 1, 2 ou 3 étages', ar: 'تضخيم متدرج بـ ١ أو ٢ أو ٣ ترانزستورات', en: '1-, 2-, or 3-Stage Cascade' },
        summary: {
          fr: 'Ajoutez Q2 et Q3 sur la platine et observez chaque courant d’étage ainsi que le seuil d’entrée n × 0,6 V.',
          ar: 'أضف Q2 و Q3 على اللوحة وراقب تيار كل مرحلة وعتبة الجهد n × 0.6V.',
          en: 'Add Q2 and Q3 on the board and watch each stage current and the n × 0.6 V input threshold.',
        },
        howItWorks: {
          fr: 'Chaque étage injecte son courant d’émetteur directement dans la base du transistor suivant, tandis que tous les collecteurs se rejoignent sur la LED de sortie. Ainsi, avec 1 étage le seuil d’entrée vaut 0,6 V (gain 200), avec 2 étages il passe à 1,2 V (gain 40 000) et avec 3 étages à 1,8 V (gain 8 000 000). La résistance de 1 MΩ empêche les charges parasites de déclencher Q1.',
          ar: 'يدفع كل ترانزستور تيار باعثه مباشرة إلى قاعدة الترانزستور التالي مع توحيد المجمّعات نحو المصباح. وبذلك يرتفع جهد العتبة 0.6V في كل مرحلة (0.6V لمرحلة، 1.2V لمرحلتين، 1.8V لثلاث) بينما تتضاعف الحساسية بالضرب (200 ← 40,000 ← 8,000,000)، وتحمي مقاومة 1MΩ المدخل من التشويش العابر.',
          en: 'Each stage’s Emitter feeds directly into the next stage’s Base while all Collectors tie to the output load. Input threshold rises by 0.6 V per added B–E junction (0.6 V → 1.2 V → 1.8 V) while current gain multiplies geometrically (200 → 40,000 → 8,000,000).',
        },
        components: ['1 à 3×BC547', '1M', '100k', '220R', 'LED', '6V'],
      },
      {
        id: 'second-simplest',
        pageRef: 'p. 28',
        title: { fr: 'Second Simplest (Paire Darlington ×40k)', ar: 'ثاني أبسط دارة (زوج دارلنغتون ×40k)', en: 'Second Simplest (Darlington ×40k)' },
        summary: {
          fr: 'Deux BC547 câblés en paire Super-Alpha : β = 200 × 200 = 40 000. Le plus léger effleurement suffit à illuminer la LED.',
          ar: 'ترانزستورا BC547 في زوج دارلنغتون (×40 000): يكفي أخفّ تلامس لإضاءة الـ LED بالكامل.',
          en: 'Two BC547s wired as a Super-Alpha pair: β = 200 × 200 = 40,000. The slightest brush lights the LED.',
        },
        howItWorks: {
          fr: 'Un courant infime (à peine 0,5 µA) entrant dans la base de Q1 ressort amplifié 200 fois par son émetteur (100 µA) qui attaque directement la base de Q2. Q2 amplifie à nouveau ces 100 µA par 200 pour fournir jusqu’à ~20 mA (limité par la 220 Ω) dans la LED. La résistance de 100 kΩ limite le courant de base si l’on court-circuite les bornes de test avec un objet métallique.',
          ar: 'تيار ضئيل جداً (0.5 ميكروأمبير فقط) يدخل قاعدة Q1 فيضخّمه 200 مرة ليخرج 100µA من باعثه مباشرة إلى قاعدة Q2، فيضخّمها Q2 مجدداً 200 مرة ليضيء الـ LED بقوة (~20mA). وتحمي مقاومة 100kΩ القاعدة إذا لامست الأسلاك ببعضها.',
          en: 'Just 0.5 µA entering Q1’s base exits its Emitter 200× larger (100 µA) straight into Q2’s base. Q2 multiplies that by another 200× to saturate the LED cleanly up to the 220 Ω current limit, while the 100 kΩ resistor protects Q1 if test leads touch metal.',
        },
        components: ['2×BC547', '100k', '220R', 'LED', '6V'],
      },
      {
        id: 'eight-million',
        pageRef: 'p. 28',
        title: { fr: '8 Million Gain (Détecteur statique)', ar: 'تضخيم ٨ ملايين (كاشف الكهرباء الساكنة)', en: '8 Million Gain (Static Detector)' },
        summary: {
          fr: 'Trois BC547 en cascade (200³ = 8 000 000) : détecte l’électricité statique d’une main ou d’une règle plastique à plusieurs centimètres.',
          ar: 'ثلاث مراحل متتالية (×8 ملايين): تلتقط الشحنة الساكنة لليد أو البلاستيك عن بُعد عدة سنتيمترات دون لمس.',
          en: 'Three BC547s in cascade (200³ = 8,000,000): senses static charge from a hand or plastic ruler centimeters away.',
        },
        howItWorks: {
          fr: 'Avec trois étages en cascade, quelques nanoampères (10⁻⁹ A) induits dans la petite piste antenne par le champ électrostatique d’une main ou d’un peigne frotté suffisent : Q1 les porte à des fractions de microampère, Q2 à des dizaines de microampères et Q3 sature la LED ! Le circuit fonctionne comme un électroscope électronique ultra-sensible sans contact physique.',
          ar: 'بتعاقب ثلاث مراحل (β = 8,000,000)، يكفي بضعة نانوأمبيرات تستحثّها الشحنة الساكنة لليد أو لمسطرة بلاستيكية قرب صفيحة النحاس: يرفعها Q1 إلى الميكروأمبير، ثم Q2 إلى عشرات الميكروأمبيرات، وأخيراً يشبع Q3 الـ LED ككاشف شحنة دون أي تلامس.',
          en: 'With 200³ = 8,000,000 current gain, a few nanoamps induced onto the bare PCB sense pad by a hand’s electrostatic field are multiplied by Q1, then Q2, until Q3 drives full milliamp LED current—acting as a contactless electronic electroscope.',
        },
        components: ['3×BC547', '1M', '100k', '220R', 'LED', '6V'],
      },
      {
        id: 'mains-hum',
        pageRef: 'p. 29',
        title: { fr: 'Détecteur de câbles secteur 50Hz', ar: 'كاشف أسلاك الكهرباء 50Hz', en: '50 Hz Mains Cable Detector' },
        summary: {
          fr: 'Approchez l’antenne PCB d’un câble secteur sous tension (sans dénuder !) : dès 2–5 cm, les 3 étages captent le ronflement 50 Hz et activent le buzzer piézo.',
          ar: 'قرّب الهوائي من سلك كهرباء منزلي (دون لمس النحاس): على بعد 2cm تلتقط المراحل الثلاث طنين 50Hz وتفعّل الصفارة.',
          en: 'Hold the PCB antenna near a live AC cable (no stripping!): within 2–5 cm, 3 stages pick up 50 Hz hum and sound the piezo.',
        },
        howItWorks: {
          fr: 'Le conducteur sous tension 230 V / 50 Hz rayonne un champ électrique alternatif qui se couple capacitivement (quelques picofarads à travers le plâtre ou l’isolant) vers l’antenne de Q1. Pendant chaque demi-alternance positive à 50 Hz, les trois transistors s’ouvrent en cascade et génèrent une onde carrée à 50 Hz dans le transducteur piézo et la LED, signalant la présence du fil caché.',
          ar: 'يشعّ سلك الكهرباء المنزلي (230V / 50Hz) مجالاً كهربائياً متردداً ينتقل بالسعة عبر الجدار أو الغلاف العازل إلى هوائي Q1. خلال كل نصف موجة موجبة بتردد 50Hz، تفتح المراحل الثلاث متعاقبةً لتشغيل الـ LED وطنان البيزو بنغمة واضحة تدل على مسار السلك المخفي.',
          en: 'A live 230 V / 50 Hz wire couples a tiny AC displacement current capacitively across drywall or insulation into Q1’s sense pad. Each positive 50 Hz half-cycle saturates the 8-million-gain cascade, pulsing both the LED and piezo transducer at 50 Hz to pinpoint hidden live cables safely.',
        },
        components: ['3×BC547', '1M', '100k', '220R', 'Piezo + LED', 'Antenne PCB'],
      },
    ],
    prediction: {
      question: {
        fr: 'En mettant deux transistors de gain β = 200 en Darlington, le gain total vaut-il 400 (addition) ou 40 000 (multiplication) ?',
        ar: 'عند ربط ترانزستورين بتضخيم β = 200 في دارة دارلنغتون، هل يصبح التضخيم الكلي 400 أم 40 000؟',
        en: 'Wiring two β = 200 transistors in Darlington gives a total gain of 400 (sum) or 40,000 (product)?',
      },
      options: [
        { fr: '400 (200 + 200)', ar: '400 (نجمع التضخيمين)', en: '400 (200 + 200)' },
        { fr: '40 000 (200 × 200)', ar: '40 000 (نضرب التضخيمين)', en: '40,000 (200 × 200)' },
        { fr: '200 (le second n’amplifie pas)', ar: '200 (الثاني لا يضخّم)', en: '200 (second stage adds nothing)' },
      ],
      correctIndex: 1,
      explanation: {
        fr: 'Tout le courant de sortie du premier transistor (200 × I_B) devient le courant d’entrée du second, qui le multiplie encore par 200 → 200 × 200 = 40 000 !',
        ar: 'تيار الخرج من الترانزستور الأول (200 × I_B) يدخل بأكمله إلى قاعدة الثاني فيضخّمه مجدداً 200 مرة: 200 × 200 = 40 000.',
        en: 'All output current from Q1 (200 × I_B) enters Q2’s base, which multiplies it by another 200 → 200 × 200 = 40,000!',
      },
    },
    teacherNote: {
      fr: 'Précision importante : chaque jonction Base-Émetteur en série demande ~0,6 V. Il faut donc au moins 1,2 V pour 2 étages et 1,8 V pour 3 étages (I_B = (V_CC − n·0,6) / R_f).',
      ar: 'تنبيه: كل وصلة قاعدة-باعث على التوالي تستهلك ~0.6V، لذا يلزم 1.2V لترانزستورين و1.8V لثلاثة ترانزستورات.',
      en: 'Key note: each series Base–Emitter junction drops ~0.6 V, needing at least 1.2 V for 2 stages and 1.8 V for 3 stages (I_B = (V_CC − n·0.6) / R_f).',
    },
  },
  {
    id: 5,
    slug: 'switches-sensors',
    pageRef: 'pp. 50–54, 71, 99, 120',
    title: {
      fr: '5. Interrupteurs, Verrouillage & Capteurs Réels',
      ar: '٥. المفاتيح الذكية، التثبيت بالذاكرة والحساسات',
      en: '5. Smart Switches, Latching & Real Sensors',
    },
    subtitle: {
      fr: 'Applications concrètes du livre : tactile ON/OFF, LDR, Schmitt et Clap',
      ar: 'تطبيقات حقيقية من الكتاب: مفتاح اللمس 4M7، كاشف الظلام، شميت وتصفيق اليد',
      en: 'Real circuits: ON/OFF touch latch, LDR, Schmitt trigger & Clap switch',
    },
    analogyTitle: {
      fr: 'De la commande continue à la décision logique tout-ou-rien',
      ar: 'من التضخيم التناسبي إلى القرار المنطقي (تشغيل / إطفاء)',
      en: 'From Linear Control to Crisp On/Off Logic',
    },
    analogyText: {
      fr: 'En ajoutant une boucle de rétroaction (comme la résistance 4M7 p. 50) ou un Trigger de Schmitt (p. 120), le transistor acquiert une mémoire : il bascule franchement et reste verrouillé même après la disparition du signal.',
      ar: 'بإضافة تغذية راجعة موجبة (مثل مقاومة 4M7 في ص ٥٠) أو قادح شميت (ص ١٢٠)، يكتسب الترانزستور ذاكرة: ينقلب بسرعة ويبقى ثابتاً حتى بعد زوال اللمسة.',
      en: 'Adding positive feedback (like the 4M7 resistor on p. 50) or a Schmitt Trigger (p. 120) gives the circuit memory: it snaps cleanly and stays latched after the trigger ends.',
    },
    theory: [
      {
        fr: 'Interrupteur tactile à verrouillage (p. 50) : toucher ON active la paire BC547 qui pilote le BC557 ; la sortie renvoie du courant vers la base via 4M7 pour auto-maintenir le circuit ! Toucher OFF court-circuite la base à la masse via un BC547 et coupe tout.',
        ar: 'مفتاح اللمس الحقيقي (ص ٥٠): لمس لوح ON يشغّل الزوج الفائق ثم BC557، وتُرجع مقاومة 4M7 تياراً يثبت الدارة مضاءة. ولمس لوح OFF يفرّغ القاعدة فيطفئها.',
        en: 'Latching Touch Switch (p. 50): touching ON drives the BC547 pair and BC557; output feeds back via 4M7 to hold itself on! Touching OFF shorts the base to ground.',
      },
      {
        fr: 'Veilleuse LDR & Trigger de Schmitt (p. 71 & 120) : une LDR ORP12 voit sa résistance chuter à la lumière et monter dans le noir, commandant un relais ou une bande LED. Le Schmitt Trigger évite les battements au crépuscule.',
        ar: 'كاشف الظلام وقادح شميت (ص ٧١ و١٢٠): تنخفض مقاومة LDR في الضوء وترتفع في الظلام، ويمنع قادح شميت ارتعاش المصباح عند الغسق.',
        en: 'LDR Night Light & Schmitt Trigger (pp. 71 & 120): ORP12 LDR resistance drops in light and rises in dark to switch a relay or LED. Schmitt hysteresis prevents dusk chatter.',
      },
    ],
    formula: 'I_B = (V_in − V_BE) / R_B',
    formulaVars: [
      { symbol: '4M7', meaning: { fr: 'Boucle de maintien (Touch Switch p. 50)', ar: 'مقاومة التثبيت الراجعة (ص ٥٠)', en: 'Latching feedback resistor (p. 50)' }, unit: 'MΩ' },
      { symbol: 'ORP12', meaning: { fr: 'Photorésistance LDR (p. 71)', ar: 'مقاومة ضوئية LDR (ص ٧١)', en: 'ORP12 photoresistor LDR (p. 71)' }, unit: 'kΩ' },
    ],
    examples: [
      {
        id: 'touch-latch',
        pageRef: 'p. 50–51',
        title: { fr: 'Touch Switch ON/OFF (verrouillage 4M7)', ar: 'مفتاح اللمس ON/OFF بالتثبيت (ص ٥٠)', en: 'Touch Switch ON/OFF (4M7 Latch)' },
        summary: {
          fr: 'Testez les vraies pastilles ON et OFF de la page 50 : une simple impulsion sur ON verrouille la lampe grâce à la 4M7, OFF la coupe.',
          ar: 'اضغط على لوح ON: تبقى الـ LED مضاءة حتى بعد رفع الإصبع بفضل التغذية الراجعة 4M7، ولوح OFF يطفئها.',
          en: 'Tap the ON and OFF pads from p. 50: a brief touch on ON latches the lamp via 4M7; OFF cuts it cleanly.',
        },
        howItWorks: {
          fr: 'Toucher la pastille ON envoie un micro-courant dans la paire Darlington (2×BC547), ce qui tire la base du PNP BC557 vers le bas et l’allume. Dès que le collecteur du BC557 passe à +6 V, la résistance de rétroaction 4,7 MΩ renvoie en permanence ~1 µA vers la base du Darlington : le montage s’auto-maintient indéfiniment ! Toucher la pastille OFF active le 3ᵉ BC547 qui court-circuite la base d’entrée à 0 V, brisant la boucle et coupant la lampe.',
          ar: 'عند لمس لوح ON يدخل تيار ضئيل إلى زوج دارلنغتون فيفتح ويسحب قاعدة الترانزستور PNP BC557 للأسفل فيضيء المصباح عند +6V. عندئذٍ تعيد مقاومة التغذية الراجعة 4.7MΩ تياراً مستمراً (~1µA) من مخرج BC557 إلى مدخل دارلنغتون فيُثبّت نفسه تلقائياً! ولمس لوح OFF يشغّل BC547 إضافياً يفرّغ قاعدة الدخل إلى 0V فتنهار حلقة التثبيت وينطفئ المصباح.',
          en: 'Touching ON injects microamps into the Darlington pair, pulling the PNP BC557 base low and powering the output rail at +6 V. Feedback resistor 4.7 MΩ immediately routes ~1 µA from BC557’s collector back into the Darlington base, latching the circuit ON forever. Touching OFF turns on a shunt BC547 that pulls the input base to 0 V, breaking the feedback loop.',
        },
        components: ['3×BC547', 'BC557', '4M7', '470k', '4k7', '10k', '6V'],
      },
      {
        id: 'night-light',
        pageRef: 'p. 71',
        title: { fr: 'Veilleuse automatique (LDR + Relais)', ar: 'مصباح الليل التلقائي (LDR + مرحّل)', en: 'Automatic Night Light (LDR + Relay)' },
        summary: {
          fr: 'Une photorésistance ORP12 pilote une paire BC557 + BC547 qui colle un relais 12 V (protégé par diode D1) dès que la lumière baisse sous le seuil réglé.',
          ar: 'تقود المقاومة الضوئية ORP12 زوج BC557 + BC547 لتشغيل مرحّل 12V عند حلول الظلام.',
          en: 'ORP12 LDR drives a BC557 + BC547 pair that closes a 12 V relay (with flyback diode D1) below the light threshold.',
        },
        howItWorks: {
          fr: 'La photorésistance LDR ORP12 et le potentiomètre 1 MΩ forment un pont diviseur sur la base du BC557 : en plein jour la LDR présente une faible résistance (~1 kΩ), tirant la base du PNP vers +12 V (BC557 bloqué, relais au repos). À la tombée du soir, la résistance de la LDR grimpe au-delà de 100 kΩ : la base du BC557 descend sous +11,4 V, il devient passant et sature le BC547 de sortie qui alimente la bobine du relais 12 V (protégé par la diode de roue libre D1).',
          ar: 'تشكّل المقاومة الضوئية ORP12 مع المقاومة 1MΩ مقسّم جهد يغذي قاعدة BC557: في النهار تكون مقاومة LDR منخفضة (~1kΩ) فترفع القاعدة قرب +12V ويبقى المرحّل مفصولاً. عند حلول الظلام ترتفع مقاومة LDR بشدة فيهبط جهد قاعدة PNP فيفتح ويقود BC547 لتشغيل ملف المرحّل 12V (المحمي بدايود الدوران الحر D1).',
          en: 'The ORP12 LDR and 1 MΩ resistor form a light-sensing divider at BC557’s base. In daylight, low LDR resistance (~1 kΩ) holds the PNP base near +12 V (OFF). At dusk, LDR resistance rises past 100 kΩ, dropping the PNP base low enough to conduct and saturate output NPN BC547, energizing the 12 V relay coil across flyback diode D1.',
        },
        components: ['LDR ORP12', 'BC557', 'BC547', '1M', '10k', 'Relais 12V'],
      },
      {
        id: 'dark-schmitt',
        pageRef: 'p. 120',
        title: { fr: 'Trigger de Schmitt (hystérésis LDR)', ar: 'قادح شميت بالهسترة (ص ١٢٠)', en: 'Schmitt Trigger (LDR Hysteresis)' },
        summary: {
          fr: '3×BC547 avec boucle d’émetteur commune : sous le seuil bas (30 %) la LED s’allume franchement ; il faut remonter à 55 % pour l’éteindre.',
          ar: 'ثلاثة ترانزستورات بهسترة حقيقية: يشتعل عند 30% ظلام ولا ينطفئ إلا عند إضاءة 55% لمنع الارتعاش.',
          en: 'Three BC547s sharing an emitter resistor: snaps ON below 30% light and stays lit until light reaches 55%.',
        },
        howItWorks: {
          fr: 'Deux BC547 partagent une même résistance d’émetteur et sont couplés par contre-phase pour créer une bascule à deux seuils (hystérésis). Au crépuscule, quand Q1 commence à se bloquer, le courant bascule vers Q2 dont le courant d’émetteur différent modifie instantanément le potentiel d’émetteur commun : cela accélère le basculement en une fraction de microseconde et décale le seuil de retour (30 % pour allumer, 55 % pour éteindre), éliminant tout clignotement parasite.',
          ar: 'يشترك الترانزستوران في مقاومة باعث موحّدة مع ربط متبادل يخلق عتبتين مختلفتين (الهسترة). عند الغسق، بمجرد أن يبدأ Q1 بالانقطاع ينتقل التيار إلى Q2 فيتغير جهد الباعث المشترك فجأة، مما يسرّع الانقلاب بشكل حاسم ويرفع عتبة الإطفاء إلى 55% مقارنة بـ 30% للتشغيل، فيمنع أي ارتعاش أو وميض متقطع.',
          en: 'Two BC547s share a common emitter resistor in regenerative feedback, creating dual switching thresholds (hysteresis). As dusk triggers Q1 to turn off, Q2 takes over and shifts the shared emitter voltage—snapping the 3rd stage cleanly ON below 30% lux while requiring 55% lux to snap back OFF, eliminating dusk chatter.',
        },
        components: ['LDR ORP12', '3×BC547', '22k', '4k7', '330R', '6V'],
      },
      {
        id: 'clap-sound',
        pageRef: 'p. 54 & p. 99',
        title: { fr: 'Détecteur sonore / Clap Switch', ar: 'مفتاح التصفيق والصوت (ص ٥٤ و٩٩)', en: 'Sound / Clap Switch' },
        summary: {
          fr: 'Un micro électret amplifié pompe des charges via 1N4148 dans un 10 µF (ou 100 µF) : clappez des mains pour allumer la LED temporairement !',
          ar: 'الميكروفون يضخ شحنة عبر الدايود 1N4148 إلى المكثف: صفّق بيديك ليضيء الـ LED مدة مؤقتة ثم ينطفئ!',
          en: 'Amplified electret mic pumps charge via 1N4148 into a 10 µF cap: clap to illuminate the LED temporarily!',
        },
        howItWorks: {
          fr: 'Le microphone électret convertit l’onde sonore d’un claquement de mains en millivolts AC, amplifiés par le premier BC547 à travers le condensateur de couplage 100 nF. La diode 1N4148 redresse ces impulsions positives et charge rapidement le condensateur réservoir 10 µF (pompe de crête), empêchant son retour arrière. Cette tension stockée sature le second BC547 qui maintient la LED allumée quelques secondes pendant que le 10 µF se décharge lentement dans la base.',
          ar: 'يحوّل ميكروفون الإلكتريت صوت التصفيق إلى إشارة مترددة صغيرة يضخّمها الترانزستور الأول عبر مكثف الربط 100nF. يقوم الدايود 1N4148 بتقويم النبضات الموجبة ليشحن المكثف 10µF بسرعة ويمنع عودتها، فتبقى الشحنة مشغّلةً للترانزستور الثاني والـ LED بضع ثوانٍ ريثما يتفرغ المكثف.',
          en: 'The electret mic converts hand-clap pressure waves into AC millivolts amplified by Q1 across a 100 nF coupling cap. Rectifier diode 1N4148 peaks-charges the 10 µF hold capacitor while blocking reverse bleed, latching Q2 and the LED ON until the 10 µF cap slowly discharges through Q2’s base.',
        },
        components: ['Micro Électret', '2×BC547', '1N4148', '10u', '100n', '6V'],
      },
      {
        id: 'motor-relay',
        pageRef: 'p. 43',
        title: { fr: 'Pilotage Moteur & Relais avec D1', ar: 'تشغيل محرك أو مرحّل مع دايود الحماية', en: 'Motor & Relay Driver with Flyback D1' },
        summary: {
          fr: 'Un BC338 (800 mA) pilote un moteur ou un relais 12 V. Notez la diode 1N4148 en parallèle sur la bobine pour absorber les pics de surtension à la coupure.',
          ar: 'يتحكم الترانزستور بمحرك أو مرحّل، ويحمي الدايود 1N4148 الترانزستور من شرارة الارتداد المغناطيسي عند الفصل.',
          en: 'A BC338 (800 mA) drives a 12 V motor or relay. Note the parallel 1N4148 diode absorbing inductive spikes at turn-off.',
        },
        howItWorks: {
          fr: 'La résistance 10 kΩ injecte un courant de base suffisant pour saturer franchement le transistor de puissance BC338 (supportant 800 mA), qui connecte le moteur ou la bobine du relais à la masse. À l’instant de la coupure, l’énergie magnétique de la bobine génère une surtension positive au collecteur (V = −L·dI/dt) : la diode D1 (1N4148) câblée en inverse se met alors à conduire vers +12 V et court-circuite ce pic avant qu’il ne claque le BC338.',
          ar: 'تغذّي مقاومة 10kΩ قاعدة ترانزستور القدرة BC338 (حتى 800mA) ليشغّل المحرك أو ملف المرحّل نحو الأرضي. وعند الفصل المفاجئ، يولّد الحث المغناطيسي للملف نبضة جهد عكسية عالية على المجمّع، فيفتح دايود الحماية D1 (الموصل بعكس القطبية) ليفرّغ الطاقة بأمان نحو خط +12V ويمنع تلف الترانزستور.',
          en: 'The 10 kΩ resistor drives enough base current to saturate the 800 mA BC338, pulling the motor or relay coil low. When switched OFF, collapsing coil flux kicks the collector high via −L·dI/dt; the anti-parallel 1N4148 diode immediately forward-biases into the +12 V rail, clamping the spike safely.',
        },
        components: ['BC338', 'Relais / Moteur', '1N4148', '10k', '12V'],
      },
      {
        id: 'motor-pwm',
        pageRef: 'p. 62',
        title: { fr: 'Variateur vitesse moteur (PWM 3V)', ar: 'متحكّم سرعة المحرك بالنبضات (ص ٦٢)', en: '3 V PWM Motor Speed Controller' },
        summary: {
          fr: 'Paire BC557 + BC338 envoyant des impulsions pleine puissance au moteur 3 V : il conserve un fort couple de démarrage même à basse vitesse.',
          ar: 'زوج BC557 + BC338 يرسل نبضات كاملة العزم لمحرك 3V ليبدأ الدوران بسلاسة حتى عند السرعات البطيئة.',
          en: 'BC557 + BC338 pair feeding full-voltage pulses to a 3 V motor, keeping strong starting torque at low speeds.',
        },
        howItWorks: {
          fr: 'Au lieu d’affaiblir la tension avec un potentiomètre en série (qui bloque le moteur à bas régime et chauffe), le couple complémentaire BC557 + BC338 avec le condensateur 100 µF forme un oscillateur à rapport cyclique variable (PWM). Chaque impulsion applique les pleins 3 V au moteur pour décoller les frottements du rotor, puis coupe brièvement ; c’est la largeur des impulsions (rapport cyclique) qui dose la vitesse moyenne tout en gardant un couple élevé.',
          ar: 'بدلاً من خفض الجهد بمقاومة تسلب عزم البدء، يشكّل الثنائي BC557 + BC338 مع المكثف 100µF مذبذب نبضات PWM. كل نبضة تعطي المحرك كامل جهد 3V للتغلب على الاحتكاك الابتدائي ثم تنقطع لحظياً؛ وبتغيير عرض النبضة تتغير السرعة بسلاسة مع الحفاظ على عزم دوران قوي حتى في السرعات البطيئة.',
          en: 'Rather than starving the motor through a resistive dropper, complementary pair BC557 + BC338 with the 100 µF timing cap oscillates as a PWM pulse generator. Each pulse hits the motor with full 3 V rail voltage to overcome static rotor friction, while adjusting pulse duty cycle smoothly controls average speed without losing low-speed torque.',
        },
        components: ['BC557', 'BC338', '100u', '47R', '22k', 'Moteur 3V'],
      },
    ],
    prediction: {
      question: {
        fr: 'Dans le Touch Switch de la page 50, on touche brièvement les pastilles ON puis on retire le doigt. Pourquoi la lampe reste-t-elle allumée ?',
        ar: 'في مفتاح اللمس (ص ٥٠)، نلمس لوح ON لحظة ثم نرفع الإصبع. لماذا يظل المصباح مضيئاً؟',
        en: 'In the p. 50 Touch Switch, you briefly tap ON and lift your finger. Why does the lamp stay lit?',
      },
      options: [
        { fr: 'Le doigt laisse une charge statique sur la carte', ar: 'يترك الإصبع شحنة ساكنة على اللوحة', en: 'Your finger leaves static charge on the board' },
        { fr: 'La résistance 4M7 renvoie le courant de sortie vers l’entrée', ar: 'المقاومة 4M7 تُعيد جزءاً من تيار الخرج إلى قاعدة الدخل', en: 'The 4M7 resistor feeds output current back to the input' },
        { fr: 'Le BC557 reste bloqué mécaniquement', ar: 'يبقى BC557 مقفولاً ميكانيكياً', en: 'The BC557 locks mechanically' },
      ],
      correctIndex: 1,
      explanation: {
        fr: 'La résistance de 4,7 MΩ connecte le collecteur de sortie (BC557) à la base d’entrée : une fois allumé, le circuit s’auto-alimente (« take the place of your finger », p. 50).',
        ar: 'تصل مقاومة 4M7 خرج BC557 بمدخل الزوج الفائق فتقوم مقام إصبعك وتحافظ على الترانزستورات في حالة توصيل مستمر حتى تلمس لوح OFF.',
        en: 'The 4.7 MΩ resistor links the BC557 output collector back to the input base: once on, it feeds itself (“taking the place of your finger,” p. 50).',
      },
    },
    teacherNote: {
      fr: 'Détail du livre (p. 50) : toucher OFF active un BC547 qui tire la base de la paire Darlington vers 0 V (« robs the super transistor of voltage ») et casse la boucle de maintien.',
      ar: 'تفصيل من الكتاب (ص ٥٠): لمس لوح OFF يشغّل ترانزستور BC547 إضافياً يسحب جهد القاعدة نحو الصفر فينكسر التثبيت وتنطفئ الدارة.',
      en: 'Book detail (p. 50): touching OFF turns on an extra BC547 that pulls the Darlington base to 0 V (“robs the super transistor of voltage”), breaking the latch.',
    },
  },
  {
    id: 6,
    slug: 'oscillators-multivibrators',
    pageRef: 'pp. 32–33, 48, 58, 74–75, 91',
    title: {
      fr: '6. Oscillateurs, Clignotants & Sirènes',
      ar: '٦. المذبذبات، الوماضات وصفّارات الإنذار',
      en: '6. Oscillators, Flashers & Sirens',
    },
    subtitle: {
      fr: 'Comment deux transistors battent la mesure sans aucun circuit intégré',
      ar: 'كيف تتبادل الترانزستورات التوصيل لتوليد النبضات والأصوات',
      en: 'How two transistors keep rhythm with zero integrated circuits',
    },
    analogyTitle: {
      fr: 'La balançoire électronique (Multivibrateur astable)',
      ar: 'الأرجوحة الإلكترونية (المذبذب غير المستقر)',
      en: 'The Electronic Seesaw (Astable Multivibrator)',
    },
    analogyText: {
      fr: 'Deux transistors reliés en boucle par deux condensateurs ne peuvent jamais rester allumés en même temps : quand Q1 conduit, le condensateur coupe Q2 pendant qu’il se charge, puis Q2 bascule et coupe Q1. L’oscillation continue à l’infini !',
      ar: 'ترانزستوران مترابطان بمكثفين يتبادلان الأدوار تلقائياً: عندما يعمل Q1 يُشحن المكثف ويُطفئ Q2، وحين يمتلئ ينعكس المشهد باستمرار بلا توقف.',
      en: 'Two transistors cross-coupled by two capacitors can never stay on together: when Q1 conducts, its capacitor holds Q2 off while charging, then Q2 flips on and cuts Q1 off endlessly!',
    },
    theory: [
      {
        fr: 'Dans « Robot Man » (p. 58 & 91), deux BC547 + deux condensateurs de 100 µF + deux 10 kΩ font clignoter les deux yeux rouges en alternance à ~1,4 Hz.',
        ar: 'في «الرجل الآلي» (ص ٥٨ و٩١)، يتبادل ترانزستورا BC547 ومكثفا 100µF إضاءة عينيه الحمراوين بالتناوب.',
        en: 'In “Robot Man” (pp. 58 & 91), two BC547s + two 100 µF caps + two 10 kΩ resistors blink two red eyes alternately at ~1.4 Hz.',
      },
      {
        fr: 'Dans le « Chenillard 3 LEDs — Running Hole » (p. 74–75), 3 étages bouclés en anneau font courir un « trou » lumineux. Avec un NPN + PNP couplés en audio (« Ticking Bomb / Siren », p. 48), on obtient des clics ou une sirène !',
        ar: 'في «ملاحق المصابيح الثلاثي» (ص ٧٤–٧٥)، تدور الإضاءة في حلقة مغلقة، وبدمج NPN و PNP (ص ٤٨) نولّد صوت قنبلة موقوتة أو صفارة إنذار!',
        en: 'In the “3-LED Running Hole Chaser” (pp. 74–75), a 3-stage ring chases around a loop. Pairing NPN + PNP (p. 48) creates clicks or a siren!',
      },
    ],
    formula: 'f ≈ 1 / (1,38 × R × C)',
    formulaVars: [
      { symbol: 'f', meaning: { fr: 'Fréquence d’oscillation', ar: 'تردد التذبذب', en: 'Oscillation frequency' }, unit: 'Hz' },
      { symbol: 'R', meaning: { fr: 'Résistance de base (ex. 10k–220k)', ar: 'مقاومة القاعدة', en: 'Base resistor (e.g. 10k–220k)' }, unit: 'kΩ' },
      { symbol: 'C', meaning: { fr: 'Condensateur de couplage', ar: 'مكثف الربط', en: 'Coupling capacitor' }, unit: 'µF' },
    ],
    examples: [
      {
        id: 'flipflop-2led',
        pageRef: 'p. 58 & p. 91',
        title: { fr: 'Clignotant 2 LEDs (Robot Man)', ar: 'ومّاض مصباحين بالتناوب (ص ٥٨ و٩١)', en: '2-LED Flasher (Robot Man)' },
        summary: {
          fr: 'Multivibrateur astable à 2×BC547 : ajustez la résistance R de 4k7 à 47k et observez le basculement alterné de LED1 et LED2 + signaux sur l’oscilloscope.',
          ar: 'مذبذب متناوب بترانزستورين: غيّر قيمة المقاومة وراقب تبادل LED1 و LED2 على اللوحة وعلى راسم الإشارة.',
          en: '2×BC547 astable multivibrator: adjust R from 4k7 to 47k and watch LED1/LED2 alternate on board and scope.',
        },
        howItWorks: {
          fr: 'Les deux condensateurs 100 µF relient en croix le collecteur de chaque transistor à la base de l’autre. À l’instant où Q1 sature, son collecteur tombe près de 0 V et pousse la borne droite de C1 vers une tension négative (~−5,4 V), bloquant net Q2 et éteignant LED2. Pendant que LED1 brille, R recharge C1 vers +6 V jusqu’à ce que la base de Q2 atteigne +0,6 V : Q2 sature alors d’un coup, bloque Q1 via C2, et le cycle alterne indéfiniment à f ≈ 1/(1,38·R·C).',
          ar: 'يربط مكثفا 100µF مجمّع كل ترانزستور بقاعدة الآخر بشكل متقاطع. لحظة فتح Q1 يهبط مجمّعه نحو الصفر فيدفع قاعدة Q2 مؤقتاً إلى جهد سالب ويُطفئ LED2؛ بينما تبدأ المقاومة R بشحن المكثف حتى يبلغ جهد قاعدة Q2 قيمة +0.6V فيشتعل Q2 فجأة ويُطفئ Q1 عبر المكثف الثاني، وتتكرر الأرجوحة بلا توقف بتردد f ≈ 1/(1.38·R·C).',
          en: 'Two 100 µF capacitors cross-couple each collector to the opposite base. When Q1 snaps ON, its collector drops near 0 V, driving Q2’s base negative (~−5.4 V) and turning LED2 OFF. Resistor R slowly recharges that capacitor toward +6 V until Q2’s base crosses +0.6 V, snapping Q2 ON and cutting Q1 OFF symmetrically at f ≈ 1/(1.38·R·C).',
        },
        components: ['2×BC547', '2×100u', '2×10k', '2×330R', '2×LED', '6V'],
      },
      {
        id: 'chaser-3led',
        pageRef: 'p. 74–75',
        title: { fr: 'Chenillard 3 LEDs « Running Hole »', ar: 'ملاحق ٣ مصابيح «الثقب الجاري» (ص ٧٤)', en: '3-LED “Running Hole” Chaser' },
        summary: {
          fr: 'Boucle impaire de 3 transistors BC547 : à chaque instant, l’onde de charge fait tourner l’état éteint/allumé en cercle.',
          ar: 'ثلاث مراحل مترابطة في حلقة فردية تجعل حالة الإضاءة تدور باستمرار من LED1 إلى LED2 ثم LED3.',
          en: 'Odd 3-transistor BC547 ring: the charging wave rotates the active step endlessly around the circle.',
        },
        howItWorks: {
          fr: 'Trois étages identiques (BC547 + 22 µF + 39 kΩ) sont bouclés en anneau Q1 → Q2 → Q3 → Q1. Comme il y a un nombre impair de portes inverseuses (3), aucun équilibre stable n’existe : dès qu’un transistor conduit et bloque son successeur, le 3ᵉ transistor redevient passant, ce qui finit par basculer le 1ᵉʳ après décharge de 22 µF dans 39 kΩ. On voit ainsi un « trou » éteint (ou une LED allumée) courir en boucle.',
          ar: 'تتشابك ثلاث مراحل متماثلة في حلقة دائرية مغلقة (Q1 → Q2 → Q3 → Q1). وبما أن العدد فردي (3 عاكسات)، يستحيل ثبات الدارة على حالة ساكنة: كل مرحلة مشبعة توقف التالية وتسمح للثالثة بالعمل، ثم تتفرغ سعة 22µF عبر 39kΩ لتنقل الدور للمرحلة الموالية فتدور النبضة الضوئية باستمرار.',
          en: 'Three identical RC-coupled stages form a closed ring Q1 → Q2 → Q3 → Q1. Because an odd number of inverting stages cannot latch symmetrically, conduction propagates around the loop as each 22 µF capacitor recharges through 39 kΩ, creating a continuous 3-step chase pattern.',
        },
        components: ['3×BC547', '3×22u', '3×39k', '3×1k', '3×LED', '6V'],
      },
      {
        id: 'siren-tick',
        pageRef: 'p. 48',
        title: { fr: 'Tic-Tac & Sirène NPN + PNP', ar: 'صوت الساعة والصفارة NPN+PNP (ص ٤٨)', en: 'NPN + PNP Tick-Tock & Siren' },
        summary: {
          fr: 'Montage BC547 + BC557 avec condensateur 2u2 et haut-parleur 8 Ω. Activez le son pour entendre le rythme du potentiomètre ou la sirène !',
          ar: 'دارة BC547 مع BC557 ومكبر صوت 8Ω: فعّل الصوت لتسمع نبضات الساعة أو تدرّج نغمة الصفارة.',
          en: 'BC547 + BC557 circuit with 2.2 µF cap and 8 Ω speaker. Unmute audio to hear the tick rhythm or siren sweep!',
        },
        howItWorks: {
          fr: 'Contrairement au multivibrateur à 2 NPN où un transistor est toujours allumé, l’association complémentaire BC547 (NPN) + BC557 (PNP) s’allume et se bloque SIMULTANÉMENT ! Entre deux impulsions brèves, les deux transistors sont totalement coupés (quasi 0 mA consommé) tandis que le condensateur se charge via le potentiomètre 200 kΩ. Dès le seuil atteint, les deux se saturent en avalanche positive pour envoyer une brève impulsion sonore dans le haut-parleur 8 Ω (tic-tac lent avec 2,2 µF, ou note continue / sirène avec 100 nF).',
          ar: 'بربط NPN (BC547) مع PNP (BC557) في تغذية راجعة موجبة، يفتح الترانزستوران معاً وينغلقان معاً! في فترة الشحن عبر المقاومة المتغيرة 200kΩ يكون الاثنان مقطوعين تماماً دون استهلاك طاقة، ثم يتدفقان فجأة لإطلاق نبضة قصيرة قوية نحو مكبر الصوت 8Ω (تكتكة ساعة بطيئة مع 2.2µF أو صفارة متواصلة مع 100nF).',
          en: 'Pairing NPN BC547 and PNP BC557 in positive feedback locks both transistors OFF together during idle timing while the capacitor charges through the 200 kΩ pot (saving battery!). Once threshold hits, both snap ON simultaneously to dump a crisp pulse into the 8 Ω speaker—producing slow clock ticks with 2.2 µF or continuous audio/siren tones with 100 nF.',
        },
        components: ['BC547', 'BC557', '2u2 / 100n', '200k pot', 'HP 8Ω', '9V'],
      },
    ],
    prediction: {
      question: {
        fr: 'Dans le clignotant à 2 transistors (p. 91), si on double la valeur des deux condensateurs (100 µF → 220 µF), comment évolue le clignotement ?',
        ar: 'في ومّاض الترانزستورين (ص ٩١)، إذا ضاعفنا سعة المكثفين (من 100µF إلى 220µF)، كيف يتغيّر الوميض؟',
        en: 'In the 2-transistor flasher (p. 91), if you double both capacitors (100 µF → 220 µF), what happens to the blink rate?',
      },
      options: [
        { fr: 'Il devient environ deux fois plus lent', ar: 'يصبح أبطأ بنحو الضعف', en: 'It becomes about twice as slow' },
        { fr: 'Il devient deux fois plus rapide', ar: 'يصبح أسرع بنحو الضعف', en: 'It becomes twice as fast' },
        { fr: 'Les deux LEDs restent allumées en continu', ar: 'يظل المصباحان مضيئين معاً بلا انقطاع', en: 'Both LEDs stay on continuously' },
      ],
      correctIndex: 0,
      explanation: {
        fr: 'La période de basculement est proportionnelle à R × C. Un condensateur deux fois plus grand met deux fois plus de temps à se charger/décharger, donc la fréquence est divisée par 2.',
        ar: 'زمن الدورة يتناسب طردياً مع R × C؛ فمضاعفة السعة تضاعف زمن الشحن والتفريغ فتقلّ سرعة الوميض للنصف.',
        en: 'Switching period scales with R × C. Doubling capacitance doubles charge/discharge time, halving blink frequency.',
      },
    },
    teacherNote: {
      fr: 'Note de Faraday (p. 75) : le chenillard « Running Hole » exige un nombre impair de transistors (3, 5, 7...) ; un nombre pair bloquerait la boucle en deux moitiés statiques !',
      ar: 'ملاحظة مهمة (ص ٧٥): دارة «الثقب الجاري» تتطلب عدداً فردياً من المراحل (٣ أو ٥)، لأن العدد الزوجي يتوقف في حالة مستقرة!',
      en: 'Design note (p. 75): the “Running Hole” chaser requires an odd number of stages (3, 5, 7...); an even ring locks into static halves!',
    },
  },
  {
    id: 7,
    slug: 'boost-1v5',
    pageRef: 'pp. 34–38, 103, 105',
    title: {
      fr: '7. Allumer une LED 3,4 V avec une pile de 1,5 V',
      ar: '٧. تشغيل LED من بطارية 1.5V واحدة (مضخة الشحنة والرفع)',
      en: '7. Lighting a 3.4 V LED from a Single 1.5 V Cell',
    },
    subtitle: {
      fr: 'Pompe de charge capacitive et surtension d’inductance (Joule Thief)',
      ar: 'كيف نرفع 1.5V إلى أكثر من 3.4V لإضاءة الـ LED الأبيض؟',
      en: 'Capacitive charge pump and inductive flyback boost (Joule Thief)',
    },
    analogyTitle: {
      fr: 'L’élévateur de tension : condensateur ou bobine',
      ar: 'مضاعِف الجهد بالمكثف أو بالملف المغناطيسي',
      en: 'Voltage Booster: Capacitor or Inductor',
    },
    analogyText: {
      fr: 'Une LED rouge demande ≥ 1,7 V et une blanche ≥ 3,2 V : une seule pile de 1,5 V ne suffit jamais en direct ! Le livre montre deux astuces géniales : empiler un condensateur chargé en série (p. 34), ou couper brutalement le courant d’une bobine pour déclencher un pic inductif (p. 36 & 103).',
      ar: 'يحتاج الـ LED الأحمر إلى 1.7V والأبيض إلى 3.4V، لذا لا يكفي 1.5V مباشرة. يعرض الكتاب حيلتين: تكديس مكثف مشحون على التوالي (ص ٣٤)، أو قطع تيار ملفّ فجأة لتوليد نبضة جهد عالية (ص ٣٦ و١٠٣).',
      en: 'A red LED needs ≥ 1.7 V and white ≥ 3.2 V—one 1.5 V cell isn’t enough directly! Two clever tricks: stack a charged capacitor in series (p. 34), or snap off an inductor coil for a voltage kick (pp. 36 & 103).',
    },
    theory: [
      {
        fr: 'Pompe de charge « LED on 1.5V Supply » (p. 34) : Phase A, le condensateur 1 µF se charge à ~1,3 V ; Phase B, le transistor tire son pôle positif à 0 V, ce qui place son pôle négatif à −1 V. La LED voit alors 1,5 V − (−1 V) = 2,5 V !',
        ar: 'مضخة الشحنة (ص ٣٤): في الطور A يُشحن المكثف إلى ~1.3V؛ وفي الطور B يسحب الترانزستور طرفه الموجب للصفر فيصبح السالب عند −1V، فيرى الـ LED مجموع 2.5V!',
        en: 'Charge pump “LED on 1.5 V Supply” (p. 34): Phase A charges 1 µF to ~1.3 V; Phase B pulls its positive side to 0 V, pushing the negative end to −1 V—so the LED sees 1.5 V − (−1 V) = 2.5 V!',
      },
      {
        fr: 'Torche 1,5 V / Bike Flasher sans ferrite (p. 36–38 & 103) : tant que le transistor conduit, la bobine stocke de l’énergie magnétique. Dès qu’il se bloque, le flux s’effondre et la tension grimpe (V = L·dI/dt) jusqu’à ce que la LED blanche conduise.',
        ar: 'كشّاف 1.5V وومّاض الدراجة (ص ٣٦ و١٠٣): يخزّن الملف طاقة مغناطيسية أثناء التوصيل، وعند انقطاع الترانزستور ينهار المجال فينشأ جهد مرتفع (> 4V) يضيء الـ LED الأبيض بلمعان قوي.',
        en: '1.5 V Torch / Air-Core Bike Flasher (pp. 36–38 & 103): the coil stores magnetic energy while conducting; when cut off, collapsing flux spikes V = L·dI/dt until the white LED lights.',
      },
    ],
    formula: 'V_LED = V_batt + |V_boost|',
    formulaVars: [
      { symbol: 'V_batt', meaning: { fr: 'Pile 1,5 V (même usée !)', ar: 'بطارية 1.5V (حتى الضعيفة)', en: '1.5 V cell (even worn!)' }, unit: 'V' },
      { symbol: 'V_cap / L·dI/dt', meaning: { fr: 'Surtension ajoutée par C ou L', ar: 'الجهد المضاف من المكثف أو الملف', en: 'Boost voltage from C or L' }, unit: '+1 à +5 V' },
    ],
    examples: [
      {
        id: 'charge-pump',
        pageRef: 'p. 34–35',
        title: { fr: 'Pompe de charge 1,5 V → 2,5 V (Schémas A & B)', ar: 'مضخة الشحنة 1.5V ← 2.5V (ص ٣٤)', en: '1.5 V → 2.5 V Charge Pump (A & B)' },
        summary: {
          fr: 'Basculez entre Phase A (Charge du 1 µF) et Phase B (Addition des tensions dans la LED), ou laissez tourner en mode auto !',
          ar: 'بدّل يدوياً أو تلقائياً بين الطور A (شحن المكثف) والطور B (جمع 1.5V + 1.0V لإضاءة الـ LED).',
          en: 'Switch between Phase A (Charging 1 µF) and Phase B (Stacking into the LED), or run auto mode!',
        },
        howItWorks: {
          fr: 'Un oscillateur à deux BC547 bascule en permanence le 3ᵉ transistor. Phase A : le condensateur 1 µF est relié entre +1,5 V et la masse, il se charge à ~1,3 V (+ à gauche, − à droite). Phase B : le transistor relie brutalement la borne + du condensateur à 0 V (GND) ; comme la tension d’un condensateur ne change pas instantanément, sa borne négative plonge à −1,3 V ! La LED rouge voit alors +1,5 V d’un côté et −1,3 V de l’autre (≈ 2,5 V nets), suffisant pour briller vivement.',
          ar: 'يقوم مذبذب بترانزستورين بتبديل ترانزستور الضخ باستمرار: في الطور A يُشحن المكثف 1µF من بطارية 1.5V حتى نحو 1.3V. في الطور B يسحب الترانزستور الطرف الموجب للمكثف إلى الأرضي (0V)، فيهبط طرفه السالب لحظياً إلى −1.3V! فتصبح الـ LED الحمراء بين +1.5V و −1.3V لتتلقى فرقاً يتجاوز 2.5V وتضيء بقوة.',
          en: 'A two-transistor oscillator toggles the pump switch continuously. Phase A charges the 1 µF cap across the 1.5 V cell to ~1.3 V. Phase B pulls the cap’s positive terminal down to 0 V GND; because capacitor voltage holds steady, its negative side plunges below ground (~−1.0 to −1.3 V), giving the LED ~2.5 V across its leads to flash brightly.',
        },
        components: ['3×BC547', '1u', '2×10n', '100R', 'LED Rouge', '1.5V'],
      },
      {
        id: 'bike-flasher',
        pageRef: 'p. 36',
        title: { fr: 'Feu vélo 1,5 V (Bobine sans noyau · 2 LEDs)', ar: 'ومّاض دراجة 1.5V بملف هوائي (ص ٣٦)', en: '1.5 V Bike Flasher (Air Coil · 2 LEDs)' },
        summary: {
          fr: 'Une simple bobine à air (30+30 spires, sans ferrite !) et un condensateur 10 µF font clignoter 2 LEDs blanches en série sous 1,5 V.',
          ar: 'ملف هوائي بدون قلب فيريت (30+30 لفة) ومكثف 10µF يومضان مصباحَي LED أبيضين من خلية 1.5V.',
          en: 'A simple air-core coil (30+30 turns, no ferrite!) and 10 µF cap flash 2 white LEDs in series from 1.5 V.',
        },
        howItWorks: {
          fr: 'Le bobinage double (30 + 30 spires sur mandrin d’air) sert de transformateur de rétroaction : le courant initial via 100 kΩ et 10 µF amorce le BC547, qui fait croître le courant dans l’enroulement collecteur et induit une tension positive renforçant la base. Lorsque le condensateur 10 µF se bloque et que le transistor coupe d’un coup, le champ magnétique de la bobine s’effondre et génère une pointe > 6,5 V qui allume brièvement deux LEDs blanches en série (~3,3 V chacune) à partir d’une seule pile 1,5 V.',
          ar: 'يعمل الملف الهوائي المزدوج (30+30 لفة) كمحوّل تغذية راجعة: يبدأ التيار عبر 100kΩ بتشغيل الترانزستور فيتزايد الفيض المغناطيسي، وعندما ينقطع الترانزستور فجأة ينهار الفيض ليولّد قفزة جهد تتجاوز 6.5V فتضيء مصباحَي LED أبيضين على التوالي بوضوح من بطارية 1.5V واحدة.',
          en: 'The bifilar air-core winding (30+30 turns) acts as a feedback transformer: initial base drive via 100 kΩ turns on the BC547, ramping coil current while inducing reinforcing base feedback. When the 10 µF cap runs out and the transistor snaps OFF, collapsing flux spikes past 6.5 V to flash two white LEDs in series from a single 1.5 V cell.',
        },
        components: ['BC547', 'Bobine 30t+30t air', '10u', '100k', '2×LED Blanche', '1.5V'],
      },
      {
        id: 'joule-thief',
        pageRef: 'p. 103',
        title: { fr: 'Torche LED Blanche 1,5 V (Ferrite F29)', ar: 'كشّاف LED أبيض 1.5V بقلب فيريت (ص ١٠٣)', en: '1.5 V White LED Torch (F29 Ferrite)' },
        summary: {
          fr: 'Avec noyau ferrite F29 (60t+40t) et BC337 : oscille à haute fréquence pour fournir un faisceau blanc continu très lumineux jusqu’à 0,85 V.',
          ar: 'بقلب الفيريت F29 وترانزستور BC337 يتذبذب بسرعة عالية ليضيء كشّاف LED أبيض ساطعاً حتى هبوط البطارية إلى 0.85V.',
          en: 'F29 ferrite core (60t+40t) and BC337 oscillate at high frequency for a bright steady white beam down to 0.85 V.',
        },
        howItWorks: {
          fr: 'Le noyau ferrite F29 (60 + 40 spires) concentre beaucoup plus d’énergie magnétique qu’une bobine à air, permettant au BC337 d’osciller entre 30 kHz et 100 kHz. Pendant chaque phase ON, la bobine primaire stocke le courant de la pile ; dès que la ferrite sature, la tension de base retombe, le BC337 bloque et l’enroulement libère une pointe à > 3,4 V directement dans la LED blanche. Grâce à la haute fréquence, la lumière paraît totalement continue même avec une pile « morte » à 0,85 V.',
          ar: 'يضاعف قلب الفيريت F29 (60+40 لفة) الحث المغناطيسي فيجعل الترانزستور BC337 يتذبذب بسرعة فائقة (30–100 kHz). يخزّن الملف الطاقة في طور التوصيل ثم يرفع الجهد فوق 3.4V في طور الانقطاع لتفريغها عبر الـ LED البيضاء. وبسبب السرعة العالية تبدو الإضاءة مستمرة وثابتة حتى مع بطارية مستهلكة هبطت إلى 0.85V.',
          en: 'The F29 ferrite toroid (60+40 turns) packs far higher inductance than an air coil, driving the BC337 at 30–100 kHz. During each ON pulse the primary ramps up current from the cell until the core saturates, snapping the transistor OFF and kicking collector voltage past 3.4 V into the white LED—appearing rock-steady to the eye even down to a 0.85 V worn cell.',
        },
        components: ['BC337', 'Ferrite F29 60t+40t', '2k7', '10n', 'LED Blanche', '1.5V'],
      },
    ],
    prediction: {
      question: {
        fr: 'Dans le Bike Flasher / Joule Thief (p. 38 & 103), si on retire la LED blanche pendant que le circuit oscille, que risque le transistor ?',
        ar: 'في دارة رفع الجهد بالملف (ص ١٠٣)، ماذا يحدث للترانزستور إذا فصلنا الـ LED أثناء العمل؟',
        en: 'In the Bike Flasher / Joule Thief (pp. 38 & 103), if you remove the white LED while oscillating, what risks happening?',
      },
      options: [
        { fr: 'La tension de pic n’est plus absorbée et peut dépasser 25–45 V et détruire le transistor', ar: 'يرتفع جهد النبضة بلا حمل يمتصّه وقد يتلف الترانزستور', en: 'Unclamped spikes exceed 25–45 V and can destroy the transistor' },
        { fr: 'La pile se recharge instantanément', ar: 'تشحن البطارية نفسها فوراً', en: 'The battery recharges instantly' },
        { fr: 'Rien, la bobine reste à 1,5 V', ar: 'لا شيء، يبقى الجهد 1.5V', en: 'Nothing, coil stays at 1.5 V' },
      ],
      correctIndex: 0,
      explanation: {
        fr: 'Le livre avertit expressément p. 40 et p. 103 : sans la LED pour absorber et limiter les pointes de tension à ~3,4 V, la bobine génère 25 V à 100 V en circuit ouvert !',
        ar: 'يحذّر الكتاب صراحةً (ص ٤٠ و١٠٣): بدون الـ LED الذي يثبّت الجهد عند ~3.4V ويمتص الطاقة، يقفز جهد الملف إلى عشرات الفولتات ويدمّر الترانزستور.',
        en: 'The book warns on pp. 40 & 103: without the LED clamping spikes at ~3.4 V, open-circuit coil kicks hit 25–100 V!',
      },
    },
    teacherNote: {
      fr: 'Observation du livre (p. 37 & 103) : nos yeux perçoivent la luminosité de crête des impulsions rapides, ce qui rend une LED pulsée plus lumineuse à courant moyen égal !',
      ar: 'ملاحظة فيزيائية من الكتاب (ص ٣٧ و١٠٣): تلتقط العين السطوع الذروي للنبضات السريعة، فتبدو الإضاءة أقوى بنفس متوسط التيار.',
      en: 'Book insight (pp. 37 & 103): our eyes perceive the peak brightness of fast pulses, making pulsed LEDs look brighter at equal average current!',
    },
  },
  {
    id: 8,
    slug: 'solar-and-regulation',
    pageRef: 'pp. 15–18, 45–47',
    title: {
      fr: '8. Régulateur Solaire & Courant Constant',
      ar: '٨. الشاحن الشمسي ومنظم التيار الثابت',
      en: '8. Solar Regulator & Constant Current',
    },
    subtitle: {
      fr: 'Hystérésis de charge 12,5 V–13,7 V et régulation active sans gaspiller',
      ar: 'التحكم الذكي في الشحن (هسترة 12.5V–13.7V) وتثبيت التيار',
      en: '12.5 V–13.7 V charge hysteresis and active current regulation',
    },
    analogyTitle: {
      fr: 'La zone mémoire (hystérésis) et la soupape de limitation',
      ar: 'نطاق الذاكرة (الهسترة) وصمّام تحديد التيار',
      en: 'Memory Zone (Hysteresis) & Current-Limiting Valve',
    },
    analogyText: {
      fr: 'Sans hystérésis, un relais solaire vibrerait sans cesse autour de 13,7 V ! Le livre règle la coupure à 13,7 V et n’autorise la reprise que lorsque la batterie redescend à 12,5 V, tout en dérivant les 3,25 W du panneau vers une charge factice 100 Ω.',
      ar: 'بدون نطاق ذاكرة سيتذبذب المرحّل باستمرار عند 13.7V! يضبط الكتاب الفصل عند 13.7V ولا يعيد الشحن إلا عند 12.5V، ويحوّل الطاقة لحِمل وهمي 100Ω.',
      en: 'Without hysteresis, a solar relay chatters endlessly around 13.7 V! The book cuts charging at 13.7 V and waits until 12.5 V to resume, dumping 3.25 W into a 100 Ω dummy load.',
    },
    theory: [
      {
        fr: 'Chargeur solaire 12 V (p. 18) : un panneau 18 V (28 cellules × 0,6 V) est nécessaire pour dépasser les ~15 V d’une batterie 12 V chargée et la chute de diode. À 13,7 V, le BC547 coupe le relais K1 vers la charge factice 100 Ω / 5 W (P = 18²/100 ≈ 3,24 W).',
        ar: 'الشاحن الشمسي (ص ١٨): يلزم لوح 18V (٢٨ خلية) لتجاوز جهد البطارية المشحونة (~15V). عند 13.7V يفصل المرحّل الشحن ويحوّله للحِمل الوهمي (3.24W) حتى يهبط الجهد إلى 12.5V.',
        en: '12 V Solar Charger (p. 18): an 18 V panel (28 cells × 0.6 V) clears a charged ~15 V battery plus diode drop. At 13.7 V, BC547 switches K1 to a 100 Ω / 5 W dummy load (3.24 W).',
      },
      {
        fr: 'Source de courant constant (p. 45–46) : quand le courant dans R_sense atteint I × R = 0,6 V, un BC547 « vole » le courant de base du transistor de puissance. Résultat : 25 mA constants que l’alimentation fasse 6 V ou 15 V !',
        ar: 'مصدر التيار الثابت (ص ٤٥–٤٦): عندما يبلغ هبوط الجهد على مقاومة الاستشعار R2 قيمة 0.6V، يفتح BC547 ويسحب جزءاً من تيار قاعدة الترانزستور الرئيسي فيثبت تيار الـ LED مهما تغيّر جهد المصدر (6V–15V).',
        en: 'Constant Current Source (pp. 45–46): once voltage across R_sense hits I × R = 0.6 V, a BC547 diverts base current from the power transistor—locking ~25 mA steady from 6 V to 15 V!',
      },
    ],
    formula: 'P = V² / R   |   I_const ≈ 0,6 V / R_sense',
    formulaVars: [
      { symbol: '13,7 V / 12,5 V', meaning: { fr: 'Seuils haut et bas (Hystérésis)', ar: 'عتبتا الفصل وإعادة الشحن', en: 'High & low thresholds (Hysteresis)' }, unit: 'V' },
      { symbol: 'P_dummy', meaning: { fr: 'Puissance dissipée (18² / 100)', ar: 'القدرة في الحِمل الوهمي', en: 'Dummy load dissipation (18² / 100)' }, unit: '3,24 W' },
      { symbol: 'I_const', meaning: { fr: 'Courant régulé (ex. R = 22 Ω → 27 mA)', ar: 'التيار الثابت المضبوط بـ R2', en: 'Regulated current (e.g. 22 Ω → 27 mA)' }, unit: 'mA' },
    ],
    examples: [
      {
        id: 'solar-charger',
        pageRef: 'p. 18',
        title: { fr: 'Régulateur Solaire à Relais 12V', ar: 'منظّم الشاحن الشمسي 12V (ص ١٨)', en: '12 V Relay Solar Regulator' },
        summary: {
          fr: 'Montez V_batt jusqu’à 13,7 V (le relais bascule vers 100 Ω qui chauffe à 3,24 W), puis redescendez : la charge ne reprend qu’à ≤ 12,5 V.',
          ar: 'ارفع جهد البطارية إلى 13.7V فينفصل الشحن ويسخن الحِمل الوهمي، ثم انزل بالمنزلق: لن يعود الشحن عند 13V بل عند 12.5V!',
          en: 'Raise V_batt to 13.7 V (relay diverts to 100 Ω load at 3.24 W), then lower it: charging stays off until ≤ 12.5 V.',
        },
        howItWorks: {
          fr: 'Le potentiomètre 1 kΩ prélève une fraction de la tension batterie vers la base du BC547 : tant que la batterie est sous 13,7 V, le BC547 est bloqué et le relais au repos dirige le courant du panneau solaire 18 V directement vers la batterie. Dès 13,7 V, le BC547 s’ouvre et colle la bobine du relais : celui-ci dévie alors le panneau vers la résistance de dissipation 100 Ω / 5 W (P = 18²/100 = 3,24 W). Grâce à la marge mécanique entre tension de collage et de relâchement du relais (hystérésis), la charge ne reprend que sous 12,5 V.',
          ar: 'يرسل مقسّم الضبط 1kΩ عيّنة من جهد البطارية إلى قاعدة BC547: ما دامت البطارية دون 13.7V يبقى الترانزستور مغلقاً ويمر تيار اللوح الشمسي 18V مباشرة إلى البطارية. وعند بلوغ 13.7V يفتح BC547 ويشغّل المرحّل الذي يحوّل طاقة اللوح إلى المقاومة الوهمية 100Ω / 5W لتفريغها كحرارة (3.24W). وبفضل الفرق بين تيار الشدّ وتيار الإفلات في المرحّل (الهسترة)، لا يعود الشحن إلا عندما يهبط الجهد تحت 12.5V.',
          en: 'A 1 kΩ trimmer samples battery voltage into the BC547 base. Below 13.7 V, the transistor stays OFF and the relaxed relay routes the 18 V solar panel straight into the battery. At 13.7 V, BC547 energizes the relay coil, diverting panel current into the 100 Ω / 5 W dummy load (3.24 W). Because a relay’s drop-out current is much lower than pull-in current (natural hysteresis), charging stays off until battery voltage falls to 12.5 V.',
        },
        components: ['Panneau 18V (28 cel.)', 'BC547', 'Pot 1k', 'Relais 12V', '100R 5W', 'Batterie 12V'],
      },
      {
        id: 'constant-current',
        pageRef: 'p. 45–46',
        title: { fr: 'Source de Courant Constant (6V–15V)', ar: 'مصدر التيار الثابت (ص ٤٥–٤٦)', en: 'Constant Current Source (6 V–15 V)' },
        summary: {
          fr: 'Variez la tension de 6 V à 15 V et choisissez R_sense (120R, 47R, 22R) : le BC547 régule automatiquement I_LED sans recalculer la résistance !',
          ar: 'غيّر جهد المصدر من 6V إلى 15V واختر R_sense: يحافظ BC547 على تيار ثابت تماماً للـ LED دون زيادة خطرة.',
          en: 'Sweep supply from 6 V to 15 V and pick R_sense (120R, 47R, 22R): BC547 holds I_LED steady without changing series resistors!',
        },
        howItWorks: {
          fr: 'Le courant qui traverse les LEDs et le transistor de puissance BD679 passe intégralement par la résistance de mesure R_sense reliée à la masse, créant une tension U_sense = I_LED × R_sense. La base d’un petit BC547 surveille cette tension : dès qu’elle tente de dépasser 0,6 V, le BC547 conduit et détourne le courant provenant de la 10 kΩ loin de la base du BD679. Cette contre-réaction automatique bloque le courant exactement à I_const ≈ 0,6 V / R_sense, quelle que soit la tension d’alimentation (6 à 15 V).',
          ar: 'يمر كامل تيار الـ LEDs والترانزستور الرئيسي BD679 عبر مقاومة الاستشعار R_sense نحو الأرضي، مولّداً فرق جهد U_sense = I_LED × R_sense. تراقب قاعدة الترانزستور المساعد BC547 هذا الجهد؛ وفور اقترابه من 0.6V يبدأ BC547 بالتوصيل ويسحب تيار القاعدة القادم من مقاومة 10kΩ بعيداً عن BD679. وهكذا يثبت التيار آلياً عند I_const ≈ 0.6V / R_sense مهما ارتفع جهد المصدر بين 6V و 15V.',
          en: 'All LED current through power transistor BD679 exits via sense resistor R_sense to GND, producing U_sense = I_LED × R_sense. Sensing transistor BC547 watches that voltage across its Base–Emitter: the instant U_sense tries to rise past 0.6 V, BC547 turns on and shunts drive current from the 10 kΩ resistor away from BD679’s base—automatically locking current at I_const ≈ 0.6 V / R_sense across 6–15 V.',
        },
        components: ['BC547', 'BD679 / BC338', 'R_sense (22R–120R)', '10k', 'LEDs', '6–15V'],
      },
    ],
    prediction: {
      question: {
        fr: 'Dans le régulateur solaire (p. 18), la batterie vient d’atteindre 13,7 V et le relais coupe la charge. Si la tension redescend ensuite à 13,0 V, le chargeur reprend-il ?',
        ar: 'في الشاحن الشمسي (ص ١٨)، وصل جهد البطارية إلى 13.7V فتوقف الشحن. إذا نزل الجهد إلى 13.0V، هل يعود الشحن؟',
        en: 'In the solar regulator (p. 18), the battery reaches 13.7 V and cuts off charging. If voltage drops to 13.0 V, does charging resume?',
      },
      options: [
        { fr: 'Oui, immédiatement sous 13,7 V', ar: 'نعم، يعود فوراً تحت 13.7V', en: 'Yes, right below 13.7 V' },
        { fr: 'Non, il reste coupé jusqu’à environ 12,5 V', ar: 'لا، يبقى متوقفاً حتى يهبط الجهد إلى ~12.5V', en: 'No, it stays off until ~12.5 V' },
        { fr: 'Il grille la batterie', ar: 'يحرق البطارية', en: 'It overcharges the battery' },
      ],
      correctIndex: 1,
      explanation: {
        fr: 'C’est tout le rôle de l’hystérésis du relais : à 13,0 V la charge reste coupée pour laisser la batterie se reposer ; elle ne réenclenche qu’à ~12,5 V (p. 18).',
        ar: 'لا يعود الشحن عند 13.0V بل يبقى في نطاق الذاكرة متوقفاً، ولا يعود للعمل إلا عند ~12.5V لحماية المرحّل والبطارية.',
        en: 'That is relay hysteresis: at 13.0 V charging stays off to let the battery rest and only re-engages around 12.5 V (p. 18).',
      },
    },
    teacherNote: {
      fr: 'Écarts relevés dans le livre (p. 18) : le texte écrit « 3,25 W » (arrondi de 18²/100 = 3,24 W) et le schéma dessine 24 cellules alors que le texte corrige lui-même qu’il en faut 28 pour atteindre ~17–18 V.',
      ar: 'تدقيق من الكتاب (ص ١٨): يكتب الكتاب 3.25W تقريبًا لـ 18²/100 = 3.24W، ويرسم ٢٤ خلية بينما ينبه في النص على وجوب ٢٨ خلية.',
      en: 'Book note (p. 18): text rounds 18²/100 = 3.24 W to “3.25 W,” and the drawing shows 24 cells while the text notes 28 are needed for ~17–18 V.',
    },
  },
  {
    id: 9,
    slug: 'self-bias-challenge',
    pageRef: 'pp. 3 (D, E) & 6',
    title: {
      fr: '9. Défi d’ingénierie : Polarisation à mi-tension',
      ar: '٩. تحدّي الهندسة: التحيّز الذاتي عند نصف الجهد',
      en: '9. Engineering Challenge: Mid-Rail Self-Bias',
    },
    subtitle: {
      fr: 'Régler V_C = V_CC / 2 pour obtenir une amplification sans écrêtage',
      ar: 'ضبط جهد المجمّع على 2.5V لتكبير الموجة دون تشويه (Clipping)',
      en: 'Setting V_C = V_CC / 2 for clean amplification without clipping',
    },
    analogyTitle: {
      fr: 'Le point de repos (Q-Point) : centrer l’oscillation au milieu',
      ar: 'نقطة التشغيل الوسطى: لماذا نختار نصف جهد المصدر؟',
      en: 'The Quiescent Point (Q-Point): Centering the Swing',
    },
    analogyText: {
      fr: 'Pour qu’un signal audio puisse monter ET descendre librement entre 0 V et 5 V, il faut placer le collecteur au centre exact (2,5 V) au repos. Trop haut ou trop bas, la crête ou le creux de la sinusoïde s’écrase !',
      ar: 'لكي تتأرجح الإشارة الصوتية صعوداً وهبوطاً بحرية بين 0V و 5V، يجب تثبيت جهد المجمّع في المنتصف تماماً (2.5V). إذا اقترب من 0V أو 5V يتقصّف أحد طرفي الموجة!',
      en: 'For audio to swing freely UP and DOWN between 0 V and 5 V, idle collector voltage must sit at center (2.5 V). Too high or too low clips the peaks!',
    },
    theory: [
      {
        fr: 'Dans l’étage émetteur commun auto-polarisé (p. 3, Schéma E), R_L = 22 kΩ et V_CC = 5 V. Le livre explique comment choisir R_B (environ 2,2 MΩ) jusqu’à mesurer V_C = 2,5 V au collecteur.',
        ar: 'في مرحلة الباعث المشترك ذاتية التحيّز (ص ٣، الشكل E)، لدينا V_CC = 5V و R_L = 22kΩ. نضبط مقاومة القاعدة R_B (قرابة 2.2MΩ) حتى يقرأ المجمّع 2.5V.',
        en: 'In the self-biased common-emitter stage (p. 3, Diagram E), R_L = 22 kΩ and V_CC = 5 V. Pick R_B (≈ 2.2 MΩ) until collector voltage reads V_C = 2.5 V.',
      },
      {
        fr: 'L’auto-polarisation stabilise le point de fonctionnement : si le transistor tend à conduire davantage, V_C baisse, ce qui réduit I_B (car R_B est reliée au collecteur dans certains montages) ou stabilise le courant de repos.',
        ar: 'بعد ضبط R_B نحو 2.2MΩ، جرّب حقن إشارة جيبية AC على المدخل وراقب راسم الإشارة لتكتشف عملياً سبب اشتراط نصف الجهد!',
        en: 'Self-bias stabilizes the Q-point: if current rises, V_C drops and checks base drive. Inject an AC sine wave to watch clipping vanish at mid-rail!',
      },
    ],
    formula: 'V_C = V_CC − I_C × R_L',
    formulaVars: [
      { symbol: 'V_CC', meaning: { fr: 'Tension d’alimentation', ar: 'جهد التغذية', en: 'Supply voltage' }, unit: '5,0 V' },
      { symbol: 'R_L', meaning: { fr: 'Résistance de charge (collecteur)', ar: 'مقاومة حِمل المجمّع', en: 'Collector load resistor' }, unit: '22 kΩ' },
      { symbol: 'V_C cible', meaning: { fr: 'Demi-tension de repos idéale', ar: 'نصف الجهد المثالي', en: 'Ideal mid-rail voltage' }, unit: '2,50 V' },
    ],
    examples: [
      {
        id: 'half-rail-challenge',
        pageRef: 'p. 3 & p. 6',
        title: { fr: 'Défi : Ajuster R_B pour V_C = 2,50 V + Test AC', ar: 'التحدّي: ضبط R_B واختبار موجة AC', en: 'Challenge: Tune R_B for V_C = 2.50 V + AC Test' },
        summary: {
          fr: 'Ajustez R_B pour viser 2,50 V (± 0,10 V pour 3 étoiles), puis activez le signal sinusoïdal d’entrée pour voir l’écrêtage disparaître au centre !',
          ar: 'اضبط R_B للاقتراب من 2.50V (واحصل على ٣ نجوم)، ثم فعّل موجة الدخل لتشاهد اختفاء التشويه في منتصف النطاق.',
          en: 'Tune R_B toward 2.50 V (± 0.10 V for 3 stars), then enable AC sine input to see clipping disappear at center!',
        },
        howItWorks: {
          fr: 'La résistance de base R_B fixe un courant continu de repos I_B = (5,0 − 0,6) / R_B, qui établit un courant collecteur I_C = β·I_B dans la charge R_L = 22 kΩ et place le potentiel de repos à V_C = 5,0 − I_C·22 kΩ. Lorsque R_B ≈ 2,2 MΩ, V_C vaut exactement 2,50 V (mi-tension) : un signal sinusoïdal AC injecté sur la base dispose alors d’une marge maximale symétrique de ±2,3 V vers le haut (+5 V) et vers le bas (0,2 V) sans écrêtage ni distorsion.',
          ar: 'تحدّد مقاومة القاعدة R_B تيار انحياز مستمر I_B = (5.0 − 0.6)/R_B، والذي يثبّت تيار المجمّع I_C = β·I_B عبر مقاومة الحمل 22kΩ ليضع جهد الراحة عند V_C = 5.0 − I_C·22kΩ. عند قيمة R_B ≈ 2.2MΩ يستقر V_C عند 2.50V تماماً (منتصف التغذية)، فتتأرجح الإشارة الجيبية المدخلة صعوداً نحو 5V وهبوطاً نحو 0.2V بمدى متماثل دون أي تشويه أو اقتصاص.',
          en: 'Base resistor R_B sets the quiescent base bias I_B = (5.0 − 0.6)/R_B, which fixes collector current I_C = β·I_B through the 22 kΩ load resistor and parks idle collector voltage at V_C = 5.0 − I_C·22 kΩ. Tuning R_B near 2.2 MΩ centers V_C at 2.50 V, giving an incoming AC sine wave full symmetric headroom up to +5 V and down to ~0.2 V saturation without clipping.',
        },
        components: ['BC547', 'R_L 22k', 'R_B ≈ 2M2', '5V'],
      },
    ],
    prediction: {
      question: {
        fr: 'Si vous diminuez la résistance de base R_B (de 2,2 MΩ vers 220 kΩ), que fait la tension du collecteur V_C ?',
        ar: 'إذا صغّرتَ مقاومة القاعدة R_B (من 2.2MΩ إلى 220kΩ)، ماذا يحدث لجهد المجمّع V_C؟',
        en: 'If you lower base resistor R_B (from 2.2 MΩ down to 220 kΩ), what happens to collector voltage V_C?',
      },
      options: [
        { fr: 'V_C monte vers 5 V', ar: 'يرتفع V_C نحو 5V', en: 'V_C rises toward 5 V' },
        { fr: 'V_C descend vers 0,2 V', ar: 'يهبط V_C نحو 0.2V', en: 'V_C drops toward 0.2 V' },
        { fr: 'V_C reste figé à 2,5 V', ar: 'يبقى V_C ثابتاً عند 2.5V', en: 'V_C stays fixed at 2.5 V' },
      ],
      correctIndex: 1,
      explanation: {
        fr: 'Une R_B plus petite laisse entrer un courant I_B plus grand → I_C augmente → la chute de tension I_C × R_L augmente → donc V_C = V_CC − I_C × R_L baisse fortement vers la saturation (0,2 V).',
        ar: 'تصغير R_B يزيد تيار القاعدة I_B فيزداد I_C، وبما أن V_C = V_CC − I_C × R_L يهبط جهد المجمّع نحو جهد التشبّع (0.2V).',
        en: 'Smaller R_B passes more I_B → I_C rises → voltage drop I_C × R_L grows → so V_C = V_CC − I_C × R_L plunges toward saturation (0.2 V).',
      },
    },
    teacherNote: {
      fr: 'Note pédagogique (p. 3) : le livre ne précise ni β ni V_BE dans ce paragraphe. Avec V_BE = 0,6 V et β = 57 (typique à faible I_C ≈ 113 µA), R_B = (5 − 0,6) / (113,6 µA / 57) ≈ 2,2 MΩ donne exactement V_C = 2,50 V !',
      ar: 'ملاحظة للمعلم: لم يحدد الكتاب β هنا؛ استخدام β = 57 و V_BE = 0.6V يعطي تطابقاً تاماً مع القيمة المذكورة في الكتاب (R_B ≈ 2.2 MΩ عند V_C = 2.50 V).',
      en: 'Teaching note (p. 3): text omits β and V_BE here. Using V_BE = 0.6 V and β = 57 (typical at ~113 µA), R_B = (5 − 0.6) / (113.6 µA / 57) ≈ 2.2 MΩ yields V_C = 2.50 V!',
    },
  },
];
