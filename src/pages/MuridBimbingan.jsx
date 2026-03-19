import { useState, useMemo, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import { Search, Plus, Trash2, X, Filter, Eye, Edit, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { studentService } from '../services/studentService';
import { guidanceService } from '../services/guidanceService';

export default function MuridBimbingan() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [dataSiswaAwal, setDataSiswaAwal] = useState([]);
  const [selectedSiswa, setSelectedSiswa] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [allSiswa, bimbinganSiswa] = await Promise.all([
        studentService.getAll(),
        guidanceService.getByGuru(user.id)
      ]);
      allSiswa.sort((a, b) => a.name.localeCompare(b.name));
      bimbinganSiswa.sort((a, b) => a.name.localeCompare(b.name));
      setDataSiswaAwal(allSiswa);
      setSelectedSiswa(bimbinganSiswa);
      setIsLoaded(true);
    } catch (error) {
       showToast('Gagal memuat data murid', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalSearch, setModalSearch] = useState('');
  const [modalClassFilter, setModalClassFilter] = useState('Semua Kelas');
  const [tempSelection, setTempSelection] = useState([]);

  // Detail & Edit Modals state
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const [editForm, setEditForm] = useState({ kontakOrtu: '' });

  const classes = useMemo(() => {
    return ['Semua Kelas', ...new Set(dataSiswaAwal.map(s => s.class))];
  }, [dataSiswaAwal]);

  const openAddModal = () => {
    setTempSelection(selectedSiswa.map(s => s.id));
    setModalSearch('');
    setModalClassFilter('Semua Kelas');
    setShowModal(true);
  };

  const handleSaveSelection = async () => {
    try {
      const currentIds = selectedSiswa.map(s => s.id);
      const added = tempSelection.filter(id => !currentIds.includes(id));
      const removed = currentIds.filter(id => !tempSelection.includes(id));

      await Promise.all([
        ...added.map(id => guidanceService.toggleGuidance(user.id, id, true)),
        ...removed.map(id => guidanceService.toggleGuidance(user.id, id, false))
      ]);

      const newSelected = tempSelection.map(id => {
         const existing = selectedSiswa.find(s => s.id === id);
         if (existing) return existing;
         return {
           ...dataSiswaAwal.find(s => s.id === id),
           kontakOrtu: ''
         };
      });
      newSelected.sort((a, b) => a.name.localeCompare(b.name));
      setSelectedSiswa(newSelected);
      setShowModal(false);
      showToast('Daftar bimbingan diperbarui!', 'success');
    } catch (error) {
      showToast('Gagal menyimpan pilihan', 'error');
    }
  };

  const toggleModalSelect = (id) => {
    setTempSelection(prev => 
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    );
  };

  const removeSiswa = async (id) => {
    if(confirm('Hapus siswa dari daftar bimbingan Anda?')) {
      try {
        await guidanceService.toggleGuidance(user.id, id, false);
        setSelectedSiswa(prev => prev.filter(s => s.id !== id));
        showToast('Siswa dihapus dari daftar bimbingan', 'success');
      } catch (error) {
        showToast('Gagal menghapus siswa', 'error');
      }
    }
  };

  const openDetail = (item) => {
    setActiveItem(item);
    setShowDetailModal(true);
  };

  const openEdit = (item) => {
    setActiveItem(item);
    setEditForm({ kontakOrtu: item.kontakOrtu || '' });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      await guidanceService.updateContact(user.id, activeItem.id, editForm.kontakOrtu);
      setSelectedSiswa(prev => 
        prev.map(s => s.id === activeItem.id ? { ...s, kontakOrtu: editForm.kontakOrtu } : s)
      );
      setShowEditModal(false);
      showToast('Kontak orang tua diperbarui', 'success');
    } catch (error) {
      showToast('Gagal memperbarui kontak', 'error');
    }
  };

  const modalFilteredSiswa = dataSiswaAwal.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(modalSearch.toLowerCase()) || s.nisn.includes(modalSearch);
    const matchClass = modalClassFilter === 'Semua Kelas' || s.class === modalClassFilter;
    return matchSearch && matchClass;
  });

  return (
    <>
      <PageHeader
        title="Murid Bimbingan"
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Bimbingan' },
          { label: 'Murid Bimbingan' },
        ]}
        actions={
          <button onClick={openAddModal} className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm shadow-primary/20">
            <Plus size={18} />
            Tambah Murid
          </button>
        }
      />

      {/* Info Card */}
      <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-soft-sm border border-gray-100 dark:border-gray-800 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">Daftar Siswa Bimbingan Anda</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Siswa di bawah ini adalah tanggung jawab Anda. Total: <span className="font-bold text-primary">{selectedSiswa.length} Siswa</span>.</p>
        </div>
      </div>

      {/* Main Selected Students List */}
      <div className="bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-2xl shadow-soft-sm overflow-hidden min-h-[300px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 text-center h-[300px]">
            <p className="text-gray-500 dark:text-gray-400">Memuat data...</p>
          </div>
        ) : selectedSiswa.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center h-[300px]">
            <div className="bg-gray-50 dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mb-4 text-gray-400">
               <Search size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Belum Ada Murid Bimbingan</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">Anda belum memilih murid bimbingan. Silakan klik tombol Tambah Murid untuk memilih siswa dari master data.</p>
            <button onClick={openAddModal} className="flex items-center gap-2 bg-primary-light dark:bg-primary/20 text-primary px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary hover:text-white transition-colors">
              <Plus size={16} /> Pilih Sekarang
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-4 text-[13px] font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">NISN</th>
                  <th className="px-6 py-4 text-[13px] font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Nama Lengkap</th>
                  <th className="px-6 py-4 text-[13px] font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Kelas</th>
                  <th className="px-6 py-4 text-[13px] font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">L/P</th>
                  <th className="px-6 py-4 text-[13px] font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {selectedSiswa.map((siswa) => (
                  <tr key={siswa.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{siswa.nisn}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-primary-light dark:bg-primary/20 text-primary flex items-center justify-center font-bold text-xs mr-3">
                          {siswa.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{siswa.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{siswa.class}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{siswa.gender}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                         <button onClick={() => openDetail(siswa)} className="text-gray-400 hover:text-primary transition-colors p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" title="Lihat Detail"><Eye size={18} /></button>
                         <button onClick={() => openEdit(siswa)} className="text-gray-400 hover:text-amber-500 transition-colors p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" title="Edit"><Edit size={18} /></button>
                         <button onClick={() => removeSiswa(siswa.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Hapus dari Bimbingan">
                           <Trash2 size={18} />
                         </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Select Student Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white dark:bg-surface-dark rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-gray-100 dark:border-gray-800 overflow-hidden">
            
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Pilih Murid Bimbingan</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{tempSelection.length} murid terpilih</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1">
                <X size={20} />
              </button>
            </div>

            {/* Modal Filters */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-gray-400" />
                </div>
                <input type="text" className="block w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-surface-dark text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors" placeholder="Cari nama atau NISN..." value={modalSearch} onChange={(e) => setModalSearch(e.target.value)} />
              </div>
              <div className="relative sm:w-48">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter size={16} className="text-gray-400" />
                </div>
                <select value={modalClassFilter} onChange={(e) => setModalClassFilter(e.target.value)} className="block w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-surface-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors appearance-none">
                  {classes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Modal List */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {modalFilteredSiswa.length === 0 ? (
                   <div className="col-span-1 border sm:col-span-2 text-center py-8 text-gray-500 text-sm">Tidak ada siswa yang cocok dengan filter.</div>
                ) : modalFilteredSiswa.map(siswa => {
                  const isChecked = tempSelection.includes(siswa.id);
                  return (
                    <div 
                      key={siswa.id} 
                      onClick={() => toggleModalSelect(siswa.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isChecked ? 'border-primary bg-primary-light/30 dark:bg-primary/10' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}
                    >
                       <input type="checkbox" checked={isChecked} onChange={() => {}} className="w-4 h-4 text-primary bg-white border-gray-300 rounded focus:ring-primary cursor-pointer pointer-events-none" />
                       <div className="flex-1 min-w-0">
                         <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{siswa.name}</p>
                         <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{siswa.nisn} • {siswa.class}</p>
                       </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 flex-shrink-0 bg-white dark:bg-surface-dark">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">Batal</button>
              <button onClick={handleSaveSelection} className="px-5 py-2 rounded-xl text-sm font-medium bg-primary hover:bg-primary-hover text-white shadow-sm shadow-primary/20 transition-colors">Simpan Pilihan</button>
            </div>

          </div>
        </div>
      )}

      {/* Modal Detail */}
      {showDetailModal && activeItem && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setShowDetailModal(false)} />
          <div className="relative bg-white dark:bg-surface-dark rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Detail Siswa Bimbingan</h3>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-16 w-16 rounded-full bg-primary-light dark:bg-primary/20 text-primary flex items-center justify-center font-bold text-2xl">
                  {activeItem.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-800 dark:text-white">{activeItem.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">NISN: {activeItem.nisn}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-y-4 text-sm">
                <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-200">Kelas</p>
                  <p className="text-gray-600 dark:text-gray-400">{activeItem.class}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-200">Jenis Kelamin</p>
                  <p className="text-gray-600 dark:text-gray-400">{activeItem.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
                </div>
                <div className="col-span-2 mt-2">
                  <p className="font-semibold text-gray-700 dark:text-gray-200">Kontak Orang Tua</p>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">{activeItem.kontakOrtu || '-'}</p>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <button onClick={() => setShowDetailModal(false)} className="px-5 py-2 rounded-xl text-sm font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors">Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit */}
      {showEditModal && activeItem && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setShowEditModal(false)} />
          <div className="relative bg-white dark:bg-surface-dark rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Edit Siswa Bimbingan</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div className="space-y-1.5 opacity-60">
                 <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Nama Lengkap (Read Only)</label>
                 <input type="text" readOnly value={activeItem.name} className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-sm text-gray-800 dark:text-gray-200 cursor-not-allowed" />
              </div>
              <div className="space-y-1.5 opacity-60">
                 <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Kelas / NISN (Read Only)</label>
                 <input type="text" readOnly value={`${activeItem.class} / ${activeItem.nisn}`} className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-sm text-gray-800 dark:text-gray-200 cursor-not-allowed" />
              </div>
              <div className="space-y-1.5">
                 <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Isian Kontak Orang Tua</label>
                 <input type="text" value={editForm.kontakOrtu} onChange={(e) => setEditForm({ kontakOrtu: e.target.value })} placeholder="Masukkan No. HP Orang Tua" className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-800 dark:text-gray-200 transition-colors" />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">Batal</button>
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
