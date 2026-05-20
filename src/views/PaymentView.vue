<template>
  <q-page padding class="bg-grey-1 text-dark">

    <!-- Title -->
    <div class="row items-center q-mb-lg">
      <q-icon name="credit_card" color="primary" size="36px" class="q-mr-sm"/>
      <div class="text-h4 text-weight-bold">Payment Management</div>
    </div>

    <!-- ── Row 1: Search + Date + Status ── -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-4">
        <q-input outlined dense v-model="search" label="Search: Pay_UID, Customer, etc." clearable>
          <template v-slot:append><q-icon name="search"/></template>
        </q-input>
      </div>
      <div class="col-12 col-md-2">
        <q-input outlined dense type="date" v-model="startDate" label="Start Date" />
      </div>
      <div class="col-12 col-md-2">
        <q-input outlined dense type="date" v-model="endDate" label="End Date" />
      </div>
      <div class="col-12 col-md-3">
        <q-select outlined dense v-model="statusFilter"
          :options="['All','Completed','Fail','Refund']" label="Payment Status" />
      </div>
    </div>

    <!-- ── Payment Type Filter ── -->
    <div class="q-mb-md">
      <div class="text-subtitle1 text-weight-bold q-mb-sm">Payment Type Filter</div>
      <div class="row items-start q-gutter-x-xl">
        <q-checkbox v-model="ftPoint"     label="Point"     color="negative"/>
        <div>
          <q-checkbox v-model="ftAppliance" label="Appliance" color="negative"/>
          <q-expansion-item dense label="Sub-categories"
            style="border:1px solid #ccc;border-radius:4px;max-width:300px;" class="q-mt-xs">
            <q-card class="bg-grey-1">
              <q-card-section class="q-py-sm">
                <q-checkbox v-model="ftSurgSplint"      label="Surgical Splint"  color="negative" :disable="!ftAppliance"/>
                <q-checkbox v-model="ftCmdSplint"       label="CMD Splint"        color="negative" :disable="!ftAppliance"/>
                <q-checkbox v-model="ftAlignerModel"    label="Aligner Model"    color="negative" :disable="!ftAppliance"/>
                <q-checkbox v-model="ftDirectAligner"  label="Direct Aligner"  color="negative" :disable="!ftAppliance"/>
                <q-checkbox v-model="ftIdb"            label="IDB"             color="negative" :disable="!ftAppliance"/>
                <q-checkbox v-model="ftAtozGuide"      label="ATOZ Guide"      color="negative" :disable="!ftAppliance"/>
                <q-checkbox v-model="ftImplantGuide"    label="Implant Guide"   color="negative" :disable="!ftAppliance"/>
                <q-checkbox v-model="ftAtozPositioning" label="ATOZ Positioning" color="negative" :disable="!ftAppliance"/>
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </div>
        <q-checkbox v-model="ftON3D" label="ON3D" color="negative"/>
      </div>
    </div>

    <!-- ── Region Filter ── -->
    <div class="q-mb-lg">
      <div class="text-subtitle1 text-weight-bold q-mb-sm">Region Filter</div>
      <div class="row items-start q-gutter-x-xl">
        <q-checkbox v-model="frDomestic" label="Domestic" color="negative"/>
        <div>
          <q-checkbox v-model="frGlobal" label="Global" color="negative"/>
          <q-expansion-item dense label="Global Sub-categories"
            style="border:1px solid #ccc;border-radius:4px;max-width:340px;" class="q-mt-xs">
            <q-card class="bg-grey-1">
              <q-card-section class="q-py-sm">
                <q-checkbox v-model="frUS" label="US" color="negative" :disable="!frGlobal"/>
                <q-checkbox v-model="frJP" label="Japan" color="negative" :disable="!frGlobal"/>
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </div>
      </div>
    </div>

    <q-separator class="q-mb-md"/>

    <!-- ── Recent Payments header ── -->
    <div class="row items-center justify-between q-mb-sm">
      <div class="text-h6 text-weight-bold">Recent Payments</div>
      <q-btn color="positive" icon="file_download" label="Excel Download" size="sm" @click="downloadExcel" />
    </div>

    <!-- Sort + Per-page controls -->
    <div class="row q-col-gutter-md items-center q-mb-md">
      <div class="col-auto">
        <span class="text-caption text-grey-5 q-mr-xs">Sort by</span>
        <q-select outlined dense v-model="sortField"
          :options="sortOptions" emit-value map-options style="min-width:120px; display:inline-flex"/>
      </div>
      <div class="col-auto">
        <span class="text-caption text-grey-5 q-mr-sm">Order:</span>
        <q-radio v-model="sortOrder" val="desc" label="Descending" color="negative"/>
        <q-radio v-model="sortOrder" val="asc"  label="Ascending"  color="primary" class="q-ml-sm"/>
      </div>
    </div>

    <div class="row items-center q-col-gutter-sm q-mb-md">
      <div class="col-auto text-caption text-grey-5">Display</div>
      <div class="col-auto">
        <q-select outlined dense v-model="perPage" :options="[5,10,15,25]"
          style="min-width:80px"/>
      </div>
      <div class="col-auto text-caption text-grey-5">records / page</div>
      <div class="col-auto text-caption text-grey-5 q-ml-auto">
        {{ filteredPayments.length }} records in {{ totalPages }} pages
      </div>
      <div class="col-auto row items-center q-gutter-xs">
        <q-btn flat dense round icon="chevron_left"  @click="prevPage" :disable="currentPage<=1"/>
        <q-input outlined dense v-model.number="currentPage" type="number" style="width:60px" :min="1" :max="totalPages"/>
        <q-btn flat dense round icon="chevron_right" @click="nextPage" :disable="currentPage>=totalPages"/>
      </div>
    </div>

    <!-- ── Table ── -->
    <q-table flat bordered :rows="pagedPayments" :columns="columns" row-key="payUid"
      :pagination="{ rowsPerPage: 0 }" hide-pagination class="bg-white">

      <template v-slot:body-cell-payUid="props">
        <q-td :props="props">
          <q-btn flat no-caps dense color="primary" :label="props.row.payUid"
            @click="$router.push(`/payment/${props.row.payUid}`)"/>
        </q-td>
      </template>

      <template v-slot:body-cell-customer="props">
        <q-td :props="props">
          <q-btn flat no-caps dense color="primary" :label="props.row.customer"
            @click="goToUser(props.row.customer)"/>
        </q-td>
      </template>

      <template v-slot:body-cell-region="props">
        <q-td :props="props">
          <span :class="props.row.region === 'Domestic' ? 'text-negative' : 'text-primary'">
            {{ props.row.region }}
          </span>
        </q-td>
      </template>

      <template v-slot:body-cell-prodUid="props">
        <q-td :props="props">
          <q-btn flat no-caps dense color="primary" :label="props.row.prodUid"
            @click="$router.push(`/subscription/${props.row.prodUid}`)"/>
        </q-td>
      </template>

      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-badge :color="statusColor(props.row.status)" rounded/>
          <span class="q-ml-xs" :class="statusTextClass(props.row.status)">
            {{ props.row.status }}
          </span>
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore } from '../stores/data'

const router = useRouter()
const store = useDataStore()

// ── Filters ──────────────────────────────────────────────────
const search      = ref('')
const startDate   = ref('2026-04-20')
const endDate     = ref('2026-05-19')
const statusFilter = ref('All')
const ftPoint     = ref(true)
const ftAppliance = ref(true)

const ftSurgSplint      = ref(false)
const ftCmdSplint       = ref(false)
const ftAlignerModel    = ref(false)
const ftDirectAligner  = ref(false)
const ftIdb            = ref(false)
const ftAtozGuide      = ref(false)
const ftImplantGuide    = ref(false)
const ftAtozPositioning = ref(false)

const ftON3D      = ref(true)
const frDomestic  = ref(true)
const frGlobal    = ref(true)
const frUS        = ref(false)
const frJP        = ref(false)

// ── Sort + Pagination ─────────────────────────────────────────
const sortField   = ref('date')
const sortOrder   = ref('desc')
const perPage     = ref(5)
const currentPage = ref(1)

const sortOptions = [
  { label: 'Date',   value: 'date'   },
  { label: 'Amount', value: 'amount' },
  { label: 'Status', value: 'status' },
]

// ── Columns ───────────────────────────────────────────────────
const columns = [
  { name: 'payUid',   label: 'Pay_UID',      field: 'payUid',   align: 'left' },
  { name: 'date',     label: 'Date',         field: 'date',     align: 'left' },
  { name: 'customer', label: 'Customer',     field: 'customer', align: 'left' },
  { name: 'region',   label: 'Region',       field: 'region',   align: 'left' },
  { name: 'payType',  label: 'Payment Type', field: 'payType',  align: 'left' },
  { name: 'prodUid',  label: 'Product UID',  field: 'prodUid',  align: 'left' },
  { name: 'amount',   label: 'Amount',       field: 'amount',   align: 'right', format: v => `$ ${v}` },
  { name: 'cardNum',  label: 'Card Number',  field: 'cardNum',  align: 'left' },
  { name: 'status',   label: 'Status',       field: 'status',   align: 'center' },
]

// ── Filtering Logic ───────────────────────────────────────────
const filteredPayments = computed(() => {
  return store.payments.filter(p => {
    // Text search
    if (search.value) {
      const q = search.value.toLowerCase()
      const match = [p.payUid, p.customer, p.prodUid].some(v => v.toLowerCase().includes(q))
      if (!match) return false
    }
    // Date range
    if (p.date < startDate.value || p.date > endDate.value + ' 23:59') return false
    // Status
    if (statusFilter.value !== 'All' && p.status !== statusFilter.value) return false
    
    // Payment type
    const anySubApp = ftSurgSplint.value || ftCmdSplint.value || ftAlignerModel.value || ftDirectAligner.value || ftIdb.value || ftAtozGuide.value || ftImplantGuide.value || ftAtozPositioning.value
    
    const typeOk = (ftPoint.value && p.payType.includes('Point')) ||
                   (ftON3D.value && p.payType.includes('ON3D')) ||
                   (ftAppliance.value && (
                     !anySubApp
                       ? p.payType.includes('Appliance')
                       : (
                           (ftSurgSplint.value && p.payType.includes('Surgical Splint')) ||
                           (ftCmdSplint.value && p.payType.includes('CMD Splint')) ||
                           (ftAlignerModel.value && p.payType.includes('Aligner Model')) ||
                           (ftDirectAligner.value && p.payType.includes('Direct Aligner')) ||
                           (ftIdb.value && p.payType.includes('IDB')) ||
                           (ftAtozGuide.value && p.payType.includes('ATOZ Guide')) ||
                           (ftImplantGuide.value && p.payType.includes('Implant Guide')) ||
                           (ftAtozPositioning.value && p.payType.includes('ATOZ Positioning'))
                         )
                   ))
    if (!typeOk) return false
    
    // Region
    const anySubPay = frUS.value || frJP.value
    const regionOk = (frDomestic.value && p.region === 'Domestic') ||
                     (frGlobal.value && (
                       !anySubPay
                         ? p.region.startsWith('Global')
                         : (frUS.value && p.region === 'Global - US') ||
                           (frJP.value && p.region === 'Global - JP')
                     ))
    if (!regionOk) return false
    return true
  }).sort((a, b) => {
    let va = a[sortField.value], vb = b[sortField.value]
    if (sortOrder.value === 'asc') return va > vb ? 1 : -1
    return va < vb ? 1 : -1
  })
})

const totalPages = computed(() => Math.ceil(filteredPayments.value.length / perPage.value) || 1)
const pagedPayments = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filteredPayments.value.slice(start, start + perPage.value)
})

// Reset to page 1 on filter or perPage changes to prevent empty page bugs
watch([search, startDate, endDate, statusFilter, ftPoint, ftAppliance, ftSurgSplint, ftCmdSplint, ftAlignerModel, ftDirectAligner, ftIdb, ftAtozGuide, ftImplantGuide, ftAtozPositioning, ftON3D, frDomestic, frGlobal, frUS, frJP, sortField, sortOrder, perPage], () => {
  currentPage.value = 1
})

function prevPage() { if (currentPage.value > 1) currentPage.value-- }
function nextPage() { if (currentPage.value < totalPages.value) currentPage.value++ }

function goToUser(name) {
  const user = store.users.find(u => u.name === name)
  router.push(`/user/${user ? user.email : 'unknown'}`)
}

function statusColor(status) {
  return { Completed: 'positive', Fail: 'negative', Refund: 'warning' }[status] || 'grey'
}

function statusTextClass(status) {
  return { Completed: 'text-positive', Fail: 'text-negative', Refund: 'text-warning' }[status] || ''
}

function downloadExcel() {
  const rows = filteredPayments.value
  const header = columns.map(c => c.label).join(',')
  const body = rows.map(r => columns.map(c => r[c.field]).join(',')).join('\n')
  const blob = new Blob([header + '\n' + body], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = 'payments.csv'; a.click()
}
</script>
