import React, { useState, useRef, useMemo, useEffect } from 'react';
import { UserRole, RekapJimpitanRondaEntry, KelompokRonda } from '../../types';
import { supabase } from '../../lib/supabase';
import {
  Coins,
  ShieldCheck,
  PlusCircle,
  Search,
  Filter,
  Printer,
  Download,
  Upload,
  FileText,
  X,
  CalendarDays,
  Lock,
  Loader2
} from 'lucide-react';

export interface JimpitanHarianEntry {
  id: string;
  no: number;
  nama: string;
  blok: string;
  senin: number;
  selasa: number;
  rabu: number;
  kamis: number;
  jumat: number;
  sabtu: number;
  minggu: number;
  bulan?: string;
  tahun?: string;
}

interface IuranRondaContentProps {
  activeRole: UserRole;
  rekapJimpitan?: RekapJimpitanRondaEntry[];
  kelompokRonda?: KelompokRonda[];
  onUpdateItem?: (id: string, updated: Partial<RekapJimpitanRondaEntry>) => void;
  onAddItem?: (item: Omit<RekapJimpitanRondaEntry, 'id'>) => void;
  onToggleStatus?: (id: string) => void;
  onUpdateKelompokRonda?: (hari: string, updated: Partial<KelompokRonda>) => void;
  onImportCsv?: (items: RekapJimpitanRondaEntry[]) => number;
}

export const IuranRondaContent: React.FC<IuranRondaContentProps> = ({
  activeRole,
  rekapJimpitan = [],
  kelompokRonda = [],
  onUpdateItem,
  onAddItem,
  onToggleStatus,
  onUpdateKelompokRonda,
  onImportCsv,
}) => {
  const canEdit = activeRole === 'perekap_jimpitan' || activeRole === 'super_admin';

  const [activeTab, setActiveTab] = useState<'blangko' | 'harian'>('blangko');
  const [selectedBulan, setSelectedBulan] = useState('September');
  const [selectedTahun, setSelectedTahun] = useState('2026');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBlok, setFilterBlok] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'lunas' | 'terutang'>('all');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // State rekapitulasi warga
  const [rekapList, setRekapList] = useState<RekapJimpitanRondaEntry[]>(rekapJimpitan);

  // Form Tambah Warga
  const [newNama, setNewNama] = useState('');
  const [newBlok, setNewBlok] = useState('');
  const [newDendaRonda, setNewDendaRonda] = useState<number>(0);
  const [newBagiJimpitan, setNewBagiJimpitan] = useState<number>(0);
  const [newTdkIsiJimpitan, setNewTdkIsiJimpitan] = useState<number>(0);
  const [newSetoranRegu, setNewSetoranRegu] = useState<number>(0);
  const [newTunggakan, setNewTunggakan] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // State Jimpitan Harian Tab II
  const [jimpitanHarianList, setJimpitanHarianList] = useState<JimpitanHarianEntry[]>([]);

  // 1. Synchronize & Fetch Rekap Warga dari Supabase
  useEffect(() => {
    let isMounted = true;

    const fetchRekapData = async () => {
      try {
        const { data, error } = await supabase
          .from('rekap_jimpitan_ronda')
          .select('*')
          .eq('bulan', selectedBulan)
          .eq('tahun', Number(selectedTahun));

        if (error) {
          console.error('Gagal mengambil data rekap:', error.message);
          if (isMounted) setRekapList(rekapJimpitan);
          return;
        }

        if (isMounted) {
          if (data && data.length > 0) {
            const formattedData = data.map((item: any) => ({
              ...item,
              nama: item.nama || item.nama_warga || '-',
              blok: item.blok || item.no_rumah || '-',
            }));

            const mapDb = new Map(
              formattedData.map((d) => [
                `${(d.nama || '').trim().toUpperCase()}_${(d.blok || '').trim().toUpperCase()}`,
                d,
              ])
            );

            const merged = rekapJimpitan.map((base) => {
              const key = `${(base.nama || (base as any).nama_warga || '').trim().toUpperCase()}_${(base.blok || (base as any).no_rumah || '').trim().toUpperCase()}`;
              return mapDb.has(key) ? mapDb.get(key)! : base;
            });

            formattedData.forEach((dbItem: any) => {
              const key = `${(dbItem.nama || '').trim().toUpperCase()}_${(dbItem.blok || '').trim().toUpperCase()}`;
              const exists = merged.some(
                (m) => `${(m.nama || '').trim().toUpperCase()}_${(m.blok || '').trim().toUpperCase()}` === key
              );
              if (!exists) merged.push(dbItem);
            });

            setRekapList(merged);
          } else {
            setRekapList(rekapJimpitan);
          }
        }
      } catch (err) {
        console.error('Error fetching rekap:', err);
        if (isMounted) setRekapList(rekapJimpitan);
      }
    };

    fetchRekapData();

    return () => {
      isMounted = false;
    };
  }, [selectedBulan, selectedTahun, rekapJimpitan]);

  // 2. Fetch & Merge Data Jimpitan Harian Tab II (Mencegah Warga Hilang saat Diisi)
  useEffect(() => {
    let isMounted = true;

    const fetchJimpitanHarian = async () => {
      try {
        const { data, error } = await supabase
          .from('jimpitan_harian')
          .select('*')
          .eq('bulan', selectedBulan)
          .eq('tahun', Number(selectedTahun));

        if (error) {
          console.error('Gagal mengambil data jimpitan harian:', error.message);
        }

        if (isMounted) {
          const mapDb = new Map<string, any>();
          if (data && data.length > 0) {
            data.forEach((d: any) => {
              const key = `${(d.nama || '').trim().toUpperCase()}_${(d.blok || '').trim().toUpperCase()}`;
              mapDb.set(key, d);
            });
          }

          // Kunci perbaikan: Merge seluruh daftar rekapList dengan data DB
          const completeHarianList: JimpitanHarianEntry[] = rekapList.map((item, idx) => {
            const namaVal = item.nama || (item as any).nama_warga || '-';
            const blokVal = item.blok || (item as any).no_rumah || '-';
            const key = `${namaVal.trim().toUpperCase()}_${blokVal.trim().toUpperCase()}`;

            if (mapDb.has(key)) {
              const dbRow = mapDb.get(key);
              return {
                id: dbRow.id,
                no: item.no || idx + 1,
                nama: namaVal,
                blok: blokVal,
                senin: Number(dbRow.senin) || 0,
                selasa: Number(dbRow.selasa) || 0,
                rabu: Number(dbRow.rabu) || 0,
                kamis: Number(dbRow.kamis) || 0,
                jumat: Number(dbRow.jumat) || 0,
                sabtu: Number(dbRow.sabtu) || 0,
                minggu: Number(dbRow.minggu) || 0,
                bulan: selectedBulan,
                tahun: selectedTahun,
              };
            } else {
              return {
                id: `jh-${selectedBulan}-${selectedTahun}-${idx + 1}`,
                no: item.no || idx + 1,
                nama: namaVal,
                blok: blokVal,
                senin: 0,
                selasa: 0,
                rabu: 0,
                kamis: 0,
                jumat: 0,
                sabtu: 0,
                minggu: 0,
                bulan: selectedBulan,
                tahun: selectedTahun,
              };
            }
          });

          setJimpitanHarianList(completeHarianList);
        }
      } catch (err) {
        console.error('Error fetching harian:', err);
      }
    };

    fetchJimpitanHarian();

    return () => {
      isMounted = false;
    };
  }, [selectedBulan, selectedTahun, rekapList]);

  // Fungsi hitung total jimpitan 1 minggu warga
  const calculateTotalHarianWarga = (entry: JimpitanHarianEntry) => {
    return (
      (entry.senin || 0) +
      (entry.selasa || 0) +
      (entry.rabu || 0) +
      (entry.kamis || 0) +
      (entry.jumat || 0) +
      (entry.sabtu || 0) +
      (entry.minggu || 0)
    );
  };

  // Map total harian per warga (key: NAMA_BLOK)
  const harianTotalsMap = useMemo(() => {
    const map = new Map<string, number>();
    jimpitanHarianList.forEach((jh) => {
      const safeNama = (jh.nama || '').trim().toUpperCase();
      const safeBlok = (jh.blok || '').trim().toUpperCase();
      const key = `${safeNama}_${safeBlok}`;
      map.set(key, calculateTotalHarianWarga(jh));
    });
    return map;
  }, [jimpitanHarianList]);

  // Otomatisasi Nilai Tab II ke Tab I (tdk_isi_jimpitan)
  const effectiveRekapJimpitan = useMemo(() => {
    return rekapList.map((item) => {
      const namaVal = (item.nama || (item as any).nama_warga || '').trim();
      const blokVal = (item.blok || (item as any).no_rumah || '').trim();
      const key = `${namaVal.toUpperCase()}_${blokVal.toUpperCase()}`;

      const autoTdkIsiJimpitan = harianTotalsMap.has(key)
        ? harianTotalsMap.get(key)!
        : Number(item.tdk_isi_jimpitan || 0);

      const denda = Number(item.denda_ronda || 0);
      const bagi = Number(item.bagi_jimpitan || 0);
      const setoran = Number(item.setoran_regu || 0);
      const tunggakan = Number(item.tunggakan_bln_lalu || 0);

      const newJumlah = denda + bagi + autoTdkIsiJimpitan + setoran + tunggakan;

      return {
        ...item,
        nama: namaVal,
        blok: blokVal,
        denda_ronda: denda,
        bagi_jimpitan: bagi,
        tdk_isi_jimpitan: autoTdkIsiJimpitan,
        setoran_regu: setoran,
        tunggakan_bln_lalu: tunggakan,
        jumlah: newJumlah,
      };
    });
  }, [rekapList, harianTotalsMap]);

  // Handler Perubahan Input Tab I
  const handleFieldChange = async (
    id: string,
    field: 'denda_ronda' | 'bagi_jimpitan' | 'setoran_regu' | 'tunggakan_bln_lalu',
    val: number
  ) => {
    if (!canEdit) return;

    setRekapList((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: val } : row))
    );

    const target = effectiveRekapJimpitan.find((item) => item.id === id);
    if (!target) return;

    const updatedValue = { ...target, [field]: val };
    const newJumlah =
      (Number(updatedValue.denda_ronda) || 0) +
      (Number(updatedValue.bagi_jimpitan) || 0) +
      (Number(updatedValue.tdk_isi_jimpitan) || 0) +
      (Number(updatedValue.setoran_regu) || 0) +
      (Number(updatedValue.tunggakan_bln_lalu) || 0);

    const payload = {
      id: target.id,
      no: target.no,
      nama: target.nama,
      blok: target.blok,
      denda_ronda: Number(updatedValue.denda_ronda) || 0,
      bagi_jimpitan: Number(updatedValue.bagi_jimpitan) || 0,
      tdk_isi_jimpitan: Number(updatedValue.tdk_isi_jimpitan) || 0,
      setoran_regu: Number(updatedValue.setoran_regu) || 0,
      tunggakan_bln_lalu: Number(updatedValue.tunggakan_bln_lalu) || 0,
      jumlah: newJumlah,
      status: target.status || (newJumlah === 0 ? 'lunas' : 'terutang'),
      bulan: selectedBulan,
      tahun: Number(selectedTahun),
    };

    if (onUpdateItem) onUpdateItem(id, payload);

    try {
      setIsSaving(true);
      await supabase.from('rekap_jimpitan_ronda').upsert(payload, { onConflict: 'id' });
    } catch (err) {
      console.error('Gagal update ke Supabase:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Handler Perubahan Nilai Tab II & Upsert ke Supabase
  const handleHarianValueChange = async (
    id: string,
    field: 'senin' | 'selasa' | 'rabu' | 'kamis' | 'jumat' | 'sabtu' | 'minggu',
    val: number
  ) => {
    if (!canEdit) return;

    const updatedList = jimpitanHarianList.map((row) =>
      row.id === id ? { ...row, [field]: val } : row
    );
    setJimpitanHarianList(updatedList);

    const targetRow = updatedList.find((row) => row.id === id);
    if (!targetRow) return;

    try {
      setIsSaving(true);
      const payload = {
        id: targetRow.id,
        no: targetRow.no,
        nama: targetRow.nama,
        blok: targetRow.blok,
        senin: targetRow.senin || 0,
        selasa: targetRow.selasa || 0,
        rabu: targetRow.rabu || 0,
        kamis: targetRow.kamis || 0,
        jumat: targetRow.jumat || 0,
        sabtu: targetRow.sabtu || 0,
        minggu: targetRow.minggu || 0,
        bulan: selectedBulan,
        tahun: Number(selectedTahun),
      };

      const { error } = await supabase.from('jimpitan_harian').upsert(payload, { onConflict: 'id' });
      if (error) console.error('Gagal upsert jimpitan harian:', error.message);
    } catch (err) {
      console.error('Gagal simpan harian:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Status Lunas / Terutang
  const handleToggleStatusItem = async (item: RekapJimpitanRondaEntry) => {
    if (!canEdit) return;
    const nextStatus = item.status === 'lunas' ? 'terutang' : 'lunas';

    setRekapList((prev) =>
      prev.map((row) => (row.id === item.id ? { ...row, status: nextStatus } : row))
    );

    if (onToggleStatus) onToggleStatus(item.id);

    try {
      setIsSaving(true);
      await supabase.from('rekap_jimpitan_ronda').update({ status: nextStatus }).eq('id', item.id);
    } catch (err) {
      console.error('Error toggle status:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Kalkulasi Total Tab I
  const totalDendaRonda = useMemo(() => effectiveRekapJimpitan.reduce((acc, curr) => acc + (Number(curr.denda_ronda) || 0), 0), [effectiveRekapJimpitan]);
  const totalBagiJimpitan = useMemo(() => effectiveRekapJimpitan.reduce((acc, curr) => acc + (Number(curr.bagi_jimpitan) || 0), 0), [effectiveRekapJimpitan]);
  const totalTdkIsiJimpitan = useMemo(() => effectiveRekapJimpitan.reduce((acc, curr) => acc + (Number(curr.tdk_isi_jimpitan) || 0), 0), [effectiveRekapJimpitan]);
  const totalSetoranRegu = useMemo(() => effectiveRekapJimpitan.reduce((acc, curr) => acc + (Number(curr.setoran_regu) || 0), 0), [effectiveRekapJimpitan]);
  const totalTunggakan = useMemo(() => effectiveRekapJimpitan.reduce((acc, curr) => acc + (Number(curr.tunggakan_bln_lalu) || 0), 0), [effectiveRekapJimpitan]);
  const totalKeseluruhan = useMemo(() => effectiveRekapJimpitan.reduce((acc, curr) => acc + (Number(curr.jumlah) || 0), 0), [effectiveRekapJimpitan]);

  // Kalkulasi Total Tab II
  const totalHarianPerHari = useMemo(() => {
    const totals = { senin: 0, selasa: 0, rabu: 0, kamis: 0, jumat: 0, sabtu: 0, minggu: 0, grand: 0 };
    jimpitanHarianList.forEach((jh) => {
      totals.senin += jh.senin || 0;
      totals.selasa += jh.selasa || 0;
      totals.rabu += jh.rabu || 0;
      totals.kamis += jh.kamis || 0;
      totals.jumat += jh.jumat || 0;
      totals.sabtu += jh.sabtu || 0;
      totals.minggu += jh.minggu || 0;
      totals.grand += calculateTotalHarianWarga(jh);
    });
    return totals;
  }, [jimpitanHarianList]);

  const filteredList = useMemo(() => {
    const term = (searchQuery || '').trim().toLowerCase();
    return effectiveRekapJimpitan.filter((item) => {
      const itemNama = (item.nama || '').toLowerCase();
      const itemBlok = (item.blok || '').toLowerCase();
      const matchSearch = !term || itemNama.includes(term) || itemBlok.includes(term);
      const matchBlok = filterBlok === 'all' || itemBlok.toUpperCase().startsWith(filterBlok.toUpperCase());
      const matchStatus = filterStatus === 'all' || item.status === filterStatus;
      return matchSearch && matchBlok && matchStatus;
    });
  }, [effectiveRekapJimpitan, searchQuery, filterBlok, filterStatus]);

  const filteredHarianList = useMemo(() => {
    const term = (searchQuery || '').trim().toLowerCase();
    return jimpitanHarianList.filter((jh) => {
      const itemNama = (jh.nama || '').toLowerCase();
      const itemBlok = (jh.blok || '').toLowerCase();
      return !term || itemNama.includes(term) || itemBlok.includes(term);
    });
  }, [jimpitanHarianList, searchQuery]);

  const handleAddNewEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNama.trim() || !canEdit) return;

    const newId = `rekap-${Date.now()}`;
    const newItem = {
      id: newId,
      no: effectiveRekapJimpitan.length + 1,
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
      status: 'terutang' as const,
      bulan: selectedBulan,
      tahun: Number(selectedTahun),
    };

    setRekapList((prev) => [...prev, newItem]);
    if (onAddItem) onAddItem(newItem);

    try {
      setIsSaving(true);
      await supabase.from('rekap_jimpitan_ronda').insert([newItem]);
    } catch (err) {
      console.error('Gagal menambah baris:', err);
    } finally {
      setIsSaving(false);
    }

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
    const headers = ['NO', 'NAMA', 'BLOK', 'DENDA RONDA', 'BAGI JIMPITAN', 'TDK ISI JIMPITAN', 'SETORAN REGU', 'TUNGGAKAN', 'JUMLAH', 'STATUS'];
    const rows = effectiveRekapJimpitan.map((item) => [
      item.no,
      `"${item.nama || ''}"`,
      `"${item.blok || ''}"`,
      item.denda_ronda || 0,
      item.bagi_jimpitan || 0,
      item.tdk_isi_jimpitan || 0,
      item.setoran_regu || 0,
      item.tunggakan_bln_lalu || 0,
      item.jumlah || 0,
      item.status || 'terutang',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Iuran_Ronda_RW44_${selectedBulan}_${selectedTahun}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;

      const lines = text.split('\n').filter((l) => l.trim().length > 0);
      const parsedItems: RekapJimpitanRondaEntry[] = [];

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
        if (cols.length >= 3) {
          const nama = cols[1] || '';
          const blok = cols[2] || '-';
          if (!nama) continue;

          parsedItems.push({
            id: `import-${Date.now()}-${i}`,
            no: Number(cols[0]) || i,
            nama,
            blok,
            denda_ronda: Number(cols[3]) || 0,
            bagi_jimpitan: Number(cols[4]) || 0,
            tdk_isi_jimpitan: Number(cols[5]) || 0,
            setoran_regu: Number(cols[6]) || 0,
            tunggakan_bln_lalu: Number(cols[7]) || 0,
            jumlah: Number(cols[8]) || 0,
            status: cols[9]?.toLowerCase() === 'lunas' ? 'lunas' : 'terutang',
            bulan: selectedBulan,
            tahun: Number(selectedTahun),
          });
        }
      }

      if (parsedItems.length > 0) {
        if (onImportCsv) onImportCsv(parsedItems);

        try {
          setIsSaving(true);
          await supabase.from('rekap_jimpitan_ronda').upsert(parsedItems, { onConflict: 'id' });
          setImportMessage(`Berhasil mengimpor ${parsedItems.length} data ke Supabase.`);
        } catch (err) {
          console.error('Gagal import ke Supabase:', err);
          setImportMessage('Gagal menyimpan impor ke Supabase.');
        } finally {
          setIsSaving(false);
        }

        setTimeout(() => {
          setShowImportModal(false);
          setImportMessage(null);
        }, 1500);
      } else {
        setImportMessage('Format CSV tidak valid.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      {!canEdit && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2 text-xs text-amber-800">
          <Lock className="w-4 h-4 shrink-0 text-amber-600" />
          <span>Mode Lihat Saja (Read-Only). Edit hanya untuk Perekap Jimpitan / Admin.</span>
        </div>
      )}

      {/* Control Banner */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between bg-slate-100 p-2.5 rounded-xl border border-slate-200 text-xs gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Periode:</span>
            <select
              value={selectedBulan}
              onChange={(e) => setSelectedBulan(e.target.value)}
              className="bg-white border border-slate-300 rounded px-2 py-1 font-semibold text-xs"
            >
              {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <input
              type="text"
              value={selectedTahun}
              onChange={(e) => setSelectedTahun(e.target.value)}
              className="bg-white border border-slate-300 rounded px-2 py-1 w-16 font-semibold text-center text-xs"
            />
            {isSaving && (
              <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                <Loader2 className="w-3 h-3 animate-spin" /> Menyimpan...
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => window.print()}
              className="p-1.5 bg-white border border-slate-300 rounded hover:bg-slate-50 text-slate-700"
              title="Cetak"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleCsvExport}
              className="p-1.5 bg-white border border-slate-300 rounded hover:bg-slate-50 text-slate-700"
              title="Export CSV"
            >
              <Download className="w-4 h-4" />
            </button>
            {canEdit && (
              <button
                onClick={() => setShowImportModal(true)}
                className="px-2.5 py-1 bg-emerald-600 text-white rounded font-bold hover:bg-emerald-700 flex items-center gap-1"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 border-b border-slate-200 pb-2 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab('blangko')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'blangko' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> I. Rekap Warga
          </button>
          <button
            onClick={() => setActiveTab('harian')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'harian' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" /> II. Jimpitan Harian
          </button>
        </div>
      </div>

      {/* TAB I: REKAPITULASI WARGA */}
      {activeTab === 'blangko' && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="relative flex-1 min-w-[150px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama/blok..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2 py-1 bg-white border border-slate-300 rounded text-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="bg-white border border-slate-300 text-xs rounded px-2 py-1"
              >
                <option value="all">Semua Status</option>
                <option value="lunas">Lunas</option>
                <option value="terutang">Terutang</option>
              </select>
              {canEdit && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded flex items-center gap-1 hover:bg-emerald-700"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Tambah Baris
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-100 font-bold text-slate-700 text-[11px] text-center uppercase border-b border-slate-200">
                  <th className="py-2 px-2 border-r w-10">NO</th>
                  <th className="py-2 px-3 border-r text-left min-w-[140px]">NAMA</th>
                  <th className="py-2 px-2 border-r w-16">BLOK</th>
                  <th className="py-2 px-2 border-r w-24">DENDA</th>
                  <th className="py-2 px-2 border-r w-24">BAGI JIMP.</th>
                  <th className="py-2 px-2 border-r w-24 bg-amber-50">TDK ISI</th>
                  <th className="py-2 px-2 border-r w-24">SETORAN</th>
                  <th className="py-2 px-2 border-r w-24">TUNGGAKAN</th>
                  <th className="py-2 px-3 border-r w-28 font-extrabold bg-emerald-50">JUMLAH</th>
                  <th className="py-2 px-2 w-20">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-6 text-center text-slate-400">Belum ada data.</td>
                  </tr>
                ) : (
                  filteredList.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 font-mono text-[11px]">
                      <td className="py-2 px-2 text-center border-r font-sans">{item.no || idx + 1}</td>
                      <td className="py-2 px-3 border-r font-bold font-sans text-slate-800">
                        {item.nama || (item as any).nama_warga || '-'}
                      </td>
                      <td className="py-2 px-2 text-center border-r font-sans">
                        {item.blok || (item as any).no_rumah || '-'}
                      </td>

                      <td className="py-1 px-1 text-center border-r">
                        {canEdit ? (
                          <input
                            type="number"
                            min="0"
                            value={item.denda_ronda || ''}
                            onChange={(e) => handleFieldChange(item.id, 'denda_ronda', Number(e.target.value) || 0)}
                            placeholder="0"
                            className="w-full text-right border border-slate-200 focus:border-emerald-500 rounded px-1.5 py-1 text-[11px] font-mono focus:outline-none"
                          />
                        ) : (
                          <span className="text-right block pr-1">
                            {item.denda_ronda ? `Rp ${Number(item.denda_ronda).toLocaleString('id-ID')}` : '-'}
                          </span>
                        )}
                      </td>

                      <td className="py-1 px-1 text-center border-r">
                        {canEdit ? (
                          <input
                            type="number"
                            min="0"
                            value={item.bagi_jimpitan || ''}
                            onChange={(e) => handleFieldChange(item.id, 'bagi_jimpitan', Number(e.target.value) || 0)}
                            placeholder="0"
                            className="w-full text-right border border-slate-200 focus:border-emerald-500 rounded px-1.5 py-1 text-[11px] font-mono focus:outline-none"
                          />
                        ) : (
                          <span className="text-right block pr-1">
                            {item.bagi_jimpitan ? `Rp ${Number(item.bagi_jimpitan).toLocaleString('id-ID')}` : '-'}
                          </span>
                        )}
                      </td>

                      {/* TDK ISI JIMPITAN (OTOMATIS MASUK DARI TAB II) */}
                      <td className="py-2 px-2 text-right border-r bg-amber-50/50 font-bold text-amber-900">
                        Rp {Number(item.tdk_isi_jimpitan || 0).toLocaleString('id-ID')}
                      </td>

                      <td className="py-1 px-1 text-center border-r">
                        {canEdit ? (
                          <input
                            type="number"
                            min="0"
                            value={item.setoran_regu || ''}
                            onChange={(e) => handleFieldChange(item.id, 'setoran_regu', Number(e.target.value) || 0)}
                            placeholder="0"
                            className="w-full text-right border border-slate-200 focus:border-emerald-500 rounded px-1.5 py-1 text-[11px] font-mono focus:outline-none"
                          />
                        ) : (
                          <span className="text-right block pr-1">
                            {item.setoran_regu ? `Rp ${Number(item.setoran_regu).toLocaleString('id-ID')}` : '-'}
                          </span>
                        )}
                      </td>

                      <td className="py-1 px-1 text-center border-r">
                        {canEdit ? (
                          <input
                            type="number"
                            min="0"
                            value={item.tunggakan_bln_lalu || ''}
                            onChange={(e) => handleFieldChange(item.id, 'tunggakan_bln_lalu', Number(e.target.value) || 0)}
                            placeholder="0"
                            className="w-full text-right border border-slate-200 focus:border-emerald-500 text-rose-700 font-bold rounded px-1.5 py-1 text-[11px] font-mono focus:outline-none"
                          />
                        ) : (
                          <span className="text-right block pr-1 text-rose-700 font-bold">
                            {item.tunggakan_bln_lalu ? `Rp ${Number(item.tunggakan_bln_lalu).toLocaleString('id-ID')}` : '-'}
                          </span>
                        )}
                      </td>

                      <td className="py-2 px-3 text-right border-r font-extrabold bg-emerald-50 text-slate-900">
                        Rp {Number(item.jumlah || 0).toLocaleString('id-ID')}
                      </td>

                      <td className="py-2 px-2 text-center font-sans">
                        <button
                          disabled={!canEdit}
                          onClick={() => handleToggleStatusItem(item)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide transition-all ${
                            item.status === 'lunas' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                          } ${canEdit ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default'}`}
                        >
                          {item.status === 'lunas' ? 'LUNAS' : 'TERUTANG'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-bold text-slate-900 border-t border-slate-300 text-[11px]">
                  <td colSpan={3} className="py-2 px-3 text-center uppercase">TOTAL</td>
                  <td className="py-2 px-2 text-right font-mono">Rp {totalDendaRonda.toLocaleString('id-ID')}</td>
                  <td className="py-2 px-2 text-right font-mono">Rp {totalBagiJimpitan.toLocaleString('id-ID')}</td>
                  <td className="py-2 px-2 text-right font-mono text-amber-900">Rp {totalTdkIsiJimpitan.toLocaleString('id-ID')}</td>
                  <td className="py-2 px-2 text-right font-mono">Rp {totalSetoranRegu.toLocaleString('id-ID')}</td>
                  <td className="py-2 px-2 text-right font-mono text-rose-700">Rp {totalTunggakan.toLocaleString('id-ID')}</td>
                  <td className="py-2 px-3 text-right font-mono bg-emerald-200 text-emerald-950 font-extrabold">Rp {totalKeseluruhan.toLocaleString('id-ID')}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* TAB II: JIMPITAN HARIAN */}
      {activeTab === 'harian' && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs text-slate-600 font-medium">
              Pencatatan Harian Nominal Jimpitan Warga (Otomatis Menghitung Total Ke Tab I). Total: <b>{jimpitanHarianList.length} Warga</b>
            </div>
            <div className="relative w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama/blok..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2 py-1 bg-white border border-slate-300 rounded text-xs"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-slate-100 font-bold text-slate-700 text-[11px] text-center uppercase border-b border-slate-200">
                  <th className="py-2 px-2 border-r w-10">NO</th>
                  <th className="py-2 px-3 border-r text-left min-w-[140px]">NAMA</th>
                  <th className="py-2 px-2 border-r w-16">BLOK</th>
                  <th className="py-2 px-2 border-r">SENIN</th>
                  <th className="py-2 px-2 border-r">SELASA</th>
                  <th className="py-2 px-2 border-r">RABU</th>
                  <th className="py-2 px-2 border-r">KAMIS</th>
                  <th className="py-2 px-2 border-r">JUMAT</th>
                  <th className="py-2 px-2 border-r">SABTU</th>
                  <th className="py-2 px-2 border-r">MINGGU</th>
                  <th className="py-2 px-3 font-bold bg-emerald-50 min-w-[90px]">TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredHarianList.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-6 text-center text-slate-400">Belum ada data warga harian.</td>
                  </tr>
                ) : (
                  filteredHarianList.map((jh, idx) => {
                    const total = calculateTotalHarianWarga(jh);
                    return (
                      <tr key={jh.id} className="hover:bg-slate-50 font-mono text-[11px]">
                        <td className="py-2 px-2 text-center border-r font-sans">{jh.no || idx + 1}</td>
                        <td className="py-2 px-3 border-r font-bold font-sans text-slate-800">{jh.nama || '-'}</td>
                        <td className="py-2 px-2 text-center border-r font-sans">{jh.blok || '-'}</td>

                        {(['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu'] as const).map((day) => (
                          <td key={day} className="py-2 px-2 text-center border-r">
                            {canEdit ? (
                              <input
                                type="number"
                                value={jh[day] || ''}
                                onChange={(e) => handleHarianValueChange(jh.id, day, Number(e.target.value) || 0)}
                                className="w-12 text-center border border-slate-300 rounded px-0.5 py-0.5 font-mono text-[11px] focus:border-emerald-500 focus:outline-none"
                              />
                            ) : (
                              jh[day] || 0
                            )}
                          </td>
                        ))}

                        <td className="py-2 px-3 text-right font-extrabold bg-emerald-50 text-slate-900">
                          Rp {total.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-bold text-slate-900 border-t border-slate-300 text-[11px]">
                  <td colSpan={3} className="py-2 px-3 text-center uppercase">TOTAL PER HARI</td>
                  <td className="py-2 px-2 text-center font-mono">Rp {totalHarianPerHari.senin.toLocaleString('id-ID')}</td>
                  <td className="py-2 px-2 text-center font-mono">Rp {totalHarianPerHari.selasa.toLocaleString('id-ID')}</td>
                  <td className="py-2 px-2 text-center font-mono">Rp {totalHarianPerHari.rabu.toLocaleString('id-ID')}</td>
                  <td className="py-2 px-2 text-center font-mono">Rp {totalHarianPerHari.kamis.toLocaleString('id-ID')}</td>
                  <td className="py-2 px-2 text-center font-mono">Rp {totalHarianPerHari.jumat.toLocaleString('id-ID')}</td>
                  <td className="py-2 px-2 text-center font-mono">Rp {totalHarianPerHari.sabtu.toLocaleString('id-ID')}</td>
                  <td className="py-2 px-2 text-center font-mono">Rp {totalHarianPerHari.minggu.toLocaleString('id-ID')}</td>
                  <td className="py-2 px-3 text-right font-mono bg-emerald-200 text-emerald-950 font-extrabold">
                    Rp {totalHarianPerHari.grand.toLocaleString('id-ID')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH BARIS */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-800 text-sm">Tambah Rekap Warga Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewEntry} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nama Warga</label>
                  <input
                    type="text"
                    required
                    value={newNama}
                    onChange={(e) => setNewNama(e.target.value)}
                    placeholder="Contoh: BUDI"
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Blok / No. Rumah</label>
                  <input
                    type="text"
                    value={newBlok}
                    onChange={(e) => setNewBlok(e.target.value)}
                    placeholder="Contoh: H.10"
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Denda Ronda (Rp)</label>
                  <input
                    type="number"
                    value={newDendaRonda}
                    onChange={(e) => setNewDendaRonda(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Bagi Jimpitan (Rp)</label>
                  <input
                    type="number"
                    value={newBagiJimpitan}
                    onChange={(e) => setNewBagiJimpitan(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tdk Isi Jimpitan (Rp)</label>
                  <input
                    type="number"
                    value={newTdkIsiJimpitan}
                    onChange={(e) => setNewTdkIsiJimpitan(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Setoran Regu (Rp)</label>
                  <input
                    type="number"
                    value={newSetoranRegu}
                    onChange={(e) => setNewSetoranRegu(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tunggakan Bln Lalu (Rp)</label>
                <input
                  type="number"
                  value={newTunggakan}
                  onChange={(e) => setNewTunggakan(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded font-bold hover:bg-emerald-700"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL IMPORT CSV */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-800 text-sm">Import Data Rekap (CSV)</h3>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                Pilih file CSV dengan struktur kolom: <br />
                <code className="bg-slate-100 px-1 py-0.5 rounded text-[10px] text-slate-800 block mt-1">
                  NO, NAMA, BLOK, DENDA, BAGI, TDK_ISI, SETORAN, TUNGGAKAN, JUMLAH, STATUS
                </code>
              </p>

              <input
                type="file"
                ref={fileInputRef}
                accept=".csv"
                onChange={handleFileImport}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl hover:bg-slate-200/50 font-semibold text-slate-700 flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4 text-slate-500" />
                <span>Pilih File CSV</span>
              </button>

              {importMessage && (
                <div className={`p-2 rounded text-center font-semibold text-xs ${
                  importMessage.includes('Berhasil') ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                }`}>
                  {importMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};