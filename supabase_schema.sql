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
-- 10. SUPABASE STORAGE BUCKETS FOR WEBSITE PHOTOS & USER GENERATIONS
-- ============================================================================
insert into storage.buckets (id, name, public)
values
  ('website-photos', 'website-photos', true),
  ('user-generations', 'user-generations', true)
on conflict (id) do nothing;

drop policy if exists "Public view website-photos" on storage.objects;
create policy "Public view website-photos"
  on storage.objects for select
  using (bucket_id in ('website-photos', 'user-generations'));

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
