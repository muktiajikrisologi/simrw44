import React, { useState } from 'react';
import { UserProfile, KasRW } from '../../types';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PlusCircle,
  Search,
  Trash2,
  Calendar,
  FileCheck,
} from 'lucide-react';

interface BendaharaRWDashboardProps {
  currentUser: UserProfile;
  kasRW: KasRW[];
  onAddKasRW: (data: Omit<KasRW, 'id' | 'created_at'>) => void;
  onDeleteKasRW: (id: string) => void;
}

export const BendaharaRWDashboard: React.FC<BendaharaRWDashboardProps> = ({
  currentUser,
  kasRW,
  onAddKasRW,
  onDeleteKasRW,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'masuk' | 'keluar'>('all');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [jenis, setJenis] = useState<'masuk' | 'keluar'>('masuk');
  const [kategori, setKategori] = useState<KasRW['kategori']>('Iuran Bulanan');
  const [nominal, setNominal] = useState<number>(50000);
  const [tanggal, setTanggal] = useState<string>(new Date().toISOString().split('T')[0]);
  const [keterangan, setKeterangan] = useState('');
  const [noBukti, setNoBukti] = useState('');

  // Calculations
  const totalPemasukan = kasRW
    .filter((k) => k.jenis === 'masuk')
    .reduce((sum, k) => sum + k.nominal, 0);

  const totalPengeluaran = kasRW
    .filter((k) => k.jenis === 'keluar')
    .reduce((sum, k) => sum + k.nominal, 0);

  const saldoKas = totalPemasukan - totalPengeluaran;

  const filteredKas = kasRW.filter((item) => {
    const matchType = filterType === 'all' || item.jenis === filterType;
    const matchSearch =
      item.keterangan.toLowerCase().includes(search.toLowerCase()) ||
      item.kategori.toLowerCase().includes(search.toLowerCase()) ||
      (item.no_bukti && item.no_bukti.toLowerCase().includes(search.toLowerCase()));
    return matchType && matchSearch;
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keterangan || nominal <= 0) return;
    onAddKasRW({
      jenis,
      kategori,
      nominal: Number(nominal),
      tanggal,
      keterangan,
      no_bukti: noBukti || undefined,
    });
    setKeterangan('');
    setNoBukti('');
    setNominal(50000);
    setShowAddModal(false);
  };

  return (
    <div className="w-full space-y-4">
      {/* CARD 1: Identity Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 rounded-2xl p-5 text-white shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/10 rounded-full text-[10px] font-bold tracking-wider text-emerald-300 uppercase border border-white/10 mb-2">
            <Wallet className="w-3 h-3" />
            <span>Perbendaharaan RW</span>
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-white leading-tight">
            Pembukuan & Arus Kas
          </h1>
          <p className="text-slate-300 text-xs mt-1 leading-relaxed">
            Pencatatan mutasi kas masuk iuran warga dan alokasi kas keluar operasional lingkungan secara akuntabel.
          </p>
        </div>
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-emerald-200">
          <span className="text-[11px]">Bendahara: <strong className="text-white">{currentUser.nama}</strong></span>
          <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
            Audit Mandiri
          </span>
        </div>
      </div>

      {/* CARD 2: Saldo Kas Utama */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Saldo Kas Bersih</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
            Rp {saldoKas.toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
            Posisi kas riil per hari ini
          </div>
        </div>
      </div>

      {/* CARD 3 & 4: Pemasukan & Pengeluaran Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pemasukan</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-base font-black text-slate-900 font-mono">
              Rp {totalPemasukan.toLocaleString('id-ID')}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              {kasRW.filter(k => k.jenis === 'masuk').length} Transaksi
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pengeluaran</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <TrendingDown className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-base font-black text-slate-900 font-mono">
              Rp {totalPengeluaran.toLocaleString('id-ID')}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              {kasRW.filter(k => k.jenis === 'keluar').length} Transaksi
            </div>
          </div>
        </div>
      </div>

      {/* FILTER & TRANSAKSI SECTION */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
        <div className="flex flex-col gap-2">
          {/* Tombol Catat Transaksi */}
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Catat Transaksi Kas Baru</span>
          </button>

          {/* Search Box */}
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari transaksi kas, no bukti..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          {/* Filter Tab */}
          <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-center">
            <button
              onClick={() => setFilterType('all')}
              className={`py-1.5 text-[11px] font-bold rounded-lg transition ${
                filterType === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilterType('masuk')}
              className={`py-1.5 text-[11px] font-bold rounded-lg transition ${
                filterType === 'masuk' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500'
              }`}
            >
              Pemasukan
            </button>
            <button
              onClick={() => setFilterType('keluar')}
              className={`py-1.5 text-[11px] font-bold rounded-lg transition ${
                filterType === 'keluar' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-500'
              }`}
            >
              Pengeluaran
            </button>
          </div>
        </div>

        {/* Daftar Transaksi (Card Mobile View) */}
        <div className="space-y-2 pt-2">
          {filteredKas.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs">
              Belum ada data transaksi kas.
            </div>
          ) : (
            filteredKas.map((k) => {
              const isMasuk = k.jenis === 'masuk';
              return (
                <div
                  key={k.id}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2 hover:bg-slate-50 transition"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase ${
                          isMasuk
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {isMasuk ? 'Masuk' : 'Keluar'}
                      </span>
                      <span className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded text-[9px] font-bold">
                        {k.kategori}
                      </span>
                    </div>
                    <p className="font-bold text-xs text-slate-800 truncate">{k.keterangan}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span className="flex items-center gap-0.5">
                        <Calendar className="w-3 h-3" />
                        {k.tanggal}
                      </span>
                      {k.no_bukti && (
                        <span className="flex items-center gap-0.5 font-mono">
                          <FileCheck className="w-3 h-3" />
                          {k.no_bukti}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-2 shrink-0">
                    <div className="font-mono font-bold text-xs">
                      <span className={isMasuk ? 'text-emerald-700' : 'text-rose-600'}>
                        {isMasuk ? '+' : '-'} Rp {k.nominal.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <button
                      onClick={() => onDeleteKasRW(k.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                      title="Hapus Transaksi"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal Catat Kas */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-emerald-600" />
              Catat Transaksi Kas RW
            </h3>
            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1 text-slate-700">Jenis Transaksi</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setJenis('masuk')}
                    className={`py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                      jenis === 'masuk'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    + Pemasukan
                  </button>
                  <button
                    type="button"
                    onClick={() => setJenis('keluar')}
                    className={`py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                      jenis === 'keluar'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    - Pengeluaran
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1 text-slate-700">Kategori Transaksi</label>
                <select
                  value={kategori}
                  onChange={(e: any) => setKategori(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                >
                  <option value="Iuran Bulanan">Iuran Bulanan</option>
                  <option value="Donasi">Donasi / Sumbangan</option>
                  <option value="Operasional">Operasional</option>
                  <option value="Pembangunan">Pembangunan / Fasilitas</option>
                  <option value="Sosial">Sosial / Santunan</option>
                  <option value="Kebersihan">Kebersihan Lingkungan</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1 text-slate-700">Nominal (Rupiah)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 font-bold text-slate-400">Rp</span>
                  <input
                    type="number"
                    required
                    min={1000}
                    step={1000}
                    value={nominal}
                    onChange={(e) => setNominal(Number(e.target.value))}
                    className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1 text-slate-700">Tanggal Transaksi</label>
                <input
                  type="date"
                  required
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="font-bold block mb-1 text-slate-700">Keterangan / Uraian</label>
                <input
                  type="text"
                  required
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  placeholder="Misal: Pembayaran iuran kebersihan RT 01"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold block mb-1 text-slate-700">No. Kwitansi / Bukti (Opsional)</label>
                <input
                  type="text"
                  value={noBukti}
                  onChange={(e) => setNoBukti(e.target.value)}
                  placeholder="BKT-2026/03/01"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition cursor-pointer"
                >
                  Simpan Transaksi
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};