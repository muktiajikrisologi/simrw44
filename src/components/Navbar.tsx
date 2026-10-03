import React from 'react';
import { UserProfile } from '../types';
import { Database, Download, LogOut, UserCheck } from 'lucide-react';

interface NavbarProps {
  currentUser: UserProfile | null;
  supabaseConnected: boolean;
  isSyncing: boolean;
  onOpenRoleSwitcher: () => void;
  onOpenSupabaseModal: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  supabaseConnected,
  isSyncing,
  onOpenRoleSwitcher,
  onOpenSupabaseModal,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Judul */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-indigo-200">
              RW
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-base leading-tight">
                Sistem Manajemen RW 44
              </h1>
              <p className="text-[11px] font-medium text-slate-500">
                Portal Administrasi & Keuangan Terpadu
              </p>
            </div>
          </div>

          {/* Action Items */}
          <div className="flex items-center gap-2.5">
            
            {/* Status Supabase */}
            <button
              type="button"
              onClick={onOpenSupabaseModal}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition shadow-xs ${
                supabaseConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/70'
                  : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/70'
              }`}
            >
              <Database className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{supabaseConnected ? 'Supabase Terhubung' : 'Sambungkan DB'}</span>
            </button>

            {/* Tombol Install PWA */}
            <button
              type="button"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold transition shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Install PWA</span>
            </button>

            {/* Switcher Role & Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <button
                type="button"
                onClick={onOpenRoleSwitcher}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 transition text-left"
              >
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    {currentUser?.role?.replace('_', ' ') || 'warga'}
                  </div>
                  <div className="text-xs font-bold text-slate-800 leading-none">
                    {currentUser?.nama || 'WARGA MANDIRI'}
                  </div>
                </div>
                <UserCheck className="w-4 h-4 text-slate-500 ml-1" />
              </button>

              <button
                type="button"
                onClick={onLogout}
                title="Keluar"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};