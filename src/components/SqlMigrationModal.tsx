import React, { useState } from 'react';
import { SQL_MIGRATION_SCRIPT } from '../lib/schemaSql';
import { FileCode, Copy, Check, Download, X, Shield, Table } from 'lucide-react';

interface SqlMigrationModalProps {
  onClose: () => void;
}

export const SqlMigrationModal: React.FC<SqlMigrationModalProps> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SQL_MIGRATION_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([SQL_MIGRATION_SCRIPT], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schema.sql';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 text-blue-900 rounded-xl">
              <FileCode className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Skema Database SQL Supabase (DDL & RLS Lengkap)
              </h2>
              <p className="text-xs text-slate-500">
                Tabel Users, Warga, Kas RW, Koperasi, Jimpitan/Denda Ronda, Notulen, RLS & Trigger
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-xs transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin!' : 'Salin SQL'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh .sql</span>
            </button>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap gap-2 py-3 border-b border-slate-100 text-xs">
          <span className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg font-medium flex items-center gap-1">
            <Table className="w-3 h-3" /> users (Role Enum RBAC)
          </span>
          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg font-medium">
            warga (Master Data)
          </span>
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-medium">
            kas_rw (Bendahara RW)
          </span>
          <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg font-medium">
            koperasi (Simpan Pinjam)
          </span>
          <span className="px-2.5 py-1 bg-cyan-50 text-cyan-700 border border-cyan-200 rounded-lg font-medium">
            jimpitan_denda (Ronda)
          </span>
          <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg font-medium">
            notulen (Sekretaris)
          </span>
          <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg font-medium flex items-center gap-1">
            <Shield className="w-3 h-3" /> Row Level Security (RLS) Aktif
          </span>
        </div>

        {/* SQL Code Body */}
        <div className="flex-1 overflow-auto mt-3 bg-slate-950 text-slate-100 rounded-2xl p-4 font-mono text-xs leading-relaxed border border-slate-800 selection:bg-blue-600 selection:text-white">
          <pre>
            <code>{SQL_MIGRATION_SCRIPT}</code>
          </pre>
        </div>

        {/* Footer Instructions */}
        <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <p>
            *Jalankan skrip ini langsung di <strong>Supabase SQL Editor</strong> untuk membuat seluruh tabel & hak akses.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
