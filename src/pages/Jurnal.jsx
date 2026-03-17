import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import { Save, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Jurnal() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    murid: '', tanggal: '', kelas: '', jenisBimbingan: '', topik: '', tindakLanjut: '',
  });
  const [muridBimbingan, setMuridBimbingan] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('selectedMuridBimbingan');
    if (saved) {
      setMuridBimbingan(JSON.parse(saved));
    }
  }, []);

  const handleMuridChange = (e) => {
    const muridId = e.target.value;
    const murid = muridBimbingan.find(m => String(m.id) === muridId);
    setFormData({ ...formData, murid: murid?.name || '', kelas: murid?.class || '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const savedJurnals = localStorage.getItem('jurnalData');
    const existingJurnals = savedJurnals ? JSON.parse(savedJurnals) : [];
    
    const newJurnal = {
      ...formData,
      id: Date.now(),
      guru: user?.nama || 'Unknown',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };
    
    const upatedJurnals = [newJurnal, ...existingJurnals];
    localStorage.setItem('jurnalData', JSON.stringify(upatedJurnals));
    
    alert('Jurnal berhasil disimpan!');
    setFormData({ murid: '', tanggal: '', kelas: '', jenisBimbingan: '', topik: '', tindakLanjut: '' });
  };

  return (
    <div className="max-w-4xl mx-auto w-full">
      <PageHeader
        title="Input Jurnal Bimbingan"
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Input' },
          { label: 'Jurnal' },
        ]}
      />

      <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-soft-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-1">Jurnal Guru Wali</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Catat kegiatan bimbingan dan pendampingan siswa.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Nama Murid</label>
              <select required value={muridBimbingan.find(m => m.name === formData.murid)?.id || ''} onChange={handleMuridChange} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-800 dark:text-gray-200 transition-colors">
                <option value="" disabled>-- Pilih Murid Bimbingan --</option>
                {muridBimbingan.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Kelas (Otomatis)</label>
              <input type="text" readOnly value={formData.kelas} placeholder="Otomatis terisi" className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-sm text-gray-600 dark:text-gray-400 cursor-not-allowed" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Tanggal</label>
              <div className="relative">
                <input type="date" required value={formData.tanggal} onChange={(e) => setFormData({...formData, tanggal: e.target.value})} className="w-full px-4 py-2.5 pl-10 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-800 dark:text-gray-200 transition-colors" />
                <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Jenis Bimbingan</label>
            <select required value={formData.jenisBimbingan} onChange={(e) => setFormData({...formData, jenisBimbingan: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-800 dark:text-gray-200 transition-colors">
              <option value="" disabled>-- Pilih Jenis Bimbingan --</option>
              <option value="Pendampingan Akademik">Pendampingan Akademik</option>
              <option value="Pengembangan Kompetensi">Pengembangan Kompetensi</option>
              <option value="Pengembangan Keterampilan">Pengembangan Keterampilan</option>
              <option value="Pengembangan Karakter">Pengembangan Karakter</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Topik / Permasalahan</label>
            <textarea required rows={3} value={formData.topik} onChange={(e) => setFormData({...formData, topik: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-800 dark:text-gray-200 resize-none transition-colors" placeholder="Jelaskan topik atau permasalahan yang dibahas..." />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Tindak Lanjut</label>
            <textarea required rows={3} value={formData.tindakLanjut} onChange={(e) => setFormData({...formData, tindakLanjut: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-800 dark:text-gray-200 resize-none transition-colors" placeholder="Langkah tindak lanjut yang akan dilakukan..." />
          </div>

          <div className="pt-4 flex justify-end">
            <button type="submit" className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-md shadow-primary/20 focus:ring-4 focus:ring-primary/20">
              <Save size={18} />
              Simpan Jurnal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
