import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

type ProductRow = Database['public']['Tables']['products']['Row']
type ProductInsert = Database['public']['Tables']['products']['Insert']
type ProductUpdate = Database['public']['Tables']['products']['Update']

export const productsService = {
    async getAll(organizationId: string) {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('organization_id', organizationId)
            .order('name', { ascending: true })

        if (error) throw error
        return data
    },

    async create(product: ProductInsert) {
        const { data, error } = await supabase
            .from('products')
            .insert(product)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async update(id: string, updates: ProductUpdate) {
        const { data, error } = await supabase
            .from('products')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id)

        if (error) throw error
    }
}
