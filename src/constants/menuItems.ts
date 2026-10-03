import {
  Users,
  Building,
  FileCheck,
  Package,
  Calendar,
  Wallet,
  FileText,
  Megaphone,
  Coins, // Icon pengganti untuk Iuran Ronda
  Info,
  PhoneCall,
  Store,
} from 'lucide-react';

export const menuItems = [
  { id: 'data_warga', label: 'Data Warga', icon: Users, color: 'bg-blue-100 text-blue-600' },
  { id: 'struktur_pengurus', label: 'Struktur Pengurus', icon: Building, color: 'bg-amber-100 text-amber-600' },
  { id: 'tata_tertib', label: 'Tata Tertib', icon: FileCheck, color: 'bg-emerald-100 text-emerald-600' },
  { id: 'inventaris', label: 'Inventaris', icon: Package, color: 'bg-orange-100 text-orange-600' },
  { id: 'jadwal_ronda', label: 'Jadwal Ronda', icon: Calendar, color: 'bg-rose-100 text-rose-600' },
  { id: 'buku_kas_rw', label: 'Buku Kas RW', icon: Wallet, color: 'bg-amber-100 text-amber-600' },
  { id: 'notulen_rapat', label: 'Notulen Rapat', icon: FileText, color: 'bg-emerald-100 text-emerald-600' },
  { id: 'pengumuman', label: 'Pengumuman', icon: Megaphone, color: 'bg-purple-100 text-purple-600' },
  // Mengubah Berita Warga menjadi Iuran Ronda
  { id: 'iuran_ronda', label: 'Iuran Ronda', icon: Coins, color: 'bg-cyan-100 text-cyan-600' },
  { id: 'info_iuran', label: 'Info Iuran', icon: Info, color: 'bg-indigo-100 text-indigo-600' },
  { id: 'nomor_penting', label: 'Nomor Penting', icon: PhoneCall, color: 'bg-pink-100 text-pink-600' },
  { id: 'koperasi_warga', label: 'Koperasi Warga', icon: Store, color: 'bg-teal-100 text-teal-600' },
];