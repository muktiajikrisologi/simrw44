import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { UserRole } from '../../types';
import { Plus, Trash2, Loader2 } from 'lucide-react';

interface Contact {
  id?: string;
  nama: string;
  no: string;
}

interface ComponentProps {
  activeRole: UserRole;
}

export const NomorPentingContent: React.FC<ComponentProps> = ({ activeRole }) => {
  const [list, setList] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [nama, setNama] = useState('');
  const [no, setNo] = useState('');

  // Pengecekan role untuk Super Admin & Sekretaris
  const canEdit = activeRole === 'super_admin' || activeRole === 'sekretaris';

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('nomor_penting')
      .select('*')
      .order('created_at', { ascending: true });
    if (!error && data) setList(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit || !nama || !no) return;

    const { error } = await supabase.from('nomor_penting').insert([{ nama, no }]);
    if (!error) {
      setNama('');
      setNo('');
      setShowForm(false);
      fetchData();
    }
  };

  const handleDelete = async (id: string) => {
    if (!canEdit) return;
    const { error } = await supabase.from('nomor_penting').delete().eq('id', id);
    if (!error) fetchData();
  };

  return (
    <div className="space-y-3">
      {/* Tombol Tambah TAMPIL untuk Super Admin & Sekretaris */}
      {canEdit && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1 text-xs font-bold bg-blue-600 text-white px-3 py-1.5 rounded-xl hover:bg-blue-700 transition shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            {showForm ? 'Batal' : 'Tambah Kontak'}
          </button>
        </div>
      )}

      {/* Form TAMPIL untuk Super Admin & Sekretaris */}
      {canEdit && showForm && (
        <form onSubmit={handleAdd} className="p-3 border border-blue-100 bg-blue-50/50 rounded-2xl space-y-2 text-xs animate-in fade-in">
          <div>
            <label className="font-bold text-slate-600">Nama Instansi / Kontak</label>
            <input
              type="text"
              placeholder="Misal: Pos Security RT 02"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="font-bold text-slate-600">Nomor Telepon</label>
            <input
              type="text"
              placeholder="Misal: 08123456789"
              value={no}
              onChange={(e) => setNo(e.target.value)}
              className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500"
              required
            />
          </div>
          <button type="submit" className="w-full py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-xs">
            Simpan ke Database
          </button>
        </form>
      )}

      {/* List Nomor Penting */}
      {loading ? (
        <div className="flex justify-center py-6 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : list.length === 0 ? (
        <p className="text-xs text-center text-slate-400 py-4">Belum ada data nomor penting.</p>
      ) : (
        list.map((n) => (
          <div key={n.id} className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 flex justify-between items-center text-xs">
            <div>
              <p className="font-bold text-slate-800">{n.nama}</p>
              <p className="text-[11px] text-indigo-600 font-semibold">{n.no}</p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={`tel:${n.no.split('/')[0].trim()}`}
                className="px-2.5 py-1 bg-blue-600 text-white font-bold rounded-lg text-[10px] hover:bg-blue-700 transition"
              >
                Panggil
              </a>
              {/* Tombol Hapus TAMPIL untuk Super Admin & Sekretaris */}
              {canEdit && n.id && (
                <button
                  onClick={() => handleDelete(n.id!)}
                  className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                  title="Hapus"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};