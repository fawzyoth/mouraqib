<template>
  <div class="relative w-full h-full flex items-center justify-center overflow-hidden py-16">
    <!-- Background Grid Pattern -->
    <div class="absolute inset-0 opacity-5">
      <div class="w-full h-full" style="background-image: radial-gradient(circle, #fff 1px, transparent 1px); background-size: 30px 30px;"></div>
    </div>

    <!-- Main Content Container - Centered Dashboard Preview -->
    <div class="relative z-10 w-full max-w-sm mx-auto px-4">

      <!-- Mini Dashboard Card -->
      <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden shadow-2xl">

        <!-- Dashboard Header -->
        <div class="bg-gray-800 px-4 py-3 border-b border-gray-700/50">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-red-500"></div>
              <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div class="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <span class="text-xs text-gray-400 font-medium">Mouraqib Dashboard</span>
          </div>
        </div>

        <!-- Stats Row -->
        <div class="grid grid-cols-3 gap-2 p-3 bg-gray-800/30">
          <div
            class="text-center p-2 rounded-lg transition-all duration-500"
            :class="activeStatIndex === 0 ? 'bg-orange-500/20 scale-105' : 'bg-gray-700/30'"
          >
            <div class="text-lg font-bold text-white">{{ animatedStats.total }}</div>
            <div class="text-[10px] text-gray-400">Total</div>
          </div>
          <div
            class="text-center p-2 rounded-lg transition-all duration-500"
            :class="activeStatIndex === 1 ? 'bg-green-500/20 scale-105' : 'bg-gray-700/30'"
          >
            <div class="text-lg font-bold text-green-400">{{ animatedStats.delivered }}</div>
            <div class="text-[10px] text-gray-400">Livrés</div>
          </div>
          <div
            class="text-center p-2 rounded-lg transition-all duration-500"
            :class="activeStatIndex === 2 ? 'bg-blue-500/20 scale-105' : 'bg-gray-700/30'"
          >
            <div class="text-lg font-bold text-blue-400">{{ animatedStats.inTransit }}</div>
            <div class="text-[10px] text-gray-400">En transit</div>
          </div>
        </div>

        <!-- Shipment Cards -->
        <div class="p-3 space-y-2 max-h-48 overflow-hidden">
          <TransitionGroup name="shipment-list">
            <div
              v-for="shipment in visibleShipments"
              :key="shipment.id"
              class="bg-gray-700/40 rounded-lg p-3 border border-gray-600/30"
            >
              <div class="flex items-center justify-between mb-1.5">
                <div class="flex items-center gap-2">
                  <Package class="w-3.5 h-3.5 text-orange-400" />
                  <span class="text-white font-mono text-xs">{{ shipment.trackingNumber }}</span>
                </div>
                <span
                  class="px-2 py-0.5 rounded-full text-[10px] font-medium"
                  :class="getStatusClass(shipment.status)"
                >
                  {{ getStatusLabel(shipment.status) }}
                </span>
              </div>
              <div class="flex items-center justify-between text-[10px] text-gray-400">
                <div class="flex items-center gap-1">
                  <MapPin class="w-3 h-3" />
                  <span>{{ shipment.destination }}</span>
                </div>
                <span>{{ shipment.time }}</span>
              </div>
              <!-- Progress Bar -->
              <div class="mt-2 h-1 bg-gray-600/50 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-1000 ease-out"
                  :class="getProgressClass(shipment.status)"
                  :style="{ width: getProgressWidth(shipment.status) }"
                ></div>
              </div>
            </div>
          </TransitionGroup>
        </div>

        <!-- Activity Feed -->
        <div class="px-3 pb-3">
          <div class="bg-gray-700/30 rounded-lg p-2.5">
            <div class="text-[10px] text-gray-400 mb-2 flex items-center gap-1.5">
              <Activity class="w-3 h-3" />
              <span>Activité récente</span>
            </div>
            <div class="space-y-1.5">
              <TransitionGroup name="activity-list">
                <div
                  v-for="activity in visibleActivities"
                  :key="activity.id"
                  class="flex items-center gap-2 text-[10px]"
                >
                  <div
                    class="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    :class="activity.color"
                  ></div>
                  <span class="text-gray-300 flex-1 truncate">{{ activity.message }}</span>
                  <span class="text-gray-500 flex-shrink-0">{{ activity.time }}</span>
                </div>
              </TransitionGroup>
            </div>
          </div>
        </div>
      </div>

      <!-- Floating Notification Cards -->
      <TransitionGroup name="notification">
        <div
          v-for="notification in visibleNotifications"
          :key="notification.id"
          class="absolute bg-white rounded-xl shadow-xl p-2.5 flex items-center gap-2 min-w-[140px]"
          :style="notification.style"
        >
          <div
            class="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
            :class="notification.iconBg"
          >
            <component :is="notification.icon" class="w-3.5 h-3.5" :class="notification.iconColor" />
          </div>
          <div class="min-w-0">
            <div class="text-[10px] font-semibold text-gray-900 truncate">{{ notification.title }}</div>
            <div class="text-[9px] text-gray-500 truncate">{{ notification.message }}</div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, markRaw } from 'vue'
import { Package, MapPin, CheckCircle, Clock, Truck, Activity, Bell } from 'lucide-vue-next'

interface Shipment {
  id: number
  trackingNumber: string
  destination: string
  status: 'pending' | 'pickup' | 'transit' | 'delivered'
  time: string
}

interface ActivityItem {
  id: number
  message: string
  time: string
  color: string
}

interface Notification {
  id: number
  title: string
  message: string
  icon: any
  iconBg: string
  iconColor: string
  style: { top?: string; bottom?: string; left?: string; right?: string }
}

const animatedStats = ref({
  total: 0,
  delivered: 0,
  inTransit: 0
})

const activeStatIndex = ref(0)
const shipments = ref<Shipment[]>([])
const activities = ref<ActivityItem[]>([])
const notifications = ref<Notification[]>([])

const visibleShipments = computed(() => shipments.value.slice(0, 3))
const visibleActivities = computed(() => activities.value.slice(0, 3))
const visibleNotifications = computed(() => notifications.value.slice(0, 1))

const destinations = ['Tunis', 'Sfax', 'Sousse', 'Bizerte', 'Gabès', 'Ariana', 'Nabeul']
const statusOptions: Array<'pending' | 'pickup' | 'transit' | 'delivered'> = ['pending', 'pickup', 'transit', 'delivered']

function generateTrackingNumber() {
  return 'MR' + Math.random().toString(36).substring(2, 8).toUpperCase()
}

function getStatusClass(status: string) {
  const classes: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-300',
    pickup: 'bg-blue-500/20 text-blue-300',
    transit: 'bg-orange-500/20 text-orange-300',
    delivered: 'bg-green-500/20 text-green-300'
  }
  return classes[status] || classes.pending
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: 'En attente',
    pickup: 'Collecté',
    transit: 'En transit',
    delivered: 'Livré'
  }
  return labels[status] || 'En attente'
}

function getProgressClass(status: string) {
  const classes: Record<string, string> = {
    pending: 'bg-yellow-400',
    pickup: 'bg-blue-400',
    transit: 'bg-orange-400',
    delivered: 'bg-green-400'
  }
  return classes[status] || classes.pending
}

function getProgressWidth(status: string) {
  const widths: Record<string, string> = {
    pending: '25%',
    pickup: '50%',
    transit: '75%',
    delivered: '100%'
  }
  return widths[status] || '25%'
}

function addShipment() {
  const newShipment: Shipment = {
    id: Date.now(),
    trackingNumber: generateTrackingNumber(),
    destination: destinations[Math.floor(Math.random() * destinations.length)],
    status: 'pending',
    time: 'À l\'instant'
  }
  shipments.value.unshift(newShipment)

  if (shipments.value.length > 5) {
    shipments.value.pop()
  }

  addActivity(`Nouveau colis ${newShipment.trackingNumber}`, 'bg-blue-400')
  animatedStats.value.total++
}

function updateRandomShipmentStatus() {
  if (shipments.value.length === 0) return

  const eligibleShipments = shipments.value.filter(s => s.status !== 'delivered')
  if (eligibleShipments.length === 0) return

  const shipment = eligibleShipments[Math.floor(Math.random() * eligibleShipments.length)]
  const currentIndex = statusOptions.indexOf(shipment.status)

  if (currentIndex < statusOptions.length - 1) {
    shipment.status = statusOptions[currentIndex + 1]
    shipment.time = 'À l\'instant'

    if (shipment.status === 'delivered') {
      animatedStats.value.delivered++
      animatedStats.value.inTransit = Math.max(0, animatedStats.value.inTransit - 1)
      addActivity(`${shipment.trackingNumber} livré`, 'bg-green-400')
      showNotification('delivered')
    } else if (shipment.status === 'transit') {
      animatedStats.value.inTransit++
      addActivity(`${shipment.trackingNumber} en transit`, 'bg-orange-400')
      showNotification('transit')
    } else if (shipment.status === 'pickup') {
      addActivity(`${shipment.trackingNumber} collecté`, 'bg-blue-400')
    }
  }
}

function addActivity(message: string, color: string) {
  activities.value.unshift({
    id: Date.now(),
    message,
    time: 'Maintenant',
    color
  })

  activities.value.forEach((a, i) => {
    if (i > 0) a.time = `${i}m`
  })

  if (activities.value.length > 5) {
    activities.value.pop()
  }
}

function showNotification(type: string = 'new') {
  const notificationTypes: Record<string, Omit<Notification, 'id' | 'style'>> = {
    delivered: {
      title: 'Colis livré',
      message: 'Livraison confirmée',
      icon: markRaw(CheckCircle),
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    new: {
      title: 'Nouveau colis',
      message: 'Colis créé',
      icon: markRaw(Package),
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    transit: {
      title: 'En transit',
      message: 'Colis en route',
      icon: markRaw(Truck),
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600'
    }
  }

  const positions = [
    { top: '-10px', right: '-20px' },
    { bottom: '20%', left: '-30px' },
  ]

  const notifType = notificationTypes[type] || notificationTypes.new
  const notification: Notification = {
    id: Date.now(),
    ...notifType,
    style: positions[Math.floor(Math.random() * positions.length)]
  }

  notifications.value = [notification]

  setTimeout(() => {
    notifications.value = []
  }, 2500)
}

let intervals: number[] = []

onMounted(() => {
  // Initial shipments
  for (let i = 0; i < 3; i++) {
    setTimeout(() => addShipment(), i * 400)
  }

  // Animate stats
  const targetStats = { total: 847, delivered: 789, inTransit: 58 }
  const duration = 1500
  const steps = 40
  const stepDuration = duration / steps

  let step = 0
  const countInterval = setInterval(() => {
    step++
    const progress = step / steps
    animatedStats.value.total = Math.floor(targetStats.total * progress)
    animatedStats.value.delivered = Math.floor(targetStats.delivered * progress)
    animatedStats.value.inTransit = Math.floor(targetStats.inTransit * progress)

    if (step >= steps) clearInterval(countInterval)
  }, stepDuration)

  // Cycle stats highlight
  intervals.push(window.setInterval(() => {
    activeStatIndex.value = (activeStatIndex.value + 1) % 3
  }, 2500))

  // Add shipments
  intervals.push(window.setInterval(() => addShipment(), 6000))

  // Update statuses
  intervals.push(window.setInterval(() => updateRandomShipmentStatus(), 3500))

  // Initial notification
  setTimeout(() => showNotification('new'), 2000)
})

onUnmounted(() => {
  intervals.forEach(clearInterval)
})
</script>

<style scoped>
.shipment-list-enter-active,
.shipment-list-leave-active {
  transition: all 0.4s ease;
}

.shipment-list-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.shipment-list-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.shipment-list-move {
  transition: transform 0.4s ease;
}

.activity-list-enter-active,
.activity-list-leave-active {
  transition: all 0.3s ease;
}

.activity-list-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}

.activity-list-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

.notification-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(10px);
}

.notification-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(-10px);
}
</style>
