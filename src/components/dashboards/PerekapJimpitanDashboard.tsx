import React from 'react';
import { UserProfile, RekapJimpitanRondaEntry, KelompokRonda } from '../../types';
import { Coins, ShieldCheck, Layers, ArrowRight, UserCheck } from 'lucide-react';

interface PerekapJimpitanDashboardProps {
  currentUser: UserProfile;
  rekapJimpitan?: RekapJimpitanRondaEntry[];
  kelompokRonda?: KelompokRonda[];
  onOpenMenu?: (menuId: string) => void;
}

export const PerekapJimpitanDashboard: React.FC<PerekapJimpitanDashboardProps> = ({
  currentUser,
  rekapJimpitan = [],
  kelompokRonda = [],
  onOpenMenu,
}) => {
  const totalDendaRonda = rekapJimpitan.reduce((acc, curr) => acc + (Number(curr.denda_ronda) || 0), 0);
  const totalBagiJimpitan = rekapJimpitan.reduce((acc, curr) => acc + (Number(curr.bagi_jimpitan) || 0) + (Number(curr.tdk_isi_jimpitan) || 0), 0);
  const totalSetoranKelompok = kelompokRonda.reduce((acc, curr) => acc + (Number(curr.nominal_setoran) || 0), 0);
  const totalKeseluruhan = rekapJimpitan.reduce((acc, curr) => acc + (Number(curr.jumlah) || 0), 0);

  return (
    <div className="space-y-4">
      {/* Header Ringkas */}
      <div className="bg-gradient-to-r from-teal-700 to-emerald-600 text-white p-5 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase bg-white/20 px-2 py-0.5 rounded text-teal-100">
              Dashboard Perekap
            </span>
            <h2 className="text-lg font-extrabold mt-1">Ringkasan Jimpitan & Ronda</h2>
            <p className="text-xs text-teal-100 mt-0.5">
              Kelola dan pantau seluruh catatan iuran ronda warga RW 44.
            </p>
          </div>
          <Coins className="w-10 h-10 text-emerald-200 opacity-80" />
        </div>
      </div>

      {/* Grid Statistik Ringkas */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase">Denda Ronda</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-base font-bold text-slate-900">
            Rp {totalDendaRonda.toLocaleString('id-ID')}
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase">Jimpitan Warga</span>
            <Coins className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-base font-bold text-slate-900">
            Rp {totalBagiJimpitan.toLocaleString('id-ID')}
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase">Setoran 7 Regu</span>
            <Layers className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-base font-bold text-slate-900">
            Rp {totalSetoranKelompok.toLocaleString('id-ID')}
          </p>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
          <div className="flex items-center justify-between text-emerald-700 mb-1">
            <span className="text-[10px] font-bold uppercase">Total Rekap</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-base font-bold text-emerald-950">
            Rp {totalKeseluruhan.toLocaleString('id-ID')}
          </p>
        </div>
      </div>

      {/* Aksi Cepat Buka Tabel Utama */}
      <button
        onClick={() => onOpenMenu && onOpenMenu('iuran_ronda')}
        className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-between transition shadow-sm"
      >
        <span>Buka & Kelola Tabel Iuran Ronda Lengkap</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};