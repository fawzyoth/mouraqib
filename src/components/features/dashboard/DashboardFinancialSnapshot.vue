<template>
  <div class="flex flex-col h-full">
    <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button @click="$emit('toggle-sub-menu')" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Aperçu financier</h1>
            <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Suivi de votre trésorerie et paiements</p>
          </div>
        </div>
      </div>
    </header>

    <main class="flex-1 overflow-y-auto p-6">
      <!-- Financial Overview Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm opacity-90">COD à récupérer</span>
            <Banknote class="w-5 h-5 opacity-80" />
          </div>
          <p class="text-3xl font-bold">{{ financialData.pendingCOD.toFixed(2) }} <span class="text-lg font-normal">TND</span></p>
          <p class="text-sm opacity-80 mt-1">{{ financialData.pendingCODCount }} colis en cours</p>
        </div>

        <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-gray-500">Frais de livraison</span>
            <Truck class="w-4 h-4 text-gray-400" />
          </div>
          <p class="text-2xl font-bold text-red-600">{{ financialData.deliveryFees.toFixed(2) }} <span class="text-sm font-normal">TND</span></p>
          <p class="text-xs text-gray-500 mt-1">Total colis livrés</p>
        </div>

        <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-gray-500">Marge nette</span>
            <TrendingUp class="w-4 h-4 text-gray-400" />
          </div>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ financialData.netMargin.toFixed(2) }} <span class="text-sm font-normal">TND</span></p>
          <p class="text-xs text-green-600 mt-1">+{{ financialData.marginPercent }}% du CA</p>
        </div>
      </div>

      <!-- COD by Carrier (full width) -->
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 mb-6">
        <div class="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h3 class="font-semibold text-gray-900 dark:text-white">COD à récupérer par transporteur</h3>
          <span class="text-xs text-gray-500">{{ financialData.codByCarrier.length }} transporteur{{ financialData.codByCarrier.length !== 1 ? 's' : '' }}</span>
        </div>
        <div class="divide-y divide-gray-100 dark:divide-gray-800">
          <template v-for="carrier in financialData.codByCarrier" :key="carrier.name">
            <!-- Carrier row (clickable) -->
            <div
              class="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
              @click="toggleCarrier(carrier.name)"
            >
              <div class="flex items-center space-x-3">
                <div :class="['w-10 h-10 rounded-lg flex items-center justify-center', carrier.colorClass]">
                  <Building2 class="w-5 h-5" :class="carrier.iconColor" />
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">{{ carrier.name }}</p>
                  <p class="text-xs text-gray-500">
                    <template v-if="carrier.deliveredShipments.length > 0 && carrier.returnedShipments.length > 0">{{ carrier.deliveredShipments.length }} livrés · {{ carrier.returnedShipments.length }} retours</template>
                    <template v-else-if="carrier.deliveredShipments.length > 0">{{ carrier.deliveredShipments.length }} livré{{ carrier.deliveredShipments.length !== 1 ? 's' : '' }}</template>
                    <template v-else>{{ carrier.returnedShipments.length }} retour{{ carrier.returnedShipments.length !== 1 ? 's' : '' }}</template>
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <!-- COD Collecté -->
                <div class="text-right hidden sm:block">
                  <p class="text-xs text-gray-400">COD Collecté</p>
                  <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ carrier.amount.toFixed(2) }} TND</p>
                </div>
                <!-- Frais Total -->
                <div class="text-right hidden sm:block" v-if="carrier.totalFees !== undefined">
                  <p class="text-xs text-gray-400">Frais Total</p>
                  <p class="text-sm font-semibold text-red-600">-{{ (carrier.totalFees || 0).toFixed(2) }} TND</p>
                </div>
                <!-- Net à recevoir -->
                <div class="text-right bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-lg hidden sm:block" v-if="carrier.netAmount !== undefined">
                  <p class="text-xs text-green-600">Net à recevoir</p>
                  <p class="text-sm font-bold text-green-600">{{ (carrier.netAmount || 0).toFixed(2) }} TND</p>
                </div>
                <!-- Mobile: just the amount -->
                <div class="text-right sm:hidden">
                  <p class="text-base font-bold text-gray-900 dark:text-white">{{ carrier.amount.toFixed(2) }} TND</p>
                  <div class="mt-1 h-1.5 w-24 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-green-500 rounded-full"
                      :style="{ width: maxCarrierAmount > 0 ? (carrier.amount / maxCarrierAmount * 100) + '%' : '0%' }"
                    ></div>
                  </div>
                </div>
                <!-- Progress bar (desktop only, when no shipments breakdown) -->
                <div class="hidden sm:block w-24" v-if="false">
                  <div class="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-green-500 rounded-full"
                      :style="{ width: maxCarrierAmount > 0 ? (carrier.amount / maxCarrierAmount * 100) + '%' : '0%' }"
                    ></div>
                  </div>
                </div>
                <!-- Chevron -->
                <ChevronDown
                  class="w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0"
                  :class="{ 'rotate-180': expandedCarrier === carrier.name }"
                />
              </div>
            </div>

            <!-- Expanded section: sub-tables + pickup events -->
            <div v-if="expandedCarrier === carrier.name">

              <!-- Table 1: Livraisons -->
              <div v-if="carrier.deliveredShipments.length > 0">
                <div class="px-5 py-2 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 flex items-center">
                  <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Livraisons ({{ carrier.deliveredShipments.length }})</span>
                </div>
                <div class="overflow-x-auto border-t border-gray-200 dark:border-gray-800">
                  <table class="w-full min-w-[640px]">
                    <thead class="bg-gray-50 dark:bg-gray-800/50">
                      <tr>
                        <th class="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">N° Tracking</th>
                        <th class="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Client</th>
                        <th class="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Livraison</th>
                        <th class="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Prix</th>
                        <th class="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Frais Livr.</th>
                        <th class="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Retenue</th>
                        <th class="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Net</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
                      <tr
                        v-for="shipment in carrier.deliveredShipments"
                        :key="shipment.id"
                        class="even:bg-gray-50/50 even:dark:bg-gray-800/20 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                        @click="selectedShipment = shipment.raw"
                      >
                        <td class="px-4 py-3">
                          <span class="font-mono text-sm text-gray-900 dark:text-white">{{ shipment.tracking }}</span>
                        </td>
                        <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ shipment.client }}</td>
                        <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          {{ shipment.deliveryDate ? formatDateTime(shipment.deliveryDate) : '-' }}
                        </td>
                        <td class="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-white">{{ shipment.cod.toLocaleString() }}</td>
                        <td class="px-4 py-3 text-sm text-right text-red-600">-{{ shipment.deliveryFee.toLocaleString() }}</td>
                        <td class="px-4 py-3 text-sm text-right text-red-600">{{ shipment.otherFees > 0 ? '-' + shipment.otherFees.toLocaleString() : '0' }}</td>
                        <td class="px-4 py-3 text-sm text-right font-semibold text-green-600">{{ shipment.net.toLocaleString() }}</td>
                      </tr>
                    </tbody>
                    <tfoot class="bg-gray-50 dark:bg-gray-800/50">
                      <tr class="border-t-2 border-gray-200 dark:border-gray-700">
                        <td colspan="3" class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">TOTAL Livraisons</td>
                        <td class="px-4 py-3 text-sm text-right font-semibold text-gray-900 dark:text-white">{{ carrier.totalCOD.toLocaleString() }}</td>
                        <td class="px-4 py-3 text-sm text-right font-semibold text-red-600">-{{ carrier.totalDeliveryFees.toLocaleString() }}</td>
                        <td class="px-4 py-3 text-sm text-right font-semibold text-red-600">{{ carrier.totalWithholding > 0 ? '-' + carrier.totalWithholding.toLocaleString() : '0' }}</td>
                        <td class="px-4 py-3 text-sm text-right font-semibold text-green-600">{{ (carrier.totalCOD - carrier.totalDeliveryFees - carrier.totalWithholding).toLocaleString() }}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <!-- Table 2: Retours -->
              <div v-if="carrier.returnedShipments.length > 0">
                <div class="px-5 py-2 bg-orange-50 dark:bg-orange-900/10 border-t border-gray-200 dark:border-gray-800 flex items-center">
                  <span class="text-xs font-semibold text-orange-600 uppercase tracking-wider">Retours ({{ carrier.returnedShipments.length }})</span>
                </div>
                <div class="overflow-x-auto border-t border-gray-200 dark:border-gray-800">
                  <table class="w-full min-w-[640px]">
                    <thead class="bg-orange-50/50 dark:bg-orange-900/10">
                      <tr>
                        <th class="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">N° Tracking</th>
                        <th class="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Client</th>
                        <th class="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Date Retour</th>
                        <th class="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Valeur</th>
                        <th class="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Scan</th>
                        <th class="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-orange-600">Frais Retour</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
                      <tr
                        v-for="shipment in carrier.returnedShipments"
                        :key="shipment.id"
                        class="even:bg-gray-50/50 even:dark:bg-gray-800/20 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                        @click="selectedShipment = shipment.raw"
                      >
                        <td class="px-4 py-3">
                          <span class="font-mono text-sm text-gray-900 dark:text-white">{{ shipment.tracking }}</span>
                        </td>
                        <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ shipment.client }}</td>
                        <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          {{ shipment.deliveryDate ? formatDateTime(shipment.deliveryDate) : '-' }}
                        </td>
                        <td class="px-4 py-3 text-sm text-right text-gray-500 dark:text-gray-400">{{ shipment.cod > 0 ? shipment.cod.toLocaleString() : '—' }}</td>
                        <td class="px-4 py-3 text-sm whitespace-nowrap">
                          <template v-if="shipment.inScannedAt">
                            <span class="text-green-600 font-medium">Scanné</span>
                            <div class="text-xs text-gray-400">{{ formatDateTime(shipment.inScannedAt) }}</div>
                          </template>
                          <template v-else>
                            <span class="inline-flex items-center gap-1 text-red-600 font-medium">
                              <AlertCircle class="w-3.5 h-3.5 flex-shrink-0" />
                              Non scanné
                            </span>
                          </template>
                        </td>
                        <td class="px-4 py-3 text-sm text-right font-semibold text-orange-600">{{ shipment.returnFee.toLocaleString() }}</td>
                      </tr>
                    </tbody>
                    <tfoot class="bg-orange-50/50 dark:bg-orange-900/10">
                      <tr class="border-t-2 border-gray-200 dark:border-gray-700">
                        <td colspan="5" class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">TOTAL Retours</td>
                        <td class="px-4 py-3 text-sm text-right font-semibold text-orange-600">{{ carrier.totalReturnFees.toLocaleString() }}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <!-- Frais additionnels -->
              <div>
                <div class="px-5 py-2 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-800 flex items-center">
                  <span class="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Frais additionnels</span>
                </div>

                <!-- Subsection: Pickups -->
                <div class="border-t border-gray-200 dark:border-gray-800">
                  <div class="px-5 py-2 bg-indigo-50 dark:bg-indigo-900/10 flex items-center justify-between">
                    <span class="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                      Pickups ({{ carrier.pickupEvents.length }})
                    </span>
                    <button
                      @click.stop="$emit('add-pickup', carrier.name)"
                      class="text-xs text-indigo-600 hover:text-indigo-800 dark:hover:text-indigo-400 font-medium transition-colors"
                    >
                      + Ajouter
                    </button>
                  </div>
                  <div v-if="carrier.pickupEvents.length > 0" class="overflow-x-auto border-t border-gray-200 dark:border-gray-800">
                    <table class="w-full min-w-[400px]">
                      <thead class="bg-indigo-50/50 dark:bg-indigo-900/10">
                        <tr>
                          <th class="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Date</th>
                          <th class="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Frais</th>
                          <th class="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Notes</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
                        <tr v-for="ev in carrier.pickupEvents" :key="ev.id" class="even:bg-gray-50/50 even:dark:bg-gray-800/20">
                          <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">{{ formatDateTime(ev.pickupAt) }}</td>
                          <td class="px-4 py-3 text-sm text-right font-medium text-indigo-600">{{ ev.fee.toLocaleString() }}</td>
                          <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{{ ev.notes || '—' }}</td>
                        </tr>
                      </tbody>
                      <tfoot class="bg-indigo-50/50 dark:bg-indigo-900/10">
                        <tr class="border-t-2 border-gray-200 dark:border-gray-700">
                          <td class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">TOTAL Pickups</td>
                          <td class="px-4 py-3 text-sm text-right font-semibold text-indigo-600">{{ carrier.totalPickupFees.toLocaleString() }}</td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  <div v-else class="px-5 py-3 text-sm text-gray-400 dark:text-gray-500 italic">
                    Aucun pickup enregistré
                  </div>
                </div>

                <!-- Subsection: Frais de paiement -->
                <div class="border-t border-gray-200 dark:border-gray-800">
                  <div class="px-5 py-2 bg-gray-50 dark:bg-gray-800/50 flex items-center">
                    <span class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Frais de paiement</span>
                  </div>
                  <div class="px-5 py-4 text-sm text-gray-400 dark:text-gray-500 italic">
                    — À configurer
                  </div>
                </div>
              </div>

              <!-- TOTAL par transporteur -->
              <div class="border-t-2 border-gray-300 dark:border-gray-600">
                <div class="px-5 py-3 bg-gray-50 dark:bg-gray-800/50 flex items-center">
                  <span class="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Total</span>
                </div>
                <div class="divide-y divide-gray-100 dark:divide-gray-800">
                  <div class="px-5 py-2.5 flex items-center justify-between">
                    <span class="text-sm text-gray-500 dark:text-gray-400">COD collecté</span>
                    <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ carrier.totalCOD.toFixed(2) }} TND</span>
                  </div>
                  <div class="px-5 py-2.5 flex items-center justify-between">
                    <span class="text-sm text-gray-500 dark:text-gray-400">Frais livraison</span>
                    <span class="text-sm font-medium text-red-600">-{{ carrier.totalDeliveryFees.toFixed(2) }} TND</span>
                  </div>
                  <div class="px-5 py-2.5 flex items-center justify-between">
                    <span class="text-sm text-gray-500 dark:text-gray-400">Frais retour</span>
                    <span class="text-sm font-medium text-red-600">-{{ carrier.totalReturnFees.toFixed(2) }} TND</span>
                  </div>
                  <div class="px-5 py-2.5 flex items-center justify-between">
                    <span class="text-sm text-gray-500 dark:text-gray-400">Total retenue</span>
                    <span class="text-sm font-medium text-red-600">-{{ carrier.totalWithholding.toFixed(2) }} TND</span>
                  </div>
                  <div class="px-5 py-2.5 flex items-center justify-between">
                    <span class="text-sm text-gray-500 dark:text-gray-400">Frais pickups</span>
                    <span class="text-sm font-medium text-red-600">-{{ carrier.totalPickupFees.toFixed(2) }} TND</span>
                  </div>
                  <div class="px-5 py-2.5 flex items-center justify-between">
                    <span class="text-sm text-gray-400 dark:text-gray-500 italic">Frais de paiement</span>
                    <span class="text-sm text-gray-400 italic">—</span>
                  </div>
                  <div class="px-5 py-4 flex items-center justify-between bg-green-50 dark:bg-green-900/20">
                    <span class="text-sm font-bold text-gray-900 dark:text-white">Total à récupérer</span>
                    <span class="text-lg font-bold text-green-600">{{ carrier.netAmount.toFixed(2) }} TND</span>
                  </div>
                </div>
              </div>

            </div>
          </template>

          <div v-if="financialData.codByCarrier.length === 0" class="px-5 py-10 text-center">
            <Banknote class="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p class="text-sm text-gray-500">Aucun COD en attente</p>
          </div>
        </div>
      </div>

      <!-- Revenue History (last 7 days) -->
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
        <div class="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h3 class="font-semibold text-gray-900 dark:text-white">Historique de revenu</h3>
          <span class="text-xs text-gray-500">7 derniers jours</span>
        </div>
        <div class="p-5">
          <div v-if="totalRevenue > 0" class="flex items-end justify-between gap-2 h-40 mb-3">
            <div
              v-for="(day, index) in financialData.revenueHistory"
              :key="index"
              class="flex-1 flex flex-col items-center justify-end group relative"
            >
              <!-- Tooltip -->
              <div class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg px-2 py-1.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <div class="font-semibold">{{ day.amount.toFixed(2) }} TND</div>
                <div class="text-gray-400">{{ day.count }} livraison{{ day.count !== 1 ? 's' : '' }}</div>
              </div>
              <!-- Bar -->
              <div
                class="w-full rounded-t-md transition-all duration-300"
                :class="index === todayIndex ? 'bg-green-500' : 'bg-green-200 dark:bg-green-900/50 group-hover:bg-green-400'"
                :style="{ height: maxRevenue > 0 ? Math.max((day.amount / maxRevenue) * 100, day.amount > 0 ? 4 : 0) + '%' : '0%' }"
              ></div>
            </div>
          </div>
          <div v-else class="flex items-center justify-center h-40 mb-3">
            <div class="text-center">
              <TrendingUp class="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p class="text-sm text-gray-500">Aucune livraison sur 7 jours</p>
            </div>
          </div>
          <!-- Day labels -->
          <div class="flex justify-between gap-2">
            <div
              v-for="(day, index) in financialData.revenueHistory"
              :key="index"
              class="flex-1 text-center"
            >
              <span
                class="text-xs"
                :class="index === todayIndex ? 'text-green-600 font-semibold' : 'text-gray-400'"
              >{{ day.label }}</span>
            </div>
          </div>
          <!-- Summary -->
          <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-sm">
            <span class="text-gray-500">Total 7 jours</span>
            <span class="font-semibold text-gray-900 dark:text-white">{{ totalRevenue.toFixed(2) }} TND</span>
          </div>
        </div>
      </div>
    </main>
  </div>

  <!-- Shipment Detail Panel -->
  <ShipmentDetailPanel
    :show="!!selectedShipment"
    :shipment="selectedShipment"
    @close="selectedShipment = null"
    @request-deletion="selectedShipment = null"
    @cancel-deletion-request="selectedShipment = null"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  ListFilter,
  Banknote,
  Truck,
  TrendingUp,
  Building2,
  ChevronDown,
  AlertCircle,
} from 'lucide-vue-next'
import ShipmentDetailPanel from '@/components/features/shipments/ShipmentDetailPanel.vue'

interface DeliveredRow {
  id: string
  tracking: string
  client: string
  deliveryDate: string
  cod: number
  deliveryFee: number
  otherFees: number
  net: number
  raw: any
}

interface ReturnedRow {
  id: string
  tracking: string
  client: string
  deliveryDate: string
  inScannedAt: string | null
  cod: number
  returnFee: number
  raw: any
}

interface PickupEventRow {
  id: string
  pickupAt: string
  fee: number
  notes: string | null
}

interface CarrierCOD {
  name: string
  count: number
  amount: number
  totalCOD: number
  totalDeliveryFees: number
  totalWithholding: number
  totalReturnFees: number
  totalPickupFees: number
  totalFees: number
  netAmount: number
  deliveredShipments: DeliveredRow[]
  returnedShipments: ReturnedRow[]
  pickupEvents: PickupEventRow[]
  colorClass: string
  iconColor: string
}

interface RevenueDay {
  label: string
  amount: number
  count: number
}

interface FinancialData {
  pendingCOD: number
  pendingCODCount: number
  deliveryFees: number
  netMargin: number
  marginPercent: number
  codByCarrier: CarrierCOD[]
  revenueHistory: RevenueDay[]
}

interface Props {
  financialData: FinancialData
}

const { financialData } = withDefaults(defineProps<Props>(), {
  financialData: () => ({
    pendingCOD: 0,
    pendingCODCount: 0,
    deliveryFees: 0,
    netMargin: 0,
    marginPercent: 0,
    codByCarrier: [],
    revenueHistory: [],
  }),
})

defineEmits<{
  (e: 'toggle-sub-menu'): void
  (e: 'add-pickup', carrierId: string): void
}>()

const expandedCarrier = ref<string | null>(null)
const selectedShipment = ref<any>(null)

function toggleCarrier(name: string) {
  expandedCarrier.value = expandedCarrier.value === name ? null : name
}

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '-'
  const opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }
  if (d.getFullYear() !== new Date().getFullYear()) opts.year = 'numeric'
  return d.toLocaleDateString('fr-FR', opts)
}

const maxCarrierAmount = computed(() =>
  Math.max(...financialData.codByCarrier.map(c => c.amount), 0)
)

const grandTotal = computed(() => {
  const carriers = financialData.codByCarrier
  const totalCOD = carriers.reduce((s, c) => s + c.totalCOD, 0)
  const totalDeliveryFees = carriers.reduce((s, c) => s + c.totalDeliveryFees, 0)
  const totalReturnFees = carriers.reduce((s, c) => s + c.totalReturnFees, 0)
  const totalWithholding = carriers.reduce((s, c) => s + c.totalWithholding, 0)
  const totalPickupFees = carriers.reduce((s, c) => s + c.totalPickupFees, 0)
  const totalPaymentFees = 0
  const net = totalCOD - totalDeliveryFees - totalReturnFees - totalWithholding - totalPickupFees - totalPaymentFees
  return { totalCOD, totalDeliveryFees, totalReturnFees, totalWithholding, totalPickupFees, totalPaymentFees, net }
})

const maxRevenue = computed(() =>
  Math.max(...financialData.revenueHistory.map(d => d.amount), 0)
)

const totalRevenue = computed(() =>
  financialData.revenueHistory.reduce((sum, d) => sum + d.amount, 0)
)

// Index of today in the 7-day history (last element = today)
const todayIndex = computed(() => financialData.revenueHistory.length - 1)
</script>
