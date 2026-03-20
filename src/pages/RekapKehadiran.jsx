import { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import { useToast } from '../context/ToastContext';
import { Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { attendanceService } from '../services/attendanceService';
import { guidanceService } from '../services/guidanceService';
import CustomSelect from '../components/CustomSelect';

const bulanList = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

export default function RekapKehadiran() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [muridBimbingan, setMuridBimbingan] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    murid: '', kelas: '', bulan: '', sakit: 0, izin: 0, tanpaKeterangan: 0,
  });

  useEffect(() => {
    if (user?.id) {
      guidanceService.getByGuru(user.id).then(data => {
        const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name));
        setMuridBimbingan(sorted);
      }).catch(err => {
        showToast('Gagal memuat daftar murid bimbingan', 'error');
      });
    }
  }, [user]);

  const jumlah = Number(formData.sakit) + Number(formData.izin) + Number(formData.tanpaKeterangan);

  const handleMuridChange = (e) => {
    const muridId = e.target.value;
    const murid = muridBimbingan.find(m => String(m.id) === String(muridId));
    setFormData({ ...formData, murid: muridId, kelas: murid?.class || '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate that a murid and month are selected
    if (!formData.murid || !formData.bulan) {
      showToast('Pilih murid dan bulan terlebih dahulu', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      await attendanceService.saveMonthlySummary(
        formData.bulan,
        formData.murid, // this is the student_id
        Number(formData.sakit),
        Number(formData.izin),
        Number(formData.tanpaKeterangan)
      );
      
      showToast('Rekap kehadiran berhasil disimpan!', 'success');
      setFormData({ murid: '', kelas: '', bulan: '', sakit: 0, izin: 0, tanpaKeterangan: 0 });
    } catch (error) {
      showToast('Gagal menyimpan rekap kehadiran', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full">
      <PageHeader
        title="Rekap Kehadiran"
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Input' },
          { label: 'Rekap Kehadiran' },
        ]}
      />

      <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-soft-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-1">Input Rekap Kehadiran</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Catat kehadiran bulanan murid bimbingan.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Nama Murid</label>
              <CustomSelect
                searchable
                required
                value={formData.murid}
                onChange={handleMuridChange}
                placeholder="-- Pilih Murid --"
                options={muridBimbingan.length > 0 
                  ? muridBimbingan.map(m => ({ value: m.id, label: m.name }))
                  : [{ value: '', label: 'Belum ada murid bimbingan' }]
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Kelas (Otomatis)</label>
              <input type="text" readOnly value={formData.kelas} placeholder="Otomatis terisi" className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-sm text-gray-600 dark:text-gray-400 cursor-not-allowed" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Bulan</label>
              <CustomSelect
                required
                value={formData.bulan}
                onChange={(e) => setFormData({...formData, bulan: e.target.value})}
                placeholder="-- Pilih Bulan --"
                options={bulanList.map(b => ({ value: b, label: b }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Sakit', key: 'sakit', color: 'border-amber-400 focus:border-amber-500' },
              { label: 'Izin', key: 'izin', color: 'border-blue-400 focus:border-blue-500' },
              { label: 'Tanpa Keterangan', key: 'tanpaKeterangan', color: 'border-red-400 focus:border-red-500' },
            ].map(field => (
              <div key={field.key} className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">{field.label}</label>
                <input type="number" min="0" required value={formData[field.key]} onChange={(e) => setFormData({...formData, [field.key]: e.target.value})} className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-2 ${field.color} rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm text-gray-800 dark:text-gray-200 text-center font-bold text-lg transition-colors`} />
              </div>
            ))}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Jumlah (Otomatis)</label>
              <div className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-sm text-center font-bold text-lg text-gray-800 dark:text-white">
                {jumlah}
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-md shadow-primary/20 focus:ring-4 focus:ring-primary/20 disabled:opacity-50">
              <Save size={18} />
              {isSubmitting ? 'Menyimpan...' : 'Simpan Rekap'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
