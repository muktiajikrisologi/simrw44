import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { UserRole } from '../../types';
import { 
  Plus, 
  Loader2, 
  AlertCircle,
  Calendar,
  X,
  Trash2,
  Building2,
  CheckCircle2,
  XCircle
} from 'lucide-react';

interface KoperasiContentProps {
  activeRole?: UserRole | string;
}

interface WargaOption {
  id: string;
  nama: string;
  blok?: string;
}

interface KoperasiTableItem {
  id?: string;
  warga_id: string;
  warga_nama: string;
  blok: string;
  tanggal_cair: string | null;
  angsuran_koperasi: number;
  simpanan_wajib: number;
  total_tagihan: number;
  status: 'lunas' | 'belum_lunas';
  periode: string;
}

const BULAN_LIST = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const KoperasiContent: React.FC<KoperasiContentProps> = ({ activeRole }) => {
  const [dataList, setDataList] = useState<KoperasiTableItem[]>([]);
  const [wargaList, setWargaList] = useState<WargaOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // State Dropdown Periode
  const currentDate = new Date();
  const [selectedBulan, setSelectedBulan] = useState<string>(BULAN_LIST[currentDate.getMonth()]);
  const [selectedTahun, setSelectedTahun] = useState<string>(currentDate.getFullYear().toString());

  // Generate Opsi Tahun
  const currentYearNum = currentDate.getFullYear();
  const tahunList = Array.from({ length: 5 }, (_, i) => (currentYearNum - 2 + i).toString());

  const selectedPeriode = `${selectedBulan} ${selectedTahun}`;

  // Hak Akses Ketat: Hanya Super Admin & Bendahara Koperasi
  const normalizedRole = activeRole?.toString().toLowerCase().trim() || '';
  const canManage = 
    normalizedRole === 'super_admin' || 
    normalizedRole === 'superadmin' || 
    normalizedRole === 'bendahara_koperasi' || 
    normalizedRole === 'bendahara koperasi';

  // Form State
  const [formData, setFormData] = useState({
    warga_id: '',
    tanggal_cair: new Date().toISOString().split('T')[0],
    angsuran_koperasi: '',
    simpanan_wajib: '',
    status: 'lunas' as 'lunas' | 'belum_lunas',
  });

  const fetchData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      // 1. Ambil seluruh Warga
      const { data: wargaData, error: wargaErr } = await supabase
        .from('warga')
        .select('id, nama, blok')
        .order('nama', { ascending: true });

      if (wargaErr) throw wargaErr;
      const allWarga: WargaOption[] = wargaData || [];
      setWargaList(allWarga);

      if (allWarga.length > 0 && !formData.warga_id) {
        setFormData((prev) => ({ ...prev, warga_id: allWarga[0].id }));
      }

      // 2. Ambil Transaksi Koperasi
      const { data: koperasiData, error: koperasiErr } = await supabase
        .from('koperasi')
        .select(`
          id,
          warga_id,
          jenis,
          periode,
          nominal,
          status,
          tanggal_bayar,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (koperasiErr) throw koperasiErr;

      // 3. Mapping data per warga & periode
      const transactionMap = new Map<string, KoperasiTableItem>();

      (koperasiData || []).forEach((item: any) => {
        const key = `${item.warga_id}-${(item.periode || '').toLowerCase().trim()}`;
        const existing = transactionMap.get(key) || {
          id: item.id,
          warga_id: item.warga_id,
          warga_nama: '',
          blok: '',
          tanggal_cair: item.tanggal_bayar || null,
          angsuran_koperasi: 0,
          simpanan_wajib: 0,
          total_tagihan: 0,
          status: item.status === 'lunas' ? 'lunas' : 'belum_lunas',
          periode: item.periode || '',
        };

        const nominal = Number(item.nominal || 0);

        if (item.jenis === 'angsuran' || item.jenis === 'pinjaman') {
          existing.angsuran_koperasi += nominal;
        } else if (item.jenis === 'simpanan_wajib' || item.jenis === 'simpanan_pokok' || item.jenis === 'simpanan_sukarela') {
          existing.simpanan_wajib += nominal;
        }

        if (item.tanggal_bayar && !existing.tanggal_cair) {
          existing.tanggal_cair = item.tanggal_bayar;
        }

        if (item.status === 'lunas') {
          existing.status = 'lunas';
        }

        existing.total_tagihan = existing.angsuran_koperasi + existing.simpanan_wajib;
        transactionMap.set(key, existing);
      });

      // 4. Gabungkan seluruh data Warga
      const combinedData: KoperasiTableItem[] = allWarga.map((w) => {
        const key = `${w.id}-${selectedPeriode.toLowerCase().trim()}`;
        const tx = transactionMap.get(key);

        return {
          id: tx?.id,
          warga_id: w.id,
          warga_nama: w.nama,
          blok: w.blok || '-',
          tanggal_cair: tx?.tanggal_cair || null,
          angsuran_koperasi: tx?.angsuran_koperasi || 0,
          simpanan_wajib: tx?.simpanan_wajib || 0,
          total_tagihan: tx?.total_tagihan || 0,
          status: tx ? tx.status : 'belum_lunas',
          periode: selectedPeriode,
        };
      });

      setDataList(combinedData);
    } catch (err: any) {
      console.error('Error fetching koperasi data:', err.message);
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedBulan, selectedTahun]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage) return;

    if (!formData.warga_id) {
      alert('Pilih warga terlebih dahulu!');
      return;
    }

    setSubmitting(true);
    try {
      const inserts = [];
      const angsuran = parseFloat(formData.angsuran_koperasi || '0');
      const simpanan = parseFloat(formData.simpanan_wajib || '0');

      if (angsuran > 0) {
        inserts.push({
          warga_id: formData.warga_id,
          jenis: 'angsuran',
          periode: selectedPeriode,
          nominal: angsuran,
          status: formData.status,
          tanggal_bayar: formData.tanggal_cair || null,
        });
      }

      if (simpanan > 0) {
        inserts.push({
          warga_id: formData.warga_id,
          jenis: 'simpanan_wajib',
          periode: selectedPeriode,
          nominal: simpanan,
          status: formData.status,
          tanggal_bayar: formData.tanggal_cair || null,
        });
      }

      if (inserts.length === 0) {
        alert('Isi nominal Angsuran Koperasi atau Simpanan Wajib!');
        setSubmitting(false);
        return;
      }

      const { error } = await supabase.from('koperasi').insert(inserts);
      if (error) throw error;

      alert('Data tagihan koperasi berhasil ditambahkan!');
      setShowAddForm(false);
      setFormData({
        warga_id: wargaList[0]?.id || '',
        tanggal_cair: new Date().toISOString().split('T')[0],
        angsuran_koperasi: '',
        simpanan_wajib: '',
        status: 'lunas',
      });
      fetchData();
    } catch (err: any) {
      alert(`Gagal menyimpan: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (item: KoperasiTableItem) => {
    if (!canManage || !item.id) return;

    const nextStatus = item.status === 'lunas' ? 'belum_lunas' : 'lunas';

    try {
      const { error } = await supabase
        .from('koperasi')
        .update({ status: nextStatus })
        .eq('id', item.id);

      if (error) throw error;
      fetchData();
    } catch (err: any) {
      alert(`Gagal mengubah status: ${err.message}`);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!canManage || !id) return;
    if (!window.confirm('Hapus transaksi warga ini?')) return;

    try {
      const { error } = await supabase.from('koperasi').delete().eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (err: any) {
      alert(`Gagal menghapus: ${err.message}`);
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-4">
      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Error DB: {errorMessage}</span>
        </div>
      )}

      {/* Header Bar & Dropdown Periode */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-cyan-600 shrink-0" />
          <div>
            <h4 className="font-extrabold text-slate-800 text-sm">Laporan Koperasi Warga</h4>
            <p className="text-[10px] text-slate-500">Rincian Simpanan & Angsuran</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1.5 bg-white border border-slate-300 px-2.5 py-1.5 rounded-xl text-xs shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
            
            <select
              value={selectedBulan}
              onChange={(e) => setSelectedBulan(e.target.value)}
              className="bg-transparent font-bold text-slate-700 outline-none cursor-pointer text-xs"
            >
              {BULAN_LIST.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>

            <select
              value={selectedTahun}
              onChange={(e) => setSelectedTahun(e.target.value)}
              className="bg-transparent font-bold text-slate-700 outline-none cursor-pointer text-xs border-l border-slate-200 pl-1.5"
            >
              {tahunList.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {canManage && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1 bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer"
            >
              {showAddForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              {showAddForm ? 'Batal' : 'Tambah'}
            </button>
          )}
        </div>
      </div>

      {/* Form Tambah Data */}
      {showAddForm && canManage && (
        <form onSubmit={handleSubmit} className="p-4 bg-cyan-50/50 border border-cyan-200 rounded-2xl space-y-3">
          <div className="flex justify-between items-center border-b border-cyan-200 pb-1">
            <p className="font-bold text-slate-800 text-xs">Tambah Data Koperasi Warga</p>
            <span className="text-[10px] bg-cyan-200 text-cyan-800 font-bold px-2 py-0.5 rounded-md">
              Periode: {selectedPeriode}
            </span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Nama Warga *</label>
              <select
                value={formData.warga_id}
                onChange={(e) => setFormData({ ...formData, warga_id: e.target.value })}
                required
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl outline-none focus:border-cyan-500"
              >
                {wargaList.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.nama} {w.blok ? `(Blok ${w.blok})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Tanggal Cair</label>
              <input
                type="date"
                value={formData.tanggal_cair}
                onChange={(e) => setFormData({ ...formData, tanggal_cair: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Angsuran Koperasi (Rp)</label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={formData.angsuran_koperasi}
                onChange={(e) => setFormData({ ...formData, angsuran_koperasi: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Simpanan Wajib (Rp)</label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={formData.simpanan_wajib}
                onChange={(e) => setFormData({ ...formData, simpanan_wajib: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Status Pembayaran</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl outline-none focus:border-cyan-500 font-bold text-slate-700"
              >
                <option value="lunas">Lunas</option>
                <option value="belum_lunas">Belum Lunas</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Simpan Data
            </button>
          </div>
        </form>
      )}

      {/* Tabel Koperasi */}
      {loading ? (
        <div className="flex justify-center py-8 text-cyan-600">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs bg-white">
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 bg-slate-100 z-10 border-b border-slate-200 text-slate-700 font-extrabold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3">Nama Warga</th>
                  <th className="p-3">Blok</th>
                  <th className="p-3">Tanggal Cair</th>
                  <th className="p-3 text-right">Angsuran Koperasi</th>
                  <th className="p-3 text-right">Simpanan Wajib</th>
                  <th className="p-3 text-right">Total Tagihan</th>
                  <th className="p-3 text-center">Aksi / Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dataList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400 font-medium">
                      Belum ada data warga terdaftar.
                    </td>
                  </tr>
                ) : (
                  dataList.map((row) => (
                    <tr key={row.warga_id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3 font-bold text-slate-800">{row.warga_nama}</td>
                      <td className="p-3 text-slate-600 font-medium">{row.blok}</td>
                      <td className="p-3 text-slate-500">
                        {row.tanggal_cair ? new Date(row.tanggal_cair).toLocaleDateString('id-ID') : '-'}
                      </td>
                      <td className="p-3 text-right font-medium text-slate-700">
                        {formatRupiah(row.angsuran_koperasi)}
                      </td>
                      <td className="p-3 text-right font-medium text-slate-700">
                        {formatRupiah(row.simpanan_wajib)}
                      </td>
                      <td className="p-3 text-right font-extrabold text-cyan-700 bg-cyan-50/30">
                        {formatRupiah(row.total_tagihan)}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {row.id ? (
                            <>
                              <button
                                onClick={() => handleToggleStatus(row)}
                                disabled={!canManage}
                                className={`px-2 py-1 rounded-lg text-[10px] font-extrabold flex items-center gap-1 transition ${
                                  row.status === 'lunas'
                                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                    : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                                } ${canManage ? 'cursor-pointer' : 'cursor-default'}`}
                                title={canManage ? 'Klik untuk ubah status' : ''}
                              >
                                {row.status === 'lunas' ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                                    <span>Lunas</span>
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-3 h-3 text-rose-600 shrink-0" />
                                    <span>Belum Lunas</span>
                                  </>
                                )}
                              </button>

                              {canManage && (
                                <button
                                  onClick={() => handleDelete(row.id)}
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                  title="Hapus Record"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </>
                          ) : (
                            <span className="px-2 py-1 bg-slate-100 text-slate-400 rounded-lg text-[10px] font-semibold flex items-center gap-1">
                              <XCircle className="w-3 h-3 text-slate-300" />
                              Belum Ada Data
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};