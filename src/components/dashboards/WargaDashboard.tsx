import React, { useState } from 'react';
import {
  UserProfile,
  KasRW,
  Notulen,
  Warga,
  JimpitanDenda,
  Koperasi,
  RincianKewajibanArisan,
  AgendaArisanRW,
  RekapJimpitanRondaEntry,
  KelompokRonda,
} from '../../types';
import {
  Users,
  Wallet,
  FileText,
  Search,
  CheckCircle2,
  Calendar,
  AlertCircle,
  QrCode,
  Landmark,
  ShieldCheck,
  Coins,
  ArrowUpDown,
  Download,
  Printer,
  Info,
  Layers,
  MapPin,
  Check,
  Clock,
  UserCheck,
} from 'lucide-react';
import {
  INITIAL_RINCIAN_ARISAN_RW44,
  AGENDA_ARISAN_RW44,
} from '../../lib/dataRW44';

interface WargaDashboardProps {
  currentUser: UserProfile;
  kasRW: KasRW[];
  notulen: Notulen[];
  warga: Warga[];
  jimpitan: JimpitanDenda[];
  koperasi: Koperasi[];
  rincianArisan?: RincianKewajibanArisan[];
  agendaArisan?: AgendaArisanRW;
  rekapJimpitan?: RekapJimpitanRondaEntry[];
  kelompokRonda?: KelompokRonda[];
  onToggleRincianStatus?: (id: string) => void;
}

export const WargaDashboard: React.FC<WargaDashboardProps> = ({
  currentUser,
  kasRW,
  notulen,
  warga,
  jimpitan,
  koperasi,
  rincianArisan = INITIAL_RINCIAN_ARISAN_RW44,
  agendaArisan = AGENDA_ARISAN_RW44,
  rekapJimpitan = [],
  kelompokRonda = [],
  onToggleRincianStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'rekap_arisan' | 'tagihan_saya' | 'transparansi_kas' | 'notulen'>('rekap_arisan');
  const [searchWarga, setSearchWarga] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'lunas' | 'belum_lunas'>('all');
  
  // Selected Warga for Personal Statement Slip (Aman dari TypeError)
  const [selectedWargaName, setSelectedWargaName] = useState<string>(() => {
    const currentName = currentUser?.nama?.toLowerCase() || '';
    const currentEmail = currentUser?.email?.toLowerCase() || '';

    const matched = rincianArisan.find((r) => {
      const itemNama = r?.nama?.toLowerCase() || '';
      return (currentName && itemNama.includes(currentName)) || (currentEmail && itemNama.includes(currentEmail));
    });

    return matched ? matched.nama : rincianArisan[1]?.nama || 'AGUS RIYANTO';
  });

  const [showQrisModal, setShowQrisModal] = useState(false);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState<string | null>(null);

  // Active citizen's slip
  const selectedSlip = rincianArisan.find((r) => r.nama === selectedWargaName) || rincianArisan[0];

  // Filtered CSV Arisan table
  const filteredArisanList = rincianArisan.filter((item) => {
    const itemNama = item?.nama?.toLowerCase() || '';
    const itemBlok = item?.blok_rumah?.toLowerCase() || '';
    const searchQuery = searchWarga.toLowerCase();

    const matchSearch = itemNama.includes(searchQuery) || itemBlok.includes(searchQuery);
    const matchStatus = filterStatus === 'all' || item.status_bayar === filterStatus;
    return matchSearch && matchStatus;
  });

  // Totals for CSV Arisan
  const totalAngsuranKoperasi = rincianArisan.reduce((s, i) => s + (Number(i.angsuran_koperasi) || 0), 0);
  const totalRonda = rincianArisan.reduce((s, i) => s + (Number(i.jmlh_kewajiban_ronda) || 0), 0);
  const totalArisan = rincianArisan.reduce((s, i) => s + (Number(i.arisan) || 0), 0);
  const totalIuranRt = rincianArisan.reduce((s, i) => s + (Number(i.iuran_rt) || 0), 0);
  const grandTotalKewajiban = rincianArisan.reduce((s, i) => s + (Number(i.jumlah_kewajiban) || 0), 0);

  // Kas RW summary
  const totalPemasukan = kasRW.filter((k) => k.jenis === 'masuk').reduce((sum, k) => sum + k.nominal, 0);
  const totalPengeluaran = kasRW.filter((k) => k.jenis === 'keluar').reduce((sum, k) => sum + k.nominal, 0);
  const saldoKas = totalPemasukan - totalPengeluaran;

  const publishedNotulen = notulen.filter((n) => n.status === 'published');

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
    link.setAttribute('download', `Rekap_Kewajiban_Arisan_RW44.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12" id="warga-dashboard-screen">
      {/* Top Banner: Agenda & Kebijakan Arisan RW 44 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wider text-emerald-800 uppercase bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                Layanan Warga Terpadu RW 44
              </span>
              <span className="text-xs text-slate-500 font-medium">Balecatur, Gamping, Sleman</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-2">
              Rekapitulasi Keuangan & Arisan Warga RW 44
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Hasil rekapitulasi gabungan dari Bendahara Jimpitan Ronda dan Bendahara Koperasi yang disusun oleh Sekretaris RW untuk transparansi seluruh warga.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col gap-2 min-w-[280px]">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
              <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{agendaArisan.hari_tanggal}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{agendaArisan.tempat}</span>
            </div>
            <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded border border-amber-200/60 mt-1">
              <strong>Kebijakan:</strong> {agendaArisan.catatan_kebijakan}
            </div>
          </div>
        </div>

        {/* Bento Totals Grid from CSV Rekap Sekretaris */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mt-6">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase block">Total Koperasi</span>
            <p className="text-lg font-bold text-slate-900 mt-1">
              Rp {totalAngsuranKoperasi.toLocaleString('id-ID')}
            </p>
            <span className="text-[10px] text-slate-400">Pinjaman & Jasa</span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase block">Total Kewajiban Ronda</span>
            <p className="text-lg font-bold text-slate-900 mt-1">
              Rp {totalRonda.toLocaleString('id-ID')}
            </p>
            <span className="text-[10px] text-slate-400">Denda, Jimpitan & Regu</span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase block">Total Arisan RW</span>
            <p className="text-lg font-bold text-slate-900 mt-1">
              Rp {totalArisan.toLocaleString('id-ID')}
            </p>
            <span className="text-[10px] text-slate-400">Iuran arisan rutin</span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase block">Total Iuran RT</span>
            <p className="text-lg font-bold text-slate-900 mt-1">
              Rp {totalIuranRt.toLocaleString('id-ID')}
            </p>
            <span className="text-[10px] text-slate-400">Kebersihan & fasilitas</span>
          </div>

          <div className="col-span-2 lg:col-span-1 bg-emerald-50 p-3.5 rounded-xl border border-emerald-200">
            <span className="text-[11px] font-bold text-emerald-800 uppercase block">Total Keseluruhan</span>
            <p className="text-lg font-bold text-emerald-950 mt-1">
              Rp {grandTotalKewajiban.toLocaleString('id-ID')}
            </p>
            <span className="text-[10px] text-emerald-700">{rincianArisan.length} Data KK Warga</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('rekap_arisan')}
          className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'rekap_arisan'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Hasil Rekap Arisan & Ronda (CSV Sekretaris)</span>
        </button>

        <button
          onClick={() => setActiveTab('tagihan_saya')}
          className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'tagihan_saya'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Slip Tagihan Mandiri Per Warga</span>
        </button>

        <button
          onClick={() => setActiveTab('transparansi_kas')}
          className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'transparansi_kas'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>Buku Kas RW & Rekapitulasi</span>
        </button>

        <button
          onClick={() => setActiveTab('notulen')}
          className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'notulen'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Notulensi Musyawarah Warga</span>
        </button>
      </div>

      {/* TAB 1: HASIL REKAP ARISAN RW 44 DARI CSV SEKRETARIS */}
      {activeTab === 'rekap_arisan' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Controls Bar */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama warga / blok rumah..."
                  value={searchWarga}
                  onChange={(e) => setSearchWarga(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="bg-white border border-slate-300 rounded-lg text-xs text-slate-700 px-3 py-1.5 outline-none"
              >
                <option value="all">Semua Status Bayar</option>
                <option value="lunas">Sudah Lunas</option>
                <option value="belum_lunas">Belum Lunas</option>
              </select>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={handleExportCsv}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Download CSV Rekap</span>
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 shadow-xs transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                <span>Cetak Laporan</span>
              </button>
            </div>
          </div>

          {/* Full Table Matching Secretary's CSV structure */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[980px]">
              <thead>
                <tr className="bg-slate-100 text-slate-800 border-b border-slate-300 text-xs font-bold uppercase">
                  <th className="py-3 px-3 w-12 text-center border-r border-slate-200">NO</th>
                  <th className="py-3 px-4 border-r border-slate-200">NAMA WARGA</th>
                  <th className="py-3 px-3 border-r border-slate-200 text-center w-20">BLOK</th>
                  <th className="py-3 px-3 border-r border-slate-200 text-center w-20">ANGS. KE</th>
                  <th className="py-3 px-3 border-r border-slate-200 text-center w-24">TGL CAIR</th>
                  <th className="py-3 px-3 border-r border-slate-200 text-right">ANGSURAN KOP.</th>
                  <th className="py-3 px-3 border-r border-slate-200 text-right">KEWAJIBAN RONDA</th>
                  <th className="py-3 px-3 border-r border-slate-200 text-right">ARISAN</th>
                  <th className="py-3 px-3 border-r border-slate-200 text-right">IURAN RT</th>
                  <th className="py-3 px-4 border-r border-slate-200 text-right bg-emerald-50/50">
                    JUMLAH KEWAJIBAN
                  </th>
                  <th className="py-3 px-3 text-center w-28">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {filteredArisanList.map((item, idx) => (
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
                      {item.nama}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono border-r border-slate-200">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium">
                        {item.blok_rumah}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-600 border-r border-slate-200">
                      {item.angsuran_ke || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-500 border-r border-slate-200 text-[11px]">
                      {item.tgl_cair || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono border-r border-slate-200">
                      {item.angsuran_koperasi > 0 ? (
                        <span>Rp {item.angsuran_koperasi.toLocaleString('id-ID')}</span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono border-r border-slate-200">
                      {item.jmlh_kewajiban_ronda > 0 ? (
                        <span className="text-amber-700 font-semibold">
                          Rp {item.jmlh_kewajiban_ronda.toLocaleString('id-ID')}
                        </span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono border-r border-slate-200">
                      {item.arisan > 0 ? (
                        <span>Rp {item.arisan.toLocaleString('id-ID')}</span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono border-r border-slate-200">
                      {item.iuran_rt > 0 ? (
                        <span>Rp {item.iuran_rt.toLocaleString('id-ID')}</span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900 border-r border-slate-200 bg-slate-50/50">
                      Rp {item.jumlah_kewajiban.toLocaleString('id-ID')}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => onToggleRincianStatus && onToggleRincianStatus(item.id)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase transition-colors ${
                          item.status_bayar === 'lunas'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        }`}
                        title="Klik untuk mengubah status konfirmasi bayar"
                      >
                        {item.status_bayar === 'lunas' ? 'LUNAS' : 'BELUM'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-bold text-slate-900 text-xs border-t-2 border-slate-300">
                  <td colSpan={5} className="py-3 px-4 text-center uppercase tracking-wider border-r border-slate-200">
                    TOTAL KESELURUHAN DARI REKAP SEKRETARIS
                  </td>
                  <td className="py-3 px-3 text-right font-mono border-r border-slate-200">
                    Rp {totalAngsuranKoperasi.toLocaleString('id-ID')}
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
                  <td className="py-3 px-4 text-right font-mono text-sm bg-emerald-100/70 text-emerald-950 border-r border-slate-200">
                    Rp {grandTotalKewajiban.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-3 text-center text-slate-500 font-normal text-[11px]">
                    {rincianArisan.length} Warga
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SLIP TAGIHAN MANDIRI PER WARGA */}
      {activeTab === 'tagihan_saya' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Selector & Details */}
          <div className="md:col-span-5 space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                Pilih Nama Warga / Blok
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Silakan pilih kepala keluarga untuk melihat rincian kewajiban arisan, koperasi, dan jimpitan ronda bulan ini.
              </p>

              <select
                value={selectedWargaName}
                onChange={(e) => setSelectedWargaName(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {rincianArisan.map((w) => (
                  <option key={w.id} value={w.nama}>
                    {w.nama} ({w.blok_rumah}) - Rp {w.jumlah_kewajiban.toLocaleString('id-ID')}
                  </option>
                ))}
              </select>

              <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Nama Lengkap:</span>
                  <span className="font-bold text-slate-900">{selectedSlip?.nama || '-'}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Blok Rumah:</span>
                  <span className="font-semibold text-slate-800">{selectedSlip?.blok_rumah || '-'}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Status Pembayaran:</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      selectedSlip?.status_bayar === 'lunas'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {selectedSlip?.status_bayar === 'lunas' ? 'LUNAS TERKONFIRMASI' : 'BELUM DIBAYAR'}
                  </span>
                </div>
                {selectedSlip?.tanggal_bayar && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Tanggal Pelunasan:</span>
                    <span className="font-mono text-slate-700">{selectedSlip.tanggal_bayar}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-200">
              <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                Pembayaran Tagihan Mandiri
              </h4>
              <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                Warga dapat melakukan transfer melalui Virtual Account RW atau pindai QRIS resmi pengurus RW 44 Balecatur.
              </p>

              <div className="flex flex-col gap-2 mt-4">
                <button
                  onClick={() => setShowQrisModal(true)}
                  className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Bayar Lewat QRIS RW 44</span>
                </button>

                {onToggleRincianStatus && selectedSlip && (
                  <button
                    onClick={() => {
                      onToggleRincianStatus(selectedSlip.id);
                      setPaymentSuccessMsg('Status pembayaran berhasil diperbarui!');
                      setTimeout(() => setPaymentSuccessMsg(null), 2500);
                    }}
                    className="w-full py-2 px-4 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition-colors"
                  >
                    {selectedSlip.status_bayar === 'lunas'
                      ? 'Tandai Belum Lunas'
                      : 'Konfirmasi Sudah Bayar Tunai'}
                  </button>
                )}
              </div>

              {paymentSuccessMsg && (
                <div className="mt-3 p-2 bg-emerald-100/80 rounded-lg text-emerald-800 text-xs text-center font-semibold">
                  {paymentSuccessMsg}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Physical Slip Receipt View */}
          <div className="md:col-span-7">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 relative">
              <div className="flex items-start justify-between border-b-2 border-slate-800 pb-4">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 uppercase">
                    SLIP RINCIAN KEWAJIBAN ARISAN RW 44
                  </h3>
                  <p className="text-xs text-slate-600">
                    Balecatur, Gamping, Sleman, D.I. Yogyakarta
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Agenda: {agendaArisan.hari_tanggal} di {agendaArisan.tempat}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">No. Urut</span>
                  <span className="text-lg font-mono font-bold text-slate-900">
                    #{String(selectedSlip?.no || 0).padStart(2, '0')}
                  </span>
                </div>
              </div>

              {/* Citizen Details */}
              <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block">Nama Anggota:</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedSlip?.nama || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Blok Rumah:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {selectedSlip?.blok_rumah || '-'}
                  </span>
                </div>
              </div>

              {/* Rincian Komponen */}
              <div className="py-4 space-y-3 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <div>
                    <span className="font-semibold text-slate-800">1. Angsuran Koperasi RW</span>
                    {selectedSlip?.angsuran_ke && (
                      <span className="text-[11px] text-slate-500 block">
                        Angsuran ke-{selectedSlip.angsuran_ke} • Cair: {selectedSlip.tgl_cair || '-'}
                      </span>
                    )}
                  </div>
                  <span className="font-mono font-semibold text-slate-900">
                    Rp {(selectedSlip?.angsuran_koperasi || 0).toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <div>
                    <span className="font-semibold text-slate-800">2. Kewajiban Ronda & Jimpitan</span>
                    <span className="text-[11px] text-slate-500 block">
                      Denda ronda, koin kaleng & tunggakan ronda
                    </span>
                  </div>
                  <span className="font-mono font-semibold text-slate-900">
                    Rp {(selectedSlip?.jmlh_kewajiban_ronda || 0).toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <div>
                    <span className="font-semibold text-slate-800">3. Iuran Arisan Rutin RW</span>
                    <span className="text-[11px] text-slate-500 block">Setoran arisan berkala</span>
                  </div>
                  <span className="font-mono font-semibold text-slate-900">
                    Rp {(selectedSlip?.arisan || 0).toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <div>
                    <span className="font-semibold text-slate-800">4. Iuran Kas RT</span>
                    <span className="text-[11px] text-slate-500 block">
                      Kebersihan lingkungan, lampu jalan, sosial
                    </span>
                  </div>
                  <span className="font-mono font-semibold text-slate-900">
                    Rp {(selectedSlip?.iuran_rt || 0).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Total Summary */}
              <div className="bg-slate-100 p-4 rounded-xl flex items-center justify-between mt-2">
                <div>
                  <span className="text-xs font-bold text-slate-700 uppercase">
                    TOTAL KEWAJIBAN YANG HARUS DIBAYAR
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Termasuk seluruh rincian di atas
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold font-mono text-emerald-800">
                    Rp {(selectedSlip?.jumlah_kewajiban || 0).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <span>Sekretariat RW 44 Balecatur</span>
                <button
                  onClick={() => window.print()}
                  className="text-emerald-700 font-semibold underline hover:text-emerald-900"
                >
                  Cetak Slip Ini (PDF / Kertas)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BUKU KAS RW & TRANSPARANSI */}
      {activeTab === 'transparansi_kas' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">Total Pemasukan Kas RW</span>
              <p className="text-xl font-bold text-emerald-700 mt-1">
                Rp {totalPemasukan.toLocaleString('id-ID')}
              </p>
              <span className="text-[11px] text-slate-400">Dari iuran, jimpitan & donatur</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">Total Pengeluaran Kas RW</span>
              <p className="text-xl font-bold text-rose-700 mt-1">
                Rp {totalPengeluaran.toLocaleString('id-ID')}
              </p>
              <span className="text-[11px] text-slate-400">Pemeliharaan, lampu & kegiatan</span>
            </div>

            <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200 shadow-xs">
              <span className="text-xs font-bold text-emerald-800 uppercase">Saldo Kas RW Aktif</span>
              <p className="text-xl font-bold text-emerald-950 mt-1">
                Rp {saldoKas.toLocaleString('id-ID')}
              </p>
              <span className="text-[11px] text-emerald-700">Tersimpan di rekening bendahara RW</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                Mutasi Buku Kas RW Terkini
              </h3>
              <span className="text-xs text-slate-500">{kasRW.length} Transaksi Tercatat</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <th className="py-2.5 px-4">TANGGAL</th>
                    <th className="py-2.5 px-4">KETERANGAN</th>
                    <th className="py-2.5 px-4">KATEGORI</th>
                    <th className="py-2.5 px-4 text-center">ARUS</th>
                    <th className="py-2.5 px-4 text-right">NOMINAL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {kasRW.slice(0, 15).map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-mono text-slate-600">{item.tanggal}</td>
                      <td className="py-2.5 px-4 font-medium text-slate-900">{item.keterangan}</td>
                      <td className="py-2.5 px-4 text-slate-500 capitalize">{item.kategori.replace('_', ' ')}</td>
                      <td className="py-2.5 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.jenis === 'masuk'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {item.jenis === 'masuk' ? 'MASUK' : 'KELUAR'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold">
                        <span className={item.jenis === 'masuk' ? 'text-emerald-700' : 'text-rose-700'}>
                          {item.jenis === 'masuk' ? '+' : '-'} Rp {item.nominal.toLocaleString('id-ID')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: NOTULEN RAPAT */}
      {activeTab === 'notulen' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Notulensi Musyawarah & Rapat Resmi RW 44
              </h3>
              <p className="text-xs text-slate-500">
                Arsip hasil pembahasan dan keputusan musyawarah warga yang telah dipublikasikan oleh Sekretaris RW.
              </p>
            </div>
          </div>

          <div className="space-y-3 mt-4">
            {publishedNotulen.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">
                Belum ada notulen rapat yang dipublikasikan.
              </p>
            ) : (
              publishedNotulen.map((n) => (
                <div key={n.id} className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-emerald-800">{n.nomor_surat}</span>
                    <span className="text-xs text-slate-500">{n.tanggal}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mt-1">{n.judul}</h4>
                  <div className="flex items-center gap-4 text-xs text-slate-600 mt-1">
                    <span>Tempat: {n.tempat}</span>
                    <span>Pemimpin: {n.pemimpin_rapat}</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200 mt-2 text-xs text-slate-700">
                    <strong className="block text-slate-900 mb-0.5">Hasil Keputusan:</strong>
                    {n.hasil_keputusan}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* QRIS Payment Modal */}
      {showQrisModal && selectedSlip && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full p-6 text-center animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-slate-900 text-sm uppercase">Pindai QRIS RW 44</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Pembayaran tagihan {selectedSlip.nama} ({selectedSlip.blok_rumah})
            </p>

            <div className="my-4 p-4 bg-slate-50 rounded-xl border border-slate-200 inline-block">
              {/* SVG QR Code Illustration */}
              <div className="w-44 h-44 bg-white p-3 rounded-lg shadow-inner mx-auto flex flex-col items-center justify-center border border-slate-300">
                <QrCode className="w-32 h-32 text-slate-800" />
                <span className="text-[10px] font-mono font-bold text-slate-600 mt-1">NMID: ID1020304050</span>
              </div>
            </div>

            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs text-left mb-4">
              <div className="flex justify-between text-emerald-900">
                <span>Nominal Bayar:</span>
                <span className="font-mono font-bold">
                  Rp {selectedSlip.jumlah_kewajiban.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="text-[10px] text-emerald-700 mt-1">
                Rekening Kas RW: Bank BPD DIY / Mandiri a.n RW 44 Balecatur
              </div>
            </div>

            <button
              onClick={() => setShowQrisModal(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};