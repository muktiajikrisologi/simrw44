import React, { useState, useEffect } from 'react';
import { useRWStore } from './hooks/useRWStore';
import { UserRole, UserProfile } from './types';
import { Navbar } from './components/Navbar';
import { OfflineIndicator } from './components/OfflineIndicator';
import { RoleSwitcherModal } from './components/RoleSwitcherModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { SqlMigrationModal } from './components/SqlMigrationModal';
import { NextjsExportModal } from './components/NextjsExportModal';

import { supabase } from './supabaseClient'; 

import { LoginView } from './components/dashboards/LoginView';
import { SuperAdminDashboard } from './components/dashboards/SuperAdminDashboard';
import { SekretarisDashboard } from './components/dashboards/SekretarisDashboard';
import { BendaharaRWDashboard } from './components/dashboards/BendaharaRWDashboard';
import { BendaharaKoperasiDashboard } from './components/dashboards/BendaharaKoperasiDashboard';
import { PerekapJimpitanDashboard } from './components/dashboards/PerekapJimpitanDashboard';
import { WargaDashboard } from './components/dashboards/WargaDashboard';

import { Sparkles, FileCode, Code2 } from 'lucide-react';

const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export default function App() {
  const store = useRWStore();
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Default false untuk mewajibkan login awal

  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [showNextjsModal, setShowNextjsModal] = useState(false);

  useEffect(() => {
    if (store.supabaseConnected && typeof store.syncWithSupabase === 'function') {
      store.syncWithSupabase();
    }
  }, [store.supabaseConnected]);

  const handleLoginAsRole = (role: UserRole) => {
    store.switchRole(role);
    setIsLoggedIn(true);
  };

  const handleLoginWithEmail = (email: string, pass: string): boolean => {
    const success = store.loginWithEmail(email, pass);
    if (success) {
      setIsLoggedIn(true);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const handleUpdateUser = async (userId: string, updatedData: Partial<UserProfile> & { newPassword?: string }) => {
    try {
      if (store.supabaseConnected && supabase) {
        const payload: Record<string, any> = { updated_at: new Date().toISOString() };
        if (updatedData.nama) payload.nama = updatedData.nama;
        if (updatedData.email) payload.email = updatedData.email;
        if (updatedData.role) payload.role = updatedData.role;
        if (updatedData.no_hp !== undefined) payload.no_hp = updatedData.no_hp;
        if (updatedData.newPassword) payload.password = updatedData.newPassword; // Update password langsung ke tabel users

        let profileError = null;

        if (isValidUUID(userId)) {
          const { error } = await supabase
            .from('users')
            .update(payload)
            .eq('id', userId);
          profileError = error;
        } else {
          const targetEmail = updatedData.email || store.users.find((u) => u.id === userId)?.email;
          if (targetEmail) {
            const { error } = await supabase
              .from('users')
              .update(payload)
              .eq('email', targetEmail);
            profileError = error;
          }
        }

        if (profileError) throw profileError;

        await store.syncWithSupabase();
        alert('Data pengguna berhasil diperbarui!');
        return;
      }

      // Fallback lokal jika Supabase tidak terhubung
      store.updateUser(userId, updatedData);
      alert('Data pengguna berhasil diperbarui (Lokal)!');

    } catch (err: any) {
      alert('Gagal memperbarui pengguna: ' + (err.message || err));
    }
  };

  const handleChangeUserPassword = async (userId: string, newPassword: string) => {
    await handleUpdateUser(userId, { newPassword });
  };

  const handleAddUserWithSupabase = async (newUser: any) => {
    try {
      if (store.supabaseConnected && supabase) {
        const { error } = await supabase
          .from('users')
          .insert([
            {
              email: newUser.email,
              nama: newUser.nama,
              password: newUser.password || 'password123',
              role: newUser.role,
              no_hp: newUser.no_hp || null,
            }
          ]);

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
      <div className="min-h-screen bg-slate-100/70 text-slate-800 font-sans antialiased">
        <OfflineIndicator />
        <LoginView
          users={store.users}
          onLoginAsRole={handleLoginAsRole}
          onLoginWithEmail={handleLoginWithEmail}
          onOpenSupabaseModal={() => setShowSupabaseModal(true)}
          supabaseConnected={store.supabaseConnected}
        />

        {showSupabaseModal && (
          <SupabaseConfigModal
            onClose={() => setShowSupabaseModal(false)}
            onRefresh={store.syncWithSupabase}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-800 font-sans antialiased flex flex-col justify-between">
      <div>
        <OfflineIndicator />

        <Navbar
          currentUser={store.currentUser}
          supabaseConnected={store.supabaseConnected}
          isSyncing={store.isSyncing}
          onOpenRoleSwitcher={() => setShowRoleSwitcher(true)}
          onOpenSupabaseModal={() => setShowSupabaseModal(true)}
          onOpenSqlModal={() => setShowSqlModal(true)}
          onOpenNextjsModal={() => setShowNextjsModal(true)}
          onLogout={handleLogout}
        />

        {/* Simulasi RBAC - Hanya ditampilkan khusus untuk Super Admin */}
        {store.currentUser?.role === 'super_admin' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-3">
            <div className="bg-white rounded-2xl border border-slate-200 px-4 py-2.5 shadow-xs flex flex-wrap items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center gap-2 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Simulasi Akses Bento RBAC (Admin Only):</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { role: 'super_admin' as UserRole, label: 'Super Admin', color: 'hover:bg-indigo-50 text-indigo-700' },
                  { role: 'sekretaris' as UserRole, label: 'Sekretaris', color: 'hover:bg-blue-50 text-blue-700' },
                  { role: 'bendahara_rw' as UserRole, label: 'Bendahara RW', color: 'hover:bg-emerald-50 text-emerald-700' },
                  { role: 'bendahara_koperasi' as UserRole, label: 'Bendahara Koperasi', color: 'hover:bg-amber-50 text-amber-800' },
                  { role: 'perekap_jimpitan' as UserRole, label: 'Perekap Ronda', color: 'hover:bg-cyan-50 text-cyan-800' },
                  { role: 'warga' as UserRole, label: 'Warga Mandiri', color: 'hover:bg-slate-50 text-slate-700' },
                ].map((item) => {
                  const isActive = store.currentUser?.role === item.role;
                  return (
                    <button
                      key={item.role}
                      id={`btn-strip-role-${item.role}`}
                      onClick={() => store.switchRole(item.role)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition text-xs ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : `bg-slate-50 border border-slate-200/80 text-slate-600 ${item.color}`
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <main className="pb-16">
          {store.currentUser?.role === 'super_admin' && (
            <SuperAdminDashboard
              currentUser={store.currentUser}
              users={store.users}
              warga={store.warga}
              onAddUser={handleAddUserWithSupabase}
              onUpdateUserRole={(id, role) => handleUpdateUser(id, { role })}
              onUpdateUser={handleUpdateUser}
              onChangeUserPassword={handleChangeUserPassword}
              onDeleteUser={store.deleteUser}
              onAddWarga={store.addWarga}
              onDeleteWarga={store.deleteWarga}
            />
          )}

          {store.currentUser?.role === 'sekretaris' && (
            <SekretarisDashboard
              currentUser={store.currentUser}
              notulen={store.notulen}
              combinedTagihan={store.getCombinedTagihan()}
              onAddNotulen={store.addNotulen}
              onUpdateNotulenStatus={store.updateNotulenStatus}
              onDeleteNotulen={store.deleteNotulen}
              rincianArisan={store.rincianArisan}
              agendaArisan={store.agendaArisan}
              onUpdateRincianItem={store.updateRincianArisanItem}
              onAddRincianItem={store.addRincianArisanItem}
              onToggleRincianStatus={store.toggleRincianArisanStatus}
              onImportRincianCsv={store.importRincianArisanCsvData}
              onUpdateAgenda={store.updateAgendaArisan}
            />
          )}

          {store.currentUser?.role === 'bendahara_rw' && (
            <BendaharaRWDashboard
              currentUser={store.currentUser}
              kasRW={store.kasRW}
              onAddKasRW={store.addKasRW}
              onDeleteKasRW={store.deleteKasRW}
            />
          )}

          {store.currentUser?.role === 'bendahara_koperasi' && (
            <BendaharaKoperasiDashboard
              currentUser={store.currentUser}
              koperasi={store.koperasi}
              warga={store.warga}
              onAddKoperasi={store.addKoperasi}
              onMarkKoperasiLunas={store.markKoperasiLunas}
            />
          )}

          {store.currentUser?.role === 'perekap_jimpitan' && (
            <PerekapJimpitanDashboard
              currentUser={store.currentUser}
              rekapJimpitan={store.rekapJimpitan}
              kelompokRonda={store.kelompokRonda}
              warga={store.warga}
              onUpdateItem={store.updateRekapJimpitanItem}
              onAddItem={store.addRekapJimpitanItem}
              onToggleStatus={store.toggleRekapJimpitanStatus}
              onUpdateKelompokRonda={store.updateKelompokRondaItem}
              onImportCsv={store.importRekapJimpitanCsvData}
              jimpitan={store.jimpitan}
              onAddJimpitan={store.addJimpitan}
              onMarkJimpitanLunas={store.markJimpitanLunas}
            />
          )}

          {store.currentUser?.role === 'warga' && (
            <WargaDashboard
              currentUser={store.currentUser}
              kasRW={store.kasRW}
              notulen={store.notulen}
              warga={store.warga}
              jimpitan={store.jimpitan}
              koperasi={store.koperasi}
              rincianArisan={store.rincianArisan}
              agendaArisan={store.agendaArisan}
              rekapJimpitan={store.rekapJimpitan}
              kelompokRonda={store.kelompokRonda}
              onToggleRincianStatus={store.toggleRincianArisanStatus}
            />
          )}
        </main>
      </div>

      <footer className="border-t border-slate-200 bg-white py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">SIM-RW 05</span>
            <span>&bull; Sistem Administrasi & Keuangan PWA</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowSqlModal(true)}
              className="text-blue-700 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
            >
              <FileCode className="w-3.5 h-3.5" /> Skema SQL Supabase
            </button>
            <span>&bull;</span>
            <button
              type="button"
              onClick={() => setShowNextjsModal(true)}
              className="text-blue-700 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
            >
              <Code2 className="w-3.5 h-3.5" /> Kode Lengkap Next.js (App Router)
            </button>
          </div>
        </div>
      </footer>

      {showRoleSwitcher && (
        <RoleSwitcherModal
          currentRole={store.currentUser?.role}
          onSelectRole={(role) => {
            store.switchRole(role);
            setShowRoleSwitcher(false);
          }}
          onClose={() => setShowRoleSwitcher(false)}
        />
      )}

      {showSupabaseModal && (
        <SupabaseConfigModal
          onClose={() => setShowSupabaseModal(false)}
          onRefresh={store.syncWithSupabase}
        />
      )}

      {showSqlModal && (
        <SqlMigrationModal onClose={() => setShowSqlModal(false)} />
      )}

      {showNextjsModal && (
        <NextjsExportModal onClose={() => setShowNextjsModal(false)} />
      )}
    </div>
  );
}