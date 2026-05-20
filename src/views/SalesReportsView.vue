<template>
  <q-page padding class="bg-grey-1 text-dark">
    <!-- Title -->
    <div class="row items-center q-mb-lg">
      <q-icon name="bar_chart" color="primary" size="40px" class="q-mr-sm" />
      <div class="text-h4 text-weight-bold">Sales Reports</div>
    </div>

    <!-- ─── Row 1: Filters ─── -->
    <div class="row items-center q-col-gutter-md q-mb-md">
      <div class="col-auto row items-center">
        <span class="text-subtitle1 text-weight-bold q-mr-sm">Display Unit:</span>
        <q-select outlined dense v-model="displayUnit" :options="displayUnitOptions" style="min-width: 150px;" />
      </div>
    </div>

    <!-- Region Filter -->
    <div class="q-mb-md">
      <div class="text-subtitle1 text-weight-bold q-mb-xs">Region Filter</div>
      <div class="row items-start q-gutter-x-xl">
        <q-checkbox v-model="frDomestic" label="Domestic" color="negative" />
        <div>
          <q-checkbox v-model="frGlobal" label="Global" color="negative" />
          <q-expansion-item dense label="Global Sub-categories"
            style="border: 1px solid #ccc; border-radius: 4px; min-width: 280px;" class="q-mt-xs">
            <q-card class="bg-grey-1">
              <q-card-section class="q-py-sm">
                <q-checkbox v-model="frUS" label="US" color="negative" :disable="!frGlobal" />
                <q-checkbox v-model="frJP" label="Japan" color="negative" :disable="!frGlobal" />
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </div>
      </div>
    </div>

    <q-separator class="q-my-lg" />

    <!-- ─── Row 2: Statistics ─── -->
    <div class="row q-col-gutter-lg q-mb-lg">
      <!-- Total Sales Amount -->
      <div class="col-12 col-md-3">
        <q-card flat bordered class="bg-white text-center q-pa-md fit justify-center items-center flex column" style="min-height: 180px;">
          <div class="text-subtitle2 text-grey-6 text-weight-bold">Total Sales Amount ($)</div>
          <div class="text-h3 text-weight-bolder q-mt-md text-primary">$ {{ totalSalesAmount.toLocaleString() }}</div>
        </q-card>
      </div>

      <!-- Statistics Tables -->
      <div class="col-12 col-md-9 q-gutter-y-md">
        <!-- ON3D search results statistics -->
        <q-card flat bordered class="bg-white q-pa-sm">
          <div class="text-subtitle1 text-weight-bold q-px-sm q-pb-xs">ON3D search results statistics</div>
          <q-markup-table flat dense separator="horizontal">
            <thead>
              <tr class="bg-grey-2">
                <th class="text-left text-weight-bold text-dark">Platform</th>
                <th class="text-left text-weight-bold text-dark">Surgery</th>
                <th class="text-left text-weight-bold text-dark">Orthodontics</th>
                <th class="text-right text-weight-bold text-dark">Sales amount ($)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{{ on3dStats.platform }}</td>
                <td>{{ on3dStats.surgery }}</td>
                <td>{{ on3dStats.orthodontics }}</td>
                <td class="text-right text-weight-bold text-primary">$ {{ on3dStats.salesAmount.toLocaleString() }}</td>
              </tr>
            </tbody>
          </q-markup-table>
        </q-card>

        <!-- Appliance search results statistics -->
        <q-card flat bordered class="bg-white q-pa-sm">
          <div class="text-subtitle1 text-weight-bold q-px-sm q-pb-xs">Appliance search results statistics</div>
          <div class="scroll" style="max-width: 100%;">
            <q-markup-table flat dense separator="horizontal" style="min-width: 900px;">
              <thead>
                <tr class="bg-grey-2">
                  <th v-for="app in appliancesList" :key="app" class="text-left text-weight-bold text-dark">{{ app }}</th>
                  <th class="text-right text-weight-bold text-dark">Sales amount ($)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td v-for="app in appliancesList" :key="app">{{ applianceStats[app] || 0 }}</td>
                  <td class="text-right text-weight-bold text-primary">$ {{ applianceStats.salesAmount.toLocaleString() }}</td>
                </tr>
              </tbody>
            </q-markup-table>
          </div>
        </q-card>
      </div>
    </div>

    <q-separator class="q-my-lg" />

    <!-- ─── Row 3: Sort Controls ─── -->
    <div class="row q-col-gutter-md items-center q-mb-md">
      <div class="col-auto">
        <span class="text-caption text-grey-7 q-mr-xs text-weight-bold">Sort By</span>
        <q-select outlined dense v-model="sortField" :options="sortOptions" emit-value map-options style="min-width: 150px; display: inline-flex;" />
      </div>
      <div class="col-auto">
        <span class="text-caption text-grey-7 q-mr-sm text-weight-bold">Order</span>
        <q-radio v-model="sortOrder" val="desc" label="Descending" color="negative" />
        <q-radio v-model="sortOrder" val="asc" label="Ascending" color="primary" class="q-ml-sm" />
      </div>
    </div>

    <!-- Tip -->
    <div class="text-caption text-grey-7 q-mb-md">
      💡 Tip: Click <strong>Pay_UID</strong> to view payment details · Click <strong>UserName</strong> to view user details · Click <strong>Prod_UID</strong> to view product details.
    </div>

    <!-- Pagination & Record count controls -->
    <div class="row items-center q-col-gutter-sm q-mb-md">
      <div class="col-auto text-caption text-grey-7">Display</div>
      <div class="col-auto">
        <q-select outlined dense v-model="perPage" :options="[5,10,15,25]" style="min-width:80px"/>
      </div>
      <div class="col-auto text-caption text-grey-7">records / page</div>
      <div class="col-auto text-caption text-grey-7 q-ml-auto">
        {{ filteredPayments.length }} records in {{ totalPages }} pages
      </div>
      <div class="col-auto row items-center q-gutter-xs">
        <q-btn flat dense round icon="chevron_left" :disable="currentPage<=1" @click="currentPage > 1 && currentPage--"/>
        <q-input outlined dense v-model.number="currentPage" type="number" style="width:60px" :min="1" :max="totalPages"/>
        <q-btn flat dense round icon="chevron_right" :disable="currentPage>=totalPages" @click="currentPage < totalPages && currentPage++"/>
      </div>
    </div>

    <!-- Table -->
    <q-table flat bordered :rows="pagedPayments" :columns="columns" row-key="payUid" :pagination="{ rowsPerPage: 0 }" hide-pagination class="bg-white q-mb-lg">
      <!-- Pay_UID: clickable link -->
      <template v-slot:body-cell-payUid="props">
        <q-td :props="props">
          <q-btn flat no-caps dense color="primary" :label="props.row.payUid"
            @click="$router.push(`/payment/${props.row.payUid}`)"/>
        </q-td>
      </template>

      <!-- UserName: clickable link -->
      <template v-slot:body-cell-customer="props">
        <q-td :props="props">
          <q-btn flat no-caps dense color="primary" :label="props.row.customer"
            @click="goToUser(props.row.customer)"/>
        </q-td>
      </template>

      <!-- Region: color-coded -->
      <template v-slot:body-cell-region="props">
        <q-td :props="props">
          <span :class="props.row.region === 'Domestic' ? 'text-negative' : 'text-primary'">
            {{ props.row.region }}
          </span>
        </q-td>
      </template>

      <!-- Prod_UID: clickable link -->
      <template v-slot:body-cell-prodUid="props">
        <q-td :props="props">
          <q-btn flat no-caps dense color="primary" :label="props.row.prodUid"
            @click="$router.push(`/subscription/${props.row.prodUid}`)"/>
        </q-td>
      </template>

      <!-- Price -->
      <template v-slot:body-cell-amount="props">
        <q-td :props="props" class="text-right">
          $ {{ props.row.amount }}
        </q-td>
      </template>
    </q-table>

    <!-- Bottom Action Button -->
    <div class="row q-mb-xl">
      <q-btn color="grey-9" text-color="white" label="Editing Mall Report and Download Total Report"
        class="full-width text-weight-bold" size="lg" unelevated @click="downloadTotalReport" />
    </div>

  </q-page>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore } from '../stores/data'
import { useQuasar } from 'quasar'

const router = useRouter()
const store  = useDataStore()
const $q     = useQuasar()

// ─── Filters ───
const displayUnit = ref('All')
const displayUnitOptions = ['All', 'ON3D Purchase', 'Point Purchase', 'Appliance']

const frDomestic = ref(true)
const frGlobal   = ref(true)
const frUS       = ref(false)
const frJP       = ref(false)

// ─── Sort / Pagination ───
const sortField   = ref('payUid')
const sortOrder   = ref('desc')
const perPage     = ref(5)
const currentPage = ref(1)

const sortOptions = [
  { label: 'Pay_UID',       value: 'payUid' },
  { label: 'UserName',      value: 'customer' },
  { label: 'Region',        value: 'region' },
  { label: 'Purchase Type', value: 'payType' },
  { label: 'Payment time',  value: 'date' },
  { label: 'Purchase Time', value: 'purchaseTime' },
  { label: 'Prod_UID',      value: 'prodUid' },
  { label: 'Price ($)',     value: 'amount' },
]

// ─── Table Columns ───
const columns = [
  { name: 'payUid',       label: 'Pay_UID',       field: 'payUid',       align: 'left' },
  { name: 'customer',     label: 'UserName',      field: 'customer',     align: 'left' },
  { name: 'region',       label: 'Region',        field: 'region',       align: 'left' },
  { name: 'payType',      label: 'Purchase Type', field: 'payType',      align: 'left' },
  { name: 'date',         label: 'Payment time',  field: 'date',         align: 'left' },
  { name: 'purchaseTime', label: 'Purchase Time', field: 'purchaseTime', align: 'left' },
  { name: 'prodUid',      label: 'Prod_UID',      field: 'prodUid',      align: 'left' },
  { name: 'amount',       label: 'Price ( $ )',   field: 'amount',       align: 'right' },
]

// ─── Appliance categories list ───
const appliancesList = [
  'Surgical Splint',
  'CMD Splint',
  'Aligner Model',
  'Direct Aligner',
  'IDB',
  'ATOZ Guide',
  'Implant Guide',
  'ATOZ Positioning'
]

// ─── Filtering payments ───
const filteredPayments = computed(() => {
  return store.payments.filter(p => {
    // 1. Display Unit / Purchase Type Filter
    if (displayUnit.value !== 'All') {
      if (displayUnit.value === 'Appliance') {
        if (!p.payType.startsWith('Appliance')) return false
      } else {
        if (p.payType !== displayUnit.value) return false
      }
    }

    // 2. Region Filter
    const anySub = frUS.value || frJP.value
    const regionOk = (frDomestic.value && p.region === 'Domestic') ||
                     (frGlobal.value && (
                       !anySub
                         ? p.region.startsWith('Global')
                         : (frUS.value && p.region === 'Global - US') ||
                           (frJP.value && p.region === 'Global - JP')
                     ))
    if (!regionOk) return false

    return true
  }).map(p => {
    // Look up corresponding product to get its purchaseTime
    const prod = store.products.find(pr => pr.uid === p.prodUid)
    return {
      ...p,
      purchaseTime: prod ? prod.purchaseTime : p.date
    }
  }).sort((a, b) => {
    let va = a[sortField.value], vb = b[sortField.value]
    if (sortField.value === 'amount') {
      return sortOrder.value === 'asc' ? va - vb : vb - va
    }
    va = String(va || ''); vb = String(vb || '')
    return sortOrder.value === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
  })
})

// ─── Total Sales Amount (completed transactions only) ───
const totalSalesAmount = computed(() => {
  return filteredPayments.value
    .filter(p => p.status === 'Completed')
    .reduce((sum, p) => sum + p.amount, 0)
})

// ─── ON3D search results statistics ───
const on3dStats = computed(() => {
  const stats = { platform: 0, surgery: 0, orthodontics: 0, salesAmount: 0 }
  
  filteredPayments.value.forEach(p => {
    if (p.status !== 'Completed') return
    // Check if it's ON3D Purchase or Point Purchase
    if (p.payType === 'ON3D Purchase' || p.payType === 'Point Purchase') {
      stats.salesAmount += p.amount
      
      // Check related product type
      const prod = store.products.find(pr => pr.uid === p.prodUid)
      if (prod) {
        const typeLower = prod.type.toLowerCase()
        if (typeLower.includes('platform')) stats.platform++
        if (typeLower.includes('surgery')) stats.surgery++
        if (typeLower.includes('orthodontics')) stats.orthodontics++
      }
    }
  })
  
  return stats
})

// ─── Appliance search results statistics ───
const applianceStats = computed(() => {
  const stats = { salesAmount: 0 }
  appliancesList.forEach(app => { stats[app] = 0 })

  filteredPayments.value.forEach(p => {
    if (p.status !== 'Completed') return
    if (p.payType.startsWith('Appliance')) {
      stats.salesAmount += p.amount
      
      // Determine which appliance it is
      const matchedApp = appliancesList.find(app => p.payType.includes(app))
      if (matchedApp) {
        stats[matchedApp]++
      }
    }
  })
  
  return stats
})

// ─── Pagination ───
const totalPages = computed(() => Math.ceil(filteredPayments.value.length / perPage.value) || 1)
const pagedPayments = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filteredPayments.value.slice(start, start + perPage.value)
})

// Reset to page 1 on filter changes
watch([displayUnit, frDomestic, frGlobal, frUS, frJP, sortField, sortOrder, perPage], () => {
  currentPage.value = 1
})

function goToUser(name) {
  const user = store.users.find(u => u.name === name)
  router.push(`/user/${user ? user.email : 'unknown'}`)
}

function downloadTotalReport() {
  const header = columns.map(c => c.label).join(',')
  const rows = filteredPayments.value.map(p => 
    columns.map(c => {
      let val = p[c.field]
      if (c.field === 'amount') val = `$ ${val}`
      return `"${String(val).replace(/"/g, '""')}"`
    }).join(',')
  ).join('\n')

  const csvContent = header + '\n' + rows
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', 'Sales_Report.csv')
  link.click()

  $q.notify({
    type: 'positive',
    message: 'Sales Report downloaded successfully!',
    position: 'top'
  })
}
</script>

<style scoped>
.text-underline {
  text-decoration: underline;
}
.scroll::-webkit-scrollbar {
  height: 6px;
}
.scroll::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}
</style>
