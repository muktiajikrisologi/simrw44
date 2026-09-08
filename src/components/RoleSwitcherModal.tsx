import React from 'react';
import { UserRole } from '../types';
import { X, Shield, FileText, Landmark, Wallet, ClipboardCheck, Users, CheckCircle2 } from 'lucide-react';

interface RoleSwitcherModalProps {
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  onClose: () => void;
}

const ROLES_INFO: Array<{
  role: UserRole;
  title: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  color: string;
}> = [
  {
    role: 'super_admin',
    title: 'Super Admin',
    badge: 'Akses Penuh',
    icon: Shield,
    description: 'Manajemen pengguna, penetapan role (RBAC), pengaturan master data warga, dan audit log.',
    color: 'border-purple-200 hover:border-purple-500 hover:bg-purple-50/50',
  },
  {
    role: 'sekretaris',
    title: 'Sekretaris RW',
    badge: 'Administrasi',
    icon: FileText,
    description: 'Rekap tagihan gabungan (ronda & koperasi), pembuatan & publikasi notulen rapat warga.',
    color: 'border-indigo-200 hover:border-indigo-500 hover:bg-indigo-50/50',
  },
  {
    role: 'bendahara_rw',
    title: 'Bendahara RW',
    badge: 'Kas Utama RW',
    icon: Wallet,
    description: 'Pengelolaan kas utama RW transparan (pemasukan/pengeluaran), saldo real-time, dan laporan keuangan.',
    color: 'border-emerald-200 hover:border-emerald-500 hover:bg-emerald-50/50',
  },
  {
    role: 'bendahara_koperasi',
    title: 'Bendahara Koperasi',
    badge: 'Simpan Pinjam',
    icon: Landmark,
    description: 'Pencatatan simpanan (pokok/wajib/sukarela), angsuran pinjaman, dan verifikasi status pembayaran anggota.',
    color: 'border-amber-200 hover:border-amber-500 hover:bg-amber-50/50',
  },
  {
    role: 'perekap_jimpitan',
    title: 'Perekap Jimpitan & Denda Ronda',
    badge: 'Petugas Lapangan',
    icon: ClipboardCheck,
    description: 'Input setoran harian jimpitan koin, denda ketidakhadiran ronda, serta fitur upload/impor file CSV massal.',
    color: 'border-cyan-200 hover:border-cyan-500 hover:bg-cyan-50/50',
  },
  {
    role: 'warga',
    title: 'Warga (Portal Mandiri)',
    badge: 'Publik & Mandiri',
    icon: Users,
    description: 'Melihat transparansi kas RW, membaca notulen rapat resmi, dan mengecek tagihan iuran pribadi.',
    color: 'border-blue-200 hover:border-blue-500 hover:bg-blue-50/50',
  },
];

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({
  currentRole,
  onSelectRole,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Uji Coba Multi-Role (RBAC)</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pilih peran pengguna di bawah untuk langsung beralih ke dashboard yang sesuai
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          {ROLES_INFO.map((item) => {
            const Icon = item.icon;
            const isSelected = currentRole === item.role;

            return (
              <button
                key={item.role}
                id={`btn-role-select-${item.role}`}
                onClick={() => {
                  onSelectRole(item.role);
                  onClose();
                }}
                className={`text-left p-4 rounded-2xl border-2 transition relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-700 bg-blue-50/80 shadow-xs'
                    : `${item.color} bg-white`
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                          {item.badge}
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-blue-700 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-blue-700">
                  <span>Masuk sebagai role ini &rarr;</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
