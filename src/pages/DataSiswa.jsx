import { useState, useEffect, useRef, useMemo } from 'react';
import PageHeader from '../components/PageHeader';
import { useToast } from '../context/ToastContext';
import { Plus, Search, Eye, Edit, Trash2, Upload, X, Save, Filter } from 'lucide-react';
import ExcelJS from 'exceljs';
import { studentService } from '../services/studentService';

export default function DataSiswa() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('Semua Kelas');
  const [selectedIds, setSelectedIds] = useState([]);
  
  const { showToast } = useToast();

  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const formDefault = { nisn: '', name: '', class: '', gender: 'L' };
  const [form, setForm] = useState(formDefault);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const students = await studentService.getAll();
      setData(students);
    } catch (error) {
      showToast('Gagal memuat data siswa', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const classes = useMemo(() => {
    return ['Semua Kelas', ...new Set(data.map(s => s.class))];
  }, [data]);

  const filteredData = data.filter(
    (siswa) => {
      const matchSearch = siswa.name.toLowerCase().includes(searchTerm.toLowerCase()) || siswa.nisn.includes(searchTerm);
      const matchClass = classFilter === 'Semua Kelas' || siswa.class === classFilter;
      return matchSearch && matchClass;
    }
  );

  const openAdd = () => {
    setEditItem(null);
    setForm({ nisn: '', name: '', class: '', gender: 'L' });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ ...item });
    setShowModal(true);
  };

  const openDetail = (item) => {
    setDetailItem(item);
    setShowDetailModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Yakin ingin menghapus data siswa ini?')) {
      try {
        await studentService.delete(id);
        setData(data.filter(d => d.id !== id));
        setSelectedIds(selectedIds.filter(selId => selId !== id));
        showToast('Data siswa berhasil dihapus', 'success');
      } catch (error) {
        showToast('Gagal menghapus data siswa', 'error');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (confirm(`Yakin ingin menghapus ${selectedIds.length} data siswa yang dipilih?`)) {
      try {
        await studentService.bulkDelete(selectedIds);
        setData(data.filter(d => !selectedIds.includes(d.id)));
        setSelectedIds([]);
        showToast('Data siswa berhas dihapus', 'success');
      } catch (error) {
        showToast('Gagal menghapus data', 'error');
      }
    }
  };

  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredData.map(d => d.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelectRow = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleImportClick = () => {
    if(fileInputRef.current) {
      fileInputRef.current.click();
    }
  };



  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(file);
        const worksheet = workbook.worksheets[0];
        
        const importedData = [];
        let isHeader = true;
        
        worksheet.eachRow((row, rowNumber) => {
          if (isHeader) {
            isHeader = false; // Skip the first header row
            return;
          }
          
          // Screenshot columns: 1: NISN, 2: Nama Lengkap, 3: Jenis Kelamin, 4: Kelas
          const nisn = row.getCell(1).value?.toString().trim() || '';
          const name = row.getCell(2).value?.toString().trim() || '';
          const gender = row.getCell(3).value?.toString().trim() || 'L';
          const kelas = row.getCell(4).value?.toString().trim() || 'Unassigned';

          if (name) {
            importedData.push({
              id: Date.now() + Math.random(),
              nisn: nisn,
              name: name,
              gender: gender,
              class: kelas
            });
          }
        });

        if (importedData.length > 0) {
          try {
            const insertedData = await studentService.bulkCreate(importedData);
            setData([...insertedData, ...data]);
            showToast(`Berhasil mengimpor ${insertedData.length} data siswa dari file: ${file.name}`, 'success');
          } catch (dbError) {
            console.error("DB Import Error:", dbError);
            showToast(`Gagal menyimpan ke database: ${dbError.message || dbError}`, 'error');
          }
        } else {
          showToast("File kosong atau tidak terbaca.", 'error');
        }
      } catch (error) {
        console.error("Error reading file:", error);
        showToast(`Gagal membaca file Excel: ${error.message || error}`, 'error');
      } finally {
        e.target.value = null;
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        const updated = await studentService.update(editItem.id, form);
        setData(data.map(d => d.id === editItem.id ? updated : d));
        showToast('Data siswa berhasil diperbarui', 'success');
      } else {
        const newlyCreated = await studentService.create(form);
        setData([newlyCreated, ...data]);
        showToast('Data siswa berhasil ditambahkan', 'success');
      }
      setShowModal(false);
    } catch (error) {
      showToast('Gagal menyimpan data siswa', 'error');
    }
  };

  const allFilteredSelected = filteredData.length > 0 && selectedIds.length === filteredData.length;

  return (
    <>
      <PageHeader
        title="Data Siswa"
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Master Data' },
          { label: 'Data Siswa' },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept=".xlsx, .xls, .csv" 
              onChange={handleFileChange} 
            />
            {selectedIds.length > 0 && (
              <button onClick={handleBulkDelete} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm">
                <Trash2 size={18} />
                Hapus Terpilih ({selectedIds.length})
              </button>
            )}
            <button onClick={handleImportClick} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm">
              <Upload size={18} />
              Import Excel
            </button>
            <button onClick={openAdd} className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm shadow-primary/20">
              <Plus size={18} />
              Tambah Siswa
            </button>
          </div>
        }
      />

      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <div className="relative w-full sm:w-80 flex-shrink-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
              placeholder="Cari NISN atau Nama..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative w-full sm:w-48 flex-shrink-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter size={16} className="text-gray-400" />
            </div>
            <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className="block w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-surface-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors appearance-none">
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Manual Table for check-all mechanism */}
      <div className="bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-2xl shadow-soft-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                <th className="px-6 py-4 w-[50px]">
                  <input type="checkbox" checked={allFilteredSelected} onChange={toggleSelectAll} className="w-4 h-4 text-primary bg-white border-gray-300 rounded focus:ring-primary cursor-pointer" />
                </th>
                <th className="px-6 py-4 text-[13px] font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">NISN</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Nama Lengkap</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Kelas</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">L/P</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading ? (
                <tr>
                   <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">Memuat data...</td>
                </tr>
              ) : filteredData.length > 0 ? filteredData.map((siswa) => (
                <tr key={siswa.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <input type="checkbox" checked={selectedIds.includes(siswa.id)} onChange={() => toggleSelectRow(siswa.id)} className="w-4 h-4 text-primary bg-white border-gray-300 rounded focus:ring-primary cursor-pointer" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{siswa.nisn}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-primary-light dark:bg-primary/20 text-primary flex items-center justify-center font-bold text-xs mr-3">
                        {siswa.name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{siswa.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{siswa.class}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{siswa.gender}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openDetail(siswa)} className="text-gray-400 hover:text-primary transition-colors p-1" title="Lihat Detail"><Eye size={18} /></button>
                      <button onClick={() => openEdit(siswa)} className="text-gray-400 hover:text-amber-500 transition-colors p-1" title="Edit"><Edit size={18} /></button>
                      <button onClick={() => handleDelete(siswa.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1" title="Hapus"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                   <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">Tidak ada data siswa ditemukan</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white dark:bg-surface-dark rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                {editItem ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">NISN</label>
                  <input type="text" required value={form.nisn} onChange={(e) => setForm({...form, nisn: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-800 dark:text-gray-200 transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Nama Lengkap</label>
                  <input type="text" required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-800 dark:text-gray-200 transition-colors" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Kelas</label>
                  <input type="text" required value={form.class} onChange={(e) => setForm({...form, class: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-800 dark:text-gray-200 transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Jenis Kelamin</label>
                  <select value={form.gender} onChange={(e) => setForm({...form, gender: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-800 dark:text-gray-200 transition-colors">
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
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
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Detail Siswa</h3>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-16 w-16 rounded-full bg-primary-light dark:bg-primary/20 text-primary flex items-center justify-center font-bold text-2xl">
                  {detailItem.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-800 dark:text-white">{detailItem.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">NISN: {detailItem.nisn}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-y-4 text-sm">
                <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-200">Kelas</p>
                  <p className="text-gray-600 dark:text-gray-400">{detailItem.class}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-200">Jenis Kelamin</p>
                  <p className="text-gray-600 dark:text-gray-400">{detailItem.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
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
