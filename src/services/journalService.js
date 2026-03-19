import { supabase } from '../lib/supabase';

export const journalService = {
  async getAll() {
    const { data, error } = await supabase
      .from('guidance_journals')
      .select(`
        *,
        students (
          name,
          classes ( name )
        )
      `)
      .order('tanggal', { ascending: false });
    
    if (error) throw error;
    
    // Map to frontend expected format
    return data.map(j => ({
      id: j.id,
      murid: j.students?.name || 'Unknown',
      kelas: j.students?.classes?.name || '-',
      tanggal: j.tanggal,
      waktu: j.waktu,
      jenis: j.jenis,
      topik: j.topik,
      tindakLanjut: j.tindak_lanjut,
      guru: 'Sistem',
      guru_id: j.guru_id,
      student_id: j.student_id
    }));
  },

  async create(journal) {
    const { data, error } = await supabase.from('guidance_journals').insert([{
      student_id: journal.student_id,
      tanggal: journal.tanggal,
      waktu: journal.waktu,
      jenis: journal.jenis,
      topik: journal.topik,
      tindak_lanjut: journal.tindakLanjut,
      guru_id: journal.guru_id || null // Add if user id is passed
    }]).select(`*, students(name, classes(name))`).single();

    if (error) throw error;
    
    return {
      id: data.id,
      murid: data.students?.name || 'Unknown',
      kelas: data.students?.classes?.name || '-',
      tanggal: data.tanggal,
      waktu: data.waktu,
      jenis: data.jenis,
      topik: data.topik,
      tindakLanjut: data.tindak_lanjut,
      guru: 'Sistem',
      student_id: data.student_id
    };
  },

  async update(id, journal) {
    const { data, error } = await supabase.from('guidance_journals').update({
      tanggal: journal.tanggal,
      waktu: journal.waktu,
      jenis: journal.jenis,
      topik: journal.topik,
      tindak_lanjut: journal.tindakLanjut
    }).eq('id', id).select(`*, students(name, classes(name))`).single();

    if (error) throw error;
    
    return {
      id: data.id,
      murid: data.students?.name || 'Unknown',
      kelas: data.students?.classes?.name || '-',
      tanggal: data.tanggal,
      waktu: data.waktu,
      jenis: data.jenis,
      topik: data.topik,
      tindakLanjut: data.tindak_lanjut,
      guru: 'Sistem',
      student_id: data.student_id
    };
  },

  async delete(id) {
    const { error } = await supabase.from('guidance_journals').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
};
