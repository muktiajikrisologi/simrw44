import React, { useState } from 'react';
import { UserProfile, KasRW } from '../../types';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PlusCircle,
  Search,
  Filter,
  Trash2,
  Calendar,
  FileCheck,
  Tag,
  DollarSign,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* TOP BENTO GRID */}
      <div className="grid grid-cols-12 gap-4 sm:gap-5">
        {/* Bento 1: Main Kas RW Identity Card */}
        <div className="col-span-12 lg:col-span-5 bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-[11px] font-bold tracking-wider text-emerald-300 uppercase border border-white/10 mb-4">
              <Wallet className="w-3.5 h-3.5" />
              <span>Perbendaharaan Utama RW</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Pembukuan & Arus Kas
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
              Pencatatan mutasi kas masuk iuran warga dan alokasi kas keluar operasional lingkungan secara akuntabel.
            </p>
          </div>
          <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-emerald-200">
            <span>Bendahara: <strong className="text-white">{currentUser.nama}</strong></span>
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
              Audit Mandiri
            </span>
          </div>
        </div>

        {/* Bento 2: Saldo Kas Bersih */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Saldo Kas Bersih</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono">
              Rp {saldoKas.toLocaleString('id-ID')}
            </div>
            <div className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <span>Posisi kas riil per hari ini</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>Status Keuangan</span>
            <span className="font-bold text-emerald-600">Likuid / Aktif</span>
          </div>
        </div>

        {/* Bento 3: Total Pemasukan */}
        <div className="col-span-6 sm:col-span-3 lg:col-span-2 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pemasukan</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-mono">
              Rp {totalPemasukan.toLocaleString('id-ID')}
            </div>
            <div className="text-xs text-emerald-600 font-semibold mt-0.5">
              Akumulasi Kas
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            {kasRW.filter(k => k.jenis === 'masuk').length} Transaksi Masuk
          </div>
        </div>

        {/* Bento 4: Total Pengeluaran */}
        <div className="col-span-6 sm:col-span-3 lg:col-span-2 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pengeluaran</span>
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-mono">
              Rp {totalPengeluaran.toLocaleString('id-ID')}
            </div>
            <div className="text-xs text-rose-600 font-semibold mt-0.5">
              Alokasi Biaya
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            {kasRW.filter(k => k.jenis === 'keluar').length} Transaksi Keluar
          </div>
        </div>
      </div>

      {/* BENTO 5: DATA TABLE & FILTER SECTION */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
        {/* Action bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari transaksi kas, no bukti, kategori..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div className="flex gap-1 bg-slate-100/80 p-1 rounded-2xl">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
                  filterType === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilterType('masuk')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
                  filterType === 'masuk' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Pemasukan
              </button>
              <button
                onClick={() => setFilterType('keluar')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
                  filterType === 'keluar' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Pengeluaran
              </button>
            </div>
          </div>

          <button
            id="btn-add-kas"
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Catat Transaksi Kas Baru</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-400 text-[10px] uppercase font-bold border-b border-slate-100">
              <tr>
                <th className="p-3.5">Tanggal & Bukti</th>
                <th className="p-3.5">Jenis</th>
                <th className="p-3.5">Kategori</th>
                <th className="p-3.5">Keterangan Transaksi</th>
                <th className="p-3.5 text-right">Nominal</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredKas.map((k) => {
                const isMasuk = k.jenis === 'masuk';
                return (
                  <tr key={k.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-800 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {k.tanggal}
                      </div>
                      {k.no_bukti && (
                        <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                          <FileCheck className="w-3 h-3 text-slate-400" />
                          {k.no_bukti}
                        </div>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          isMasuk
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {isMasuk ? '+ Masuk' : '- Keluar'}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-bold text-[11px]">
                        {k.kategori}
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-700">{k.keterangan}</td>
                    <td className="p-3.5 text-right font-mono font-bold text-xs">
                      <span className={isMasuk ? 'text-emerald-700' : 'text-rose-600'}>
                        {isMasuk ? '+' : '-'} Rp {k.nominal.toLocaleString('id-ID')}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => onDeleteKasRW(k.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                        title="Hapus Transaksi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Catat Kas */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-emerald-600" />
              Catat Transaksi Kas RW
            </h3>
            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold block mb-1 text-slate-700">Jenis Transaksi</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setJenis('masuk')}
                    className={`py-2 text-xs font-bold rounded-xl border transition ${
                      jenis === 'masuk'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    + Pemasukan (Kas Masuk)
                  </button>
                  <button
                    type="button"
                    onClick={() => setJenis('keluar')}
                    className={`py-2 text-xs font-bold rounded-xl border transition ${
                      jenis === 'keluar'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    - Pengeluaran (Kas Keluar)
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

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition"
                >
                  Simpan Transaksi
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
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
