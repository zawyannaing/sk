import { UserProfile, PromptHistoryItem, UserNoteEntry, AppMode } from '../types';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export interface SupabaseSession {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  user: {
    id: string;
    email?: string;
    user_metadata?: Record<string, any>;
  };
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  balance_after: number;
  type: 'signup_bonus' | 'daily_reward' | 'topup' | 'admin_topup' | 'photo_generation' | 'video_generation' | 'prompt_generation' | 'refund';
  description: string;
  admin_id?: string | null;
  created_at: string;
}

export interface WebsiteAssetRecord {
  id: string;
  section: 'garment' | 'jewelry_prop' | 'archetype' | 'preset_template' | 'category' | 'banner';
  asset_key: string;
  title_mm: string;
  title_en: string;
  category: string;
  image_url: string;
  prompt_fragment?: string;
  metadata?: Record<string, any>;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
}

export interface CloudHistoryRecord {
  id: string;
  user_id: string;
  mode: string;
  master_prompt: string;
  negative_prompt?: string;
  burmese_explanation?: string;
  generated_image_url?: string;
  provider?: string;
  aspect_ratio?: string;
  folder: string;
  is_favorite: boolean;
  credits_used: number;
  created_at: string;
}

export interface TopupRequest {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  package_id: string;
  package_name: string;
  credits: number;
  cost_usd: number;
  payment_method: string;
  payment_ref: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  admin_note?: string;
}

const CONFIG_STORAGE_KEY = 'aistudio_supabase_config_v1';
const SESSION_STORAGE_KEY = 'aistudio_supabase_session_v1';

const DEFAULT_SUPABASE_URL = 'https://qiuljrsqztohzyyghany.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_rkmYkYrptB5AjII4JigQSQ_1jY6RvYh';

// Helper to convert base64 dataUrl to Blob for Supabase Storage upload
function dataUrlToBlob(dataUrl: string): { blob: Blob; ext: string; mimeType: string } | null {
  try {
    const match = dataUrl.match(/^data:(image\/([a-zA-Z0-9+]+));base64,(.+)$/);
    if (!match) return null;
    const mimeType = match[1];
    const ext = match[2] === 'jpeg' ? 'jpg' : match[2];
    const byteString = atob(match[3]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return {
      blob: new Blob([ab], { type: mimeType }),
      ext,
      mimeType
    };
  } catch {
    return null;
  }
}

export const SupabaseService = {
  // ---- 1. Configuration ----
  getConfig(): SupabaseConfig | null {
    const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
    const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';
    if (envUrl && envKey && envUrl.startsWith('http')) {
      return { url: envUrl.replace(/\/$/, ''), anonKey: envKey.trim() };
    }
    try {
      const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.url && parsed?.anonKey && parsed.url.startsWith('http')) {
          return {
            url: parsed.url.trim().replace(/\/$/, ''),
            anonKey: parsed.anonKey.trim()
          };
        }
      }
    } catch {}
    return {
      url: DEFAULT_SUPABASE_URL,
      anonKey: DEFAULT_SUPABASE_KEY
    };
  },

  saveConfig(url: string, anonKey: string): SupabaseConfig {
    const clean: SupabaseConfig = {
      url: url.trim().replace(/\/$/, ''),
      anonKey: anonKey.trim()
    };
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(clean));
    return clean;
  },

  clearConfig() {
    localStorage.removeItem(CONFIG_STORAGE_KEY);
    localStorage.removeItem(SESSION_STORAGE_KEY);
  },

  isConfigured(): boolean {
    return !!this.getConfig();
  },

  // ---- 2. Session & Auth Headers ----
  getSession(): SupabaseSession | null {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  saveSession(session: SupabaseSession | null) {
    if (!session) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return;
    }
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  },

  getHeaders(includeJson = true, useAuthToken = true): Record<string, string> {
    const cfg = this.getConfig();
    if (!cfg) throw new Error('Supabase is not configured');
    const session = this.getSession();
    const headers: Record<string, string> = {
      apikey: cfg.anonKey
    };
    if (useAuthToken && session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    } else if (cfg.anonKey) {
      headers['Authorization'] = `Bearer ${cfg.anonKey}`;
    }
    if (includeJson) {
      headers['Content-Type'] = 'application/json';
    }
    return headers;
  },

  // ---- 3. Authentication (GoTrue REST API + Server Instant Confirm) ----
  async signUp(email: string, password: string, fullName: string): Promise<{ session: SupabaseSession | null; user: any; error?: string }> {
    const cfg = this.getConfig();
    if (!cfg) return { session: null, user: null, error: 'Supabase URL & Anon Key not configured' };

    try {
      // 1. Try server-assisted instant signup (auto-confirms email using SUPABASE_SECRET_KEY)
      try {
        const instantRes = await fetch('/api/supabase/instant-signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim(),
            password,
            fullName: fullName.trim()
          })
        });
        const instantData = await instantRes.json();
        if (instantRes.ok && instantData?.session?.access_token) {
          this.saveSession(instantData.session);
          await this.ensureProfileExists(instantData.session.user.id, email.trim(), fullName.trim());
          return { session: instantData.session, user: instantData.session.user };
        }
      } catch {}

      // 2. Standard Supabase GoTrue signup
      const res = await fetch(`${cfg.url}/auth/v1/signup`, {
        method: 'POST',
        headers: this.getHeaders(true, false),
        body: JSON.stringify({
          email: email.trim(),
          password,
          data: { full_name: fullName.trim() }
        })
      });
      const data = await res.json();
      if (!res.ok) {
        return { session: null, user: null, error: data?.msg || data?.error_description || data?.message || 'Sign up failed' };
      }
      if (data?.access_token) {
        const session: SupabaseSession = {
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_at: data.expires_at,
          user: data.user
        };
        this.saveSession(session);
        await this.ensureProfileExists(session.user.id, email.trim(), fullName.trim());
        return { session, user: data.user };
      }

      // If Supabase returned user without access_token (Email Confirmation enabled in Supabase settings),
      // try auto-confirming via backend & signing in, or create an immediate verified session for this user
      const createdUser = data?.user || (data?.id ? data : null);
      if (createdUser?.id) {
        try {
          await fetch('/api/supabase/confirm-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.trim() })
          });
          const loginAfterConfirm = await this.signIn(email.trim(), password);
          if (loginAfterConfirm.session) {
            return { session: loginAfterConfirm.session, user: loginAfterConfirm.session.user };
          }
        } catch {}

        const immediateSession: SupabaseSession = {
          access_token: cfg.anonKey,
          user: {
            id: createdUser.id,
            email: email.trim(),
            user_metadata: {
              full_name: fullName.trim(),
              role: 'user'
            }
          }
        };
        this.saveSession(immediateSession);
        await this.ensureProfileExists(createdUser.id, email.trim(), fullName.trim());
        return { session: immediateSession, user: immediateSession.user };
      }

      return { session: null, user: data?.user || data };
    } catch (e: any) {
      return { session: null, user: null, error: e?.message || 'Network error during sign up' };
    }
  },

  async signIn(email: string, password: string): Promise<{ session: SupabaseSession | null; error?: string }> {
    const cfg = this.getConfig();
    if (!cfg) return { session: null, error: 'Supabase URL & Anon Key not configured' };

    const cleanEmail = email.trim();

    try {
      let res = await fetch(`${cfg.url}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: this.getHeaders(true, false),
        body: JSON.stringify({ email: cleanEmail, password })
      });
      let data = await res.json();

      // If login did not succeed (e.g. unconfirmed email), attempt confirm-email endpoint and retry once
      if (!res.ok) {
        const errMsg = String(data?.msg || data?.error_description || data?.message || '').toLowerCase();
        if (errMsg.includes('confirm') || errMsg.includes('verification')) {
          try {
            await fetch('/api/supabase/confirm-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: cleanEmail })
            });

            res = await fetch(`${cfg.url}/auth/v1/token?grant_type=password`, {
              method: 'POST',
              headers: this.getHeaders(true, false),
              body: JSON.stringify({ email: cleanEmail, password })
            });
            data = await res.json();
          } catch {}
        }
      }

      if (!res.ok) {
        return { session: null, error: data?.error_description || data?.msg || data?.message || 'Invalid login credentials' };
      }
      const session: SupabaseSession = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: data.expires_at,
        user: data.user
      };
      this.saveSession(session);
      await this.ensureProfileExists(
        session.user.id,
        session.user.email || cleanEmail,
        session.user.user_metadata?.full_name || cleanEmail.split('@')[0]
      );
      return { session };
    } catch (e: any) {
      return { session: null, error: e?.message || 'Network error during sign in' };
    }
  },

  async signOut(): Promise<void> {
    const cfg = this.getConfig();
    const session = this.getSession();
    if (cfg && session?.access_token) {
      try {
        await fetch(`${cfg.url}/auth/v1/logout`, {
          method: 'POST',
          headers: this.getHeaders(true, true)
        });
      } catch {}
    }
    this.saveSession(null);
  },

  // ---- 4. User Profile & Balance Management ----
  async ensureProfileExists(userId: string, email: string, name: string): Promise<UserProfile | null> {
    const existing = await this.getUserProfile(userId);
    if (existing) return existing;

    const cfg = this.getConfig();
    if (!cfg) return null;
    const initialCredits = 250;
    const role = 'user';

    try {
      const res = await fetch(`${cfg.url}/rest/v1/profiles`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          Prefer: 'return=representation,resolution=ignore-duplicates'
        },
        body: JSON.stringify({
          id: userId,
          email,
          name: name || email.split('@')[0],
          role,
          credits: initialCredits,
          bio: 'AI Photo Studio Creator'
        })
      });
      if (res.ok) {
        const rows = await res.json();
        if (rows?.[0]) return this.mapRowToProfile(rows[0]);
      }
    } catch {}
    return this.getUserProfile(userId);
  },

  mapRowToProfile(row: any): UserProfile {
    const emailStr = String(row.email || '');
    const rawCredits =
      typeof row.credits === 'number'
        ? row.credits
        : typeof row.credit_balance === 'number'
        ? row.credit_balance
        : 250;
    return {
      id: row.id,
      name: row.name || row.full_name || emailStr.split('@')[0] || 'Creator',
      email: emailStr,
      avatar: row.avatar_url || '',
      role: row.role === 'admin' ? 'admin' : 'user',
      createdAt: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      bio: row.bio || '',
      credits: rawCredits
    };
  },

  async getUserProfile(userId?: string): Promise<UserProfile | null> {
    const cfg = this.getConfig();
    const session = this.getSession();
    const targetId = userId || session?.user?.id;
    if (!cfg || !targetId) return null;

    const fallbackFromSession = (): UserProfile | null => {
      if (!session?.user) return null;
      const emailStr = String(session.user.email || '');
      const role = session.user.user_metadata?.role === 'admin' ? 'admin' : 'user';
      return {
        id: session.user.id,
        name: session.user.user_metadata?.full_name || emailStr.split('@')[0] || 'Creator',
        email: emailStr,
        avatar: '',
        role,
        createdAt: new Date().toISOString().split('T')[0],
        bio: role === 'admin' ? 'Master Studio Administrator' : 'AI Photo Studio Creator',
        credits: 250
      };
    };

    try {
      const res = await fetch(`${cfg.url}/rest/v1/profiles?id=eq.${encodeURIComponent(targetId)}&select=*`, {
        headers: this.getHeaders()
      });
      if (res.status === 401) {
        this.saveSession(null);
        return fallbackFromSession();
      }
      if (!res.ok) return fallbackFromSession();
      const rows = await res.json();
      if (!rows?.length) return fallbackFromSession();
      return this.mapRowToProfile(rows[0]);
    } catch {
      return fallbackFromSession();
    }
  },

  async updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const cfg = this.getConfig();
    const session = this.getSession();
    if (!cfg || !session?.user?.id) return null;

    let avatarUrl = updates.avatar;
    if (avatarUrl && avatarUrl.startsWith('data:image')) {
      const uploaded = await this.uploadPhotoToBucket('user-generations', avatarUrl, `avatars/${session.user.id}`);
      if (uploaded) avatarUrl = uploaded;
    }

    // Role and credits are protected and can only be updated by server/admin
    const payload: Record<string, any> = { updated_at: new Date().toISOString() };
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.bio !== undefined) payload.bio = updates.bio;
    if (avatarUrl !== undefined) payload.avatar_url = avatarUrl;

    const res = await fetch(`${cfg.url}/rest/v1/profiles?id=eq.${encodeURIComponent(session.user.id)}`, {
      method: 'PATCH',
      headers: {
        ...this.getHeaders(),
        Prefer: 'return=representation'
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) return null;
    const rows = await res.json();
    return rows?.[0] ? this.mapRowToProfile(rows[0]) : null;
  },

  async fetchAllProfiles(): Promise<UserProfile[]> {
    const cfg = this.getConfig();
    if (!cfg) return [];
    try {
      const res = await fetch(`${cfg.url}/rest/v1/profiles?select=*&order=created_at.desc`, {
        headers: this.getHeaders()
      });
      if (!res.ok) return [];
      const rows = await res.json();
      return (rows || []).map((r: any) => this.mapRowToProfile(r));
    } catch {
      return [];
    }
  },

  // ---- 5. Credit Balance Deduction & Admin Top-up ----
  async deductCredits(
    cost: number,
    type: 'photo_generation' | 'video_generation' | 'video_prompt' | 'prompt_generation' = 'photo_generation',
    description = 'AI Studio Generation'
  ): Promise<{ success: boolean; credits?: number; error?: string }> {
    const cfg = this.getConfig();
    const session = this.getSession();
    if (!cfg || !session?.user?.id) {
      return { success: false, error: 'Please sign in to use credits' };
    }

    try {
      // Try atomic RPC first
      const rpcRes = await fetch(`${cfg.url}/rest/v1/rpc/deduct_user_credits`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          p_cost: cost,
          p_type: type,
          p_description: description
        })
      });

      if (rpcRes.ok) {
        const result = await rpcRes.json();
        return {
          success: !!result?.success,
          credits: result?.credits,
          error: result?.error
        };
      }

      // Fallback direct update if RPC isn't installed yet
      const profile = await this.getUserProfile(session.user.id);
      if (!profile) return { success: false, error: 'Profile not found' };
      if ((profile.credits || 0) < cost) {
        return { success: false, credits: profile.credits, error: 'Insufficient credit balance' };
      }
      const nextCredits = (profile.credits || 0) - cost;
      await this.updateUserProfile({ credits: nextCredits });
      await fetch(`${cfg.url}/rest/v1/credit_transactions`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          user_id: session.user.id,
          amount: -cost,
          balance_after: nextCredits,
          type,
          description
        })
      });
      return { success: true, credits: nextCredits };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Credit deduction failed' };
    }
  },

  async adminAdjustUserCredits(
    targetUserId: string,
    amount: number,
    description = 'Admin credit top-up'
  ): Promise<{ success: boolean; credits?: number; error?: string }> {
    const cfg = this.getConfig();
    const session = this.getSession();
    if (!cfg || !session?.user?.id) return { success: false, error: 'Not authenticated' };

    try {
      const rpcRes = await fetch(`${cfg.url}/rest/v1/rpc/admin_adjust_user_credits`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          p_target_user_id: targetUserId,
          p_amount: amount,
          p_description: description
        })
      });

      if (rpcRes.ok) {
        const result = await rpcRes.json();
        return { success: !!result?.success, credits: result?.credits };
      }

      // Direct fallback for Admin
      const targetProfile = await this.getUserProfile(targetUserId);
      if (!targetProfile) return { success: false, error: 'User not found' };
      const nextCredits = Math.max(0, (targetProfile.credits || 0) + amount);

      const patchRes = await fetch(`${cfg.url}/rest/v1/profiles?id=eq.${encodeURIComponent(targetUserId)}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({ credits: nextCredits, updated_at: new Date().toISOString() })
      });
      if (!patchRes.ok) return { success: false, error: 'Failed to update credits' };

      await fetch(`${cfg.url}/rest/v1/credit_transactions`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          user_id: targetUserId,
          amount,
          balance_after: nextCredits,
          type: 'admin_topup',
          description,
          admin_id: session.user.id
        })
      });

      return { success: true, credits: nextCredits };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Error adjusting credits' };
    }
  },

  async adminSetUserCredits(
    targetUserId: string,
    exactCredits: number,
    description = 'Admin balance set'
  ): Promise<{ success: boolean; credits?: number; error?: string }> {
    const cfg = this.getConfig();
    const session = this.getSession();
    if (!cfg || !session?.user?.id) return { success: false, error: 'Not authenticated' };

    try {
      const targetProfile = await this.getUserProfile(targetUserId);
      if (!targetProfile) return { success: false, error: 'User not found' };
      const nextCredits = Math.max(0, exactCredits);
      const diff = nextCredits - (targetProfile.credits || 0);

      const patchRes = await fetch(`${cfg.url}/rest/v1/profiles?id=eq.${encodeURIComponent(targetUserId)}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({ credits: nextCredits, updated_at: new Date().toISOString() })
      });
      if (!patchRes.ok) return { success: false, error: 'Failed to update credits' };

      await fetch(`${cfg.url}/rest/v1/credit_transactions`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          user_id: targetUserId,
          amount: diff,
          balance_after: nextCredits,
          type: 'admin_topup',
          description,
          admin_id: session.user.id
        })
      });

      return { success: true, credits: nextCredits };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Error setting credits' };
    }
  },

  async adminChangeUserRole(
    targetUserId: string,
    role: 'admin' | 'user'
  ): Promise<{ success: boolean; error?: string }> {
    const cfg = this.getConfig();
    const session = this.getSession();
    if (!cfg || !session?.user?.id) return { success: false, error: 'Not authenticated' };

    try {
      const patchRes = await fetch(`${cfg.url}/rest/v1/profiles?id=eq.${encodeURIComponent(targetUserId)}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({ role, updated_at: new Date().toISOString() })
      });
      return { success: patchRes.ok };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Error changing role' };
    }
  },

  // ---- Daily 250 Free Credits Claimer ----
  async claimDailyReward(): Promise<{ success: boolean; credits?: number; error?: string; alreadyClaimed?: boolean }> {
    const cfg = this.getConfig();
    const session = this.getSession();
    if (!cfg || !session?.user?.id) {
      return { success: false, error: 'Please sign in to claim daily free credits.' };
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const storageKey = `showai_daily_claim_${session.user.id}_${todayStr}`;
    if (localStorage.getItem(storageKey)) {
      return { success: false, alreadyClaimed: true, error: 'You have already claimed your 250 free credits for today. Come back tomorrow!' };
    }

    try {
      // Check transactions to prevent duplicate claim on different devices/browsers
      const checkRes = await fetch(
        `${cfg.url}/rest/v1/credit_transactions?user_id=eq.${encodeURIComponent(session.user.id)}&type=eq.daily_reward&created_at=gte.${todayStr}T00:00:00.000Z&select=id`,
        { headers: this.getHeaders() }
      );
      if (checkRes.ok) {
        const txs = await checkRes.json();
        if (Array.isArray(txs) && txs.length > 0) {
          localStorage.setItem(storageKey, 'true');
          return { success: false, alreadyClaimed: true, error: 'You have already claimed your 250 free credits for today. Come back tomorrow!' };
        }
      }

      const profile = await this.getUserProfile(session.user.id);
      const currentCredits = profile?.credits || 0;
      const nextCredits = currentCredits + 250;

      // Update user credits
      await fetch(`${cfg.url}/rest/v1/profiles?id=eq.${encodeURIComponent(session.user.id)}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({
          credits: nextCredits,
          updated_at: new Date().toISOString()
        })
      });

      // Insert credit ledger transaction
      await fetch(`${cfg.url}/rest/v1/credit_transactions`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          user_id: session.user.id,
          amount: 250,
          balance_after: nextCredits,
          type: 'daily_reward',
          description: `Daily Free Reward: +250 Credits (${todayStr})`
        })
      });

      localStorage.setItem(storageKey, 'true');
      return { success: true, credits: nextCredits };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to claim daily reward' };
    }
  },

  checkDailyRewardStatus(): boolean {
    const session = this.getSession();
    if (!session?.user?.id) return false;
    const todayStr = new Date().toISOString().slice(0, 10);
    return !localStorage.getItem(`showai_daily_claim_${session.user.id}_${todayStr}`);
  },

  // ---- User Top-up Order / Request (Requires Admin Approval) ----
  async submitTopupRequest(
    packageId: string,
    packageName: string,
    credits: number,
    costUsd: number,
    paymentMethod: string,
    paymentRef: string
  ): Promise<{ success: boolean; request?: TopupRequest; error?: string }> {
    const session = this.getSession();
    if (!session?.user?.id) {
      return { success: false, error: 'Please sign in to submit a top-up request.' };
    }
    const profile = await this.getUserProfile(session.user.id);
    const newReq: TopupRequest = {
      id: 'req_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      user_id: session.user.id,
      user_email: session.user.email || profile?.email || '',
      user_name: profile?.name || session.user.user_metadata?.full_name || 'Creator',
      package_id: packageId,
      package_name: packageName,
      credits,
      cost_usd: costUsd,
      payment_method: paymentMethod,
      payment_ref: paymentRef,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    // Store in localStorage cache
    try {
      const raw = localStorage.getItem('showai_topup_requests') || '[]';
      const list: TopupRequest[] = JSON.parse(raw);
      list.unshift(newReq);
      localStorage.setItem('showai_topup_requests', JSON.stringify(list));
    } catch {}

    // Also attempt to persist in Supabase if configured
    const cfg = this.getConfig();
    if (cfg) {
      try {
        await fetch(`${cfg.url}/rest/v1/topup_requests`, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(newReq)
        });
      } catch {}
    }

    return { success: true, request: newReq };
  },

  async fetchTopupRequests(userId?: string): Promise<TopupRequest[]> {
    const session = this.getSession();
    const cfg = this.getConfig();
    let requests: TopupRequest[] = [];

    // First try Supabase table
    if (cfg && session?.user?.id) {
      try {
        const filter = userId ? `?user_id=eq.${encodeURIComponent(userId)}&order=created_at.desc` : '?order=created_at.desc';
        const res = await fetch(`${cfg.url}/rest/v1/topup_requests${filter}`, {
          headers: this.getHeaders()
        });
        if (res.ok) {
          requests = await res.json();
        }
      } catch {}
    }

    // Fallback/merge from localStorage cache
    try {
      const raw = localStorage.getItem('showai_topup_requests') || '[]';
      const localList: TopupRequest[] = JSON.parse(raw);
      if (Array.isArray(localList)) {
        for (const item of localList) {
          if (!requests.some(r => r.id === item.id)) {
            if (!userId || item.user_id === userId) {
              requests.push(item);
            }
          }
        }
      }
    } catch {}

    requests.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return requests;
  },

  async approveTopupRequest(requestId: string, adminNote?: string): Promise<{ success: boolean; credits?: number; error?: string }> {
    const session = this.getSession();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    let targetReq: TopupRequest | null = null;
    const all = await this.fetchTopupRequests();
    targetReq = all.find(r => r.id === requestId) || null;
    if (!targetReq) return { success: false, error: 'Request not found' };

    // Credit user's account
    const adjustRes = await this.adminAdjustUserCredits(
      targetReq.user_id,
      targetReq.credits,
      `Top-up Approved: +${targetReq.credits.toLocaleString()} Credits ($${targetReq.cost_usd} via ${targetReq.payment_method})`
    );

    if (!adjustRes.success) {
      return { success: false, error: adjustRes.error || 'Failed to allocate credits' };
    }

    // Update status to approved
    try {
      const raw = localStorage.getItem('showai_topup_requests') || '[]';
      const localList: TopupRequest[] = JSON.parse(raw);
      const updated = localList.map(r => r.id === requestId ? { ...r, status: 'approved' as const, reviewed_at: new Date().toISOString(), reviewed_by: session.user.id, admin_note: adminNote } : r);
      localStorage.setItem('showai_topup_requests', JSON.stringify(updated));
    } catch {}

    const cfg = this.getConfig();
    if (cfg) {
      try {
        await fetch(`${cfg.url}/rest/v1/topup_requests?id=eq.${encodeURIComponent(requestId)}`, {
          method: 'PATCH',
          headers: this.getHeaders(),
          body: JSON.stringify({
            status: 'approved',
            reviewed_at: new Date().toISOString(),
            reviewed_by: session.user.id,
            admin_note: adminNote
          })
        });
      } catch {}
    }

    return { success: true, credits: adjustRes.credits };
  },

  async rejectTopupRequest(requestId: string, reason?: string): Promise<{ success: boolean; error?: string }> {
    const session = this.getSession();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    try {
      const raw = localStorage.getItem('showai_topup_requests') || '[]';
      const localList: TopupRequest[] = JSON.parse(raw);
      const updated = localList.map(r => r.id === requestId ? { ...r, status: 'rejected' as const, reviewed_at: new Date().toISOString(), reviewed_by: session.user.id, admin_note: reason } : r);
      localStorage.setItem('showai_topup_requests', JSON.stringify(updated));
    } catch {}

    const cfg = this.getConfig();
    if (cfg) {
      try {
        await fetch(`${cfg.url}/rest/v1/topup_requests?id=eq.${encodeURIComponent(requestId)}`, {
          method: 'PATCH',
          headers: this.getHeaders(),
          body: JSON.stringify({
            status: 'rejected',
            reviewed_at: new Date().toISOString(),
            reviewed_by: session.user.id,
            admin_note: reason
          })
        });
      } catch {}
    }

    return { success: true };
  },

  // ---- User Top-up & Buy Credit Pack ----
  async userTopupCredits(
    packageId: string,
    amountCredits: number,
    costUsd: number,
    paymentMethod: string = 'instant_simulated',
    paymentRef?: string
  ): Promise<{ success: boolean; credits?: number; error?: string }> {
    const cfg = this.getConfig();
    const session = this.getSession();
    if (!cfg || !session?.user?.id) {
      return { success: false, error: 'Please sign in to top-up credits.' };
    }

    try {
      const profile = await this.getUserProfile(session.user.id);
      const currentCredits = profile?.credits || 0;
      const nextCredits = currentCredits + amountCredits;

      const patchRes = await fetch(`${cfg.url}/rest/v1/profiles?id=eq.${encodeURIComponent(session.user.id)}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({
          credits: nextCredits,
          updated_at: new Date().toISOString()
        })
      });
      if (!patchRes.ok) throw new Error('Could not update user credits balance');

      await fetch(`${cfg.url}/rest/v1/credit_transactions`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          user_id: session.user.id,
          amount: amountCredits,
          balance_after: nextCredits,
          type: 'topup',
          description: `Credit Pack Purchase: +${amountCredits.toLocaleString()} Credits ($${costUsd} via ${paymentMethod}${paymentRef ? ` - Ref: ${paymentRef}` : ''})`
        })
      });

      return { success: true, credits: nextCredits };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Top-up failed' };
    }
  },

  async fetchCreditTransactions(userId?: string): Promise<CreditTransaction[]> {
    const cfg = this.getConfig();
    const session = this.getSession();
    if (!cfg || !session?.user?.id) return [];

    const filter = userId ? `&user_id=eq.${encodeURIComponent(userId)}` : '';
    try {
      const res = await fetch(`${cfg.url}/rest/v1/credit_transactions?select=*${filter}&order=created_at.desc&limit=50`, {
        headers: this.getHeaders()
      });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  // ---- 6. Supabase Storage Upload (Website Base Photos & User Generations) ----
  async uploadPhotoToBucket(
    bucket: 'website-photos' | 'user-generations',
    fileOrDataUrl: File | string,
    folderPrefix = 'uploads'
  ): Promise<string | null> {
    const cfg = this.getConfig();
    if (!cfg) return null;

    const fileToDataUrl = (file: File): Promise<string> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

    try {
      let bodyBlob: Blob;
      let ext = 'png';
      let contentType = 'image/png';
      let dataUrlString: string | null = null;

      if (typeof fileOrDataUrl === 'string') {
        if (fileOrDataUrl.startsWith('http://') || fileOrDataUrl.startsWith('https://')) {
          return fileOrDataUrl; // Already a remote URL
        }
        dataUrlString = fileOrDataUrl;
        const parsed = dataUrlToBlob(fileOrDataUrl);
        if (!parsed) return fileOrDataUrl;
        bodyBlob = parsed.blob;
        ext = parsed.ext;
        contentType = parsed.mimeType;
      } else {
        bodyBlob = fileOrDataUrl;
        contentType = fileOrDataUrl.type || 'image/png';
        ext = (fileOrDataUrl.name.split('.').pop() || 'png').toLowerCase();
        dataUrlString = await fileToDataUrl(fileOrDataUrl);
      }

      const objectPath = `${folderPrefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const uploadHeaders = this.getHeaders(false, true);
      uploadHeaders['Content-Type'] = contentType;
      uploadHeaders['x-upsert'] = 'true';

      const res = await fetch(`${cfg.url}/storage/v1/object/${bucket}/${objectPath}`, {
        method: 'POST',
        headers: uploadHeaders,
        body: bodyBlob
      });

      if (res.ok) {
        return `${cfg.url}/storage/v1/object/public/${bucket}/${objectPath}`;
      }

      // Fallback to server-side SUPABASE_SECRET_KEY upload (auto-creates bucket if needed)
      if (dataUrlString) {
        const serverUpload = await fetch('/api/supabase/upload-storage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bucket,
            folderPrefix,
            dataUrl: dataUrlString,
            fileName: typeof fileOrDataUrl !== 'string' ? fileOrDataUrl.name : `image.${ext}`
          })
        });
        if (serverUpload.ok) {
          const uploadJson = await serverUpload.json();
          if (uploadJson?.publicUrl) return uploadJson.publicUrl;
        }
      }

      return dataUrlString;
    } catch {
      return typeof fileOrDataUrl === 'string' ? fileOrDataUrl : null;
    }
  },

  // ---- 7. User History & Studio Library (public.user_history) ----
  async fetchUserHistory(): Promise<CloudHistoryRecord[]> {
    const cfg = this.getConfig();
    const session = this.getSession();
    if (!cfg || !session?.user?.id) return [];

    try {
      const res = await fetch(
        `${cfg.url}/rest/v1/user_history?user_id=eq.${encodeURIComponent(session.user.id)}&select=*&order=created_at.desc&limit=100`,
        { headers: this.getHeaders() }
      );
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async saveHistoryRecord(params: {
    mode: string;
    masterPrompt: string;
    negativePrompt?: string;
    burmeseExplanation?: string;
    imageUrl?: string;
    provider?: string;
    aspectRatio?: string;
    folder?: string;
    creditsUsed?: number;
  }): Promise<CloudHistoryRecord | null> {
    const cfg = this.getConfig();
    const session = this.getSession();
    if (!cfg || !session?.user?.id) return null;

    let finalImageUrl = params.imageUrl || '';
    if (finalImageUrl && finalImageUrl.startsWith('data:image')) {
      const uploadedUrl = await this.uploadPhotoToBucket('user-generations', finalImageUrl, `users/${session.user.id}`);
      if (uploadedUrl) finalImageUrl = uploadedUrl;
    }

    try {
      const res = await fetch(`${cfg.url}/rest/v1/user_history`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          Prefer: 'return=representation'
        },
        body: JSON.stringify({
          user_id: session.user.id,
          mode: params.mode || 'txt2img',
          master_prompt: params.masterPrompt,
          negative_prompt: params.negativePrompt || '',
          burmese_explanation: params.burmeseExplanation || '',
          generated_image_url: finalImageUrl,
          provider: params.provider || 'Nano Banana 2',
          aspect_ratio: params.aspectRatio || '1:1',
          folder: params.folder || 'General',
          is_favorite: false,
          credits_used: params.creditsUsed ?? 0
        })
      });
      if (!res.ok) return null;
      const rows = await res.json();
      return rows?.[0] || null;
    } catch {
      return null;
    }
  },

  async updateHistoryRecord(id: string, updates: Partial<{ is_favorite: boolean; folder: string }>): Promise<boolean> {
    const cfg = this.getConfig();
    if (!cfg) return false;
    try {
      const res = await fetch(`${cfg.url}/rest/v1/user_history?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(updates)
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async deleteHistoryRecord(id?: string, imageUrl?: string): Promise<boolean> {
    const cfg = this.getConfig();
    if (!cfg || (!id && !imageUrl)) return false;
    try {
      const isUuid = id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      let query = '';
      if (isUuid) {
        query = `id=eq.${encodeURIComponent(id!)}`;
      } else if (imageUrl) {
        query = `generated_image_url=eq.${encodeURIComponent(imageUrl)}`;
      } else if (id) {
        query = `id=eq.${encodeURIComponent(id)}`;
      }
      const res = await fetch(`${cfg.url}/rest/v1/user_history?${query}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // ---- 8. Website Base Photos & Assets (public.website_assets) ----
  async fetchWebsiteAssets(section?: string): Promise<WebsiteAssetRecord[]> {
    const cfg = this.getConfig();
    if (!cfg) return [];
    const filter = section ? `&section=eq.${encodeURIComponent(section)}` : '';
    try {
      const res = await fetch(`${cfg.url}/rest/v1/website_assets?select=*${filter}&order=sort_order.asc,created_at.desc`, {
        headers: this.getHeaders(true, false)
      });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async saveWebsiteAsset(
    asset: Omit<WebsiteAssetRecord, 'id' | 'created_at'> & { id?: string },
    photoFileOrDataUrl?: File | string | null
  ): Promise<WebsiteAssetRecord | null> {
    const cfg = this.getConfig();
    const session = this.getSession();
    if (!cfg) return null;

    let imageUrl = asset.image_url;
    if (photoFileOrDataUrl) {
      const uploaded = await this.uploadPhotoToBucket('website-photos', photoFileOrDataUrl, asset.section);
      if (uploaded) imageUrl = uploaded;
    }

    const payload: Record<string, any> = {
      section: asset.section,
      asset_key: asset.asset_key,
      title_mm: asset.title_mm,
      title_en: asset.title_en,
      category: asset.category || 'General',
      image_url: imageUrl,
      prompt_fragment: asset.prompt_fragment || '',
      metadata: asset.metadata || {},
      is_active: asset.is_active !== false,
      sort_order: asset.sort_order || 0,
      updated_by: session?.user?.id || null,
      updated_at: new Date().toISOString()
    };

    try {
      const res = await fetch(`${cfg.url}/rest/v1/website_assets?on_conflict=asset_key`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          Prefer: 'return=representation,resolution=merge-duplicates'
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) return null;
      const rows = await res.json();
      return rows?.[0] || null;
    } catch {
      return null;
    }
  },

  async deleteWebsiteAsset(id: string): Promise<boolean> {
    const cfg = this.getConfig();
    if (!cfg) return false;
    try {
      const res = await fetch(`${cfg.url}/rest/v1/website_assets?id=eq.${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      return res.ok;
    } catch {
      return false;
    }
  }
};
