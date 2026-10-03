import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../supabaseClient';
import { UserRole } from '../../types';
import { Search, Loader2, Users, AlertCircle, Plus, Trash2, UserPlus, Pencil } from 'lucide-react';

interface DataWargaContentProps {
  activeRole: UserRole | string;
  wargaList?: any[];
}

export const DataWargaContent: React.FC<DataWargaContentProps> = ({ activeRole }) => {
  const [warga, setWarga] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // State Modal Tambah Warga
  const [showAddModal, setShowAddModal] = useState(false);
  const [nama, setNama] = useState('');
  const [blok, setBlok] = useState('');
  const [rt, setRt] = useState('03');
  const [rw, setRw] = useState('44');
  const [submitting, setSubmitting] = useState(false);

  // State Modal Edit Warga
  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editNama, setEditNama] = useState('');
  const [editBlok, setEditBlok] = useState('');
  const [editRt, setEditRt] = useState('03');
  const [editRw, setEditRw] = useState('44');
  const [updating, setUpdating] = useState(false);

  // Hak akses CRUD Data Warga untuk Super Admin dan Sekretaris
  const canManage = activeRole === 'super_admin' || activeRole === 'sekretaris';

  const fetchWarga = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('warga').select('*').order('nama', { ascending: true });
      if (!error && data) {
        setWarga(data);
      } else {
        console.error('Error fetching warga:', error);
      }
    } catch (err) {
      console.error('Gagal mengambil data warga:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarga();
  }, []);

  // Handle Tambah Data Warga
  const handleAddWarga = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) return;

    setSubmitting(true);
    try {
      const formBlok = blok.trim().toUpperCase() || '-';
      const newWarga = {
        nama: nama.trim().toUpperCase(),
        blok: formBlok,
        no_rumah: formBlok,
        rt: rt || '03',
        rw: rw || '44',
      };

      const { error } = await supabase.from('warga').insert([newWarga]);

      if (error) {
        alert(`Gagal menambah warga: ${error.message}`);
      } else {
        alert('Data warga berhasil ditambahkan!');
        setNama('');
        setBlok('');
        setShowAddModal(false);
        fetchWarga();
      }
    } catch (err: any) {
      alert(`Terjadi kesalahan: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Membuka Modal Edit dan mengisi form dengan data warga yang dipilih
  const openEditModal = (item: any) => {
    setEditId(item.id);
    setEditNama(item.nama || item.nama_lengkap || '');
    setEditBlok(item.blok || item.no_rumah || '');
    setEditRt(item.rt || '03');
    setEditRw(item.rw || '44');
    setShowEditModal(true);
  };

  // Handle Simpan Perubahan Edit Warga
  const handleUpdateWarga = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId || !editNama.trim()) return;

    setUpdating(true);
    try {
      const formBlok = editBlok.trim().toUpperCase() || '-';
      const updatedWarga = {
        nama: editNama.trim().toUpperCase(),
        blok: formBlok,
        no_rumah: formBlok,
        rt: editRt || '03',
        rw: editRw || '44',
      };

      const { error } = await supabase
        .from('warga')
        .update(updatedWarga)
        .eq('id', editId);

      if (error) {
        alert(`Gagal memperbarui warga: ${error.message}`);
      } else {
        alert('Data warga berhasil diperbarui!');
        setShowEditModal(false);
        fetchWarga();
      }
    } catch (err: any) {
      alert(`Terjadi kesalahan: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  // Handle Hapus Data Warga
  const handleDeleteWarga = async (id: string, namaWarga: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus data warga "${namaWarga}"?`)) return;

    try {
      const { error } = await supabase.from('warga').delete().eq('id', id);

      if (error) {
        alert(`Gagal menghapus data: ${error.message}`);
      } else {
        setWarga((prev) => prev.filter((item) => item.id !== id));
        alert('Data warga berhasil dihapus!');
      }
    } catch (err: any) {
      alert(`Terjadi kesalahan: ${err.message}`);
    }
  };

  const filteredWarga = useMemo(() => {
    return warga.filter((w) => {
      const namaW = (w.nama || w.nama_lengkap || '').toLowerCase();
      const blokW = (w.blok || w.no_rumah || '').toLowerCase();
      const q = searchQuery.toLowerCase();
      return namaW.includes(q) || blokW.includes(q);
    });
  }, [warga, searchQuery]);

  return (
    <div className="space-y-3 text-xs">
      {/* Header Ringkasan */}
      <div className="bg-slate-800 text-white p-3.5 rounded-2xl flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <Users className="w-5 h-5 text-blue-400" />
          <div>
            <h4 className="font-extrabold text-xs">Daftar Warga RT/RW</h4>
            <p className="text-[10px] text-slate-400">Informasi direktori warga terdaftar</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canManage && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded-xl font-bold text-[10px] flex items-center gap-1 transition cursor-pointer"
            >
              <Plus className="w-3 h-3" /> Tambah Warga
            </button>
          )}
          <span className="bg-slate-700 text-blue-300 px-2.5 py-1 rounded-xl font-bold text-[10px]">
            {warga.length} Warga
          </span>
        </div>
      </div>

      {/* Bar Pencarian */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder="Cari nama warga atau nomor blok..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-xs font-medium"
        />
      </div>

      {/* Tabel Data Warga */}
      {loading ? (
        <div className="flex justify-center py-8 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
          <div className="max-h-[350px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-[10px] font-extrabold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3 text-center w-8">NO</th>
                  <th className="py-2.5 px-3">NAMA WARGA</th>
                  <th className="py-2.5 px-3 text-center">BLOK</th>
                  <th className="py-2.5 px-3 text-center">RT/RW</th>
                  {canManage && <th className="py-2.5 px-3 text-center w-20">AKSI</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                {filteredWarga.length === 0 ? (
                  <tr>
                    <td colSpan={canManage ? 5 : 4} className="py-8 text-center text-slate-400">
                      <AlertCircle className="w-6 h-6 mx-auto mb-1 opacity-40" />
                      <p className="font-medium">Warga tidak ditemukan.</p>
                    </td>
                  </tr>
                ) : (
                  filteredWarga.map((item, index) => (
                    <tr key={item.id || index} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-3 text-center font-bold text-slate-400">{index + 1}</td>
                      <td className="py-2.5 px-3 font-extrabold text-slate-800 uppercase">
                        {item.nama || item.nama_lengkap || '-'}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="bg-slate-100 border border-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded text-[10px]">
                          {item.blok || item.no_rumah || '-'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-semibold text-slate-500">
                        {item.rt || '03'} / {item.rw || '44'}
                      </td>
                      {canManage && (
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => openEditModal(item)}
                              className="p-1 rounded-lg text-amber-600 hover:bg-amber-50 hover:text-amber-800 transition cursor-pointer"
                              title="Edit Warga"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteWarga(item.id, item.nama || item.nama_lengkap)}
                              className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition cursor-pointer"
                              title="Hapus Warga"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Tambah Warga */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-4 w-full max-w-sm border border-slate-100 shadow-xl space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <UserPlus className="w-5 h-5 text-blue-600" />
              <h3 className="font-extrabold text-slate-800 text-xs">Tambah Data Warga Baru</h3>
            </div>
            <form onSubmit={handleAddWarga} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Blok Rmh</label>
                  <input
                    type="text"
                    placeholder="B.12"
                    value={blok}
                    onChange={(e) => setBlok(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-blue-500 uppercase"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">RT</label>
                  <input
                    type="text"
                    value={rt}
                    onChange={(e) => setRt(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">RW</label>
                  <input
                    type="text"
                    value={rw}
                    onChange={(e) => setRw(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 flex items-center justify-center gap-1 cursor-pointer"
                >
                  {submitting && <Loader2 className="w-3 h-3 animate-spin" />} Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Warga */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-4 w-full max-w-sm border border-slate-100 shadow-xl space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Pencil className="w-5 h-5 text-amber-600" />
              <h3 className="font-extrabold text-slate-800 text-xs">Edit Data Warga</h3>
            </div>
            <form onSubmit={handleUpdateWarga} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={editNama}
                  onChange={(e) => setEditNama(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-amber-500"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Blok Rmh</label>
                  <input
                    type="text"
                    value={editBlok}
                    onChange={(e) => setEditBlok(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-amber-500 uppercase"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">RT</label>
                  <input
                    type="text"
                    value={editRt}
                    onChange={(e) => setEditRt(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">RW</label>
                  <input
                    type="text"
                    value={editRw}
                    onChange={(e) => setEditRw(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-amber-500"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="w-1/2 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="w-1/2 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 flex items-center justify-center gap-1 cursor-pointer"
                >
                  {updating && <Loader2 className="w-3 h-3 animate-spin" />} Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};