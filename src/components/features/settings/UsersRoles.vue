<template>
  <div class="flex flex-col h-full">
    <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button @click="$emit('toggle-submenu')" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">{{ t('subNav.usersRoles') }}</h1>
            <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">{{ t('usersRoles.subtitle') }}</p>
          </div>
        </div>
        <button @click="exportMembers" class="flex items-center space-x-0 sm:space-x-2 px-3 sm:px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
          <Download class="w-4 h-4" />
          <span class="hidden sm:inline">{{ t('common.export') }}</span>
        </button>
      </div>
    </header>
    <main class="flex-1 overflow-y-auto p-6">
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
        <!-- Tabs -->
        <div class="border-b border-gray-200 dark:border-gray-800">
          <nav class="flex space-x-8 px-6">
            <button
              @click="membersTab = 'members'"
              :class="[
                'py-4 text-sm font-medium border-b-2 -mb-px transition-colors',
                membersTab === 'members'
                  ? 'border-[#4959b4] text-[#4959b4]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              ]"
            >
              {{ t('usersRoles.members') }} ({{ filteredMembers.length }})
            </button>
            <button
              @click="membersTab = 'roles'"
              :class="[
                'py-4 text-sm font-medium border-b-2 -mb-px transition-colors',
                membersTab === 'roles'
                  ? 'border-[#4959b4] text-[#4959b4]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              ]"
            >
              {{ t('usersRoles.roles') }} ({{ localRoles.length }})
            </button>
          </nav>
        </div>

        <!-- Members Tab Content -->
        <div v-if="membersTab === 'members'" class="p-6">
          <!-- Add Members Button -->
          <button @click="openAddMemberModal" class="mb-6 flex items-center space-x-2 px-4 py-2 bg-[#4959b4] hover:bg-[#3a4791] text-white rounded-lg text-sm font-medium transition-colors">
            <Plus class="w-4 h-4" />
            <span>{{ t('usersRoles.addMember') }}</span>
          </button>

          <!-- Search and Filter -->
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:space-x-4 mb-6">
            <div class="flex-1 relative">
              <Search class="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                v-model="memberSearchQuery"
                type="text"
                :placeholder="t('usersRoles.searchPlaceholder')"
                class="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-[#4959b4] focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>
            <div class="relative">
              <button
                @click="showRoleFilter = !showRoleFilter"
                class="w-full sm:w-auto flex items-center justify-between sm:justify-start space-x-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <span>{{ t('usersRoles.filterByRole') }}</span>
                <ChevronDown class="w-4 h-4" />
              </button>
              <!-- Role Filter Dropdown -->
              <div v-if="showRoleFilter" class="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-10">
                <label v-for="role in localRoles" :key="role.id" class="flex items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                  <input type="checkbox" :value="role.id" v-model="selectedRoleFilters" class="mr-3 rounded border-gray-300" />
                  <span class="text-sm text-gray-700 dark:text-gray-300">{{ role.name }}</span>
                </label>
                <div class="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2 px-4 flex justify-between">
                  <button @click="selectedRoleFilters = []; showRoleFilter = false" class="text-sm text-gray-500 hover:text-gray-700">{{ t('usersRoles.clear') }}</button>
                  <button @click="showRoleFilter = false" class="text-sm text-[#4959b4] font-medium">{{ t('usersRoles.apply') }}</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Members Table -->
          <div class="table-responsive">
            <table class="w-full">
              <thead>
                <tr class="border-b border-gray-200 dark:border-gray-800">
                  <th class="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">{{ t('usersRoles.member') }}</th>
                  <th class="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">{{ t('clients.email') }}</th>
                  <th class="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">{{ t('usersRoles.role') }}</th>
                  <th class="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">{{ t('usersRoles.status') }}</th>
                  <th class="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">{{ t('usersRoles.lastLogin') }}</th>
                  <th class="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">{{ t('common.actions') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
                <tr v-for="member in filteredMembers" :key="member.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td class="py-3 px-4">
                    <div class="flex items-center space-x-3">
                      <div :class="['w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm', member.avatarColor]">
                        {{ member.initials }}
                      </div>
                      <span class="font-medium text-gray-900 dark:text-white">{{ member.name }}</span>
                    </div>
                  </td>
                  <td class="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 hidden sm:table-cell">{{ member.email }}</td>
                  <td class="py-3 px-4">
                    <span :class="[
                      'px-2 py-1 rounded-full text-xs font-medium',
                      member.role === 'Owner' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' :
                      member.role === 'Manager' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                      member.role === 'Agent Confirmation' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                      member.role === 'Agent Entrepôt' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                      'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
                    ]">{{ member.role }}</span>
                  </td>
                  <td class="py-3 px-4 hidden md:table-cell">
                    <span :class="[
                      'px-2 py-1 rounded-full text-xs font-medium',
                      member.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                      member.status === 'invited' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                      'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    ]">
                      {{ member.status === 'active' ? t('usersRoles.statusActive') : member.status === 'invited' ? t('usersRoles.statusInvited') : t('usersRoles.statusInactive') }}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-sm text-gray-500 hidden lg:table-cell">{{ member.lastLogin }}</td>
                  <td class="py-3 px-4 text-right">
                    <div class="flex items-center justify-end space-x-2">
                      <button @click="editMember(member)" class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg" :title="t('common.edit')">
                        <Settings class="w-4 h-4 text-gray-500" />
                      </button>
                      <button v-if="member.role !== 'Owner' && canDelete" @click="confirmDeleteMember(member)" class="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" :title="t('common.delete')">
                        <Trash2 class="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty State -->
          <div v-if="filteredMembers.length === 0" class="text-center py-12">
            <Users class="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p class="text-gray-500">{{ t('usersRoles.noMembers') }}</p>
          </div>
        </div>

        <!-- Roles Tab Content -->
        <div v-if="membersTab === 'roles'" class="p-6">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ t('usersRoles.rolesDescription') }}
            </p>
            <button @click="openAddRoleModal" class="flex items-center space-x-2 px-4 py-2 bg-[#4959b4] hover:bg-[#3a4791] text-white rounded-lg text-sm font-medium transition-colors">
              <Plus class="w-4 h-4" />
              <span>{{ t('usersRoles.createRole') }}</span>
            </button>
          </div>

          <!-- Roles Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="role in localRoles" :key="role.id" class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center gap-3">
                  <div :class="[
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    role.name === 'Owner' ? 'bg-purple-100 dark:bg-purple-900/30' :
                    role.name === 'Manager' ? 'bg-green-100 dark:bg-green-900/30' :
                    role.name === 'Agent Confirmation' ? 'bg-blue-100 dark:bg-blue-900/30' :
                    role.name === 'Agent Entrepôt' ? 'bg-orange-100 dark:bg-orange-900/30' :
                    'bg-gray-100 dark:bg-gray-700'
                  ]">
                    <Shield :class="[
                      'w-5 h-5',
                      role.name === 'Owner' ? 'text-purple-600' :
                      role.name === 'Manager' ? 'text-green-600' :
                      role.name === 'Agent Confirmation' ? 'text-blue-600' :
                      role.name === 'Agent Entrepôt' ? 'text-orange-600' :
                      'text-gray-500'
                    ]" />
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <h3 class="font-semibold text-gray-900 dark:text-white">{{ role.name }}</h3>
                      <span v-if="role.isDefault" class="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-[10px] rounded uppercase">{{ t('usersRoles.default') }}</span>
                    </div>
                    <p class="text-xs text-gray-500 mt-0.5">{{ role.memberCount }} {{ role.memberCount > 1 ? t('usersRoles.members') : t('usersRoles.member') }}</p>
                  </div>
                </div>
                <div v-if="!role.isOwner" class="flex items-center gap-1">
                  <button @click="editRole(role)" class="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg">
                    <Settings class="w-4 h-4 text-gray-500" />
                  </button>
                  <button v-if="!role.isDefault && !role.isSystem && canDelete" @click="confirmDeleteRole(role)" class="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                    <Trash2 class="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">{{ role.description || t('usersRoles.noDescription') }}</p>
              <div class="flex flex-wrap gap-1.5">
                <span v-for="perm in (role.permissions || []).slice(0, 4)" :key="perm" class="px-2 py-0.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded text-xs text-gray-600 dark:text-gray-400">
                  {{ perm }}
                </span>
                <span v-if="(role.permissions || []).length > 4" class="px-2 py-0.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded text-xs text-gray-600 dark:text-gray-400">
                  +{{ role.permissions.length - 4 }} {{ t('usersRoles.others') }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Add/Edit Member Modal -->
    <div v-if="showMemberModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-900 rounded-xl w-full max-w-md shadow-xl">
        <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ editingMember ? t('usersRoles.editMember') : t('usersRoles.addMember') }}
          </h2>
          <button @click="closeMemberModal" class="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <X class="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div class="p-4 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('usersRoles.fullName') }} *</label>
            <input v-model="memberForm.name" type="text" class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white" :placeholder="t('usersRoles.namePlaceholder')" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('clients.email') }} *</label>
            <input v-model="memberForm.email" type="email" :disabled="!!editingMember" class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white disabled:opacity-50" :placeholder="t('usersRoles.emailPlaceholder')" />
          </div>
          <div v-if="!editingMember">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('usersRoles.password') }} *</label>
            <div class="relative">
              <input
                v-model="memberForm.password"
                :type="showPassword ? 'text' : 'password'"
                class="w-full px-3 py-2 pr-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white"
                :placeholder="t('usersRoles.passwordPlaceholder')"
              />
              <button type="button" @click="showPassword = !showPassword" class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600">
                <EyeOff v-if="showPassword" class="w-4 h-4" />
                <Eye v-else class="w-4 h-4" />
              </button>
            </div>
            <p v-if="memberForm.password && memberForm.password.length < 6" class="text-xs text-red-500 mt-1">{{ t('usersRoles.passwordMinLength') }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('usersRoles.role') }} *</label>
            <select v-model="memberForm.role" class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white">
              <option value="">{{ t('usersRoles.selectRole') }}</option>
              <option v-for="role in assignableRoles" :key="role.id" :value="role.slug">{{ role.name }}</option>
            </select>
          </div>
          <div v-if="editingMember">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('usersRoles.status') }}</label>
            <select v-model="memberForm.status" class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white">
              <option value="active">{{ t('usersRoles.statusActive') }}</option>
              <option value="inactive">{{ t('usersRoles.statusInactive') }}</option>
            </select>
          </div>
        </div>
        <div class="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-800">
          <button @click="closeMemberModal" class="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
            {{ t('common.cancel') }}
          </button>
          <button @click="saveMember" :disabled="isSaving" class="flex items-center gap-2 px-4 py-2 bg-[#4959b4] hover:bg-[#3a4791] text-white rounded-lg text-sm font-medium disabled:opacity-50">
            <Loader2 v-if="isSaving" class="w-4 h-4 animate-spin" />
            {{ editingMember ? t('common.save') : t('usersRoles.invite') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Role Modal -->
    <div v-if="showRoleModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-900 rounded-xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
        <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ editingRole ? t('usersRoles.editRole') : t('usersRoles.createRole') }}
          </h2>
          <button @click="closeRoleModal" class="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <X class="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div class="p-4 space-y-4 overflow-y-auto flex-1">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('usersRoles.roleName') }} *</label>
            <input v-model="roleForm.name" type="text" class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white" :placeholder="t('usersRoles.roleNamePlaceholder')" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('usersRoles.description') }}</label>
            <textarea v-model="roleForm.description" rows="2" class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white resize-none" :placeholder="t('usersRoles.roleDescriptionPlaceholder')"></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{{ t('usersRoles.permissions') }}</label>
            <div class="space-y-3">
              <div v-for="category in permissionCategories" :key="category.name" class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-2">{{ category.name }}</h4>
                <div class="grid grid-cols-2 gap-2">
                  <label v-for="perm in category.permissions" :key="perm.id" class="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" :value="perm.id" v-model="roleForm.permissions" class="rounded border-gray-300" />
                    <span class="text-sm text-gray-700 dark:text-gray-300">{{ perm.label }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-800">
          <button @click="closeRoleModal" class="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
            {{ t('common.cancel') }}
          </button>
          <button @click="saveRole" :disabled="isSaving" class="flex items-center gap-2 px-4 py-2 bg-[#4959b4] hover:bg-[#3a4791] text-white rounded-lg text-sm font-medium disabled:opacity-50">
            <Loader2 v-if="isSaving" class="w-4 h-4 animate-spin" />
            {{ editingRole ? t('common.save') : t('common.create') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-900 rounded-xl w-full max-w-sm shadow-xl">
        <div class="p-6 text-center">
          <div class="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle class="w-6 h-6 text-red-600" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{{ t('usersRoles.confirmDelete') }}</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ deleteConfirmMessage }}
          </p>
        </div>
        <div class="flex items-center gap-3 p-4 border-t border-gray-200 dark:border-gray-800">
          <button @click="showDeleteConfirm = false" class="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
            {{ t('common.cancel') }}
          </button>
          <button @click="executeDelete" :disabled="isSaving" class="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium disabled:opacity-50">
            <Loader2 v-if="isSaving" class="w-4 h-4 animate-spin" />
            {{ t('common.delete') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  ListFilter,
  Download,
  Plus,
  Search,
  ChevronDown,
  Settings,
  Trash2,
  Users,
  Shield,
  X,
  AlertTriangle,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-vue-next'

const { t } = useI18n()

interface Member {
  id: number | string
  name: string
  email: string
  role: string
  status?: string
  lastLogin?: string
  initials: string
  avatarColor: string
  boutiques?: string[]
}

interface Role {
  id: string
  name: string
  description: string
  memberCount: number
  isDefault: boolean
  isOwner: boolean
  isSystem?: boolean
  permissions: string[]
}

interface PermissionCategory {
  name: string
  permissions: { id: string; label: string }[]
}

interface Props {
  teamMembers: Member[]
  availableRoles?: Role[]
  canDelete?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  availableRoles: () => [],
  canDelete: false
})

const emit = defineEmits<{
  'toggle-submenu': []
  'add-member': [form: { name: string; email: string; password: string; role: string }]
  'update-member': [member: { id: string | number; name: string; email: string; role: string; status: string }]
  'remove-member': [id: string | number]
  'add-role': [role: { name: string; description: string; permissions: string[] }]
  'update-role': [role: { id: string; name: string; description: string; permissions: string[] }]
  'remove-role': [id: string]
}>()

// Local state
const membersTab = ref('members')
const memberSearchQuery = ref('')
const showRoleFilter = ref(false)
const selectedRoleFilters = ref<string[]>([])
const showMemberModal = ref(false)
const showRoleModal = ref(false)
const showDeleteConfirm = ref(false)
const deleteConfirmMessage = ref('')
const deleteTarget = ref<{ type: 'member' | 'role'; id: number | string } | null>(null)
const editingMember = ref<any>(null)
const editingRole = ref<any>(null)
const isSaving = ref(false)

const memberForm = ref({
  name: '',
  email: '',
  password: '',
  role: '',
  status: 'active'
})
const showPassword = ref(false)

const roleForm = ref({
  name: '',
  description: '',
  permissions: [] as string[]
})

// Local copy of roles that syncs with prop
const localRoles = ref<Role[]>([])

watch(() => props.availableRoles, (newRoles) => {
  if (newRoles && newRoles.length > 0) {
    localRoles.value = newRoles.map(r => ({ ...r }))
  }
}, { immediate: true, deep: true })

// Role name to database slug mapping
const ROLE_SLUG_MAP: Record<string, string> = {
  'Owner': 'owner',
  'Manager': 'manager',
  'Agent Confirmation': 'agent_confirmation',
  'Agent Entrepôt': 'agent_warehouse',
}

const assignableRoles = computed(() =>
  localRoles.value
    .filter(r => !r.isOwner)
    .map(r => ({ ...r, slug: ROLE_SLUG_MAP[r.name] || r.name.toLowerCase().replace(/\s+/g, '_') }))
)

const permissionCategories: PermissionCategory[] = [
  {
    name: 'Colis',
    permissions: [
      { id: 'shipments.view', label: 'Voir les colis' },
      { id: 'shipments.create', label: 'Créer des colis' },
      { id: 'shipments.update', label: 'Modifier les colis' },
      { id: 'shipments.delete', label: 'Supprimer les colis' },
      { id: 'shipments.all', label: 'Toutes permissions colis' }
    ]
  },
  {
    name: 'Clients',
    permissions: [
      { id: 'clients.view', label: 'Voir les clients' },
      { id: 'clients.manage', label: 'Gérer les clients' }
    ]
  },
  {
    name: 'Utilisateurs',
    permissions: [
      { id: 'users.view', label: 'Voir les utilisateurs' },
      { id: 'users.manage', label: 'Gérer les utilisateurs' }
    ]
  },
  {
    name: 'Paramètres',
    permissions: [
      { id: 'settings.view', label: 'Voir les paramètres' },
      { id: 'settings.manage', label: 'Modifier les paramètres' },
      { id: 'billing.view', label: 'Voir la facturation' }
    ]
  },
  {
    name: 'Rapports',
    permissions: [
      { id: 'reports.view', label: 'Voir les rapports' },
      { id: 'reports.export', label: 'Exporter les rapports' }
    ]
  }
]

const filteredMembers = computed(() => {
  let members = [...props.teamMembers]

  if (memberSearchQuery.value) {
    const query = memberSearchQuery.value.toLowerCase()
    members = members.filter(m =>
      m.name.toLowerCase().includes(query) ||
      m.email.toLowerCase().includes(query)
    )
  }

  if (selectedRoleFilters.value.length > 0) {
    members = members.filter(m =>
      selectedRoleFilters.value.some(roleId => {
        const role = localRoles.value.find(r => r.id === roleId)
        return role && m.role === role.name
      })
    )
  }

  return members
})

function openAddMemberModal() {
  editingMember.value = null
  memberForm.value = { name: '', email: '', password: '', role: '', status: 'active' }
  showPassword.value = false
  showMemberModal.value = true
}

function editMember(member: any) {
  editingMember.value = member
  memberForm.value = {
    name: member.name,
    email: member.email,
    role: member.role,
    status: member.status || 'active'
  }
  showMemberModal.value = true
}

function closeMemberModal() {
  showMemberModal.value = false
  editingMember.value = null
}

async function saveMember() {
  if (!memberForm.value.name || !memberForm.value.email || !memberForm.value.role) {
    alert('Veuillez remplir tous les champs obligatoires (nom, email, rôle)')
    return
  }
  if (!editingMember.value && (!memberForm.value.password || memberForm.value.password.length < 6)) {
    alert('Le mot de passe est requis (minimum 6 caractères)')
    return
  }

  isSaving.value = true
  try {
    if (editingMember.value) {
      emit('update-member', {
        id: editingMember.value.id,
        name: memberForm.value.name,
        email: memberForm.value.email,
        role: memberForm.value.role,
        status: memberForm.value.status
      })
    } else {
      emit('add-member', {
        name: memberForm.value.name,
        email: memberForm.value.email,
        password: memberForm.value.password,
        role: memberForm.value.role
      })
    }
    closeMemberModal()
  } finally {
    setTimeout(() => { isSaving.value = false }, 500)
  }
}

function confirmDeleteMember(member: any) {
  deleteTarget.value = { type: 'member', id: member.id }
  deleteConfirmMessage.value = t('usersRoles.confirmDeleteMember', { name: member.name })
  showDeleteConfirm.value = true
}

function openAddRoleModal() {
  editingRole.value = null
  roleForm.value = { name: '', description: '', permissions: [] }
  showRoleModal.value = true
}

function editRole(role: any) {
  editingRole.value = role
  roleForm.value = {
    name: role.name,
    description: role.description || '',
    permissions: [...(role.permissions || [])]
  }
  showRoleModal.value = true
}

function closeRoleModal() {
  showRoleModal.value = false
  editingRole.value = null
}

async function saveRole() {
  if (!roleForm.value.name) return

  isSaving.value = true
  try {
    if (editingRole.value) {
      emit('update-role', {
        id: editingRole.value.id,
        name: roleForm.value.name,
        description: roleForm.value.description,
        permissions: roleForm.value.permissions
      })
    } else {
      emit('add-role', {
        name: roleForm.value.name,
        description: roleForm.value.description,
        permissions: roleForm.value.permissions
      })
    }
    closeRoleModal()
  } finally {
    setTimeout(() => { isSaving.value = false }, 500)
  }
}

function confirmDeleteRole(role: any) {
  deleteTarget.value = { type: 'role', id: role.id }
  deleteConfirmMessage.value = t('usersRoles.confirmDeleteRole', { name: role.name })
  showDeleteConfirm.value = true
}

async function executeDelete() {
  if (!deleteTarget.value) return

  isSaving.value = true
  try {
    if (deleteTarget.value.type === 'member') {
      emit('remove-member', deleteTarget.value.id)
    } else if (deleteTarget.value.type === 'role') {
      emit('remove-role', deleteTarget.value.id as string)
    }
    showDeleteConfirm.value = false
    deleteTarget.value = null
  } finally {
    setTimeout(() => { isSaving.value = false }, 500)
  }
}

function exportMembers() {
  const csvHeader = `${t('usersRoles.fullName')},${t('clients.email')},${t('usersRoles.role')},${t('usersRoles.status')},${t('usersRoles.lastLogin')}`
  const csvRows = props.teamMembers.map(m =>
    `"${m.name}","${m.email}","${m.role}","${m.status || 'active'}","${m.lastLogin || ''}"`
  )
  const csvContent = [csvHeader, ...csvRows].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `members_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
</script>
