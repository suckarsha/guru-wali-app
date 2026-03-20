import { supabase } from '../lib/supabase';

const bulanList = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

export const attendanceService = {
  // Bridge the generic Monthly UI to the Daily Database Schema
  async getMonthlySummaries(bulan) {
    let query = supabase.from('attendance_records').select('*, students(name, classes(name))');
    
    if (bulan !== 'Semua') {
      const monthIndex = bulanList.indexOf(bulan);
      const year = new Date().getFullYear();
      const startDate = `${year}-${String(monthIndex + 1).padStart(2, '0')}-01`;
      const lastDay = new Date(year, monthIndex + 1, 0).getDate();
      const endDate = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      
      query = query.gte('tanggal', startDate).lte('tanggal', endDate);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Aggregate by student and month
    const aggregated = {};
    
    data.forEach(record => {
      const recordDate = new Date(record.tanggal);
      const recordBulan = bulanList[recordDate.getMonth()];
      const studentId = record.student_id;
      const key = `${studentId}_${recordBulan}`;

      if (!aggregated[key]) {
        aggregated[key] = {
          id: key, // pseudo id for UI
          student_id: studentId,
          murid: record.students?.name || 'Unknown',
          kelas: record.students?.classes?.name || 'Unknown',
          bulan: recordBulan,
          tahun: recordDate.getFullYear(),
          monthIndex: recordDate.getMonth(),
          sakit: 0,
          izin: 0,
          tk: 0,
          jumlah: 0
        };
      }

      if (record.status === 'Sakit') aggregated[key].sakit += 1;
      else if (record.status === 'Izin') aggregated[key].izin += 1;
      else if (record.status === 'Alpa') aggregated[key].tk += 1;
    });

    Object.values(aggregated).forEach(item => {
      item.jumlah = item.sakit + item.izin + item.tk;
    });

    return Object.values(aggregated);
  },

  async saveMonthlySummary(bulan, studentId, sakit, izin, tk, selectedYear) {
    const monthIndex = bulanList.indexOf(bulan);
    const year = selectedYear || new Date().getFullYear();
    const startDate = `${year}-${String(monthIndex + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(year, monthIndex + 1, 0).getDate();
    const endDate = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    // Delete existing records for this student in this month
    await supabase
      .from('attendance_records')
      .delete()
      .eq('student_id', studentId)
      .gte('tanggal', startDate)
      .lte('tanggal', endDate);

    const payload = [];
    let currentDay = 1;

    const addRecords = (count, status) => {
      for (let i = 0; i < count; i++) {
        if (currentDay > lastDay) break;
        payload.push({
          student_id: studentId,
          tanggal: `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`,
          status: status
        });
        currentDay++;
      }
    };

    addRecords(sakit, 'Sakit');
    addRecords(izin, 'Izin');
    addRecords(tk, 'Alpa');

    // If 0 absences, add a 'Hadir' record so the month is logged and shows up in data
    if (payload.length === 0) {
      payload.push({
        student_id: studentId,
        tanggal: `${year}-${String(monthIndex + 1).padStart(2, '0')}-01`,
        status: 'Hadir'
      });
    }

    if (payload.length > 0) {
      const { error } = await supabase.from('attendance_records').insert(payload);
      if (error) throw error;
    }
  },
  
  async deleteMonthlySummary(bulan, studentId, selectedYear) {
    const monthIndex = bulanList.indexOf(bulan);
    const year = selectedYear || new Date().getFullYear();
    const startDate = `${year}-${String(monthIndex + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(year, monthIndex + 1, 0).getDate();
    const endDate = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const { error } = await supabase
      .from('attendance_records')
      .delete()
      .eq('student_id', studentId)
      .gte('tanggal', startDate)
      .lte('tanggal', endDate);
      
    if (error) throw error;
  }
};
