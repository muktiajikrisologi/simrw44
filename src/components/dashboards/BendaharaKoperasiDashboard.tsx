import React, { useState } from 'react';
import { UserProfile, Koperasi, Warga } from '../../types';
import {
  Landmark,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  CreditCard,
  PiggyBank,
  Check,
  Users,
} from 'lucide-react';

interface BendaharaKoperasiDashboardProps {
  currentUser: UserProfile;
  koperasi: Koperasi[];
  warga: Warga[];
  onAddKoperasi: (data: Omit<Koperasi, 'id' | 'created_at'>) => void;
  onMarkKoperasiLunas: (id: string) => void;
}

export const BendaharaKoperasiDashboard: React.FC<BendaharaKoperasiDashboardProps> = ({
  currentUser,
  koperasi,
  warga,
  onAddKoperasi,
  onMarkKoperasiLunas,
}) => {
  const [filterJenis, setFilterJenis] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'belum_lunas' | 'lunas'>('all');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [selectedWargaId, setSelectedWargaId] = useState(warga[0]?.id || '');
  const [jenisTransaksi, setJenisTransaksi] = useState<Koperasi['jenis_transaksi']>('simpanan_wajib');
  const [nominal, setNominal] = useState<number>(50000);
  const [bulanTahun, setBulanTahun] = useState('Maret 2026');
  const [jatuhTempo, setJatuhTempo] = useState(new Date().toISOString().split('T')[0]);
  const [keterangan, setKeterangan] = useState('');
  const [statusAwal, setStatusAwal] = useState<'belum_lunas' | 'lunas'>('belum_lunas');

  const selectedWargaObj = warga.find((w) => w.id === selectedWargaId);

  // Calculations
  const totalSimpananTerkumpul = koperasi
    .filter((k) => (k.jenis_transaksi || k.jenis || '').startsWith('simpanan') && k.status === 'lunas')
    .reduce((sum, k) => sum + k.nominal, 0);

  const totalPiutangBelumLunas = koperasi
    .filter((k) => k.status === 'belum_lunas')
    .reduce((sum, k) => sum + k.nominal, 0);

  const filteredKoperasi = koperasi.filter((item) => {
    const itemJenis = item.jenis_transaksi || item.jenis || '';
    const matchJenis = filterJenis === 'all' || itemJenis === filterJenis;
    const matchStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchSearch =
      (item.nama_warga || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.no_rumah || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.keterangan && item.keterangan.toLowerCase().includes(search.toLowerCase()));
    return matchJenis && matchStatus && matchSearch;
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWargaObj || nominal <= 0) return;
    onAddKoperasi({
      warga_id: selectedWargaObj.id,
      nama_warga: selectedWargaObj.nama,
      no_rumah: selectedWargaObj.no_rumah,
      jenis_transaksi: jenisTransaksi,
      nominal: Number(nominal),
      bulan_tahun: bulanTahun,
      jatuh_tempo: jatuhTempo,
      status: statusAwal,
      tanggal_bayar: statusAwal === 'lunas' ? new Date().toISOString().split('T')[0] : undefined,
      keterangan: keterangan || undefined,
    });
    setKeterangan('');
    setNominal(50000);
    setShowAddModal(false);
  };

  const getJenisBadge = (jenis?: string) => {
    switch (jenis) {
      case 'simpanan_pokok':
        return <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-[11px] font-bold">Simpanan Pokok</span>;
      case 'simpanan_wajib':
        return <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[11px] font-bold">Simpanan Wajib</span>;
      case 'simpanan_sukarela':
        return <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[11px] font-bold">Simpanan Sukarela</span>;
      case 'angsuran_pinjaman':
        return <span className="px-2 py-0.5 bg-amber-50 text-amber-800 rounded text-[11px] font-bold">Angsuran Pinjaman</span>;
      case 'jasa_pinjaman':
        return <span className="px-2 py-0.5 bg-orange-50 text-orange-800 rounded text-[11px] font-bold">Jasa / Bagi Hasil</span>;
      default:
        return <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-bold">{jenis || 'Simpanan'}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* TOP BENTO GRID */}
      <div className="grid grid-cols-12 gap-4 sm:gap-5">
        {/* Bento 1: Main Koperasi Identity Card */}
        <div className="col-span-12 lg:col-span-5 bg-gradient-to-br from-slate-900 via-amber-950 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-[11px] font-bold tracking-wider text-amber-300 uppercase border border-white/10 mb-4">
              <Landmark className="w-3.5 h-3.5" />
              <span>Koperasi Warga RW 05</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Simpan Pinjam & Tagihan
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
              Pencatatan simpanan wajib & sukarela warga, angsuran pinjaman, serta verifikasi bukti pelunasan anggota.
            </p>
          </div>
          <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-amber-200">
            <span>Bendahara: <strong className="text-white">{currentUser.nama}</strong></span>
            <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
              Unit Koperasi RW
            </span>
          </div>
        </div>

        {/* Bento 2: Total Simpanan Terkumpul */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Simpanan Terkumpul</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono">
              Rp {totalSimpananTerkumpul.toLocaleString('id-ID')}
            </div>
            <div className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <span>Dana simpanan terverifikasi</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>Status Kas Koperasi</span>
            <span className="font-bold text-amber-600">Produktif</span>
          </div>
        </div>

        {/* Bento 3: Piutang / Belum Lunas */}
        <div className="col-span-6 sm:col-span-3 lg:col-span-2 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Piutang Aktif</span>
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-rose-600 tracking-tight font-mono">
              Rp {totalPiutangBelumLunas.toLocaleString('id-ID')}
            </div>
            <div className="text-xs text-rose-500 font-semibold mt-0.5">
              Belum Dilunasi
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            {koperasi.filter(k => k.status === 'belum_lunas').length} Tagihan Terbuka
          </div>
        </div>

        {/* Bento 4: Total Anggota Terdaftar */}
        <div className="col-span-6 sm:col-span-3 lg:col-span-2 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Anggota</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {warga.length} <span className="text-sm font-semibold text-slate-400">Warga</span>
            </div>
            <div className="text-xs text-indigo-600 font-semibold mt-0.5">
              Basis Nasabah
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            RT 01 s/d RT 04
          </div>
        </div>
      </div>

      {/* BENTO 5: DATA TABLE & FILTER SECTION */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama warga, rumah, keterangan..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:ring-2 focus:ring-amber-600 focus:outline-none"
              />
            </div>

            <select
              value={filterJenis}
              onChange={(e) => setFilterJenis(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-amber-600 focus:outline-none"
            >
              <option value="all">Semua Jenis Transaksi</option>
              <option value="simpanan_wajib">Simpanan Wajib</option>
              <option value="simpanan_pokok">Simpanan Pokok</option>
              <option value="simpanan_sukarela">Simpanan Sukarela</option>
              <option value="angsuran_pinjaman">Angsuran Pinjaman</option>
              <option value="jasa_pinjaman">Jasa Pinjaman</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e: any) => setFilterStatus(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-amber-600 focus:outline-none"
            >
              <option value="all">Semua Status</option>
              <option value="belum_lunas">Belum Lunas</option>
              <option value="lunas">Lunas</option>
            </select>
          </div>

          <button
            id="btn-add-koperasi"
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Input Tagihan / Simpanan</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-400 text-[10px] uppercase font-bold border-b border-slate-100">
              <tr>
                <th className="p-3.5">Warga & No. Rumah</th>
                <th className="p-3.5">Jenis Transaksi</th>
                <th className="p-3.5">Periode / Keterangan</th>
                <th className="p-3.5 text-right">Nominal</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Aksi Pelunasan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredKoperasi.map((k) => {
                const isLunas = k.status === 'lunas';
                return (
                  <tr key={k.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{k.nama_warga}</div>
                      <div className="text-[11px] text-slate-400">Rumah {k.no_rumah}</div>
                    </td>
                    <td className="p-3.5">{getJenisBadge(k.jenis_transaksi)}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-800">{k.bulan_tahun}</div>
                      <div className="text-[11px] text-slate-400">
                        {k.keterangan || `Jatuh tempo: ${k.jatuh_tempo || '-'}`}
                      </div>
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-slate-900">
                      Rp {k.nominal.toLocaleString('id-ID')}
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          isLunas
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {isLunas ? 'Lunas' : 'Belum Lunas'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      {!isLunas ? (
                        <button
                          onClick={() => onMarkKoperasiLunas(k.id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition inline-flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Tandai Lunas</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 flex items-center justify-end gap-1 font-mono">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          {k.tanggal_bayar || 'Lunas'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Input Koperasi */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Landmark className="w-5 h-5 text-amber-600" />
              Input Simpanan / Tagihan Koperasi
            </h3>
            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold block mb-1 text-slate-700">Pilih Warga Anggota</label>
                <select
                  value={selectedWargaId}
                  onChange={(e) => setSelectedWargaId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-amber-600 focus:outline-none"
                >
                  {warga.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.nama} (Rumah {w.no_rumah} - RT {w.rt})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1 text-slate-700">Jenis Simpanan / Tagihan</label>
                <select
                  value={jenisTransaksi}
                  onChange={(e: any) => setJenisTransaksi(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-amber-600 focus:outline-none"
                >
                  <option value="simpanan_wajib">Simpanan Wajib</option>
                  <option value="simpanan_pokok">Simpanan Pokok</option>
                  <option value="simpanan_sukarela">Simpanan Sukarela</option>
                  <option value="angsuran_pinjaman">Angsuran Pinjaman</option>
                  <option value="jasa_pinjaman">Jasa / Bagi Hasil Pinjaman</option>
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1 text-slate-700">Nominal (Rupiah)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 font-bold text-slate-400">Rp</span>
                  <input
                    type="number"
                    required
                    min={5000}
                    step={5000}
                    value={nominal}
                    onChange={(e) => setNominal(Number(e.target.value))}
                    className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold text-sm focus:bg-white focus:ring-2 focus:ring-amber-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1 text-slate-700">Bulan / Periode</label>
                  <input
                    type="text"
                    required
                    value={bulanTahun}
                    onChange={(e) => setBulanTahun(e.target.value)}
                    placeholder="Maret 2026"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-600 focus:outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1 text-slate-700">Batas Jatuh Tempo</label>
                  <input
                    type="date"
                    required
                    value={jatuhTempo}
                    onChange={(e) => setJatuhTempo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-600 focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1 text-slate-700">Status Awal</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatusAwal('belum_lunas')}
                    className={`py-2 rounded-xl border font-bold text-xs transition ${
                      statusAwal === 'belum_lunas'
                        ? 'bg-rose-50 text-rose-700 border-rose-300 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    Belum Lunas (Tagihan)
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusAwal('lunas')}
                    className={`py-2 rounded-xl border font-bold text-xs transition ${
                      statusAwal === 'lunas'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    Sudah Lunas
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1 text-slate-700">Keterangan Tambahan (Opsional)</label>
                <input
                  type="text"
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  placeholder="Misal: Cicilan ke-3 dari 10"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-600 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs transition"
                >
                  Simpan ke Koperasi
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
