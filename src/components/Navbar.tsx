import React from 'react';
import { UserProfile, UserRole } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import {
  ShieldCheck,
  Database,
  Code2,
  FileCode,
  UserCheck,
  LogOut,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  currentUser: UserProfile;
  supabaseConnected: boolean;
  isSyncing: boolean;
  onOpenRoleSwitcher: () => void;
  onOpenSupabaseModal: () => void;
  onOpenSqlModal: () => void;
  onOpenNextjsModal: () => void;
  onLogout: () => void;
}

const ROLE_BADGES: Record<UserRole, { label: string; color: string }> = {
  super_admin: { label: 'Super Admin', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  sekretaris: { label: 'Sekretaris RW', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  bendahara_rw: { label: 'Bendahara RW', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  bendahara_koperasi: { label: 'Bendahara Koperasi', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  perekap_jimpitan: { label: 'Perekap Ronda', color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
  warga: { label: 'Warga Mandiri', color: 'bg-slate-100 text-slate-700 border-slate-200' },
};

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  supabaseConnected,
  isSyncing,
  onOpenRoleSwitcher,
  onOpenSupabaseModal,
  onOpenSqlModal,
  onOpenNextjsModal,
  onLogout,
}) => {
  const badge = ROLE_BADGES[currentUser.role] || ROLE_BADGES.warga;

  // Pengecekan apakah sedang dalam mode Development (lokal)
  const isDev =
    (typeof import.meta !== 'undefined' && import.meta.env?.DEV) ||
    (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      <header className="flex flex-wrap justify-between items-center bg-white px-5 sm:px-6 py-3 rounded-2xl border border-slate-200 shadow-sm gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-xs">
            RW
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-800 leading-none">
              Sistem Manajemen RW 44
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Portal Administrasi & Keuangan Terpadu
            </p>
          </div>
        </div>

        {/* Action Center */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          
          {/* Tombol-tombol teknis developer hanya tampil saat lokal/dev */}
          {isDev && (
            <>
              {/* Supabase Status / Config */}
              <button
                id="btn-nav-supabase-status"
                onClick={onOpenSupabaseModal}
                className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition ${
                  supabaseConnected
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
                title="Klik untuk konfigurasi URL & Key Supabase"
              >
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                <span>{supabaseConnected ? 'Supabase Terhubung' : 'Demo Mode (Lokal)'}</span>
                {isSyncing && <RefreshCw className="w-3 h-3 animate-spin text-slate-400" />}
              </button>

              {/* SQL Migration Script Viewer */}
              <button
                id="btn-nav-sql-migration"
                onClick={onOpenSqlModal}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 transition"
                title="Lihat Skema DDL & RLS Supabase"
              >
                <FileCode className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">SQL Migration</span>
              </button>

              {/* Next.js Code Exporter */}
              <button
                id="btn-nav-nextjs-code"
                onClick={onOpenNextjsModal}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl border border-indigo-200 transition"
                title="Lihat & Salin Kode Lengkap Next.js App Router"
              >
                <Code2 className="w-3.5 h-3.5 text-indigo-700" />
                <span className="hidden sm:inline">Kode Next.js</span>
              </button>
            </>
          )}

          {/* PWA Install Button (Tetap dipasang agar warga bisa pasang aplikasi di HP) */}
          <PWAInstallButton />

          {/* User Role Card */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="text-right hidden lg:block">
              <p className="text-xs font-semibold text-slate-700 leading-tight">
                {currentUser.nama || 'Pengguna SIM-RW'}
              </p>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border inline-block mt-0.5 ${badge.color}`}>
                {badge.label}
              </span>
            </div>

            {/* Tombol ganti role simulasi hanya tampil saat dev */}
            {isDev ? (
              <button
                id="btn-nav-role-switcher"
                onClick={onOpenRoleSwitcher}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border cursor-pointer hover:opacity-90 transition ${badge.color}`}
                title="Ganti Role Simulasi / Uji Hak Akses"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span className="lg:hidden">{badge.label}</span>
                <Sparkles className="w-3 h-3 opacity-70" />
              </button>
            ) : (
              /* Tampilan badge biasa untuk warga tanpa tombol klik ganti role */
              <div className={`lg:hidden flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-xl border ${badge.color}`}>
                <UserCheck className="w-3.5 h-3.5" />
                <span>{badge.label}</span>
              </div>
            )}

            <button
              id="btn-nav-logout"
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition"
              title="Keluar / Reset ke Halaman Login"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>
    </div>
  );
};