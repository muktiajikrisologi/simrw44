import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { UserRole } from '../../types';
import { FileText, Pencil, Plus, Trash2, Save, X, Loader2, AlertCircle } from 'lucide-react';

interface TataTertibContentProps {
  activeRole?: UserRole | string;
}

interface PeraturanItem {
  id: string;
  teks: string;
}

export const TataTertibContent: React.FC<TataTertibContentProps> = ({ activeRole }) => {
  // Data default jika database Supabase masih kosong/belum di-setup
  const defaultRules: PeraturanItem[] = [
    { id: '1', teks: 'Tamu menginap wajib lapor ke Ketua RT dalam 1x24 jam.' },
    { id: '2', teks: 'Jam tenang lingkungan dimulai pukul 22.00 WIB.' },
    { id: '3', teks: 'Pelaksanaan kerja bakti rutin diselenggarakan minggu ke-2 tiap bulan.' },
    { id: '4', teks: 'Setiap KK wajib membayar iuran rutin sebelum tanggal 10.' },
  ];

  const [rules, setRules] = useState<PeraturanItem[]>(defaultRules);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  
  // State untuk form edit
  const [editRules, setEditRules] = useState<PeraturanItem[]>([]);
  const [newRuleText, setNewRuleText] = useState<string>('');

  // Hak Akses Edit khusus Super Admin dan Sekretaris
  const canEdit = activeRole === 'super_admin' || activeRole === 'sekretaris';

  // Ambil data dari tabel 'tata_tertib' di Supabase
  const fetchRules = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tata_tertib')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.warn('Tabel tata_tertib belum ada atau error, menggunakan data default:', error.message);
      } else if (data && data.length > 0) {
        setRules(data);
      }
    } catch (err) {
      console.error('Gagal mengambil tata tertib:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  // Membuka mode edit
  const handleStartEdit = () => {
    setEditRules([...rules]);
    setIsEditing(true);
  };

  // Mengubah teks poin peraturan tertentu di form edit
  const handleItemChange = (id: string, text: string) => {
    setEditRules((prev) =>
      prev.map((item) => (item.id === id ? { ...item, teks: text } : item))
    );
  };

  // Menambah poin peraturan baru ke antrean edit
  const handleAddRule = () => {
    if (!newRuleText.trim()) return;
    const newItem: PeraturanItem = {
      id: `temp-${Date.now()}`,
      teks: newRuleText.trim(),
    };
    setEditRules((prev) => [...prev, newItem]);
    setNewRuleText('');
  };

  // Menghapus poin dari antrean edit
  const handleDeleteRule = (id: string) => {
    setEditRules((prev) => prev.filter((item) => item.id !== id));
  };

  // Menyimpan perubahan ke Supabase
  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Hapus seluruh data lama di tabel tata_tertib
      await supabase.from('tata_tertib').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      // 2. Insert data baru
      const dataToInsert = editRules.map((item) => ({ teks: item.teks }));
      const { error } = await supabase.from('tata_tertib').insert(dataToInsert);

      if (error) {
        alert(`Gagal menyimpan ke database: ${error.message}`);
      } else {
        alert('Tata tertib berhasil diperbarui!');
        setIsEditing(false);
        fetchRules();
      }
    } catch (err: any) {
      alert(`Terjadi kesalahan: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3 text-xs text-slate-600">
      {/* Container Utam Tata Tertib */}
      <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-2xl shadow-2xs space-y-3">
        {/* Header Header & Tombol Aksi */}
        <div className="flex items-center justify-between pb-2 border-b border-amber-200/60">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-700" />
            <p className="font-extrabold text-amber-900 text-xs">
              Peraturan Umum Lingkungan RW 44
            </p>
          </div>

          {/* Tombol Edit hanya tampil untuk Super Admin & Sekretaris */}
          {canEdit && !isEditing && (
            <button
              onClick={handleStartEdit}
              className="flex items-center gap-1 bg-amber-200/70 hover:bg-amber-200 text-amber-900 px-2.5 py-1 rounded-xl text-[10px] font-bold transition cursor-pointer"
            >
              <Pencil className="w-3 h-3" /> Edit Tata Tertib
            </button>
          )}
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex justify-center py-4 text-amber-700">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : isEditing ? (
          /* TAMPILAN FORM EDIT (Khusus Admin / Sekretaris) */
          <div className="space-y-3 pt-1">
            <div className="space-y-2">
              {editRules.map((item, index) => (
                <div key={item.id} className="flex items-center gap-2">
                  <span className="font-bold text-amber-800 text-[11px] w-4 text-right">
                    {index + 1}.
                  </span>
                  <input
                    type="text"
                    value={item.teks}
                    onChange={(e) => handleItemChange(item.id, e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white border border-amber-300 rounded-xl text-[11px] font-medium outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-500"
                  />
                  <button
                    onClick={() => handleDeleteRule(item.id)}
                    className="p-1.5 text-rose-600 hover:bg-rose-100/50 rounded-lg transition cursor-pointer"
                    title="Hapus poin"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Form Tambah Poin Baru */}
            <div className="flex items-center gap-2 pt-2 border-t border-amber-200/60">
              <input
                type="text"
                placeholder="Tambah poin peraturan baru..."
                value={newRuleText}
                onChange={(e) => setNewRuleText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRule())}
                className="flex-1 px-3 py-1.5 bg-white border border-amber-200 rounded-xl text-[11px] outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={handleAddRule}
                className="bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1.5 rounded-xl font-bold text-[10px] flex items-center gap-1 transition cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Tambah
              </button>
            </div>

            {/* Tombol Simpan / Batal */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsEditing(false)}
                disabled={saving}
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold text-[10px] flex items-center gap-1 transition cursor-pointer"
              >
                <X className="w-3 h-3" /> Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[10px] flex items-center gap-1 transition cursor-pointer"
              >
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Simpan
              </button>
            </div>
          </div>
        ) : (
          /* TAMPILAN BACA (Untuk Warga / Non-Admin) */
          <ul className="list-disc pl-5 space-y-1.5 text-[11px] text-amber-950 font-medium leading-relaxed">
            {rules.length === 0 ? (
              <li className="list-none text-amber-700 italic flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Belum ada data tata tertib.
              </li>
            ) : (
              rules.map((rule) => <li key={rule.id}>{rule.teks}</li>)
            )}
          </ul>
        )}
      </div>
    </div>
  );
};