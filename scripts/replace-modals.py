import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

file_path = r'C:\Users\Super\PycharmProjects\mouraqib\src\views\DeliveryTrackerView.vue'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

print(f"Total lines before: {len(lines)}")

# The template structure:
# Lines 1-24: AppShell opening
# Lines 25-531: Feature component tags + detail panels (KEEP)
# Lines 532-538: Overlay for detail panel (KEEP)
# Lines 539: blank
# Lines 540-648: Pickup Confirm Modal (REPLACE)
# Lines 649: blank
# Lines 650-894: Add Shipment Modal (REPLACE)
# Lines 895: blank
# Lines 896-1138: Add Carrier Modal (REPLACE)
# Lines 1139: blank
# Lines 1140-1250: Print Label Modal (REPLACE)
# Lines 1251: blank
# Lines 1252-1637: Organization Modal (REPLACE)
# Lines 1638: blank
# Lines 1639-1819: Recharge Modal (REPLACE) - inside AppShell
# Line 1820: </AppShell>
# Lines 1821: blank
# Lines 1822-1980: Global Search Modal (REPLACE)
# Lines 1981: blank
# Lines 1982-2118: Bulk Import Modal (REPLACE)
# Lines 2119: blank
# Lines 2120-2288: Add Boutique Modal (REPLACE)
# Lines 2289: blank
# Lines 2290-2626: Charge Account Modal (REPLACE)
# Line 2627: </template>
# Lines 2628+: <script setup>

# Strategy: Replace lines 540-1819 (inside AppShell) with modal component tags
# Then replace lines 1822-2626 (Teleport modals) with remaining modal component tags

new_modals_inside_appshell = '''
    <!-- ============================================ -->
    <!-- Modal Components                             -->
    <!-- ============================================ -->

    <PickupConfirmModal
      :show="showPickupConfirmModal"
      :confirmed-shipments="confirmedShipments"
      :confirmed-by-carrier="confirmedByCarrier"
      @close="showPickupConfirmModal = false"
      @confirm="confirmScanPickup"
    />

    <AddShipmentModal
      :show="showAddShipmentModal"
      :clients="clients"
      :carriers="deliveryCarriers"
      @close="closeAddShipmentModal"
      @submit="addShipment"
      @open-new-client="openNewClientFromShipment"
    />

    <AddCarrierModal
      :show="showAddCarrierModal"
      :editing-carrier="editingCarrier"
      :available-carriers="deliveryCarriers"
      :governorats="governorates"
      @close="closeCarrierModal"
      @save="saveCarrier"
    />

    <PrintLabelModal
      :show="showPrintLabelModal"
      :shipment="labelToPrint"
      @close="closePrintModal"
      @print="printLabel"
    />

    <OrganizationModal
      :show="showOrganizationModal"
      @close="showOrganizationModal = false"
      @save="saveOrganization"
    />

    <RechargeModal
      :show="showRechargeModal"
      @close="showRechargeModal = false"
      @recharge="processRecharge"
    />

'''

new_modals_outside_appshell = '''
  <GlobalSearchModal
    :show="showGlobalSearch"
    :shipments="shipments"
    :clients="clients"
    @close="closeGlobalSearch"
    @select-result="(result) => { selectedShipment = result; showShipmentDetail = true; closeGlobalSearch() }"
    @navigate="(section) => { activeSection = section; closeGlobalSearch() }"
  />

  <BulkImportModal
    :show="showBulkImportModal"
    @close="showBulkImportModal = false"
    @import="processBulkImport"
  />

  <AddBoutiqueModal
    :show="showAddBoutiqueModal"
    :carriers="deliveryCarriers"
    :governorats="governorates"
    @close="showAddBoutiqueModal = false"
    @save="saveBoutique"
  />

  <ChargeAccountModal
    :show="showChargeModal"
    :user="selectedUserForCharge"
    :delivery-fees="deliveryFees"
    @close="closeChargeModal"
    @credit="processAccountCredit"
    @debit="processAccountCharge"
  />

'''

# Build new file:
# 1. Lines 1-539 (0-indexed: 0-538) - feature content + overlay
before_modals = lines[:539]

# 2. New modal tags inside AppShell
# 3. </AppShell> tag
appshell_close = '  </AppShell>\n'

# 4. New modal tags outside AppShell
# 5. </template>
template_close = '</template>\n'

# 6. Script section (line 2628+ which is 0-indexed 2627+)
script_section = lines[2627:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(before_modals)
    f.write(new_modals_inside_appshell)
    f.write(appshell_close)
    f.write('\n')
    f.write(new_modals_outside_appshell)
    f.write(template_close)
    f.write('\n')
    f.writelines(script_section)

with open(file_path, 'r', encoding='utf-8') as f:
    new_lines = f.readlines()
print(f"Total lines after: {len(new_lines)}")
