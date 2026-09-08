import React, { useState } from 'react';
import { saveSupabaseConfig, clearSupabaseConfig, isSupabaseConfigured } from '../lib/supabase';
import { Database, Key, Globe, CheckCircle, AlertCircle, X, ExternalLink, RefreshCw } from 'lucide-react';

interface SupabaseConfigModalProps {
  onClose: () => void;
  onRefresh: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  onClose,
  onRefresh,
}) => {
  const [url, setUrl] = useState(() => {
    return localStorage.getItem('rw_supabase_url') || '';
  });
  const [key, setKey] = useState(() => {
    return localStorage.getItem('rw_supabase_anon_key') || '';
  });
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isConnected = isSupabaseConfigured();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !key.trim()) {
      setStatusMsg({ type: 'error', text: 'URL dan Anon Key Supabase tidak boleh kosong.' });
      return;
    }
    if (!url.startsWith('https://')) {
      setStatusMsg({ type: 'error', text: 'URL Supabase harus diawali dengan https:// (misal: https://xyz.supabase.co)' });
      return;
    }
    saveSupabaseConfig(url, key);
    setStatusMsg({ type: 'success', text: 'Kredensial Supabase berhasil disimpan! Menyinkronkan database...' });
    setTimeout(() => {
      onRefresh();
      onClose();
    }, 1000);
  };

  const handleResetToDemo = () => {
    clearSupabaseConfig();
    setUrl('');
    setKey('');
    setStatusMsg({ type: 'success', text: 'Kembali ke mode demo lokal (in-memory & localStorage).' });
    setTimeout(() => {
      onRefresh();
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Koneksi Database Supabase</h2>
              <p className="text-xs text-slate-500">PostgreSQL Cloud Database & Auth</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {statusMsg && (
          <div
            className={`mt-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
              statusMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {statusMsg.type === 'success' ? (
              <CheckCircle className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Supabase Project URL
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-project.supabase.co"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Ditemukan di: Dashboard Supabase &rarr; Project Settings &rarr; API &rarr; Project URL
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Supabase Anon Public API Key
            </label>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Ditemukan di: Project Settings &rarr; API &rarr; Project API Keys (`anon public`)
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Simpan & Sambungkan</span>
            </button>
            {isConnected && (
              <button
                type="button"
                onClick={handleResetToDemo}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
              >
                Gunakan Demo Lokal
              </button>
            )}
          </div>
        </form>

        <div className="mt-5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
          <div className="font-bold text-slate-800 flex items-center justify-between">
            <span>Petunjuk Supabase:</span>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noreferrer"
              className="text-blue-700 hover:underline flex items-center gap-1 text-[11px]"
            >
              Buka Supabase <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <p>
            1. Buka SQL Editor di project Supabase Anda.
          </p>
          <p>
            2. Salin dan jalankan skrip migrasi dari tombol <strong>"SQL Migration"</strong> pada aplikasi ini.
          </p>
          <p>
            3. Masukkan URL dan Anon Key project Anda di form di atas untuk live sync.
          </p>
        </div>
      </div>
    </div>
  );
};
