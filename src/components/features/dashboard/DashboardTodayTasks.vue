<template>
  <div class="flex flex-col h-full">
    <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button @click="$emit('toggle-sub-menu')" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Tâches du jour</h1>
          <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">{{ new Date().toLocaleDateString('fr-TN', { weekday: 'long', day: 'numeric', month: 'long' }) }}</p>
        </div>
      </div>
    </div>
  </header>
  <main class="flex-1 overflow-y-auto p-6">
    <!-- Tasks by Category -->
    <div class="space-y-4">
      <!-- Loop through task categories -->
      <div v-for="category in filteredCategories" :key="category.id" class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <!-- Category Header -->
        <div class="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div :class="['w-10 h-10 rounded-lg flex items-center justify-center', category.bgColor]">
              <component :is="category.icon" :class="['w-5 h-5', category.iconColor]" />
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-white">{{ category.name }}</h3>
              <p class="text-xs text-gray-500">{{ category.tasks.length }} tâche{{ category.tasks.length > 1 ? 's' : '' }}</p>
            </div>
          </div>
          <button v-if="category.id === 'labels' && category.tasks.length > 0" @click="$emit('print-all-labels')" class="btn-primary btn-primary-sm flex items-center space-x-1">
            <Printer class="w-3 h-3" />
            <span>Imprimer tout</span>
          </button>
          <button v-if="category.id === 'pickup'" @click.stop="$emit('add-pickup', '')" class="btn-primary btn-primary-sm flex items-center space-x-1">
            <Truck class="w-4 h-4" />
            <span>Déclarer pickup</span>
          </button>
        </div>

        <!-- Tasks List -->
        <div class="divide-y divide-gray-100 dark:divide-gray-800">
          <div v-for="task in category.tasks" :key="task.id"
            :class="['px-5 py-3 flex items-center justify-between transition-colors', task.completed ? 'bg-gray-50 dark:bg-gray-800/30' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50', task.shipmentId ? 'cursor-pointer' : '']"
            @click="openShipmentDetail(task)">
            <div class="flex items-center space-x-4 min-w-0 flex-1">
              <!-- Task Info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center space-x-2">
                  <p :class="['text-sm font-medium truncate', task.completed ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-white']">
                    {{ task.title }}
                  </p>
                  <span v-if="task.priority === 'high'" class="px-1.5 py-0.5 bg-red-100 text-red-600 text-xs rounded font-medium shrink-0">Urgent</span>
                  <span v-if="task.count" class="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded shrink-0">{{ task.count }}</span>
                </div>
                <p v-if="task.subtitle" class="text-xs text-gray-500 mt-0.5 truncate">{{ task.subtitle }}</p>
                <p v-if="task.meta" class="text-xs text-gray-400 mt-0.5 truncate">{{ task.meta }}</p>
                <p v-if="task.description" class="text-xs text-gray-500 mt-0.5">{{ task.description }}</p>
              </div>
            </div>

            <!-- Task Actions -->
            <div class="flex items-center space-x-2">
              <!-- Quick Action Button -->
              <button v-if="task.action && !task.completed" @click.stop="$emit('execute-task-action', task)" class="btn-primary btn-primary-sm flex items-center space-x-1">
                <component :is="task.actionIcon" class="w-3 h-3" />
                <span>{{ task.actionLabel }}</span>
              </button>
              <!-- Completed Time -->
              <span v-if="task.completed && task.completedAt" class="text-xs text-gray-400">
                {{ task.completedAt }}
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  </main>

  <!-- Shipment Detail Panel -->
  <ShipmentDetailPanel
    :show="showDetailPanel"
    :shipment="selectedShipment"
    @close="closeDetailPanel"
  />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  ListFilter,
  Printer,
  Truck,
} from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'
import ShipmentDetailPanel from '@/components/features/shipments/ShipmentDetailPanel.vue'

interface Task {
  id: number
  title: string
  subtitle?: string
  meta?: string
  description?: string
  completed: boolean
  completedAt?: string
  priority?: string
  count?: number
  action?: string
  actionIcon?: any
  actionLabel?: string
  shipmentId?: string
}

interface TaskCategory {
  id: string
  name: string
  icon: any
  bgColor: string
  iconColor: string
  tasks: Task[]
}

interface DailyTasksStats {
  total: number
  completed: number
  pending: number
  progressPercent: number
}

interface Props {
  categories: TaskCategory[]
  stats: DailyTasksStats
}

const props = defineProps<Props>()

defineEmits<{
  (e: 'toggle-sub-menu'): void
  (e: 'toggle-task', categoryId: string, taskId: number): void
  (e: 'complete-all-in-category', categoryId: string): void
  (e: 'execute-task-action', task: Task): void
  (e: 'print-all-labels'): void
  (e: 'add-pickup', carrierId: string): void
}>()

const appStore = useAppStore()

const filteredCategories = computed(() => props.categories)

// Shipment detail panel state
const showDetailPanel = ref(false)
const selectedShipment = ref<Record<string, any> | null>(null)

function openShipmentDetail(task: Task) {
  if (!task.shipmentId) return
  const shipment = appStore.shipments.find(s => s.id === task.shipmentId)
  if (!shipment) return
  selectedShipment.value = shipment
  showDetailPanel.value = true
}

function closeDetailPanel() {
  showDetailPanel.value = false
  selectedShipment.value = null
}
</script>
