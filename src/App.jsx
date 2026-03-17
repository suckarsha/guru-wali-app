import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DataSiswa from './pages/DataSiswa';
import Kelas from './pages/Kelas';
import Jurnal from './pages/Jurnal';
import DataGuru from './pages/DataGuru';
import Monitoring from './pages/Monitoring';
import DataSekolah from './pages/DataSekolah';
import ProgramKegiatan from './pages/ProgramKegiatan';
import MuridBimbingan from './pages/MuridBimbingan';
import RekapKehadiran from './pages/RekapKehadiran';
import DataBimbingan from './pages/DataBimbingan';
import DataKehadiran from './pages/DataKehadiran';
import Profile from './pages/Profile';
import KelolaPengumuman from './pages/KelolaPengumuman';
import Pengaturan from './pages/Pengaturan';

// Placeholder for pages not yet built
function Placeholder({ title }) {
  return (
    <div className="bg-white dark:bg-surface-dark rounded-2xl p-8 shadow-soft-sm border border-gray-100 dark:border-gray-800 min-h-[400px] flex items-center justify-center">
      <h2 className="text-xl font-bold text-gray-400 dark:text-gray-500">
        Halaman {title} — Segera Hadir
      </h2>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes Wrapper */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          {/* Admin Pages */}
          <Route path="guru" element={<DataGuru />} />
          <Route path="siswa" element={<DataSiswa />} />
          <Route path="kelas" element={<Kelas />} />
          <Route path="monitoring" element={<Monitoring />} />
          <Route path="pengumuman" element={<KelolaPengumuman />} />
          <Route path="sekolah" element={<DataSekolah />} />
          {/* Guru Pages */}
          <Route path="program" element={<ProgramKegiatan />} />
          <Route path="murid-bimbingan" element={<MuridBimbingan />} />
          <Route path="jurnal" element={<Jurnal />} />
          <Route path="kehadiran" element={<RekapKehadiran />} />
          <Route path="data-bimbingan" element={<DataBimbingan />} />
          <Route path="data-kehadiran" element={<DataKehadiran />} />
          {/* Shared */}
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Pengaturan />} />
        </Route>
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
