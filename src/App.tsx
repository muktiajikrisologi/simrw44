import React, { useState, useEffect } from 'react';
import { useRWStore } from './hooks/useRWStore';
import { UserRole, UserProfile } from './types';
import { getSupabase } from './lib/supabase';
import { menuItems } from './constants/menuItems';

// Components & Modals
import { LoginView } from './components/dashboards/LoginView';
import { SuperAdminDashboard } from './components/dashboards/SuperAdminDashboard';
import { SekretarisDashboard } from './components/dashboards/SekretarisDashboard';
import { BendaharaKoperasiDashboard } from './components/dashboards/BendaharaKoperasiDashboard';
import { PerekapJimpitanDashboard } from './components/dashboards/PerekapJimpitanDashboard';
import { BendaharaRWDashboard } from './components/dashboards/BendaharaRWDashboard';
import { WargaDashboard } from './components/dashboards/WargaDashboard';
import { RoleSwitcherModal } from './components/RoleSwitcherModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { MenuModal } from './components/modals/MenuModal';

// Icons
import { Database, LogOut, Home, HelpCircle, History, User, Sparkles } from 'lucide-react';

export default function App() {
  const store = useRWStore();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'beranda' | 'faq' | 'riwayat' | 'profil'>('beranda');
  const [selectedMenu, setSelectedMenu] = useState<string | null>(null);

  const activeRole: UserRole = store.currentUser?.role || store.role || 'warga';

  useEffect(() => {
    if (store.supabaseConnected && typeof store.syncWithSupabase === 'function') {
      store.syncWithSupabase();
    }
  }, [store.supabaseConnected]);

  const handleLoginAsRole = (role: UserRole) => {
    store.switchRole(role);
    setIsLoggedIn(true);
  };

  const handleLoginWithEmail = async (email: string, pass: string): Promise<boolean> => {
    const success = await store.loginWithEmail(email, pass);
    if (success) setIsLoggedIn(true);
    return Boolean(success);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setSelectedMenu(null);
  };

  const handleUpdateUser = async (userId: string, updatedData: Partial<UserProfile> & { newPassword?: string }) => {
    try {
      const client = getSupabase();
      if (store.supabaseConnected && client) {
        const payload: Record<string, any> = { updated_at: new Date().toISOString() };
        if (updatedData.nama) payload.nama = updatedData.nama;
        if (updatedData.email) payload.email = updatedData.email;
        if (updatedData.role) payload.role = updatedData.role;
        if (updatedData.no_hp !== undefined) payload.no_hp = updatedData.no_hp;
        if (updatedData.newPassword) payload.password = updatedData.newPassword;

        const { error } = await client.from('users').update(payload).eq('id', userId);
        if (error) throw error;
        await store.syncWithSupabase();
        alert('Data pengguna berhasil diperbarui!');
        return;
      }
      store.updateUser(userId, updatedData);
      alert('Data pengguna berhasil diperbarui (Lokal)!');
    } catch (err: any) {
      alert('Gagal memperbarui pengguna: ' + (err.message || err));
    }
  };

  const handleAddUserWithSupabase = async (newUser: any) => {
    try {
      const client = getSupabase();
      if (store.supabaseConnected && client) {
        const { error } = await client.from('users').insert([{
          id: crypto.randomUUID(),
          email: newUser.email,
          nama: newUser.nama,
          password: newUser.password || 'password123',
          role: newUser.role,
          no_hp: newUser.no_hp || null,
        }]);
        if (error) throw error;
        alert(`Pengguna berhasil ditambahkan!`);
        await store.syncWithSupabase();
      } else {
        store.addUser(newUser);
      }
    } catch (err: any) {
      alert('Gagal menambah pengguna: ' + (err.message || err));
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-800 font-sans antialiased flex flex-col justify-between">
        <div>
          <OfflineIndicator />
          <LoginView
            users={store.users || []}
            onLoginAsRole={handleLoginAsRole}
            onLoginWithEmail={handleLoginWithEmail}
            onOpenSupabaseModal={() => setShowSupabaseModal(true)}
            supabaseConnected={store.supabaseConnected}
          />
        </div>
        <div className="p-4 text-center">
          <button onClick={() => setShowSupabaseModal(true)} className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition cursor-pointer">
            <Database className="w-4 h-4" />
            {store.supabaseConnected ? 'Supabase Terhubung' : 'Atur Koneksi Supabase'}
          </button>
        </div>
        {showSupabaseModal && <SupabaseConfigModal onClose={() => setShowSupabaseModal(false)} onRefresh={store.syncWithSupabase} />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans antialiased flex justify-center">
      <div className="w-full max-w-md bg-slate-50 min-h-screen flex flex-col justify-between shadow-2xl relative pb-20">
        <div>
          {/* Header Banner */}
          <div className="bg-gradient-to-b from-blue-700 to-indigo-600 pt-6 px-5 pb-14 rounded-b-[2.5rem] text-white shadow-lg relative">
            <OfflineIndicator />
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-sm">RW</div>
                <h1 className="font-extrabold text-lg tracking-wide">RW 44</h1>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowSupabaseModal(true)} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer"><Database className="w-4 h-4 text-white" /></button>
                <button onClick={handleLogout} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer"><LogOut className="w-4 h-4 text-white" /></button>
              </div>
            </div>

            <p className="text-xs text-blue-100 font-medium mb-3">Hai, {store.currentUser?.nama || 'Warga'}</p>

            {/* Profile Card */}
            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center justify-between shadow-inner">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-white text-blue-600 flex items-center justify-center font-bold shadow-md">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-bold text-sm text-white">{store.currentUser?.nama || 'Budi Santoso'}</h2>
                  <p className="text-[11px] text-blue-100">RT 03 / RW 44 • Blok A-12</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-emerald-500/30 text-emerald-200 text-[10px] font-semibold">
                    Role: {activeRole.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>

              {activeRole === 'super_admin' && (
                <button onClick={() => setShowRoleSwitcher(true)} className="px-3 py-1.5 rounded-xl bg-white text-blue-700 text-xs font-bold shadow-md hover:bg-blue-50 transition cursor-pointer">
                  Ganti Role
                </button>
              )}
            </div>
          </div>

          {/* Simulasi Role Strip (Super Admin Only) */}
          {activeRole === 'super_admin' && (
            <div className="mx-4 -mt-5 relative z-10 bg-white rounded-2xl p-3 border border-slate-200 shadow-sm text-xs">
              <div className="flex items-center gap-1.5 mb-2 text-slate-500 font-bold uppercase text-[10px]">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Simulasi Role (Admin Only):</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { role: 'super_admin' as UserRole, label: 'Admin' },
                  { role: 'sekretaris' as UserRole, label: 'Sekretaris' },
                  { role: 'bendahara_rw' as UserRole, label: 'Bend RW' },
                  { role: 'bendahara_koperasi' as UserRole, label: 'Koperasi' },
                  { role: 'perekap_jimpitan' as UserRole, label: 'Ronda' },
                  { role: 'warga' as UserRole, label: 'Warga' },
                ].map((item) => (
                  <button
                    key={item.role}
                    onClick={() => store.switchRole(item.role)}
                    className={`py-1 px-2 rounded-lg text-[10px] font-bold transition text-center cursor-pointer ${activeRole === item.role ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Grid Menu Layanan Terpadu */}
          <div className="p-5">
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/80 mb-5">
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3 px-1">Layanan Warga Terpadu</h3>
              <div className="grid grid-cols-4 gap-3 text-center">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button key={item.id} onClick={() => setSelectedMenu(item.id)} className="flex flex-col items-center gap-1.5 p-1 rounded-2xl hover:bg-slate-50 transition group cursor-pointer">
                      <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-700 leading-tight">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Area Dashboard Spesifik Berdasarkan Role */}
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200 mb-5">
              {activeRole === 'super_admin' && (
                <SuperAdminDashboard
                  currentUser={store.currentUser}
                  users={store.users || []}
                  warga={store.warga || []}
                  onAddUser={handleAddUserWithSupabase}
                  onUpdateUserRole={(id, role) => handleUpdateUser(id, { role })}
                  onUpdateUser={handleUpdateUser}
                  onChangeUserPassword={(id, pass) => handleUpdateUser(id, { newPassword: pass })}
                  onDeleteUser={store.deleteUser}
                  onAddWarga={store.addWarga}
                  onDeleteWarga={store.deleteWarga}
                />
              )}

              {activeRole === 'sekretaris' && (
                <SekretarisDashboard
                  currentUser={store.currentUser}
                  notulen={store.notulen || []}
                  combinedTagihan={store.getCombinedTagihan ? store.getCombinedTagihan() : []}
                  onAddNotulen={store.addNotulen}
                  onUpdateNotulenStatus={store.updateNotulenStatus}
                  onDeleteNotulen={store.deleteNotulen}
                  rincianArisan={store.rincianArisan || []}
                  agendaArisan={store.agendaArisan || []}
                  onUpdateRincianItem={store.updateRincianArisanItem}
                  onAddRincianItem={store.addRincianArisanItem}
                  onToggleRincianStatus={store.toggleRincianArisanStatus}
                  onImportRincianCsv={store.importRincianArisanCsvData}
                  onUpdateAgenda={store.updateAgendaArisan}
                />
              )}

              {activeRole === 'bendahara_rw' && (
                <BendaharaRWDashboard
                  currentUser={store.currentUser}
                  kasRW={store.kasRW || []}
                  onAddKasRW={store.addKasRW}
                  onDeleteKasRW={store.deleteKasRW}
                />
              )}

              {activeRole === 'bendahara_koperasi' && (
                <BendaharaKoperasiDashboard
                  currentUser={store.currentUser}
                  koperasi={store.koperasi || []}
                  warga={store.warga || []}
                  onAddKoperasi={store.addKoperasi}
                  onMarkKoperasiLunas={store.markKoperasiLunas}
                />
              )}

              {activeRole === 'perekap_jimpitan' && (
                <PerekapJimpitanDashboard
                  currentUser={store.currentUser}
                  rekapJimpitan={store.rekapJimpitan || []}
                  kelompokRonda={store.kelompokRonda || []}
                  warga={store.warga || []}
                  onUpdateItem={store.updateRekapJimpitanItem}
                  onAddItem={store.addRekapJimpitanItem}
                  onToggleStatus={store.toggleRekapJimpitanStatus}
                  onUpdateKelompokRonda={store.updateKelompokRondaItem}
                  onImportCsv={store.importRekapJimpitanCsvData}
                  jimpitan={store.jimpitan || []}
                  onAddJimpitan={store.addJimpitan}
                  onMarkJimpitanLunas={store.markJimpitanLunas}
                />
              )}

              {activeRole === 'warga' && (
                <WargaDashboard
                  currentUser={store.currentUser}
                  kasRW={store.kasRW || []}
                  notulen={store.notulen || []}
                  warga={store.warga || []}
                  jimpitan={store.jimpitan || []}
                  koperasi={store.koperasi || []}
                  rincianArisan={store.rincianArisan || []}
                  agendaArisan={store.agendaArisan || []}
                  rekapJimpitan={store.rekapJimpitan || []}
                  kelompokRonda={store.kelompokRonda || []}
                  onToggleRincianStatus={store.toggleRincianArisanStatus}
                  onSelectMenu={(menuId) => setSelectedMenu(menuId)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-slate-200 flex justify-around py-2.5 px-3 z-30 shadow-lg">
          <button onClick={() => setActiveTab('beranda')} className={`flex flex-col items-center gap-1 cursor-pointer ${activeTab === 'beranda' ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>
            <Home className="w-5 h-5" /><span className="text-[10px]">Beranda</span>
          </button>
          <button onClick={() => setActiveTab('faq')} className={`flex flex-col items-center gap-1 cursor-pointer ${activeTab === 'faq' ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>
            <HelpCircle className="w-5 h-5" /><span className="text-[10px]">FAQ</span>
          </button>
          <button onClick={() => setActiveTab('riwayat')} className={`flex flex-col items-center gap-1 cursor-pointer ${activeTab === 'riwayat' ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>
            <History className="w-5 h-5" /><span className="text-[10px]">Riwayat</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('profil');
              if (activeRole === 'super_admin') setShowRoleSwitcher(true);
            }}
            className={`flex flex-col items-center gap-1 cursor-pointer ${activeTab === 'profil' ? 'text-blue-600 font-bold' : 'text-slate-400'}`}
          >
            <User className="w-5 h-5" /><span className="text-[10px]">Profil</span>
          </button>
        </nav>

        {/* Modal Utama */}
        {selectedMenu && (
          <MenuModal
            selectedMenu={selectedMenu}
            activeRole={activeRole}
            store={store}
            onClose={() => setSelectedMenu(null)}
            onOpenSupabaseModal={() => setShowSupabaseModal(true)}
            onAddUserWithSupabase={handleAddUserWithSupabase}
            onUpdateUser={handleUpdateUser}
            onChangeUserPassword={(id, pass) => handleUpdateUser(id, { newPassword: pass })}
          />
        )}
        {showRoleSwitcher && activeRole === 'super_admin' && (
          <RoleSwitcherModal currentRole={activeRole} onSelectRole={(r) => { store.switchRole(r); setShowRoleSwitcher(false); }} onClose={() => setShowRoleSwitcher(false)} />
        )}
        {showSupabaseModal && <SupabaseConfigModal onClose={() => setShowSupabaseModal(false)} onRefresh={store.syncWithSupabase} />}
      </div>
    </div>
  );
}