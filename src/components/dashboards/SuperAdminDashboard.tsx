import React, { useState } from 'react';
import { UserProfile, UserRole, Warga } from '../../types';
import {
  Users,
  UserPlus,
  Shield,
  Search,
  Filter,
  Trash2,
  CheckCircle,
  Home,
  PlusCircle,
  Database,
  ArrowUpDown,
  Building,
  Edit,
  Key,
  X,
} from 'lucide-react';

interface SuperAdminDashboardProps {
  currentUser: UserProfile;
  users: UserProfile[];
  warga: Warga[];
  onAddUser: (user: Omit<UserProfile, 'id' | 'created_at'>) => void;
  onUpdateUserRole: (userId: string, newRole: UserRole) => void;
  onUpdateUser?: (userId: string, updatedData: Partial<UserProfile>) => void;
  onChangeUserPassword?: (userId: string, newPassword: string) => void;
  onDeleteUser: (userId: string) => void;
  onAddWarga: (w: Omit<Warga, 'id' | 'created_at'>) => void;
  onDeleteWarga: (id: string) => void;
}

const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  sekretaris: 'Sekretaris RW',
  bendahara_rw: 'Bendahara RW',
  bendahara_koperasi: 'Bendahara Koperasi',
  perekap_jimpitan: 'Perekap Jimpitan/Ronda',
  warga: 'Warga',
};

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  currentUser,
  users,
  warga,
  onAddUser,
  onUpdateUserRole,
  onUpdateUser,
  onChangeUserPassword,
  onDeleteUser,
  onAddWarga,
  onDeleteWarga,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'warga'>('users');

  // Search & filter states
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [wargaSearch, setWargaSearch] = useState('');
  const [rtFilter, setRtFilter] = useState<string>('all');

  // User form modal (Tambah)
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newNama, setNewNama] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('warga');
  const [newHp, setNewHp] = useState('');

  // User form modal (Edit)
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editNama, setEditNama] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('warga');
  const [editHp, setEditHp] = useState('');

  // Password modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [targetPasswordUser, setTargetPasswordUser] = useState<UserProfile | null>(null);
  const [newPassword, setNewPassword] = useState('');

  // Warga form modal
  const [showAddWargaModal, setShowAddWargaModal] = useState(false);
  const [wNama, setWNama] = useState('');
  const [wNik, setWNik] = useState('');
  const [wNoRumah, setWNoRumah] = useState('');
  const [wRt, setWRt] = useState('01');
  const [wBlok, setWBlok] = useState('');
  const [wStatus, setWStatus] = useState<'Tetap' | 'Kontrak' | 'Kos'>('Tetap');
  const [wNoHp, setWNoHp] = useState('');

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNama || !newEmail) return;
    onAddUser({
      nama: newNama,
      email: newEmail,
      role: newRole,
      no_hp: newHp || undefined,
    });
    setNewNama('');
    setNewEmail('');
    setNewHp('');
    setShowAddUserModal(false);
  };

  const handleOpenEditUser = (user: UserProfile) => {
    setEditingUserId(user.id);
    setEditNama(user.nama);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditHp(user.no_hp || '');
    setShowEditUserModal(true);
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserId || !editNama || !editEmail) return;
    if (onUpdateUser) {
      onUpdateUser(editingUserId, {
        nama: editNama,
        email: editEmail,
        role: editRole,
        no_hp: editHp || undefined,
      });
    }
    setShowEditUserModal(false);
    setEditingUserId(null);
  };

  const handleOpenPasswordModal = (user: UserProfile) => {
    setTargetPasswordUser(user);
    setNewPassword('');
    setShowPasswordModal(true);
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPasswordUser || !newPassword) return;
    if (onChangeUserPassword) {
      onChangeUserPassword(targetPasswordUser.id, newPassword);
    }
    setShowPasswordModal(false);
    setTargetPasswordUser(null);
    setNewPassword('');
  };

  const handleSaveWarga = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wNama || !wNoRumah) return;
    onAddWarga({
      nama: wNama,
      nik: wNik || `320101${Date.now().toString().slice(-10)}`,
      no_rumah: wNoRumah,
      rt: wRt,
      rw: '05',
      blok: wBlok || undefined,
      status_hunian: wStatus,
      no_hp: wNoHp || '081234567890',
      status_aktif: true,
    });
    setWNama('');
    setWNik('');
    setWNoRumah('');
    setWBlok('');
    setWNoHp('');
    setShowAddWargaModal(false);
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.nama.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const filteredWarga = warga.filter((w) => {
    const matchSearch =
      w.nama.toLowerCase().includes(wargaSearch.toLowerCase()) ||
      w.no_rumah.toLowerCase().includes(wargaSearch.toLowerCase()) ||
      w.nik.includes(wargaSearch);
    const matchRt = rtFilter === 'all' || w.rt === rtFilter;
    return matchSearch && matchRt;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      {/* Bento Grid Top Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Bento 1: Ringkasan Pengguna & Wilayah */}
        <div className="md:col-span-12 lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                Manajemen Sistem RW
              </h2>
              <span className="text-xs text-green-600 font-bold bg-green-50 px-2.5 py-1 rounded-lg">
                Super Admin Aktif
              </span>
            </div>
            <div className="mb-4">
              <p className="text-3xl font-black text-slate-800">{users.length} Akun Terdaftar</p>
              <p className="text-xs text-slate-400 mt-1">Total {warga.length} Kepala Keluarga terdata di RW 05</p>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center text-xs font-bold">
                  ADM
                </div>
                <div className="text-xs">
                  <p className="font-bold text-slate-700">Role Pengurus RW</p>
                  <p className="text-slate-400">Sekretaris & Bendahara</p>
                </div>
              </div>
              <p className="text-xs font-bold text-indigo-600">{users.filter((u) => u.role !== 'warga').length} Akun</p>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center text-xs font-bold">
                  WRG
                </div>
                <div className="text-xs">
                  <p className="font-bold text-slate-700">Warga Terdaftar</p>
                  <p className="text-slate-400">Akses Portal Mandiri</p>
                </div>
              </div>
              <p className="text-xs font-bold text-blue-600">{users.filter((u) => u.role === 'warga').length} Akun</p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('users')}
            className="w-full mt-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            Kelola Otoritas Akun
          </button>
        </div>

        {/* Bento 2: Status Akses RBAC (Indigo Highlight Bento) */}
        <div className="md:col-span-6 lg:col-span-3 bg-indigo-600 rounded-3xl p-6 text-white shadow-lg flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold opacity-80 uppercase tracking-wider mb-3">
              Status Hak Akses (RBAC)
            </h2>
            <div className="text-center my-4">
              <p className="text-5xl font-black mb-1">100%</p>
              <p className="text-xs opacity-80">Kebijakan RLS PostgreSQL Aktif</p>
            </div>
          </div>

          <div>
            <div className="grid grid-cols-2 gap-2 my-2">
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <p className="text-[10px] opacity-70 uppercase font-bold">Pengurus</p>
                <p className="text-base font-black mt-0.5">{users.filter((u) => u.role !== 'warga').length}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <p className="text-[10px] opacity-70 uppercase font-bold">Warga KK</p>
                <p className="text-base font-black mt-0.5">{warga.length}</p>
              </div>
            </div>

            <button
              onClick={() => setShowAddUserModal(true)}
              className="w-full mt-3 py-2.5 bg-white text-indigo-700 hover:bg-indigo-50 rounded-xl text-xs font-bold transition shadow-xs"
            >
              + Tambah Akun Baru
            </button>
          </div>
        </div>

        {/* Bento 3: Log Sistem & Informasi (Dark Slate Bento) */}
        <div className="md:col-span-6 lg:col-span-5 bg-slate-800 rounded-3xl p-6 text-white flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <h2 className="text-sm font-bold opacity-80 uppercase tracking-wider">
                  Log Audit & Keamanan
                </h2>
              </div>
              <span className="text-[10px] bg-slate-700 px-2.5 py-0.5 rounded-full text-slate-300 font-mono">
                RT 01 - 04
              </span>
            </div>

            <div className="space-y-3">
              <div className="border-l-2 border-indigo-400 pl-3">
                <p className="text-xs font-bold text-white">Otorisasi Akun Multi-Role</p>
                <p className="text-[11px] opacity-60">Super Admin, Sekretaris, Bendahara, Perekap</p>
              </div>
              <div className="border-l-2 border-emerald-400 pl-3">
                <p className="text-xs font-bold text-white">Supabase RLS Enforced</p>
                <p className="text-[11px] opacity-60">Pencegahan manipulasi data antar-role</p>
              </div>
              <div className="border-l-2 border-slate-600 pl-3">
                <p className="text-xs font-bold text-white">Database Warga Sinkron</p>
                <p className="text-[11px] opacity-60">Terkoneksi dengan modul kas RW & jimpitan</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-700/80 flex items-center justify-between text-xs text-slate-400">
            <span>Sesi: {currentUser.email}</span>
            <span className="text-emerald-400 font-bold">Online</span>
          </div>
        </div>
      </div>

      {/* Bento 4: Soft Emerald Action Card */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center text-xl shadow-xs">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-emerald-900 text-sm sm:text-base">
              Sinkronisasi Master Kependudukan & Akses RW
            </h3>
            <p className="text-xs text-emerald-700 mt-0.5">
              Kelola entitas warga dan tetapkan peran secara presisi dengan arsitektur PostgreSQL Supabase.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowAddWargaModal(true)}
            className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            + Input Warga Baru
          </button>
        </div>
      </div>

      {/* Bento 5: Main Data Bento Card (Tabs, Filters & Table) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
        {/* Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex gap-2">
            <button
              id="tab-superadmin-users"
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
                activeTab === 'users'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Manajemen Pengguna & Role ({users.length})</span>
            </button>
            <button
              id="tab-superadmin-warga"
              onClick={() => setActiveTab('warga')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
                activeTab === 'warga'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Building className="w-4 h-4" />
              <span>Master Data Warga ({warga.length})</span>
            </button>
          </div>

          {activeTab === 'users' ? (
            <button
              id="btn-add-new-user"
              onClick={() => setShowAddUserModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah Pengguna</span>
            </button>
          ) : (
            <button
              id="btn-add-new-warga"
              onClick={() => setShowAddWargaModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tambah Warga Baru</span>
            </button>
          )}
        </div>

        {/* TAB 1: USERS & ROLES */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Cari nama atau email pengguna..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-none w-full sm:w-auto"
                >
                  <option value="all">Semua Role</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="sekretaris">Sekretaris</option>
                  <option value="bendahara_rw">Bendahara RW</option>
                  <option value="bendahara_koperasi">Bendahara Koperasi</option>
                  <option value="perekap_jimpitan">Perekap Jimpitan</option>
                  <option value="warga">Warga</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-100">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-400 text-[10px] uppercase font-bold border-b border-slate-100">
                  <tr>
                    <th className="p-3.5">Nama Pengguna</th>
                    <th className="p-3.5">Email & Kontak</th>
                    <th className="p-3.5">Role Saat Ini</th>
                    <th className="p-3.5">Tetapkan Role Baru (RBAC)</th>
                    <th className="p-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => {
                    const isCurrent = u.id === currentUser.id;
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/60 transition">
                        <td className="p-3.5">
                          <div className="font-bold text-slate-800 flex items-center gap-1.5">
                            <span>{u.nama}</span>
                            {isCurrent && (
                              <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] rounded font-bold">
                                Anda
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">ID: {u.id}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="text-slate-700 font-medium">{u.email}</div>
                          <div className="text-[11px] text-slate-400">{u.no_hp || '-'}</div>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {ROLE_LABELS[u.role] || u.role}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <select
                            value={u.role}
                            onChange={(e) => onUpdateUserRole(u.id, e.target.value as UserRole)}
                            className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                          >
                            <option value="super_admin">Super Admin</option>
                            <option value="sekretaris">Sekretaris RW</option>
                            <option value="bendahara_rw">Bendahara RW</option>
                            <option value="bendahara_koperasi">Bendahara Koperasi</option>
                            <option value="perekap_jimpitan">Perekap Jimpitan/Ronda</option>
                            <option value="warga">Warga</option>
                          </select>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEditUser(u)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition"
                              title="Edit Pengguna"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenPasswordModal(u)}
                              className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-amber-50 transition"
                              title="Ubah Password"
                            >
                              <Key className="w-4 h-4" />
                            </button>
                            {!isCurrent && (
                              <button
                                onClick={() => onDeleteUser(u.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                                title="Hapus Pengguna"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: WARGA MASTER DATA */}
        {activeTab === 'warga' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={wargaSearch}
                  onChange={(e) => setWargaSearch(e.target.value)}
                  placeholder="Cari nama warga, no rumah, NIK..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={rtFilter}
                  onChange={(e) => setRtFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-none w-full sm:w-auto"
                >
                  <option value="all">Semua RT</option>
                  <option value="01">RT 01</option>
                  <option value="02">RT 02</option>
                  <option value="03">RT 18/19</option>
                  <option value="04">RT 04</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-100">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-400 text-[10px] uppercase font-bold border-b border-slate-100">
                  <tr>
                    <th className="p-3.5">Nama & NIK</th>
                    <th className="p-3.5">Alamat / No. Rumah</th>
                    <th className="p-3.5">RT / RW</th>
                    <th className="p-3.5">Status Hunian</th>
                    <th className="p-3.5">No. Telepon / WhatsApp</th>
                    <th className="p-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredWarga.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-50/60 transition">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-800">{w.nama}</div>
                        <div className="text-[11px] text-slate-400 font-mono">NIK: {w.nik}</div>
                      </td>
                      <td className="p-3.5 font-bold text-slate-700">
                        Rumah {w.no_rumah} {w.blok && `(${w.blok})`}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-bold text-[11px]">
                          RT {w.rt} / RW {w.rw}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            w.status_hunian === 'Tetap'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {w.status_hunian}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600 font-medium">{w.no_hp}</td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => onDeleteWarga(w.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                          title="Hapus Warga"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal Tambah User */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-indigo-600" />
              Daftarkan Pengguna Baru
            </h3>
            <form onSubmit={handleSaveUser} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1 text-slate-700">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  required
                  value={newNama}
                  onChange={(e) => setNewNama(e.target.value)}
                  placeholder="Contoh: Budi Santoso, S.T."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="font-bold block mb-1 text-slate-700">Alamat Email (Login)</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="nama@rw05.id"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="font-bold block mb-1 text-slate-700">Role / Hak Akses Sistem</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                >
                  <option value="warga">Warga (Mandiri)</option>
                  <option value="perekap_jimpitan">Perekap Jimpitan & Ronda</option>
                  <option value="bendahara_koperasi">Bendahara Koperasi</option>
                  <option value="bendahara_rw">Bendahara RW</option>
                  <option value="sekretaris">Sekretaris RW</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div>
                <label className="font-bold block mb-1 text-slate-700">No. WhatsApp / HP (Opsional)</label>
                <input
                  type="tel"
                  value={newHp}
                  onChange={(e) => setNewHp(e.target.value)}
                  placeholder="08123456789"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>
              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow-xs"
                >
                  Simpan Pengguna
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit User */}
      {showEditUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Edit className="w-5 h-5 text-indigo-600" />
              Edit Data Pengguna
            </h3>
            <form onSubmit={handleSaveEditUser} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1 text-slate-700">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={editNama}
                  onChange={(e) => setEditNama(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="font-bold block mb-1 text-slate-700">Alamat Email</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="font-bold block mb-1 text-slate-700">Role / Hak Akses</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                >
                  <option value="warga">Warga (Mandiri)</option>
                  <option value="perekap_jimpitan">Perekap Jimpitan & Ronda</option>
                  <option value="bendahara_koperasi">Bendahara Koperasi</option>
                  <option value="bendahara_rw">Bendahara RW</option>
                  <option value="sekretaris">Sekretaris RW</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div>
                <label className="font-bold block mb-1 text-slate-700">No. WhatsApp / HP</label>
                <input
                  type="tel"
                  value={editHp}
                  onChange={(e) => setEditHp(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>
              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow-xs"
                >
                  Simpan Perubahan
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditUserModal(false)}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ubah Password */}
      {showPasswordModal && targetPasswordUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-600" />
              Ubah Password Pengguna
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Mengubah password akun untuk <strong>{targetPasswordUser.nama}</strong> ({targetPasswordUser.email}).
            </p>
            <form onSubmit={handleSavePassword} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1 text-slate-700">Password Baru</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-600 focus:outline-none"
                />
              </div>
              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition shadow-xs"
                >
                  Ubah Password
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Warga */}
      {showAddWargaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-indigo-600" />
              Input Data Warga Baru
            </h3>
            <form onSubmit={handleSaveWarga} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1 text-slate-700">Nama Kepala Keluarga / Warga</label>
                <input
                  type="text"
                  required
                  value={wNama}
                  onChange={(e) => setWNama(e.target.value)}
                  placeholder="Nama lengkap"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="font-bold block mb-1 text-slate-700">NIK KTP (16 Digit)</label>
                <input
                  type="text"
                  value={wNik}
                  onChange={(e) => setWNik(e.target.value)}
                  placeholder="320101..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-none font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1 text-slate-700">No. Rumah</label>
                  <input
                    type="text"
                    required
                    value={wNoRumah}
                    onChange={(e) => setWNoRumah(e.target.value)}
                    placeholder="B-12"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1 text-slate-700">RT Wilayah</label>
                  <select
                    value={wRt}
                    onChange={(e) => setWRt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  >
                    <option value="01">RT 01</option>
                    <option value="02">RT 02</option>
                    <option value="03">RT 18/19</option>
                    <option value="04">RT 04</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1 text-slate-700">Blok Rumah (Opsional)</label>
                  <input
                    type="text"
                    value={wBlok}
                    onChange={(e) => setWBlok(e.target.value)}
                    placeholder="Blok Dahlia"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1 text-slate-700">Status Hunian</label>
                  <select
                    value={wStatus}
                    onChange={(e: any) => setWStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  >
                    <option value="Tetap">Tetap</option>
                    <option value="Kontrak">Kontrak</option>
                    <option value="Kos">Kos</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="font-bold block mb-1 text-slate-700">No. WhatsApp</label>
                <input
                  type="tel"
                  value={wNoHp}
                  onChange={(e) => setWNoHp(e.target.value)}
                  placeholder="0812..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>
              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow-xs"
                >
                  Simpan Data Warga
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddWargaModal(false)}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};