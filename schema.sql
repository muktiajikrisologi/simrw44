-- ==============================================================================
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

-- Index pencarian warga
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
  kategori varchar(80) not null, -- Iuran Bulanan, Sumbangan, Keamanan, Kebersihan, Pembangunan, Kegiatan, dll
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
  periode varchar(50), -- misal 'September 2026'
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

create index if not exists idx_notulen_status on public.notulen(status);
create index if not exists idx_notulen_tanggal on public.notulen(tanggal desc);

-- ==============================================================================
-- 8. ROW LEVEL SECURITY (RLS) & HELPER FUNCTIONS
-- ==============================================================================

-- Aktifkan RLS di setiap tabel
alter table public.users enable row level security;
alter table public.warga enable row level security;
alter table public.kas_rw enable row level security;
alter table public.koperasi enable row level security;
alter table public.jimpitan_denda enable row level security;
alter table public.notulen enable row level security;

-- Function untuk mengambil role user saat ini secara aman
create or replace function public.current_user_role()
returns user_role as $$
  select role from public.users where id = auth.uid();
$$ language sql security definer stable;

-- Function untuk cek apakah warga terhubung
create or replace function public.current_user_warga_id()
returns uuid as $$
  select warga_id from public.users where id = auth.uid();
$$ language sql security definer stable;

-- --- A. POLICIES: USERS ---
-- Super Admin bisa melihat & mengelola semua user
create policy "Super admin can do anything with users"
  on public.users for all
  using (public.current_user_role() = 'super_admin');

-- User dapat melihat profil sendiri
create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = id);

-- User dapat mengupdate no_hp sendiri
create policy "Users can update own basic profile"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- --- B. POLICIES: WARGA ---
-- Semua user yang login (warga & pengurus) dapat melihat data warga
create policy "Authenticated users can view warga"
  on public.warga for select
  to authenticated
  using (true);

-- Super admin dan Sekretaris dapat menambah / edit data warga
create policy "Admin and Sekretaris can manage warga"
  on public.warga for all
  using (public.current_user_role() in ('super_admin', 'sekretaris'));

-- --- C. POLICIES: KAS RW ---
-- Transparansi: Semua warga dan pengurus yang login dapat melihat seluruh mutasi kas RW
create policy "Everyone can view kas_rw"
  on public.kas_rw for select
  to authenticated
  using (true);

-- Bendahara RW dan Super Admin dapat mengelola transaksi kas RW
create policy "Bendahara RW and Admin can manage kas_rw"
  on public.kas_rw for all
  using (public.current_user_role() in ('super_admin', 'bendahara_rw'));

-- --- D. POLICIES: KOPERASI ---
-- Bendahara Koperasi dan Super Admin memiliki akses penuh
create policy "Bendahara Koperasi and Admin can manage koperasi"
  on public.koperasi for all
  using (public.current_user_role() in ('super_admin', 'bendahara_koperasi'));

-- Sekretaris dapat melihat seluruh data koperasi untuk rekap tagihan gabungan
create policy "Sekretaris can view koperasi for combined recap"
  on public.koperasi for select
  using (public.current_user_role() = 'sekretaris');

-- Warga hanya dapat melihat data tagihan dan simpanan miliknya sendiri
create policy "Warga can view own koperasi records"
  on public.koperasi for select
  using (warga_id = public.current_user_warga_id());

-- --- E. POLICIES: JIMPITAN & DENDA RONDA ---
-- Perekap Jimpitan dan Super Admin dapat mengelola data jimpitan
create policy "Perekap and Admin can manage jimpitan_denda"
  on public.jimpitan_denda for all
  using (public.current_user_role() in ('super_admin', 'perekap_jimpitan'));

-- Sekretaris & Bendahara RW dapat melihat data jimpitan untuk rekap & setoran
create policy "Sekretaris and Bendahara RW can view jimpitan_denda"
  on public.jimpitan_denda for select
  using (public.current_user_role() in ('sekretaris', 'bendahara_rw'));

-- Warga dapat melihat catatan jimpitan dan denda ronda pribadi
create policy "Warga can view own jimpitan_denda records"
  on public.jimpitan_denda for select
  using (
    warga_id = public.current_user_warga_id() 
    or (nama_warga = (select nama from public.users where id = auth.uid()))
  );

-- --- F. POLICIES: NOTULEN & INFORMASI ---
-- Siapapun dapat membaca notulen yang berstatus 'published'
create policy "Everyone can view published notulen"
  on public.notulen for select
  to authenticated
  using (status = 'published' or public.current_user_role() in ('super_admin', 'sekretaris'));

-- Sekretaris dan Super Admin dapat membuat, mengubah, dan menghapus notulen
create policy "Sekretaris and Admin can manage notulen"
  on public.notulen for all
  using (public.current_user_role() in ('super_admin', 'sekretaris'));

-- ==============================================================================
-- 9. AUTH TRIGGER: AUTO PROFILE CREATION PADA REGISTER
-- ==============================================================================
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

-- Pasang trigger di auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==============================================================================
-- 10. SEED DATA DUMMY AWAL (OPSIONAL UNTUK PENGUJIAN)
-- ==============================================================================
insert into public.warga (id, nik, nama, no_rumah, rt, rw, blok, status_hunian, no_hp)
values 
  ('a1111111-1111-1111-1111-111111111111', '3201012304850001', 'Budi Kurniawan', 'A-12', '01', '05', 'Blok Anggrek', 'Tetap', '087811992288'),
  ('a2222222-2222-2222-2222-222222222222', '3201011508820002', 'Agus Setiawan', 'A-14', '01', '05', 'Blok Anggrek', 'Tetap', '081244556677'),
  ('a3333333-3333-3333-3333-333333333333', '3201012010890003', 'Siti Rahmawati', 'B-03', '02', '05', 'Blok Bougenville', 'Tetap', '081399887711'),
  ('a4444444-4444-4444-4444-444444444444', '3201010101900004', 'Eko Prasetyo', 'B-08', '02', '05', 'Blok Bougenville', 'Kontrak', '085712345678'),
  ('a5555555-5555-5555-5555-555555555555', '3201011112780005', 'H. Sukirno', 'C-01', '03', '05', 'Blok Cempaka', 'Tetap', '081288990011')
on conflict do nothing;

insert into public.kas_rw (tanggal, kategori, jenis, nominal, keterangan, penanggung_jawab)
values
  (current_date - interval '5 days', 'Iuran Bulanan', 'pemasukan', 7500000, 'Setoran iuran warga gabungan RT 01 - RT 04 (Periode September)', 'H. Ahmad Hidayat'),
  (current_date - interval '4 days', 'Keamanan', 'pengeluaran', 2800000, 'Honor 2 petugas satpam posko utama RW & baterai HT', 'H. Ahmad Hidayat'),
  (current_date - interval '3 days', 'Kebersihan', 'pengeluaran', 1200000, 'Operasional truk sampah dinas kebersihan', 'H. Ahmad Hidayat'),
  (current_date - interval '1 day', 'Sumbangan/Donasi', 'pemasukan', 2000000, 'Donasi hamba Allah untuk pengadaan CCTV pos kamling barat', 'H. Ahmad Hidayat')
on conflict do nothing;
