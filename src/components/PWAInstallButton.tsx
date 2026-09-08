import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, CheckCircle2 } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed standalone PWA, hide the button
  if (isInstalled) {
    return (
      <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-lg border border-emerald-200">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>PWA Aktif</span>
      </div>
    );
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        id="btn-install-pwa"
        onClick={install}
        className="flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition"
        title="Pasang aplikasi SIM-RW ke Layar Utama HP / Desktop"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install PWA</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          id="btn-install-pwa-ios"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Pasang di iPhone</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-blue-900" />
                  Install SIM-RW di iPhone / iPad
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3 text-xs text-slate-600">
                <p className="leading-relaxed">
                  1. Ketuk ikon <strong className="text-blue-700">Bagikan (Share / Kotak Berpanah Atas)</strong> di bilah bawah browser Safari Anda.
                </p>
                <p className="leading-relaxed">
                  2. Gulir menu ke bawah lalu pilih menu <strong className="text-blue-700">Tambah ke Layar Utama (Add to Home Screen)</strong>.
                </p>
                <p className="leading-relaxed">
                  3. Ketuk <strong className="text-blue-700">Tambah (Add)</strong> di pojok kanan atas. Aplikasi akan terpasang layaknya aplikasi native tanpa App Store.
                </p>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-slate-100 hover:bg-slate-200 py-2.5 text-xs font-semibold text-slate-800 transition"
              >
                Mengerti
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Generic fallback if beforeinstallprompt not yet triggered or on unsupported browser, still show helpful install info
  return (
    <button
      id="btn-install-pwa-generic"
      onClick={() => alert('Untuk menginstal aplikasi PWA: Pada Chrome/Edge klik ikon (+) atau "Install" di bilah alamat browser. Pada Android pilih menu titik tiga -> "Tambahkan ke Layar Utama".')}
      className="hidden sm:flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 text-xs font-medium transition"
      title="Informasi PWA"
    >
      <Download className="w-3.5 h-3.5 text-slate-500" />
      <span>Install PWA</span>
    </button>
  );
};
