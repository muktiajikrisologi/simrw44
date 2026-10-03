import React, { useState, useMemo } from 'react';
import { Calendar } from 'lucide-react';
import { Koperasi } from '../../types';

interface KoperasiHeroCardProps {
  koperasi?: Koperasi[];
}

const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const KoperasiHeroCard: React.FC<KoperasiHeroCardProps> = ({ koperasi = [] }) => {
  const currentYear = new Date().getFullYear();
  const currentMonthIndex = new Date().getMonth();

  const [selectedBulan, setSelectedBulan] = useState<string>(NAMA_BULAN[currentMonthIndex]);
  const [selectedTahun, setSelectedTahun] = useState<number>(currentYear);

  const targetPeriode = `${selectedBulan} ${selectedTahun}`.toLowerCase();

  const koperasiPeriode = useMemo(() => {
    return koperasi.filter((k) => {
      const bT = (k.bulan_tahun || '').toLowerCase();
      return bT.includes(targetPeriode);
    });
  }, [koperasi, targetPeriode]);

  const totalPelunasanPeriode = useMemo(() => {
    return koperasiPeriode
      .filter((k) => k.status === 'lunas')
      .reduce((sum, k) => sum + (Number(k.nominal) || 0), 0);
  }, [koperasiPeriode]);

  const jumlahWargaLunasPeriode = useMemo(() => {
    const lunasList = koperasiPeriode.filter((k) => k.status === 'lunas');
    const uniqueWargaIds = new Set(lunasList.map((k) => k.warga_id || k.nama_warga));
    return uniqueWargaIds.size;
  }, [koperasiPeriode]);

  return (
    <div className="w-full bg-gradient-to-br from-amber-600 to-amber-700 rounded-2xl p-4 text-white shadow-md space-y-3">
      {/* Header & Filter Periode */}
      <div className="flex items-center justify-between gap-2 border-b border-white/20 pb-2.5">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-amber-100" />
          <span className="text-xs font-bold uppercase tracking-wider text-amber-100">
            Rekapan Koperasi
          </span>
        </div>

        <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-xl text-xs font-bold">
          <select
            value={selectedBulan}
            onChange={(e) => setSelectedBulan(e.target.value)}
            className="bg-transparent text-white focus:outline-none cursor-pointer"
          >
            {NAMA_BULAN.map((bln) => (
              <option key={bln} value={bln} className="text-slate-800">
                {bln}
              </option>
            ))}
          </select>
          <select
            value={selectedTahun}
            onChange={(e) => setSelectedTahun(Number(e.target.value))}
            className="bg-transparent text-white focus:outline-none cursor-pointer"
          >
            {[2024, 2025, 2026, 2027].map((thn) => (
              <option key={thn} value={thn} className="text-slate-800">
                {thn}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content Info */}
      <div className="flex items-end justify-between pt-1">
        <div>
          <span className="text-[11px] text-amber-100 block">Total Pelunasan Warga</span>
          <div className="text-2xl font-black font-mono tracking-tight mt-0.5">
            Rp {totalPelunasanPeriode.toLocaleString('id-ID')}
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-amber-100 block">Warga Melunasi</span>
          <span className="inline-block mt-0.5 px-2.5 py-0.5 bg-white text-amber-800 rounded-full text-xs font-extrabold shadow-xs">
            {jumlahWargaLunasPeriode} Warga
          </span>
        </div>
      </div>
    </div>
  );
};