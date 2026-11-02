-- ============================================================================
-- AI STUDIO MASTER MYANMAR - COMPLETE SUPABASE SCHEMA & STORAGE SETUP
-- Run this entire script in your Supabase Dashboard -> SQL Editor -> New Query
-- ============================================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ============================================================================
-- 1. USER PROFILES & BALANCE TABLE (Linked to Supabase Auth)
-- ============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null default 'Studio Creator',
  avatar_url text default '',
  bio text default 'AI Photo Studio Creator',
  role text not null default 'user' check (role in ('user', 'admin')),
  credits integer not null default 250 check (credits >= 0),
  total_prompts_generated integer not null default 0,
  total_images_generated integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- 2. CREDIT TRANSACTIONS LEDGER (Balance Top-ups & Generation Deductions)
-- ============================================================================
create table if not exists public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount integer not null, -- Positive (+) for top-up/bonus, Negative (-) for usage
  balance_after integer not null,
  type text not null check (type in ('signup_bonus', 'admin_topup', 'photo_generation', 'video_generation', 'prompt_generation', 'refund')),
  description text not null,
  admin_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_credit_tx_user on public.credit_transactions(user_id, created_at desc);

-- ============================================================================
-- 3. USER PROMPT & PHOTO GENERATION HISTORY (Includes Studio Library & Folders)
-- ============================================================================
create table if not exists public.user_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  mode text not null default 'txt2img',
  master_prompt text not null,
  negative_prompt text default '',
  burmese_explanation text default '',
  generated_image_url text default '',
  provider text default 'Nano Banana 2',
  aspect_ratio text default '1:1',
  folder text not null default 'General',
  is_favorite boolean not null default false,
  credits_used integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_user_history_user on public.user_history(user_id, created_at desc);
create index if not exists idx_user_history_folder on public.user_history(user_id, folder);

-- ============================================================================
-- 4. USER CUSTOM FOLDERS & SAVED PROMPT NOTES
-- ============================================================================
create table if not exists public.user_library_folders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  folder_name text not null,
  created_at timestamptz not null default now(),
  unique(user_id, folder_name)
);

create table if not exists public.user_saved_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  category text not null default 'Heritage & Wedding',
  mode text not null default 'txt2img',
  master_prompt text not null,
  negative_prompt text default '',
  notes text default '',
  image_url text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_user_entries_user on public.user_saved_entries(user_id, created_at desc);

-- ============================================================================
-- 5. WEBSITE BASE PHOTOS & ASSETS (Garments, Jewelry, Archetypes, Presets)
-- ============================================================================
create table if not exists public.website_assets (
  id uuid primary key default gen_random_uuid(),
  section text not null check (section in ('garment', 'jewelry_prop', 'archetype', 'preset_template', 'category', 'banner')),
  asset_key text unique not null,
  title_mm text not null,
  title_en text not null,
  category text not null default 'General',
  image_url text not null default '',
  prompt_fragment text default '',
  metadata jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_website_assets_section on public.website_assets(section, is_active, sort_order);

-- ============================================================================
-- 6. GLOBAL WEBSITE SETTINGS & CREDIT PRICING
-- ============================================================================
create table if not exists public.app_settings (
  id integer primary key default 1 check (id = 1),
  site_name text not null default 'AI Studio Master Myanmar',
  system_notice_mm text not null default 'ကြိုဆိုပါသည်! စနစ်ကို အဆင်ပြေချောမွေ့စွာ အသုံးပြုနိုင်ပါသည်။',
  system_notice_en text not null default 'Welcome! The system is operating normally with all AI models available.',
  is_maintenance_mode boolean not null default false,
  default_engine text not null default 'nano-banana-2',
  max_daily_prompts integer not null default 100,
  photo_credit_cost integer not null default 5,
  prompt_credit_cost integer not null default 1,
  signup_bonus_credits integer not null default 250,
  updated_at timestamptz not null default now()
);

insert into public.app_settings (id) values (1) on conflict (id) do nothing;

-- ============================================================================
-- 7. AUTOMATIC PROFILE CREATION TRIGGER ON SIGNUP
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_bonus integer := 250;
  v_role text := 'user';
  v_user_count integer := 0;
  v_name text;
begin
  select coalesce(signup_bonus_credits, 250) into v_bonus from public.app_settings where id = 1;
  select count(*) into v_user_count from public.profiles;

  -- First registered user or admin email automatically becomes Admin with 9999 credits
  if v_user_count = 0 or new.email ilike 'admin@%' then
    v_role := 'admin';
    v_bonus := 9999;
  end if;

  v_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1)
  );

  insert into public.profiles (id, email, name, avatar_url, role, credits)
  values (
    new.id,
    new.email,
    v_name,
    coalesce(new.raw_user_meta_data->>'avatar_url', ''),
    v_role,
    v_bonus
  )
  on conflict (id) do nothing;

  insert into public.credit_transactions (user_id, amount, balance_after, type, description)
  values (
    new.id,
    v_bonus,
    v_bonus,
    'signup_bonus',
    'Welcome signup bonus credits'
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================================
-- 8. ATOMIC CREDIT DEDUCTION & ADMIN TOP-UP RPC FUNCTIONS
-- ============================================================================
create or replace function public.deduct_user_credits(
  p_cost integer,
  p_type text default 'photo_generation',
  p_description text default 'AI Studio generation'
)
returns jsonb
language plpgsql
security definer set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_current integer;
  v_new integer;
begin
  if v_uid is null then
    raise exception 'Authentication required';
  end if;

  select credits into v_current from public.profiles where id = v_uid for update;
  if v_current is null then
    raise exception 'User profile not found';
  end if;

  if v_current < p_cost then
    return jsonb_build_object(
      'success', false,
      'error', 'Insufficient credit balance',
      'credits', v_current
    );
  end if;

  v_new := v_current - p_cost;

  update public.profiles
  set
    credits = v_new,
    total_images_generated = case when p_type = 'photo_generation' then total_images_generated + 1 else total_images_generated end,
    total_prompts_generated = total_prompts_generated + 1,
    updated_at = now()
  where id = v_uid;

  insert into public.credit_transactions (user_id, amount, balance_after, type, description)
  values (v_uid, -p_cost, v_new, p_type, p_description);

  return jsonb_build_object(
    'success', true,
    'credits', v_new,
    'deducted', p_cost
  );
end;
$$;

create or replace function public.admin_adjust_user_credits(
  p_target_user_id uuid,
  p_amount integer,
  p_description text default 'Admin credit adjustment'
)
returns jsonb
language plpgsql
security definer set search_path = public
as $$
declare
  v_caller uuid := auth.uid();
  v_caller_role text;
  v_current integer;
  v_new integer;
begin
  select role into v_caller_role from public.profiles where id = v_caller;
  if v_caller_role is distinct from 'admin' then
    raise exception 'Only administrators can adjust user credits';
  end if;

  select credits into v_current from public.profiles where id = p_target_user_id for update;
  if v_current is null then
    raise exception 'Target user not found';
  end if;

  v_new := greatest(0, v_current + p_amount);

  update public.profiles
  set credits = v_new, updated_at = now()
  where id = p_target_user_id;

  insert into public.credit_transactions (user_id, amount, balance_after, type, description, admin_id)
  values (p_target_user_id, p_amount, v_new, 'admin_topup', p_description, v_caller);

  return jsonb_build_object(
    'success', true,
    'user_id', p_target_user_id,
    'credits', v_new
  );
end;
$$;

-- ============================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.credit_transactions enable row level security;
alter table public.user_history enable row level security;
alter table public.user_library_folders enable row level security;
alter table public.user_saved_entries enable row level security;
alter table public.website_assets enable row level security;
alter table public.app_settings enable row level security;

-- Helper to check if current user is admin
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- Profiles policies
drop policy if exists "Users can view own profile or admins view all" on public.profiles;
create policy "Users can view own profile or admins view all"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

drop policy if exists "Users can update own profile or admins update all" on public.profiles;
create policy "Users can update own profile or admins update all"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin());

-- Credit transactions policies
drop policy if exists "Users view own transactions or admins view all" on public.credit_transactions;
create policy "Users view own transactions or admins view all"
  on public.credit_transactions for select
  using (auth.uid() = user_id or public.is_admin());

-- User history policies
drop policy if exists "Users manage own history" on public.user_history;
create policy "Users manage own history"
  on public.user_history for all
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

-- User folders policies
drop policy if exists "Users manage own library folders" on public.user_library_folders;
create policy "Users manage own library folders"
  on public.user_library_folders for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- User saved entries policies
drop policy if exists "Users manage own saved entries" on public.user_saved_entries;
create policy "Users manage own saved entries"
  on public.user_saved_entries for all
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

-- Website base assets policies (Everyone can read active assets, Admins can insert/update/delete)
drop policy if exists "Anyone can view website assets" on public.website_assets;
create policy "Anyone can view website assets"
  on public.website_assets for select
  using (true);

drop policy if exists "Admins manage website assets" on public.website_assets;
create policy "Admins manage website assets"
  on public.website_assets for all
  using (public.is_admin())
  with check (public.is_admin());

-- App settings policies
drop policy if exists "Anyone can read app settings" on public.app_settings;
create policy "Anyone can read app settings"
  on public.app_settings for select
  using (true);

drop policy if exists "Admins can update app settings" on public.app_settings;
create policy "Admins can update app settings"
  on public.app_settings for update
  using (public.is_admin());

-- ============================================================================
-- 10. ANNOUNCEMENTS & IN-APP NOTICES
-- ============================================================================
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

alter table public.announcements enable row level security;

drop policy if exists "Anyone can read active announcements" on public.announcements;
create policy "Anyone can read active announcements"
  on public.announcements for select
  using (is_active = true or public.is_admin());

drop policy if exists "Admins have full access to announcements" on public.announcements;
create policy "Admins have full access to announcements"
  on public.announcements for all
  using (public.is_admin())
  with check (public.is_admin());

-- Reload schema cache in PostgREST
notify pgrst, 'reload schema';

-- ============================================================================
-- 11. BUNDLES (Credit Packages & Pricing)
-- ============================================================================
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

alter table public.bundles enable row level security;

drop policy if exists "Anyone can read active bundles" on public.bundles;
create policy "Anyone can read active bundles"
  on public.bundles for select
  using (is_active = true or public.is_admin());

drop policy if exists "Admins have full access to bundles" on public.bundles;
create policy "Admins have full access to bundles"
  on public.bundles for all
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================================
-- 12. TOP-UP REQUESTS & MANUAL PAYMENT SLIPS
-- ============================================================================
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

alter table public.topup_requests enable row level security;

drop policy if exists "Users view own topup requests" on public.topup_requests;
create policy "Users view own topup requests"
  on public.topup_requests for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Users insert own topup requests" on public.topup_requests;
create policy "Users insert own topup requests"
  on public.topup_requests for insert
  with check (auth.uid() = user_id);

drop policy if exists "Admins update topup requests" on public.topup_requests;
create policy "Admins update topup requests"
  on public.topup_requests for update
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================================
-- 12b. SECURE APPROVE TOPUP RPC FUNCTION
-- ============================================================================
create or replace function public.approve_topup(
  p_request_id text,
  p_note text default 'Verified payment slip'
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_req record;
  v_credits int := 100;
  v_new_balance int;
  v_admin_id uuid;
begin
  v_admin_id := auth.uid();

  -- Find the topup request
  select * into v_req
  from public.topup_requests
  where id::text = p_request_id::text;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Topup request not found');
  end if;

  if v_req.status = 'approved' then
    return jsonb_build_object('success', false, 'error', 'Request has already been approved');
  end if;

  -- Determine credits from bundles or fallback
  begin
    select coalesce(credits + bonus_credits, credits, 100)
    into v_credits
    from public.bundles
    where id = v_req.bundle_id;
  exception when others then
    v_credits := 100;
  end;

  if v_credits is null or v_credits <= 0 then
    v_credits := 100;
  end if;

  -- Update request to approved
  update public.topup_requests
  set status = 'approved',
      admin_note = p_note,
      reviewed_by = v_admin_id,
      reviewed_at = now(),
      updated_at = now()
  where id::text = p_request_id::text;

  -- Update user credits in profiles
  update public.profiles
  set credits = coalesce(credits, 0) + v_credits,
      updated_at = now()
  where id = v_req.user_id
  returning credits into v_new_balance;

  -- Log transaction in credit_transactions
  insert into public.credit_transactions (
    user_id,
    amount,
    balance_after,
    type,
    description,
    admin_id
  ) values (
    v_req.user_id,
    v_credits,
    coalesce(v_new_balance, v_credits),
    'admin_topup',
    coalesce(p_note, 'Top-up approved by admin'),
    v_admin_id
  );

  return jsonb_build_object(
    'success', true,
    'credits_granted', v_credits,
    'new_balance', v_new_balance
  );
end;
$$;

grant execute on function public.approve_topup(text, text) to authenticated;
grant execute on function public.approve_topup(text, text) to anon;

-- ============================================================================
-- 13. PROMO CODES & REDEMPTIONS
-- ============================================================================
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

alter table public.promo_codes enable row level security;
alter table public.promo_redemptions enable row level security;

drop policy if exists "Anyone can read active promo codes" on public.promo_codes;
create policy "Anyone can read active promo codes"
  on public.promo_codes for select
  using (is_active = true or public.is_admin());

drop policy if exists "Admins manage promo codes" on public.promo_codes;
create policy "Admins manage promo codes"
  on public.promo_codes for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Users read own redemptions" on public.promo_redemptions;
create policy "Users read own redemptions"
  on public.promo_redemptions for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Users redeem promo code" on public.promo_redemptions;
create policy "Users redeem promo code"
  on public.promo_redemptions for insert
  with check (auth.uid() = user_id);

-- Reload schema cache in PostgREST
notify pgrst, 'reload schema';

-- ============================================================================
-- 14. SUPABASE STORAGE BUCKETS FOR WEBSITE PHOTOS & USER GENERATIONS
-- ============================================================================
insert into storage.buckets (id, name, public)
values
  ('website-photos', 'website-photos', true),
  ('user-generations', 'user-generations', true),
  ('payment-slips', 'payment-slips', true)
on conflict (id) do nothing;

drop policy if exists "Public view website-photos" on storage.objects;
create policy "Public view website-photos"
  on storage.objects for select
  using (bucket_id in ('website-photos', 'user-generations', 'payment-slips'));

drop policy if exists "Authenticated users upload payment-slips" on storage.objects;
create policy "Authenticated users upload payment-slips"
  on storage.objects for insert
  with check (bucket_id in ('user-generations', 'payment-slips'));

drop policy if exists "Authenticated users upload to user-generations" on storage.objects;
create policy "Authenticated users upload to user-generations"
  on storage.objects for insert
  with check (bucket_id = 'user-generations' and auth.role() = 'authenticated');

drop policy if exists "Users delete own user-generations" on storage.objects;
create policy "Users delete own user-generations"
  on storage.objects for delete
  using (bucket_id = 'user-generations' and auth.uid() = owner);

drop policy if exists "Admins manage website-photos bucket" on storage.objects;
create policy "Admins manage website-photos bucket"
  on storage.objects for all
  using (bucket_id = 'website-photos' and public.is_admin())
  with check (bucket_id = 'website-photos' and public.is_admin());
