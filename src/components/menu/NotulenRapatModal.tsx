import React, { useState } from 'react';
import { useRWStore } from '../../hooks/useRWStore';
import { getSupabase } from '../../lib/supabase';
import { X, BookOpen, Plus, Edit3, Trash2, Calendar, Loader2 } from 'lucide-react';

interface NotulenRapatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotulenRapatModal: React.FC<NotulenRapatModalProps> = ({ isOpen, onClose }) => {
  const store = useRWStore();
  const {
    notulen,
    currentUser,
    addNotulen,
    updateNotulen,
    deleteNotulen,
    supabaseConnected,
    syncWithSupabase,
  } = store;

  const [activeTab, setActiveTab] = useState<'daftar' | 'tambah'>('daftar');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form State
  const [tanggal, setTanggal] = useState<string>(new Date().toISOString().split('T')[0]);
  const [judul, setJudul] = useState('');
  const [isi, setIsi] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('published');

  if (!isOpen) return null;

  const isSekretarisOrAdmin =
    currentUser?.role === 'sekretaris' ||
    currentUser?.role === 'super_admin' ||
    currentUser?.role === 'ketua_rw';

  // Filter tampilan sesuai role
  const notulenList = notulen.filter((item) => {
    if (!isSekretarisOrAdmin) {
      return item.status === 'published';
    }
    return true;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul || !isi || !tanggal) return;

    setLoading(true);
    const client = getSupabase();

    try {
      if (supabaseConnected && client) {
        if (editingId) {
          // UPDATE ke Supabase
          const { error } = await client
            .from('notulen')
            .update({
              tanggal,
              judul,
              isi,
              status,
            })
            .eq('id', String(editingId));

          if (error) throw error;
        } else {
          // INSERT ke Supabase
          const { error } = await client.from('notulen').insert([
            {
              id: crypto.randomUUID(),
              tanggal,
              judul,
              isi,
              status,
            },
          ]);

          if (error) throw error;
        }

        // Synchronize state lokal dari Supabase
        await syncWithSupabase();
      } else {
        // Fallback simpan lokal jika offline
        if (editingId) {
          updateNotulen(editingId, { tanggal, judul, konten: isi, status });
        } else {
          addNotulen({
            tanggal,
            judul,
            konten: isi,
            status,
          });
        }
      }

      resetForm();
      setActiveTab('daftar');
    } catch (err: any) {
      alert('Gagal menyimpan notulen: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus notulen ini?')) return;

    setLoading(true);
    const client = getSupabase();

    try {
      if (supabaseConnected && client) {
        const { error } = await client
          .from('notulen')
          .delete()
          .eq('id', String(id));

        if (error) throw error;

        // Hapus dari state lokal & reload dari Supabase
        deleteNotulen(id);
        await syncWithSupabase();
      } else {
        deleteNotulen(id);
      }
    } catch (err: any) {
      alert('Gagal menghapus notulen dari Supabase: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setTanggal(item.tanggal || new Date().toISOString().split('T')[0]);
    setJudul(item.judul);
    setIsi(item.isi || item.konten || '');
    setStatus(item.status || 'published');
    setActiveTab('tambah');
  };

  const resetForm = () => {
    setEditingId(null);
    setTanggal(new Date().toISOString().split('T')[0]);
    setJudul('');
    setIsi('');
    setStatus('published');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Notulen Rapat</h3>
              <p className="text-xs text-slate-500">
                Layanan RW 44 Terpadu {supabaseConnected ? '• Supabase Terhubung' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tab */}
        {isSekretarisOrAdmin && (
          <div className="flex border-b bg-slate-50 px-4 pt-2 gap-2">
            <button
              onClick={() => { setActiveTab('daftar'); resetForm(); }}
              disabled={loading}
              className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors ${
                activeTab === 'daftar'
                  ? 'bg-white text-emerald-600 border-t border-x border-slate-200'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Daftar Notulen ({notulenList.length})
            </button>
            <button
              onClick={() => { setActiveTab('tambah'); resetForm(); }}
              disabled={loading}
              className={`flex items-center gap-1 px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors ${
                activeTab === 'tambah'
                  ? 'bg-white text-emerald-600 border-t border-x border-slate-200'
                  : 'text-emerald-600 hover:text-emerald-700'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              {editingId ? 'Edit Notulen' : 'Buat Notulen Baru'}
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {activeTab === 'tambah' && isSekretarisOrAdmin ? (
            /* Form Tambah/Edit Notulen */
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Rapat</label>
                <input
                  type="date"
                  required
                  disabled={loading}
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full border rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-emerald-500 outline-none disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Judul Rapat</label>
                <input
                  type="text"
                  required
                  disabled={loading}
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  placeholder="Contoh: Hasil Musyawarah Pembentukan Panitia 17-an"
                  className="w-full border rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-emerald-500 outline-none disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Hasil & Isi Notulen</label>
                <textarea
                  required
                  rows={5}
                  disabled={loading}
                  value={isi}
                  onChange={(e) => setIsi(e.target.value)}
                  placeholder="Tuliskan poin-poin hasil keputusan rapat di sini..."
                  className="w-full border rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-emerald-500 outline-none disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status Publikasi</label>
                <select
                  value={status}
                  disabled={loading}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full border rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-emerald-500 outline-none disabled:bg-slate-50"
                >
                  <option value="published">Published (Tampil di Warga)</option>
                  <option value="draft">Draft (Hanya Pengurus)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => { setActiveTab('daftar'); resetForm(); }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 border rounded-lg hover:bg-slate-50 disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingId ? 'Update Notulen' : 'Simpan & Terbitkan'}
                </button>
              </div>
            </form>
          ) : (
            /* Daftar Notulen Rapat */
            <>
              {notulenList.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  Belum ada notulen rapat yang ditambahkan.
                </div>
              ) : (
                notulenList.map((item) => (
                  <div
                    key={item.id}
                    className="border border-slate-100 bg-slate-50/50 rounded-xl p-3.5 hover:border-emerald-200 transition-all space-y-2"
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
                            disabled={loading}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded disabled:opacity-50"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={loading}
                            className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {item.tanggal || 'Tanpa Tanggal'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed pt-1 border-t border-slate-100">
                      {item.isi || item.konten}
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
            disabled={loading}
            className="w-full sm:w-auto px-5 py-2 bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs hover:bg-slate-300 transition-colors disabled:opacity-50"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};