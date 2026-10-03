import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { UserRole } from '../../types';
import { Loader2, FileText, Newspaper, Plus, Trash2 } from 'lucide-react';

interface ComponentProps {
  activeRole: UserRole;
}

export const BeritaWargaContent: React.FC<ComponentProps> = ({ activeRole }) => {
  const [activeTab, setActiveTab] = useState<'berita' | 'notulen'>('berita');
  const [beritaList, setBeritaList] = useState<any[]>([]);
  const [notulenList, setNotulenList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [judul, setJudul] = useState('');
  const [isi, setIsi] = useState('');
  const [tanggal, setTanggal] = useState('');

  // Hak akses hanya untuk super_admin dan sekretaris
  const canEdit = activeRole === 'super_admin' || activeRole === 'sekretaris';

  const fetchData = async () => {
    setLoading(true);
    const { data: bData } = await supabase
      .from('berita')
      .select('*')
      .order('created_at', { ascending: false });
    if (bData) setBeritaList(bData);

    const { data: nData } = await supabase
      .from('notulen')
      .select('*')
      .order('created_at', { ascending: false });
    if (nData) setNotulenList(nData);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit || !judul || !isi) return;

    const table = activeTab === 'berita' ? 'berita' : 'notulen';
    const payload = activeTab === 'berita' 
      ? { judul, isi, tanggal: tanggal || new Date().toISOString().split('T')[0] }
      : { judul, isi, tanggal: tanggal || new Date().toISOString().split('T')[0], pembuat: activeRole === 'super_admin' ? 'Super Admin' : 'Sekretaris' };

    const { error } = await supabase.from(table).insert([payload]);

    if (!error) {
      setJudul('');
      setIsi('');
      setTanggal('');
      setShowForm(false);
      fetchData();
    }
  };

  const handleDelete = async (id: string) => {
    if (!canEdit) return;
    const table = activeTab === 'berita' ? 'berita' : 'notulen';
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (!error) fetchData();
  };

  return (
    <div className="space-y-3 text-xs">
      {/* Header Actions & Navigation */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex bg-slate-100 p-1 rounded-xl flex-1">
          <button
            onClick={() => { setActiveTab('berita'); setShowForm(false); }}
            className={`flex-1 py-1.5 font-bold rounded-lg flex items-center justify-center gap-1.5 transition ${
              activeTab === 'berita' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            Berita Warga
          </button>
          <button
            onClick={() => { setActiveTab('notulen'); setShowForm(false); }}
            className={`flex-1 py-1.5 font-bold rounded-lg flex items-center justify-center gap-1.5 transition ${
              activeTab === 'notulen' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Notulen Rapat
          </button>
        </div>

        {/* Tombol Tambah khusus Super Admin & Sekretaris */}
        {canEdit && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1 text-xs font-bold bg-indigo-600 text-white px-3 py-2 rounded-xl hover:bg-indigo-700 transition shadow-xs whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            {showForm ? 'Batal' : 'Tambah'}
          </button>
        )}
      </div>

      {/* Form Tambah Berita / Notulen */}
      {canEdit && showForm && (
        <form onSubmit={handleAdd} className="p-3 border border-indigo-100 bg-indigo-50/50 rounded-2xl space-y-2 text-xs animate-in fade-in">
          <h4 className="font-bold text-slate-700">
            Tambah {activeTab === 'berita' ? 'Berita Warga' : 'Notulen Rapat'}
          </h4>
          <div>
            <label className="font-bold text-slate-600">Judul</label>
            <input
              type="text"
              placeholder={activeTab === 'berita' ? "Misal: Kerja Bakti Hari Minggu" : "Misal: Rapat Pleno Bulanan"}
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label className="font-bold text-slate-600">Tanggal</label>
            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="font-bold text-slate-600">Isi Konten</label>
            <textarea
              rows={3}
              placeholder="Tuliskan detail informasi di sini..."
              value={isi}
              onChange={(e) => setIsi(e.target.value)}
              className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
              required
            />
          </div>
          <button type="submit" className="w-full py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-xs">
            Simpan {activeTab === 'berita' ? 'Berita' : 'Notulen'}
          </button>
        </form>
      )}

      {/* Loading Indicator */}
      {loading ? (
        <div className="flex justify-center py-6 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : activeTab === 'berita' ? (
        /* TAB: BERITA WARGA */
        <div className="space-y-2 animate-in fade-in">
          {beritaList.length === 0 ? (
            <p className="text-center text-slate-400 py-4">Belum ada berita warga.</p>
          ) : (
            beritaList.map((item) => (
              <div key={item.id} className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 space-y-1 relative group">
                <div className="flex justify-between items-start">
                  <span className="text-[9px] text-blue-600 font-bold">{item.tanggal || 'Terbaru'}</span>
                  {canEdit && (
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-rose-500 hover:bg-rose-50 p-1 rounded-md transition"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <h4 className="font-bold text-slate-800">{item.judul}</h4>
                <p className="text-slate-600 text-[11px] leading-relaxed whitespace-pre-line">{item.isi}</p>
              </div>
            ))
          )}
        </div>
      ) : (
        /* TAB: NOTULEN RAPAT */
        <div className="space-y-2 animate-in fade-in">
          {notulenList.length === 0 ? (
            <p className="text-center text-slate-400 py-4">Belum ada notulen rapat.</p>
          ) : (
            notulenList.map((item) => (
              <div key={item.id} className="p-3 border border-indigo-100 bg-indigo-50/30 rounded-xl space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-indigo-600 font-bold">{item.tanggal || 'Rapat RW'}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-md font-semibold">
                      {item.pembuat || 'Sekretaris'}
                    </span>
                    {canEdit && (
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-rose-500 hover:bg-rose-50 p-1 rounded-md transition"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <h4 className="font-bold text-slate-800">{item.judul}</h4>
                <p className="text-slate-600 text-[11px] leading-relaxed whitespace-pre-line">{item.isi}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};