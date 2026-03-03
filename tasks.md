
- [x] **`addClient`** (`src/views/ClientsView.vue:185`) — Call `await appStore.clientsData.create(_data)` with form data from `<AddClientForm @submit>`, then `navigateTo('all-clients')`. Follow `saveClientEdit()` pattern at line 170. Service `useClientsData.create()` exists and calls `clientsService.create()`. Types: `ClientInsert`, mapper: `uiClientToInsert()`.
- [x] **`toggleClientVip`** (`src/views/ClientsView.vue:186`) — If `_client.status === 'vip'` call `await appStore.clientsData.updateStatus(_client.id, 'active')`, else call `await appStore.clientsData.updateStatus(_client.id, 'vip')`. Triggered by `@toggle-vip` from `<ClientsList>` and `@remove-vip` from `<VipClients>`. Service `useClientsData.updateStatus()` exists.
- [x] **`toggleClientBlocked`** (`src/views/ClientsView.vue:187`) — If `_client.status === 'blocked'` call `await appStore.clientsData.updateStatus(_client.id, 'active')`, else call `await appStore.clientsData.updateStatus(_client.id, 'blocked')`. Triggered by `@toggle-blocked` from `<ClientsList>` and `@unblock-client` from `<BlockedClients>`. Same `updateStatus` service.

### SettingsView.vue

- [x] **`saveCompanyProfile`** (`src/views/SettingsView.vue:92`) — Call `await appStore.orgData.saveProfile(_data)` with company profile form data (name, email, phone, address, city, postalCode, taxId) from `<CompanyProfile @save>`. Service `useOrganizationData.saveProfile()` exists, calls `organizationsService.update()`. Type: `OrganizationUpdate`.
- [x] **`saveOrganization`** (`src/views/SettingsView.vue:94`) — Call `await appStore.orgData.saveProfile(_data)` from `<OrganizationModal @save>`, then `showOrganizationModal.value = false` on success. Same service as `saveCompanyProfile`.
- [x] **`createBoutique`** (`src/views/SettingsView.vue:95`) — Call `await appStore.boutiquesData.create(_data)` with boutique form data (name, email, phone, address, governorate, color) from `<AddBoutiqueModal @save>`, then `showAddBoutiqueModal.value = false`. Service `boutiquesService.create()` exists at `src/services/boutiques.ts:39`. Type: `BoutiqueInsert`. **Prereq:** verify `useBoutiquesData` composable exposes `create()` — if not, add it following `useClientsData.create()` pattern.
- [x] **`updateTeamMembers`** (`src/views/SettingsView.vue:93`) — Handle `@update-members` from `<UsersRoles>`. For added members call `appStore.orgData.addMember(form)`, for removed call `appStore.orgData.removeMember(id)`, for role changes call `organizationsService.updateMemberRole(memberId, role)`. All methods exist in `useOrganizationData` and `src/services/organizations.ts`. **First** inspect `<UsersRoles>` component to determine exact payload shape of the event.

### ShipmentsView.vue

- [x] **`resetShipmentForm`** (`src/views/ShipmentsView.vue:138`) — Set `createdShipment.value = null` and optionally `stickyCarrier.value = ''`. Triggered by `@reset` from `<CreateShipment>`. No API call needed. Reference: `handleCreateAnother()` at line 143 already does `createdShipment.value = null`.

### DashboardView.vue

- [x] **`toggleDailyTask`** (`src/views/DashboardView.vue:102`) — Find task by `_taskId` inside `filteredTaskCategories.value` (iterate categories → tasks), toggle its `completed` boolean, recalculate `dailyTasksStats.value` (total, completed, pending, completionRate). Triggered by `@toggle-task` from `<DashboardTodayTasks>`. Pure local UI state, no API call.
- [x] **`completeAllInCategory`** (`src/views/DashboardView.vue:103`) — Find category by `_categoryId` in `filteredTaskCategories.value`, mark all its tasks as `completed = true`, recalculate `dailyTasksStats.value`. Triggered by `@complete-all-in-category` from `<DashboardTodayTasks>`. Pure local UI state.
- [x] **`executeTaskAction`** (`src/views/DashboardView.vue:104`) — Dispatch based on `_action.type`: navigation actions → `router.push()`, status updates → `shipmentsService.updateStatus()`, print actions → label print flow. Triggered by `@execute-task-action` from `<DashboardTodayTasks>`. **First** inspect `<DashboardTodayTasks>` component to determine all action type variants and payload shapes.

### AdminView.vue

- [x] **`processAccountCredit`** (`src/views/AdminView.vue:85`) — Call `await transactionsService.addCredit(selectedUserForCharge.value.organization_id, currentUser.id, _data.amount, _data.purchasedDelivered, _data.purchasedReturned, _data.paymentMethod, _data.note)` using service at `src/services/transactions.ts:49` (invokes `process-recharge` Edge Function). On success update `adminUsers` balance, append to `adminTransactions`, call `closeChargeModal()`. Triggered by `@credit` from `<ChargeAccountModal>`.
- [x] **`processAccountCharge`** (`src/views/AdminView.vue:86`) — **Prereq: create `transactionsService.addDebit()`** (see below). Call with `selectedUserForCharge.value.organization_id`, `_data` fields. Update `adminUsers` balance, append to `adminTransactions`, call `closeChargeModal()`. Triggered by `@debit` from `<ChargeAccountModal>`.

### ReturnsView.vue

- [x] **`syncReturns`** (`src/views/ReturnsView.vue:67`) — Set `isSyncingReturns.value = true`, fetch via `shipmentsService.getAll(orgId, { status: 'returned' })`, populate `filteredReturns.value` with mapped results, recalculate `activeReturnsStats.value` (total, active, recovered, lost), populate `returnCarriers.value` with distinct carriers, set `isSyncingReturns.value = false`. Triggered by `@sync-returns` from `<ReturnsList>`. May need a returns-specific mapper.

### FinanceView.vue

- [x] **`toggleReceivedPaymentExpanded`** (`src/views/FinanceView.vue:163`) — Find payment in `filteredReceivedPayments.value` by `_paymentId`, toggle its `expanded` boolean. If expanding and details not loaded, lazy-load via `await carrierPaymentsService.getShipments(_paymentId)` (exists at `src/services/carrierPayments.ts:18`). Triggered by `@toggle-expanded` from `<ReceivedPayments>`.
- [x] **`confirmMatchedPayment`** (`src/views/FinanceView.vue:155`) — Call `await carrierPaymentsService.updateStatus(_payment.id, 'confirmed')` (exists at `src/services/carrierPayments.ts:31`), remove from `matchingResults.value`, update `matchingStats.value` counts, update payment status in `manifestByCarrier`. Triggered by `@confirm-matched` from `<ExpectedPayments>`.
- [x] **`submitManualPayment`** (`src/views/FinanceView.vue:154`) — Validate `manualPaymentData` (carrier, amount, reference, date). **Prereq: may need `carrierPaymentsService.create()`** if recording a new payment, or use `carrierPaymentsService.updateStatus()` to mark existing manifest as paid. Update `filteredManifestByCarrier`, `manifestStats`, reset `manualPaymentData`. Triggered by `@submit-manual-payment` from `<ExpectedPayments>`.
- [x] **`handleBankFileUpload`** (`src/views/FinanceView.vue:152`) — **Prereq: bank file parsing utility** (see below). Accept file from `<ExpectedPayments @bank-file-upload>`, parse CSV/Excel, store in `bankTransactionsFile.value`, populate `bankTransactions.value` with parsed rows (amount, reference, date, description). Client-side only, no backend call.
- [x] **`runAutoMatching`** (`src/views/FinanceView.vue:153`) — Iterate `bankTransactions.value`, compare against `manifestByCarrier.value` by reference number and/or amount (with tolerance for fuzzy matching). Populate `matchingResults.value` with match objects, update `matchingStats.value` `{ matched, unmatched, total }`. Triggered by `@run-auto-matching` from `<ExpectedPayments>`. Client-side algorithm, no backend call.

### AnalyticsView.vue

- [x] **Populate `analyticsKpis` / `analyticsKpiComparison`** (`src/views/AnalyticsView.vue:91-106`) — Compute KPI metrics (delivery rate, revenue, avg delivery time, return rate) from `appStore.shipments`. Compare with previous period.
- [x] **Populate `chartData` / `chartLabels`** (`src/views/AnalyticsView.vue:107-108`) — Build time-series chart data from shipments grouped by day/week/month.
- [x] **Populate `deliveryPerformance`** (`src/views/AnalyticsView.vue:111-115`) — Compute delivery metrics by carrier, by region, and by day of week.
- [x] **Populate `returnIntelligence`** (`src/views/AnalyticsView.vue:118-122`) — Analyze return reasons, return rates by region/carrier/client.
- [x] **Populate `riskZones`** (`src/views/AnalyticsView.vue:125`) — Identify gouvernorats with high return/delay rates.
- [x] **Populate `anomalyDetection`** (`src/views/AnalyticsView.vue:128-131`) — Detect unusual spikes in returns, delays, or costs.
- [x] **Populate `trends`** (`src/views/AnalyticsView.vue:135-139`) — Compute trend data over configurable periods.
- [x] **Populate `reports`** (`src/views/AnalyticsView.vue:142`) — List generated/saved reports.

### Empty Refs to Populate

- [x] **DashboardView** — `urgentActions`, `filteredTaskCategories`, `delayedShipments`, `delayedPatterns`, `returnAlerts`, `activityLogs` — Should be computed from `appStore.shipments` and related data.
- [x] **FinanceView** — `carriersList`, `filteredReceivedPayments`, `filteredInvoices`, `recentExports` — Should be populated from `appStore.carriers`, `appStore.payments`, `appStore.invoices`.
- [x] **ReturnsView** — `filteredReturns`, `returnCarriers`, `returnsData`, `carriersReturnStats`, `reportAnalytics` — Should be computed from returned shipments.
- [x] **SettingsView** — `paymentHistoryData`, `availableCarriers`, `gouvernorats` — `availableCarriers` from `deliveryCarriers` catalog, `gouvernorats` from `zones-first` data, `paymentHistoryData` from transactions.
- [x] **AdminView** — `adminUsers`, `adminTransactions` — Should be fetched via admin-specific service calls (all orgs).

### Service/Utility Prerequisites

- [x] **Create `transactionsService.addDebit()`** in `src/services/transactions.ts` — Needed by `processAccountCharge`. Either create a `process-debit` Edge Function mirroring `process-recharge`, or do direct Supabase insert into `transactions` with `type: 'debit'` + atomic `organization_credits` balance update.
- [x] **Create `carrierPaymentsService.create()`** in `src/services/carrierPayments.ts` — Needed by `submitManualPayment`. Insert into `carrier_payments` table. Type: `CarrierPaymentInsert`.
- [x] **Verify `useBoutiquesData.create()` exists** in `src/composables/useBoutiquesData.ts` — Needed by `createBoutique`. If missing, add `create(data)` method calling `boutiquesService.create()` and refreshing the local list.
- [x] **Add bank file parsing utility** — Needed by `handleBankFileUpload`. Install `papaparse` (CSV) or `xlsx` (Excel), create utility in `src/utils/` that accepts a File and returns parsed rows with standardized fields (amount, reference, date, description).
