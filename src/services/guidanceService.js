import { supabase } from '../lib/supabase';

export const guidanceService = {
  async getByGuru(guruId) {
    const { data, error } = await supabase
      .from('student_guidance')
      .select(`
        parent_contact,
        students(
          id,
          name,
          nisn,
          gender,
          classes(name)
        )
      `)
      .eq('guru_id', guruId);
      
    if (error) throw error;
    
    return data.map(item => ({
      id: item.students.id,
      name: item.students.name,
      nisn: item.students.nisn,
      gender: item.students.gender,
      class: item.students.classes?.name || 'Unknown',
      kontakOrtu: item.parent_contact || ''
    }));
  },

  async toggleGuidance(guruId, studentId, isAdding) {
    if (isAdding) {
      const { error } = await supabase
        .from('student_guidance')
        .insert([{ guru_id: guruId, student_id: studentId }]);
      if (error && error.code !== '23505') throw error; // ignore duplicate errors
    } else {
      const { error } = await supabase
        .from('student_guidance')
        .delete()
        .match({ guru_id: guruId, student_id: studentId });
      if (error) throw error;
    }
  },

  async updateContact(guruId, studentId, contact) {
    const { error } = await supabase
      .from('student_guidance')
      .update({ parent_contact: contact })
      .match({ guru_id: guruId, student_id: studentId });
    if (error) throw error;
  }
};
