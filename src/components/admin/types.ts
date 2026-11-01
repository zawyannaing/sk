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
