import React from 'react';
import { Bell, ChevronRight } from 'lucide-react';
import { KoperasiHeroCard } from '../koperasi/KoperasiHeroCard';

interface WargaDashboardProps {
  currentUser?: any;
  warga?: any[];
  jimpitan?: any[];
  koperasi?: any[];
  rincianArisan?: any[];
  agendaArisan?: any[];
  rekapJimpitan?: any[];
  kelompokRonda?: any[];
  onToggleRincianStatus?: (id: string) => void;
  // Callback untuk membuka modal / menu
  onSelectMenu?: (menuId: string) => void; 
}

export const WargaDashboard: React.FC<WargaDashboardProps> = ({ 
  koperasi = [],
  onSelectMenu 
}) => {
  return (
    <div className="space-y-4">
      {/* Card Hero Rekapan Koperasi Warga */}
      <KoperasiHeroCard koperasi={koperasi} />

      {/* Card Pengumuman Terbaru */}
      <div 
        onClick={() => onSelectMenu && onSelectMenu('pengumuman')}
        className="bg-blue-50 hover:bg-blue-100/80 border border-blue-200 p-3.5 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition active:scale-[0.99]"
      >
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-600 text-white rounded-xl shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-blue-900">Pengumuman Terbaru</h4>
            <p className="text-[11px] text-blue-700 mt-0.5 line-clamp-2">
              Kerja bakti pembersihan lingkungan dilaksanakan hari Minggu besok pukul 07.00 WIB.
            </p>
          </div>
        </div>
        
        <ChevronRight className="w-4 h-4 text-blue-500 shrink-0" />
      </div>
    </div>
  );
};