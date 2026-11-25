export type Lang = 'fr' | 'ar' | 'en';

export type CourseTrack = 'home' | 'bjt' | 'mosfet' | 'kirchhoff';

export type AppView = 'chapters' | 'catalog' | 'catalog-sim' | 'tools';

export interface BiText {
  fr: string;
  ar: string;
  en: string;
}

export function tr(lang: Lang, fr: string, ar: string, en: string): string {
  return lang === 'fr' ? fr : lang === 'ar' ? ar : en;
}

export interface BookExample {
  id: string;
  pageRef: string;
  title: BiText;
  summary: BiText;
  howItWorks: BiText;
  components: string[];
}

export interface PredictionQuestion {
  question: BiText;
  options: BiText[];
  correctIndex: number;
  explanation: BiText;
}

export interface ChapterFormulaVar {
  symbol: string;
  meaning: BiText;
  unit: string;
}

export interface ChapterDef {
  id: number;
  slug: string;
  pageRef: string;
  title: BiText;
  subtitle: BiText;
  analogyTitle: BiText;
  analogyText: BiText;
  theory: BiText[];
  formula: string;
  formulaVars: ChapterFormulaVar[];
  examples: BookExample[];
  prediction: PredictionQuestion;
  teacherNote: BiText;
}

export type CatalogCategory =
  | 'all'
  | 'basics'
  | 'leds'
  | 'sensors'
  | 'audio'
  | 'power'
  | 'testers';

export interface CatalogCircuit {
  id: string;
  page: number;
  title: string;
  titleBi: BiText;
  category: Exclude<CatalogCategory, 'all'>;
  transistors: string[];
  supply: string;
  parts: string[];
  concept: BiText;
  analogyTitle: BiText;
  analogyText: BiText;
}
