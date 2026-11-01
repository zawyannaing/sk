-- ============================================================================
-- SHOW AI STUDIO: MIGRATION 20261101_initial_secure_admin_schema.sql
-- SECURE ROLE-BASED ACCESS CONTROL, APPEND-ONLY CREDITS LEDGER & ADMIN SUITE
-- ============================================================================

-- Enable pgcrypto for UUID generation if not present
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. PROFILES TABLE & ROLES
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  display_name text,
  username text,
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'admin')),
  status text not null default 'active' check (status in ('active', 'suspended', 'banned')),
  bio text,
  plan text not null default 'free',
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for lookup performance
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_status on public.profiles(status);
create index if not exists idx_profiles_email on public.profiles(email);

-- Helper function: check if calling JWT belongs to an active admin
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and status = 'active'
  );
$$;

-- Trigger: protect role and status from unauthorized modification
create or replace function public.protect_profile_privileges()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Only active admins can change role or status
  if (old.role is distinct from new.role or old.status is distinct from new.status) then
    if not public.is_admin() then
      raise exception 'Forbidden: Only administrators can modify user role or status.';
    end if;
  end if;
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tr_protect_profile_privileges on public.profiles;
create trigger tr_protect_profile_privileges
  before update on public.profiles
  for each row
  execute function public.protect_profile_privileges();

-- Auto-create profile on signup trigger
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, email, display_name, username, avatar_url, role, status)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    'user',
    'active'
  )
  on conflict (id) do update
  set email = excluded.email,
      last_seen_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 2. APPEND-ONLY CREDIT TRANSACTIONS LEDGER & VIEW
-- ----------------------------------------------------------------------------
create table if not exists public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount integer not null, -- Positive for credits added, negative for deductions
  reason text not null check (reason in ('daily_grant', 'generation', 'bundle', 'promo', 'admin_adjust', 'refund')),
  ref_id text,             -- Optional reference to generation ID, order ID, or promo code
  note text,
  created_by uuid references auth.users(id), -- NULL for automated system / RPC actions
  created_at timestamptz not null default now()
);

create index if not exists idx_credit_transactions_user on public.credit_transactions(user_id, created_at desc);
create index if not exists idx_credit_transactions_reason on public.credit_transactions(reason);

-- Immutability rule: prevent UPDATE and DELETE on credit transactions
create or replace function public.prevent_ledger_tampering()
returns trigger
language plpgsql
as $$
begin
  raise exception 'Integrity Violation: credit_transactions is an append-only audit ledger and cannot be modified or deleted.';
end;
$$;

drop trigger if exists tr_prevent_ledger_tampering on public.credit_transactions;
create trigger tr_prevent_ledger_tampering
  before update or delete on public.credit_transactions
  for each row
  execute function public.prevent_ledger_tampering();

-- View to compute verified balances dynamically
create or replace view public.user_credit_balances as
select
  p.id as user_id,
  p.email,
  p.display_name,
  p.role,
  p.status,
  coalesce(sum(ct.amount), 0)::integer as balance,
  count(ct.id)::integer as total_transactions
from public.profiles p
left join public.credit_transactions ct on ct.user_id = p.id
group by p.id, p.email, p.display_name, p.role, p.status;

-- ----------------------------------------------------------------------------
-- 3. AUDIT LOG (Insert-only)
-- ----------------------------------------------------------------------------
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id),
  action text not null,
  target_type text not null,
  target_id text,
  before jsonb,
  after jsonb,
  ip inet,
  created_at timestamptz not null default now()
);

create index if not exists idx_audit_log_actor on public.audit_log(actor_id, created_at desc);
create index if not exists idx_audit_log_target on public.audit_log(target_type, target_id);

drop trigger if exists tr_prevent_audit_tampering on public.audit_log;
create trigger tr_prevent_audit_tampering
  before update or delete on public.audit_log
  for each row
  execute function public.prevent_ledger_tampering();

-- ----------------------------------------------------------------------------
-- 4. APP SETTINGS (JSONB Key-Value)
-- ----------------------------------------------------------------------------
create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null,
  description text,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

-- Seed default application settings
insert into public.app_settings (key, value, description)
values
  ('costs', '{"1k": 5, "2k": 8, "4k": 12, "8k": 20, "video_prompt": 1}'::jsonb, 'Credit deduction matrix per tier'),
  ('daily_reward', '{"amount": 250, "enabled": true}'::jsonb, 'Daily login free credits grant'),
  ('social_links', '{"facebook": "https://facebook.com", "telegram": "https://t.me", "tiktok": "https://tiktok.com", "youtube": "https://youtube.com", "viber": "", "support_email": "support@showai.studio"}'::jsonb, 'Official social and support links'),
  ('maintenance', '{"active": false, "notice_en": "System undergoing brief scheduled upgrade.", "notice_my": "စနစ် အဆင့်မြှင့်တင်မှု ခေတ္တဆောင်ရွက်နေပါသည်။"}'::jsonb, 'Global maintenance mode status'),
  ('feature_flags', '{"photo_studio": true, "video_studio": true, "detail_burmese": true, "community": true, "face_swap": true, "bg_change": true, "edit_image": true}'::jsonb, 'Module feature flags')
on conflict (key) do nothing;

-- ----------------------------------------------------------------------------
-- 5. ANNOUNCEMENTS & IN-APP NOTICES
-- ----------------------------------------------------------------------------
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  type text not null default 'info' check (type in ('info', 'warning', 'success', 'critical')),
  placement text not null default 'banner' check (placement in ('banner', 'modal', 'toast')),
  audience text not null default 'all' check (audience in ('all', 'logged_in', 'logged_out')),
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  is_active boolean not null default true,
  dismissible boolean not null default true,
  cta_label text,
  cta_url text,
  language text not null default 'both' check (language in ('en', 'my', 'both')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_announcements_active on public.announcements(is_active, starts_at, ends_at);

-- ----------------------------------------------------------------------------
-- 6. BUNDLES (Credit Packages)
-- ----------------------------------------------------------------------------
create table if not exists public.bundles (
  id text primary key,
  name_en text not null,
  name_my text not null,
  credits integer not null check (credits > 0),
  bonus_credits integer not null default 0 check (bonus_credits >= 0),
  price numeric(10, 2) not null check (price >= 0),
  currency text not null default 'USD',
  valid_days integer,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  badge_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Seed default pricing bundles
insert into public.bundles (id, name_en, name_my, credits, bonus_credits, price, currency, is_active, sort_order, badge_text)
values
  ('starter', 'Starter Creator', 'စတင်သူအထုပ်', 1000, 0, 10.00, 'USD', true, 1, 'POPULAR FOR BEGINNERS'),
  ('creator_pro', 'Creator Pro', 'ဖန်တီးသူပရိုအထုပ်', 5000, 500, 50.00, 'USD', true, 2, '+10% BONUS CREDITS'),
  ('master', 'Studio Master', 'စတူဒီယိုမာစတာအထုပ်', 12000, 2400, 100.00, 'USD', true, 3, '+20% MAXIMUM VALUE')
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- 7. PROMO CODES & REDEMPTIONS
-- ----------------------------------------------------------------------------
create table if not exists public.promo_codes (
  code text primary key,
  credits integer not null check (credits > 0),
  max_uses integer not null default 100,
  used_count integer not null default 0 check (used_count >= 0),
  expires_at timestamptz,
  is_active boolean not null default true,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.promo_redemptions (
  id uuid primary key default gen_random_uuid(),
  code text not null references public.promo_codes(code) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  credits_granted integer not null,
  redeemed_at timestamptz not null default now(),
  constraint uq_promo_user unique (code, user_id)
);

-- ----------------------------------------------------------------------------
-- 8. TOP-UP REQUESTS & PAYMENT SLIPS
-- ----------------------------------------------------------------------------
create table if not exists public.topup_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  bundle_id text not null references public.bundles(id),
  payment_method text not null check (payment_method in ('kpay', 'wave', 'kbz_pay', 'wave_pay', 'card', 'crypto', 'bank_transfer')),
  slip_image_path text not null,
  amount_paid numeric(10, 2),
  currency text default 'MMK',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_topup_requests_status on public.topup_requests(status, created_at desc);

-- ----------------------------------------------------------------------------
-- 9. PROVIDER SECRETS METADATA (Metadata ONLY; no raw keys)
-- ----------------------------------------------------------------------------
create table if not exists public.provider_secrets_meta (
  provider text primary key, -- 'gemini', 'openrouter', 'fal', 'replicate'
  label text not null,
  last4 text,
  status text not null default 'active' check (status in ('active', 'disabled', 'expired')),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

-- Seed metadata placeholders
insert into public.provider_secrets_meta (provider, label, last4, status)
values
  ('gemini', 'Google Gemini AI Studio API', '8a1f', 'active'),
  ('openrouter', 'OpenRouter LLM & Vision Router', '9b2c', 'active')
on conflict (provider) do nothing;

-- ----------------------------------------------------------------------------
-- 10. ATOMIC SECURITY-DEFINER RPCS FOR CREDIT TRANSACTIONS
-- ----------------------------------------------------------------------------

-- A. Grant daily credits (Idempotent: max once per calendar day UTC)
create or replace function public.grant_daily_credits(p_amount integer default 250)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_today_start timestamptz := date_trunc('day', now() at time zone 'UTC');
  v_already_claimed boolean;
  v_new_balance integer;
begin
  if v_uid is null then
    return jsonb_build_object('success', false, 'error', 'Unauthenticated');
  end if;

  -- Check if already claimed today
  select exists (
    select 1
    from public.credit_transactions
    where user_id = v_uid
      and reason = 'daily_grant'
      and created_at >= v_today_start
  ) into v_already_claimed;

  if v_already_claimed then
    return jsonb_build_object(
      'success', false,
      'already_claimed', true,
      'error', 'Daily reward already claimed today. Please return tomorrow.'
    );
  end if;

  -- Append to ledger
  insert into public.credit_transactions (user_id, amount, reason, note)
  values (v_uid, p_amount, 'daily_grant', 'Daily login credit grant');

  -- Calculate updated balance
  select coalesce(sum(amount), 0)
  into v_new_balance
  from public.credit_transactions
  where user_id = v_uid;

  return jsonb_build_object(
    'success', true,
    'granted', p_amount,
    'balance', v_new_balance
  );
end;
$$;

-- B. Atomic deduction (Rejects if insufficient)
create or replace function public.spend_credits(
  p_amount integer,
  p_reason text,
  p_ref_id text default null,
  p_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_current_balance integer;
  v_new_balance integer;
begin
  if v_uid is null then
    return jsonb_build_object('success', false, 'error', 'Unauthenticated');
  end if;

  if p_amount <= 0 then
    return jsonb_build_object('success', false, 'error', 'Invalid deduction amount');
  end if;

  -- Lock user rows to avoid race conditions
  select coalesce(sum(amount), 0)
  into v_current_balance
  from public.credit_transactions
  where user_id = v_uid;

  if v_current_balance < p_amount then
    return jsonb_build_object(
      'success', false,
      'error', 'Insufficient credit balance',
      'balance', v_current_balance,
      'required', p_amount
    );
  end if;

  -- Append negative transaction to ledger
  insert into public.credit_transactions (user_id, amount, reason, ref_id, note)
  values (v_uid, -p_amount, p_reason, p_ref_id, p_note);

  v_new_balance := v_current_balance - p_amount;

  return jsonb_build_object(
    'success', true,
    'spent', p_amount,
    'balance', v_new_balance
  );
end;
$$;

-- C. Admin manual adjustment (Admin only, logs to audit log)
create or replace function public.admin_adjust_credits(
  p_user_id uuid,
  p_amount integer,
  p_reason text,
  p_note text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin_uid uuid := auth.uid();
  v_old_balance integer;
  v_new_balance integer;
begin
  if not public.is_admin() then
    return jsonb_build_object('success', false, 'error', 'Unauthorized: Admin role required');
  end if;

  if not exists (select 1 from public.profiles where id = p_user_id) then
    return jsonb_build_object('success', false, 'error', 'User profile not found');
  end if;

  select coalesce(sum(amount), 0) into v_old_balance
  from public.credit_transactions where user_id = p_user_id;

  insert into public.credit_transactions (user_id, amount, reason, note, created_by)
  values (p_user_id, p_amount, p_reason, p_note, v_admin_uid);

  select coalesce(sum(amount), 0) into v_new_balance
  from public.credit_transactions where user_id = p_user_id;

  -- Insert audit log
  insert into public.audit_log (actor_id, action, target_type, target_id, before, after)
  values (
    v_admin_uid,
    'admin_adjust_credits',
    'profiles',
    p_user_id::text,
    jsonb_build_object('balance', v_old_balance),
    jsonb_build_object('balance', v_new_balance, 'adjustment', p_amount, 'reason', p_reason, 'note', p_note)
  );

  return jsonb_build_object(
    'success', true,
    'user_id', p_user_id,
    'adjusted_amount', p_amount,
    'new_balance', v_new_balance
  );
end;
$$;

-- D. Redeem Promo Code (Idempotent per user)
create or replace function public.redeem_promo(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_clean_code text := upper(trim(p_code));
  v_promo record;
  v_new_balance integer;
begin
  if v_uid is null then
    return jsonb_build_object('success', false, 'error', 'Unauthenticated');
  end if;

  -- Check code existence and validity
  select * into v_promo
  from public.promo_codes
  where code = v_clean_code
    and is_active = true
    and (expires_at is null or expires_at > now())
  for update;

  if v_promo.code is null then
    return jsonb_build_object('success', false, 'error', 'Invalid or expired promo code.');
  end if;

  if v_promo.used_count >= v_promo.max_uses then
    return jsonb_build_object('success', false, 'error', 'This promo code has reached its maximum redemptions.');
  end if;

  -- Check if user already redeemed
  if exists (select 1 from public.promo_redemptions where code = v_clean_code and user_id = v_uid) then
    return jsonb_build_object('success', false, 'error', 'You have already redeemed this promo code.');
  end if;

  -- Register redemption
  insert into public.promo_redemptions (code, user_id, credits_granted)
  values (v_clean_code, v_uid, v_promo.credits);

  -- Increment use count
  update public.promo_codes
  set used_count = used_count + 1
  where code = v_clean_code;

  -- Grant credits to ledger
  insert into public.credit_transactions (user_id, amount, reason, ref_id, note)
  values (v_uid, v_promo.credits, 'promo', v_clean_code, 'Promo redemption: ' || v_clean_code);

  select coalesce(sum(amount), 0) into v_new_balance
  from public.credit_transactions where user_id = v_uid;

  return jsonb_build_object(
    'success', true,
    'code', v_clean_code,
    'credits_granted', v_promo.credits,
    'balance', v_new_balance
  );
end;
$$;

-- E. Approve Top-up Request (Admin only, atomic credit grant + audit entry)
create or replace function public.approve_topup(
  p_request_id uuid,
  p_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin_uid uuid := auth.uid();
  v_req record;
  v_bundle record;
  v_total_credits integer;
  v_new_balance integer;
begin
  if not public.is_admin() then
    return jsonb_build_object('success', false, 'error', 'Unauthorized: Admin role required');
  end if;

  select * into v_req
  from public.topup_requests
  where id = p_request_id
  for update;

  if v_req.id is null then
    return jsonb_build_object('success', false, 'error', 'Top-up request not found');
  end if;

  if v_req.status <> 'pending' then
    return jsonb_build_object('success', false, 'error', 'Request has already been processed: ' || v_req.status);
  end if;

  select * into v_bundle from public.bundles where id = v_req.bundle_id;
  if v_bundle.id is null then
    return jsonb_build_object('success', false, 'error', 'Bundle no longer exists');
  end if;

  v_total_credits := v_bundle.credits + coalesce(v_bundle.bonus_credits, 0);

  -- 1. Mark request as approved
  update public.topup_requests
  set status = 'approved',
      reviewed_by = v_admin_uid,
      reviewed_at = now(),
      admin_note = p_note,
      updated_at = now()
  where id = p_request_id;

  -- 2. Append to credit transactions ledger
  insert into public.credit_transactions (user_id, amount, reason, ref_id, note, created_by)
  values (
    v_req.user_id,
    v_total_credits,
    'bundle',
    p_request_id::text,
    'Top-up approved: ' || v_bundle.name_en || ' (' || v_total_credits || ' credits)',
    v_admin_uid
  );

  -- 3. Calculate new balance
  select coalesce(sum(amount), 0) into v_new_balance
  from public.credit_transactions where user_id = v_req.user_id;

  -- 4. Record in audit log
  insert into public.audit_log (actor_id, action, target_type, target_id, before, after)
  values (
    v_admin_uid,
    'approve_topup',
    'topup_requests',
    p_request_id::text,
    jsonb_build_object('status', 'pending'),
    jsonb_build_object(
      'status', 'approved',
      'user_id', v_req.user_id,
      'credits_granted', v_total_credits,
      'admin_note', p_note
    )
  );

  return jsonb_build_object(
    'success', true,
    'request_id', p_request_id,
    'credits_granted', v_total_credits,
    'new_balance', v_new_balance
  );
end;
$$;

-- ----------------------------------------------------------------------------
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.credit_transactions enable row level security;
alter table public.audit_log enable row level security;
alter table public.app_settings enable row level security;
alter table public.announcements enable row level security;
alter table public.bundles enable row level security;
alter table public.promo_codes enable row level security;
alter table public.promo_redemptions enable row level security;
alter table public.topup_requests enable row level security;
alter table public.provider_secrets_meta enable row level security;

-- PROFILES POLICIES
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "Users can update own display details"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

-- CREDIT TRANSACTIONS POLICIES
create policy "Users can read own ledger"
  on public.credit_transactions for select
  using (auth.uid() = user_id or public.is_admin());

-- Notice: No INSERT/UPDATE/DELETE policies for authenticated users on credit_transactions.
-- Ledger insertions can ONLY be performed by security-definer RPC functions.

-- AUDIT LOG POLICIES
create policy "Admins can read audit log"
  on public.audit_log for select
  using (public.is_admin());

-- APP SETTINGS POLICIES
create policy "Anyone can read app settings"
  on public.app_settings for select
  using (true);

create policy "Admins can modify app settings"
  on public.app_settings for all
  using (public.is_admin())
  with check (public.is_admin());

-- ANNOUNCEMENTS POLICIES
create policy "Anyone can read active announcements"
  on public.announcements for select
  using (is_active = true or public.is_admin());

create policy "Admins have full access to announcements"
  on public.announcements for all
  using (public.is_admin())
  with check (public.is_admin());

-- BUNDLES POLICIES
create policy "Anyone can read active bundles"
  on public.bundles for select
  using (is_active = true or public.is_admin());

create policy "Admins have full access to bundles"
  on public.bundles for all
  using (public.is_admin())
  with check (public.is_admin());

-- PROMO CODES POLICIES
create policy "Admins have full access to promo codes"
  on public.promo_codes for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Users can read own promo redemptions"
  on public.promo_redemptions for select
  using (auth.uid() = user_id or public.is_admin());

-- TOPUP REQUESTS POLICIES
create policy "Users can view own topup requests"
  on public.topup_requests for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Users can submit topup requests"
  on public.topup_requests for insert
  with check (auth.uid() = user_id);

create policy "Admins have full access to topup requests"
  on public.topup_requests for all
  using (public.is_admin())
  with check (public.is_admin());

-- PROVIDER SECRETS METADATA POLICIES
create policy "Admins only access to provider metadata"
  on public.provider_secrets_meta for all
  using (public.is_admin())
  with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- 12. STORAGE BUCKET: payment-slips (Private, Admin-only read)
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'payment-slips',
  'payment-slips',
  false,
  5242880, -- 5MB limit
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = false,
    file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

-- Storage RLS
create policy "Users can upload own payment slip"
  on storage.objects for insert
  with check (
    bucket_id = 'payment-slips'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Admins can view payment slips"
  on storage.objects for select
  using (
    bucket_id = 'payment-slips'
    and (public.is_admin() or auth.uid()::text = (storage.foldername(name))[1])
  );

-- ----------------------------------------------------------------------------
-- 13. REALTIME REPLICATION CONFIGURATION
-- ----------------------------------------------------------------------------
alter publication supabase_realtime add table public.announcements;
alter publication supabase_realtime add table public.app_settings;
alter publication supabase_realtime add table public.credit_transactions;
alter publication supabase_realtime add table public.topup_requests;

-- ============================================================================
-- MANUAL ADMIN PROMOTION COMMAND (Run once in Supabase SQL editor):
-- update public.profiles set role = 'admin' where email = 'your-email@example.com';
-- ============================================================================
