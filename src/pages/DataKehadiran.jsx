import { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import Table from '../components/Table';
import { Filter, Download, FileSpreadsheet } from 'lucide-react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const bulanList = ['Semua','Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const TOTAL_HARI = 26; // hari efektif per bulan

export default function DataKehadiran() {
  const [dataKehadiran, setDataKehadiran] = useState([]);
  const [filterBulan, setFilterBulan] = useState('Semua');
  const [filterMurid, setFilterMurid] = useState('Semua'); // 'Semua' or specific student
  const [chartMurid, setChartMurid] = useState('');

  useEffect(() => {
    // We get Kehadiran data from localStorage for Demo (typically fetched from backend)
    const saved = localStorage.getItem('dataKehadiranSiswa');
    if (saved) {
      const parsed = JSON.parse(saved);
      setDataKehadiran(parsed);
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

  const muridNames = ['Semua', ...new Set(dataKehadiran.map(k => k.murid))];
  const chartMuridNames = [...new Set(dataKehadiran.map(k => k.murid))];

  const filteredData = dataKehadiran.filter(k => {
    const matchBulan = filterBulan === 'Semua' || k.bulan === filterBulan;
    const matchMurid = filterMurid === 'Semua' || k.murid === filterMurid;
    return matchBulan && matchMurid;
  });

  // Data for the donut chart (selected student)
  const selectedData = dataKehadiran.find(k => k.murid === chartMurid) || dataKehadiran[0];
  const hadir = selectedData ? TOTAL_HARI - selectedData.jumlah : 0;
  const pctHadir = selectedData ? Math.round((hadir / TOTAL_HARI) * 100) : 0;
  const pctSakit = selectedData ? Math.round((selectedData.sakit / TOTAL_HARI) * 100) : 0;
  const pctIzin = selectedData ? Math.round((selectedData.izin / TOTAL_HARI) * 100) : 0;
  const pctTK = selectedData ? Math.round((selectedData.tk / TOTAL_HARI) * 100) : 0;

  // Build conic-gradient for donut
  const segments = [];
  let cursor = 0;
  if (pctHadir > 0) { segments.push(`#10b981 ${cursor}% ${cursor + pctHadir}%`); cursor += pctHadir; }
  if (pctSakit > 0) { segments.push(`#f59e0b ${cursor}% ${cursor + pctSakit}%`); cursor += pctSakit; }
  if (pctIzin > 0) { segments.push(`#3b82f6 ${cursor}% ${cursor + pctIzin}%`); cursor += pctIzin; }
  if (pctTK > 0) { segments.push(`#ef4444 ${cursor}% ${cursor + pctTK}%`); cursor += pctTK; }
  if (cursor < 100) { segments.push(`#10b981 ${cursor}% 100%`); }
  const gradient = segments.length > 0 ? `conic-gradient(${segments.join(', ')})` : 'conic-gradient(#e5e7eb 0% 100%)';

  const headers = [
    { label: 'Nama Murid' },
    { label: 'Kelas' },
    { label: 'Bulan' },
    { label: 'Sakit' },
    { label: 'Izin' },
    { label: 'TK' },
    { label: 'Jumlah' },
  ];

  const renderRow = (k) => (
    <tr key={k.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
      <td className="px-6 py-4 text-sm font-medium text-gray-800 dark:text-gray-200">{k.murid}</td>
      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{k.kelas}</td>
      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{k.bulan}</td>
      <td className="px-6 py-4 text-sm text-center"><span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-md font-bold">{k.sakit}</span></td>
      <td className="px-6 py-4 text-sm text-center"><span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-md font-bold">{k.izin}</span></td>
      <td className="px-6 py-4 text-sm text-center"><span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md font-bold">{k.tk}</span></td>
      <td className="px-6 py-4 text-sm text-center font-bold text-gray-800 dark:text-gray-200">{k.jumlah}</td>
    </tr>
  );

  const handleDownloadExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Rekap Kehadiran');

    // KOP SURAT
    worksheet.mergeCells('A1', 'H1');
    worksheet.getCell('A1').value = settings.kopSurat1 || 'PEMERINTAH PROVINSI BALI';
    worksheet.getCell('A1').font = { name: 'Arial', size: 12, bold: true };
    worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };

    worksheet.mergeCells('A2', 'H2');
    worksheet.getCell('A2').value = settings.kopSurat2 || 'DINAS PENDIDIKAN KEPEMUDAAN DAN OLAHRAGA';
    worksheet.getCell('A2').font = { name: 'Arial', size: 11, bold: true };
    worksheet.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center' };

    worksheet.mergeCells('A3', 'H3');
    worksheet.getCell('A3').value = settings.namaSekolah || 'SMA NEGERI 1 DENPASAR';
    worksheet.getCell('A3').font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FF1E3A8A' } };
    worksheet.getCell('A3').alignment = { vertical: 'middle', horizontal: 'center' };

    const addressLines = (settings.alamat || '').replace(/\n/g, ' - ');
    worksheet.mergeCells('A4', 'H4');
    worksheet.getCell('A4').value = addressLines;
    worksheet.getCell('A4').font = { name: 'Arial', size: 10 };
    worksheet.getCell('A4').alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

    // Line separator
    worksheet.mergeCells('A5', 'H5');
    worksheet.getCell('A5').border = { bottom: { style: 'medium' } };

    worksheet.addRow([]); // empty row / padding

    // Title setup
    worksheet.mergeCells('A7', 'H7');
    worksheet.getCell('A7').value = 'LAPORAN REKAP KEHADIRAN SISWA';
    worksheet.getCell('A7').font = { name: 'Arial', size: 14, bold: true };
    worksheet.getCell('A7').alignment = { vertical: 'middle', horizontal: 'center' };

    worksheet.mergeCells('A8', 'H8');
    worksheet.getCell('A8').value = `Periode Bulan: ${filterBulan === 'Semua' ? 'Keseluruhan' : filterBulan} | Murid: ${filterMurid}`;
    worksheet.getCell('A8').font = { name: 'Arial', size: 11, italic: true };
    worksheet.getCell('A8').alignment = { vertical: 'middle', horizontal: 'center' };

    worksheet.addRow([]); // empty row

    // Table Header
    const headerRow = worksheet.addRow(['No', 'Nama Murid', 'Kelas', 'Bulan', 'Sakit', 'Izin', 'Tanpa Keterangan', 'Total Alpa']);
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
      cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
    });

    // Data Rows
    filteredData.forEach((k, idx) => {
      const row = worksheet.addRow([
        idx + 1,
        k.murid,
        k.kelas,
        k.bulan,
        k.sakit,
        k.izin,
        k.tk,
        k.jumlah
      ]);
      row.eachCell((cell, colNumber) => {
        cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
        cell.alignment = { vertical: 'middle', horizontal: (colNumber === 2 || colNumber === 3 || colNumber === 4) ? 'left' : 'center' };
        
        // Color coding for absence values
        if (colNumber === 5 && k.sakit > 0) cell.font = { color: { argb: 'FFB45309' }, bold: true }; // amber
        if (colNumber === 6 && k.izin > 0) cell.font = { color: { argb: 'FF1D4ED8' }, bold: true }; // blue
        if (colNumber === 7 && k.tk > 0) cell.font = { color: { argb: 'FFB91C1C' }, bold: true }; // red
        if (colNumber === 8 && k.jumlah > 0) cell.font = { bold: true };
      });
    });

    // Column widths
    worksheet.getColumn(1).width = 5;
    worksheet.getColumn(2).width = 25;
    worksheet.getColumn(3).width = 12;
    worksheet.getColumn(4).width = 12;
    worksheet.getColumn(5).width = 10;
    worksheet.getColumn(6).width = 10;
    worksheet.getColumn(7).width = 18;
    worksheet.getColumn(8).width = 12;

    // Generate blob and download
    const buffer = await workbook.xlsx.writeBuffer();
    const dataBlob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const fileName = `Data_Kehadiran_${filterMurid === 'Semua' ? 'Keseluruhan' : filterMurid.replace(/\s+/g,'_')}.xlsx`;
    saveAs(dataBlob, fileName);
  };

  return (
    <>
      <PageHeader
        title="Data Kehadiran"
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Data' },
          { label: 'Data Kehadiran' },
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
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">Grafik Kehadiran Siswa</h3>
          <select value={chartMurid} onChange={(e) => setChartMurid(e.target.value)} className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-surface-dark text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors w-full sm:w-auto">
            {chartMuridNames.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        {selectedData ? (
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Donut */}
            <div className="relative w-48 h-48 flex-shrink-0">
              <div
                className="w-full h-full rounded-full"
                style={{ background: gradient }}
              />
              {/* Inner circle (donut hole) */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-28 h-28 rounded-full bg-white dark:bg-surface-dark flex flex-col items-center justify-center shadow-inner">
                  <span className="text-3xl font-bold text-gray-800 dark:text-white">{pctHadir}%</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Hadir</span>
                </div>
              </div>
            </div>

            {/* Legend & Stats */}
            <div className="flex-1 w-full">
              <p className="text-sm font-semibold text-gray-800 dark:text-white mb-4">{selectedData.murid} — {selectedData.kelas}</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                  <div className="w-4 h-4 rounded-full bg-emerald-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Hadir</p>
                    <p className="text-lg font-bold text-emerald-600">{hadir} <span className="text-xs font-normal">hari</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                  <div className="w-4 h-4 rounded-full bg-amber-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Sakit</p>
                    <p className="text-lg font-bold text-amber-600">{selectedData.sakit} <span className="text-xs font-normal">hari</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <div className="w-4 h-4 rounded-full bg-blue-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Izin</p>
                    <p className="text-lg font-bold text-blue-600">{selectedData.izin} <span className="text-xs font-normal">hari</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                  <div className="w-4 h-4 rounded-full bg-red-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Tanpa Keterangan</p>
                    <p className="text-lg font-bold text-red-600">{selectedData.tk} <span className="text-xs font-normal">hari</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500 dark:text-gray-400">
            Tidak ada data kehadiran untuk siswa ini di opsi yang dipilih.
          </div>
        )}
      </div>

      {/* Filters (Moved here) */}
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
    </>
  );
}
