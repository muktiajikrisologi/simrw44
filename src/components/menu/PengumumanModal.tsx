import React, { useState } from 'react';
import { useRWStore } from '../../hooks/useRWStore';
import { X, Bell, Plus, Edit3, Trash2, Calendar } from 'lucide-react';

interface PengumumanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PengumumanModal: React.FC<PengumumanModalProps> = ({ isOpen, onClose }) => {
  const {
    notulen,
    currentUser,
    addNotulen,
    updateNotulen,
    deleteNotulen,
  } = useRWStore();

  const [activeTab, setActiveTab] = useState<'daftar' | 'tambah'>('daftar');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [judul, setJudul] = useState('');
  const [konten, setKonten] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('published');

  if (!isOpen) return null;

  const isSekretarisOrAdmin =
    currentUser?.role === 'sekretaris' ||
    currentUser?.role === 'super_admin' ||
    currentUser?.role === 'ketua_rw';

  // Filter khusus kategori 'pengumuman'
  const pengumumanList = notulen.filter((item) => {
    const isPengumuman = item.kategori?.toLowerCase() === 'pengumuman';
    if (!isSekretarisOrAdmin) {
      return isPengumuman && item.status === 'published';
    }
    return isPengumuman;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul || !konten) return;

    if (editingId) {
      updateNotulen(editingId, { judul, konten, status, kategori: 'pengumuman' });
      setEditingId(null);
    } else {
      addNotulen({
        judul,
        konten,
        kategori: 'pengumuman',
        status,
        tanggal: new Date().toISOString().split('T')[0],
      });
    }

    setJudul('');
    setKonten('');
    setActiveTab('daftar');
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setJudul(item.judul);
    setKonten(item.konten);
    setStatus(item.status || 'published');
    setActiveTab('tambah');
  };

  const resetForm = () => {
    setEditingId(null);
    setJudul('');
    setKonten('');
    setStatus('published');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Pengumuman Warga</h3>
              <p className="text-xs text-slate-500">Layanan RW 44 Terpadu</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tab */}
        {isSekretarisOrAdmin && (
          <div className="flex border-b bg-slate-50 px-4 pt-2 gap-2">
            <button
              onClick={() => { setActiveTab('daftar'); resetForm(); }}
              className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors ${
                activeTab === 'daftar'
                  ? 'bg-white text-amber-600 border-t border-x border-slate-200'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Daftar Pengumuman ({pengumumanList.length})
            </button>
            <button
              onClick={() => { setActiveTab('tambah'); resetForm(); }}
              className={`flex items-center gap-1 px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors ${
                activeTab === 'tambah'
                  ? 'bg-white text-amber-600 border-t border-x border-slate-200'
                  : 'text-amber-600 hover:text-amber-700'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              {editingId ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {activeTab === 'tambah' && isSekretarisOrAdmin ? (
            /* Form Tambah/Edit Pengumuman */
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Judul Pengumuman</label>
                <input
                  type="text"
                  required
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  placeholder="Contoh: Kerja Bakti Kebersihan Lingkungan RT 02"
                  className="w-full border rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Isi Pengumuman</label>
                <textarea
                  required
                  rows={6}
                  value={konten}
                  onChange={(e) => setKonten(e.target.value)}
                  placeholder="Tulis pesan atau pengumuman lengkap untuk warga..."
                  className="w-full border rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status Publikasi</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full border rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  <option value="published">Published (Tampil di Warga)</option>
                  <option value="draft">Draft (Hanya Pengurus)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setActiveTab('daftar'); resetForm(); }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 border rounded-lg hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700"
                >
                  {editingId ? 'Update Pengumuman' : 'Terbitkan Pengumuman'}
                </button>
              </div>
            </form>
          ) : (
            /* Daftar Pengumuman */
            <>
              {pengumumanList.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  Belum ada pengumuman yang ditambahkan.
                </div>
              ) : (
                pengumumanList.map((item) => (
                  <div
                    key={item.id}
                    className="border border-slate-100 bg-amber-50/30 rounded-xl p-3.5 hover:border-amber-200 transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="font-bold text-slate-800 text-xs leading-snug">{item.judul}</h4>
                      {isSekretarisOrAdmin && (
                        <div className="flex items-center gap-1.5 ml-2">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                              item.status === 'published'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {item.status}
                          </span>
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteNotulen(item.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {item.tanggal || 'Terbaru'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed pt-1 border-t border-slate-100">
                      {item.konten}
                    </p>
                  </div>
                ))
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs hover:bg-slate-300 transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};