import React, { useState, useRef } from 'react';
import { UserProfile, RekapJimpitanRondaEntry, KelompokRonda, Warga, JimpitanDenda } from '../../types';
import {
  Coins,
  ShieldCheck,
  AlertTriangle,
  FileSpreadsheet,
  Printer,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Save,
  Trash2,
  Download,
  Upload,
  ArrowUpDown,
  FileText,
  UserCheck,
  X,
  Layers,
} from 'lucide-react';

interface PerekapJimpitanDashboardProps {
  currentUser: UserProfile;
  rekapJimpitan?: RekapJimpitanRondaEntry[];
  kelompokRonda?: KelompokRonda[];
  warga?: Warga[];
  onUpdateItem?: (id: string, updated: Partial<RekapJimpitanRondaEntry>) => void;
  onAddItem?: (item: Omit<RekapJimpitanRondaEntry, 'id'>) => void;
  onToggleStatus?: (id: string) => void;
  onUpdateKelompokRonda?: (hari: string, updated: Partial<KelompokRonda>) => void;
  onImportCsv?: (items: RekapJimpitanRondaEntry[]) => number;
  jimpitan?: JimpitanDenda[];
  onAddJimpitan?: (data: Omit<JimpitanDenda, 'id' | 'created_at'>) => void;
  onMarkJimpitanLunas?: (id: string) => void;
}

export const PerekapJimpitanDashboard: React.FC<PerekapJimpitanDashboardProps> = ({
  currentUser,
  rekapJimpitan = [],
  kelompokRonda = [],
  warga = [],
  onUpdateItem,
  onAddItem,
  onToggleStatus,
  onUpdateKelompokRonda,
  onImportCsv,
}) => {
  const [activeTab, setActiveTab] = useState<'blangko' | 'kelompok' | 'analitik'>('blangko');
  const [selectedBulan, setSelectedBulan] = useState('September');
  const [selectedTahun, setSelectedTahun] = useState('2025');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBlok, setFilterBlok] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'lunas' | 'terutang'>('all');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<RekapJimpitanRondaEntry>>({});
  const [showImportModal, setShowImportModal] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);

  const [newNama, setNewNama] = useState('');
  const [newBlok, setNewBlok] = useState('');
  const [newDendaRonda, setNewDendaRonda] = useState<number>(0);
  const [newBagiJimpitan, setNewBagiJimpitan] = useState<number>(0);
  const [newTdkIsiJimpitan, setNewTdkIsiJimpitan] = useState<number>(0);
  const [newSetoranRegu, setNewSetoranRegu] = useState<number>(0);
  const [newTunggakan, setNewTunggakan] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalDendaRonda = rekapJimpitan.reduce((acc, curr) => acc + (Number(curr.denda_ronda) || 0), 0);
  const totalBagiJimpitan = rekapJimpitan.reduce((acc, curr) => acc + (Number(curr.bagi_jimpitan) || 0), 0);
  const totalTdkIsiJimpitan = rekapJimpitan.reduce((acc, curr) => acc + (Number(curr.tdk_isi_jimpitan) || 0), 0);
  const totalSetoranRegu = rekapJimpitan.reduce((acc, curr) => acc + (Number(curr.setoran_regu) || 0), 0);
  const totalTunggakan = rekapJimpitan.reduce((acc, curr) => acc + (Number(curr.tunggakan_bln_lalu) || 0), 0);
  const totalKeseluruhan = rekapJimpitan.reduce((acc, curr) => acc + (Number(curr.jumlah) || 0), 0);
  const totalLunasCount = rekapJimpitan.filter((i) => i.status === 'lunas').length;
  const totalTerutangCount = rekapJimpitan.filter((i) => i.status === 'terutang').length;

  const totalSetoranKelompokRonda = kelompokRonda.reduce(
    (acc, curr) => acc + (Number(curr.nominal_setoran) || 0),
    0
  );

  // Filtered entries dengan pengaman optional chaining
  const filteredList = rekapJimpitan.filter((item) => {
    const itemName = item?.nama ?? '';
    const itemBlok = item?.blok ?? '';
    const itemStatus = item?.status ?? 'terutang';

    const matchSearch =
      itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      itemBlok.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchBlok =
      filterBlok === 'all' || itemBlok.toUpperCase().startsWith(filterBlok.toUpperCase());
    
    const matchStatus = filterStatus === 'all' || itemStatus === filterStatus;
    return matchSearch && matchBlok && matchStatus;
  });

  const handlePrintBlangko = () => {
    window.print();
  };

  const handleStartEdit = (item: RekapJimpitanRondaEntry) => {
    setEditingId(item.id);
    setEditForm({ ...item });
  };

  const handleSaveEdit = () => {
    if (editingId && onUpdateItem) {
      onUpdateItem(editingId, editForm);
      setEditingId(null);
      setEditForm({});
    }
  };

  const handleAddNewEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNama.trim() || !onAddItem) return;

    onAddItem({
      no: rekapJimpitan.length + 1,
      nama: newNama.trim().toUpperCase(),
      blok: newBlok.trim().toUpperCase() || '-',
      denda_ronda: Number(newDendaRonda) || 0,
      bagi_jimpitan: Number(newBagiJimpitan) || 0,
      tdk_isi_jimpitan: Number(newTdkIsiJimpitan) || 0,
      setoran_regu: Number(newSetoranRegu) || 0,
      tunggakan_bln_lalu: Number(newTunggakan) || 0,
      jumlah:
        (Number(newDendaRonda) || 0) +
        (Number(newBagiJimpitan) || 0) +
        (Number(newTdkIsiJimpitan) || 0) +
        (Number(newSetoranRegu) || 0) +
        (Number(newTunggakan) || 0),
      status: 'terutang',
      bulan: selectedBulan,
      tahun: selectedTahun,
    });

    setNewNama('');
    setNewBlok('');
    setNewDendaRonda(0);
    setNewBagiJimpitan(0);
    setNewTdkIsiJimpitan(0);
    setNewSetoranRegu(0);
    setNewTunggakan(0);
    setShowAddModal(false);
  };

  const handleCsvExport = () => {
    const headers = [
      'NO',
      'NAMA',
      'BLOK',
      'DENDA RONDA',
      'BAGI JIMPITAN',
      'TDK ISI JIMPITAN',
      'SETORAN REGU',
      'TUNGGAKAN BLN LALU',
      'JUMLAH',
      'STATUS',
    ];
    const rows = rekapJimpitan.map((item) => [
      item.no,
      `"${item.nama}"`,
      `"${item.blok}"`,
      item.denda_ronda,
      item.bagi_jimpitan,
      item.tdk_isi_jimpitan,
      item.setoran_regu,
      item.tunggakan_bln_lalu,
      item.jumlah,
      item.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Rekap_Jimpitan_Ronda_RW44_${selectedBulan}_${selectedTahun}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImportCsv) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
        if (lines.length < 2) {
          setImportMessage('Format file CSV kosong atau tidak valid.');
          return;
        }

        const parsed: RekapJimpitanRondaEntry[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
          if (cols.length >= 3) {
            const no = parseInt(cols[0]) || i;
            const nama = cols[1] || `WARGA ${i}`;
            const blok = cols[2] || '-';
            const denda_ronda = parseFloat(cols[3]) || 0;
            const bagi_jimpitan = parseFloat(cols[4]) || 0;
            const tdk_isi_jimpitan = parseFloat(cols[5]) || 0;
            const setoran_regu = parseFloat(cols[6]) || 0;
            const tunggakan_bln_lalu = parseFloat(cols[7]) || 0;
            const jumlah =
              parseFloat(cols[8]) ||
              denda_ronda + bagi_jimpitan + tdk_isi_jimpitan + setoran_regu + tunggakan_bln_lalu;
            const status = cols[9]?.toLowerCase() === 'lunas' ? 'lunas' : 'terutang';

            parsed.push({
              id: `imported-jr-${Date.now()}-${i}`,
              no,
              nama,
              blok,
              denda_ronda,
              bagi_jimpitan,
              tdk_isi_jimpitan,
              setoran_regu,
              tunggakan_bln_lalu,
              jumlah,
              status,
              bulan: selectedBulan,
              tahun: selectedTahun,
            });
          }
        }

        if (parsed.length > 0) {
          const count = onImportCsv(parsed);
          setImportMessage(`Berhasil mengimpor ${count} data Rekap Jimpitan Ronda!`);
          setTimeout(() => setShowImportModal(false), 1500);
        } else {
          setImportMessage('Tidak ada baris data valid yang ditemukan.');
        }
      } catch (err) {
        setImportMessage('Gagal membaca file CSV. Pastikan format pemisah koma.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-12" id="perekap-jimpitan-screen">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
              RW 44
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-widest text-emerald-700 uppercase bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                  Format Resmi Blangko Ronda
                </span>
                <span className="text-xs text-slate-500 font-medium">Balecatur, Gamping, Sleman</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
                REKAPITULASI DENDA JIMPITAN & RONDA RW. 44
              </h1>
              <p className="text-sm text-slate-600 mt-0.5">
                Dashboard resmi Bendahara Jimpitan untuk pencatatan denda ronda, koin kaleng jimpitan, dan setoran regu.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 uppercase">BULAN:</span>
              <select
                id="bulan-select"
                value={selectedBulan}
                onChange={(e) => setSelectedBulan(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 px-3 py-1.5 focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map(
                  (m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 uppercase">TAHUN:</span>
              <input
                id="tahun-input"
                type="text"
                value={selectedTahun}
                onChange={(e) => setSelectedTahun(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 px-3 py-1.5 w-20 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
              <button
                onClick={handlePrintBlangko}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors shadow-xs"
                title="Cetak Blangko Fisik Form Ronda"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                <span>Cetak Blangko</span>
              </button>

              <button
                onClick={() => setShowImportModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import CSV</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 uppercase">Total Denda Ronda</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-xl font-bold text-slate-900 mt-2">
              Rp {totalDendaRonda.toLocaleString('id-ID')}
            </p>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Denda ketidakhadiran ronda
            </span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 uppercase">Total Jimpitan Warga</span>
              <Coins className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-xl font-bold text-slate-900 mt-2">
              Rp {(totalBagiJimpitan + totalTdkIsiJimpitan).toLocaleString('id-ID')}
            </p>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Bagi koin & denda tdk isi kaleng
            </span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 uppercase">Setoran 7 Regu Ronda</span>
              <Layers className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-xl font-bold text-slate-900 mt-2">
              Rp {totalSetoranKelompokRonda.toLocaleString('id-ID')}
            </p>
            <span className="text-[11px] text-slate-500 mt-1 block">
              7 Regu (Rabu s/d Selasa)
            </span>
          </div>

          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-800 uppercase">Total Rekap Keseluruhan</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            </div>
            <p className="text-xl font-bold text-emerald-950 mt-2">
              Rp {totalKeseluruhan.toLocaleString('id-ID')}
            </p>
            <span className="text-[11px] text-emerald-700 mt-1 block">
              {totalLunasCount} Warga Lunas • {totalTerutangCount} Terutang
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('blangko')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'blangko'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>I. Tabel Rekapitulasi Warga (Sesuai Blangko)</span>
        </button>

        <button
          onClick={() => setActiveTab('kelompok')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'kelompok'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>II. Setoran Ketua Kelompok Ronda (Rabu - Selasa)</span>
        </button>
      </div>

      {activeTab === 'blangko' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama warga / blok..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={filterBlok}
                  onChange={(e) => setFilterBlok(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg text-xs text-slate-700 px-2.5 py-1.5 outline-none"
                >
                  <option value="all">Semua Blok</option>
                  <option value="B">Blok B</option>
                  <option value="C">Blok C</option>
                  <option value="D">Blok D</option>
                  <option value="H">Blok H</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="bg-white border border-slate-300 rounded-lg text-xs text-slate-700 px-2.5 py-1.5 outline-none"
                >
                  <option value="all">Semua Status</option>
                  <option value="lunas">Lunas</option>
                  <option value="terutang">Terutang</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <button
                onClick={handleCsvExport}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Tambah Warga</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto print:overflow-visible">
            <table className="w-full text-left border-collapse min-w-[960px]">
              <thead>
                <tr className="bg-slate-100 text-slate-800 border-b border-slate-300 text-xs uppercase font-bold text-center">
                  <th rowSpan={2} className="py-3 px-3 border-r border-slate-300 w-12">NO</th>
                  <th rowSpan={2} className="py-3 px-4 border-r border-slate-300 text-left min-w-[180px]">NAMA</th>
                  <th rowSpan={2} className="py-3 px-3 border-r border-slate-300 w-24">BLOK</th>
                  <th colSpan={5} className="py-2 px-4 border-r border-slate-300 bg-slate-200/80 tracking-wider">
                    JUMLAH YANG HARUS DIBAYARKAN
                  </th>
                  <th rowSpan={2} className="py-3 px-4 border-r border-slate-300 w-32 bg-emerald-50/50">JUMLAH</th>
                  <th rowSpan={2} className="py-3 px-4 w-36 text-center">STATUS / AKSI</th>
                </tr>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-300 text-[11px] font-bold text-center">
                  <th className="py-2 px-3 border-r border-slate-300">DENDA RONDA</th>
                  <th className="py-2 px-3 border-r border-slate-300">BAGI JIMPITAN</th>
                  <th className="py-2 px-3 border-r border-slate-300">TDK ISI JIMPITAN</th>
                  <th className="py-2 px-3 border-r border-slate-300">SETORAN REGU</th>
                  <th className="py-2 px-3 border-r border-slate-300">TUNGGAKAN BLN LALU</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-10 text-center text-slate-500">
                      Tidak ada data yang sesuai filter pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredList.map((item, idx) => {
                    const isEditing = editingId === item.id;

                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-slate-50 transition-colors ${
                          item.status === 'lunas' ? 'bg-emerald-50/20' : 'bg-white'
                        }`}
                      >
                        <td className="py-2.5 px-3 text-center font-mono font-medium text-slate-600 border-r border-slate-200">
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
                        <td className="py-2.5 px-3 text-center font-medium text-slate-700 border-r border-slate-200">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editForm.blok || ''}
                              onChange={(e) => setEditForm({ ...editForm, blok: e.target.value })}
                              className="w-16 px-2 py-1 border border-slate-300 rounded text-xs text-center"
                            />
                          ) : (
                            <span className="inline-block bg-slate-100 px-2 py-0.5 rounded text-[11px] font-mono">
                              {item.blok}
                            </span>
                          )}
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono border-r border-slate-200">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editForm.denda_ronda || 0}
                              onChange={(e) =>
                                setEditForm({ ...editForm, denda_ronda: Number(e.target.value) })
                              }
                              className="w-20 px-1 py-1 border border-slate-300 rounded text-xs text-right font-mono"
                            />
                          ) : item.denda_ronda > 0 ? (
                            <span className="text-amber-700 font-semibold">
                              Rp {item.denda_ronda.toLocaleString('id-ID')}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono border-r border-slate-200">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editForm.bagi_jimpitan || 0}
                              onChange={(e) =>
                                setEditForm({ ...editForm, bagi_jimpitan: Number(e.target.value) })
                              }
                              className="w-20 px-1 py-1 border border-slate-300 rounded text-xs text-right font-mono"
                            />
                          ) : item.bagi_jimpitan > 0 ? (
                            <span className="text-slate-800">
                              Rp {item.bagi_jimpitan.toLocaleString('id-ID')}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono border-r border-slate-200">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editForm.tdk_isi_jimpitan || 0}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  tdk_isi_jimpitan: Number(e.target.value),
                                })
                              }
                              className="w-20 px-1 py-1 border border-slate-300 rounded text-xs text-right font-mono"
                            />
                          ) : item.tdk_isi_jimpitan > 0 ? (
                            <span className="text-rose-700 font-semibold">
                              Rp {item.tdk_isi_jimpitan.toLocaleString('id-ID')}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono border-r border-slate-200">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editForm.setoran_regu || 0}
                              onChange={(e) =>
                                setEditForm({ ...editForm, setoran_regu: Number(e.target.value) })
                              }
                              className="w-20 px-1 py-1 border border-slate-300 rounded text-xs text-right font-mono"
                            />
                          ) : item.setoran_regu > 0 ? (
                            <span className="text-emerald-700 font-semibold">
                              Rp {item.setoran_regu.toLocaleString('id-ID')}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono border-r border-slate-200">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editForm.tunggakan_bln_lalu || 0}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  tunggakan_bln_lalu: Number(e.target.value),
                                })
                              }
                              className="w-20 px-1 py-1 border border-slate-300 rounded text-xs text-right font-mono"
                            />
                          ) : item.tunggakan_bln_lalu > 0 ? (
                            <span className="text-rose-600 font-bold">
                              Rp {item.tunggakan_bln_lalu.toLocaleString('id-ID')}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>

                        <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900 border-r border-slate-200 bg-slate-50/50">
                          Rp {item.jumlah.toLocaleString('id-ID')}
                        </td>

                        <td className="py-2.5 px-4 text-center">
                          {isEditing ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={handleSaveEdit}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold"
                              >
                                Simpan
                              </button>
                              <button
                                onClick={() => {
                                  setEditingId(null);
                                  setEditForm({});
                                }}
                                className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[11px]"
                              >
                                Batal
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => onToggleStatus && onToggleStatus(item.id)}
                                className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors ${
                                  item.status === 'lunas'
                                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                    : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                }`}
                                title="Klik untuk mengubah status"
                              >
                                {item.status === 'lunas' ? 'LUNAS' : 'TERUTANG'}
                              </button>

                              <button
                                onClick={() => handleStartEdit(item)}
                                className="text-slate-400 hover:text-slate-700 text-[11px] underline"
                              >
                                Edit
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 border-t-2 border-slate-300 font-bold text-slate-900 text-xs">
                  <td colSpan={3} className="py-3 px-4 text-center tracking-wider uppercase border-r border-slate-300">
                    JUMLAH TOTAL
                  </td>
                  <td className="py-3 px-3 text-right font-mono border-r border-slate-300 text-amber-900">
                    Rp {totalDendaRonda.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-3 text-right font-mono border-r border-slate-300">
                    Rp {totalBagiJimpitan.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-3 text-right font-mono border-r border-slate-300 text-rose-800">
                    Rp {totalTdkIsiJimpitan.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-3 text-right font-mono border-r border-slate-300 text-emerald-800">
                    Rp {totalSetoranRegu.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-3 text-right font-mono border-r border-slate-300 text-rose-800">
                    Rp {totalTunggakan.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-sm bg-emerald-100/70 text-emerald-950 border-r border-slate-300">
                    Rp {totalKeseluruhan.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4 text-center text-slate-500 font-normal text-[11px]">
                    {rekapJimpitan.length} Baris
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'kelompok' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded">
                    Seksi II Blangko
                  </span>
                  <span className="text-xs text-slate-500">7 Hari Piket Ronda Rutin</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 mt-1">
                  SETORAN KETUA KELOMPOK RONDA RW. 44
                </h2>
                <p className="text-xs text-slate-600">
                  Daftar setoran koin jimpitan dari 7 kelompok ronda harian yang dikoordinir masing-masing ketua regu.
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-500">Total Akumulasi 7 Regu:</span>
                <p className="text-xl font-bold text-emerald-700">
                  Rp {totalSetoranKelompokRonda.toLocaleString('id-ID')}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 border-b border-slate-200 text-xs uppercase font-bold">
                    <th className="py-3 px-4 w-16 text-center">NO</th>
                    <th className="py-3 px-4 w-32">HARI</th>
                    <th className="py-3 px-4">KETUA KELOMPOK</th>
                    <th className="py-3 px-4 text-right">NOMINAL SETORAN</th>
                    <th className="py-3 px-4 text-center w-32">STATUS</th>
                    <th className="py-3 px-4">KETERANGAN / CATATAN</th>
                    <th className="py-3 px-4 text-center w-24">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {kelompokRonda.map((k, index) => {
                    return (
                      <tr key={k.hari} className="hover:bg-slate-50">
                        <td className="py-3 px-4 text-center font-mono text-slate-600 font-medium">
                          {index + 1}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          <span className="inline-block px-2.5 py-1 bg-slate-100 rounded text-xs font-mono">
                            {k.hari}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {k.ketua}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                          Rp {k.nominal_setoran.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              k.status === 'sudah_setor'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {k.status === 'sudah_setor' ? 'Sudah Setor' : 'Belum Setor'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {k.keterangan || '-'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => {
                              if (onUpdateKelompokRonda) {
                                const newNominal = prompt(
                                  `Ubah nominal setoran regu ${k.hari} (${k.ketua}):`,
                                  String(k.nominal_setoran)
                                );
                                if (newNominal !== null) {
                                  onUpdateKelompokRonda(k.hari, {
                                    nominal_setoran: Number(newNominal) || 0,
                                    status: 'sudah_setor',
                                    tanggal_setor: new Date().toISOString().split('T')[0],
                                  });
                                }
                              }
                            }}
                            className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold underline"
                          >
                            Update
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-bold text-slate-900 text-xs border-t-2 border-slate-300">
                    <td colSpan={3} className="py-3 px-4 text-center tracking-wider uppercase">
                      JUMLAH TOTAL SETORAN REGU
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-sm text-emerald-800">
                      Rp {totalSetoranKelompokRonda.toLocaleString('id-ID')}
                    </td>
                    <td colSpan={3} className="py-3 px-4 text-slate-500 font-normal text-[11px]">
                      Piket 7 Malam Berjalan
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
              Pengesahan Blangko Fisik
            </h3>
            <div className="grid grid-cols-2 gap-8 text-center text-xs text-slate-700">
              <div className="p-4 rounded-xl border border-dashed border-slate-300">
                <p className="font-semibold text-slate-500">Mengetahui,</p>
                <p className="font-bold text-slate-900 mt-1">KETUA RW 44</p>
                <div className="h-16 flex items-center justify-center text-slate-300 italic">
                  [ Tanda Tangan ]
                </div>
                <p className="font-bold text-slate-900">( BP. AGUS RIYANTO )</p>
              </div>

              <div className="p-4 rounded-xl border border-dashed border-slate-300">
                <p className="font-semibold text-slate-500">Yogyakarta, {selectedBulan} {selectedTahun}</p>
                <p className="font-bold text-slate-900 mt-1">BENDAHARA JIMPITAN</p>
                <div className="h-16 flex items-center justify-center text-slate-300 italic">
                  [ Tanda Tangan ]
                </div>
                <p className="font-bold text-slate-900">( {currentUser?.name ? currentUser.name.toUpperCase() : 'PENGURUS'} )</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900">Tambah Data Warga ke Rekap</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNewEntry} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Warga / Kepala Keluarga *</label>
                <input
                  type="text"
                  required
                  value={newNama}
                  onChange={(e) => setNewNama(e.target.value)}
                  placeholder="Contoh: A. RAFIQ"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Blok Rumah *</label>
                <input
                  type="text"
                  required
                  value={newBlok}
                  onChange={(e) => setNewBlok(e.target.value)}
                  placeholder="Contoh: B1.1, C1.2, H.5"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Denda Ronda (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    value={newDendaRonda}
                    onChange={(e) => setNewDendaRonda(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bagi Jimpitan (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={newBagiJimpitan}
                    onChange={(e) => setNewBagiJimpitan(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tdk Isi Jimpitan (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={newTdkIsiJimpitan}
                    onChange={(e) => setNewTdkIsiJimpitan(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Setoran Regu (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    value={newSetoranRegu}
                    onChange={(e) => setNewSetoranRegu(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Tunggakan Bln Lalu (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    value={newTunggakan}
                    onChange={(e) => setNewTunggakan(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700">Estimasi Total Jumlah:</span>
                <span className="font-bold font-mono text-emerald-800 text-sm">
                  Rp{' '}
                  {(
                    Number(newDendaRonda) +
                    Number(newBagiJimpitan) +
                    Number(newTdkIsiJimpitan) +
                    Number(newSetoranRegu) +
                    Number(newTunggakan)
                  ).toLocaleString('id-ID')}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold shadow-xs"
                >
                  Tambahkan ke Blangko
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showImportModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900">Import Rekap Jimpitan Ronda CSV</h3>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-600">
              <p>
                Unggah file CSV rekapitulasi sesuai urutan kolom blangko:
              </p>
              <div className="bg-slate-50 p-2.5 rounded-lg font-mono text-[10px] text-slate-700 border border-slate-200 break-all">
                NO, NAMA, BLOK, DENDA_RONDA, BAGI_JIMPITAN, TDK_ISI_JIMPITAN, SETORAN_REGU, TUNGGAKAN, JUMLAH, STATUS
              </div>

              <input
                type="file"
                ref={fileInputRef}
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-emerald-50/20"
              >
                <Upload className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="font-semibold text-slate-800 text-xs">
                  Klik untuk memilih file CSV
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Atau seret file CSV ke area ini
                </p>
              </div>

              {importMessage && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                  {importMessage}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-semibold text-xs"
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