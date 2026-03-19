import React from 'react';
import PageHeader from '../components/PageHeader';
import { Settings, Trash2, Info, AlertTriangle, Code, Upload, Save, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useRef, useEffect } from 'react';
import { settingService } from '../services/settingService';

export default function Pengaturan() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [appName, setAppName] = useState('Guru Wali App.');
  const [appLogo, setAppLogo] = useState('/logo.png');
  const [isSaving, setIsSaving] = useState(false);
  const logoRef = useRef(null);

  useEffect(() => {
    settingService.getSettings().then(data => {
      if (data) {
        setAppName(data.app_name || 'Guru Wali App.');
        setAppLogo(data.app_logo_url || '/logo.png');
      }
    }).catch(console.error);
  }, []);

  const handleClearData = () => {
    if (confirm('PERINGATAN SEVERA!\nSemua data lokal (Siswa Bimbingan, Foto Profil, Pengaturan Tampilan) akan dihapus permanen.\n\nApakah Anda benar-benar yakin?')) {
      localStorage.clear();
      alert('Semua data berhasil dibersihkan. Aplikasi akan dimuat ulang.');
      logout();
      navigate('/login');
      window.location.reload();
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAppLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAppConfig = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await settingService.updateSettings({ app_name: appName, app_logo_url: appLogo });
      alert('Pengaturan Aplikasi berhasil disinkronisasi ke server! Halaman akan dimuat ulang untuk memperbarui tampilan.');
      window.location.reload();
    } catch (error) {
      console.error('Save error:', error);
      alert('Gagal menyimpan pengaturan aplikasi');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Pengaturan Sistem"
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Pengaturan' }
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Settings Panel */}
        <div className="md:col-span-2 space-y-6">
          {/* Section 1: Reset Data */}
          <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-red-100 dark:border-red-900/30">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 flex items-center justify-center">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Zona Berbahaya</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Pengaturan destruktif untuk sistem</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-xl gap-4">
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">Kosongkan Semua Data</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Hapus semua data penyimpanan lokal termasuk pengaturan, foto, dan murid bimbingan. Sistem akan logout setelah selesai.</p>
                </div>
                <button 
                  onClick={handleClearData} 
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors whitespace-nowrap shadow-sm shadow-red-200 dark:shadow-red-900/30"
                >
                  <Trash2 size={16} />
                  Hapus Data
                </button>
              </div>
            </div>
          </div>
          
          {/* Section 2: App Personalization */}
          {user?.role === 'admin' && (
            <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary-light dark:bg-primary/20 text-primary flex items-center justify-center">
                  <Eye size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">Personalisasi Aplikasi</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Atur logo dan nama aplikasi untuk perangkat ini</p>
                </div>
              </div>
              <form onSubmit={handleSaveAppConfig} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Nama Aplikasi</label>
                  <input type="text" value={appName} onChange={(e) => setAppName(e.target.value)} required className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-800 dark:text-gray-200 transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Logo Aplikasi (Sidebar)</label>
                  <input type="file" ref={logoRef} accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  <div onClick={() => logoRef.current?.click()} className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center hover:border-primary dark:hover:border-primary transition-colors cursor-pointer relative overflow-hidden h-32 flex flex-col items-center justify-center">
                    {appLogo ? (
                      <img src={appLogo} alt="App Logo" className="absolute inset-0 w-full h-full object-contain p-2" />
                    ) : (
                      <>
                        <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">Klik untuk upload logo resolusi tinggi</p>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex justify-end">
                  <button type="submit" disabled={isSaving} className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm focus:ring-4 focus:ring-primary/20 disabled:opacity-50">
                    <Save size={18} /> {isSaving ? 'Menyimpan...' : 'Simpan Tampilan'}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <Info size={20} className="text-primary" />
              <h3 className="font-bold text-gray-800 dark:text-white">Informasi Aplikasi</h3>
            </div>
            
            <div className="space-y-4 text-sm mt-6">
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3">
                <span className="text-gray-500 dark:text-gray-400">Nama Aplikasi</span>
                <span className="font-bold text-gray-800 dark:text-gray-200 text-right">{appName}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3">
                <span className="text-gray-500 dark:text-gray-400">Versi</span>
                <span className="font-bold text-primary text-right">v.1.0</span>
              </div>
              <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-800 pb-3">
                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5 min-w-max"><Code size={14}/> Pengembang</span>
                <a 
                  href="https://www.instagram.com/suckarsha/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-bold text-primary hover:text-primary-hover dark:text-blue-400 dark:hover:text-blue-300 transition-colors text-right underline underline-offset-2"
                >
                  IKS
                </a>
              </div>
              <div className="flex justify-between items-center pb-1">
                <span className="text-gray-500 dark:text-gray-400">Lisensi</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-lg text-[11px] uppercase tracking-wider">Aktif (Lifetime)</span>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 text-center">
              <p className="text-[11px] text-gray-400">
                &copy; {new Date().getFullYear()} Hak Cipta Dilindungi Undang-Undang.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
