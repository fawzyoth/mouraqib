import { supabase } from '@/lib/supabase'

export const failedSearchesService = {
  async getAll(organizationId: string, limit = 100) {
    const { data, error } = await supabase
      .from('failed_searches')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  },

  async markContacted(id: string) {
    const { data, error } = await supabase
      .from('failed_searches')
      .update({ contacted: true })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },
}
