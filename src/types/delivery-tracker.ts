export interface Boutique {
  id: string
  name: string
  email: string
  initials: string
  color: string
}

export interface CarrierConfigField {
  key: string
  label: string
  type: 'text' | 'password' | 'select'
  placeholder?: string
  required?: boolean
  hint?: string
  options?: { value: string; label: string }[]
}

export interface DeliveryCarrier {
  id: string
  name: string
  description: string
  type: 'express' | 'standard'
  deliveryTime: string
  color: string
  bgColor: string
  logo?: string
  configFields: CarrierConfigField[]
  enabled?: boolean
}

export interface TeamMember {
  id: string
  name: string
  email: string
  initials: string
  color: string
  role: 'admin' | 'manager' | 'operator' | 'viewer'
  boutiques: string[]
}

export interface ConfiguredCarrier extends DeliveryCarrier {
  config: Record<string, string>
  zones: string[]
}

export interface NewBoutiqueForm {
  name: string
  email: string
  phone: string
  address: string
  governorate: string
  color: string
  selectedCarriers: string[]
  carrierConfigs: Record<string, Record<string, string>>
  assignedMembers: string[]
}
