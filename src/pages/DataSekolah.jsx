import { useState, useRef, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import { Save, Upload, School, Trash2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { settingService } from '../services/settingService';

export default function DataSekolah() {
  const [formData, setFormData] = useState({
    namaSekolah: '',
    npsn: '',
    alamat: '',
    kota: '',
    kopSurat1: '',
    kopSurat2: '',
    logo: null,
    header: null
  });

  const logoRef = useRef(null);
  const headerRef = useRef(null);
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const data = await settingService.getSettings();
      if (data) {
        setFormData({
          namaSekolah: data.nama_sekolah || '',
          npsn: data.npsn || localStorage.getItem('school_npsn') || '',
          alamat: data.alamat || '',
          kota: data.kota || '',
          kopSurat1: data.kop_surat_1 || '',
          kopSurat2: data.kop_surat_2 || '',
          logo: data.logo_url || null,
          header: null
        });
      }
    } catch (error) {
       showToast('Gagal memuat pengaturan', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      // Save NPSN to localStorage (column may not exist in Supabase table)
      if (formData.npsn) localStorage.setItem('school_npsn', formData.npsn);
      await settingService.updateSettings({
        nama_sekolah: formData.namaSekolah,
        kop_surat_1: formData.kopSurat1,
        kop_surat_2: formData.kopSurat2,
        alamat: formData.alamat,
        kota: formData.kota,
        logo_url: formData.logo,
      });
      showToast('Data sekolah berhasil disimpan!', 'success');
    } catch (error) {
      console.error(error);
      showToast('Gagal menyimpan data sekolah', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (field) => {
    setFormData(prev => ({ ...prev, [field]: null }));
    if (field === 'logo' && logoRef.current) logoRef.current.value = '';
    if (field === 'header' && headerRef.current) headerRef.current.value = '';
  }

  return (
    <div className="max-w-4xl mx-auto w-full">
      <PageHeader
        title="Data Sekolah"
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Pengaturan' },
          { label: 'Data Sekolah' },
        ]}
      />

      <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-soft-sm border border-gray-100 dark:border-gray-800 overflow-hidden mb-8">
        <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
          <div className="bg-primary-light dark:bg-primary/20 text-primary p-2.5 rounded-xl">
            <School size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Profil Institusi</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Pengaturan informasi dan identitas sekolah.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Nama Sekolah</label>
              <input type="text" required value={formData.namaSekolah} onChange={(e) => setFormData({...formData, namaSekolah: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-800 dark:text-gray-200 transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">NPSN</label>
              <input type="text" required value={formData.npsn} onChange={(e) => setFormData({...formData, npsn: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-800 dark:text-gray-200 transition-colors" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Kop Surat Baris 1</label>
              <input type="text" value={formData.kopSurat1} onChange={(e) => setFormData({...formData, kopSurat1: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-800 dark:text-gray-200 transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Kop Surat Baris 2</label>
              <input type="text" value={formData.kopSurat2} onChange={(e) => setFormData({...formData, kopSurat2: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-800 dark:text-gray-200 transition-colors" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Alamat Lengkap</label>
              <textarea rows={2} required value={formData.alamat} onChange={(e) => setFormData({...formData, alamat: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-800 dark:text-gray-200 transition-colors"></textarea>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Kota (Untuk Footer TTD Laporan)</label>
              <input type="text" required value={formData.kota} onChange={(e) => setFormData({...formData, kota: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-800 dark:text-gray-200 transition-colors" />
            </div>
          </div>

          {/* Upload Areas */}
          <div className="grid grid-cols-1 gap-6 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex justify-between">
                <span>Logo Sekolah (Excel Kop Surat / Identitas)</span>
                {formData.logo && <button type="button" onClick={() => removeImage('logo')} className="text-red-500 hover:text-red-600 flex items-center gap-1 text-xs"><Trash2 size={14}/> Hapus</button>}
              </label>
              <input type="file" ref={logoRef} accept="image/*" onChange={(e) => handleImageUpload(e, 'logo')} className="hidden" />
              <div onClick={() => logoRef.current?.click()} className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center hover:border-primary dark:hover:border-primary transition-colors cursor-pointer relative overflow-hidden h-40 flex flex-col items-center justify-center">
                {formData.logo ? (
                  <img src={formData.logo} alt="Logo" className="absolute inset-0 w-full h-full object-contain p-2" />
                ) : (
                  <>
                    <Upload size={28} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">Klik untuk upload logo</p>
                    <p className="text-xs text-gray-400 mt-1">PNG/JPG, Maks 2MB, Rasio 1:1</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-md shadow-primary/20 focus:ring-4 focus:ring-primary/20 disabled:opacity-50">
              <Save size={18} />
              {isSubmitting ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
