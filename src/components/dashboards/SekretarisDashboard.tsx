import React, { useState, useRef } from 'react';
import { UserProfile, RincianKewajibanArisan } from '../../types';
import { Search, PlusCircle, Download, Upload, Layers } from 'lucide-react';
import { INITIAL_RINCIAN_ARISAN_RW44 } from '../../lib/dataRW44';

interface SekretarisDashboardProps {
  currentUser: UserProfile;
  rincianArisan?: RincianKewajibanArisan[];
  onUpdateRincianItem?: (id: string, updated: Partial<RincianKewajibanArisan>) => void;
  onAddRincianItem?: (item: Omit<RincianKewajibanArisan, 'id'>) => void;
  onToggleRincianStatus?: (id: string) => void;
  onImportRincianCsv?: (items: RincianKewajibanArisan[]) => number;
}

export const SekretarisDashboard: React.FC<SekretarisDashboardProps> = ({
  rincianArisan = INITIAL_RINCIAN_ARISAN_RW44,
  onUpdateRincianItem,
  onAddRincianItem,
  onToggleRincianStatus,
  onImportRincianCsv,
}) => {
  // Filter state
  const [searchWarga, setSearchWarga] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'lunas' | 'belum_lunas'>('all');

  // Inline editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<RincianKewajibanArisan>>({});

  // Add Item Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNama, setNewNama] = useState('');
  const [newBlok, setNewBlok] = useState('');
  const [newAngsuranKop, setNewAngsuranKop] = useState<number>(0);
  const [newDendaRonda, setNewDendaRonda] = useState<number>(0);
  const [newBagiJimpitan, setNewBagiJimpitan] = useState<number>(0);
  const [newTdkIsiJimpitan, setNewTdkIsiJimpitan] = useState<number>(0);
  const [newTunggakanRonda, setNewTunggakanRonda] = useState<number>(0);
  const [newArisan, setNewArisan] = useState<number>(10000);
  const [newIuranRt, setNewIuranRt] = useState<number>(5000);

  // CSV Import Modal
  const [showImportModal, setShowImportModal] = useState(false);
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtered List
  const filteredList = rincianArisan.filter((item) => {
    const matchSearch =
      item.nama.toLowerCase().includes(searchWarga.toLowerCase()) ||
      item.blok_rumah.toLowerCase().includes(searchWarga.toLowerCase());
    const matchStatus = statusFilter === 'all' || item.status_bayar === statusFilter;
    return matchSearch && matchStatus;
  });

  // Totals
  const totalKoperasi = rincianArisan.reduce((acc, c) => acc + (Number(c.angsuran_koperasi) || 0), 0);
  const totalRonda = rincianArisan.reduce((acc, c) => acc + (Number(c.jmlh_kewajiban_ronda) || 0), 0);
  const totalArisan = rincianArisan.reduce((acc, c) => acc + (Number(c.arisan) || 0), 0);
  const totalIuranRt = rincianArisan.reduce((acc, c) => acc + (Number(c.iuran_rt) || 0), 0);
  const grandTotal = rincianArisan.reduce((acc, c) => acc + (Number(c.jumlah_kewajiban) || 0), 0);
  const totalLunas = rincianArisan.filter((c) => c.status_bayar === 'lunas').length;

  const handleStartEdit = (item: RincianKewajibanArisan) => {
    setEditingId(item.id);
    setEditForm({ ...item });
  };

  const handleSaveEdit = () => {
    if (editingId && onUpdateRincianItem) {
      onUpdateRincianItem(editingId, editForm);
      setEditingId(null);
      setEditForm({});
    }
  };

  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNama.trim() || !onAddRincianItem) return;

    onAddRincianItem({
      no: rincianArisan.length + 1,
      nama: newNama.trim().toUpperCase(),
      blok_rumah: newBlok.trim().toUpperCase() || '-',
      angsuran_koperasi: Number(newAngsuranKop) || 0,
      denda_ronda: Number(newDendaRonda) || 0,
      bagi_jimpitan: Number(newBagiJimpitan) || 0,
      tdk_isi_jimpitan: Number(newTdkIsiJimpitan) || 0,
      tunggakan_bln_lalu: Number(newTunggakanRonda) || 0,
      jmlh_kewajiban_ronda:
        (Number(newDendaRonda) || 0) +
        (Number(newBagiJimpitan) || 0) +
        (Number(newTdkIsiJimpitan) || 0) +
        (Number(newTunggakanRonda) || 0),
      arisan: Number(newArisan) || 0,
      iuran_rt: Number(newIuranRt) || 0,
      jumlah_kewajiban:
        (Number(newAngsuranKop) || 0) +
        ((Number(newDendaRonda) || 0) +
          (Number(newBagiJimpitan) || 0) +
          (Number(newTdkIsiJimpitan) || 0) +
          (Number(newTunggakanRonda) || 0)) +
        (Number(newArisan) || 0) +
        (Number(newIuranRt) || 0),
      status_bayar: 'belum_lunas',
    });

    setNewNama('');
    setNewBlok('');
    setNewAngsuranKop(0);
    setNewDendaRonda(0);
    setNewBagiJimpitan(0);
    setNewTdkIsiJimpitan(0);
    setNewTunggakanRonda(0);
    setShowAddModal(false);
  };

  const handleExportCsv = () => {
    const headers = [
      'NO',
      'NAMA',
      'BLOK RUMAH',
      'ANGSURAN KE',
      'TGL CAIR',
      'ANGSURAN KOPERASI',
      'DENDA RONDA',
      'BAGI JIMPITAN',
      'TDK ISI JIMPITAN',
      'TUNGGAKAN BLN LALU',
      'JMLH KEWAJIBAN RONDA',
      'ARISAN',
      'IURAN RT',
      'JUMLAH KEWAJIBAN',
      'STATUS BAYAR',
    ];
    const rows = rincianArisan.map((item) => [
      item.no,
      `"${item.nama}"`,
      `"${item.blok_rumah}"`,
      item.angsuran_ke || '',
      item.tgl_cair || '',
      item.angsuran_koperasi,
      item.denda_ronda,
      item.bagi_jimpitan,
      item.tdk_isi_jimpitan,
      item.tunggakan_bln_lalu,
      item.jmlh_kewajiban_ronda,
      item.arisan,
      item.iuran_rt,
      item.jumlah_kewajiban,
      item.status_bayar,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Rekap_Arisan_Sekretaris_RW44.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImportRincianCsv) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
        if (lines.length < 2) {
          setImportMsg('File CSV kosong atau tidak valid.');
          return;
        }

        const parsed: RincianKewajibanArisan[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
          if (cols.length >= 3) {
            const no = parseInt(cols[0]) || i;
            const nama = cols[1] || `WARGA ${i}`;
            const blok_rumah = cols[2] || '-';
            const angsuran_ke = cols[3] || undefined;
            const tgl_cair = cols[4] || undefined;
            const angsuran_koperasi = parseFloat(cols[5]) || 0;
            const denda_ronda = parseFloat(cols[6]) || 0;
            const bagi_jimpitan = parseFloat(cols[7]) || 0;
            const tdk_isi_jimpitan = parseFloat(cols[8]) || 0;
            const tunggakan_bln_lalu = parseFloat(cols[9]) || 0;
            const jmlh_kewajiban_ronda =
              parseFloat(cols[10]) ||
              denda_ronda + bagi_jimpitan + tdk_isi_jimpitan + tunggakan_bln_lalu;
            const arisan = parseFloat(cols[11]) || 0;
            const iuran_rt = parseFloat(cols[12]) || 0;
            const jumlah_kewajiban =
              parseFloat(cols[13]) ||
              angsuran_koperasi + jmlh_kewajiban_ronda + arisan + iuran_rt;
            const status_bayar = cols[14]?.toLowerCase() === 'lunas' ? 'lunas' : 'belum_lunas';

            parsed.push({
              id: `imported-ar-${Date.now()}-${i}`,
              no,
              nama,
              blok_rumah,
              angsuran_ke,
              tgl_cair,
              angsuran_koperasi,
              denda_ronda,
              bagi_jimpitan,
              tdk_isi_jimpitan,
              tunggakan_bln_lalu,
              jmlh_kewajiban_ronda,
              arisan,
              iuran_rt,
              jumlah_kewajiban,
              status_bayar,
            });
          }
        }

        if (parsed.length > 0) {
          const count = onImportRincianCsv(parsed);
          setImportMsg(`Berhasil mengimpor ${count} data Rincian Arisan RW 44!`);
          setTimeout(() => setShowImportModal(false), 1500);
        } else {
          setImportMsg('Tidak ada baris data valid yang ditemukan.');
        }
      } catch (err) {
        setImportMsg('Gagal membaca file CSV.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-12" id="sekretaris-screen">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-100 pb-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-800 text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
              SEK
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-wider text-blue-800 uppercase bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                  Sekretariat RW 44 Balecatur
                </span>
                <span className="text-xs text-slate-500 font-medium">Gamping, Sleman</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
                Perekapan Arisan, Jimpitan & Administrasi RW
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Kelola rekapitulasi kewajiban warga. Data ini otomatis tersambung ke menu <strong>Info Iuran</strong> warga.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowImportModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 shadow-xs transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-slate-600" />
              <span>Import CSV Gabungan</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Tambah Baris Warga</span>
            </button>
          </div>
        </div>

        {/* Bento Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase block">Koperasi</span>
            <p className="text-base sm:text-lg font-bold text-slate-900 mt-1">
              Rp {totalKoperasi.toLocaleString('id-ID')}
            </p>
            <span className="text-[10px] text-slate-400">Total pinjaman/jasa</span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase block">Ronda & Jimpitan</span>
            <p className="text-base sm:text-lg font-bold text-slate-900 mt-1">
              Rp {totalRonda.toLocaleString('id-ID')}
            </p>
            <span className="text-[10px] text-slate-400">Denda, koin & regu</span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase block">Arisan RW</span>
            <p className="text-base sm:text-lg font-bold text-slate-900 mt-1">
              Rp {totalArisan.toLocaleString('id-ID')}
            </p>
            <span className="text-[10px] text-slate-400">Iuran rutin arisan</span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase block">Iuran Kas RT</span>
            <p className="text-base sm:text-lg font-bold text-slate-900 mt-1">
              Rp {totalIuranRt.toLocaleString('id-ID')}
            </p>
            <span className="text-[10px] text-slate-400">Kas operasional RT</span>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-blue-50 p-3.5 rounded-xl border border-blue-200">
            <span className="text-[11px] font-bold text-blue-900 uppercase block">Total Kewajiban</span>
            <p className="text-base sm:text-lg font-bold text-blue-950 mt-1">
              Rp {grandTotal.toLocaleString('id-ID')}
            </p>
            <span className="text-[10px] text-blue-700 font-medium">
              {totalLunas}/{rincianArisan.length} Lunas
            </span>
          </div>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Controls */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama / blok rumah..."
                value={searchWarga}
                onChange={(e) => setSearchWarga(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-white border border-slate-300 rounded-lg text-xs text-slate-700 px-3 py-1.5 outline-none"
            >
              <option value="all">Semua Status</option>
              <option value="lunas">Lunas</option>
              <option value="belum_lunas">Belum Lunas</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs text-slate-500">
              Menampilkan {filteredList.length} dari {rincianArisan.length} Warga
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-100 text-slate-800 border-b border-slate-300 text-xs font-bold uppercase">
                <th className="py-3 px-3 w-12 text-center border-r border-slate-200">NO</th>
                <th className="py-3 px-4 border-r border-slate-200 min-w-[160px]">NAMA WARGA</th>
                <th className="py-3 px-3 border-r border-slate-200 text-center w-20">BLOK</th>
                <th className="py-3 px-3 border-r border-slate-200 text-center w-20">ANGS. KE</th>
                <th className="py-3 px-3 border-r border-slate-200 text-center w-24">TGL CAIR</th>
                <th className="py-3 px-3 border-r border-slate-200 text-right">KOPERASI</th>
                <th className="py-3 px-3 border-r border-slate-200 text-right">RONDA</th>
                <th className="py-3 px-3 border-r border-slate-200 text-right">ARISAN</th>
                <th className="py-3 px-3 border-r border-slate-200 text-right">IURAN RT</th>
                <th className="py-3 px-4 border-r border-slate-200 text-right bg-blue-50/50">
                  JUMLAH KEWAJIBAN
                </th>
                <th className="py-3 px-3 text-center w-36">STATUS & AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredList.map((item, idx) => {
                const isEditing = editingId === item.id;

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      item.status_bayar === 'lunas' ? 'bg-emerald-50/20' : 'bg-white'
                    }`}
                  >
                    <td className="py-2.5 px-3 text-center font-mono text-slate-500 border-r border-slate-200">
                      {item.no || idx + 1}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900 border-r border-slate-200">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.nama || ''}
                          onChange={(e) => setEditForm({ ...editForm, nama: e.target.value })}
                          className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
                        />
                      ) : (
                        item.nama
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono border-r border-slate-200">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.blok_rumah || ''}
                          onChange={(e) =>
                            setEditForm({ ...editForm, blok_rumah: e.target.value })
                          }
                          className="w-16 px-1 py-1 border border-slate-300 rounded text-xs text-center font-mono"
                        />
                      ) : (
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {item.blok_rumah}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-600 border-r border-slate-200">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.angsuran_ke || ''}
                          onChange={(e) =>
                            setEditForm({ ...editForm, angsuran_ke: e.target.value })
                          }
                          className="w-12 px-1 py-1 border border-slate-300 rounded text-xs text-center font-mono"
                        />
                      ) : (
                        item.angsuran_ke || '-'
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-500 border-r border-slate-200 text-[11px]">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.tgl_cair || ''}
                          onChange={(e) =>
                            setEditForm({ ...editForm, tgl_cair: e.target.value })
                          }
                          className="w-20 px-1 py-1 border border-slate-300 rounded text-xs text-center font-mono"
                        />
                      ) : (
                        item.tgl_cair || '-'
                      )}
                    </td>

                    {/* Koperasi */}
                    <td className="py-2.5 px-3 text-right font-mono border-r border-slate-200">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editForm.angsuran_koperasi || 0}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              angsuran_koperasi: Number(e.target.value),
                            })
                          }
                          className="w-20 px-1 py-1 border border-slate-300 rounded text-xs text-right font-mono"
                        />
                      ) : item.angsuran_koperasi > 0 ? (
                        <span>Rp {item.angsuran_koperasi.toLocaleString('id-ID')}</span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>

                    {/* Ronda */}
                    <td className="py-2.5 px-3 text-right font-mono border-r border-slate-200">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editForm.jmlh_kewajiban_ronda || 0}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              jmlh_kewajiban_ronda: Number(e.target.value),
                            })
                          }
                          className="w-16 px-1 py-1 border border-slate-300 rounded text-xs text-right font-mono"
                        />
                      ) : item.jmlh_kewajiban_ronda > 0 ? (
                        <span className="text-amber-700 font-semibold">
                          Rp {item.jmlh_kewajiban_ronda.toLocaleString('id-ID')}
                        </span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>

                    {/* Arisan */}
                    <td className="py-2.5 px-3 text-right font-mono border-r border-slate-200">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editForm.arisan || 0}
                          onChange={(e) =>
                            setEditForm({ ...editForm, arisan: Number(e.target.value) })
                          }
                          className="w-16 px-1 py-1 border border-slate-300 rounded text-xs text-right font-mono"
                        />
                      ) : item.arisan > 0 ? (
                        <span>Rp {item.arisan.toLocaleString('id-ID')}</span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>

                    {/* Iuran RT */}
                    <td className="py-2.5 px-3 text-right font-mono border-r border-slate-200">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editForm.iuran_rt || 0}
                          onChange={(e) =>
                            setEditForm({ ...editForm, iuran_rt: Number(e.target.value) })
                          }
                          className="w-16 px-1 py-1 border border-slate-300 rounded text-xs text-right font-mono"
                        />
                      ) : item.iuran_rt > 0 ? (
                        <span>Rp {item.iuran_rt.toLocaleString('id-ID')}</span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>

                    {/* Grand Total */}
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900 border-r border-slate-200 bg-slate-50/50">
                      Rp {item.jumlah_kewajiban.toLocaleString('id-ID')}
                    </td>

                    {/* Action */}
                    <td className="py-2.5 px-3 text-center">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={handleSaveEdit}
                            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-semibold"
                          >
                            Simpan
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setEditForm({});
                            }}
                            className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[10px]"
                          >
                            Batal
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onToggleRincianStatus && onToggleRincianStatus(item.id)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
                              item.status_bayar === 'lunas'
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                            }`}
                            title="Ubah status bayar"
                          >
                            {item.status_bayar === 'lunas' ? 'LUNAS' : 'BELUM'}
                          </button>

                          <button
                            onClick={() => handleStartEdit(item)}
                            className="text-slate-400 hover:text-blue-700 text-[11px] underline"
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold text-slate-900 text-xs border-t-2 border-slate-300">
                <td colSpan={5} className="py-3 px-4 text-center uppercase tracking-wider border-r border-slate-200">
                  JUMLAH TOTAL REKAPITULASI ARISAN RW 44
                </td>
                <td className="py-3 px-3 text-right font-mono border-r border-slate-200">
                  Rp {totalKoperasi.toLocaleString('id-ID')}
                </td>
                <td className="py-3 px-3 text-right font-mono border-r border-slate-200 text-amber-900">
                  Rp {totalRonda.toLocaleString('id-ID')}
                </td>
                <td className="py-3 px-3 text-right font-mono border-r border-slate-200">
                  Rp {totalArisan.toLocaleString('id-ID')}
                </td>
                <td className="py-3 px-3 text-right font-mono border-r border-slate-200">
                  Rp {totalIuranRt.toLocaleString('id-ID')}
                </td>
                <td className="py-3 px-4 text-right font-mono text-sm bg-blue-100/70 text-blue-950 border-r border-slate-200">
                  Rp {grandTotal.toLocaleString('id-ID')}
                </td>
                <td className="py-3 px-3 text-center text-slate-500 font-normal text-[11px]">
                  {rincianArisan.length} KK
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Modal Add Warga Row */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Tambah Data Warga ke Rekap Arisan</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewItem} className="space-y-3 mt-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Warga *</label>
                <input
                  type="text"
                  required
                  value={newNama}
                  onChange={(e) => setNewNama(e.target.value)}
                  placeholder="Contoh: SUDIRMAN"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Blok Rumah *</label>
                <input
                  type="text"
                  required
                  value={newBlok}
                  onChange={(e) => setNewBlok(e.target.value)}
                  placeholder="Contoh: B.16 atau H.3"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Angsuran Koperasi (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    value={newAngsuranKop}
                    onChange={(e) => setNewAngsuranKop(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Denda Ronda (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    value={newDendaRonda}
                    onChange={(e) => setNewDendaRonda(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Arisan RW (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    value={newArisan}
                    onChange={(e) => setNewArisan(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Iuran RT (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    value={newIuranRt}
                    onChange={(e) => setNewIuranRt(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-semibold"
                >
                  Tambahkan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Import CSV */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 text-xs animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Import CSV Rekap Arisan RW 44</h3>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-slate-600">
                Format CSV harus memiliki kolom sesuai urutan rekapitulasi sekretaris:
              </p>
              <div className="bg-slate-50 p-2.5 rounded-lg font-mono text-[10px] text-slate-700 border border-slate-200 break-all">
                NO, NAMA, BLOK_RUMAH, ANGSURAN_KE, TGL_CAIR, ANGSURAN_KOPERASI, DENDA_RONDA, BAGI_JIMPITAN, TDK_ISI_JIMPITAN, TUNGGAKAN, JMLH_RONDA, ARISAN, IURAN_RT, JUMLAH_KEWAJIBAN, STATUS_BAYAR
              </div>

              <input
                type="file"
                ref={fileInputRef}
                accept=".csv"
                onChange={handleImportCsv}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-blue-50/20"
              >
                <Upload className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="font-semibold text-slate-800">Klik untuk memilih file CSV</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Mendukung format file hasil ekspor rekap</p>
              </div>

              {importMsg && (
                <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg font-medium">
                  {importMsg}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};