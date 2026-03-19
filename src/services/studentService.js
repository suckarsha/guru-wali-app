import { supabase } from '../lib/supabase';

export const studentService = {
  async getAll() {
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        classes ( name )
      `)
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data.map(s => ({
      ...s,
      class: s.classes?.name || 'Unassigned'
    }));
  },

  async create(student) {
    // Map student.class (string name) to class_id
    let class_id = null;
    if (student.class) {
      const { data: classData } = await supabase.from('classes').select('id').eq('name', student.class).single();
      if (classData) {
        class_id = classData.id;
      } else {
        // Create class if not exists
        const { data: newClass } = await supabase.from('classes').insert([{ name: student.class }]).select().single();
        if (newClass) class_id = newClass.id;
      }
    }

    const { data, error } = await supabase.from('students').insert([{
      nisn: student.nisn || '-',
      name: student.name,
      gender: student.gender,
      class_id
    }]).select(`*, classes (name)`).single();
    
    if (error) throw error;
    return { ...data, class: data.classes?.name || 'Unassigned' };
  },

  async update(id, student) {
    let class_id = null;
    if (student.class) {
      const { data: classData } = await supabase.from('classes').select('id').eq('name', student.class).single();
      if (classData) {
        class_id = classData.id;
      } else {
        const { data: newClass } = await supabase.from('classes').insert([{ name: student.class }]).select().single();
        if (newClass) class_id = newClass.id;
      }
    }

    const { data, error } = await supabase.from('students').update({
      nisn: student.nisn || '-',
      name: student.name,
      gender: student.gender,
      class_id
    }).eq('id', id).select(`*, classes (name)`).single();

    if (error) throw error;
    return { ...data, class: data.classes?.name || 'Unassigned' };
  },

  async delete(id) {
    const { error } = await supabase.from('students').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  async bulkCreate(studentsArray) {
    // For import Excel
    const uniqueClasses = [...new Set(studentsArray.map(s => s.class).filter(Boolean))];
    
    // Ensure all classes exist
    const { data: existingClasses } = await supabase.from('classes').select('*');
    const existingClassNames = existingClasses?.map(c => c.name) || [];
    
    const classesToCreate = uniqueClasses.filter(c => !existingClassNames.includes(c));
    if (classesToCreate.length > 0) {
      await supabase.from('classes').insert(classesToCreate.map(name => ({ name })));
    }
    
    // Refetch classes to get all IDs
    const { data: allClasses } = await supabase.from('classes').select('*');
    const classMap = {};
    allClasses?.forEach(c => classMap[c.name] = c.id);

    // Prepare payload
    const payload = studentsArray.map(s => ({
      nisn: s.nisn || '-',
      name: s.name,
      gender: s.gender,
      class_id: classMap[s.class] || null
    }));

    const { data, error } = await supabase.from('students').insert(payload).select(`*, classes(name)`);
    if (error) throw error;
    return data.map(s => ({ ...s, class: s.classes?.name || 'Unassigned' }));
  },
  
  async bulkDelete(ids) {
    const { error } = await supabase.from('students').delete().in('id', ids);
    if (error) throw error;
    return true;
  }
};
