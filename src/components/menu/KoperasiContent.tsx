import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Save } from 'lucide-react';

export interface KoperasiRecord {
  id?: string;
  warga_id?: string;
  bulan_tahun: string;
  nama_warga: string;
  blok_rumah: string;
  iuran_wajib: number;
  angsuran_ke: number;
  tanggal_cair_peminjaman?: string;
  jumlah_angsuran: number;
  total_kewajiban: number;
  status: 'lunas' | 'terutang';
}

interface WargaOption {
  id: string;
  nama: string;
  blok: string;
  no_rumah?: string;
}

interface KoperasiProps {
  userRole?: string;
  activeRole?: string;
}

const BULAN_LIST = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export default function KoperasiContent(props: KoperasiProps) {
  const rawRole = (props.userRole || props.activeRole || 'warga').toLowerCase();
  const isBendahara =
    rawRole.includes('bendahara') ||
    rawRole.includes('admin') ||
    rawRole.includes('pengurus') ||
    rawRole === 'rw' ||
    rawRole === 'rt';

  const [selectedBulan, setSelectedBulan] = useState<string>('Maret');
  const [selectedTahun, setSelectedTahun] = useState<string>('2026');

  const periodeKey = `${selectedBulan} ${selectedTahun}`;

  const [wargaList, setWargaList] = useState<WargaOption[]>([]);
  const [tableData, setTableData] = useState<Record<string, KoperasiRecord>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'semua' | 'lunas' | 'terutang'>('semua');

  useEffect(() => {
    loadData();
  }, [periodeKey]);

  // Helper penentu format Blok Rumah agar tidak dobel
  const getFormattedBlok = (w: WargaOption) => {
    if (!w.blok && !w.no_rumah) return '-';
    if (w.blok && w.no_rumah && !w.blok.includes(w.no_rumah)) {
      return `${w.blok}.${w.no_rumah}`;
    }
    return w.blok || w.no_rumah || '-';
  };

  const loadData = async () => {
    try {
      setLoading(true);

      const { data: dataWarga, error: errWarga } = await supabase
        .from('warga')
        .select('id, nama, blok, no_rumah')
        .order('nama', { ascending: true });

      if (errWarga) throw errWarga;
      setWargaList(dataWarga || []);

      const { data: dataKoperasi, error: errKoperasi } = await supabase
        .from('koperasi')
        .select('*')
        .eq('bulan_tahun', periodeKey);

      if (errKoperasi) throw errKoperasi;

      const map: Record<string, KoperasiRecord> = {};
      (dataKoperasi || []).forEach((item: KoperasiRecord) => {
        const key = item.warga_id || item.nama_warga;
        map[key] = item;
      });

      setTableData(map);
    } catch (err: any) {
      console.error('Gagal memuat data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    warga: WargaOption,
    field: keyof KoperasiRecord,
    value: any
  ) => {
    const key = warga.id;
    const existing = tableData[key] || {
      warga_id: warga.id,
      bulan_tahun: periodeKey,
      nama_warga: warga.nama,
      blok_rumah: getFormattedBlok(warga),
      iuran_wajib: 50000,
      angsuran_ke: 0,
      tanggal_cair_peminjaman: '',
      jumlah_angsuran: 0,
      total_kewajiban: 50000,
      status: 'terutang',
    };

    const updated = { ...existing, [field]: value };
    const iuran = Number(updated.iuran_wajib || 0);
    const angsuran = Number(updated.jumlah_angsuran || 0);
    updated.total_kewajiban = iuran + angsuran;

    setTableData({
      ...tableData,
      [key]: updated,
    });
  };

  const handleSaveRow = async (warga: WargaOption) => {
    if (!isBendahara) return;
    const key = warga.id;
    const record = tableData[key] || {
      warga_id: warga.id,
      bulan_tahun: periodeKey,
      nama_warga: warga.nama,
      blok_rumah: getFormattedBlok(warga),
      iuran_wajib: 50000,
      angsuran_ke: 0,
      tanggal_cair_peminjaman: null,
      jumlah_angsuran: 0,
      total_kewajiban: 50000,
      status: 'terutang',
    };

    try {
      setSavingId(key);

      const payload = {
        warga_id: record.warga_id,
        bulan_tahun: periodeKey,
        nama_warga: record.nama_warga,
        blok_rumah: record.blok_rumah,
        iuran_wajib: Number(record.iuran_wajib || 0),
        angsuran_ke: Number(record.angsuran_ke || 0),
        tanggal_cair_peminjaman: record.tanggal_cair_peminjaman || null,
        jumlah_angsuran: Number(record.jumlah_angsuran || 0),
        total_kewajiban: Number(record.iuran_wajib || 0) + Number(record.jumlah_angsuran || 0),
        status: record.status || 'terutang',
      };

      if (record.id) {
        const { error } = await supabase
          .from('koperasi')
          .update(payload)
          .eq('id', record.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('koperasi')
          .insert([payload])
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setTableData((prev) => ({
            ...prev,
            [key]: { ...record, id: data.id },
          }));
        }
      }
    } catch (err: any) {
      alert('Gagal menyimpan: ' + err.message);
    } finally {
      setSavingId(null);
    }
  };

  const toggleStatus = (warga: WargaOption) => {
    const key = warga.id;
    const currentStatus = tableData[key]?.status || 'terutang';
    const nextStatus = currentStatus === 'lunas' ? 'terutang' : 'lunas';
    handleInputChange(warga, 'status', nextStatus);
  };

  const filteredWarga = wargaList.filter((w) => {
    const key = w.id;
    const rec = tableData[key];
    const matchSearch =
      w.nama.toLowerCase().includes(search.toLowerCase()) ||
      (w.blok && w.blok.toLowerCase().includes(search.toLowerCase()));

    if (!matchSearch) return false;

    if (statusFilter === 'lunas') return rec?.status === 'lunas';
    if (statusFilter === 'terutang') return (rec?.status || 'terutang') === 'terutang';

    return true;
  });

  return (
    <div className="p-2 md:p-3 space-y-3">
      {/* Header Periode */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">Periode:</span>
          <select
            value={selectedBulan}
            onChange={(e) => setSelectedBulan(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            {BULAN_LIST.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          <input
            type="number"
            value={selectedTahun}
            onChange={(e) => setSelectedTahun(e.target.value)}
            className="w-20 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center"
          />
        </div>

        <div className="text-[11px] text-slate-500 font-medium">
          {isBendahara ? (
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              Mode Edit Bendahara
            </span>
          ) : (
            <span className="text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
              Mode Lihat Warga
            </span>
          )}
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-2 justify-between items-center">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama/blok..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="semua">Semua Status</option>
            <option value="terutang">Terutang</option>
            <option value="lunas">Lunas</option>
          </select>
        </div>
      </div>

      {/* Tabel Utama Koperasi */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-extrabold uppercase border-b border-slate-200 text-[10px] tracking-wider">
              <tr>
                <th className="p-2.5 text-center w-10">NO</th>
                <th className="p-2.5 min-w-[140px]">NAMA</th>
                <th className="p-2.5 text-center min-w-[80px]">BLOK</th>
                <th className="p-2.5 text-center min-w-[110px]">IURAN WAJIB</th>
                <th className="p-2.5 text-center min-w-[90px]">ANGSURAN KE</th>
                <th className="p-2.5 text-center min-w-[120px]">TGL CAIR</th>
                <th className="p-2.5 text-center min-w-[120px]">JML ANGSURAN</th>
                <th className="p-2.5 text-right min-w-[120px]">TOTAL KEWAJIBAN</th>
                <th className="p-2.5 text-center min-w-[100px]">STATUS</th>
                {isBendahara && <th className="p-2.5 text-center min-w-[80px]">SIMPAN</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400 font-medium">
                    Memuat data rekap warga...
                  </td>
                </tr>
              ) : filteredWarga.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400 font-medium">
                    Tidak ada data warga ditemukan.
                  </td>
                </tr>
              ) : (
                filteredWarga.map((warga, idx) => {
                  const key = warga.id;
                  const displayBlok = getFormattedBlok(warga);
                  const rec = tableData[key] || {
                    warga_id: warga.id,
                    bulan_tahun: periodeKey,
                    nama_warga: warga.nama,
                    blok_rumah: displayBlok,
                    iuran_wajib: 50000,
                    angsuran_ke: 0,
                    tanggal_cair_peminjaman: '',
                    jumlah_angsuran: 0,
                    total_kewajiban: 50000,
                    status: 'terutang',
                  };

                  const isLunas = rec.status === 'lunas';

                  return (
                    <tr key={warga.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-2 text-center text-slate-400 font-medium">{idx + 1}</td>
                      <td className="p-2 font-bold text-slate-800 uppercase text-[11px]">
                        {warga.nama}
                      </td>
                      <td className="p-2 text-center font-bold text-slate-600 text-[11px]">
                        {displayBlok}
                      </td>
                      <td className="p-2 text-center">
                        {isBendahara ? (
                          <input
                            type="number"
                            value={rec.iuran_wajib}
                            onChange={(e) =>
                              handleInputChange(warga, 'iuran_wajib', Number(e.target.value))
                            }
                            className="w-24 px-2 py-1 border border-slate-200 rounded-lg text-center font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        ) : (
                          <span className="font-mono text-slate-700">
                            Rp {Number(rec.iuran_wajib || 0).toLocaleString('id-ID')}
                          </span>
                        )}
                      </td>
                      <td className="p-2 text-center">
                        {isBendahara ? (
                          <input
                            type="number"
                            value={rec.angsuran_ke}
                            onChange={(e) =>
                              handleInputChange(warga, 'angsuran_ke', Number(e.target.value))
                            }
                            className="w-16 px-2 py-1 border border-slate-200 rounded-lg text-center font-bold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        ) : (
                          <span className="font-bold text-slate-700">
                            {rec.angsuran_ke > 0 ? rec.angsuran_ke : '-'}
                          </span>
                        )}
                      </td>
                      <td className="p-2 text-center">
                        {isBendahara ? (
                          <input
                            type="date"
                            value={rec.tanggal_cair_peminjaman || ''}
                            onChange={(e) =>
                              handleInputChange(warga, 'tanggal_cair_peminjaman', e.target.value)
                            }
                            className="w-28 px-1.5 py-1 border border-slate-200 rounded-lg text-center text-[11px] focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        ) : (
                          <span className="text-slate-500 text-[11px]">
                            {rec.tanggal_cair_peminjaman || '-'}
                          </span>
                        )}
                      </td>
                      <td className="p-2 text-center">
                        {isBendahara ? (
                          <input
                            type="number"
                            value={rec.jumlah_angsuran}
                            onChange={(e) =>
                              handleInputChange(warga, 'jumlah_angsuran', Number(e.target.value))
                            }
                            className="w-24 px-2 py-1 border border-slate-200 rounded-lg text-center font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        ) : (
                          <span className="font-mono text-slate-700">
                            Rp {Number(rec.jumlah_angsuran || 0).toLocaleString('id-ID')}
                          </span>
                        )}
                      </td>
                      <td className="p-2 text-right font-mono font-extrabold text-amber-700 text-xs pr-3">
                        Rp {Number(rec.total_kewajiban || 0).toLocaleString('id-ID')}
                      </td>
                      <td className="p-2 text-center">
                        {isBendahara ? (
                          <button
                            type="button"
                            onClick={() => toggleStatus(warga)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase border cursor-pointer transition ${
                              isLunas
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                                : 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200'
                            }`}
                          >
                            {isLunas ? 'LUNAS' : 'TERUTANG'}
                          </button>
                        ) : (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              isLunas
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {rec.status || 'TERUTANG'}
                          </span>
                        )}
                      </td>
                      {isBendahara && (
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            disabled={savingId === warga.id}
                            onClick={() => handleSaveRow(warga)}
                            className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition shadow-2xs cursor-pointer disabled:opacity-50"
                            title="Simpan Baris Ini"
                          >
                            <Save className="w-3.5 h-3.5" />
                          </button>
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
    </div>
  );
}