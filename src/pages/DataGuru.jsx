import { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import { useToast } from '../context/ToastContext';
import Table from '../components/Table';
import { Plus, Eye, Edit, Trash2, Search, X, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';

const initialGuru = [];

export default function DataGuru() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchGurus();
  }, []);

  const fetchGurus = async () => {
    setLoading(true);
    try {
      const { data: gurus, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'guru')
        .order('nama', { ascending: true });
        
      if (error) {
        throw error;
      }
      setData(gurus || []);
    } catch (error) {
      console.error("Error fetching gurus:", error);
      showToast("Gagal memuat data guru.", 'error');
    } finally {
      setLoading(false);
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const [form, setForm] = useState({ nama: '', nip: '', username: '', password: '' });

  const filteredData = data.filter(
    (g) => (g.nama || '').toLowerCase().includes(searchTerm.toLowerCase()) || (g.nip || '').includes(searchTerm)
  );

  const openAdd = () => {
    setEditItem(null);
    setForm({ nama: '', nip: '', username: '', password: '' });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ ...item, password: '' });
    setShowModal(true);
  };

  const openDetail = (item) => {
    setDetailItem(item);
    setShowDetailModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Yakin ingin menghapus data guru ini?')) {
      try {
        const { error } = await supabase.from('profiles').delete().eq('id', id);
        if (error) {
          throw error;
        }
        setData(data.filter(d => d.id !== id));
        showToast("Data guru berhasil dihapus.", 'success');
      } catch (error) {
        console.error("Error deleting guru:", error);
        showToast("Gagal menghapus guru.", 'error');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submitForm = { ...form };
    if (editItem && !submitForm.password) {
      delete submitForm.password;
    }
    
    // Prevent unique & not-null constraint errors for NIP
    if (!submitForm.nip || submitForm.nip.trim() === '' || submitForm.nip.trim() === '-') {
      // Create a unique placeholder that won't trigger UNIQUE violation, but satisfies NOT NULL
      submitForm.nip = `NON_ASN_${Math.floor(Math.random() * 1000000)}`;
    }
    
    // Default role for DataGuru form is 'guru'
    submitForm.role = 'guru';
    
    if (editItem) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update(submitForm)
          .eq('id', editItem.id);
          
        if (error) {
          throw error;
        }
        setData(data.map(d => d.id === editItem.id ? { ...d, ...submitForm } : d));
        showToast("Data guru berhasil diperbarui.", 'success');
        setShowModal(false);
      } catch (error) {
        console.error("Error updating guru:", error);
        showToast("Gagal memperbarui data guru.", 'error');
      }
    } else {
      try {
        // Need a UUID for new users since we are bypassing Auth
        submitForm.id = crypto.randomUUID();
        const { error } = await supabase
          .from('profiles')
          .insert([submitForm]);
          
        if (error) {
          throw error;
        }
        setData([submitForm, ...data]);
        showToast("Data guru berhasil ditambahkan.", 'success');
        setShowModal(false);
      } catch (error) {
        console.error("Error adding guru:", error);
        showToast(`Gagal menambahkan data guru.\n\nDetail error: ${error.message}\nKode: ${error.code}`, 'error');
      }
    }
  };

  const headers = [
    { label: 'Nama Lengkap' },
    { label: 'NIP' },
    { label: 'Username' },
    { label: 'Aksi', className: 'text-right' },
  ];

  const renderRow = (guru) => (
    <tr key={guru.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="h-9 w-9 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center font-bold text-xs mr-3">
            {guru.nama.charAt(0)}
          </div>
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{guru.nama}</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{guru.nip}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md text-primary font-medium">{guru.username}</code>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end gap-2">
          <button onClick={() => openDetail(guru)} className="text-gray-400 hover:text-primary transition-colors p-1" title="Detail"><Eye size={18} /></button>
          <button onClick={() => openEdit(guru)} className="text-gray-400 hover:text-amber-500 transition-colors p-1" title="Edit"><Edit size={18} /></button>
          <button onClick={() => handleDelete(guru.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1" title="Hapus"><Trash2 size={18} /></button>
        </div>
      </td>
    </tr>
  );

  return (
    <>
      <PageHeader
        title="Data Guru"
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Master Data' },
          { label: 'Data Guru' },
        ]}
        actions={
          <button onClick={openAdd} className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm shadow-primary/20">
            <Plus size={18} />
            Tambah Guru
          </button>
        }
      />

      <div className="mb-6">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input type="text" className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm transition-colors" placeholder="Cari NIP atau Nama..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Memuat data guru...</div>
      ) : (
        <Table headers={headers} data={filteredData} renderRow={renderRow} />
      )}

      {/* Modal Edit/Add */}
      {showModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white dark:bg-surface-dark rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                {editItem ? 'Edit Data Guru' : 'Tambah Guru Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Nama Lengkap</label>
                <input type="text" required placeholder="I Kadek Sukarsa, S.Pd., M.Pd." value={form.nama} onChange={(e) => setForm({...form, nama: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-800 dark:text-gray-200 transition-colors" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">NIP <span className="text-gray-400 font-normal">(opsional)</span></label>
                <input type="text" placeholder="kosongkan saja" value={form.nip} onChange={(e) => setForm({...form, nip: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-800 dark:text-gray-200 transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Username</label>
                  <input type="text" required placeholder="kadeksukarsa" value={form.username} onChange={(e) => setForm({...form, username: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-800 dark:text-gray-200 transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Password {!editItem && '*'}</label>
                  <input type="password" required={!editItem} placeholder={editItem ? "(Kosongkan jika tak diubah)" : "••••••••"} value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-800 dark:text-gray-200 transition-colors" />
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

      {/* Modal Detail */}
      {showDetailModal && detailItem && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setShowDetailModal(false)} />
          <div className="relative bg-white dark:bg-surface-dark rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Detail Guru</h3>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-16 w-16 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center font-bold text-2xl">
                  {detailItem.nama.charAt(0)}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-800 dark:text-white">{detailItem.nama}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">NIP: {detailItem.nip}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-y-4 text-sm mt-4">
                <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-200">Username</p>
                  <p className="text-gray-600 dark:text-gray-400">@{detailItem.username}</p>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <button onClick={() => setShowDetailModal(false)} className="px-5 py-2 rounded-xl text-sm font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
