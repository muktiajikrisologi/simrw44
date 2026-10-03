import React from 'react';
import { UserRole } from '../../types';
import { menuItems } from '../../constants/menuItems';
import { X, Calendar, Package } from 'lucide-react';

// Import Sub-komponen Menu
import { DataWargaContent } from '../menu/DataWargaContent';
import { StrukturPengurusContent } from '../menu/StrukturPengurusContent';
import { TataTertibContent } from '../menu/TataTertibContent';
import { NomorPentingContent } from '../menu/NomorPentingContent';
import { InfoIuranContent } from '../menu/InfoIuranContent';
import { IuranRondaContent } from '../menu/IuranRondaContent';
import { KoperasiContent } from '../menu/KoperasiContent';
import { BukuKasContent } from '../menu/BukuKasContent';

// Import Modal Notulen & Pengumuman
import { NotulenRapatModal } from '../menu/NotulenRapatModal';
import { PengumumanModal } from '../menu/PengumumanModal';

interface MenuModalProps {
  selectedMenu: string;
  activeRole: UserRole;
  store: any;
  onClose: () => void;
  onOpenSupabaseModal?: () => void;
  onAddUserWithSupabase?: (user: any) => Promise<void>;
  onUpdateUser?: (id: string, data: any) => Promise<void>;
  onChangeUserPassword?: (id: string, pass: string) => Promise<void>;
}

export const MenuModal: React.FC<MenuModalProps> = ({
  selectedMenu,
  activeRole,
  store,
  onClose,
}) => {
  // Jika menu yang dipilih adalah Notulen Rapat, alihkan ke NotulenRapatModal
  if (selectedMenu === 'notulen_rapat' || selectedMenu === 'notulen') {
    return <NotulenRapatModal isOpen={true} onClose={onClose} />;
  }

  // Jika menu yang dipilih adalah Pengumuman, alihkan ke PengumumanModal
  if (selectedMenu === 'pengumuman') {
    return <PengumumanModal isOpen={true} onClose={onClose} />;
  }

  const activeItem = menuItems.find((item) => item.id === selectedMenu);
  if (!activeItem) return null;

  // Mengambil data tagihan/iuran dari store
  const tagihanData =
    store.rincianArisan ||
    (typeof store.getCombinedTagihan === 'function' ? store.getCombinedTagihan() : []) ||
    [];

  // Penyesuaian Lebar Modal berdasarkan jenis menu
  const isWideMenu = [
    'koperasi',
    'info_iuran',
    'iuran',
    'data_warga',
    'iuran_ronda',
    'buku_kas',
    'buku_kas_rw',
  ].includes(selectedMenu);

  const modalMaxWidthClass = isWideMenu ? 'max-w-4xl' : 'max-w-md';

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className={`bg-white w-full ${modalMaxWidthClass} rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100 transition-all duration-300`}>
        
        {/* Header Modal */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${activeItem.color} flex items-center justify-center shadow-xs`}>
              <activeItem.icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-800">{activeItem.label}</h3>
              <p className="text-[10px] text-slate-400">Layanan RW 44 Terpadu</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Isi Modal */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {/* 1. Data Warga */}
          {selectedMenu === 'data_warga' && (
            <DataWargaContent 
              activeRole={activeRole} 
              wargaList={store.warga || []} 
            />
          )}

          {/* 2. Struktur Pengurus */}
          {selectedMenu === 'struktur_pengurus' && (
            <StrukturPengurusContent activeRole={activeRole} />
          )}

          {/* 3. Tata Tertib */}
          {selectedMenu === 'tata_tertib' && (
            <TataTertibContent activeRole={activeRole} />
          )}

          {/* 4. Nomor Penting */}
          {selectedMenu === 'nomor_penting' && (
            <NomorPentingContent activeRole={activeRole} />
          )}

          {/* 5. Info Iuran */}
          {(selectedMenu === 'info_iuran' || selectedMenu === 'iuran') && (
            <InfoIuranContent 
              activeRole={activeRole} 
              warga={store.warga || []} 
              tagihanList={tagihanData}
            />
          )}

          {/* 6. Iuran Ronda */}
          {selectedMenu === 'iuran_ronda' && (
            <IuranRondaContent 
              activeRole={activeRole}
              rekapJimpitan={store.rekapJimpitan || []}
              kelompokRonda={store.kelompokRonda || []}
              onUpdateItem={store.updateRekapJimpitanItem}
              onAddItem={store.addRekapJimpitanItem}
              onToggleStatus={store.toggleRekapJimpitanStatus}
              onUpdateKelompokRonda={store.updateKelompokRondaItem}
              onImportCsv={store.importRekapJimpitanCsvData}
            />
          )}

          {/* 7. Koperasi Warga */}
          {selectedMenu === 'koperasi' && (
            <KoperasiContent activeRole={activeRole} />
          )}

          {/* 8. Buku Kas RW */}
          {(selectedMenu === 'buku_kas' || selectedMenu === 'buku_kas_rw') && (
            <BukuKasContent
              activeRole={activeRole}
              kasRW={store.kasRW || []}
              onAddKas={store.addKasRWItem}
              onUpdateKas={store.updateKasRWItem}
              onDeleteKas={store.deleteKasRWItem}
            />
          )}

          {/* 9. Jadwal Ronda */}
          {selectedMenu === 'jadwal_ronda' && (
            <div className="p-4 text-center bg-slate-50 rounded-2xl border border-slate-200">
              <Calendar className="w-8 h-8 mx-auto text-rose-500 mb-2 opacity-80" />
              <h4 className="font-bold text-xs text-slate-800">Jadwal Ronda Malam</h4>
              <p className="text-[11px] text-slate-500 mt-1">Jadwal poskamling terupdate dapat dipantau melalui dasbor peronda.</p>
            </div>
          )}

          {/* 10. Inventaris */}
          {selectedMenu === 'inventaris' && (
            <div className="p-4 text-center bg-slate-50 rounded-2xl border border-slate-200">
              <Package className="w-8 h-8 mx-auto text-amber-500 mb-2 opacity-80" />
              <h4 className="font-bold text-xs text-slate-800">Inventaris RT/RW</h4>
              <p className="text-[11px] text-slate-500 mt-1">Daftar peminjaman barang dan aset warga.</p>
            </div>
          )}
        </div>

        {/* Footer Modal */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 text-center">
          <button 
            onClick={onClose} 
            className="w-full py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 font-bold text-xs text-slate-700 transition cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};