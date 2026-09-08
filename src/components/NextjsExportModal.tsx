import React, { useState } from 'react';
import { NEXTJS_PROJECT_FILES, NextjsFile } from '../lib/nextjsCodebase';
import { Code2, Copy, Check, FolderTree, FileCode, ExternalLink, X, Terminal } from 'lucide-react';

interface NextjsExportModalProps {
  onClose: () => void;
}

export const NextjsExportModal: React.FC<NextjsExportModalProps> = ({ onClose }) => {
  const [selectedFile, setSelectedFile] = useState<NextjsFile>(NEXTJS_PROJECT_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'App Router' | 'Auth & RBAC' | 'Config & PWA'>('All');

  const filteredFiles = NEXTJS_PROJECT_FILES.filter(
    (f) => categoryFilter === 'All' || f.category === categoryFilter
  );

  const handleCopyCurrent = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-xs">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-900 text-white rounded-xl">
              <Code2 className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Struktur & Kode Next.js (App Router) Siap Salin ke VS Code
              </h2>
              <p className="text-xs text-slate-500">
                Full-Stack Next.js 14/15, Tailwind CSS, Supabase SSR & PWA Manifest untuk deploy ke Vercel
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Vercel Setup Instructions */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 my-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <Terminal className="w-4 h-4 text-blue-800 shrink-0" />
            <span>
              <strong>Langkah di VS Code:</strong> 1. Buat folder proyek &rarr; 2. Pasang dependensi <code>npm install @supabase/supabase-js @supabase/ssr lucide-react</code> &rarr; 3. Salin file-file di bawah.
            </span>
          </div>
          <span className="px-2.5 py-0.5 bg-black text-white font-mono text-[11px] rounded-lg">
            ▲ Deploy: git push origin main / vercel
          </span>
        </div>

        {/* Filter categories */}
        <div className="flex gap-2 mb-3">
          {(['All', 'App Router', 'Auth & RBAC', 'Config & PWA'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                categoryFilter === cat
                  ? 'bg-blue-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'All' ? 'Semua File' : cat}
            </button>
          ))}
        </div>

        {/* Main 2-column view: File list & Code Editor */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 overflow-hidden">
          {/* File sidebar list */}
          <div className="md:col-span-4 border border-slate-200 rounded-2xl p-2.5 overflow-y-auto max-h-[55vh] bg-slate-50/50">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-2 flex items-center gap-1.5">
              <FolderTree className="w-3.5 h-3.5" />
              <span>Daftar Berkas Proyek</span>
            </div>
            <div className="space-y-1">
              {filteredFiles.map((file) => {
                const isActive = selectedFile.path === file.path;
                return (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition flex items-start justify-between gap-2 ${
                      isActive
                        ? 'bg-blue-900 text-white shadow-xs'
                        : 'hover:bg-slate-200/60 text-slate-700'
                    }`}
                  >
                    <div className="truncate">
                      <div className="font-mono font-semibold truncate">{file.path}</div>
                      <div
                        className={`text-[10px] truncate mt-0.5 ${
                          isActive ? 'text-blue-200' : 'text-slate-400'
                        }`}
                      >
                        {file.description}
                      </div>
                    </div>
                    <FileCode
                      className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                        isActive ? 'text-amber-300' : 'text-slate-400'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Code Viewer Panel */}
          <div className="md:col-span-8 flex flex-col border border-slate-800 rounded-2xl overflow-hidden bg-slate-950">
            <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-300 font-mono">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                <span className="font-bold">{selectedFile.path}</span>
                <span className="text-[10px] text-slate-500 font-sans">({selectedFile.category})</span>
              </div>
              <button
                onClick={handleCopyCurrent}
                className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow transition"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin!' : 'Salin File Ini'}</span>
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4 text-xs font-mono text-slate-200 leading-relaxed selection:bg-blue-600">
              <pre>
                <code>{selectedFile.code}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            *Seluruh kode di atas bebas potongan / non-placeholder, siap dipaste langsung ke proyek Next.js Anda.
          </span>
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
