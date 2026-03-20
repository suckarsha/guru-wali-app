import { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import { Users, Edit, Trash2, Plus, X, Save, Search } from 'lucide-react';
import { classService } from '../services/classService';
import { useToast } from '../context/ToastContext';

export default function Kelas() {
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { showToast } = useToast();

  const filteredData = data.filter(k => 
    k.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setIsLoading(true);
      const classes = await classService.getAll();
      setData(classes);
    } catch (error) {
      showToast('Gagal memuat data kelas', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const openAdd = () => {
    setEditItem(null);
    setForm({ name: '' });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ name: item.name });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Yakin ingin menghapus data kelas ini?')) {
      try {
        await classService.delete(id);
        setData(data.filter(d => d.id !== id));
        showToast('Kelas berhasil dihapus', 'success');
      } catch (error) {
        showToast('Gagal menghapus kelas. Pastikan kelas tidak digunakan data siswa.', 'error');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        const updated = await classService.update(editItem.id, form.name);
        setData(data.map(d => d.id === editItem.id ? updated : d));
        showToast('Kelas berhasil diperbarui', 'success');
      } else {
        const newlyCreated = await classService.create(form.name);
        setData([...data, newlyCreated]);
        showToast('Kelas berhasil ditambahkan', 'success');
      }
      setShowModal(false);
    } catch (error) {
      showToast('Gagal menyimpan kelas', 'error');
    }
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

      <div className="mb-6">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input 
            type="text" 
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm" 
            placeholder="Cari Nama Kelas..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {isLoading ? (
          <div className="col-span-full py-10 text-center text-gray-500">
            Memuat data...
          </div>
        ) : filteredData.length === 0 ? (
          <div className="col-span-full py-10 text-center text-gray-500">
            {data.length === 0 ? 'Belum ada data kelas. Kelas otomatis dibuat dari impor data siswa.' : 'Kelas tidak ditemukan.'}
          </div>
        ) : (
          [...filteredData].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true })).map((kelas) => (
          <div key={kelas.id} className="bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-xl p-4 shadow-soft-sm hover:shadow-soft-md transition-shadow relative group flex flex-col justify-center items-center h-28">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">{kelas.name}</h3>
            <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity absolute bottom-2">
              <button onClick={() => openEdit(kelas)} className="p-1.5 text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors" title="Edit">
                <Edit size={16} />
              </button>
              <button onClick={() => handleDelete(kelas.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Hapus">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))
        )}
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
