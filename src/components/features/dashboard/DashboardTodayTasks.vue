<template>
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
      <div class="hidden sm:flex items-center space-x-3">
        <span class="text-sm text-gray-500">
          <span class="font-semibold text-green-600">{{ stats.completed }}</span> / {{ stats.total }} terminées
        </span>
        <div class="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div class="h-full bg-green-500 rounded-full transition-all" :style="{ width: stats.progressPercent + '%' }"></div>
        </div>
      </div>
    </div>
  </header>
  <main class="flex-1 overflow-y-auto p-6">
    <!-- Progress Overview -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <button @click="currentFilter = 'all'" :class="['rounded-xl p-5 border transition-all text-left', currentFilter === 'all' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700 ring-2 ring-orange-500/20' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800']">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ stats.total }}</p>
            <p class="text-sm text-gray-500 mt-1">Toutes les tâches</p>
          </div>
          <div class="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
            <FileCheck class="w-6 h-6 text-gray-600" />
          </div>
        </div>
      </button>
      <button @click="currentFilter = 'pending'" :class="['rounded-xl p-5 border transition-all text-left', currentFilter === 'pending' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 ring-2 ring-blue-500/20' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800']">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-3xl font-bold text-blue-600">{{ stats.pending }}</p>
            <p class="text-sm text-gray-500 mt-1">À faire</p>
          </div>
          <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
            <Clock class="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </button>
      <button @click="currentFilter = 'completed'" :class="['rounded-xl p-5 border transition-all text-left', currentFilter === 'completed' ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 ring-2 ring-green-500/20' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800']">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-3xl font-bold text-green-600">{{ stats.completed }}</p>
            <p class="text-sm text-gray-500 mt-1">Terminées</p>
          </div>
          <div class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
            <CheckCircle class="w-6 h-6 text-green-600" />
          </div>
        </div>
      </button>
    </div>

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
              <p class="text-xs text-gray-500">{{ category.tasks.filter(t => t.completed).length }}/{{ category.tasks.length }} terminées</p>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <div class="w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div class="h-full bg-green-500 rounded-full transition-all" :style="{ width: (category.tasks.filter(t => t.completed).length / category.tasks.length * 100) + '%' }"></div>
            </div>
            <button v-if="category.tasks.some(t => !t.completed)" @click="$emit('complete-all-in-category', category.id)" class="text-xs text-orange-500 hover:text-orange-600 font-medium">
              Tout terminer
            </button>
          </div>
        </div>

        <!-- Tasks List -->
        <div class="divide-y divide-gray-100 dark:divide-gray-800">
          <div v-for="task in category.tasks" :key="task.id"
            :class="['px-5 py-3 flex items-center justify-between transition-colors', task.completed ? 'bg-gray-50 dark:bg-gray-800/30' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50']">
            <div class="flex items-center space-x-4">
              <!-- Checkbox -->
              <button @click="$emit('toggle-task', category.id, task.id)" :class="[
                'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
                task.completed
                  ? 'bg-green-500 border-green-500'
                  : 'border-gray-300 dark:border-gray-600 hover:border-orange-500'
              ]">
                <Check v-if="task.completed" class="w-4 h-4 text-white" />
              </button>

              <!-- Task Info -->
              <div class="flex-1">
                <div class="flex items-center space-x-2">
                  <p :class="['text-sm font-medium', task.completed ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-white']">
                    {{ task.title }}
                  </p>
                  <span v-if="task.priority === 'high'" class="px-1.5 py-0.5 bg-red-100 text-red-600 text-xs rounded font-medium">Urgent</span>
                  <span v-if="task.count" class="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded">{{ task.count }}</span>
                </div>
                <p v-if="task.description" class="text-xs text-gray-500 mt-0.5">{{ task.description }}</p>
              </div>
            </div>

            <!-- Task Actions -->
            <div class="flex items-center space-x-2">
              <!-- Quick Action Button -->
              <button v-if="task.action && !task.completed" @click="$emit('execute-task-action', task)" class="btn-primary btn-primary-sm flex items-center space-x-1">
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

      <!-- All Completed Message -->
      <div v-if="stats.pending === 0" class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-8 text-center">
        <div class="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle class="w-8 h-8 text-green-600" />
        </div>
        <h3 class="text-lg font-semibold text-green-800 dark:text-green-200">Félicitations !</h3>
        <p class="text-sm text-green-600 dark:text-green-400 mt-1">Toutes vos tâches du jour sont terminées.</p>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  ListFilter,
  FileCheck,
  Clock,
  CheckCircle,
  Check
} from 'lucide-vue-next'

interface Task {
  id: number
  title: string
  description?: string
  completed: boolean
  completedAt?: string
  priority?: string
  count?: number
  action?: string
  actionIcon?: any
  actionLabel?: string
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
}>()

const currentFilter = ref<'all' | 'pending' | 'completed'>('all')

const filteredCategories = computed(() => {
  if (currentFilter.value === 'all') {
    return props.categories
  }

  return props.categories.map(cat => ({
    ...cat,
    tasks: cat.tasks.filter(t =>
      currentFilter.value === 'completed' ? t.completed : !t.completed
    )
  })).filter(cat => cat.tasks.length > 0)
})
</script>
