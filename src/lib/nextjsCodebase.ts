export interface NextjsFile {
  path: string;
  description: string;
  category: 'App Router' | 'Auth & RBAC' | 'Config & PWA';
  code: string;
}

export const NEXTJS_PROJECT_FILES: NextjsFile[] = [
  {
    path: '.env.local',
    category: 'Config & PWA',
    description: 'Konfigurasi environment variables Supabase di Next.js',
    code: `# Supabase Project URL & Anon Key
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key

# Service Role Key (Hanya untuk server-side background tasks / Admin jika diperlukan)
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
`,
  },
  {
    path: 'package.json',
    category: 'Config & PWA',
    description: 'Dependensi proyek Next.js, Tailwind CSS, dan Supabase',
    code: `{
  "name": "sim-rw-pwa",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.49.0",
    "@supabase/ssr": "^0.5.2",
    "lucide-react": "^0.475.0",
    "next": "^14.2.24",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "typescript": "^5"
  }
}
`,
  },
  {
    path: 'lib/supabaseClient.ts',
    category: 'Auth & RBAC',
    description: 'Inisialisasi Client-Side Supabase Client untuk Next.js',
    code: `import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
`,
  },
  {
    path: 'middleware.ts',
    category: 'Auth & RBAC',
    description: 'Next.js Middleware untuk RBAC otomatis sesuai role pengguna',
    code: `import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  // Lewati halaman publik
  if (path === '/login' || path === '/' || path.startsWith('/_next') || path.includes('.')) {
    return response;
  }

  // Jika belum login, redirect ke /login
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Ambil role dari tabel public.users
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  const userRole = profile?.role || 'warga';

  // Proteksi Route berdasarkan Role
  if (path.startsWith('/admin') && userRole !== 'super_admin') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }
  if (path.startsWith('/sekretaris') && !['super_admin', 'sekretaris'].includes(userRole)) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }
  if (path.startsWith('/bendahara-rw') && !['super_admin', 'bendahara_rw'].includes(userRole)) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }
  if (path.startsWith('/bendahara-koperasi') && !['super_admin', 'bendahara_koperasi'].includes(userRole)) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }
  if (path.startsWith('/perekap') && !['super_admin', 'perekap_jimpitan'].includes(userRole)) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/sekretaris/:path*', '/bendahara-rw/:path*', '/bendahara-koperasi/:path*', '/perekap/:path*', '/warga/:path*'],
};
`,
  },
  {
    path: 'app/layout.tsx',
    category: 'App Router',
    description: 'Root Layout Next.js App Router dengan meta PWA',
    code: `import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#1e3a8a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: 'Sistem Keuangan & Administrasi RW (PWA)',
  description: 'Aplikasi manajemen keuangan dan administrasi tingkat RW terintegrasi Multi-Role dan Supabase.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SimRW',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-slate-50 text-slate-900 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
`,
  },
  {
    path: 'app/manifest.ts',
    category: 'Config & PWA',
    description: 'Web App Manifest PWA untuk Next.js App Router',
    code: `import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Sistem Keuangan & Administrasi RW',
    short_name: 'SimRW',
    description: 'Aplikasi PWA Manajemen Keuangan dan Administrasi RW Terpadu',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#f8fafc',
    theme_color: '#1e3a8a',
    icons: [
      {
        src: '/pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
`,
  },
  {
    path: 'app/login/page.tsx',
    category: 'App Router',
    description: 'Halaman Login dengan redirect otomatis ke Dashboard sesuai Role',
    code: `'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient';
import { ShieldCheck, LogIn, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    // Ambil role pengguna
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', data.user.id)
      .single();

    const role = profile?.role || 'warga';

    // Arahkan ke dashboard sesuai role
    switch (role) {
      case 'super_admin':
        router.push('/admin');
        break;
      case 'sekretaris':
        router.push('/sekretaris');
        break;
      case 'bendahara_rw':
        router.push('/bendahara-rw');
        break;
      case 'bendahara_koperasi':
        router.push('/bendahara-koperasi');
        break;
      case 'perekap_jimpitan':
        router.push('/perekap');
        break;
      default:
        router.push('/warga');
        break;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-100 to-blue-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-blue-100 text-blue-900 rounded-2xl mb-3">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">SIM-RW Portal</h1>
          <p className="text-sm text-slate-500 mt-1">Sistem Keuangan & Administrasi Terpadu</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@rw05.id"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-900 hover:bg-blue-800 text-white font-medium rounded-xl shadow transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Memverifikasi...' : 'Masuk ke Sistem'}
          </button>
        </form>
      </div>
    </div>
  );
}
`,
  },
  {
    path: 'app/admin/page.tsx',
    category: 'App Router',
    description: 'Dashboard Super Admin: Manajemen User, Role, Master Warga',
    code: `'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Users, UserPlus, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function SuperAdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [newNama, setNewNama] = useState('');
  const [newRole, setNewRole] = useState('warga');
  const supabase = createClient();

  const loadUsers = async () => {
    setLoading(true);
    const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    setUsers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleUpdateRole = async (id: string, role: string) => {
    await supabase.from('users').update({ role }).eq('id', id);
    loadUsers();
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Super Admin</h1>
          <p className="text-slate-500 text-sm">Kelola pengguna sistem dan penetapan Role-Based Access Control</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-900" />
          Daftar Pengguna & Hak Akses
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-3">Nama</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role Saat Ini</th>
                <th className="p-3">Ubah Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="p-3 font-medium text-slate-900">{u.nama}</td>
                  <td className="p-3 text-slate-600">{u.email}</td>
                  <td className="p-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-900 uppercase">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                      className="border border-slate-300 rounded-lg px-2.5 py-1 text-xs focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="super_admin">Super Admin</option>
                      <option value="sekretaris">Sekretaris</option>
                      <option value="bendahara_rw">Bendahara RW</option>
                      <option value="bendahara_koperasi">Bendahara Koperasi</option>
                      <option value="perekap_jimpitan">Perekap Jimpitan</option>
                      <option value="warga">Warga</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
`,
  },
  {
    path: 'app/bendahara-rw/page.tsx',
    category: 'App Router',
    description: 'Dashboard Bendahara RW: Pengelolaan Kas Utama RW Transparan',
    code: `'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Wallet, TrendingUp, TrendingDown, PlusCircle } from 'lucide-react';

export default function BendaharaRWPage() {
  const [kasList, setKasList] = useState<any[]>([]);
  const [kategori, setKategori] = useState('Iuran Bulanan');
  const [jenis, setJenis] = useState<'pemasukan' | 'pengeluaran'>('pemasukan');
  const [nominal, setNominal] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const supabase = createClient();

  const loadKas = async () => {
    const { data } = await supabase.from('kas_rw').select('*').order('tanggal', { ascending: false });
    setKasList(data || []);
  };

  useEffect(() => {
    loadKas();
  }, []);

  const totalMasuk = kasList.filter(k => k.jenis === 'pemasukan').reduce((acc, c) => acc + Number(c.nominal), 0);
  const totalKeluar = kasList.filter(k => k.jenis === 'pengeluaran').reduce((acc, c) => acc + Number(c.nominal), 0);
  const saldo = totalMasuk - totalKeluar;

  const handleAddKas = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from('kas_rw').insert([{
      kategori,
      jenis,
      nominal: parseFloat(nominal),
      keterangan,
      penanggung_jawab: 'Bendahara RW',
    }]);
    setNominal('');
    setKeterangan('');
    loadKas();
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Bendahara RW</h1>
        <p className="text-slate-500 text-sm">Pencatatan dan transparansi kas kas umum RW</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase">Total Saldo Kas RW</div>
          <div className="text-2xl font-black text-blue-950 mt-1">Rp {saldo.toLocaleString('id-ID')}</div>
        </div>
        <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200">
          <div className="text-xs font-semibold text-emerald-700 uppercase flex items-center gap-1">
            <TrendingUp className="w-4 h-4" /> Total Pemasukan
          </div>
          <div className="text-2xl font-black text-emerald-900 mt-1">Rp {totalMasuk.toLocaleString('id-ID')}</div>
        </div>
        <div className="bg-rose-50 p-5 rounded-2xl border border-rose-200">
          <div className="text-xs font-semibold text-rose-700 uppercase flex items-center gap-1">
            <TrendingDown className="w-4 h-4" /> Total Pengeluaran
          </div>
          <div className="text-2xl font-black text-rose-900 mt-1">Rp {totalKeluar.toLocaleString('id-ID')}</div>
        </div>
      </div>

      {/* Form Input Kas */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-blue-900" />
          Catat Transaksi Kas Baru
        </h2>
        <form onSubmit={handleAddKas} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-semibold block mb-1">Jenis Transaksi</label>
            <select value={jenis} onChange={(e: any) => setJenis(e.target.value)} className="w-full border rounded-xl p-2 text-sm">
              <option value="pemasukan">Pemasukan (+)</option>
              <option value="pengeluaran">Pengeluaran (-)</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1">Kategori</label>
            <input value={kategori} onChange={(e) => setKategori(e.target.value)} className="w-full border rounded-xl p-2 text-sm" placeholder="Iuran Bulanan" required />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1">Nominal (Rp)</label>
            <input type="number" value={nominal} onChange={(e) => setNominal(e.target.value)} className="w-full border rounded-xl p-2 text-sm" placeholder="500000" required />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1">Keterangan</label>
            <input value={keterangan} onChange={(e) => setKeterangan(e.target.value)} className="w-full border rounded-xl p-2 text-sm" placeholder="Keterangan transaksi" required />
          </div>
          <div className="md:col-span-4">
            <button type="submit" className="px-6 py-2.5 bg-blue-900 text-white rounded-xl font-semibold hover:bg-blue-800 text-sm">Simpan Transaksi</button>
          </div>
        </form>
      </div>
    </div>
  );
}
`,
  },
  {
    path: 'app/perekap/page.tsx',
    category: 'App Router',
    description: 'Dashboard Perekap Jimpitan & Denda Ronda: Manual & CSV Import',
    code: `'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { UploadCloud, FileSpreadsheet, Plus, Check } from 'lucide-react';

export default function PerekapJimpitanPage() {
  const [namaWarga, setNamaWarga] = useState('');
  const [noRumah, setNoRumah] = useState('');
  const [rt, setRt] = useState('01');
  const [jenis, setJenis] = useState<'jimpitan' | 'denda_ronda'>('jimpitan');
  const [nominal, setNominal] = useState('10000');
  const [csvStatus, setCsvStatus] = useState('');
  const supabase = createClient();

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from('jimpitan_denda').insert([{
      nama_warga: namaWarga,
      no_rumah: noRumah,
      rt,
      jenis,
      nominal: parseFloat(nominal),
      status: jenis === 'jimpitan' ? 'lunas' : 'terutang',
      petugas_perekap: 'Petugas Lapangan',
      sumber: 'manual',
    }]);
    setNamaWarga('');
    setNoRumah('');
    alert('Data berhasil disimpan!');
  };

  const handleCsvImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const rows = text.split('\\n').filter(r => r.trim() !== '');
    // Header format: nama,no_rumah,rt,jenis,nominal
    const dataToInsert = [];
    for (let i = 1; i < rows.length; i++) {
      const cols = rows[i].split(',').map(c => c.trim());
      if (cols.length >= 5) {
        dataToInsert.push({
          nama_warga: cols[0],
          no_rumah: cols[1],
          rt: cols[2],
          jenis: cols[3].toLowerCase() === 'denda_ronda' ? 'denda_ronda' : 'jimpitan',
          nominal: parseFloat(cols[4]) || 0,
          status: cols[3].toLowerCase() === 'denda_ronda' ? 'terutang' : 'lunas',
          petugas_perekap: 'Impor CSV Ronda',
          sumber: 'csv_import',
        });
      }
    }

    if (dataToInsert.length > 0) {
      await supabase.from('jimpitan_denda').insert(dataToInsert);
      setCsvStatus(\`Berhasil mengimpor \${dataToInsert.length} data ronda!\`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Perekap Jimpitan & Ronda</h1>
        <p className="text-slate-500 text-sm">Entri setoran koin jimpitan dan denda ketidakhadiran ronda malam</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Manual */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-900" />
            Input Manual Petugas Ronda
          </h2>
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold block mb-1">Nama Warga</label>
              <input value={namaWarga} onChange={(e) => setNamaWarga(e.target.value)} className="w-full border rounded-xl p-2.5 text-sm" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold block mb-1">No Rumah</label>
                <input value={noRumah} onChange={(e) => setNoRumah(e.target.value)} className="w-full border rounded-xl p-2.5 text-sm" placeholder="A-12" required />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1">RT</label>
                <select value={rt} onChange={(e) => setRt(e.target.value)} className="w-full border rounded-xl p-2.5 text-sm">
                  <option value="01">RT 01</option>
                  <option value="02">RT 02</option>
                  <option value="03">RT 03</option>
                  <option value="04">RT 04</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold block mb-1">Jenis</label>
                <select value={jenis} onChange={(e: any) => setJenis(e.target.value)} className="w-full border rounded-xl p-2.5 text-sm">
                  <option value="jimpitan">Jimpitan Koin</option>
                  <option value="denda_ronda">Denda Ronda</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1">Nominal (Rp)</label>
                <input type="number" value={nominal} onChange={(e) => setNominal(e.target.value)} className="w-full border rounded-xl p-2.5 text-sm" required />
              </div>
            </div>
            <button type="submit" className="w-full py-2.5 bg-blue-900 text-white rounded-xl font-semibold hover:bg-blue-800 text-sm">
              Simpan Setoran
            </button>
          </form>
        </div>

        {/* Upload CSV */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-emerald-600" />
              Impor File CSV Ronda Lapangan
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Format CSV: <code>nama,no_rumah,rt,jenis,nominal</code> (baris pertama adalah header).
            </p>
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:bg-slate-50 transition">
              <FileSpreadsheet className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <input type="file" accept=".csv" onChange={handleCsvImport} className="text-xs text-slate-500" />
            </div>
          </div>
          {csvStatus && (
            <div className="mt-4 p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
              <Check className="w-4 h-4" /> {csvStatus}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
`,
  },
  {
    path: 'app/sekretaris/page.tsx',
    category: 'App Router',
    description: 'Dashboard Sekretaris: Rekap Tagihan Gabungan & Notulen Rapat',
    code: `'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { FileText, ClipboardCheck, Plus, CheckCircle } from 'lucide-react';

export default function SekretarisPage() {
  const [notulenList, setNotulenList] = useState<any[]>([]);
  const [judul, setJudul] = useState('');
  const [kategori, setKategori] = useState('Rapat Rutin');
  const [isi, setIsi] = useState('');
  const [kesepakatan, setKesepakatan] = useState('');
  const supabase = createClient();

  const loadNotulen = async () => {
    const { data } = await supabase.from('notulen').select('*').order('tanggal', { ascending: false });
    setNotulenList(data || []);
  };

  useEffect(() => {
    loadNotulen();
  }, []);

  const handleCreateNotulen = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from('notulen').insert([{
      judul,
      kategori,
      isi_notulen: isi,
      kesepakatan,
      penulis: 'Sekretaris RW',
      status: 'published',
    }]);
    setJudul('');
    setIsi('');
    setKesepakatan('');
    loadNotulen();
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Sekretaris RW</h1>
        <p className="text-slate-500 text-sm">Administrasi Notulen Rapat Warga & Rekapitulasi Tagihan Terpadu</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-900" />
          Form Buat Notulen / Pengumuman Warga Baru
        </h2>
        <form onSubmit={handleCreateNotulen} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold block mb-1">Judul Rapat / Info</label>
              <input value={judul} onChange={(e) => setJudul(e.target.value)} className="w-full border rounded-xl p-2 text-sm" placeholder="Rapat Koordinasi RT/RW" required />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1">Kategori</label>
              <select value={kategori} onChange={(e) => setKategori(e.target.value)} className="w-full border rounded-xl p-2 text-sm">
                <option value="Rapat Rutin">Rapat Rutin</option>
                <option value="Rapat Koordinasi">Rapat Koordinasi</option>
                <option value="Pengumuman">Pengumuman</option>
                <option value="Kerja Bakti">Kerja Bakti</option>
                <option value="Keamanan">Keamanan</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1">Ringkasan Pembahasan & Notulen</label>
            <textarea rows={3} value={isi} onChange={(e) => setIsi(e.target.value)} className="w-full border rounded-xl p-2 text-sm" required />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1">Hasil Keputusan / Kesepakatan</label>
            <textarea rows={2} value={kesepakatan} onChange={(e) => setKesepakatan(e.target.value)} className="w-full border rounded-xl p-2 text-sm" />
          </div>
          <button type="submit" className="px-6 py-2.5 bg-blue-900 text-white rounded-xl text-sm font-semibold hover:bg-blue-800">
            Terbitkan Notulen
          </button>
        </form>
      </div>
    </div>
  );
}
`,
  },
  {
    path: 'app/bendahara-koperasi/page.tsx',
    category: 'App Router',
    description: 'Dashboard Bendahara Koperasi: Simpanan, Pinjaman & Tagihan Warga',
    code: `'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Landmark, Check, AlertCircle } from 'lucide-react';

export default function BendaharaKoperasiPage() {
  const [koperasiList, setKoperasiList] = useState<any[]>([]);
  const supabase = createClient();

  const loadData = async () => {
    const { data } = await supabase.from('koperasi').select('*, warga(nama, no_rumah, rt)').order('created_at', { ascending: false });
    setKoperasiList(data || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMarkLunas = async (id: string) => {
    await supabase.from('koperasi').update({ status: 'lunas', tanggal_bayar: new Date().toISOString().split('T')[0] }).eq('id', id);
    loadData();
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Bendahara Koperasi RW</h1>
        <p className="text-slate-500 text-sm">Pencatatan Simpanan Pokok/Wajib dan Angsuran Pinjaman Anggota</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Landmark className="w-5 h-5 text-blue-900" />
          Daftar Tagihan & Simpanan Anggota
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 border-b">
              <tr>
                <th className="p-3">Warga</th>
                <th className="p-3">Jenis</th>
                <th className="p-3">Periode</th>
                <th className="p-3">Nominal</th>
                <th className="p-3">Status</th>
                <th className="p-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {koperasiList.map(item => (
                <tr key={item.id}>
                  <td className="p-3 font-medium">{item.warga?.nama || item.warga_id}</td>
                  <td className="p-3 uppercase text-xs font-semibold">{item.jenis.replace('_', ' ')}</td>
                  <td className="p-3">{item.periode || '-'}</td>
                  <td className="p-3 font-bold">Rp {Number(item.nominal).toLocaleString('id-ID')}</td>
                  <td className="p-3">
                    <span className={\`px-2.5 py-1 rounded-full text-xs font-semibold \${item.status === 'lunas' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}\`}>
                      {item.status === 'lunas' ? 'Lunas' : 'Belum Lunas'}
                    </span>
                  </td>
                  <td className="p-3">
                    {item.status !== 'lunas' && (
                      <button onClick={() => handleMarkLunas(item.id)} className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium flex items-center gap-1">
                        <Check className="w-3 h-3" /> Tandai Lunas
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
`,
  },
  {
    path: 'app/warga/page.tsx',
    category: 'App Router',
    description: 'Dashboard Portal Warga: Transparansi Kas RW, Informasi & Tagihan Pribadi',
    code: `'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Home, Bell, CreditCard, PieChart } from 'lucide-react';

export default function WargaDashboardPage() {
  const [activeTab, setActiveTab] = useState<'kas' | 'info' | 'tagihan'>('kas');
  const [kasList, setKasList] = useState<any[]>([]);
  const [notulenList, setNotulenList] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    supabase.from('kas_rw').select('*').order('tanggal', { ascending: false }).then(({ data }) => setKasList(data || []));
    supabase.from('notulen').select('*').eq('status', 'published').order('tanggal', { ascending: false }).then(({ data }) => setNotulenList(data || []));
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      <div className="bg-blue-900 text-white p-6 rounded-3xl shadow-lg">
        <h1 className="text-2xl font-bold">Portal Mandiri Warga RW 05</h1>
        <p className="text-blue-200 text-sm mt-1">Transparansi Keuangan, Notulen Rapat, dan Cek Iuran Lingkungan</p>
        
        <div className="flex gap-2 mt-6">
          <button onClick={() => setActiveTab('kas')} className={\`px-4 py-2 rounded-xl text-xs font-bold transition \${activeTab === 'kas' ? 'bg-white text-blue-900' : 'bg-blue-800 text-blue-100'}\`}>
            Transparansi Kas RW
          </button>
          <button onClick={() => setActiveTab('info')} className={\`px-4 py-2 rounded-xl text-xs font-bold transition \${activeTab === 'info' ? 'bg-white text-blue-900' : 'bg-blue-800 text-blue-100'}\`}>
            Notulen & Pengumuman
          </button>
          <button onClick={() => setActiveTab('tagihan')} className={\`px-4 py-2 rounded-xl text-xs font-bold transition \${activeTab === 'tagihan' ? 'bg-white text-blue-900' : 'bg-blue-800 text-blue-100'}\`}>
            Tagihan Pribadi
          </button>
        </div>
      </div>

      {activeTab === 'kas' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Laporan Arus Kas RW Terbuka</h2>
          <div className="space-y-3">
            {kasList.map(item => (
              <div key={item.id} className="p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800 text-sm">{item.keterangan}</div>
                  <div className="text-xs text-slate-400">{item.tanggal} • {item.kategori}</div>
                </div>
                <div className={\`font-bold text-sm \${item.jenis === 'pemasukan' ? 'text-emerald-600' : 'text-rose-600'}\`}>
                  {item.jenis === 'pemasukan' ? '+' : '-'} Rp {Number(item.nominal).toLocaleString('id-ID')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'info' && (
        <div className="space-y-4">
          {notulenList.map(notul => (
            <div key={notul.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <span className="px-2.5 py-1 bg-blue-100 text-blue-900 text-xs font-bold rounded-lg">{notul.kategori}</span>
              <h3 className="text-lg font-bold text-slate-900 mt-2">{notul.judul}</h3>
              <p className="text-xs text-slate-500 mt-1">{notul.tanggal} • Notulis: {notul.penulis}</p>
              <div className="text-sm text-slate-700 mt-3 whitespace-pre-line">{notul.isi_notulen}</div>
              {notul.kesepakatan && (
                <div className="mt-4 p-3 bg-emerald-50 rounded-xl text-xs text-emerald-900">
                  <div className="font-bold mb-1">Keputusan & Kesepakatan:</div>
                  {notul.kesepakatan}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
`,
  },
];
