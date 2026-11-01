import { SupabaseSession } from '../../utils/supabaseClient';

export type AuthMode = 'signin' | 'signup' | 'magic' | 'forgot' | 'recovery';

export interface AuthPageProps {
  isOpen: boolean;
  onClose?: () => void;
  initialMode?: AuthMode;
  targetSection?: string;
  language: 'en' | 'my';
  onLanguageChange?: (lang: 'en' | 'my') => void;
  onAuthSuccess?: (session: SupabaseSession, targetSection?: string) => void;
}

export interface PasswordScore {
  score: number; // 0 - 4
  label: string;
  color: string;
  hasLength: boolean;
  hasLower: boolean;
  hasUpper: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}
