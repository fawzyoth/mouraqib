export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          address: string | null
          tax_id: string | null
          rc_number: string | null
          logo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          tax_id?: string | null
          rc_number?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          tax_id?: string | null
          rc_number?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          organization_id: string | null
          name: string
          email: string
          phone: string | null
          role: 'owner' | 'admin' | 'manager' | 'support' | 'user'
          avatar_url: string | null
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          organization_id?: string | null
          name: string
          email: string
          phone?: string | null
          role?: 'owner' | 'admin' | 'manager' | 'support' | 'user'
          avatar_url?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string | null
          name?: string
          email?: string
          phone?: string | null
          role?: 'owner' | 'admin' | 'manager' | 'support' | 'user'
          avatar_url?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      boutiques: {
        Row: {
          id: string
          organization_id: string
          name: string
          email: string | null
          phone: string | null
          address: string | null
          governorate: string | null
          color: string
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          governorate?: string | null
          color?: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          governorate?: string | null
          color?: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          organization_id: string
          boutique_id: string | null
          name: string
          phone: string
          phone_secondary: string | null
          email: string | null
          address: string | null
          governorate: string | null
          delegation: string | null
          locality: string | null
          postal_code: string | null
          status: 'active' | 'vip' | 'inactive' | 'blocked'
          total_orders: number
          delivered_orders: number
          total_spent: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          boutique_id?: string | null
          name: string
          phone: string
          phone_secondary?: string | null
          email?: string | null
          address?: string | null
          governorate?: string | null
          delegation?: string | null
          locality?: string | null
          postal_code?: string | null
          status?: 'active' | 'vip' | 'inactive' | 'blocked'
          total_orders?: number
          delivered_orders?: number
          total_spent?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          boutique_id?: string | null
          name?: string
          phone?: string
          phone_secondary?: string | null
          email?: string | null
          address?: string | null
          governorate?: string | null
          delegation?: string | null
          locality?: string | null
          postal_code?: string | null
          status?: 'active' | 'vip' | 'inactive' | 'blocked'
          total_orders?: number
          delivered_orders?: number
          total_spent?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      carriers: {
        Row: {
          id: string
          organization_id: string
          name: string
          logo_url: string | null
          api_id: string | null
          api_key: string | null
          api_status: 'connected' | 'disconnected' | 'error'
          fee_delivered: number
          fee_returned: number
          fee_exchange: number
          fee_pickup: number
          all_regions: boolean
          regions: string[] | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          logo_url?: string | null
          api_id?: string | null
          api_key?: string | null
          api_status?: 'connected' | 'disconnected' | 'error'
          fee_delivered?: number
          fee_returned?: number
          fee_exchange?: number
          fee_pickup?: number
          all_regions?: boolean
          regions?: string[] | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          logo_url?: string | null
          api_id?: string | null
          api_key?: string | null
          api_status?: 'connected' | 'disconnected' | 'error'
          fee_delivered?: number
          fee_returned?: number
          fee_exchange?: number
          fee_pickup?: number
          all_regions?: boolean
          regions?: string[] | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      shipments: {
        Row: {
          id: string
          organization_id: string
          boutique_id: string | null
          client_id: string | null
          carrier_id: string | null
          created_by: string | null
          pickup_id: string | null
          tracking_number: string
          carrier_tracking_number: string | null
          status: 'pending' | 'pickup_scheduled' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'returned' | 'cancelled'
          recipient_name: string
          recipient_phone: string
          recipient_phone_secondary: string | null
          recipient_address: string
          governorate: string
          delegation: string | null
          locality: string | null
          postal_code: string | null
          product_description: string | null
          weight: number | null
          is_fragile: boolean
          reference: string | null
          allow_open: boolean
          exchange_allowed: boolean
          cod_amount: number
          product_price: number
          delivery_fee: number
          label_number: string | null
          label_printed: boolean
          label_printed_at: string | null
          delivered_at: string | null
          returned_at: string | null
          return_reason: string | null
          attempts: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          boutique_id?: string | null
          client_id?: string | null
          carrier_id?: string | null
          created_by?: string | null
          pickup_id?: string | null
          tracking_number?: string
          carrier_tracking_number?: string | null
          status?: 'pending' | 'pickup_scheduled' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'returned' | 'cancelled'
          recipient_name: string
          recipient_phone: string
          recipient_phone_secondary?: string | null
          recipient_address: string
          governorate: string
          delegation?: string | null
          locality?: string | null
          postal_code?: string | null
          product_description?: string | null
          weight?: number | null
          is_fragile?: boolean
          reference?: string | null
          allow_open?: boolean
          exchange_allowed?: boolean
          cod_amount?: number
          product_price?: number
          delivery_fee?: number
          label_number?: string | null
          label_printed?: boolean
          label_printed_at?: string | null
          delivered_at?: string | null
          returned_at?: string | null
          return_reason?: string | null
          attempts?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          boutique_id?: string | null
          client_id?: string | null
          carrier_id?: string | null
          created_by?: string | null
          pickup_id?: string | null
          tracking_number?: string
          carrier_tracking_number?: string | null
          status?: 'pending' | 'pickup_scheduled' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'returned' | 'cancelled'
          recipient_name?: string
          recipient_phone?: string
          recipient_phone_secondary?: string | null
          recipient_address?: string
          governorate?: string
          delegation?: string | null
          locality?: string | null
          postal_code?: string | null
          product_description?: string | null
          weight?: number | null
          is_fragile?: boolean
          reference?: string | null
          allow_open?: boolean
          exchange_allowed?: boolean
          cod_amount?: number
          product_price?: number
          delivery_fee?: number
          label_number?: string | null
          label_printed?: boolean
          label_printed_at?: string | null
          delivered_at?: string | null
          returned_at?: string | null
          return_reason?: string | null
          attempts?: number
          created_at?: string
          updated_at?: string
        }
      }
      shipment_events: {
        Row: {
          id: string
          shipment_id: string
          status: string
          description: string | null
          location: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          shipment_id: string
          status: string
          description?: string | null
          location?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          shipment_id?: string
          status?: string
          description?: string | null
          location?: string | null
          created_by?: string | null
          created_at?: string
        }
      }
      pickup_requests: {
        Row: {
          id: string
          organization_id: string
          boutique_id: string | null
          carrier_id: string | null
          scheduled_date: string
          time_slot: string
          address: string
          governorate: string | null
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'failed'
          shipment_count: number
          delivered_count: number
          returned_count: number
          notes: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          boutique_id?: string | null
          carrier_id?: string | null
          scheduled_date: string
          time_slot: string
          address: string
          governorate?: string | null
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'failed'
          shipment_count?: number
          delivered_count?: number
          returned_count?: number
          notes?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          boutique_id?: string | null
          carrier_id?: string | null
          scheduled_date?: string
          time_slot?: string
          address?: string
          governorate?: string | null
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'failed'
          shipment_count?: number
          delivered_count?: number
          returned_count?: number
          notes?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          organization_id: string
          created_by: string | null
          type: 'credit' | 'debit'
          amount: number
          payment_method: 'cash' | 'transfer' | 'cheque' | null
          purchased_delivered: number
          purchased_returned: number
          billed_delivered: number
          billed_returned: number
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          created_by?: string | null
          type: 'credit' | 'debit'
          amount: number
          payment_method?: 'cash' | 'transfer' | 'cheque' | null
          purchased_delivered?: number
          purchased_returned?: number
          billed_delivered?: number
          billed_returned?: number
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          created_by?: string | null
          type?: 'credit' | 'debit'
          amount?: number
          payment_method?: 'cash' | 'transfer' | 'cheque' | null
          purchased_delivered?: number
          purchased_returned?: number
          billed_delivered?: number
          billed_returned?: number
          note?: string | null
          created_at?: string
        }
      }
      organization_credits: {
        Row: {
          id: string
          organization_id: string
          delivered_credits: number
          returned_credits: number
          unbilled_delivered: number
          unbilled_returned: number
          balance: number
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          delivered_credits?: number
          returned_credits?: number
          unbilled_delivered?: number
          unbilled_returned?: number
          balance?: number
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          delivered_credits?: number
          returned_credits?: number
          unbilled_delivered?: number
          unbilled_returned?: number
          balance?: number
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_organization_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_platform_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types
export type Organization = Database['public']['Tables']['organizations']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Boutique = Database['public']['Tables']['boutiques']['Row']
export type Client = Database['public']['Tables']['clients']['Row']
export type Carrier = Database['public']['Tables']['carriers']['Row']
export type Shipment = Database['public']['Tables']['shipments']['Row']
export type ShipmentEvent = Database['public']['Tables']['shipment_events']['Row']
export type PickupRequest = Database['public']['Tables']['pickup_requests']['Row']
export type Transaction = Database['public']['Tables']['transactions']['Row']
export type OrganizationCredits = Database['public']['Tables']['organization_credits']['Row']

// Insert types
export type OrganizationInsert = Database['public']['Tables']['organizations']['Insert']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type BoutiqueInsert = Database['public']['Tables']['boutiques']['Insert']
export type ClientInsert = Database['public']['Tables']['clients']['Insert']
export type CarrierInsert = Database['public']['Tables']['carriers']['Insert']
export type ShipmentInsert = Database['public']['Tables']['shipments']['Insert']
export type ShipmentEventInsert = Database['public']['Tables']['shipment_events']['Insert']
export type PickupRequestInsert = Database['public']['Tables']['pickup_requests']['Insert']
export type TransactionInsert = Database['public']['Tables']['transactions']['Insert']

// Update types
export type OrganizationUpdate = Database['public']['Tables']['organizations']['Update']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type BoutiqueUpdate = Database['public']['Tables']['boutiques']['Update']
export type ClientUpdate = Database['public']['Tables']['clients']['Update']
export type CarrierUpdate = Database['public']['Tables']['carriers']['Update']
export type ShipmentUpdate = Database['public']['Tables']['shipments']['Update']
export type PickupRequestUpdate = Database['public']['Tables']['pickup_requests']['Update']
