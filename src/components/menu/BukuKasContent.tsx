import React, { useState } from 'react';
import { UserRole, KasRW } from '../../types';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Search,
  Calendar,
  FileCheck,
  Plus,
  Trash2,
  Edit2,
  Lock,
} from 'lucide-react';

interface BukuKasContentProps {
  activeRole: UserRole;
  kasRW: KasRW[];
  onAddKas?: (data: Partial<KasRW>) => void;
  onUpdateKas?: (id: string, data: Partial<KasRW>) => void;
  onDeleteKas?: (id: string) => void;
}

export const BukuKasContent: React.FC<BukuKasContentProps> = ({
  activeRole,
  kasRW = [],
  onAddKas,
  onUpdateKas,
  onDeleteKas,
}) => {
  // Pengecekan role yang lebih fleksibel (menangani BENDAHARA_RW, bendahara_rw, bendahara, rw, admin)
  const roleStr = String(activeRole || '').toLowerCase();
  const canEdit =
    roleStr.includes('bendahara') ||
    roleStr.includes('admin') ||
    roleStr.includes('rw') ||
    roleStr === 'pengurus';

  const [filterType, setFilterType] = useState<'all' | 'masuk' | 'keluar'>('all');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    kategori: 'Iuran Warga',
    keterangan: '',
    nominal: 0,
    jenis: 'masuk' as 'masuk' | 'keluar',
    no_bukti: '',
  });

  // Perhitungan total
  const totalPemasukan = kasRW
    .filter((k) => k.jenis === 'masuk')
    .reduce((sum, k) => sum + (Number(k.nominal || k.jumlah) || 0), 0);

  const totalPengeluaran = kasRW
    .filter((k) => k.jenis === 'keluar')
    .reduce((sum, k) => sum + (Number(k.nominal || k.jumlah) || 0), 0);

  const saldoKas = totalPemasukan - totalPengeluaran;

  const filteredKas = kasRW.filter((item) => {
    const matchType = filterType === 'all' || item.jenis === filterType;
    const matchSearch =
      (item.keterangan || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.kategori || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.no_bukti && item.no_bukti.toLowerCase().includes(search.toLowerCase()));
    return matchType && matchSearch;
  });

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({
      tanggal: item.tanggal || new Date().toISOString().split('T')[0],
      kategori: item.kategori || 'Iuran Warga',
      keterangan: item.keterangan || item.deskripsi || '',
      nominal: Number(item.nominal || item.jumlah) || 0,
      jenis: item.jenis || item.tipe || 'masuk',
      no_bukti: item.no_bukti || '',
    });
    setShowForm(true);
  };

  const handleResetForm = () => {
    setEditingId(null);
    setFormData({
      tanggal: new Date().toISOString().split('T')[0],
      kategori: 'Iuran Warga',
      keterangan: '',
      nominal: 0,
      jenis: 'masuk',
      no_bukti: '',
    });
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      if (onUpdateKas) onUpdateKas(editingId, formData);
    } else {
      if (onAddKas) onAddKas(formData);
    }
    handleResetForm();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus catatan kas ini?')) {
      if (onDeleteKas) onDeleteKas(id);
    }
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Indicator Hak Akses */}
      <div className="flex justify-between items-center bg-slate-100 p-2 rounded-xl text-[11px]">
        <span className="text-slate-600 font-medium">
          Akses Saat Ini: <strong className="uppercase text-slate-800">{activeRole}</strong>
        </span>
        <span className="flex items-center gap-1 font-bold">
          {canEdit ? (
            <span className="text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
              Mode Edit (Bendahara/Pengurus)
            </span>
          ) : (
            <span className="text-slate-500 bg-slate-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
              <Lock className="w-3 h-3" /> Hanya Melihat (Warga)
            </span>
          )}
        </span>
      </div>

      {/* Cards Ringkasan Saldo */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="font-bold text-[10px] uppercase">Saldo Kas</span>
            <Wallet className="w-4 h-4" />
          </div>
          <div className="mt-2 font-mono font-black text-emerald-900 text-sm sm:text-base">
            Rp {saldoKas.toLocaleString('id-ID')}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-blue-700">
            <span className="font-bold text-[10px] uppercase">Pemasukan</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="mt-2 font-mono font-bold text-blue-900 text-xs sm:text-sm">
            Rp {totalPemasukan.toLocaleString('id-ID')}
          </div>
        </div>

        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-rose-700">
            <span className="font-bold text-[10px] uppercase">Pengeluaran</span>
            <TrendingDown className="w-4 h-4" />
          </div>
          <div className="mt-2 font-mono font-bold text-rose-900 text-xs sm:text-sm">
            Rp {totalPengeluaran.toLocaleString('id-ID')}
          </div>
        </div>
      </div>

      {/* Tombol Tambah Transaksi (Khusus Bendahara) */}
      {canEdit && (
        <div className="flex justify-end">
          <button
            onClick={() => {
              if (showForm) handleResetForm();
              else setShowForm(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            {showForm ? 'Batal' : 'Tambah Catatan Kas'}
          </button>
        </div>
      )}

      {/* Form Input / Edit (Khusus Bendahara/Pengurus) */}
      {canEdit && showForm && (
        <form onSubmit={handleSubmit} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
          <div className="font-bold text-slate-800 text-xs">
            {editingId ? 'Edit Transaksi Kas' : 'Tambah Transaksi Kas Baru'}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">Jenis Transaksi</label>
              <select
                value={formData.jenis}
                onChange={(e) => setFormData({ ...formData, jenis: e.target.value as any })}
                className="w-full p-2 border border-slate-200 rounded-xl bg-white text-xs font-semibold"
              >
                <option value="masuk">Pemasukan (+)</option>
                <option value="keluar">Pengeluaran (-)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">Tanggal</label>
              <input
                type="date"
                value={formData.tanggal}
                onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-xl bg-white text-xs"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">Kategori</label>
              <input
                type="text"
                value={formData.kategori}
                onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                placeholder="Contoh: Iuran, Pembangunan..."
                className="w-full p-2 border border-slate-200 rounded-xl bg-white text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">Nominal (Rp)</label>
              <input
                type="number"
                value={formData.nominal || ''}
                onChange={(e) => setFormData({ ...formData, nominal: Number(e.target.value) })}
                placeholder="0"
                className="w-full p-2 border border-slate-200 rounded-xl bg-white text-xs font-mono font-bold"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">Keterangan / Uraian</label>
              <input
                type="text"
                value={formData.keterangan}
                onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                placeholder="Detail transaksi..."
                className="w-full p-2 border border-slate-200 rounded-xl bg-white text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">No. Bukti (Opsional)</label>
              <input
                type="text"
                value={formData.no_bukti}
                onChange={(e) => setFormData({ ...formData, no_bukti: e.target.value })}
                placeholder="No. Kwitansi / Nota"
                className="w-full p-2 border border-slate-200 rounded-xl bg-white text-xs font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={handleResetForm}
              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 rounded-xl text-slate-700 font-bold transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition"
            >
              Simpan Transaksi
            </button>
          </div>
        </form>
      )}

      {/* Filter & Pencarian */}
      <div className="flex flex-col sm:flex-row gap-2 justify-between items-center">
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari keterangan, bukti..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`flex-1 sm:flex-none px-3 py-1 text-[11px] font-bold rounded-lg transition ${
              filterType === 'all'
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setFilterType('masuk')}
            className={`flex-1 sm:flex-none px-3 py-1 text-[11px] font-bold rounded-lg transition ${
              filterType === 'masuk'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Masuk
          </button>
          <button
            onClick={() => setFilterType('keluar')}
            className={`flex-1 sm:flex-none px-3 py-1 text-[11px] font-bold rounded-lg transition ${
              filterType === 'keluar'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Keluar
          </button>
        </div>
      </div>

      {/* Tabel Mutasi Kas */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-80 overflow-y-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-bold sticky top-0 border-b border-slate-200">
            <tr>
              <th className="p-2.5">Tanggal</th>
              <th className="p-2.5">Kategori & Uraian</th>
              <th className="p-2.5 text-right">Nominal</th>
              {canEdit && <th className="p-2.5 text-center">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredKas.length === 0 ? (
              <tr>
                <td colSpan={canEdit ? 4 : 3} className="p-6 text-center text-slate-400">
                  Tidak ada catatan kas.
                </td>
              </tr>
            ) : (
              filteredKas.map((item) => {
                const isMasuk = (item.jenis || item.tipe) === 'masuk';
                const nominal = Number(item.nominal || item.jumlah) || 0;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="p-2.5 whitespace-nowrap">
                      <div className="font-bold text-slate-700 flex items-center gap-1 text-[11px]">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {item.tanggal}
                      </div>
                      {item.no_bukti && (
                        <div className="text-[10px] text-slate-400 font-mono flex items-center gap-0.5 mt-0.5">
                          <FileCheck className="w-2.5 h-2.5" />
                          {item.no_bukti}
                        </div>
                      )}
                    </td>
                    <td className="p-2.5">
                      <div className="inline-block px-1.5 py-0.5 bg-slate-100 text-slate-600 font-bold text-[9px] rounded mb-0.5">
                        {item.kategori || 'Umum'}
                      </div>
                      <div className="font-semibold text-slate-800 text-xs">
                        {item.keterangan || item.deskripsi}
                      </div>
                    </td>
                    <td className="p-2.5 text-right font-mono font-bold whitespace-nowrap">
                      <span className={isMasuk ? 'text-emerald-600' : 'text-rose-600'}>
                        {isMasuk ? '+' : '-'} Rp {nominal.toLocaleString('id-ID')}
                      </span>
                    </td>
                    {canEdit && (
                      <td className="p-2.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                            title="Edit Catatan"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition cursor-pointer"
                            title="Hapus Catatan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};