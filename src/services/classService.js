import { supabase } from '../lib/supabase';

export const classService = {
  async getAll() {
    const { data, error } = await supabase.from('classes').select('*').order('name', { ascending: true });
    if (error) throw error;
    return data;
  },
  
  async create(name) {
    const { data, error } = await supabase.from('classes').insert([{ name }]).select().single();
    if (error) throw error;
    return data;
  },

  async update(id, name) {
    const { data, error } = await supabase.from('classes').update({ name }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase.from('classes').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
};
