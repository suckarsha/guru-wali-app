import { useState, useRef, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { Save, Upload, UserCircle, Trash2 } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    nama: user?.username === 'admin' ? 'Administrator' : 'I Kadek Sukarsa, S.Pd., M.Pd.',
    nip: user?.role === 'guru' ? '198501012010011001' : '',
    username: user?.username || '',
    passwordLama: '',
    passwordBaru: '',
  });

  const [profilePic, setProfilePic] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const savedPic = localStorage.getItem(`profilePic_${user?.username}`);
    if (savedPic) {
      setProfilePic(savedPic);
    }
  }, [user]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
        localStorage.setItem(`profilePic_${user?.username}`, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearProfilePic = () => {
    setProfilePic(null);
    localStorage.removeItem(`profilePic_${user?.username}`);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Simulasi: Profil disimpan!\n' + JSON.stringify(formData, null, 2));
  };

  return (
    <div className="max-w-4xl mx-auto w-full">
      <PageHeader
        title="Profil Saya"
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Akun' },
          { label: 'Profil' },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-soft-sm border border-gray-100 dark:border-gray-800 p-6 text-center">
          <div className="relative inline-block mb-4">
            <div className="w-24 h-24 rounded-full bg-primary-light dark:bg-primary/20 text-primary flex items-center justify-center mx-auto overflow-hidden border-4 border-white dark:border-gray-800 shadow-sm relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              {profilePic ? (
                <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserCircle size={48} />
              )}
              <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center flex-col gap-1 transition-all">
                <Upload size={20} className="text-white" />
                <span className="text-[10px] text-white font-semibold uppercase tracking-wider">Ubah</span>
              </div>
            </div>
            {profilePic && (
               <button onClick={clearProfilePic} title="Hapus Foto" className="absolute bottom-0 right-0 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-colors z-10">
                 <Trash2 size={14} />
               </button>
            )}
            {!profilePic && (
              <button onClick={() => fileInputRef.current?.click()} title="Upload Foto" className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1.5 shadow-md hover:bg-primary-hover transition-colors z-10">
                <Upload size={14} />
              </button>
            )}
            <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageUpload} className="hidden" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">{formData.nama}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 capitalize mt-1">{user?.role}</p>
          {formData.nip && (
            <p className="text-xs text-gray-400 mt-2">NIP: {formData.nip}</p>
          )}
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2 bg-white dark:bg-surface-dark rounded-2xl shadow-soft-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Edit Profil</h2>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Nama Lengkap</label>
              <input type="text" required value={formData.nama} onChange={(e) => setFormData({...formData, nama: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-800 dark:text-gray-200 transition-colors" />
            </div>
            {user?.role === 'guru' && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">NIP</label>
                <input type="text" value={formData.nip} onChange={(e) => setFormData({...formData, nip: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-800 dark:text-gray-200 transition-colors" />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Username</label>
              <input type="text" required value={formData.username} readOnly className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-sm text-gray-600 dark:text-gray-400 cursor-not-allowed" />
            </div>

            <hr className="border-gray-100 dark:border-gray-800" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Password Lama</label>
                <input type="password" value={formData.passwordLama} onChange={(e) => setFormData({...formData, passwordLama: e.target.value})} placeholder="••••••••" className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-800 dark:text-gray-200 transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Password Baru</label>
                <input type="password" value={formData.passwordBaru} onChange={(e) => setFormData({...formData, passwordBaru: e.target.value})} placeholder="••••••••" className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-800 dark:text-gray-200 transition-colors" />
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button type="submit" className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-md shadow-primary/20 focus:ring-4 focus:ring-primary/20">
                <Save size={18} />
                Simpan Perubahan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
