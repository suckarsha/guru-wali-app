import { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import Table from '../components/Table';
import { useToast } from '../context/ToastContext';
import { Filter, Download, FileSpreadsheet, X, Edit, Trash2, Save } from 'lucide-react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const bulanList = ['Semua','Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

const jenisConfig = [
  { key: 'Pendampingan Akademik', label: 'Akademik', color: '#3b82f6', bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  { key: 'Pengembangan Kompetensi', label: 'Kompetensi', color: '#8b5cf6', bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600', badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  { key: 'Pengembangan Keterampilan', label: 'Keterampilan', color: '#10b981', bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  { key: 'Pengembangan Karakter', label: 'Karakter', color: '#ef4444', bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600', badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
];

export default function DataBimbingan() {
  const [dataJurnal, setDataJurnal] = useState([]);
  const [filterBulan, setFilterBulan] = useState('Semua');
  const [filterMurid, setFilterMurid] = useState('Semua');
  const [chartMurid, setChartMurid] = useState('');
  const [selectedJurnal, setSelectedJurnal] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const { showToast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem('jurnalData');
    if (saved) {
      const parsed = JSON.parse(saved).map(j => ({
        ...j,
        jenis: j.jenis || j.jenisBimbingan || 'Lainnya',
        tanggal: j.tanggal || new Date().toISOString().split('T')[0]
      }));
      setDataJurnal(parsed);
      if (parsed.length > 0) setChartMurid(parsed[0].murid);
    }
  }, []);

  // Load Admin Settings
  const [settings, setSettings] = useState({
    namaSekolah: 'SMA NEGERI 1 DENPASAR',
    kopSurat1: 'PEMERINTAH PROVINSI BALI',
    kopSurat2: 'DINAS PENDIDIKAN KEPEMUDAAN DAN OLAHRAGA',
    alamat: 'Jl. Kamboja No.17, Dangin Puri Kangin, Denpasar Utara, Bali 80233\nTelepon: (0361) 222539 | Website: www.sman1denpasar.sch.id',
    kota: 'Denpasar',
    logo: null
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem('adminSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const muridNames = ['Semua', ...new Set(dataJurnal.map(j => j.murid))];
  const chartMuridNames = [...new Set(dataJurnal.map(j => j.murid))];

  const filteredData = dataJurnal.filter(j => {
    // Determine month string of jurnal
    const monthIndex = parseInt(j.tanggal.split('-')[1], 10);
    const jMonth = bulanList[monthIndex]; // Assuming month is 1-indexed and matches list starting at index 1

    const matchBulan = filterBulan === 'Semua' || jMonth === filterBulan;
    const matchMurid = filterMurid === 'Semua' || j.murid === filterMurid;
    return matchBulan && matchMurid;
  });

  // Donut chart data for selected student
  const studentJurnal = dataJurnal.filter(j => j.murid === chartMurid);
  const total = studentJurnal.length;
  const counts = jenisConfig.map(jc => ({
    ...jc,
    count: studentJurnal.filter(j => j.jenis === jc.key).length,
  }));

  // Build conic-gradient
  const segments = [];
  let cursor = 0;
  counts.forEach(c => {
    if (c.count > 0) {
      const pct = Math.round((c.count / total) * 100);
      segments.push(`${c.color} ${cursor}% ${cursor + pct}%`);
      cursor += pct;
    }
  });
  if (cursor < 100 && segments.length > 0) {
    segments[segments.length - 1] = segments[segments.length - 1].replace(/\d+%$/, '100%');
  }
  const gradient = segments.length > 0 ? `conic-gradient(${segments.join(', ')})` : 'conic-gradient(#e5e7eb 0% 100%)';

  const getJenisColor = (jenis) => {
    if (!jenis) return 'bg-gray-100 text-gray-700';
    const found = jenisConfig.find(jc => jenis.includes(jc.label) || jenis === jc.key);
    return found?.badge || 'bg-gray-100 text-gray-700';
  };

  const headers = [
    { label: 'Tanggal' },
    { label: 'Murid' },
    { label: 'Jenis' },
    { label: 'Topik' },
    { label: 'Tindak Lanjut' },
  ];

  const renderRow = (j) => (
    <tr 
      key={j.id} 
      onClick={() => { setSelectedJurnal(j); setShowModal(true); }}
      className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer"
    >
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
        <div>{j.tanggal}</div>
        <div className="text-xs text-gray-400">{j.waktu}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{j.murid}</span>
        <div className="text-xs text-gray-400">{j.kelas}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-md ${getJenisColor(j.jenis)}`}>{j.jenis}</span>
      </td>
      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-[200px] truncate">{j.topik}</td>
      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-[200px] truncate">{j.tindakLanjut}</td>
    </tr>
  );

  const handleDownloadExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data Bimbingan Jurnal');

    // KOP SURAT
    worksheet.mergeCells('A1', 'G1');
    worksheet.getCell('A1').value = settings.kopSurat1 || 'PEMERINTAH PROVINSI BALI';
    worksheet.getCell('A1').font = { name: 'Arial', size: 12, bold: true };
    worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };

    worksheet.mergeCells('A2', 'G2');
    worksheet.getCell('A2').value = settings.kopSurat2 || 'DINAS PENDIDIKAN KEPEMUDAAN DAN OLAHRAGA';
    worksheet.getCell('A2').font = { name: 'Arial', size: 11, bold: true };
    worksheet.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center' };

    worksheet.mergeCells('A3', 'G3');
    worksheet.getCell('A3').value = settings.namaSekolah || 'SMA NEGERI 1 DENPASAR';
    worksheet.getCell('A3').font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FF1E3A8A' } };
    worksheet.getCell('A3').alignment = { vertical: 'middle', horizontal: 'center' };

    const addressLines = (settings.alamat || '').replace(/\n/g, ' - ');
    worksheet.mergeCells('A4', 'G4');
    worksheet.getCell('A4').value = addressLines;
    worksheet.getCell('A4').font = { name: 'Arial', size: 10 };
    worksheet.getCell('A4').alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

    // Line separator
    worksheet.mergeCells('A5', 'G5');
    worksheet.getCell('A5').border = { bottom: { style: 'medium' } };

    worksheet.addRow([]); // empty row / padding

    // Title setup
    worksheet.mergeCells('A7', 'G7');
    worksheet.getCell('A7').value = 'LAPORAN JURNAL GURU WALI';
    worksheet.getCell('A7').font = { name: 'Arial', size: 14, bold: true };
    worksheet.getCell('A7').alignment = { vertical: 'middle', horizontal: 'center' };

    worksheet.mergeCells('A8', 'G8');
    worksheet.getCell('A8').value = `Periode Bulan: ${filterBulan === 'Semua' ? 'Keseluruhan' : filterBulan} | Murid: ${filterMurid}`;
    worksheet.getCell('A8').font = { name: 'Arial', size: 11, italic: true };
    worksheet.getCell('A8').alignment = { vertical: 'middle', horizontal: 'center' };

    worksheet.addRow([]); // empty row

    // Table Header
    const headerRow = worksheet.addRow(['No', 'Tanggal', 'Waktu', 'Nama Murid', 'Kelas', 'Jenis Bimbingan', 'Topik / Tindak Lanjut']);
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
      cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
    });

    // Data Rows
    filteredData.forEach((j, idx) => {
      const row = worksheet.addRow([
        idx + 1,
        j.tanggal,
        j.waktu,
        j.murid,
        j.kelas,
        j.jenis,
        `Topik: ${j.topik}\nTindak Lanjut: ${j.tindakLanjut}`
      ]);
      row.height = 40;
      row.eachCell((cell, colNumber) => {
        cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
        cell.alignment = { vertical: 'top', horizontal: colNumber === 1 ? 'center' : 'left', wrapText: true };
      });
    });

    // Column widths
    worksheet.getColumn(1).width = 5;
    worksheet.getColumn(2).width = 15;
    worksheet.getColumn(3).width = 10;
    worksheet.getColumn(4).width = 25;
    worksheet.getColumn(5).width = 10;
    worksheet.getColumn(6).width = 25;
    worksheet.getColumn(7).width = 50;

    // Generate blob and download
    const buffer = await workbook.xlsx.writeBuffer();
    const dataBlob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const fileName = `Data_Bimbingan_${filterMurid === 'Semua' ? 'Keseluruhan' : filterMurid.replace(/\s+/g,'_')}.xlsx`;
    saveAs(dataBlob, fileName);
  };

  return (
    <>
      <PageHeader
        title="Data Bimbingan"
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Data' },
          { label: 'Data Bimbingan' },
        ]}
        actions={
          <button onClick={handleDownloadExcel} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm">
            <FileSpreadsheet size={18} />
            Export Excel
          </button>
        }
      />

      {/* Donut Chart Card */}
      <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-soft-sm border border-gray-100 dark:border-gray-800 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">Grafik Jenis Bimbingan</h3>
          <select value={chartMurid} onChange={(e) => setChartMurid(e.target.value)} className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-surface-dark text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors w-full sm:w-auto">
            {chartMuridNames.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Donut */}
          <div className="relative w-48 h-48 flex-shrink-0">
            <div className="w-full h-full rounded-full" style={{ background: gradient }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-28 h-28 rounded-full bg-white dark:bg-surface-dark flex flex-col items-center justify-center shadow-inner">
                <span className="text-3xl font-bold text-gray-800 dark:text-white">{total}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Jurnal</span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 w-full">
            <p className="text-sm font-semibold text-gray-800 dark:text-white mb-4">{chartMurid}</p>
            <div className="grid grid-cols-2 gap-4">
              {counts.map(c => (
                <div key={c.key} className={`flex items-center gap-3 p-3 ${c.bg} rounded-xl`}>
                  <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{c.label}</p>
                    <p className={`text-lg font-bold ${c.text}`}>{c.count} <span className="text-xs font-normal">kali</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Filter size={18} className="text-gray-400" />
        <select value={filterBulan} onChange={(e) => setFilterBulan(e.target.value)} className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-surface-dark text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors">
          {bulanList.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <select value={filterMurid} onChange={(e) => setFilterMurid(e.target.value)} className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-surface-dark text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors">
          {muridNames.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <Table headers={headers} data={filteredData} renderRow={renderRow} />

      {/* Modal Detail Jurnal */}
      {showModal && selectedJurnal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white dark:bg-surface-dark rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 shrink-0">
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Detail Bimbingan</h3>
                <p className="text-sm text-gray-500">{selectedJurnal.tanggal} • {selectedJurnal.waktu}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-1">{selectedJurnal.murid}</h4>
                  <p className="text-sm text-gray-500">{selectedJurnal.kelas}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-md ${getJenisColor(selectedJurnal.jenis)}`}>{selectedJurnal.jenis}</span>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Topik / Permasalahan</label>
                <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                  {selectedJurnal.topik}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tindak Lanjut</label>
                <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                  {selectedJurnal.tindakLanjut}
                </div>
              </div>

              <div className="mt-4 text-xs text-gray-500 text-right">
                Dicatat oleh: {selectedJurnal.guru || 'Sistem'}
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-between shrink-0">
              <div className="flex gap-2">
                <button onClick={() => { setEditMode(true); setEditForm({...selectedJurnal}); }} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-400 transition-colors"><Edit size={15} /> Edit</button>
                <button onClick={() => {
                  if (confirm('Yakin ingin menghapus data bimbingan ini?')) {
                    const updated = dataJurnal.filter(j => j.id !== selectedJurnal.id);
                    setDataJurnal(updated);
                    localStorage.setItem('jurnalData', JSON.stringify(updated));
                    setShowModal(false);
                    showToast('Data bimbingan berhasil dihapus', 'success');
                  }
                }} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 transition-colors"><Trash2 size={15} /> Hapus</button>
              </div>
              <button onClick={() => { setShowModal(false); setEditMode(false); }} className="px-5 py-2 rounded-xl text-sm font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors">Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editMode && editForm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setEditMode(false)} />
          <div className="relative bg-white dark:bg-surface-dark rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Edit Bimbingan</h3>
              <button onClick={() => setEditMode(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const updated = dataJurnal.map(j => j.id === editForm.id ? { ...j, ...editForm } : j);
              setDataJurnal(updated);
              localStorage.setItem('jurnalData', JSON.stringify(updated));
              setSelectedJurnal(editForm);
              setEditMode(false);
              showToast('Data bimbingan berhasil diperbarui', 'success');
            }} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Topik / Permasalahan</label>
                <textarea value={editForm.topik || ''} onChange={(e) => setEditForm({...editForm, topik: e.target.value})} rows={3} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-800 dark:text-gray-200 transition-colors" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tindak Lanjut</label>
                <textarea value={editForm.tindakLanjut || ''} onChange={(e) => setEditForm({...editForm, tindakLanjut: e.target.value})} rows={3} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-800 dark:text-gray-200 transition-colors" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Jenis Bimbingan</label>
                <select value={editForm.jenis || ''} onChange={(e) => setEditForm({...editForm, jenis: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-800 dark:text-gray-200 transition-colors">
                  {jenisConfig.map(jc => <option key={jc.key} value={jc.key}>{jc.key}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setEditMode(false)} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">Batal</button>
                <button type="submit" className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium bg-primary hover:bg-primary-hover text-white shadow-sm shadow-primary/20 transition-colors"><Save size={16} /> Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

