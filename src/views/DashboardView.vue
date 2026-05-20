<template>
  <q-page padding class="bg-grey-1 text-dark">
    <div class="row items-center q-mb-xl">
      <q-icon name="bar_chart" color="primary" size="40px" class="q-mr-sm" />
      <div class="text-h3 text-weight-bold">Dashboard</div>
    </div>

    <!-- ─── Filters ─── -->
    <div class="row q-col-gutter-xl q-mb-lg">
      <div class="col-12 col-md-4">
        <div class="text-caption text-grey-5 q-mb-xs">Choose Date Range</div>
        <q-input outlined dense readonly
          :model-value="dateRangeLabel"
          placeholder="YYYY/MM/DD – YYYY/MM/DD"
          clearable @clear="clearDateRange">
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date v-model="dateRange" range mask="YYYY/MM/DD"
                  color="primary" today-btn>
                  <div class="row items-center justify-end q-pa-sm">
                    <div class="col-12 q-mb-sm">
                      <div class="text-caption text-grey-7 q-mb-xs">Choose a preset</div>
                      <q-select outlined dense v-model="datePreset"
                        :options="dateOptions" emit-value map-options
                        @update:model-value="applyDatePreset"/>
                    </div>
                    <q-btn flat label="Close" color="primary" v-close-popup/>
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>

      <div class="col-12 col-md-8">
        <div class="text-caption text-grey-5 q-mb-xs">Region Filter</div>
        <div class="row items-start q-gutter-x-xl">
          <q-checkbox v-model="regionDomestic" label="Domestic" color="negative" />
          <div>
            <q-checkbox v-model="regionGlobal" label="Global" color="negative" />
            <q-expansion-item dense expand-separator label="Global Sub-categories"
              class="q-mt-xs" style="border: 1px solid #ccc; border-radius: 4px; max-width: 260px;">
              <q-card class="bg-grey-1">
                <q-card-section class="q-py-sm">
                  <q-checkbox v-model="regionUS" label="US" color="negative"
                    :disable="!regionGlobal" />
                  <q-checkbox v-model="regionJP" label="Japan" color="negative"
                    :disable="!regionGlobal" />
                </q-card-section>
              </q-card>
            </q-expansion-item>
          </div>
        </div>
      </div>
    </div>

    <q-separator class="q-mb-xl" />

    <!-- ─── Summary Metrics ─── -->
    <div class="text-h5 text-weight-bold q-mb-lg">Summary Metrics</div>
    <div class="row q-col-gutter-xl q-mb-xl">
      <div class="col-12 col-md-4">
        <div class="text-caption text-grey-5">Total Sales Amount</div>
        <div class="text-h4 q-mt-sm">
          <span v-if="metrics.salesKRW">{{ metrics.salesKRW }}</span>
          <span v-if="metrics.salesKRW && metrics.salesUSD"> + </span>
          <span v-if="metrics.salesUSD">{{ metrics.salesUSD }}</span>
          <span v-if="!metrics.salesKRW && !metrics.salesUSD">$ 0</span>
        </div>
        <div :class="metrics.salesGrowth >= 0 ? 'text-positive' : 'text-negative'" class="q-mt-xs text-subtitle2">
          <q-icon :name="metrics.salesGrowth >= 0 ? 'arrow_upward' : 'arrow_downward'" />
          {{ Math.abs(metrics.salesGrowth) }}% (YoY)
        </div>
      </div>
      <div class="col-12 col-md-4">
        <div class="text-caption text-grey-5">New Orders</div>
        <div class="text-h4 q-mt-sm">{{ metrics.newOrders }}</div>
        <div :class="metrics.orderGrowth >= 0 ? 'text-positive' : 'text-negative'" class="q-mt-xs text-subtitle2">
          <q-icon :name="metrics.orderGrowth >= 0 ? 'arrow_upward' : 'arrow_downward'" />
          {{ metrics.orderGrowth >= 0 ? '+' : '' }}{{ metrics.orderGrowth }}%
        </div>
      </div>
      <div class="col-12 col-md-4">
        <div class="text-caption text-grey-5">Visitors</div>
        <div class="text-h4 q-mt-sm">{{ metrics.visitors.toLocaleString() }}</div>
        <div :class="metrics.visitorGrowth >= 0 ? 'text-positive' : 'text-negative'" class="q-mt-xs text-subtitle2">
          <q-icon :name="metrics.visitorGrowth >= 0 ? 'arrow_upward' : 'arrow_downward'" />
          {{ metrics.visitorGrowth >= 0 ? '+' : '' }}{{ metrics.visitorGrowth }}%
        </div>
      </div>
    </div>

    <q-separator class="q-mb-xl" />

    <!-- ─── Sales Trend Chart ─── -->
    <div class="q-mb-xl">
      <div class="text-h5 text-weight-bold q-mb-xs">Sales Trend ({{ dateRangeLabel }})</div>
      <div class="text-subtitle2 text-weight-bold q-mb-md text-grey-7">{{ regionLabel }}</div>
      <apexchart type="bar" height="280" :options="chartOptions" :series="chartSeries" :key="chartKey" />
    </div>

    <q-separator class="q-mb-xl" />

    <!-- ─── Subscription Products ─── -->
    <div class="q-mb-xl">
      <div class="text-h5 text-weight-bold q-mb-lg">Number of Subscription Products ({{ dateRangeLabel }})</div>
      <div class="row q-col-gutter-xl">
        <div v-for="item in subProducts" :key="item.label" class="col">
          <div class="text-subtitle1 text-weight-bold q-mb-xs">{{ item.label }}</div>
          <div class="text-body1">{{ item.value.toLocaleString() }}</div>
        </div>
      </div>
    </div>

    <q-separator class="q-mb-xl" />

    <!-- ─── Appliances ─── -->
    <div class="q-mb-xl">
      <div class="text-h5 text-weight-bold q-mb-lg">Numbers of Appliance ({{ dateRangeLabel }})</div>
      <div class="row q-col-gutter-md">
        <div v-for="item in appliances" :key="item.label" class="col">
          <div class="text-subtitle2 text-weight-bold q-mb-xs">{{ item.label }}</div>
          <div class="text-body2">{{ item.value.toLocaleString() }}</div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useDataStore } from '../stores/data'

const store = useDataStore()

// ── Filter State ─────────────────────────────────────────────
const dateRange = ref({ from: '2026/04/20', to: '2026/05/19' })
const datePreset = ref('last30')

const regionDomestic = ref(true)
const regionGlobal = ref(true)
const regionUS = ref(true)
const regionJP = ref(true)
const chartKey = ref(0) // force chart re-render on filter change

watch(regionGlobal, (newVal) => {
  if (newVal) {
    regionUS.value = true
    regionJP.value = true
  } else {
    regionUS.value = false
    regionJP.value = false
  }
})
watch([regionUS, regionJP], ([newUS, newJP]) => {
  if (regionGlobal.value && !newUS && !newJP) {
    regionGlobal.value = false
  }
})

const dateOptions = [
  { label: 'Last 30 Days', value: 'last30' },
  { label: 'Last 7 Days', value: 'last7' },
  { label: 'This Month', value: 'thisMonth' },
  { label: 'Last Month', value: 'lastMonth' },
]

function applyDatePreset(val) {
  if (val === 'last30') {
    dateRange.value = { from: '2026/04/20', to: '2026/05/19' }
  } else if (val === 'last7') {
    dateRange.value = { from: '2026/05/12', to: '2026/05/19' }
  } else if (val === 'thisMonth') {
    dateRange.value = { from: '2026/05/01', to: '2026/05/19' }
  } else if (val === 'lastMonth') {
    dateRange.value = { from: '2026/04/01', to: '2026/04/30' }
  }
}

function clearDateRange() {
  dateRange.value = { from: '2026/04/20', to: '2026/05/19' }
  datePreset.value = 'last30'
}

// Watch dateRange changes to unset preset if selected manually
watch(dateRange, (newVal) => {
  if (!newVal) {
    clearDateRange()
    return
  }
  // Check if current range matches any preset
  const fromStr = typeof newVal === 'string' ? newVal : newVal.from
  const toStr = typeof newVal === 'string' ? newVal : newVal.to
  
  if (fromStr === '2026/04/20' && toStr === '2026/05/19') datePreset.value = 'last30'
  else if (fromStr === '2026/05/12' && toStr === '2026/05/19') datePreset.value = 'last7'
  else if (fromStr === '2026/05/01' && toStr === '2026/05/19') datePreset.value = 'thisMonth'
  else if (fromStr === '2026/04/01' && toStr === '2026/04/30') datePreset.value = 'lastMonth'
  else datePreset.value = 'Custom'
}, { deep: true })

// Helper to convert date strings to timestamps for comparison
function parseToDate(str) {
  if (!str) return new Date()
  return new Date(str.replaceAll('/', '-'))
}

// ── Active Regions ────────────────────────────────────────────
const activeRegions = computed(() => {
  const r = []
  if (regionDomestic.value) r.push('Domestic')
  if (regionGlobal.value) {
    const anySub = regionUS.value || regionJP.value
    if (regionUS.value) r.push('Global - US')
    if (regionJP.value) r.push('Global - JP')
    if (!anySub) {
      r.push('Global - US')
      r.push('Global - JP')
    }
  }
  return r
})

// Filter payments helper
function getFilteredPaymentsForRange(fromStr, toStr) {
  return store.payments.filter(p => {
    // Region filter
    if (!activeRegions.value.includes(p.region)) return false
    
    // Date filter
    const pd = p.date.slice(0, 10).replaceAll('-', '/')
    if (fromStr && pd < fromStr) return false
    if (toStr && pd > toStr) return false
    
    return true
  })
}

// ── Metrics ───────────────────────────────────────────────────
const metrics = computed(() => {
  const range = dateRange.value
  const fromStr = typeof range === 'string' ? range : range?.from
  const toStr = typeof range === 'string' ? range : range?.to

  const currentPayments = getFilteredPaymentsForRange(fromStr, toStr)
  
  // Calculate current metrics
  let salesKRW = 0
  let salesUSD = 0
  let orders = 0
  
  currentPayments.forEach(p => {
    if (p.status !== 'Completed') return
    orders++
    if (p.region === 'Domestic') {
      salesKRW += p.amount * 1300
    } else {
      salesUSD += p.amount
    }
  })
  
  const visitors = Math.floor(orders * 22.4 + 150)

  // Compute prior period for growth calculation
  let salesGrowth = 15
  let orderGrowth = 12
  let visitorGrowth = 5
  
  if (fromStr && toStr) {
    const fromD = parseToDate(fromStr)
    const toD = parseToDate(toStr)
    const diffTime = Math.abs(toD - fromD)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    
    const priorToD = new Date(fromD)
    priorToD.setDate(priorToD.getDate() - 1)
    const priorFromD = new Date(fromD)
    priorFromD.setDate(priorFromD.getDate() - diffDays)
    
    const pad = v => String(v).padStart(2, '0')
    const fmt = d => `${d.getFullYear()}/${pad(d.getMonth()+1)}/${pad(d.getDate())}`
    
    const priorFromStr = fmt(priorFromD)
    const priorToStr = fmt(priorToD)
    
    const priorPayments = getFilteredPaymentsForRange(priorFromStr, priorToStr)
    let priorKRW = 0, priorUSD = 0, priorOrders = 0
    priorPayments.forEach(p => {
      if (p.status !== 'Completed') return
      priorOrders++
      if (p.region === 'Domestic') priorKRW += p.amount * 1300
      else priorUSD += p.amount
    })
    
    const priorVisitors = Math.floor(priorOrders * 22.4 + 150)
    
    // Growth rates
    const currentTotalUSD = (salesKRW / 1300) + salesUSD
    const priorTotalUSD = (priorKRW / 1300) + priorUSD
    
    if (priorTotalUSD > 0) salesGrowth = Math.round(((currentTotalUSD - priorTotalUSD) / priorTotalUSD) * 100)
    if (priorOrders > 0) orderGrowth = Math.round(((orders - priorOrders) / priorOrders) * 100)
    if (priorVisitors > 0) visitorGrowth = Math.round(((visitors - priorVisitors) / priorVisitors) * 100)
  }

  return {
    salesKRW: salesKRW > 0 ? '₩ ' + salesKRW.toLocaleString() : '',
    salesUSD: salesUSD > 0 ? '$ ' + salesUSD.toLocaleString() : '',
    newOrders: orders.toLocaleString(),
    visitors,
    salesGrowth,
    orderGrowth,
    visitorGrowth
  }
})

// ── Date Range Label ──────────────────────────────────────────
const dateRangeLabel = computed(() => {
  const range = dateRange.value
  const fromStr = typeof range === 'string' ? range : range?.from
  const toStr = typeof range === 'string' ? range : range?.to
  if (fromStr && toStr) return `${fromStr} ~ ${toStr}`
  return fromStr || toStr || ''
})

// ── Region Label ──────────────────────────────────────────────
const regionLabel = computed(() => {
  const parts = []
  if (regionDomestic.value) parts.push('Domestic')
  if (regionGlobal.value) {
    const anySub = regionUS.value || regionJP.value
    if (!anySub) parts.push('Global')
    else {
      if (regionUS.value) parts.push('Global - US')
      if (regionJP.value) parts.push('Global - JP')
    }
  }
  return parts.join(' + ') + ' Sales Trend'
})

// ── Chart ─────────────────────────────────────────────────────
const chartSeries = computed(() => {
  const range = dateRange.value
  const fromStr = typeof range === 'string' ? range : range?.from
  const toStr = typeof range === 'string' ? range : range?.to

  if (!fromStr || !toStr) return []

  const fromD = parseToDate(fromStr)
  const toD = parseToDate(toStr)
  
  // Calculate list of days in the range (up to 30 days max for readability)
  const daysList = []
  let curr = new Date(fromD)
  while (curr <= toD) {
    const pad = v => String(v).padStart(2, '0')
    daysList.push(`${pad(curr.getMonth()+1)}/${pad(curr.getDate())}`)
    curr.setDate(curr.getDate() + 1)
  }

  // If too many days, show last 30
  const maxDays = daysList.slice(-30)

  // Calculate sum of amount for each active region per day
  const regionsToChart = []
  if (regionDomestic.value) regionsToChart.push({ name: 'Domestic', dbRegion: 'Domestic' })
  if (regionGlobal.value) {
    const anySub = regionUS.value || regionJP.value
    if (regionUS.value || !anySub) regionsToChart.push({ name: 'US', dbRegion: 'Global - US' })
    if (regionJP.value || !anySub) regionsToChart.push({ name: 'Japan', dbRegion: 'Global - JP' })
  }

  return regionsToChart.map(reg => {
    const dataPoints = maxDays.map(dayStr => {
      // Find payments on this day
      let daySum = 0
      store.payments.forEach(p => {
        if (p.status !== 'Completed' || p.region !== reg.dbRegion) return
        const pDayStr = `${p.date.slice(5, 7)}/${p.date.slice(8, 10)}`
        if (pDayStr === dayStr) {
          daySum += p.amount
        }
      })
      return daySum
    })

    return {
      name: reg.name,
      data: dataPoints
    }
  })
})

const chartOptions = computed(() => {
  const range = dateRange.value
  const fromStr = typeof range === 'string' ? range : range?.from
  const toStr = typeof range === 'string' ? range : range?.to

  const categories = []
  if (fromStr && toStr) {
    const fromD = parseToDate(fromStr)
    const toD = parseToDate(toStr)
    let curr = new Date(fromD)
    while (curr <= toD) {
      const pad = v => String(v).padStart(2, '0')
      categories.push(`${pad(curr.getMonth()+1)}/${pad(curr.getDate())}`)
      curr.setDate(curr.getDate() + 1)
    }
  }

  const maxCategories = categories.slice(-30)

  return {
    chart: { type: 'bar', toolbar: { show: false }, background: 'transparent', stacked: false },
    theme: { mode: 'light' },
    plotOptions: { bar: { borderRadius: 2, columnWidth: '70%' } },
    dataLabels: {
      enabled: false // turned off for readability when range is large
    },
    xaxis: {
      categories: maxCategories,
      labels: { show: true, style: { colors: '#555', fontSize: '9px' } },
      axisBorder: { show: false }, axisTicks: { show: false }
    },
    yaxis: {
      labels: { formatter: (v) => '$ ' + v.toLocaleString(), style: { colors: '#555' } }
    },
    grid: { borderColor: '#ddd', strokeDashArray: 3 },
    colors: ['#1976D2', '#26A69A', '#9C27B0'],
    legend: { position: 'top', labels: { colors: '#333' } }
  }
})

// ── Subscription Products ─────────────────────────────────────
const subProducts = computed(() => {
  const range = dateRange.value
  const fromStr = typeof range === 'string' ? range : range?.from
  const toStr = typeof range === 'string' ? range : range?.to

  const totals = { Platform: 0, Surgery: 0, Orthodontics: 0 }

  store.products.forEach(p => {
    // Region match
    if (p.region === 'Domestic' && !regionDomestic.value) return
    if (p.region.startsWith('Global') && !regionGlobal.value) return
    if (p.region === 'Global - US' && regionGlobal.value && regionUS.value === false && regionJP.value === true) return
    if (p.region === 'Global - JP' && regionGlobal.value && regionJP.value === false && regionUS.value === true) return

    // Date range filter
    const pt = p.purchaseTime.slice(0, 10).replaceAll('-', '/')
    if (fromStr && pt < fromStr) return
    if (toStr && pt > toStr) return

    // Parse product type segments
    const typeLower = p.type.toLowerCase()
    if (typeLower.includes('platform')) totals.Platform++
    if (typeLower.includes('surgery')) totals.Surgery++
    if (typeLower.includes('orthodontics')) totals.Orthodontics++
  })

  return Object.entries(totals).map(([k, v]) => ({ label: k, value: v }))
})

// ── Appliances ────────────────────────────────────────────────
const appliances = computed(() => {
  const keys = ['Surgical Splint', 'CMD Splint', 'Aligner Model', 'Direct Aligner', 'IDB', 'ATOZ Guide', 'Implant Guide', 'ATOZ Positioning']
  const totals = Object.fromEntries(keys.map(k => [k, 0]))

  const range = dateRange.value
  const fromStr = typeof range === 'string' ? range : range?.from
  const toStr = typeof range === 'string' ? range : range?.to

  store.payments.forEach(p => {
    if (p.status !== 'Completed') return
    // Region filter
    if (p.region === 'Domestic' && !regionDomestic.value) return
    if (p.region.startsWith('Global') && !regionGlobal.value) return
    if (p.region === 'Global - US' && regionGlobal.value && regionUS.value === false && regionJP.value === true) return
    if (p.region === 'Global - JP' && regionGlobal.value && regionJP.value === false && regionUS.value === true) return

    // Date filter
    const pd = p.date.slice(0, 10).replaceAll('-', '/')
    if (fromStr && pd < fromStr) return
    if (toStr && pd > toStr) return

    // Check appliance type matching
    if (p.payType.startsWith('Appliance')) {
      const matchedKey = keys.find(k => p.payType.includes(k))
      if (matchedKey) totals[matchedKey]++
    }
  })

  return keys.map(k => ({ label: k, value: totals[k] }))
})

// ── Force chart redraw on filter change ──────────────────────
watch([dateRange, regionDomestic, regionGlobal, regionUS, regionJP], () => {
  chartKey.value++
}, { deep: true })
</script>
