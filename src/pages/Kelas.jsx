import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import { Users, Edit, Trash2, Plus, X, Save } from 'lucide-react';

const initialKelas = [
  { id: 1, name: 'X MIPA 1', wali: 'Ahmad Guru, M.Pd.', students: 36, attendance: '95%' },
  { id: 2, name: 'X MIPA 2', wali: 'Budi Santoso, S.Pd.', students: 35, attendance: '92%' },
  { id: 3, name: 'XI IPS 1', wali: 'Siti Aminah, S.Pd.', students: 34, attendance: '88%' },
  { id: 4, name: 'XI IPS 2', wali: 'Joko Widodo, S.Pd.', students: 36, attendance: '91%' },
  { id: 5, name: 'XII Bahasa', wali: 'Ratih, S.S.', students: 28, attendance: '98%' },
];

export default function Kelas() {
  const [data, setData] = useState(initialKelas);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', wali: '', students: 0, attendance: '0%' });

  const openAdd = () => {
    setEditItem(null);
    setForm({ name: '', wali: '', students: 0, attendance: '0%' });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ ...item });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (confirm('Yakin ingin menghapus data kelas ini?')) {
      setData(data.filter(d => d.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editItem) {
      setData(data.map(d => d.id === editItem.id ? { ...d, ...form } : d));
    } else {
      setData([{ id: Date.now(), ...form }, ...data]);
    }
    setShowModal(false);
  };

  return (
    <>
      <PageHeader
        title="Daftar Kelas"
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Master Data' },
          { label: 'Data Kelas' },
        ]}
        actions={
          <button onClick={openAdd} className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm shadow-primary/20">
            <Plus size={18} />
            Tambah Kelas
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((kelas) => (
          <div key={kelas.id} className="bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-soft-sm hover:shadow-soft-md transition-shadow relative group">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">{kelas.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Wali: {kelas.wali}</p>
              </div>
              <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity translate-y-[-4px]">
                <button onClick={() => openEdit(kelas)} className="p-1.5 text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors" title="Edit">
                  <Edit size={16} />
                </button>
                <button onClick={() => handleDelete(kelas.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Hapus">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-6 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <div className="bg-primary-light dark:bg-primary/20 text-primary p-1.5 rounded-lg">
                  <Users size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Total Siswa</span>
                  <span className="text-sm font-semibold">{kelas.students} Siswa</span>
                </div>
              </div>
              <div className="flex flex-col border-l pl-4 border-gray-100 dark:border-gray-800">
                <span className="text-xs text-gray-500 dark:text-gray-400">Kehadiran (Rata-rata)</span>
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{kelas.attendance}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white dark:bg-surface-dark rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                {editItem ? 'Edit Data Kelas' : 'Tambah Kelas Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Nama Kelas</label>
                <input type="text" required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-800 dark:text-gray-200 transition-colors" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Wali Kelas</label>
                <input type="text" required value={form.wali} onChange={(e) => setForm({...form, wali: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-800 dark:text-gray-200 transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Jumlah Siswa</label>
                  <input type="number" required value={form.students} onChange={(e) => setForm({...form, students: parseInt(e.target.value) || 0})} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-800 dark:text-gray-200 transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Target Kehadiran</label>
                  <input type="text" value={form.attendance} onChange={(e) => setForm({...form, attendance: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-800 dark:text-gray-200 transition-colors" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">Batal</button>
                <button type="submit" className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium bg-primary hover:bg-primary-hover text-white shadow-sm shadow-primary/20 transition-colors">
                  <Save size={16} />
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
