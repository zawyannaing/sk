import { Language } from '../../types';

export type LandingNavSectionId =
  | 'hero'
  | 'features'
  | 'suite-8step'
  | 'photo-studio'
  | 'photo-tools'
  | 'video-studio'
  | 'before-after'
  | 'pricing';

export interface MasterLandingPageProps {
  onLaunch: () => void;
  onSignIn: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  isLoggedIn?: boolean;
}

export interface StudioChapter {
  id: string;
  number: string;
  navAnchorId: LandingNavSectionId;
  badgeEn: string;
  badgeMm: string;
  titleEn: string;
  titleMm: string;
  taglineEn: string;
  taglineMm: string;
  descriptionEn: string;
  descriptionMm: string;
  featuresEn: string[];
  featuresMm: string[];
  metricsEn: { label: string; value: string }[];
  metricsMm: { label: string; value: string }[];
}

export interface StatItem {
  id: string;
  targetNumber: number;
  suffix?: string;
  labelEn: string;
  labelMm: string;
  iconName: string;
}

export interface CreditCostTier {
  resolution: string;
  credits: number;
  useCaseEn: string;
  useCaseMm: string;
  badge?: string;
}
