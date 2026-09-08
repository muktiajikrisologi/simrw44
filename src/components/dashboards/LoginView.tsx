import React, { useState } from 'react';
import { UserRole, UserProfile } from '../../types';
import { ShieldCheck, LogIn, Key, Mail, AlertCircle, Sparkles, UserCheck, Database } from 'lucide-react';

interface LoginViewProps {
  users: UserProfile[];
  onLoginAsRole: (role: UserRole) => void;
  onLoginWithEmail: (email: string, pass: string) => boolean | Promise<boolean>;
  onOpenSupabaseModal: () => void;
  supabaseConnected: boolean;
}

export const LoginView: React.FC<LoginViewProps> = ({
  users,
  onLoginAsRole,
  onLoginWithEmail,
  onOpenSupabaseModal,
  supabaseConnected,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Pengecekan mode Development (mendukung Vite, CRA, & Next.js)
  const isDev =
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.DEV) ||
    (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const success = await onLoginWithEmail(email, password);
      if (!success) {
        setErrorMsg('Email atau kata sandi tidak cocok. Silakan periksa kembali.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Terjadi kesalahan saat mencoba masuk.');
    } finally {
      setIsLoading(false);
    }
  };

  const demoRoles: Array<{ role: UserRole; title: string; email: string; color: string }> = [
    { role: 'super_admin', title: 'Super Admin', email: 'admin@rw05.id', color: 'bg-purple-600 hover:bg-purple-700' },
    { role: 'sekretaris', title: 'Sekretaris RW', email: 'sekretaris@rw05.id', color: 'bg-indigo-600 hover:bg-indigo-700' },
    { role: 'bendahara_rw', title: 'Bendahara RW', email: 'bendahara.rw@rw05.id', color: 'bg-emerald-600 hover:bg-emerald-700' },
    { role: 'bendahara_koperasi', title: 'Bendahara Koperasi', email: 'bendahara.koperasi@rw05.id', color: 'bg-amber-600 hover:bg-amber-700' },
    { role: 'perekap_jimpitan', title: 'Perekap Ronda & Jimpitan', email: 'perekap@rw05.id', color: 'bg-cyan-600 hover:bg-cyan-700' },
    { role: 'warga', title: 'Warga Mandiri', email: 'warga@rw05.id', color: 'bg-blue-600 hover:bg-blue-700' },
  ];

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8 relative">
        {/* Supabase status badge */}
        <div className="absolute top-4 right-4">
          <button
            type="button"
            onClick={onOpenSupabaseModal}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-full border transition ${
              supabaseConnected
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            <Database className="w-3 h-3 text-emerald-600" />
            <span>{supabaseConnected ? 'Supabase Live' : 'Demo Mode'}</span>
          </button>
        </div>

        {/* Logo & Headline */}
        <div className="text-center mb-6 pt-2">
          <div className="inline-flex p-3.5 bg-blue-900 text-white rounded-2xl shadow-sm mb-3">
            <ShieldCheck className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            SIM-RW Portal
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Sistem Manajemen Keuangan & Administrasi Tingkat RW
          </p>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Login */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="input-login-email" className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Email Akun
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                id="input-login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@rw05.id"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="input-login-password" className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Kata Sandi
            </label>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                id="input-login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <button
            id="btn-submit-login"
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-blue-900 hover:bg-blue-800 disabled:bg-slate-400 text-white font-semibold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            <LogIn className="w-4 h-4" />
            <span>{isLoading ? 'Memverifikasi...' : 'Masuk ke Dashboard'}</span>
          </button>
        </form>

        {/* Hanya tampil saat mode Development */}
        {isDev && (
          <>
            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-slate-400 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Uji Coba Masuk Instan (1-Klik)
                </span>
              </div>
            </div>

            {/* Quick Demo Role Selectors */}
            <div className="space-y-2">
              <div className="text-[11px] text-slate-500 text-center mb-1">
                Pilih role untuk langsung menguji halaman & hak akses tanpa password:
              </div>
              <div className="grid grid-cols-2 gap-2">
                {demoRoles.map((item) => (
                  <button
                    key={item.role}
                    type="button"
                    id={`btn-demo-login-${item.role}`}
                    onClick={() => onLoginAsRole(item.role)}
                    className={`w-full py-2 px-2.5 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 ${item.color}`}
                  >
                    <UserCheck className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{item.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};