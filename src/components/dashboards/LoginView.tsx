import React, { useState } from 'react';
import { UserRole, UserProfile } from '../../types';
import { ShieldCheck, LogIn, Key, Mail, AlertCircle, Sparkles, UserCheck, Database, Eye, EyeOff, X } from 'lucide-react';

interface LoginViewProps {
  users: UserProfile[];
  onLoginAsRole: (role: UserRole) => void;
  onLoginWithEmail: (email: string, pass: string) => boolean | Promise<boolean>;
  onOpenSupabaseModal: () => void;
  supabaseConnected: boolean;
  onClose?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginAsRole,
  onLoginWithEmail,
  onOpenSupabaseModal,
  supabaseConnected,
  onClose,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      } else {
        if (onClose) onClose();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Terjadi kesalahan saat mencoba masuk.');
    } finally {
      setIsLoading(false);
    }
  };

  const demoRoles: Array<{ role: UserRole; title: string; color: string }> = [
    { role: 'super_admin', title: 'Super Admin', color: 'bg-purple-600 hover:bg-purple-700' },
    { role: 'sekretaris', title: 'Sekretaris RW', color: 'bg-indigo-600 hover:bg-indigo-700' },
    { role: 'bendahara_rw', title: 'Bendahara RW', color: 'bg-emerald-600 hover:bg-emerald-700' },
    { role: 'bendahara_koperasi', title: 'Bendahara Koperasi', color: 'bg-amber-600 hover:bg-amber-700' },
    { role: 'perekap_jimpitan', title: 'Perekap Ronda', color: 'bg-cyan-600 hover:bg-cyan-700' },
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Tombol Close */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Logo & Headline */}
        <div className="text-center mb-6 pt-2">
          <div className="inline-flex p-3 bg-blue-900 text-white rounded-2xl shadow-sm mb-2">
            <ShieldCheck className="w-7 h-7 text-amber-400" />
          </div>
          <h1 className="text-xl font-black text-slate-900">Login Pengurus RW</h1>
          <p className="text-xs text-slate-500 mt-0.5">Akses khusus untuk pengurus & petugas RW</p>
        </div>

        {/* Status Supabase */}
        <div className="flex justify-center mb-4">
          <button
            type="button"
            onClick={onOpenSupabaseModal}
            className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold rounded-full border transition cursor-pointer ${
              supabaseConnected
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>{supabaseConnected ? 'Supabase Terhubung' : 'Mode Offline / Local'}</span>
          </button>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Login */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Email Akun Pengurus
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@rw05.id"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Kata Sandi
            </label>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 disabled:bg-slate-400 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>{isLoading ? 'Memverifikasi...' : 'Masuk Pengurus'}</span>
          </button>
        </form>

        {/* Mode Demo Testing (Hanya Muncul di Dev) */}
        {isDev && (
          <>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-white px-2 text-slate-400 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" /> Uji Coba Instan (Dev Only)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {demoRoles.map((item) => (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => {
                    onLoginAsRole(item.role);
                    if (onClose) onClose();
                  }}
                  className={`py-1.5 px-2 text-white text-[10px] font-bold rounded-lg transition flex items-center justify-center gap-1 ${item.color} cursor-pointer`}
                >
                  <UserCheck className="w-3 h-3" />
                  <span className="truncate">{item.title}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};