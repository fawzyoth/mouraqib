import { ref, type Ref } from 'vue'
import { organizationsService } from '@/services'
import { supabase } from '@/lib/supabase'
import { useToast } from './useToast'

export function useOrganizationData(orgId: Ref<string>) {
  const companyProfile = ref({
    name: '',
    taxId: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    currency: 'TND',
    timezone: 'Africa/Tunis',
  })

  const teamMembers = ref<any[]>([])
  const availableRoles = ref<any[]>([])
  const isLoading = ref(false)
  const toast = useToast()

  async function load() {
    if (!orgId.value) return
    isLoading.value = true
    try {
      const [org, members, roles] = await Promise.all([
        organizationsService.getById(orgId.value),
        organizationsService.getMembers(orgId.value),
        supabase.from('roles').select('*').eq('organization_id', orgId.value).order('name').then(({ data, error }) => {
          if (error) throw error
          return data
        }),
      ])

      if (org) {
        companyProfile.value = {
          name: org.name,
          taxId: org.tax_id || '',
          email: org.email || '',
          phone: org.phone || '',
          address: org.address || '',
          city: org.city || '',
          postalCode: org.postal_code || '',
          currency: org.currency,
          timezone: org.timezone,
        }
      }

      teamMembers.value = members.map((m: any) => ({
        id: m.id,
        name: m.name,
        email: m.email,
        role: m.role,
        status: 'active',
        lastLogin: 'N/A',
        initials: m.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
        avatarColor: m.avatar_url || 'bg-blue-500',
        boutiques: [],
      }))

      availableRoles.value = roles.map((r: any) => ({
        id: r.id,
        name: r.name,
        description: r.description || '',
        memberCount: members.filter((m: any) => m.role === r.name.toLowerCase()).length,
        isDefault: r.is_default,
        isOwner: r.name.toLowerCase() === 'owner',
        isSystem: r.is_system,
        permissions: r.permissions || [],
      }))
    } catch (e: any) {
      toast.error('Erreur chargement organisation: ' + (e.message || e))
    } finally {
      isLoading.value = false
    }
  }

  async function saveProfile(data: Record<string, any>): Promise<boolean> {
    try {
      await organizationsService.update(orgId.value, {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        city: data.city || null,
        postal_code: data.postalCode || null,
        tax_id: data.taxId || null,
      })
      Object.assign(companyProfile.value, data)
      toast.success('Profil entreprise enregistré')
      return true
    } catch (e: any) {
      toast.error('Erreur sauvegarde profil: ' + (e.message || e))
      return false
    }
  }

  async function addMember(form: Record<string, any>): Promise<boolean> {
    try {
      const result = await organizationsService.inviteMember(orgId.value, form.email, form.role)
      if (result) {
        teamMembers.value.push({
          id: result.id || Date.now().toString(),
          name: form.name,
          email: form.email,
          role: form.role,
          status: 'invited',
          lastLogin: 'Jamais',
          initials: form.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
          avatarColor: 'bg-blue-500',
          boutiques: [],
        })
      }
      toast.success('Membre invité')
      return true
    } catch (e: any) {
      toast.error('Erreur invitation membre: ' + (e.message || e))
      return false
    }
  }

  async function removeMember(id: string): Promise<boolean> {
    try {
      await organizationsService.removeMember(id)
      teamMembers.value = teamMembers.value.filter(m => m.id !== id)
      toast.success('Membre supprimé')
      return true
    } catch (e: any) {
      toast.error('Erreur suppression membre: ' + (e.message || e))
      return false
    }
  }

  return {
    companyProfile,
    teamMembers,
    availableRoles,
    isLoading,
    load,
    saveProfile,
    addMember,
    removeMember,
  }
}
