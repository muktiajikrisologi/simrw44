export const SQL_MIGRATION_SCRIPT = `-- ==============================================================================
-- SKEMA DATABASE SUPABASE / POSTGRESQL LENGKAP
-- SISTEM MANAJEMEN KEUANGAN DAN ADMINISTRASI TINGKAT RW (PWA)
-- Multi-Role (RBAC), Row Level Security (RLS), Triggers, dan Seed Data
-- ==============================================================================

-- 1. EXTENSIONS & ENUMS
create extension if not exists "uuid-ossp";

-- Buat tipe ENUM untuk Multi-Role
do $$ begin
  create type user_role as enum (
    'super_admin',
    'sekretaris',
    'bendahara_rw',
    'bendahara_koperasi',
    'perekap_jimpitan',
    'warga'
  );
exception
  when duplicate_object then null;
end $$;

-- 2. TABEL WARGA (Master Data Warga RW)
create table if not exists public.warga (
  id uuid primary key default gen_random_uuid(),
  nik varchar(20) unique,
  nama varchar(150) not null,
  no_rumah varchar(20) not null,
  rt varchar(10) not null,
  rw varchar(10) not null default '05',
  blok varchar(50),
  status_hunian varchar(30) default 'Tetap' check (status_hunian in ('Tetap', 'Kontrak', 'Kos')),
  no_hp varchar(25),
  status_aktif boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_warga_rt on public.warga(rt);
create index if not exists idx_warga_no_rumah on public.warga(no_rumah);
create index if not exists idx_warga_nama on public.warga(nama);

-- 3. TABEL USERS (Profil Pengguna Terhubung ke auth.users)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email varchar(255) not null,
  nama varchar(150) not null,
  role user_role not null default 'warga',
  no_hp varchar(25),
  warga_id uuid references public.warga(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_users_role on public.users(role);

-- 4. TABEL KAS RW (Pengelolaan Kas Utama RW oleh Bendahara RW)
create table if not exists public.kas_rw (
  id uuid primary key default gen_random_uuid(),
  tanggal date not null default current_date,
  kategori varchar(80) not null,
  jenis varchar(20) not null check (jenis in ('pemasukan', 'pengeluaran')),
  nominal numeric(15, 2) not null check (nominal > 0),
  keterangan text not null,
  penanggung_jawab varchar(120) not null,
  bukti_url text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_kas_rw_tanggal on public.kas_rw(tanggal);
create index if not exists idx_kas_rw_jenis on public.kas_rw(jenis);

-- 5. TABEL KOPERASI (Tagihan, Simpanan & Pinjaman oleh Bendahara Koperasi)
create table if not exists public.koperasi (
  id uuid primary key default gen_random_uuid(),
  warga_id uuid not null references public.warga(id) on delete cascade,
  jenis varchar(30) not null check (jenis in ('simpanan_pokok', 'simpanan_wajib', 'simpanan_sukarela', 'pinjaman', 'angsuran')),
  periode varchar(50),
  nominal numeric(15, 2) not null check (nominal >= 0),
  status varchar(20) not null default 'belum_lunas' check (status in ('lunas', 'belum_lunas', 'proses')),
  jatuh_tempo date,
  tanggal_bayar date,
  keterangan text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_koperasi_warga_id on public.koperasi(warga_id);
create index if not exists idx_koperasi_status on public.koperasi(status);

-- 6. TABEL JIMPITAN & DENDA RONDA (Oleh Perekap Jimpitan / Ronda)
create table if not exists public.jimpitan_denda (
  id uuid primary key default gen_random_uuid(),
  tanggal date not null default current_date,
  warga_id uuid references public.warga(id) on delete set null,
  nama_warga varchar(150) not null,
  no_rumah varchar(30) not null,
  rt varchar(10) not null,
  jenis varchar(30) not null check (jenis in ('jimpitan', 'denda_ronda')),
  nominal numeric(15, 2) not null default 0 check (nominal >= 0),
  status varchar(20) not null default 'lunas' check (status in ('lunas', 'terutang', 'disetor')),
  petugas_perekap varchar(120) not null,
  sumber varchar(20) not null default 'manual' check (sumber in ('manual', 'csv_import')),
  catatan text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_jimpitan_tanggal on public.jimpitan_denda(tanggal);
create index if not exists idx_jimpitan_rt on public.jimpitan_denda(rt);
create index if not exists idx_jimpitan_status on public.jimpitan_denda(status);

-- 7. TABEL NOTULEN & PENGUMUMAN (Oleh Sekretaris RW)
create table if not exists public.notulen (
  id uuid primary key default gen_random_uuid(),
  judul varchar(255) not null,
  kategori varchar(50) not null check (kategori in ('Rapat Rutin', 'Rapat Koordinasi', 'Pengumuman', 'Kerja Bakti', 'Keamanan', 'Lain-lain')),
  tanggal date not null default current_date,
  lokasi varchar(150),
  agenda text,
  isi_notulen text not null,
  kesepakatan text,
  lampiran_url text,
  status varchar(20) not null default 'published' check (status in ('draft', 'published')),
  penulis varchar(120) not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- 8. ROW LEVEL SECURITY (RLS) & HELPER FUNCTIONS
-- ==============================================================================

alter table public.users enable row level security;
alter table public.warga enable row level security;
alter table public.kas_rw enable row level security;
alter table public.koperasi enable row level security;
alter table public.jimpitan_denda enable row level security;
alter table public.notulen enable row level security;

create or replace function public.current_user_role()
returns user_role as $$
  select role from public.users where id = auth.uid();
$$ language sql security definer stable;

create or replace function public.current_user_warga_id()
returns uuid as $$
  select warga_id from public.users where id = auth.uid();
$$ language sql security definer stable;

-- Users policies
create policy "Super admin can do anything with users"
  on public.users for all using (public.current_user_role() = 'super_admin');
create policy "Users can view own profile"
  on public.users for select using (auth.uid() = id);

-- Warga policies
create policy "Authenticated users can view warga"
  on public.warga for select to authenticated using (true);
create policy "Admin and Sekretaris can manage warga"
  on public.warga for all using (public.current_user_role() in ('super_admin', 'sekretaris'));

-- Kas RW policies
create policy "Everyone can view kas_rw"
  on public.kas_rw for select to authenticated using (true);
create policy "Bendahara RW and Admin can manage kas_rw"
  on public.kas_rw for all using (public.current_user_role() in ('super_admin', 'bendahara_rw'));

-- Koperasi policies
create policy "Bendahara Koperasi and Admin can manage koperasi"
  on public.koperasi for all using (public.current_user_role() in ('super_admin', 'bendahara_koperasi'));
create policy "Sekretaris can view koperasi for combined recap"
  on public.koperasi for select using (public.current_user_role() = 'sekretaris');
create policy "Warga can view own koperasi records"
  on public.koperasi for select using (warga_id = public.current_user_warga_id());

-- Jimpitan Denda policies
create policy "Perekap and Admin can manage jimpitan_denda"
  on public.jimpitan_denda for all using (public.current_user_role() in ('super_admin', 'perekap_jimpitan'));
create policy "Sekretaris and Bendahara RW can view jimpitan_denda"
  on public.jimpitan_denda for select using (public.current_user_role() in ('sekretaris', 'bendahara_rw'));
create policy "Warga can view own jimpitan_denda records"
  on public.jimpitan_denda for select using (warga_id = public.current_user_warga_id() or (nama_warga = (select nama from public.users where id = auth.uid())));

-- Notulen policies
create policy "Everyone can view published notulen"
  on public.notulen for select to authenticated using (status = 'published' or public.current_user_role() in ('super_admin', 'sekretaris'));
create policy "Sekretaris and Admin can manage notulen"
  on public.notulen for all using (public.current_user_role() in ('super_admin', 'sekretaris'));

-- Auth Trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, nama, role, no_hp)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nama', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'warga'::user_role),
    new.raw_user_meta_data->>'no_hp'
  )
  on conflict (id) do update set
    email = excluded.email,
    nama = coalesce(excluded.nama, public.users.nama),
    updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
`;
