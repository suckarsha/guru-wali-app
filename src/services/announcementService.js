import { supabase } from '../lib/supabase';

export const announcementService = {
  async getAll() {
    const { data, error } = await supabase.from('announcements').select('*').order('date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(announcement) {
    const { data, error } = await supabase.from('announcements').insert([{
      title: announcement.title,
      content: announcement.content,
      date: announcement.date,
      type: announcement.type || 'info'
    }]).select().single();
    if (error) throw error;
    return data;
  },

  async update(id, announcement) {
    const { data, error } = await supabase.from('announcements').update({
       title: announcement.title,
       content: announcement.content,
       date: announcement.date,
       type: announcement.type
    }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
};
