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
          city: string | null
          postal_code: string | null
          currency: string
          timezone: string
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
          city?: string | null
          postal_code?: string | null
          currency?: string
          timezone?: string
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
          city?: string | null
          postal_code?: string | null
          currency?: string
          timezone?: string
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
          fee_big: number
          fee_total_delivery: number
          fee_payment: number
          fee_withholding: number
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
          fee_big?: number
          fee_total_delivery?: number
          fee_payment?: number
          fee_withholding?: number
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
          fee_big?: number
          fee_total_delivery?: number
          fee_payment?: number
          fee_withholding?: number
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
          billed_at: string | null
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
          billed_at?: string | null
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
          billed_at?: string | null
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
      // =============================================
      // New tables from migration 002
      // =============================================
      roles: {
        Row: {
          id: string
          organization_id: string
          name: string
          description: string | null
          is_default: boolean
          is_system: boolean
          permissions: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          description?: string | null
          is_default?: boolean
          is_system?: boolean
          permissions?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          description?: string | null
          is_default?: boolean
          is_system?: boolean
          permissions?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      profile_boutiques: {
        Row: {
          id: string
          profile_id: string
          boutique_id: string
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          boutique_id: string
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          boutique_id?: string
          created_at?: string
        }
      }
      notification_settings: {
        Row: {
          id: string
          organization_id: string
          event_type: string
          email_enabled: boolean
          sms_enabled: boolean
          disabled_at: string | null
          emails_sent: number
          sms_sent: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          event_type: string
          email_enabled?: boolean
          sms_enabled?: boolean
          disabled_at?: string | null
          emails_sent?: number
          sms_sent?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          event_type?: string
          email_enabled?: boolean
          sms_enabled?: boolean
          disabled_at?: string | null
          emails_sent?: number
          sms_sent?: number
          created_at?: string
          updated_at?: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          organization_id: string
          user_id: string | null
          type: 'status' | 'return' | 'payment' | 'error' | 'login' | 'settings'
          message: string
          entity_type: string | null
          entity_id: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id?: string | null
          type: 'status' | 'return' | 'payment' | 'error' | 'login' | 'settings'
          message: string
          entity_type?: string | null
          entity_id?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string | null
          type?: 'status' | 'return' | 'payment' | 'error' | 'login' | 'settings'
          message?: string
          entity_type?: string | null
          entity_id?: string | null
          metadata?: Json
          created_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          organization_id: string
          carrier_id: string | null
          type: 'received' | 'sent'
          number: string
          reference: string | null
          party_name: string
          amount: number
          status: 'paid' | 'pending' | 'overdue'
          due_date: string | null
          paid_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          carrier_id?: string | null
          type: 'received' | 'sent'
          number: string
          reference?: string | null
          party_name: string
          amount?: number
          status?: 'paid' | 'pending' | 'overdue'
          due_date?: string | null
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          carrier_id?: string | null
          type?: 'received' | 'sent'
          number?: string
          reference?: string | null
          party_name?: string
          amount?: number
          status?: 'paid' | 'pending' | 'overdue'
          due_date?: string | null
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      carrier_payments: {
        Row: {
          id: string
          organization_id: string
          carrier_id: string
          reference: string | null
          payment_date: string
          total_cod: number
          total_fees: number
          net_received: number
          status: 'pending' | 'confirmed' | 'disputed'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          carrier_id: string
          reference?: string | null
          payment_date: string
          total_cod?: number
          total_fees?: number
          net_received?: number
          status?: 'pending' | 'confirmed' | 'disputed'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          carrier_id?: string
          reference?: string | null
          payment_date?: string
          total_cod?: number
          total_fees?: number
          net_received?: number
          status?: 'pending' | 'confirmed' | 'disputed'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      carrier_payment_shipments: {
        Row: {
          id: string
          carrier_payment_id: string
          shipment_id: string
          cod_amount: number
          fee_amount: number
          net_amount: number
        }
        Insert: {
          id?: string
          carrier_payment_id: string
          shipment_id: string
          cod_amount?: number
          fee_amount?: number
          net_amount?: number
        }
        Update: {
          id?: string
          carrier_payment_id?: string
          shipment_id?: string
          cod_amount?: number
          fee_amount?: number
          net_amount?: number
        }
      }
      payment_discrepancies: {
        Row: {
          id: string
          organization_id: string
          carrier_id: string
          shipment_id: string | null
          expected_amount: number
          actual_amount: number
          difference: number
          status: 'pending' | 'resolved' | 'disputed'
          resolved_at: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          carrier_id: string
          shipment_id?: string | null
          expected_amount?: number
          actual_amount?: number
          difference?: number
          status?: 'pending' | 'resolved' | 'disputed'
          resolved_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          carrier_id?: string
          shipment_id?: string | null
          expected_amount?: number
          actual_amount?: number
          difference?: number
          status?: 'pending' | 'resolved' | 'disputed'
          resolved_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      service_payments: {
        Row: {
          id: string
          organization_id: string
          date: string
          description: string | null
          reference: string | null
          amount: number
          status: 'paid' | 'pending' | 'failed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          date: string
          description?: string | null
          reference?: string | null
          amount?: number
          status?: 'paid' | 'pending' | 'failed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          date?: string
          description?: string | null
          reference?: string | null
          amount?: number
          status?: 'paid' | 'pending' | 'failed'
          created_at?: string
          updated_at?: string
        }
      }
      tracking_page_config: {
        Row: {
          id: string
          organization_id: string
          template_id: string | null
          custom_logo: string | null
          custom_colors: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          template_id?: string | null
          custom_logo?: string | null
          custom_colors?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          template_id?: string | null
          custom_logo?: string | null
          custom_colors?: Json
          created_at?: string
          updated_at?: string
        }
      }
      exports: {
        Row: {
          id: string
          organization_id: string
          created_by: string | null
          data_type: string
          format: 'excel' | 'csv' | 'pdf'
          filters: Json
          file_url: string | null
          status: 'processing' | 'ready' | 'failed'
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          created_by?: string | null
          data_type: string
          format: 'excel' | 'csv' | 'pdf'
          filters?: Json
          file_url?: string | null
          status?: 'processing' | 'ready' | 'failed'
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          created_by?: string | null
          data_type?: string
          format?: 'excel' | 'csv' | 'pdf'
          filters?: Json
          file_url?: string | null
          status?: 'processing' | 'ready' | 'failed'
          created_at?: string
        }
      }
      failed_searches: {
        Row: {
          id: string
          organization_id: string
          query: string
          phone: string | null
          ip_address: string | null
          contacted: boolean
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          query: string
          phone?: string | null
          ip_address?: string | null
          contacted?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          query?: string
          phone?: string | null
          ip_address?: string | null
          contacted?: boolean
          created_at?: string
        }
      }
      feature_flags: {
        Row: {
          id: string
          organization_id: string
          role: 'owner' | 'admin' | 'manager' | 'support' | 'user'
          feature: string
          enabled: boolean
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          role: 'owner' | 'admin' | 'manager' | 'support' | 'user'
          feature: string
          enabled?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          role?: 'owner' | 'admin' | 'manager' | 'support' | 'user'
          feature?: string
          enabled?: boolean
          created_at?: string
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

// Helper types - Row
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
export type Role = Database['public']['Tables']['roles']['Row']
export type ProfileBoutique = Database['public']['Tables']['profile_boutiques']['Row']
export type NotificationSetting = Database['public']['Tables']['notification_settings']['Row']
export type ActivityLog = Database['public']['Tables']['activity_logs']['Row']
export type Invoice = Database['public']['Tables']['invoices']['Row']
export type CarrierPayment = Database['public']['Tables']['carrier_payments']['Row']
export type CarrierPaymentShipment = Database['public']['Tables']['carrier_payment_shipments']['Row']
export type PaymentDiscrepancy = Database['public']['Tables']['payment_discrepancies']['Row']
export type ServicePayment = Database['public']['Tables']['service_payments']['Row']
export type TrackingPageConfig = Database['public']['Tables']['tracking_page_config']['Row']
export type Export = Database['public']['Tables']['exports']['Row']
export type FailedSearch = Database['public']['Tables']['failed_searches']['Row']
export type FeatureFlag = Database['public']['Tables']['feature_flags']['Row']

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
export type RoleInsert = Database['public']['Tables']['roles']['Insert']
export type ProfileBoutiqueInsert = Database['public']['Tables']['profile_boutiques']['Insert']
export type NotificationSettingInsert = Database['public']['Tables']['notification_settings']['Insert']
export type ActivityLogInsert = Database['public']['Tables']['activity_logs']['Insert']
export type InvoiceInsert = Database['public']['Tables']['invoices']['Insert']
export type CarrierPaymentInsert = Database['public']['Tables']['carrier_payments']['Insert']
export type CarrierPaymentShipmentInsert = Database['public']['Tables']['carrier_payment_shipments']['Insert']
export type PaymentDiscrepancyInsert = Database['public']['Tables']['payment_discrepancies']['Insert']
export type ServicePaymentInsert = Database['public']['Tables']['service_payments']['Insert']
export type TrackingPageConfigInsert = Database['public']['Tables']['tracking_page_config']['Insert']
export type ExportInsert = Database['public']['Tables']['exports']['Insert']
export type FailedSearchInsert = Database['public']['Tables']['failed_searches']['Insert']
export type FeatureFlagInsert = Database['public']['Tables']['feature_flags']['Insert']

// Update types
export type OrganizationUpdate = Database['public']['Tables']['organizations']['Update']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type BoutiqueUpdate = Database['public']['Tables']['boutiques']['Update']
export type ClientUpdate = Database['public']['Tables']['clients']['Update']
export type CarrierUpdate = Database['public']['Tables']['carriers']['Update']
export type ShipmentUpdate = Database['public']['Tables']['shipments']['Update']
export type PickupRequestUpdate = Database['public']['Tables']['pickup_requests']['Update']
export type RoleUpdate = Database['public']['Tables']['roles']['Update']
export type NotificationSettingUpdate = Database['public']['Tables']['notification_settings']['Update']
export type InvoiceUpdate = Database['public']['Tables']['invoices']['Update']
export type CarrierPaymentUpdate = Database['public']['Tables']['carrier_payments']['Update']
export type PaymentDiscrepancyUpdate = Database['public']['Tables']['payment_discrepancies']['Update']
export type ServicePaymentUpdate = Database['public']['Tables']['service_payments']['Update']
export type TrackingPageConfigUpdate = Database['public']['Tables']['tracking_page_config']['Update']
export type ExportUpdate = Database['public']['Tables']['exports']['Update']
export type FailedSearchUpdate = Database['public']['Tables']['failed_searches']['Update']
export type FeatureFlagUpdate = Database['public']['Tables']['feature_flags']['Update']
