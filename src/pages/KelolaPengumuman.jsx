import { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import { Plus, Edit, Trash2, X, Save, Megaphone } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { announcementService } from '../services/announcementService';

export default function KelolaPengumuman() {
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ judul: '', isi: '', tanggal: '', prioritas: 'biasa' });
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchPengumuman();
  }, []);

  const fetchPengumuman = async () => {
    try {
      setIsLoading(true);
      const announcements = await announcementService.getAll();
      const mapped = announcements.map(a => ({
        id: a.id,
        judul: a.title,
        isi: a.content,
        tanggal: a.date,
        prioritas: a.type
      }));
      setData(mapped);
    } catch (error) {
      showToast('Gagal memuat pengumuman', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const openAdd = () => {
    setEditItem(null);
    setForm({ judul: '', isi: '', tanggal: '', prioritas: 'biasa' });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ judul: item.judul, isi: item.isi, tanggal: item.tanggal, prioritas: item.prioritas });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Yakin ingin menghapus pengumuman ini?')) {
      try {
        await announcementService.delete(id);
        setData(data.filter(d => d.id !== id));
        showToast('Pengumuman berhasil dihapus', 'success');
      } catch (error) {
        showToast('Gagal menghapus pengumuman', 'error');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: form.judul,
        content: form.isi,
        date: form.tanggal,
        type: form.prioritas
      };

      if (editItem) {
        const updated = await announcementService.update(editItem.id, payload);
        setData(data.map(d => d.id === editItem.id ? { id: updated.id, judul: updated.title, isi: updated.content, tanggal: updated.date, prioritas: updated.type } : d));
        showToast('Pengumuman berhasil diperbarui', 'success');
      } else {
        const created = await announcementService.create(payload);
        setData([{ id: created.id, judul: created.title, isi: created.content, tanggal: created.date, prioritas: created.type }, ...data]);
        showToast('Pengumuman berhasil dibuat', 'success');
      }
      setShowModal(false);
    } catch (error) {
      showToast('Gagal menyimpan pengumuman', 'error');
    }
  };

  const getPrioritasStyle = (p) => {
    switch (p) {
      case 'penting': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'info': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <>
      <PageHeader
        title="Kelola Pengumuman"
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Pengaturan' },
          { label: 'Pengumuman' },
        ]}
        actions={
          <button onClick={openAdd} className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm shadow-primary/20">
            <Plus size={18} />
            Buat Pengumuman
          </button>
        }
      />

      {/* Pengumuman Cards */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-white dark:bg-surface-dark rounded-2xl p-12 shadow-soft-sm border border-gray-100 dark:border-gray-800 text-center">
            <p className="text-gray-500 dark:text-gray-400">Memuat pengumuman...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="bg-white dark:bg-surface-dark rounded-2xl p-12 shadow-soft-sm border border-gray-100 dark:border-gray-800 text-center">
            <Megaphone size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">Belum ada pengumuman. Klik tombol di atas untuk membuat.</p>
          </div>
        ) : (
          data.map((item) => (
            <div key={item.id} className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-soft-sm border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-[16px] font-bold text-gray-800 dark:text-white">{item.judul}</h3>
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md ${getPrioritasStyle(item.prioritas)}`}>
                    {item.prioritas}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 leading-relaxed">{item.isi}</p>
                <p className="text-xs text-gray-400">Dipublikasikan: {item.tanggal}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => openEdit(item)} className="p-2 text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors" title="Edit">
                  <Edit size={18} />
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Hapus">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white dark:bg-surface-dark rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                {editItem ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Judul</label>
                <input type="text" required placeholder="Judul pengumuman" value={form.judul} onChange={(e) => setForm({...form, judul: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-800 dark:text-gray-200 transition-colors" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Isi Pengumuman</label>
                <textarea required rows={3} placeholder="Tulis isi pengumuman..." value={form.isi} onChange={(e) => setForm({...form, isi: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-800 dark:text-gray-200 resize-none transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Tanggal</label>
                  <input type="date" required value={form.tanggal} onChange={(e) => setForm({...form, tanggal: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-800 dark:text-gray-200 transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Prioritas</label>
                  <select value={form.prioritas} onChange={(e) => setForm({...form, prioritas: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-800 dark:text-gray-200 transition-colors">
                    <option value="biasa">Biasa</option>
                    <option value="penting">Penting</option>
                    <option value="info">Info</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">Batal</button>
                <button type="submit" className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium bg-primary hover:bg-primary-hover text-white shadow-sm shadow-primary/20 transition-colors">
                  <Save size={16} />
                  {editItem ? 'Simpan Perubahan' : 'Publikasikan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
