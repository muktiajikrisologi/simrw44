import React from 'react';
import { Bell } from 'lucide-react';

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
}

export const WargaDashboard: React.FC<WargaDashboardProps> = () => {
  return (
    <div className="space-y-4">
      {/* Pengumuman Terbaru */}
      <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-2xl flex items-start gap-3">
        <div className="p-2 bg-blue-600 text-white rounded-xl">
          <Bell className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-extrabold text-xs text-blue-900">Pengumuman Terbaru</h4>
          <p className="text-[11px] text-blue-700 mt-0.5">
            Kerja bakti pembersihan lingkungan dilaksanakan hari Minggu besok pukul 07.00 WIB.
          </p>
        </div>
      </div>
    </div>
  );
};