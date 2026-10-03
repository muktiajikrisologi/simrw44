import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { UserRole } from '../../types';
import { Plus, Trash2, Loader2 } from 'lucide-react';

interface Pengurus {
  id?: string;
  jabatan: string;
  nama: string;
  hp: string;
}

interface ComponentProps {
  activeRole: UserRole;
}

export const StrukturPengurusContent: React.FC<ComponentProps> = ({ activeRole }) => {
  const [list, setList] = useState<Pengurus[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [jabatan, setJabatan] = useState('');
  const [nama, setNama] = useState('');
  const [hp, setHp] = useState('');

  // Pengecekan role untuk Super Admin & Sekretaris
  const canEdit = activeRole === 'super_admin' || activeRole === 'sekretaris';

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('struktur_pengurus')
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
    if (!canEdit || !jabatan || !nama || !hp) return;

    const { error } = await supabase.from('struktur_pengurus').insert([{ jabatan, nama, hp }]);
    if (!error) {
      setJabatan('');
      setNama('');
      setHp('');
      setShowForm(false);
      fetchData();
    }
  };

  const handleDelete = async (id: string) => {
    if (!canEdit) return;
    const { error } = await supabase.from('struktur_pengurus').delete().eq('id', id);
    if (!error) fetchData();
  };

  return (
    <div className="space-y-3">
      {/* Tombol Tambah TAMPIL untuk Super Admin & Sekretaris */}
      {canEdit && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1 text-xs font-bold bg-indigo-600 text-white px-3 py-1.5 rounded-xl hover:bg-indigo-700 transition shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            {showForm ? 'Batal' : 'Tambah Pengurus'}
          </button>
        </div>
      )}

      {/* Form TAMPIL untuk Super Admin & Sekretaris */}
      {canEdit && showForm && (
        <form onSubmit={handleAdd} className="p-3 border border-indigo-100 bg-indigo-50/50 rounded-2xl space-y-2 text-xs animate-in fade-in">
          <div>
            <label className="font-bold text-slate-600">Jabatan</label>
            <input
              type="text"
              placeholder="Misal: Ketua RT 01"
              value={jabatan}
              onChange={(e) => setJabatan(e.target.value)}
              className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label className="font-bold text-slate-600">Nama Lengkap</label>
            <input
              type="text"
              placeholder="Misal: Budi Santoso"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label className="font-bold text-slate-600">Nomor WhatsApp</label>
            <input
              type="text"
              placeholder="Misal: 08123456789"
              value={hp}
              onChange={(e) => setHp(e.target.value)}
              className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
              required
            />
          </div>
          <button type="submit" className="w-full py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-xs">
            Simpan Pengurus
          </button>
        </form>
      )}

      {/* List Struktur Pengurus */}
      {loading ? (
        <div className="flex justify-center py-6 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : list.length === 0 ? (
        <p className="text-xs text-center text-slate-400 py-4">Belum ada pengurus terdaftar.</p>
      ) : (
        list.map((p) => (
          <div key={p.id} className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">{p.jabatan}</span>
              <p className="font-bold text-slate-800">{p.nama}</p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={`https://wa.me/${p.hp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 bg-emerald-500 text-white font-bold rounded-lg text-[10px] hover:bg-emerald-600 transition"
              >
                WhatsApp
              </a>
              {/* Tombol Hapus TAMPIL untuk Super Admin & Sekretaris */}
              {canEdit && p.id && (
                <button
                  onClick={() => handleDelete(p.id!)}
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