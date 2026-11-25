import { ChapterDef } from '../types';

export const KIRCHHOFF_CHAPTERS: ChapterDef[] = [
  {
    id: 1,
    slug: 'kvl-closed-loop',
    pageRef: 'Ch. 1 · KVL',
    title: {
      fr: 'La Loi des Mailles (KVL) : Bilan d’Altitude',
      ar: 'قانون كيرشوف للحلقات (KVL): ميزان الارتفاع',
      en: 'Kirchhoff’s Voltage Law (KVL): The Loop Balance',
    },
    subtitle: {
      fr: 'Sur n’importe quel parcours fermé, tout ce que la pile monte en tension doit être redescendu exactement par les dipôles.',
      ar: 'في أي مسار مغلق، كل ارتفاع للجهد تمنحه البطارية يجب أن يستهلكه مجموع العناصر حتى العودة إلى الصفر.',
      en: 'Around any closed loop, every volt lifted by the supply is dropped across the components back to zero.',
    },
    analogyTitle: {
      fr: 'La randonnée en boucle fermée',
      ar: 'رحلة دائرية في الجبل',
      en: 'The Closed-Loop Mountain Hike',
    },
    analogyText: {
      fr: 'Une pompe (la pile) hisse l’eau de 9 mètres d’altitude. Si l’eau dévale ensuite deux cascades R₁ et R₂ avant de revenir au bassin à 0 m, la somme des deux chutes vaut obligatoirement 9 m — même si R₁ est deux fois plus grande que R₂.',
      ar: 'ترفع المضخة (البطارية) الماء بمقدار 9 أمتار. وعندما ينزل الماء عبر شلالين R₁ و R₂ ليعود إلى مستوى الصفر، فإن مجموع هبوط الشلالين يساوي حتماً 9 أمتار.',
      en: 'A pump lifts water by 9 meters. As it falls down two waterfalls R₁ and R₂ back to ground (0 m), the sum of both drops must equal 9 m—regardless of how big R₁ is compared to R₂.',
    },
    theory: [
      {
        fr: 'Dans une maille fermée orientée, on additionne algébriquement les tensions : +E pour les sources parcourues du − vers le +, et −U pour les récepteurs parcourus dans le sens du courant.',
        ar: 'في حلقة مغلقة موجّهة، نجمع الجهود جبرياً: +E للمصدر من القطب السالب إلى الموجب، و −U للمقاومات في اتجاه التيار.',
        en: 'Following a closed loop, assign +E when crossing a source from − to +, and −U across resistors in the direction of current.',
      },
      {
        fr: 'La somme totale vaut toujours exactement zéro : ∑ U_maille = 0, soit E = U₁ + U₂ (+ U₃). Ce n’est rien d’autre que la conservation de l’énergie par coulomb.',
        ar: 'المجموع الكلي يساوي دائماً صفراً: ∑ U = 0، أي E = U₁ + U₂. وهذا تعبير مباشر عن قانون حفظ الطاقة.',
        en: 'The algebraic sum is always zero: ∑ U_loop = 0, meaning E = U₁ + U₂ (+ U₃). This is conservation of energy per unit charge.',
      },
      {
        fr: 'Réflexe terrain : dans une boucle série, le courant est identique partout, donc la plus grande résistance confisque la plus grande part de tension.',
        ar: 'قاعدة عملية: في التوالي يكون التيار متساوياً في الجميع، لذا تأخذ المقاومة الأكبر الحصة الأكبر من الجهد.',
        en: 'Field rule: in a series loop, current is identical everywhere, so the largest resistor claims the largest share of voltage.',
      },
    ],
    formula: '∑ U_maille = E − U₁ − U₂ = 0   ⇒   U₂ = E · R₂ / (R₁ + R₂)',
    formulaVars: [
      { symbol: 'E', meaning: { fr: 'Force électromotrice (pile)', ar: 'القوة الدافعة للبطارية', en: 'Supply EMF' }, unit: 'V' },
      { symbol: 'U₁, U₂', meaning: { fr: 'Chutes de tension aux bornes', ar: 'هبوط الجهد على المقاومات', en: 'Component drops' }, unit: 'V' },
      { symbol: 'I', meaning: { fr: 'Courant unique de la maille', ar: 'التيار الوحيد في الحلقة', en: 'Shared loop current' }, unit: 'mA' },
    ],
    examples: [
      {
        id: 'kvl-2r-loop',
        pageRef: 'Ex. 1.1',
        title: { fr: 'Maille simple à 2 résistances', ar: 'حلقة بسيطة بمقاومتين', en: 'Basic 2-Resistor Loop' },
        summary: {
          fr: 'Pile 9 V avec R₁ = 1 kΩ et R₂ = 2 kΩ : observez V_A = 6,00 V et ∑U = 0,00 V.',
          ar: 'بطارية 9V مع R₁ = 1kΩ و R₂ = 2kΩ: لاحظ V_A = 6.00V والمجموع = 0.00V.',
          en: '9 V battery with R₁ = 1 kΩ and R₂ = 2 kΩ: watch V_A = 6.00 V and ∑U = 0.00 V.',
        },
        howItWorks: {
          fr: 'Le courant quitte la borne + de E₁, traverse d’abord R₁ puis passe par le nœud intermédiaire A avant de traverser R₂ pour rejoindre la masse 0 V. Comme il n’y a qu’un seul chemin fermé, le même courant I = E₁ / (R₁ + R₂) parcourt les deux résistances. R₁ provoque une première chute U₁ = I·R₁ (de 9 V à V_A), puis R₂ consomme exactement le reste U₂ = V_A = I·R₂ jusqu’à 0 V, garantissant E₁ − U₁ − U₂ = 0.',
          ar: 'يخرج التيار من القطب الموجب للبطارية E₁ ويمر عبر المقاومة الأولى R₁ ليصل إلى العقدة الوسطى A، ثم يكمل عبر R₂ إلى الأرضي 0V. ولأن المسار واحد، يمر نفس التيار I = E₁/(R₁+R₂) في المقاومتين، فتستهلك R₁ الجزء الأول U₁ بينما يظهر الباقي U₂ = V_A على R₂ ليعود الجهد إلى الصفر بدقة.',
          en: 'Current exits the + terminal of E₁, passes through R₁ into midpoint node A, and continues through R₂ down to 0 V GND. Because there is only one closed loop, identical current I = E₁/(R₁+R₂) flows through both resistors: R₁ drops U₁ = I·R₁ and R₂ drops the exact remainder V_A = U₂ = I·R₂ back to zero.',
        },
        components: ['9V', '1kΩ', '2kΩ'],
      },
      {
        id: 'kvl-3r-loop',
        pageRef: 'Ex. 1.2',
        title: { fr: 'Chaîne série à 3 potentiels', ar: 'سلسلة من 3 مقاومات', en: '3-Resistor Voltage Ladder' },
        summary: {
          fr: 'Trois chutes U₁ + U₂ + U₃ qui reconduisent progressivement V+ jusqu’à 0 V.',
          ar: 'ثلاثة هبوطات متتالية U₁ + U₂ + U₃ تعيد الجهد تدريجياً إلى الصفر.',
          en: 'Three consecutive drops U₁ + U₂ + U₃ stepping V+ smoothly down to 0 V.',
        },
        howItWorks: {
          fr: 'Les trois résistances R₁, R₂ et R₃ forment un escalier de potentiel entre E₁ et la masse. Le courant unique vaut I = E₁ / (R₁ + R₂ + R₃). Après R₁, le nœud A se trouve à V_A = E₁ − U₁ ; après R₂, le nœud B descend à V_B = V_A − U₂ = U₃ ; enfin R₃ ramène le potentiel exactement à 0 V. Plus une résistance est grande dans la chaîne, plus sa marche de tension est haute.',
          ar: 'تشكّل المقاومات الثلاث R₁ و R₂ و R₃ سلّماً متدرجاً للجهد من E₁ إلى الصفر. يتحدد التيار بالمجموع I = E₁/(R₁+R₂+R₃)، فيهبط الجهد بعد R₁ إلى V_A ثم بعد R₂ إلى V_B، وتستهلك R₃ الباقي حتى 0V، مع بقاء مجموع الهبوطات مساوياً للمصدر.',
          en: 'R₁, R₂, and R₃ form a three-step potential ladder from E₁ down to GND. Loop current is I = E₁/(R₁+R₂+R₃). Each resistor removes a proportional step U_k = I·R_k, creating intermediate reference nodes V_A and V_B whose drops sum strictly to E₁.',
        },
        components: ['12V', '1kΩ', '2kΩ', '1.5kΩ'],
      },
    ],
    prediction: {
      question: {
        fr: 'Si E = 9 V, R₁ = 1 kΩ et R₂ = 2 kΩ en série, que mesure le voltmètre entre le nœud central A et la masse ?',
        ar: 'إذا كانت E = 9V و R₁ = 1kΩ و R₂ = 2kΩ على التوالي، فماذا يقيس الفولتميتر على النقطة الوسطى A؟',
        en: 'If E = 9 V, R₁ = 1 kΩ and R₂ = 2 kΩ in series, what does a voltmeter read from center node A to GND?',
      },
      options: [
        { fr: '6,00 V (R₂ représente 2/3 de la résistance totale)', ar: '6.00V لأن R₂ تمثّل ثلثي المقاومة الكلية', en: '6.00 V (R₂ is 2/3 of total loop resistance)' },
        { fr: '4,50 V (la pile se partage toujours en deux parts égales)', ar: '4.50V لأن الجهد ينقسم دائماً بالتساوي', en: '4.50 V (voltage always splits 50/50)' },
        { fr: '3,00 V (car R₁ laisse passer moins de courant)', ar: '3.00V لأن R₁ أكبر قرب البطارية', en: '3.00 V (since R₁ is closer to V+)' },
      ],
      correctIndex: 0,
      explanation: {
        fr: 'I = 9 V / 3 kΩ = 3 mA. Donc U₁ = 3 V et U₂ = 3 mA × 2 kΩ = 6,00 V. On vérifie KVL : 9 − 3 − 6 = 0 V !',
        ar: 'التيار I = 9V / 3kΩ = 3mA، إذن U₁ = 3V و U₂ = 6.00V، وبالتحقق 9 − 3 − 6 = 0V.',
        en: 'I = 9 V / 3 kΩ = 3 mA, so U₁ = 3 V and U₂ = 6.00 V. KVL checks out: 9 − 3 − 6 = 0 V.',
      },
    },
    teacherNote: {
      fr: 'Faites remarquer aux élèves que l’ordre des résistances (R₁ puis R₂ vs R₂ puis R₁) change le potentiel V_A mais pas le courant I ni la loi ∑U = 0.',
      ar: 'نبّه الطلاب إلى أن تبديل ترتيب المقاومتين يغيّر جهد النقطة الوسطى V_A لكنه لا يغيّر التيار الكلي.',
      en: 'Point out that swapping R₁ and R₂ changes node potential V_A, yet leaves current I and ∑U = 0 untouched.',
    },
  },
  {
    id: 2,
    slug: 'loaded-voltage-divider',
    pageRef: 'Ch. 2 · Diviseur',
    title: {
      fr: 'Pont Diviseur à Vide vs En Charge (2 Mailles)',
      ar: 'مقسّم الجهد: بين الفراغ والحمل (حلقتان)',
      en: 'Unloaded vs Loaded Voltage Divider',
    },
    subtitle: {
      fr: 'Pourquoi un diviseur calculé pour 4,5 V s’écroule dès qu’on y branche une charge : l’effet combiné de KVL et KCL.',
      ar: 'لماذا ينهار مقسّم الجهد المصمّم لـ 4.5V فور توصيل حمل عليه؟ هنا يجتمع قانونا الحلقات والعقد.',
      en: 'Why a 4.5 V divider sags as soon as a real load draws current—where KVL and KCL collide.',
    },
    analogyTitle: {
      fr: 'La dérivation sur un château d’eau',
      ar: 'تفريع أنبوب من خزان مرتفع',
      en: 'Tapping a Restricted Water Pipe',
    },
    analogyText: {
      fr: 'Si un robinet aval R_L prélève de l’eau au nœud central, tout ce débit supplémentaire doit traverser le tuyau étroit du haut R₁ : la perte de pression dans R₁ augmente et la pression de sortie V_out s’effondre.',
      ar: 'عند فتح صنبور إضافي R_L في المنتصف، يضطر كل ذلك الماء للمرور عبر الأنبوب العلوي R₁، فيزداد الفقد فيه ويهبط الضغط عند المخرج.',
      en: 'When a downstream load R_L taps water at the midpoint, extra flow must squeeze through top pipe R₁, increasing its drop and pulling V_out down.',
    },
    theory: [
      {
        fr: 'À vide (I_L = 0), la loi des mailles donne la formule célèbre V_out = E · R₂ / (R₁ + R₂). C’est l’erreur classique d’oublier que cette formule suppose aucun courant sortant au nœud !',
        ar: 'في الفراغ (I_L = 0) تعطي قاعدة المقسّم V_out = E·R₂/(R₁+R₂)، لكنها تسقط فور سحب تيار من العقدة.',
        en: 'Unloaded (I_L = 0), V_out = E · R₂ / (R₁ + R₂). Applying this blindly to a powered load is a classic beginner pitfall.',
      },
      {
        fr: 'Dès qu’une charge R_L est branchée en parallèle sur R₂, la loi des nœuds impose I₁ = I₂ + I_L. R₂ et R_L forment R_eq = (R₂ // R_L) < R₂.',
        ar: 'بمجرد وصل الحمل R_L، يفرض قانون العقد I₁ = I₂ + I_L، فتصبح المقاومة المكافئة R₂ // R_L أصغر من R₂.',
        en: 'Once R_L connects across R₂, KCL enforces I₁ = I₂ + I_L, making the lower impedance R₂ // R_L smaller than R₂ alone.',
      },
      {
        fr: 'Règle de conception : pour garder la chute sous 10 %, on choisit R₂ ≤ R_L / 10 (règle du « courant de pont 10× ») ou on intercale un suiveur à transistor/AOP.',
        ar: 'قاعدة التصميم: للحفاظ على ثبات الجهد، نختار R₂ ≤ R_L / 10 أو نستخدم عازلاً (Buffer).',
        en: 'Design rule: keep divider bleed current ~10× the load current (R₂ ≤ R_L / 10), or buffer V_out with a transistor/op-amp.',
      },
    ],
    formula: 'V_out = E · (R₂ // R_L) / [R₁ + (R₂ // R_L)]   &   I₁ = I₂ + I_L',
    formulaVars: [
      { symbol: 'R₂ // R_L', meaning: { fr: 'Résistance équivalente basse', ar: 'المكافئة السفلية على التوازي', en: 'Parallel lower resistance' }, unit: 'Ω' },
      { symbol: 'I_L', meaning: { fr: 'Courant prélevé par la charge', ar: 'تيار الحمل المسحوب', en: 'Load current' }, unit: 'mA' },
      { symbol: 'V_out', meaning: { fr: 'Tension réelle au nœud A', ar: 'الجهد الفعلي عند العقدة A', en: 'Loaded node voltage' }, unit: 'V' },
    ],
    examples: [
      {
        id: 'divider-loaded',
        pageRef: 'Ex. 2.1',
        title: { fr: 'Diviseur 10 kΩ chargé par 1 kΩ', ar: 'مقسّم 10kΩ محمّل بـ 1kΩ', en: '10 kΩ Divider Loaded by 1 kΩ' },
        summary: {
          fr: 'Passez de « À vide » (5,00 V) à « En charge » et observez l’effondrement brutal du potentiel.',
          ar: 'جرّب فصل ووصل الحمل R_L وشاهد انهيار الجهد من 5V إلى أقل من 1V.',
          en: 'Toggle R_L on/off and watch V_out drop sharply from 5.0 V as I₁ splits.',
        },
        howItWorks: {
          fr: 'Sans charge, R₁ et R₂ (10 kΩ chacune) ne laissent passer que 0,5 mA et fixent V_A à E₁/2 = 5,00 V. Dès qu’on branche R_L = 1 kΩ entre le nœud A et la masse, la loi des nœuds impose I₁ = I₂ + I_L : la résistance inférieure devient R₂ // R_L ≈ 909 Ω, dix fois plus faible que R₁. Presque toute la tension (9,17 V) chute alors dans R₁ et la sortie s’effondre à ~0,83 V.',
          ar: 'عند فصل الحمل، يمر 0.5mA فقط في R₁ و R₂ فينقسم الجهد بالتساوي (5.00V). لكن بمجرد وصل R_L = 1kΩ على التوازي مع R₂، تتشكّل مقاومة سفلية مكافئة 909Ω فقط، فيسقط معظم الجهد داخل R₁ الكبيرة وينهار جهد المخرج V_A إلى 0.83V.',
          en: 'Unloaded, 10 kΩ/10 kΩ carries 0.5 mA and holds V_A at 5.00 V. Connecting R_L = 1 kΩ from Node A to GND forces I₁ = I₂ + I_L: the bottom equivalent drops to R₂ // R_L = 909 Ω, so R₁ (10 kΩ) steals 9.17 V and output collapses to ~0.83 V.',
        },
        components: ['10V', '10kΩ', '10kΩ', 'R_L'],
      },
      {
        id: 'divider-stiff',
        pageRef: 'Ex. 2.2',
        title: { fr: 'Pont rigide (règle du 1/10)', ar: 'مقسّم صلب (قاعدة 10×)', en: 'Stiff Divider (10× Rule)' },
        summary: {
          fr: 'Avec R₁ = R₂ = 220 Ω et R_L = 2,2 kΩ, le pont ne fléchit presque plus.',
          ar: 'مع مقاومات صغيرة للمقسّم مقارنة بالحمل، يبقى الجهد مستقراً تقريباً.',
          en: 'With R₁ = R₂ = 220 Ω feeding 2.2 kΩ, V_out holds steady within ~5%.',
        },
        howItWorks: {
          fr: 'Ici le courant de repos dans le pont (10 V / 440 Ω ≈ 22,7 mA) est volontairement ~10 fois supérieur au courant tiré par R_L = 2,2 kΩ (~2 mA). L’association R₂ // R_L = 220 // 2200 = 200 Ω reste très proche de 220 Ω : la tension V_A ne baisse que de 5,00 V à 4,76 V, au prix d’une dissipation thermique plus élevée dans R₁ et R₂.',
          ar: 'هنا نصمم المقسّم بمقاومتين صغيرتين (220Ω) ليمر فيه تيار يساوي ~10 أضعاف تيار الحمل R_L (2.2kΩ). وبذلك تبقى المكافئة R₂//R_L = 200Ω قريبة جداً من 220Ω، فيثبت الخرج حول 4.76V دون هبوط حاد، مقابل استهلاك طاقة أعلى في المقسّم.',
          en: 'Using small 220 Ω divider legs sets a ~22.7 mA bleed current—roughly 10× what the 2.2 kΩ load draws (~2.1 mA). Since 220 Ω // 2200 Ω = 200 Ω stays close to 220 Ω, V_out sags only slightly from 5.00 V to 4.76 V.',
        },
        components: ['10V', '220Ω', '220Ω', '2.2kΩ'],
      },
    ],
    prediction: {
      question: {
        fr: 'Un pont 10 V avec R₁ = R₂ = 10 kΩ sort 5,00 V à vide. On y branche une LED/charge R_L = 1 kΩ : à peu près quelle tension reste-t-il ?',
        ar: 'مقسّم 10V بمقاومتين 10kΩ يعطي 5V دون حمل. إذا وصلنا به حملاً 1kΩ، كم سيبقى من الجهد تقريباً؟',
        en: 'A 10 V divider (10 kΩ / 10 kΩ) outputs 5.0 V unloaded. You attach a 1 kΩ load. Roughly what voltage remains?',
      },
      options: [
        { fr: 'Environ 0,83 V (l’association 10 kΩ // 1 kΩ vaut ~0,91 kΩ)', ar: 'حوالي 0.83V لأن التوازي يجعل الأسفل ≈ 0.91kΩ', en: 'About 0.83 V (10 kΩ // 1 kΩ is only ~0.91 kΩ)' },
        { fr: 'Toujours 5,00 V car les résistances du pont n’ont pas changé', ar: 'يبقى 5.00V لأن مقاومتي المقسّم لم تتغيرا', en: 'Still 5.00 V because R₁ and R₂ didn’t change' },
        { fr: '9,10 V car le courant total a augmenté', ar: '9.10V لأن التيار الكلي ازداد', en: '9.10 V because total current increased' },
      ],
      correctIndex: 0,
      explanation: {
        fr: '10 kΩ en parallèle avec 1 kΩ chute à 909 Ω. Sur R₁ = 10 kΩ, la fraction devient 0,91 / 10,91 ≈ 8,3 %, soit 0,83 V !',
        ar: 'مقاومة 10kΩ على التوازي مع 1kΩ تصبح 909Ω، لذا ينخفض الجهد إلى نحو 0.83V.',
        en: '10 kΩ in parallel with 1 kΩ collapses to 909 Ω, leaving only 0.91 / 10.91 ≈ 8.3% of 10 V = 0.83 V.',
      },
    },
    teacherNote: {
      fr: 'Démonstration percutante : demandez aux étudiants pourquoi on n’alimente JAMAIS un moteur ou un Arduino 5 V depuis un simple pont diviseur à partir de 12 V.',
      ar: 'مثال ممتاز يشرح لماذا لا نغذّي محركاً أو لوحة أردوينو عبر مقسّم جهد بسيط.',
      en: 'Great motivating moment: explain why a resistor divider must never power a motor or 5 V microcontroller.',
    },
  },
  {
    id: 3,
    slug: 'dual-sources-kvl',
    pageRef: 'Ch. 3 · Signes',
    title: {
      fr: 'Sens des Flèches & Deux Sources en Maille',
      ar: 'إشارات الجهد ومصدران في حلقة واحدة',
      en: 'Loop Sign Convention & Dual Sources',
    },
    subtitle: {
      fr: 'Quand deux générateurs s’entraident ou s’affrontent dans la même boucle : maîtrisez la somme algébrique sans jamais vous tromper de signe.',
      ar: 'عندما يتعاضد مصدران أو يتعاكسان في الحلقة نفسها: أتقن قواعد الإشارات الجبرية دون أخطاء.',
      en: 'When two voltage sources aid or oppose inside one loop—master algebraic KVL signs effortlessly.',
    },
    analogyTitle: {
      fr: 'Deux cyclistes sur une piste fermée',
      ar: 'دراجتان تدفعان في حلقة مغلقة',
      en: 'Two Pumps Facing Off in One Pipe',
    },
    analogyText: {
      fr: 'Si deux pompes poussent dans le même sens, leurs hauteurs s’additionnent (E₁ + E₂). Si elles se font face, c’est la différence (E₁ − E₂) qui décide à la fois de la valeur ET du sens réel de circulation !',
      ar: 'إذا دفعت مضختان في نفس الاتجاه يُجمع ارتفاعهما (E₁ + E₂)، وإذا تقابلتا يقرّر الفرق (E₁ − E₂) مقدار واتجاه التدفق.',
      en: 'Two pumps aligned in the same direction add their pressure (E₁ + E₂). Facing each other, their difference (E₁ − E₂) sets both magnitude and direction.',
    },
    theory: [
      {
        fr: 'Méthode infaillible : choisissez un sens de parcours arbitraire (ex. horaire). Traversez-vous la pile du − vers le + ? Notez +E. Du + vers le − ? Notez −E.',
        ar: 'الطريقة المضمونة: اختر اتجاه دوران (مثلاً مع الساعة). إذا عبرت البطارية من − إلى + فاكتب +E، ومن + إلى − اكتب −E.',
        en: 'Foolproof rule: pick a loop direction (e.g. clockwise). Crossing a cell from − to + adds +E; crossing from + to − subtracts −E.',
      },
      {
        fr: 'Si votre calcul donne un courant I négatif, inutile de tout recommencer ! Cela signifie simplement que le courant réel circule en sens inverse de votre flèche initiale.',
        ar: 'إذا نتج معك تيار سالب، فلا تعد الحساب! الإشارة السالبة تعني ببساطة أن التيار الحقيقي يعاكس السهم الذي افترضته.',
        en: 'A negative calculated current I is not an error—it simply tells you real current flows opposite to your assumed reference arrow.',
      },
      {
        fr: 'Application réelle : un chargeur 14,2 V branché sur une batterie 12 V (en opposition) impose I = (14,2 − 12) / R pour recharger la batterie.',
        ar: 'تطبيق عملي: شاحن 14.2V موصول مع بطارية 12V في حالة تعاكس يمرّر تيار شحن مقداره (14.2 − 12) / R.',
        en: 'Real-world case: a 14.2 V charger opposing a 12 V battery drives I = (14.2 − 12) / R back into the battery to charge it.',
      },
    ],
    formula: '+E₁ − I·R₁ − I·R₂ ± E₂ = 0   ⇒   I = (E₁ ± E₂) / (R₁ + R₂)',
    formulaVars: [
      { symbol: 'E₁, E₂', meaning: { fr: 'Deux sources dans la maille', ar: 'مصدران داخل الحلقة', en: 'Two loop EMF sources' }, unit: 'V' },
      { symbol: '±E₂', meaning: { fr: '+E₂ en série, −E₂ en opposition', ar: '+E₂ متعاضد، −E₂ متعاكس', en: '+E₂ aiding, −E₂ opposing' }, unit: 'V' },
      { symbol: 'I', meaning: { fr: 'Courant algébrique signé', ar: 'التيار الجبري بإشارته', en: 'Signed loop current' }, unit: 'mA' },
    ],
    examples: [
      {
        id: 'dual-opposing',
        pageRef: 'Ex. 3.1',
        title: { fr: 'Batterie en charge (opposition)', ar: 'شحن بطارية (مصدران متعاكسان)', en: 'Battery Charging (Opposing)' },
        summary: {
          fr: 'E₁ = 12 V oppose E₂ : montez E₂ au-dessus de E₁ pour voir le courant s’inverser en direct.',
          ar: 'ارفع E₂ فوق E₁ لتشاهد انعكاس اتجاه التيار وإشارة الفحص فوراً.',
          en: 'Raise opposing E₂ above E₁ and watch the current arrow flip direction live.',
        },
        howItWorks: {
          fr: 'Les deux bornes positives de E₁ et E₂ se font face à travers les deux résistances R₁ et R₂ en série. La tension motrice nette de la maille vaut ΔE = E₁ − E₂. Tant que E₁ > E₂, E₁ impose un courant positif entrant dans le pôle + de E₂ (la rechargeant). Au-delà de E₂ > E₁, ΔE devient négatif et le sens réel du courant s’inverse instantanément de E₂ vers E₁.',
          ar: 'يتواجه القطبان الموجبان للمصدرين E₁ و E₂ عبر R₁ و R₂ في الحلقة نفسها. القوة المحركة الصافية هي الفرق ΔE = E₁ − E₂: إذا غلب E₁ يدخل التيار إلى القطب الموجب لـ E₂ (حالة شحن)، وعند رفع E₂ فوق E₁ ينعكس اتجاه التيار في الدارة فوراً.',
          en: 'Both + terminals of E₁ and E₂ push against each other through series resistors R₁ and R₂. Net loop EMF is ΔE = E₁ − E₂: when E₁ > E₂, current flows clockwise into E₂’s + terminal (charging it); when E₂ exceeds E₁, net current reverses counter-clockwise.',
        },
        components: ['E₁', 'E₂', '470Ω', '470Ω'],
      },
      {
        id: 'dual-aiding',
        pageRef: 'Ex. 3.2',
        title: { fr: 'Piles en série additive (+)', ar: 'بطاريتان متعاضدتان على التوالي', en: 'Aiding Cells in Series' },
        summary: {
          fr: 'Les deux tensions s’additionnent (E₁ + E₂) dans le même sens autour de la maille.',
          ar: 'يتجمع الجهدان (E₁ + E₂) في الاتجاه نفسه لزيادة التيار.',
          en: 'Both EMFs point clockwise and sum directly (E₁ + E₂) around the loop.',
        },
        howItWorks: {
          fr: 'Ici E₂ est orientée dans le même sens horaire que E₁ (− vers +). En parcourant la maille, les deux forces électromotrices ajoutent leurs efforts : E_tot = E₁ + E₂. Le courant vaut donc (E₁ + E₂) / (R₁ + R₂), exactement comme dans une lampe torche où deux piles sont placées bout à bout pour doubler la tension disponible.',
          ar: 'هنا يتجه المصدران E₁ و E₂ في نفس المسار الدوري (من السالب إلى الموجب). عند تطبيق قانون الحلقات تُجمع القوتان E₁ + E₂ فينشأ تيار أكبر يساوي (E₁ + E₂)/(R₁ + R₂)، تماماً مثل وضع بطاريتين متتاليتين في كشاف يدوي.',
          en: 'Here E₂ is oriented in the same clockwise direction (− to +) as E₁. Walking the loop adds both sources: E_tot = E₁ + E₂, driving I = (E₁ + E₂)/(R₁ + R₂) just like two batteries stacked end-to-end in a flashlight.',
        },
        components: ['9V', '4.5V', '1kΩ', '1kΩ'],
      },
    ],
    prediction: {
      question: {
        fr: 'Dans une même maille, E₁ = 9 V et E₂ = 12 V sont montées + face à + (en opposition) avec R_tot = 1 kΩ. Que vaut le courant ?',
        ar: 'في حلقة واحدة، رُبطت E₁ = 9V و E₂ = 12V بتعاكس (+ مقابل +) مع مقاومة كلية 1kΩ. ما قيمة واتجاه التيار؟',
        en: 'E₁ = 9 V and E₂ = 12 V face each other (+ to + opposing) across R_tot = 1 kΩ. What is the current?',
      },
      options: [
        { fr: '3,0 mA poussés par E₂ vers E₁', ar: '3.0mA يدفعها المصدر الأكبر E₂ نحو E₁', en: '3.0 mA driven by E₂ back toward E₁' },
        { fr: '21,0 mA car les deux piles s’additionnent', ar: '21.0mA لأن البطاريتين تتجمعان', en: '21.0 mA because batteries always add' },
        { fr: '0 mA car les deux pôles + se bloquent mutuellement', ar: '0mA لأن القطبين الموجبين يمنعان المرور', en: '0 mA because + terminals block current' },
      ],
      correctIndex: 0,
      explanation: {
        fr: 'Somme algébrique horaire : +9 − 12 − I·1kΩ = 0 ⇒ I = −3 mA. Le signe « − » indique 3 mA dans le sens anti-horaire (mené par E₂).',
        ar: 'بالمجموع الجبري: +9 − 12 = −3V، إذن ينتج تيار 3mA يقوده المصدر الأكبر E₂ في الاتجاه المعاكس.',
        en: 'Clockwise sum: +9 − 12 − I·1kΩ = 0 ⇒ I = −3 mA, i.e., 3 mA driven counter-clockwise by E₂.',
      },
    },
    teacherNote: {
      fr: 'Insistez sur le fait qu’un signe négatif n’est jamais une faute de calcul : c’est une information physique précieuse sur le sens réel du flux.',
      ar: 'أكد للطلاب أن الإشارة السالبة في التيار هي معلومة اتجاهية صحيحة وليست خطأً حسابياً.',
      en: 'Emphasize that a negative sign is physical directional information, never a math mistake.',
    },
  },
  {
    id: 4,
    slug: 'kcl-node-junction',
    pageRef: 'Ch. 4 · KCL',
    title: {
      fr: 'La Loi des Nœuds (KCL) : Conservation du Courant',
      ar: 'قانون كيرشوف للعقد (KCL): حفظ التيار',
      en: 'Kirchhoff’s Current Law (KCL): Node Conservation',
    },
    subtitle: {
      fr: 'Tout le courant qui entre dans une soudure doit en ressortir exactement : jamais d’accumulation de charges.',
      ar: 'كل تيار يدخل إلى نقطة لحام (عقدة) يجب أن يخرج منها بالضبط: لا تتراكم الشحنات أبداً.',
      en: 'Every milliamp entering a solder junction must leave it immediately—no charge ever piles up at a node.',
    },
    analogyTitle: {
      fr: 'Le raccord de plomberie en T ou en étoile',
      ar: 'مفترق أنابيب المياه (حرف T)',
      en: 'The Plumbing Junction Manifold',
    },
    analogyText: {
      fr: 'Si 15 L/min arrivent au raccord en laiton et que le tuyau de gauche laisse passer 10 L/min, le tuyau de droite emporte obligatoirement 5 L/min. Chaque branche en parallèle voit la même pression E, et les débits s’additionnent.',
      ar: 'إذا دخل 15 لتر/دقيقة إلى الوصلة وخرج 10 لتر من اليسار، فلا بد أن يخرج 5 لتر من اليمين. كل الفروع ترى الضغط نفسه ويتجمع التصريف.',
      en: 'If 15 L/min enter a brass T-fitting and 10 L/min leave down the left pipe, exactly 5 L/min must exit right. Parallel pipes share supply pressure while flows add.',
    },
    theory: [
      {
        fr: 'Un nœud est un point de jonction reliant au moins 3 fils. La loi des nœuds énonce : ∑ I_entrants = ∑ I_sortants, soit ∑ I_nœud = 0.',
        ar: 'العقدة هي نقطة التقاء ثلاثة فروع أو أكثر. ينص القانون على أن مجموع التيارات الداخلة يساوي مجموع التيارات الخارجة.',
        en: 'A node connects 3 or more branches. KCL states: ∑ I_in = ∑ I_out, or algebraically ∑ I_node = 0.',
      },
      {
        fr: 'En parallèle sous une tension E : plus une branche a une faible résistance R, plus elle aspire de courant (I_k = E / R_k). La résistance équivalente est toujours inférieure à la plus petite branche !',
        ar: 'في التوازي: الفرع ذو المقاومة الأصغر يجذب التيار الأكبر (I_k = E/R_k)، والمقاومة الكلية أصغر دائماً من أصغر مقاومة منفردة.',
        en: 'In parallel across E, the lowest-resistance branch draws the largest current (I_k = E / R_k), and total R_eq is always smaller than the smallest branch.',
      },
      {
        fr: 'Conséquence pratique : ouvrir (couper) une branche parallèle met son courant à 0 mA sans modifier la tension E ni les courants des autres branches !',
        ar: 'نتيجة عملية: قطع أحد الفروع المتوازية يصفر تياره فقط، دون أن يغير جهد أو تيار الفروع الأخرى.',
        en: 'Practical takeaway: opening one parallel branch drops its current to 0 mA while neighboring branches keep running normally.',
      },
    ],
    formula: '∑ I_entrants = ∑ I_sortants   ⇒   I_tot = E/R₁ + E/R₂ (+ E/R₃)',
    formulaVars: [
      { symbol: 'I_tot', meaning: { fr: 'Courant fourni par la pile au nœud A', ar: 'التيار الكلي الداخل للعقدة A', en: 'Total current entering Node A' }, unit: 'mA' },
      { symbol: 'I₁, I₂, I₃', meaning: { fr: 'Courants sortants dans chaque branche', ar: 'تيارات الفروع الخارجة من العقدة', en: 'Branch currents leaving Node A' }, unit: 'mA' },
    ],
    examples: [
      {
        id: 'kcl-2-branches',
        pageRef: 'Ex. 4.1',
        title: { fr: 'Nœud à 2 branches (1 kΩ // 2 kΩ)', ar: 'عقدة بفرعين على التوازي', en: '2-Branch KCL Node' },
        summary: {
          fr: 'I₁ = 9 mA et I₂ = 4,5 mA fusionnent au retour pour redonner exactement 13,5 mA.',
          ar: 'يتوزع التيار 13.5mA إلى 9mA و 4.5mA ثم يجتمعان في الخط الراجع.',
          en: '13.5 mA splits into 9.0 mA + 4.5 mA at Node A, then recombines cleanly on GND.',
        },
        howItWorks: {
          fr: 'La pile E₁ maintient le bus supérieur (nœud A) à la même tension pour les deux résistances en parallèle. La branche R₁ tire I₁ = E₁ / R₁ et la branche R₂ tire I₂ = E₁ / R₂ de manière totalement indépendante. Au nœud d’entrée comme au nœud de retour GND, la somme des débits vaut strictement I_tot = I₁ + I₂.',
          ar: 'تطبّق البطارية E₁ نفس الجهد على فرعي التوازي R₁ و R₂ عند العقدة A. يسحب كل فرع تياره باستقلال تام حسب مقاومته (I_k = E₁/R_k)، وعند العقدة العلوية والسفلية يساوي التيار الرئيسي دائماً I_tot = I₁ + I₂ دون أي نقصان.',
          en: 'Supply E₁ holds the top Node A at a shared voltage across both parallel branches. Branch R₁ draws I₁ = E₁/R₁ and R₂ draws I₂ = E₁/R₂ independently; at both Node A and the GND return bus, KCL guarantees I_tot = I₁ + I₂.',
        },
        components: ['9V', '1kΩ', '2kΩ'],
      },
      {
        id: 'kcl-3-branches',
        pageRef: 'Ex. 4.2',
        title: { fr: 'Bus d’alimentation à 3 branches', ar: 'ناقل تغذية بـ 3 فروع متوازية', en: '3-Branch Power Bus' },
        summary: {
          fr: 'Trois charges indépendantes sous 9 V : observez ∑ I = I₁ + I₂ + I₃.',
          ar: 'ثلاثة أحمال مستقلة تحت 9V مع تحقق دائم لقانون العقد.',
          en: 'Three parallel loads sharing 9 V: verify ∑ I = I₁ + I₂ + I₃ in real time.',
        },
        howItWorks: {
          fr: 'Trois résistances R₁, R₂ et R₃ sont connectées en étoile sur le même rail positif V_A = E₁ et retournent vers la masse. Ajouter une 3ᵉ branche parallèle abaisse la résistance équivalente globale et augmente le courant total tiré à la source (I_tot = I₁ + I₂ + I₃), tout en laissant inchangés les courants I₁ et I₂ des branches voisines.',
          ar: 'ترتبط المقاومات الثلاث R₁ و R₂ و R₃ على التوازي بنفس خط الجهد V_A = E₁. إضافة فرع ثالث تقلّل المقاومة الكلية فتزيد التيار المسحوب من البطارية (I₁ + I₂ + I₃)، لكنها لا تغيّر تيار الفرعين الآخرين طالما جهد البطارية ثابت.',
          en: 'Three parallel resistors R₁, R₂, and R₃ share the rail V_A = E₁ down to GND. Adding a third branch lowers total parallel resistance and raises source current to I_tot = I₁ + I₂ + I₃ without disturbing I₁ or I₂.',
        },
        components: ['9V', '1kΩ', '2kΩ', '1.5kΩ'],
      },
    ],
    prediction: {
      question: {
        fr: 'Sur une batterie 12 V, la branche 1 tire 20 mA, la branche 2 tire 40 mA et la branche 3 est débranchée (0 mA). Que mesure l’ampèremètre principal ?',
        ar: 'على بطارية 12V، يسحب الفرع الأول 20mA والثاني 40mA والثالث مفصول (0mA). كم يقرأ الأمبيرمتر الرئيسي؟',
        en: 'On a 12 V supply, branch 1 draws 20 mA, branch 2 draws 40 mA, and branch 3 is open (0 mA). What does the main ammeter read?',
      },
      options: [
        { fr: '60 mA (I_tot = 20 + 40 + 0 mA)', ar: '60mA لأن التيار الكلي هو مجموع الفروع', en: '60 mA (I_tot = 20 + 40 + 0 mA)' },
        { fr: '20 mA (le courant prend toujours le chemin le plus court)', ar: '20mA لأن التيار يأخذ مساراً واحداً', en: '20 mA (current picks one path)' },
        { fr: '0 mA car la branche 3 est ouverte', ar: '0mA لأن الفرع الثالث مفتوح', en: '0 mA because branch 3 is open' },
      ],
      correctIndex: 0,
      explanation: {
        fr: 'Chaque branche fermée sous 12 V conduit indépendamment. Par la loi des nœuds, la batterie fournit la somme : 20 + 40 = 60 mA.',
        ar: 'كل فرع مغلق يمرّر تياره باستقلال، وتجمع البطارية مجموع التيارات: 60mA.',
        en: 'Each closed parallel branch conducts independently; by KCL the battery supplies 20 + 40 = 60 mA.',
      },
    },
    teacherNote: {
      fr: 'Utilisez le bouton « Couper une branche » dans ce chapitre pour montrer concrètement l’indépendance des branches en parallèle vs la coupure totale en série.',
      ar: 'استخدم زر قطع الفرع لإبراز الفرق الجوهري بين التوالي والتوازي عند حدوث عطل.',
      en: 'Use the open-branch fault toggle here to contrast parallel resilience against series single-point failure.',
    },
  },
  {
    id: 5,
    slug: 'leds-kvl-parallel-trap',
    pageRef: 'Ch. 5 · LEDs',
    title: {
      fr: 'Mailles Non-Linéaires : LEDs & Piège du Parallèle',
      ar: 'الحلقات غير الخطية: LED وفخ التوازي',
      en: 'Non-Linear KVL: LEDs & The Parallel Trap',
    },
    subtitle: {
      fr: 'Dimensionner une résistance de LED par la loi des mailles — et comprendre pourquoi deux LEDs différentes en parallèle se cannibalisent.',
      ar: 'حساب مقاومة الـ LED بقانون الحلقات، ولماذا يُطفئ مصباحان مختلفان أحدهما الآخر عند ربطهما على التوازي.',
      en: 'Size an LED resistor using KVL—and see why putting two different LEDs directly in parallel fails.',
    },
    analogyTitle: {
      fr: 'Deux clapets tarés à des pressions différentes',
      ar: 'صمامان بضغط فتح مختلف على خط واحد',
      en: 'Two Spring Valves with Different Opening Pressures',
    },
    analogyText: {
      fr: 'Une LED rouge s’ouvre dès 1,9 m de pression, une LED bleue exige 3,1 m. Si on les met côte à côte sur le même tuyau, la rouge s’ouvre la première et plafonne la pression à 1,9 m : la bleue reste fermée à jamais !',
      ar: 'يفتح الصمام الأحمر عند ضغط 1.9V والأزرق عند 3.1V. إذا وُضعا معاً على التوازي يفتح الأحمر أولاً ويثبت الضغط عند 1.9V فيبقى الأزرق مغلقاً للأبد!',
      en: 'A red LED opens at 1.9 V while a blue LED needs 3.1 V. Connected directly in parallel, the red LED clamps node voltage at 1.9 V—the blue LED never reaches threshold!',
    },
    theory: [
      {
        fr: 'Dans une maille avec LED, la diode impose sa tension de seuil V_F (≈ 1,9 V rouge, 3,1 V bleue/blanche). Par KVL, la résistance reçoit exactement U_R = E − V_F.',
        ar: 'في حلقة الـ LED، يفرض الثنائي جهده الأمامي V_F (نحو 1.9V للأحمر و 3.1V للأزرق)، فتأخذ المقاومة الباقي U_R = E − V_F.',
        en: 'In an LED loop, the diode locks its forward drop V_F (~1.9 V red, ~3.1 V blue/white). By KVL, the resistor drops U_R = E − V_F.',
      },
      {
        fr: 'Si deux LEDs partagent une seule résistance en parallèle, la LED au plus petit V_F verrouille le nœud V_A et absorbe 100 % du courant total (risque de destruction !).',
        ar: 'إذا تشاركت مصباحتا LED مقاومة واحدة على التوازي، فإن الأقل جهداً تحتكر 100% من التيار وتمنع الأخرى من الإضاءة.',
        en: 'Sharing one series resistor across parallel LEDs clamps V_A to the lowest V_F, starving the other LED and overheating the active one.',
      },
      {
        fr: 'Solution correcte : 1 résistance par branche parallèle (deux mailles propres), ou LEDs en série si E > V_F1 + V_F2.',
        ar: 'الحل السليم: مقاومة مستقلة لكل فرع متوازٍ، أو ربطهما على التوالي إذا كان الجهد كافياً لمجموع V_F.',
        en: 'Proper fix: give each parallel LED its own series resistor, or wire them in series when E > V_F1 + V_F2.',
      },
    ],
    formula: 'R = (E − ∑ V_F) / I_LED',
    formulaVars: [
      { symbol: 'V_F', meaning: { fr: 'Tension de seuil de la LED', ar: 'جهد عتبة الـ LED', en: 'LED forward voltage' }, unit: 'V' },
      { symbol: 'E − ∑V_F', meaning: { fr: 'Tension restante sur R', ar: 'الجهد المتبقي على المقاومة', en: 'Voltage dropped by R' }, unit: 'V' },
      { symbol: 'I_LED', meaning: { fr: 'Courant cible (ex. 10–20 mA)', ar: 'تيار التشغيل المطلوب', en: 'Target LED current' }, unit: 'mA' },
    ],
    examples: [
      {
        id: 'led-parallel-trap',
        pageRef: 'Ex. 5.1',
        title: { fr: 'Piège Rouge (1,9 V) // Bleue (3,1 V)', ar: 'فخ الأحمر (1.9V) // الأزرق (3.1V)', en: 'Red (1.9 V) // Blue (3.1 V) Trap' },
        summary: {
          fr: 'Une seule résistance pour deux LEDs : la rouge brille à plein régime, la bleue reste noire.',
          ar: 'مقاومة واحدة لمصباحين: يضيء الأحمر ويبقى الأزرق مطفأً تماماً.',
          en: 'One resistor for two LEDs: red takes 100% of current while blue stays completely dark.',
        },
        howItWorks: {
          fr: 'En mode piège (1 résistance R₁ partagée), dès que V_A atteint 1,9 V la LED rouge entre en conduction exponentielle et agit comme une diode Zener qui bloque V_A à 1,9 V. Comme la LED bleue exige au moins 3,1 V, aucun courant ne la traverse (I_bleue = 0 mA) et R₁ dissipe toute la différence (E₁ − 1,9 V) dans la seule LED rouge. En activant des résistances séparées, chaque LED reçoit sa propre maille et les deux brillent normalement.',
          ar: 'عند مشاركة مقاومة واحدة R₁، تبدأ الـ LED الحمراء بالتوصيل فور بلوغ 1.9V وتثبّت جهد العقدة V_A عند 1.9V تماماً. ولأن الـ LED الزرقاء تحتاج 3.1V لتفتح، يبقى تيارها صفراً وتستأثر الحمراء بكامل التيار! عند فصل المقاومات إلى R₁ و R₂ تستقل كل حلقة وتضيء الـ LED الزرقاء فوراً.',
          en: 'With one shared resistor R₁, the red LED turns on first at 1.9 V and clamps Node A at 1.9 V. Since the blue LED requires 3.1 V to conduct, it receives zero current while red takes the entire (E₁ − 1.9)/R₁ surge. Switching to separate resistors gives each LED an independent KVL loop so both illuminate cleanly.',
        },
        components: ['5V', '150Ω', 'LED R', 'LED B'],
      },
      {
        id: 'led-kvl-series',
        pageRef: 'Ex. 5.2',
        title: { fr: 'Dimensionnement KVL série', ar: 'حساب مقاومة LED على التوالي', en: 'Series KVL Resistor Sizing' },
        summary: {
          fr: 'Calculez U_R = E − V_F et réglez R₁ pour viser 10 à 15 mA sans surchauffer la LED.',
          ar: 'احسب U_R = E − V_F واضبط R₁ للوصول إلى تيار آمن 10–15mA.',
          en: 'Observe U_R = E − V_F and tune R₁ to set a safe 10–15 mA current.',
        },
        howItWorks: {
          fr: 'La résistance R₁ et la LED sont en série : la LED maintient une tension quasi constante V_F à ses bornes (1,9 V pour une LED, ou 5,0 V pour rouge + bleue en série). La loi des mailles impose donc que tout l’excédent de tension (E₁ − ∑V_F) se retrouve aux bornes de R₁, qui fixe directement le courant de sécurité I = (E₁ − ∑V_F) / R₁. Si E₁ passe sous ∑V_F, la LED s’éteint.',
          ar: 'تُربط المقاومة R₁ على التوالي مع الـ LED لحصر التيار: تثبّت الـ LED جهدها الأمامي V_F، فيستقر الجهد المتبقي (E₁ − ∑V_F) على المقاومة R₁ التي تحدد التيار بدقة I = (E₁ − ∑V_F)/R₁. وإذا رُبطت مصباحتا LED (5.0V إجمالاً) يجب أن يتجاوز جهد البطارية 5.0V لتضيئا.',
          en: 'Resistor R₁ and the LED(s) sit in one series loop: the diode locks its forward drop V_F (1.9 V single, or 5.0 V for red+blue), forcing the excess supply voltage (E₁ − ∑V_F) across R₁. Hence R₁ directly regulates safe current I = (E₁ − ∑V_F)/R₁.',
        },
        components: ['9V', '470Ω', 'LED 2V'],
      },
    ],
    prediction: {
      question: {
        fr: 'Une pile 5 V alimente via une seule résistance 150 Ω une LED rouge (1,9 V) et une LED bleue (3,1 V) soudées en parallèle. Que se passe-t-il ?',
        ar: 'بطارية 5V تغذي عبر مقاومة واحدة 150Ω مصباح LED أحمر (1.9V) وآخر أزرق (3.1V) على التوازي. ماذا يحدث؟',
        en: 'A 5 V supply feeds a red LED (1.9 V) and blue LED (3.1 V) wired in parallel behind one 150 Ω resistor. What happens?',
      },
      options: [
        { fr: 'Seule la rouge s’allume (à ~20,7 mA), la bleue reste éteinte à 1,9 V', ar: 'يضيء الأحمر فقط (~20.7mA) ويبقى الأزرق مطفأً عند 1.9V', en: 'Only red lights (~20.7 mA); blue stays dark at 1.9 V' },
        { fr: 'Les deux s’allument à moitié car le courant se divise en deux', ar: 'يضيئان بنصف الشدة لأن التيار ينقسم بالنصف', en: 'Both glow dimly at half current each' },
        { fr: 'Seule la bleue s’allume car 3,1 V est plus grand', ar: 'يضيء الأزرق فقط لأن جهده أكبر', en: 'Only blue lights because 3.1 V is higher' },
      ],
      correctIndex: 0,
      explanation: {
        fr: 'La LED rouge conduit dès 1,9 V et bloque V_A à 1,9 V. Pour la bleue (seuil 3,1 V), 1,9 V est insuffisant ! Tout le courant (5−1,9)/150 = 20,7 mA passe dans la rouge.',
        ar: 'المصباح الأحمر يثبّت العقدة عند 1.9V فلا يصل الأزرق أبداً إلى عتبة 3.1V، ويمر كامل التيار (20.7mA) في الأحمر.',
        en: 'The red LED clamps node V_A to 1.9 V, below the blue LED’s 3.1 V turn-on. All (5 − 1.9)/150 = 20.7 mA flows through red.',
      },
    },
    teacherNote: {
      fr: 'Basculez l’interrupteur « Résistances séparées » sur le banc pour voir la LED bleue s’allumer instantanément dès que les deux branches sont découplées !',
      ar: 'بدّل خيار «مقاومات منفصلة» في المختبر ليرى الطالب إضاءة المصباح الأزرق فور فصل المسارين.',
      en: 'Flip the “Separate Resistors” toggle to watch the blue LED light up the instant each branch gets its own R.',
    },
  },
  {
    id: 6,
    slug: 'two-mesh-millman-bridge',
    pageRef: 'Ch. 6 · 2 Mailles',
    title: {
      fr: 'Réseaux à 2 Mailles, Théorème de Millman & Pont',
      ar: 'الشبكات ذات الحلقتين، مبرهنة ميلمان والجسر',
      en: '2-Mesh Networks, Millman’s Node & Wheatstone Bridge',
    },
    subtitle: {
      fr: 'Résoudre deux sources et trois branches en deux lignes grâce au potentiel de nœud — et équilibrer un pont de mesure à 0,00 V.',
      ar: 'حل دارة بمصدرين وثلاثة فروع بسطرين عبر جهد العقدة، وضبط توازن جسر ويتستون عند 0.00V.',
      en: 'Solve dual-source 2-mesh circuits in two lines via nodal Millman analysis—and zero out a Wheatstone bridge.',
    },
    analogyTitle: {
      fr: 'Le lac central alimenté par deux réservoirs',
      ar: 'بحيرة وسطى بين خزانين مختلفين',
      en: 'A Central Basin Between Two Reservoirs',
    },
    analogyText: {
      fr: 'Deux châteaux d’eau E₁ et E₂ déversent vers un lac central V_A muni d’un exutoire R₃. Le niveau V_A s’équilibre exactement là où le débit total entrant égale le débit sortant par R₃.',
      ar: 'خزانان E₁ و E₂ يصبان نحو حوض وسطي V_A له مخرج R₃. يستقر منسوب الحوض V_A تماماً عندما يتساوى التدفق الداخل مع الخارج.',
      en: 'Two reservoirs E₁ and E₂ feed a central basin V_A draining through R₃. Basin height V_A settles at the exact level where total inflow equals outflow.',
    },
    theory: [
      {
        fr: 'Dans un réseau à 2 mailles partageant un nœud A (E₁ via R₁, E₂ via R₂, charge R₃ vers GND), la méthode des mailles donne un système 2×2. Mais en exprimant I₁ + I₂ = I₃ au nœud A, on obtient directement le théorème de Millman !',
        ar: 'بكتابة قانون العقد عند A: (E₁−V_A)/R₁ + (E₂−V_A)/R₂ = V_A/R₃ نحصل مباشرة على جهد العقدة V_A بمبرهنة ميلمان.',
        en: 'Writing KCL at Node A: (E₁−V_A)/R₁ + (E₂−V_A)/R₂ = V_A/R₃ yields node potential V_A in a single equation (Millman’s theorem).',
      },
      {
        fr: 'Une fois V_A trouvé, chaque courant s’obtient par une simple soustraction : I₁ = (E₁ − V_A)/R₁, I₂ = (E₂ − V_A)/R₂, I₃ = V_A / R₃.',
        ar: 'فور إيجاد V_A، يُحسب تيار كل فرع بطرح بسيط: I₁ = (E₁−V_A)/R₁ و I₂ = (E₂−V_A)/R₂ و I₃ = V_A/R₃.',
        en: 'Once V_A is known, every branch current is trivial: I₁ = (E₁−V_A)/R₁, I₂ = (E₂−V_A)/R₂, and I₃ = V_A/R₃.',
      },
      {
        fr: 'Le pont de Wheatstone applique deux diviseurs côte à côte : dès que R₁ · R_L = R₂ · R₃, les deux nœuds sont au même potentiel (V_A = V_B) et aucun courant ne traverse le pont central.',
        ar: 'يعتمد جسر ويتستون على مقسّمَي جهد متجاورين: يتوازن الجسر (V_A = V_B) عندما يتحقق R₁·R_L = R₂·R₃.',
        en: 'A Wheatstone bridge compares two divider legs: whenever R₁ · R_L = R₂ · R₃, V_A equals V_B and bridge current drops to zero.',
      },
    ],
    formula: 'V_A = (E₁/R₁ + E₂/R₂) / (1/R₁ + 1/R₂ + 1/R₃)   ·   Pont: R₁·R_L = R₂·R₃',
    formulaVars: [
      { symbol: 'V_A', meaning: { fr: 'Potentiel unique du nœud central', ar: 'جهد العقدة الوسطى', en: 'Central node voltage' }, unit: 'V' },
      { symbol: 'I₁ + I₂', meaning: { fr: 'Somme entrante au nœud A', ar: 'مجموع التيار الداخل للعقدة', en: 'Total current into Node A' }, unit: 'mA' },
      { symbol: 'ΔV_AB', meaning: { fr: 'Déséquilibre du pont de mesure', ar: 'فرق جهد توازن الجسر', en: 'Bridge imbalance voltage' }, unit: 'V' },
    ],
    examples: [
      {
        id: 'two-mesh-millman',
        pageRef: 'Ex. 6.1',
        title: { fr: 'Réseau 2 mailles (E₁, E₂, R₃)', ar: 'شبكة حلقتين بمصدرين و R₃', en: '2-Mesh Dual-Source Network' },
        summary: {
          fr: 'Modifiez E₁, E₂ et R₃ : voyez V_A et les 3 courants obéir simultanément à KVL et KCL.',
          ar: 'عدّل E₁ و E₂ و R₃ وشاهد تحقق قانوني الحلقات والعقد في آن واحد.',
          en: 'Adjust E₁, E₂, and R₃ to verify both mesh KVL sums and node KCL simultaneously.',
        },
        howItWorks: {
          fr: 'Deux sources E₁ (via R₁) et E₂ (via R₂) convergent au nœud central A relié à la masse par R₃. La tension V_A est la moyenne pondérée par les conductances (théorème de Millman) : V_A = (E₁/R₁ + E₂/R₂) / (1/R₁ + 1/R₂ + 1/R₃). Si V_A dépasse E₂, le courant I₂ s’inverse et reflue vers E₂ tout en satisfaisant I₁ + I₂ = I₃ au nœud A.',
          ar: 'يلتقي المصدران E₁ (عبر R₁) و E₂ (عبر R₂) عند العقدة الوسطى A الموصولة بالأرضي عبر R₃. يستقر الجهد V_A عند المتوسط الموزون حسب ميلمان، وإذا ارتفع V_A فوق E₂ ينعكس التيار I₂ عائداً نحو E₂ مع بقاء قانون العقد I₁ + I₂ = I₃ محققاً بدقة.',
          en: 'Two sources E₁ (through R₁) and E₂ (through R₂) meet at central Node A, drained to GND by R₃. Node potential settles at Millman’s conductance-weighted average V_A = (E₁/R₁ + E₂/R₂)/(1/R₁ + 1/R₂ + 1/R₃). Whenever V_A > E₂, current I₂ reverses back into E₂ while strictly maintaining I₁ + I₂ = I₃.',
        },
        components: ['E₁', 'E₂', 'R₁', 'R₂', 'R₃'],
      },
      {
        id: 'wheatstone-bridge',
        pageRef: 'Ex. 6.2',
        title: { fr: 'Pont de Wheatstone (capteur R_L)', ar: 'جسر ويتستون للقياس الدقيق', en: 'Wheatstone Sensor Bridge' },
        summary: {
          fr: 'Ajustez R_L pour annuler ΔV_AB = V_A − V_B à 0,00 V exactement.',
          ar: 'اضبط R_L حتى ينعدم فرق الجهد ΔV_AB عند 0.00V تماماً.',
          en: 'Tune R_L to null ΔV_AB = V_A − V_B cleanly to 0.00 V.',
        },
        howItWorks: {
          fr: 'Le pont place deux diviseurs de tension en parallèle sur E₁ : la branche gauche (R₁, R₂) fixe V_A = E₁·R₂/(R₁+R₂), et la branche droite (R₃, capteur R_L) fixe V_B = E₁·R_L/(R₃+R_L). Le voltmètre central mesure la différence ΔV_AB = V_A − V_B. Dès que R_L / R₃ = R₂ / R₁, les potentiels s’égalisent (ΔV_AB = 0,00 V), ce qui permet de détecter d’infimes variations de capteur.',
          ar: 'يتكوّن الجسر من مقسّمَي جهد متوازيين على نفس المصدر E₁: يعطي الفرع الأيسر (R₁, R₂) الجهد V_A، ويعطي الفرع الأيمن (R₃, الحساس R_L) الجهد V_B. عند تساوي النسبتين R₁·R_L = R₂·R₃ يصبح V_A = V_B وينعدم فرق الجهد ΔV_AB عند الصفر، مما يتيح قياس تغيرات الحساس بدقة فائقة.',
          en: 'Two divider legs sit side by side across E₁: left leg (R₁, R₂) sets V_A while right leg (R₃, sensor R_L) sets V_B. A differential meter reads ΔV_AB = V_A − V_B. Whenever the ratio matches (R₁·R_L = R₂·R₃), ΔV_AB nulls cleanly to 0.00 V, magnifying tiny sensor shifts.',
        },
        components: ['R₁', 'R₂', 'R₃', 'R_L'],
      },
    ],
    prediction: {
      question: {
        fr: 'Dans le réseau 2 mailles avec E₁ = 10 V (R₁ = 1 kΩ), E₂ = 4 V (R₂ = 1 kΩ) et R₃ = 1 kΩ vers GND, que vaut le potentiel V_A au nœud central ?',
        ar: 'في شبكة حلقتين: E₁ = 10V (عبر 1kΩ)، E₂ = 4V (عبر 1kΩ) و R₃ = 1kΩ للأرضي. كم يساوي جهد العقدة V_A؟',
        en: 'In a 2-mesh network with E₁ = 10 V (R₁ = 1 kΩ), E₂ = 4 V (R₂ = 1 kΩ), and R₃ = 1 kΩ to GND, what is node potential V_A?',
      },
      options: [
        { fr: '4,67 V  [ (10 + 4 + 0) / 3 ]', ar: '4.67V لأنها المتوسط الموزون (10 + 4 + 0) / 3', en: '4.67 V  [ (10 + 4 + 0) / 3 ]' },
        { fr: '7,00 V  [ moyenne simple (10 + 4) / 2 ]', ar: '7.00V لأنه متوسط المصدرين فقط', en: '7.00 V  [ simple average (10 + 4) / 2 ]' },
        { fr: '14,00 V  [ somme des deux piles ]', ar: '14.00V لأنه مجموع المصدرين', en: '14.00 V  [ sum of both batteries ]' },
      ],
      correctIndex: 0,
      explanation: {
        fr: 'Les trois résistances étant égales à 1 kΩ, la branche vers GND (0 V) pèse autant que E₁ et E₂ : V_A = (10 + 4 + 0) / 3 = 4,67 V !',
        ar: 'بما أن المقاومات الثلاث متساوية، فإن فرع الأرضي (0V) يدخل في المتوسط الموزون: (10 + 4 + 0)/3 = 4.67V.',
        en: 'Because all three resistors equal 1 kΩ, the GND branch (0 V) carries equal weight: V_A = (10 + 4 + 0) / 3 = 4.67 V.',
      },
    },
    teacherNote: {
      fr: 'Notez que dans cet exemple (V_A = 4,67 V > E₂ = 4 V), I₂ devient légèrement négatif (−0,67 mA) : la maille 1 recharge la source 4 V !',
      ar: 'ملاحظة رائعة للطلاب: عندما يصبح V_A = 4.67V أكبر من E₂ = 4V، ينعكس I₂ ليصبح سالباً!',
      en: 'Notice here V_A (4.67 V) exceeds E₂ (4 V), making I₂ negative (−0.67 mA) as current flows back into E₂.',
    },
  },
  {
    id: 7,
    slug: 'internal-resistance-sag',
    pageRef: 'Ch. 7 · Pile r_i',
    title: {
      fr: 'Résistance Interne r_i & Effondrement de Batterie',
      ar: 'المقاومة الداخلية r_i وهبوط جهد البطارية',
      en: 'Internal Resistance r_i & Battery Voltage Sag',
    },
    subtitle: {
      fr: 'Pourquoi une pile mesurée à 9,0 V au repos chute à 6,2 V dès que le moteur démarre : modélisation par une simple maille r_i + R_L.',
      ar: 'لماذا تقرأ البطارية 9.0V عند السكون ثم تهبط إلى 6.2V فور تشغيل المحرك؟ الحل يكمن في حلقة r_i + R_L.',
      en: 'Why a battery reading 9.0 V at rest sags to 6.2 V under motor load—modeled directly by a single KVL loop r_i + R_L.',
    },
    analogyTitle: {
      fr: 'La pression statique vs tuyau bouché',
      ar: 'ضغط الماء الساكن مقابل انسداد الفلتر',
      en: 'Static Pressure vs Clogged Filter Pipe',
    },
    analogyText: {
      fr: 'À robinet fermé (I = 0), même un tuyau à moitié entartré affiche la pression maximale du réseau. Mais dès qu’on ouvre grand la vanne, le tartre interne r_i freine le débit et mange une partie de la pression avant même la sortie.',
      ar: 'عند إغلاق الصنبور يظهر الضغط الكامل رغم تكلس الأنبوب، لكن فور فتحه يستهلك التكلس الداخلي r_i جزءاً من الضغط قبل خروج الماء.',
      en: 'With the tap shut (I = 0), a clogged pipe still holds full static pressure. Open the valve wide, and internal clog r_i eats up pressure before the outlet.',
    },
    theory: [
      {
        fr: 'Aucune source réelle n’est parfaite : on la modélise par une FEM idéale E en série avec une résistance interne r_i. Par KVL : V_bornes = E − r_i · I.',
        ar: 'لا يوجد مصدر مثالي: نمثّل البطارية بقوة دافعة E على التوالي مع مقاومة داخلية r_i، فيكون الجهد الطرفي V = E − r_i·I.',
        en: 'Every real battery acts as an ideal EMF E in series with internal resistance r_i. By KVL: V_terminal = E − r_i · I.',
      },
      {
        fr: 'Mesurer une pile 9 V au voltmètre seul (I ≈ 0) ne révèle PAS son usure : une pile usée a souvent encore E ≈ 8,7 V à vide, mais sa r_i a grimpé à 20–50 Ω !',
        ar: 'قياس البطارية دون حمل (I ≈ 0) يخدعك! البطارية التالفة قد تحتفظ بـ E ≈ 8.7V لكن مقاومتها الداخلية r_i ترتفع بشدة فتنهار فور التحميل.',
        en: 'An unloaded voltmeter test hides dead batteries: a worn cell may read 8.7 V open-circuit while its high r_i collapses under real load.',
      },
      {
        fr: 'Rendement de transfert : η = R_L / (r_i + R_L). La puissance utile sur R_L atteint son maximum lorsque R_L = r_i (mais avec 50 % de chaleur perdue dans la pile !).',
        ar: 'كفاءة النقل η = R_L / (r_i + R_L). وتتحقق القدرة العظمى في الحمل عند R_L = r_i (حيث يضيع 50% كحرارة داخل البطارية).',
        en: 'Transfer efficiency is η = R_L / (r_i + R_L). Maximum load power occurs at R_L = r_i, where half the energy heats the battery!',
      },
    ],
    formula: 'V_bornes = E − r_i · I   &   P_perdue = r_i · I²',
    formulaVars: [
      { symbol: 'E', meaning: { fr: 'FEM à vide de la pile', ar: 'القوة الدافعة دون حمل', en: 'Open-circuit EMF' }, unit: 'V' },
      { symbol: 'r_i', meaning: { fr: 'Résistance interne de la source', ar: 'المقاومة الداخلية للمصدر', en: 'Internal resistance' }, unit: 'Ω' },
      { symbol: 'V_bornes', meaning: { fr: 'Tension réelle disponible en charge', ar: 'الجهد المتاح فعلياً للحمل', en: 'Loaded terminal voltage' }, unit: 'V' },
    ],
    examples: [
      {
        id: 'ri-battery-sag',
        pageRef: 'Ex. 7.1',
        title: { fr: 'Pile neuve vs pile usée en charge', ar: 'بطارية جديدة مقابل مستهلكة تحت الحمل', en: 'Fresh vs Worn Cell Under Load' },
        summary: {
          fr: 'Montez r_i de 0,5 Ω à 15 Ω et observez V_bornes s’effondrer dès que R_L tire du courant.',
          ar: 'ارفع r_i من 0.5Ω إلى 15Ω وشاهد هبوط الجهد الطرفي وضياع الحرارة الداخلية.',
          en: 'Raise r_i from 0.5 Ω to 15 Ω and watch V_terminal sag as internal dissipation grows.',
        },
        howItWorks: {
          fr: 'La pile réelle se comporte comme une source parfaite E₁ suivie en série de sa résistance interne r_i à l’intérieur du boîtier. À vide (R_L débranchée), I = 0 donc la chute interne r_i·I est nulle et les bornes affichent E₁. Dès que R_L est connectée, le courant I = E₁ / (r_i + R_L) crée une perte U_int = r_i·I à l’intérieur même de la pile, ne laissant que V_bornes = E₁ − r_i·I pour la charge.',
          ar: 'تعمل البطارية الحقيقية كمصدر مثالي E₁ موصول على التوالي مع مقاومة داخلية r_i. في الفراغ (تيار صفري) لا يظهر أي هبوط على r_i فتقرأ الأقطاب E₁ كاملاً؛ لكن فور وصل الحمل R_L يمر التيار I = E₁/(r_i+R_L) فيضيع جزء r_i·I كحرارة داخل البطارية ولا يصل للحمل إلا الباقي V_bornes = E₁ − r_i·I.',
          en: 'A real battery behaves as an ideal EMF E₁ in series with internal resistance r_i inside its casing. Open-circuit (I = 0), internal drop r_i·I is zero so terminals read full E₁. Connecting R_L draws I = E₁/(r_i+R_L), dropping r_i·I inside the cell as heat and leaving only V_term = E₁ − r_i·I at the terminals.',
        },
        components: ['9V', 'r_i', 'R_L'],
      },
    ],
    prediction: {
      question: {
        fr: 'Une batterie de 12 V (r_i = 0,5 Ω) alimente un démarreur tirant I = 8 A (ou R_L = 1 Ω). Que vaut V_bornes mesuré aux cosses ?',
        ar: 'بطارية 12V مقاومتها الداخلية r_i = 0.5Ω تُشغّل حملاً يسحب I = 8A. كم يقيس الفولتميتر على أقطابها؟',
        en: 'A 12 V battery (r_i = 0.5 Ω) delivers I = 8 A to a load. What terminal voltage V_term appears across its posts?',
      },
      options: [
        { fr: '8,0 V  (V_bornes = 12 − 0,5 × 8)', ar: '8.0V لأن الهبوط الداخلي 0.5×8 = 4V', en: '8.0 V  (V_term = 12 − 0.5 × 8)' },
        { fr: '12,0 V  (la pile garde sa tension nominale)', ar: '12.0V لأن جهد البطارية ثابت', en: '12.0 V  (battery always holds 12 V)' },
        { fr: '16,0 V  (la résistance interne ajoute de la tension)', ar: '16.0V لأن r_i تزيد الجهد', en: '16.0 V  (internal resistance adds voltage)' },
      ],
      correctIndex: 0,
      explanation: {
        fr: 'Par la loi des mailles : V_bornes = E − r_i · I = 12 − (0,5 × 8) = 8,0 V. Les 4 V manquants chauffent l’intérieur de la batterie !',
        ar: 'حسب قانون الحلقات: V = 12 − (0.5 × 8) = 8.0V، والـ 4 فولت المفقودة تسخّن البطارية من الداخل.',
        en: 'By KVL: V_term = E − r_i · I = 12 − (0.5 × 8) = 8.0 V. The missing 4 V dissipates as heat inside the cell.',
      },
    },
    teacherNote: {
      fr: 'Reliez ce chapitre au test des piles au multimètre : c’est exactement pourquoi les testeurs de piles intègrent une résistance de charge de 10 Ω à 100 Ω.',
      ar: 'اربط هذا الدرس بجهاز فحص البطاريات الذي يضع مقاومة حمل أثناء القياس لكشف r_i المرتفعة.',
      en: 'Connect this directly to real battery testers, which switch in a dummy load resistor to expose high r_i.',
    },
  },
  {
    id: 8,
    slug: 'fault-diagnosis-kvl-kcl',
    pageRef: 'Ch. 8 · Diagnostic',
    title: {
      fr: 'Dépannage au Multimètre par KVL & KCL',
      ar: 'كشف الأعطال بالأفوميتر عبر كيرشوف',
      en: 'Multimeter Fault Diagnosis via KVL & KCL',
    },
    subtitle: {
      fr: 'Utiliser les signatures de tension et de courant pour localiser sans dessouder une piste coupée (circuit ouvert) ou un court-circuit.',
      ar: 'تحديد موقع القطع (الدارة المفتوحة) أو القصر دون فكّ القطع، فقط بقراءة بصمة الجهد والتيار.',
      en: 'Locate open traces and solder shorts without desoldering—purely from KVL/KCL voltage and current signatures.',
    },
    analogyTitle: {
      fr: 'Le détective de circulation routière',
      ar: 'محقّق حركة المرور على الطريق',
      en: 'The Highway Traffic Detective',
    },
    analogyText: {
      fr: 'Un pont coupé bloque toutes les voitures derrière lui : le flux tombe à zéro et toute la pression s’accumule juste devant la coupure. À l’inverse, un pont court-circuité fait s’écrouler le péage à 0 V tandis que le reste de la route sature.',
      ar: 'الجسر المقطوع يوقف كل السيارات فتسقط الحركة إلى الصفر ويتراكم الضغط عند القطع. أما القصر فيُسقط الجهد إلى الصفر عند نقطة العطل ويرفع التيار في الباقي.',
      en: 'An open bridge halts all traffic (I = 0) and stacks the full supply pressure across the gap. A shorted section drops 0 V while driving surge current through upstream parts.',
    },
    theory: [
      {
        fr: 'Signature d’un CIRCUIT OUVERT en série : le courant I devient 0,00 mA partout. Tous les composants sains tombent à U = R·0 = 0 V, et 100 % de la tension E apparaît aux bornes de la coupure !',
        ar: 'بصمة الدارة المفتوحة في التوالي: ينعدم التيار I = 0، فتصبح كل العناصر السليمة عند 0V، ويظهر 100% من جهد البطارية على نقطة القطع!',
        en: 'Open-circuit signature in series: I = 0 mA everywhere. Healthy resistors drop 0 V, so 100% of E appears right across the break!',
      },
      {
        fr: 'Signature d’un COURT-CIRCUIT aux bornes d’un composant : sa tension devient 0,00 V tandis que les résistances en série voient leur chute de tension et leur courant grimper brutalement.',
        ar: 'بصمة القصر: يهبط الجهد على العنصر المقصور إلى 0.00V، بينما يقفز الجهد والتيار في المقاومات المتبقية.',
        en: 'Short-circuit signature: voltage across the shorted part collapses to 0.00 V while remaining series elements surge in voltage and current.',
      },
      {
        fr: 'En parallèle, c’est l’inverse : un circuit ouvert ne coupe qu’une seule branche, tandis qu’un court-circuit sur une branche met TOUT le nœud à 0 V.',
        ar: 'في التوازي يكون الأثر معكوساً: القطع يوقف فرعاً واحداً فقط، أما القصر فيُسقط جهد العقدة كلها إلى 0V.',
        en: 'In parallel, an open stops only its own branch, whereas a short in one branch pulls the entire shared node to 0 V.',
      },
    ],
    formula: 'Ouvert : I = 0, U_coupure = E   ·   Court-circuit : U_cc = 0 V, I = E / R_restant',
    formulaVars: [
      { symbol: 'U_coupure', meaning: { fr: 'Tension mesurée sur la rupture', ar: 'الجهد المقاس على القطع', en: 'Voltage across open break' }, unit: 'V' },
      { symbol: 'U_cc', meaning: { fr: 'Tension nulle aux bornes du pont de soudure', ar: 'جهد معدوم على القصر', en: 'Zero drop across short' }, unit: 'V' },
    ],
    examples: [
      {
        id: 'fault-series-lab',
        pageRef: 'Ex. 8.1',
        title: { fr: 'Injecteur de pannes Série (Ouvert / CC)', ar: 'حاقن أعطال التوالي (قطع / قصر)', en: 'Series Fault Injector (Open / Short)' },
        summary: {
          fr: 'Injectez une rupture ou un court-circuit sur R₂ et lisez les signatures au voltmètre.',
          ar: 'طبّق قطعاً أو قصراً على R₂ وراقب تغير قراءات الفولتميتر فوراً.',
          en: 'Inject an open or short across R₂ and read the exact multimeter footprints.',
        },
        howItWorks: {
          fr: 'Dans cette maille série E₁ → R₁ → A → R₂ → GND : en panne « Ouvert » sur R₂, le courant tombe à 0 mA partout, R₁ n’a plus aucune chute (0 V) et le potentiel V_A monte à E₁ — toute la tension de pile se retrouve aux bornes de la coupure. En panne « Court-circuit » sur R₂, le nœud A est tiré à 0,00 V, R₂ ne reçoit plus rien et 100 % de E₁ s’applique sur R₁, augmentant fortement le courant.',
          ar: 'في حلقة التوالي E₁ → R₁ → A → R₂ → GND: عند حدوث «قطع» في R₂ ينعدم التيار (0mA) في الدارة كلها، فيختفي الهبوط على R₁ ويرتفع V_A إلى جهد المصدر E₁ كاملاً عند نقطة القطع. أما عند «قصر» R₂ فيسقط جهد العقدة A إلى 0.00V وتتحمل R₁ وحدها كامل جهد البطارية فيرتفع التيار فجأة.',
          en: 'In series loop E₁ → R₁ → A → R₂ → GND: an Open fault on R₂ cuts current to 0 mA everywhere, dropping 0 V across healthy R₁ so V_A jumps to full E₁ across the break. A Short fault across R₂ clamps Node A to 0.00 V, placing 100% of E₁ across R₁ and spiking loop current.',
        },
        components: ['9V', '1kΩ', '2kΩ', 'Sonde'],
      },
      {
        id: 'fault-parallel-lab',
        pageRef: 'Ex. 8.2',
        title: { fr: 'Injecteur de pannes Parallèle', ar: 'حاقن أعطال التوازي', en: 'Parallel Fault Injector' },
        summary: {
          fr: 'Comparez la survie du circuit sous panne ouverte vs l’effondrement total sous court-circuit.',
          ar: 'قارن صمود الفرع السليم عند القطع مقابل انهيار العقدة عند القصر.',
          en: 'Compare single-branch open resilience against full-bus collapse under a short.',
        },
        howItWorks: {
          fr: 'Deux branches R₁ et R₂ sont alimentées en parallèle par le bus V_A. Si la branche R₂ subit une coupure (circuit ouvert), son courant I₂ tombe à 0 mA mais la branche R₁ conserve la tension E₁ et continue de fonctionner normalement. En revanche, si R₂ se met en court-circuit vers la masse, tout le bus V_A s’effondre à 0 V (ou fait déclencher la protection en courant) et prive également R₁ de tension.',
          ar: 'يتغذى الفرعان R₁ و R₂ على التوازي من الخط المشترك V_A. إذا انقطع الفرع R₂ ينعدم تياره I₂=0 فقط بينما يبقى الفرع R₁ سليماً ويعمل بشكل عادي. أما إذا حدث قصر في R₂ فإنه يسحب كامل العقدة V_A نحو 0V ويحرم R₁ من التغذية مع تيار قصر خطير.',
          en: 'Branches R₁ and R₂ share parallel bus V_A. An Open fault in R₂ drops only I₂ to 0 mA while healthy branch R₁ keeps full E₁ and runs undisturbed. By contrast, a Short across R₂ pulls the shared bus V_A down to 0 V, starving R₁ and drawing fault surge current.',
        },
        components: ['9V', '1kΩ', '2kΩ', 'Sonde'],
      },
    ],
    prediction: {
      question: {
        fr: 'Sur une boucle série 9 V → R₁ (1 kΩ) → R₂ (2 kΩ) → GND, vous mesurez V_A = 9,00 V entre R₁ et R₂, et I = 0 mA. Quelle est la panne ?',
        ar: 'في حلقة توالي 9V → R₁ → R₂ → GND، قست V_A = 9.00V بين المقاومتين والتيار = 0mA. أين العطل؟',
        en: 'In a series loop 9 V → R₁ (1 kΩ) → R₂ (2 kΩ) → GND, you measure V_A = 9.00 V between R₁ and R₂, and I = 0 mA. What is the fault?',
      },
      options: [
        { fr: 'R₂ (ou la piste vers GND) est coupée (circuit ouvert)', ar: 'المقاومة R₂ أو المسار نحو الأرضي مقطوع (دارة مفتوحة)', en: 'R₂ (or its GND return) is open-circuited' },
        { fr: 'R₂ est en court-circuit vers GND', ar: 'المقاومة R₂ مقصورة نحو الأرضي', en: 'R₂ is shorted to GND' },
        { fr: 'La pile 9 V est déchargée', ar: 'البطارية فارغة تماماً', en: 'The 9 V battery is dead' },
      ],
      correctIndex: 0,
      explanation: {
        fr: 'Si R₂ était en court-circuit, V_A vaudrait 0 V ! Mesurer 9 V à V_A avec I = 0 mA prouve que R₁ est intègre (0 V dessus) et que R₂/GND est ouvert.',
        ar: 'لو كانت R₂ مقصورة لكان V_A = 0V! قياس 9V مع تيار 0mA يثبت سلامة R₁ ووجود قطع في R₂ أو الأرضي.',
        en: 'A shorted R₂ would pull V_A to 0 V! Reading 9 V at V_A with I = 0 mA proves R₁ has 0 V drop and R₂/GND is open.',
      },
    },
    teacherNote: {
      fr: 'C’est la compétence la plus utile en dépannage réel : apprendre à lire « toute la tension d’alimentation sur un dipôle = coupure interne ».',
      ar: 'هذه أهم مهارة صيانة عملية: قراءة كامل جهد المصدر على عنصر تعني وجود قطع داخلي فيه.',
      en: 'This is the #1 bench debugging skill: seeing full supply voltage across a component immediately flags an open.',
    },
  },
  {
    id: 9,
    slug: 'thevenin-theorem',
    pageRef: 'Ch. 9 · Thévenin',
    title: {
      fr: 'Théorème de Thévenin (E_th, R_th)',
      ar: 'مبرهنة ثيفنان (E_th, R_th)',
      en: 'Thévenin’s Theorem (E_th, R_th)',
    },
    subtitle: {
      fr: 'Remplacer tout réseau linéaire complexe vu par une charge R_L par une seule pile idéale E_th en série avec une seule résistance R_th.',
      ar: 'اختزال أي شبكة خطية معقّدة يراها الحمل R_L إلى مصدر وحيد E_th على التوالي مع مقاومة وحيدة R_th.',
      en: 'Reduce any complex linear network seen by load R_L down to a single ideal source E_th in series with one resistance R_th.',
    },
    analogyTitle: {
      fr: 'La boîte noire vue depuis la prise murale',
      ar: 'الصندوق الأسود كما يراه مقبس الحمل',
      en: 'The Black-Box Wall Outlet',
    },
    analogyText: {
      fr: 'Peu importe le labyrinthe de tuyaux et de pompes caché derrière le mur : si vous branchez un manomètre à vide, vous lisez la pression E_th, et la pente de chute lorsque vous ouvrez le robinet donne R_th. Toute charge R_L voit exactement une simple maille E_th + R_th.',
      ar: 'مهما تعقدت الأنابيب والمضخات خلف الجدار، فإن قياس الضغط دون سحب يعطي E_th وهبوطه عند فتح الصنبور يعطي R_th؛ فالحمل لا يرى إلا حلقة بسيطة واحدة.',
      en: 'No matter how intricate the pipes behind a wall, measuring static pressure at zero flow gives E_th, and internal restriction gives R_th. Any load R_L behaves as if connected to that single source.',
    },
    theory: [
      {
        fr: 'Étape 1 (Trouver E_th) : débranchez la charge R_L pour ouvrir les bornes A–B. La tension mesurée à vide entre A et B est exactement E_th (par ex. E₁·R₂/(R₁+R₂) pour un pont diviseur).',
        ar: 'الخطوة ١ (إيجاد E_th): افصل الحمل R_L لقراءة الجهد على الفراغ بين الطرفين A و B؛ هذا الجهد يساوي تماماً E_th.',
        en: 'Step 1 (Find E_th): disconnect load R_L to leave terminals A–B open. The open-circuit voltage V_AB equals E_th.',
      },
      {
        fr: 'Étape 2 (Trouver R_th) : charge toujours débranchée, « éteignez » toutes les sources indépendantes (remplacez les générateurs de tension par des fils / courts-circuits) et calculez la résistance équivalente vue depuis A–B : R_th = R₁ // R₂ = (R₁·R₂)/(R₁+R₂).',
        ar: 'الخطوة ٢ (إيجاد R_th): اطفئ جميع مصادر الجهد (استبدلها بسلك قصر) واحسب المقاومة المكافئة بين A و B، مثل R₁ // R₂.',
        en: 'Step 2 (Find R_th): with R_L removed, zero out independent voltage sources (replace ideal batteries with short wires) and find R_AB = R₁ // R₂.',
      },
      {
        fr: 'Étape 3 (Rebrancher R_L) : le circuit entier se réduit à une maille à 2 résistances ! V_L = E_th · R_L / (R_th + R_L) et I_L = E_th / (R_th + R_L), identiques au millivolt près au réseau complet.',
        ar: 'الخطوة ٣ (إعادة وصل الحمل R_L): تتحول الشبكة كلها إلى حلقة بسيطة بمقاومتين فقط: V_L = E_th · R_L / (R_th + R_L).',
        en: 'Step 3 (Reconnect R_L): the entire circuit collapses to a single loop: V_L = E_th · R_L / (R_th + R_L) and I_L = E_th / (R_th + R_L), matching the full network identically.',
      },
    ],
    formula: 'E_th = V_vide   ·   R_th = R₁·R₂ / (R₁ + R₂)   ·   V_L = E_th · R_L / (R_th + R_L)',
    formulaVars: [
      { symbol: 'E_th', meaning: { fr: 'Tension de Thévenin à vide (A–B)', ar: 'جهد ثيفنان على الفراغ', en: 'Open-circuit Thévenin EMF' }, unit: 'V' },
      { symbol: 'R_th', meaning: { fr: 'Résistance équivalente sources éteintes', ar: 'المقاومة المكافئة عند إطفاء المصادر', en: 'Equivalent resistance (sources zeroed)' }, unit: 'Ω' },
      { symbol: 'I_N', meaning: { fr: 'Courant de Norton = E_th / R_th', ar: 'تيار نورتن = E_th / R_th', en: 'Norton short-circuit current' }, unit: 'mA' },
    ],
    examples: [
      {
        id: 'thevenin-divider',
        pageRef: 'Ex. 9.1',
        title: { fr: 'Réduction du pont diviseur (E₁, R₁, R₂)', ar: 'اختزال مقسّم الجهد إلى ثيفنان', en: 'Voltage Divider Thévenin Reduction' },
        summary: {
          fr: 'Comparez le pont diviseur complet et son modèle (E_th, R_th) : observez que V_L et I_L restent strictement identiques.',
          ar: 'قارن المقسّم الكامل بنموذج (E_th, R_th) وتحقق من تطابق V_L و I_L تماماً.',
          en: 'Compare the full divider with its (E_th, R_th) model and watch V_L and I_L match identically.',
        },
        howItWorks: {
          fr: 'Pour simplifier le pont (E₁, R₁, R₂) vu par R_L : on débranche d’abord R_L afin de lire la tension à vide E_th = E₁·R₂/(R₁+R₂). Ensuite, on remplace idéalement la pile E₁ par un fil vers GND, ce qui place R₁ et R₂ en parallèle entre A et B : R_th = R₁ // R₂. Enfin, on rebranche R_L sur la paire (E_th, R_th) : le courant I_L = E_th/(R_th+R_L) et la tension V_L sont strictement identiques à ceux du pont complet !',
          ar: 'لاختزال المقسّم (E₁, R₁, R₂) من منظور الحمل R_L: نفصل R_L أولاً لنقرأ جهد الفراغ E_th = E₁·R₂/(R₁+R₂). ثم نستبدل البطارية بسلك قصر فترتبط R₁ و R₂ على التوازي بين A و B فتصبح R_th = R₁ // R₂. عند إعادة توصيل R_L بهذا النموذج المبسط، تتطابق قيم I_L و V_L تماماً مع الشبكة الأصلية.',
          en: 'To reduce divider (E₁, R₁, R₂) seen by R_L: first disconnect R_L to measure open-circuit voltage E_th = E₁·R₂/(R₁+R₂). Next, short E₁ to GND, placing R₁ and R₂ in parallel across terminals A–B so R_th = R₁ // R₂. Reconnecting R_L to (E_th, R_th) yields the exact same V_L and I_L as the original circuit.',
        },
        components: ['E₁', 'R₁', 'R₂', 'R_L'],
      },
      {
        id: 'thevenin-dual-mesh',
        pageRef: 'Ex. 9.2',
        title: { fr: 'Thévenin sur réseau à 2 sources (E₁, E₂)', ar: 'ثيفنان لشبكة بمصدرين (E₁, E₂)', en: '2-Source Network Thévenin Equivalent' },
        summary: {
          fr: 'Réduisez un réseau actif à deux piles vers une seule source E_th via Millman et R_th = R₁ // R₂.',
          ar: 'اختزل شبكة بمصدرين إلى مصدر وحيد E_th عبر ميلمان ومقاومة وحيدة R₁ // R₂.',
          en: 'Collapse a dual-battery mesh into one E_th and R_th = R₁ // R₂ feeding any variable load R_L.',
        },
        howItWorks: {
          fr: 'Deux sources E₁ (via R₁) et E₂ (via R₂) alimentent ensemble le nœud de sortie A où se branche R_L. R_L débranchée, Millman donne immédiatement le potentiel à vide E_th = (E₁/R₁ + E₂/R₂) / (1/R₁ + 1/R₂). En éteignant E₁ et E₂ (mises à 0 V), R₁ et R₂ se retrouvent en parallèle vers la masse : R_th = R₁ // R₂. Toute variation de R_L se calcule ensuite en une seule division !',
          ar: 'يغذّي المصدران E₁ (عبر R₁) و E₂ (عبر R₂) نقطة الخرج A. عند فصل الحمل R_L تحسب مبرهنة ميلمان جهد الفراغ مباشرة E_th = (E₁/R₁ + E₂/R₂)/(1/R₁ + 1/R₂). وبإطفاء المصدرين إلى الصفر تتصل R₁ و R₂ على التوازي نحو الأرضي فنجد R_th = R₁ // R₂، وبذلك نحسب تيار وجهد أي حمل R_L بمعادلة واحدة.',
          en: 'Sources E₁ (via R₁) and E₂ (via R₂) both feed output Node A before R_L. With R_L removed, Millman gives open-circuit E_th = (E₁/R₁ + E₂/R₂)/(1/R₁ + 1/R₂). Zeroing both voltage sources places R₁ and R₂ in parallel to GND, yielding R_th = R₁ // R₂ so any load R_L reduces to one simple divider step.',
        },
        components: ['E₁', 'E₂', 'R₁', 'R₂', 'R_L'],
      },
    ],
    prediction: {
      question: {
        fr: 'Un pont diviseur E₁ = 12 V avec R₁ = 2 kΩ et R₂ = 2 kΩ alimente une charge R_L = 1 kΩ. Quels sont E_th et R_th vus par R_L ?',
        ar: 'مقسّم جهد E₁ = 12V مع R₁ = 2kΩ و R₂ = 2kΩ يغذي حملاً R_L = 1kΩ. ما قيمتا E_th و R_th؟',
        en: 'A 12 V divider with R₁ = 2 kΩ and R₂ = 2 kΩ feeds R_L = 1 kΩ. What are E_th and R_th seen by R_L?',
      },
      options: [
        { fr: 'E_th = 6,0 V et R_th = 1,0 kΩ (donc V_L = 3,0 V)', ar: 'E_th = 6.0V و R_th = 1.0kΩ (إذن V_L = 3.0V)', en: 'E_th = 6.0 V and R_th = 1.0 kΩ (so V_L = 3.0 V)' },
        { fr: 'E_th = 6,0 V et R_th = 4,0 kΩ (R₁ + R₂)', ar: 'E_th = 6.0V و R_th = 4.0kΩ (مجموع المقاومتين)', en: 'E_th = 6.0 V and R_th = 4.0 kΩ (R₁ + R₂)' },
        { fr: 'E_th = 12,0 V et R_th = 2,0 kΩ', ar: 'E_th = 12.0V و R_th = 2.0kΩ', en: 'E_th = 12.0 V and R_th = 2.0 kΩ' },
      ],
      correctIndex: 0,
      explanation: {
        fr: 'À vide, le pont 2k/2k divise 12 V par 2 → E_th = 6,0 V. Avec E₁ court-circuitée à GND, R₁ et R₂ sont en parallèle → R_th = 2k // 2k = 1,0 kΩ. Sur R_L = 1 kΩ, V_L = 6 × 1 / (1+1) = 3,0 V !',
        ar: 'في الفراغ ينقسم الجهد إلى النصف E_th = 6.0V. وعند قصر المصدر تصبح R₁ و R₂ على التوازي فنجد R_th = 1.0kΩ، وبالتالي V_L = 3.0V.',
        en: 'Open-circuit V_AB = 12 × 2k / 4k = 6.0 V. Zeroing E₁ places R₁ in parallel with R₂ → R_th = 2k // 2k = 1.0 kΩ, giving V_L = 6 × 1k / 2k = 3.0 V.',
      },
    },
    teacherNote: {
      fr: 'Basculez le bouton « Modèle Équivalent Thévenin » sur la platine pour prouver visuellement que V_L et I_L ne bougent pas d’un centième de volt après réduction !',
      ar: 'اضغط زر «النموذج المكافئ لثيفنان» في اللوحة ليثبت الطالب عملياً أن V_L و I_L لا يتغيران إطلاقاً بعد الاختزال!',
      en: 'Toggle the “Thévenin Equivalent View” switch on the bench to show live that V_L and I_L remain identical after reduction!',
    },
  },
];
