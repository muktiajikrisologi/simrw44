import React, { useState, useMemo } from 'react';
import { useRWStore } from '../../hooks/useRWStore';
import { Search, Wallet, CheckCircle2, Clock, Users } from 'lucide-react';

export const InfoIuranContent: React.FC = () => {
  const {
    rincianArisan, // Sudah otomatis terhubung dari useRWStore
    currentUser,
    toggleRincianArisanStatus,
  } = useRWStore();

  const [searchQuery, setSearchQuery] = useState('');

  const isSekretarisOrAdmin =
    currentUser?.role === 'sekretaris' ||
    currentUser?.role === 'super_admin' ||
    currentUser?.role === 'ketua_rw';

  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return rincianArisan;
    return rincianArisan.filter(
      (item) =>
        (item.nama || '').toLowerCase().includes(q) ||
        (item.blok_rumah || '').toLowerCase().includes(q)
    );
  }, [rincianArisan, searchQuery]);

  const stats = useMemo(() => {
    const totalWarga = rincianArisan.length;
    const lunasCount = rincianArisan.filter((d) => d.status_bayar === 'lunas').length;
    const belumCount = totalWarga - lunasCount;
    const totalTerkumpul = rincianArisan
      .filter((d) => d.status_bayar === 'lunas')
      .reduce((acc, d) => acc + d.jumlah_kewajiban, 0);

    return { totalWarga, lunasCount, belumCount, totalTerkumpul };
  }, [rincianArisan]);

  return (
    <div className="space-y-4 text-xs">
      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white p-4.5 rounded-2xl shadow-md">
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="text-[10px] font-bold tracking-wider text-blue-200 uppercase">
              Rekapitulasi Iuran & Arisan Warga
            </span>
            <h3 className="text-xl font-black mt-0.5">
              Rp {stats.totalTerkumpul.toLocaleString('id-ID')}
            </h3>
            <p className="text-[10px] text-blue-100">Total Terkumpul dari Warga Lunas</p>
          </div>
          <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl">
            <Wallet className="w-5 h-5 text-blue-200" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/15 text-center">
          <div className="bg-white/10 backdrop-blur-xs p-1.5 rounded-xl">
            <span className="text-[9px] text-blue-200 font-semibold block">Total KK</span>
            <span className="font-extrabold text-sm">{stats.totalWarga}</span>
          </div>
          <div className="bg-emerald-500/20 border border-emerald-400/30 p-1.5 rounded-xl">
            <span className="text-[9px] text-emerald-200 font-semibold block">Lunas</span>
            <span className="font-extrabold text-sm text-emerald-300">{stats.lunasCount}</span>
          </div>
          <div className="bg-amber-500/20 border border-amber-400/30 p-1.5 rounded-xl">
            <span className="text-[9px] text-amber-200 font-semibold block">Belum</span>
            <span className="font-extrabold text-sm text-amber-300">{stats.belumCount}</span>
          </div>
        </div>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder="Cari nama warga atau nomor blok rumah..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-xs font-medium"
        />
      </div>

      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
        {filteredData.length === 0 ? (
          <div className="py-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <Users className="w-6 h-6 mx-auto mb-1 opacity-40" />
            <p className="font-medium text-xs">Data tagihan iuran tidak ditemukan.</p>
          </div>
        ) : (
          filteredData.map((item) => {
            const isLunas = item.status_bayar === 'lunas';

            return (
              <div
                key={item.id}
                className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-800 text-xs capitalize">{item.nama}</h4>
                    <span className="bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-md text-[9px] border border-slate-200">
                      Blok {item.blok_rumah}
                    </span>
                  </div>

                  {isSekretarisOrAdmin ? (
                    <button
                      onClick={() => toggleRincianArisanStatus(item.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl font-extrabold text-[10px] transition-colors ${
                        isLunas
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                      }`}
                    >
                      {isLunas ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-amber-600" />}
                      {isLunas ? 'LUNAS' : 'BELUM'}
                    </button>
                  ) : (
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl font-extrabold text-[10px] ${
                        isLunas
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {isLunas ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-amber-600" />}
                      {isLunas ? 'LUNAS' : 'BELUM'}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-2 border-t border-slate-100 text-[10px] text-slate-500">
                  <div>
                    <span className="block text-slate-400">Koperasi:</span>
                    <strong className="text-slate-700">
                      Rp {(item.angsuran_koperasi || 0).toLocaleString('id-ID')}
                    </strong>
                  </div>

                  <div>
                    <span className="block text-slate-400">Kewajiban Ronda:</span>
                    <strong
                      className={
                        item.jmlh_kewajiban_ronda > 0
                          ? 'text-amber-700 font-bold'
                          : 'text-slate-700'
                      }
                    >
                      Rp {(item.jmlh_kewajiban_ronda || 0).toLocaleString('id-ID')}
                    </strong>
                  </div>

                  <div>
                    <span className="block text-slate-400">Arisan:</span>
                    <strong className="text-slate-700">
                      Rp {(item.arisan || 0).toLocaleString('id-ID')}
                    </strong>
                  </div>

                  <div>
                    <span className="block text-slate-400">Iuran RT:</span>
                    <strong className="text-slate-700">
                      Rp {(item.iuran_rt || 0).toLocaleString('id-ID')}
                    </strong>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-1.5 border-t border-slate-50 text-[11px]">
                  <span className="font-semibold text-slate-500">Total Kewajiban:</span>
                  <strong className="text-xs font-black text-blue-900 font-mono">
                    Rp {(item.jumlah_kewajiban || 0).toLocaleString('id-ID')}
                  </strong>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};