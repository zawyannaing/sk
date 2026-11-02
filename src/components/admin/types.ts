import { UserProfile } from '../../types';

export type AdminModuleId =
  | 'dashboard'
  | 'users'
  | 'credits'
  | 'providers'
  | 'settings'
  | 'announcements'
  | 'bundles'
  | 'promo_topup'
  | 'flags'
  | 'audit';

export type UserStatus = 'active' | 'suspended' | 'banned';

export interface AdminUserRecord extends UserProfile {
  status: UserStatus;
  lastSeenAt?: string;
  verifiedBalance?: number;
  totalTransactions?: number;
}

export interface CreditLedgerItem {
  id: string;
  user_id: string;
  amount: number;
  reason: 'daily_grant' | 'generation' | 'bundle' | 'promo' | 'admin_adjust' | 'refund';
  ref_id?: string;
  note?: string;
  created_by?: string;
  created_at: string;
}

export interface AuditLogItem {
  id: string;
  actor_id?: string;
  action: string;
  target_type: string;
  target_id?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  ip?: string;
  created_at: string;
}

export interface AdjustCreditsPayload {
  userId: string;
  amount: number;
  reason: string;
  note: string;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  body: string;
  type: 'info' | 'warning' | 'success' | 'critical';
  placement: 'banner' | 'modal' | 'toast';
  audience: 'all' | 'logged_in' | 'logged_out';
  starts_at: string;
  ends_at?: string | null;
  is_active: boolean;
  dismissible: boolean;
  cta_label?: string | null;
  cta_url?: string | null;
  language: 'en' | 'my' | 'both';
  created_at?: string;
  created_by?: string;
}

export interface SocialLinksSettings {
  facebook: string;
  telegram: string;
  tiktok: string;
  youtube: string;
  viber: string;
  support_email: string;
}

export interface MaintenanceSettings {
  active: boolean;
  notice_en: string;
  notice_my: string;
}

export interface FeatureFlagsSettings {
  photo_studio: boolean;
  video_studio: boolean;
  detail_burmese: boolean;
  community: boolean;
  face_swap: boolean;
  bg_change: boolean;
  edit_image: boolean;
}

export interface AppSettingRecord {
  key: string;
  value: any;
  description?: string;
  updated_at?: string;
}

export interface BundleItem {
  id: string;
  name_en: string;
  name_my: string;
  credits: number;
  bonus_credits: number;
  price: number;
  currency: string;
  valid_days?: number | null;
  is_active: boolean;
  sort_order: number;
  badge_text?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PromoCodeItem {
  code: string;
  credits: number;
  max_uses: number;
  used_count: number;
  expires_at?: string | null;
  is_active: boolean;
  created_by?: string;
  created_at?: string;
}

export interface PromoRedemptionItem {
  id: string;
  code: string;
  user_id: string;
  credits_granted: number;
  redeemed_at: string;
  user_email?: string;
}

export interface TopupRequestItem {
  id: string;
  user_id: string;
  bundle_id: string;
  payment_method: 'kpay' | 'wave' | 'kbz_pay' | 'wave_pay' | 'card' | 'crypto' | 'bank_transfer';
  slip_image_path: string;
  amount_paid?: number;
  currency?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  admin_note?: string | null;
  created_at: string;
  updated_at?: string;
  user_email?: string;
  bundle_name?: string;
}

export interface ProviderSecretMeta {
  provider: string;
  label: string;
  last4: string;
  status: 'active' | 'disabled' | 'expired';
  updated_at: string;
  updated_by?: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeToday: number;
  totalCreditsCirculating: number;
  totalTransactions: number;
  pendingTopups: number;
  dailyUsageTrend: { day: string; credits: number; count: number }[];
  studioDistribution: { studio: string; count: number; percentage: number }[];
}
