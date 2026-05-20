<template>
  <q-page padding class="bg-grey-1 text-dark">

    <!-- Title -->
    <div class="row items-center q-mb-lg">
      <q-icon name="inventory_2" color="orange" size="36px" class="q-mr-sm"/>
      <div class="text-h4 text-weight-bold">Subscription &amp; Publish Management</div>
    </div>

    <!-- Tabs -->
    <q-tabs v-model="tab" dense align="left"
      active-color="negative" indicator-color="negative"
      class="text-grey q-mb-md" no-caps>
      <q-tab name="sub" label="Subscription List" />
      <q-tab name="pub" label="Publish" />
    </q-tabs>
    <q-separator class="q-mb-md"/>

    <!-- ══════════════════════════════════
         TAB: SUBSCRIPTION LIST
    ══════════════════════════════════ -->
    <div v-if="tab === 'sub'">
      <div class="text-h5 text-weight-bold q-mb-md">
        <q-icon name="inventory_2" color="orange" class="q-mr-xs"/> Subscription List
      </div>

      <!-- Row 1: Search + Status dropdowns -->
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-md-5">
          <q-input outlined dense v-model="search"
            label="Search (Prod_UID, Customer, etc.)" clearable>
            <template v-slot:append><q-icon name="search"/></template>
          </q-input>
        </div>
        <div class="col-12 col-md-2">
          <q-select outlined dense v-model="fAvailable"
            :options="['All','Yes','No']" label="Available"/>
        </div>
        <div class="col-12 col-md-2">
          <q-select outlined dense v-model="fSubscribe"
            :options="['All','Yes','No']" label="Subscribe"/>
        </div>
        <div class="col-12 col-md-2">
          <q-select outlined dense v-model="fPublish"
            :options="['All','Yes','No']" label="Publish"/>
        </div>
      </div>

      <!-- Product Type & Date Filter -->
      <div class="q-mb-md">
        <div class="text-subtitle1 text-weight-bold q-mb-sm">Product Type &amp; Date Filter</div>
        <div class="row items-center q-col-gutter-md">
          <div class="col-auto">
            <q-checkbox v-model="fOrtho" label="Orthodontics" color="negative"/>
          </div>
          <div class="col-auto">
            <q-checkbox v-model="fSurgery" label="Surgery" color="negative"/>
          </div>

          <!-- Purchase Time Range Picker -->
          <div class="col-12 col-md-4">
            <div class="text-caption text-grey-5 q-mb-xs">Purchase Time</div>
            <q-input outlined dense readonly
              :model-value="purchaseRangeLabel"
              :placeholder="'YYYY/MM/DD \u2013 YYYY/MM/DD'"
              clearable @clear="purchaseRange = null">
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="purchaseRange" range mask="YYYY/MM/DD"
                      color="negative" today-btn>
                      <div class="row items-center justify-end q-pa-sm">
                        <div class="col-12 q-mb-sm">
                          <div class="text-caption text-grey-5 q-mb-xs">Choose a date range</div>
                          <q-select outlined dense v-model="purchasePreset"
                            :options="datePresets" emit-value map-options
                            @update:model-value="applyPurchasePreset"/>
                        </div>
                        <q-btn flat label="Close" color="primary" v-close-popup/>
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>

          <!-- Due Date Range Picker -->
          <div class="col-12 col-md-4">
            <div class="text-caption text-grey-5 q-mb-xs">Due Date</div>
            <q-input outlined dense readonly
              :model-value="dueDateRangeLabel"
              :placeholder="'YYYY/MM/DD \u2013 YYYY/MM/DD'"
              clearable @clear="dueDateRange = null">
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="dueDateRange" range mask="YYYY/MM/DD"
                      color="negative" today-btn>
                      <div class="row items-center justify-end q-pa-sm">
                        <div class="col-12 q-mb-sm">
                          <div class="text-caption text-grey-5 q-mb-xs">Choose a date range</div>
                          <q-select outlined dense v-model="dueDatePreset"
                            :options="datePresets" emit-value map-options
                            @update:model-value="applyDueDatePreset"/>
                        </div>
                        <q-btn flat label="Close" color="primary" v-close-popup/>
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
        </div>
      </div>

      <!-- Region Filter -->
      <div class="q-mb-lg">
        <div class="text-subtitle1 text-weight-bold q-mb-sm">Region Filter</div>
        <div class="row items-start q-gutter-x-xl">
          <q-checkbox v-model="frDomestic" label="Domestic" color="negative"/>
          <div>
            <q-checkbox v-model="frGlobal" label="Global" color="negative"/>
            <q-expansion-item dense label="Global Sub-categories"
              style="border:1px solid #ccc;border-radius:4px;max-width:300px;" class="q-mt-xs">
              <q-card class="bg-grey-1">
                <q-card-section class="q-py-sm">
                  <q-checkbox v-model="frUS" label="US"    color="negative" :disable="!frGlobal"/>
                  <q-checkbox v-model="frJP" label="Japan" color="negative" :disable="!frGlobal"/>
                </q-card-section>
              </q-card>
            </q-expansion-item>
          </div>
        </div>
      </div>

      <q-separator class="q-mb-md"/>

      <!-- Sort + Order -->
      <div class="text-h6 text-weight-bold q-mb-sm row items-center">
        Subscription List
        <q-icon name="help_outline" size="xs" color="grey-6" class="q-ml-xs cursor-pointer">
          <q-tooltip class="bg-dark text-white text-caption q-pa-xs" style="font-size: 12px; max-width: 320px;">
            Available check, Subscribe X 일 경우 해당 Product 는 구독이 취소된 상태지만 만료가 되지 않은 상태입니다.
          </q-tooltip>
        </q-icon>
      </div>
      <div class="row items-center q-col-gutter-md q-mb-sm">
        <div class="col-auto">
          <span class="text-caption text-grey-5 q-mr-xs">Sort By</span>
          <q-select outlined dense v-model="sortField"
            :options="sortOptions" emit-value map-options style="min-width:140px;display:inline-flex"/>
        </div>
        <div class="col-auto">
          <span class="text-caption text-grey-5 q-mr-sm">Order</span>
          <q-radio v-model="sortOrder" val="desc" label="Descending" color="negative"/>
          <q-radio v-model="sortOrder" val="asc"  label="Ascending"  color="primary" class="q-ml-sm"/>
        </div>
      </div>

      <!-- Tip -->
      <div class="text-caption text-grey-5 q-mb-md">
        💡 Tip: Click <strong>Prod_UID</strong> to view product details · Click <strong>Customer</strong> to view user details.
      </div>

      <!-- Per-page + Pagination -->
      <div class="row items-center q-col-gutter-sm q-mb-md">
        <div class="col-auto text-caption text-grey-5">Display</div>
        <div class="col-auto">
          <q-select outlined dense v-model="perPage" :options="[5,10,15,25]" style="min-width:80px"/>
        </div>
        <div class="col-auto text-caption text-grey-5">records / page</div>
        <div class="col-auto text-caption text-grey-5 q-ml-auto">
          {{ filteredSubs.length }} records in {{ totalSubPages }} pages
        </div>
        <div class="col-auto row items-center q-gutter-xs">
          <q-btn flat dense round icon="chevron_left"  @click="subPage > 1 ? subPage-- : null" :disable="subPage<=1"/>
          <q-input outlined dense v-model.number="subPage" type="number" style="width:60px" :min="1" :max="totalSubPages"/>
          <q-btn flat dense round icon="chevron_right" @click="subPage < totalSubPages ? subPage++ : null" :disable="subPage>=totalSubPages"/>
        </div>
      </div>

      <!-- Table -->
      <q-table flat bordered :rows="pagedSubs" :columns="subCols" row-key="uid"
        :pagination="{ rowsPerPage: 0 }" hide-pagination class="bg-white">

        <template v-slot:body-cell-uid="props">
          <q-td :props="props">
            <q-btn flat no-caps dense color="primary" :label="props.row.uid"
              @click="$router.push(`/subscription/${props.row.uid}`)"/>
          </q-td>
        </template>

        <template v-slot:body-cell-customer="props">
          <q-td :props="props">
            <q-btn flat no-caps dense color="primary" :label="props.row.customer"
              @click="goToUser(props.row.customer)"/>
          </q-td>
        </template>

        <template v-slot:body-cell-available="props">
          <q-td :props="props" class="text-center">
            <q-icon :name="props.row.available==='Yes' ? 'check_box' : 'close'"
              :color="props.row.available==='Yes' ? 'positive' : 'negative'" size="sm"/>
          </q-td>
        </template>
        <template v-slot:body-cell-subscribe="props">
          <q-td :props="props" class="text-center">
            <q-icon :name="props.row.subscribe==='Yes' ? 'check_box' : 'close'"
              :color="props.row.subscribe==='Yes' ? 'positive' : 'negative'" size="sm"/>
          </q-td>
        </template>
        <template v-slot:body-cell-publish="props">
          <q-td :props="props" class="text-center">
            <q-icon :name="props.row.publish==='Yes' ? 'check_box' : 'close'"
              :color="props.row.publish==='Yes' ? 'positive' : 'negative'" size="sm"/>
          </q-td>
        </template>
      </q-table>
    </div>

    <!-- ══════════════════════════════════
         TAB: PUBLISH
    ══════════════════════════════════ -->
    <div v-if="tab === 'pub'">
      <div class="text-h5 text-weight-bold q-mb-md">🚀 Publish Management</div>

      <div class="row items-center q-col-gutter-md q-mb-md">
        <div class="col-auto">
          <q-btn color="primary" icon="rocket_launch" label="Publish Product" @click="publishDialog = true"/>
        </div>
        <div class="col-12 col-md-4">
          <q-input outlined dense v-model="pubSearch"
            label="Search Published List (Prod_UID, Customer, etc.)" clearable>
            <template v-slot:append><q-icon name="search"/></template>
          </q-input>
        </div>
      </div>

      <!-- Per-page + Pagination -->
      <div class="row items-center q-col-gutter-sm q-mb-md">
        <div class="col-auto text-caption text-grey-5">Display</div>
        <div class="col-auto">
          <q-select outlined dense v-model="pubPerPage" :options="[5,10,15,25]" style="min-width:80px"/>
        </div>
        <div class="col-auto text-caption text-grey-5">records / page</div>
        <div class="col-auto text-caption text-grey-5 q-ml-auto">
          {{ filteredPubs.length }} records in {{ totalPubPages }} pages
        </div>
        <div class="col-auto row items-center q-gutter-xs">
          <q-btn flat dense round icon="chevron_left"  :disable="pubPage<=1" @click="pubPage > 1 ? pubPage-- : null"/>
          <q-input outlined dense v-model.number="pubPage" type="number" style="width:60px"/>
          <q-btn flat dense round icon="chevron_right" :disable="pubPage>=totalPubPages" @click="pubPage < totalPubPages ? pubPage++ : null"/>
        </div>
      </div>

      <q-table flat bordered :rows="pagedPubs" :columns="pubCols" row-key="uid"
        :pagination="{ rowsPerPage: 0 }" hide-pagination class="bg-white">

        <template v-slot:body-cell-uid="props">
          <q-td :props="props">
            <q-btn flat no-caps dense color="primary" :label="props.row.uid"
              @click="$router.push(`/subscription/${props.row.uid}`)"/>
          </q-td>
        </template>
        <template v-slot:body-cell-customer="props">
          <q-td :props="props">
            <q-btn flat no-caps dense color="primary" :label="props.row.customer"
              @click="goToUser(props.row.customer)"/>
          </q-td>
        </template>
        <template v-slot:body-cell-available="props">
          <q-td :props="props" class="text-center">
            <q-icon :name="props.row.available==='Yes' ? 'check_box' : 'close'"
              :color="props.row.available==='Yes' ? 'positive' : 'negative'" size="sm"/>
          </q-td>
        </template>
        <template v-slot:body-cell-subscribe="props">
          <q-td :props="props" class="text-center">
            <q-icon :name="props.row.subscribe==='Yes' ? 'check_box' : 'close'"
              :color="props.row.subscribe==='Yes' ? 'positive' : 'negative'" size="sm"/>
          </q-td>
        </template>
        <template v-slot:body-cell-publish="props">
          <q-td :props="props" class="text-center">
            <q-icon :name="props.row.publish==='Yes' ? 'check_box' : 'close'"
              :color="props.row.publish==='Yes' ? 'positive' : 'negative'" size="sm"/>
          </q-td>
        </template>
        <template v-slot:body-cell-manage="props">
          <q-td :props="props" class="text-center">
            <q-btn size="sm" color="secondary" label="⚙️ Manage"
              @click="openOptionDialog(props.row)"/>
          </q-td>
        </template>
      </q-table>
    </div>

    <!-- ── Publish Dialog ── -->
    <q-dialog v-model="publishDialog">
      <q-card class="bg-grey-1" style="min-width:440px">
        <q-card-section><div class="text-h6">🚀 Publish Product</div></q-card-section>
        <q-card-section class="q-gutter-md">
          <q-select outlined v-model="newPub.uid" :options="unpublishedUids" label="Select Product UID"/>
          <q-input outlined v-model="newPub.price" label="Price (e.g. $ 150)"/>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup/>
          <q-btn flat label="Publish" color="primary" @click="doPublish"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ── Change Product Option Dialog ── -->
    <q-dialog v-model="optionDialog" persistent>
      <q-card class="text-white q-pa-md" style="background-color: #121824; min-width: 440px; border-radius: 8px; border: 1px solid #2d3748;">
        <!-- Header -->
        <div class="row items-center justify-between q-mb-lg">
          <div class="text-h5 text-weight-bold">Change Product Option</div>
          <q-btn flat round dense icon="close" color="white" v-close-popup />
        </div>

        <div v-if="selectedProd" class="q-gutter-y-lg">
          <!-- Target Product -->
          <div class="row items-center">
            <span class="text-subtitle1 text-weight-bold q-mr-sm">Target Product:</span>
            <q-badge color="green-10" text-color="green-13" class="q-px-sm q-py-xs text-weight-bold" style="font-size: 13px;">
              {{ selectedProd.uid }}
            </q-badge>
          </div>

          <!-- Product Type -->
          <div>
            <div class="text-subtitle2 text-weight-bold q-mb-sm text-grey-4">Product Type</div>
            <div class="row items-center q-gutter-x-lg">
              <q-checkbox dark v-model="optTypes.platform" label="Platform" color="red" keep-color disable />
              <q-checkbox dark v-model="optTypes.orthodontics" label="Orthodontics" color="red" keep-color />
              <q-checkbox dark v-model="optTypes.surgery" label="Surgery" color="red" keep-color />
            </div>
          </div>

          <!-- Activation -->
          <div>
            <div class="text-subtitle2 text-weight-bold q-mb-sm text-grey-4">Activation</div>
            <div class="row items-center q-gutter-x-lg">
              <q-radio dark v-model="optActivation" val="Activation" label="Activation" color="red" keep-color />
              <q-radio dark v-model="optActivation" val="Deactivation" label="Deactivation" color="red" keep-color />
            </div>
          </div>

          <!-- Due Date -->
          <div>
            <div class="text-subtitle2 text-weight-bold q-mb-xs text-grey-4">Due Date</div>
            <q-input dark outlined dense v-model="optDueDate" mask="XXXX/XX/XX"
              input-style="color: #fff; background-color: #1e2530;"
              class="bg-transparent" style="border-radius: 4px;">
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer text-grey-4">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="optDueDate" mask="YYYY/MM/DD" color="red" today-btn />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>

          <!-- Footer Buttons -->
          <div class="row q-col-gutter-md q-pt-md">
            <div class="col-6">
              <q-btn label="OK" color="red" class="full-width text-weight-bold text-white" size="lg" unelevated @click="saveOption" />
            </div>
            <div class="col-6">
              <q-btn label="Cancel" outline color="grey-6" class="full-width text-weight-bold text-white" size="lg" v-close-popup style="border-color: #374151;" />
            </div>
          </div>
        </div>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore } from '../stores/data'
import { useQuasar } from 'quasar'

const router = useRouter()
const store  = useDataStore()
const $q     = useQuasar()

const tab = ref('sub')

// ── Subscription List Filters ─────────────────────────────────
const search       = ref('')
const fAvailable   = ref('All')
const fSubscribe   = ref('All')
const fPublish     = ref('No')
const fOrtho       = ref(true)
const fSurgery     = ref(true)
const purchaseRange  = ref(null)   // { from: 'YYYY/MM/DD', to: 'YYYY/MM/DD' } or null
const dueDateRange   = ref(null)
const purchasePreset = ref('None')
const dueDatePreset  = ref('None')
const frDomestic   = ref(true)
const frGlobal     = ref(true)
const frUS         = ref(false)
const frJP         = ref(false)
const sortField    = ref('uid')
const sortOrder    = ref('desc')
const perPage      = ref(5)
const subPage      = ref(1)

const sortOptions = [
  { label: 'Prod_UID',      value: 'uid' },
  { label: 'Purchase Time', value: 'purchaseTime' },
  { label: 'Due Date',      value: 'dueDate' },
  { label: 'Price',         value: 'price' },
]

// Date range labels
const purchaseRangeLabel = computed(() => {
  if (!purchaseRange.value) return ''
  if (typeof purchaseRange.value === 'string') return purchaseRange.value
  const { from, to } = purchaseRange.value
  return from && to ? `${from} \u2013 ${to}` : from || to || ''
})
const dueDateRangeLabel = computed(() => {
  if (!dueDateRange.value) return ''
  if (typeof dueDateRange.value === 'string') return dueDateRange.value
  const { from, to } = dueDateRange.value
  return from && to ? `${from} \u2013 ${to}` : from || to || ''
})

// Preset helpers
const datePresets = [
  { label: 'None',        value: 'None'      },
  { label: 'Last 7 Days', value: 'last7'     },
  { label: 'Last 30 Days',value: 'last30'    },
  { label: 'This Month',  value: 'thisMonth' },
]

function buildPresetRange(preset) {
  const pad = v => String(v).padStart(2, '0')
  const fmt = d => `${d.getFullYear()}/${pad(d.getMonth()+1)}/${pad(d.getDate())}`
  const today = new Date()
  if (preset === 'last7') {
    const from = new Date(); from.setDate(today.getDate() - 6)
    return { from: fmt(from), to: fmt(today) }
  } else if (preset === 'last30') {
    const from = new Date(); from.setDate(today.getDate() - 29)
    return { from: fmt(from), to: fmt(today) }
  } else if (preset === 'thisMonth') {
    const from = new Date(today.getFullYear(), today.getMonth(), 1)
    return { from: fmt(from), to: fmt(today) }
  }
  return null
}

function applyPurchasePreset(val) {
  purchaseRange.value = val === 'None' ? null : buildPresetRange(val)
}
function applyDueDatePreset(val) {
  dueDateRange.value = val === 'None' ? null : buildPresetRange(val)
}

const subCols = [
  { name: 'uid',         label: 'Prod_UID',          field: 'uid',         align: 'left' },
  { name: 'type',        label: 'Product Type',       field: 'type',        align: 'left' },
  { name: 'customer',    label: 'Customer',           field: 'customer',    align: 'left' },
  { name: 'region',      label: 'Region',             field: 'region',      align: 'left' },
  { name: 'price',       label: 'Price',              field: 'price',       align: 'left' },
  { name: 'purchaseTime',label: 'Purchase Time',      field: 'purchaseTime',align: 'left' },
  { name: 'dueDate',     label: 'Due Date',           field: 'dueDate',     align: 'left' },
  { name: 'lastConnect', label: 'Last Connect Time',  field: 'lastConnect', align: 'left' },
  { name: 'available',   label: 'Available',          field: 'available',   align: 'center' },
  { name: 'subscribe',   label: 'Subscribe',          field: 'subscribe',   align: 'center' },
  { name: 'publish',     label: 'Publish',            field: 'publish',     align: 'center' },
]

const filteredSubs = computed(() => {
  return store.products.map(p => {
    let type = p.type || ''
    if (!type.toLowerCase().includes('platform')) {
      type = type ? 'Platform, ' + type : 'Platform'
    }
    return { ...p, type }
  }).filter(p => {
    if (search.value) {
      const q = search.value.toLowerCase()
      if (![p.uid, p.customer, p.type].some(v => v.toLowerCase().includes(q))) return false
    }
    if (fAvailable.value !== 'All' && p.available !== fAvailable.value) return false
    if (fSubscribe.value !== 'All' && p.subscribe !== fSubscribe.value) return false
    if (fPublish.value !== 'All'   && p.publish   !== fPublish.value)   return false
    if (!fOrtho.value && p.type.includes('Orthodontics')) return false
    if (!fSurgery.value && p.type.includes('Surgery')) return false
    const anySubSub = frUS.value || frJP.value
    const regionOk = (frDomestic.value && p.region === 'Domestic') ||
                     (frGlobal.value && (
                       !anySubSub
                         ? p.region.startsWith('Global')
                         : (frUS.value && p.region === 'Global - US') ||
                           (frJP.value && p.region === 'Global - JP')
                     ))
    if (!regionOk) return false
    // Purchase Time range filter
    if (purchaseRange.value) {
      const pr = purchaseRange.value
      const from = typeof pr === 'string' ? pr : pr.from
      const to   = typeof pr === 'string' ? pr : pr.to
      const pt = p.purchaseTime?.slice(0,10).replaceAll('-','/')
      if (from && pt < from) return false
      if (to   && pt > to)   return false
    }
    // Due Date range filter
    if (dueDateRange.value) {
      const dr = dueDateRange.value
      const from = typeof dr === 'string' ? dr : dr.from
      const to   = typeof dr === 'string' ? dr : dr.to
      const dd = p.dueDate?.slice(0,10).replaceAll('-','/')
      if (from && dd < from) return false
      if (to   && dd > to)   return false
    }
    return true
  }).sort((a, b) => {
    const va = a[sortField.value] || '', vb = b[sortField.value] || ''
    return sortOrder.value === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1)
  })
})

const totalSubPages = computed(() => Math.ceil(filteredSubs.value.length / perPage.value) || 1)
const pagedSubs = computed(() => {
  const s = (subPage.value - 1) * perPage.value
  return filteredSubs.value.slice(s, s + perPage.value)
})

// ── Publish Tab ───────────────────────────────────────────────
const pubSearch  = ref('')
const pubPerPage = ref(5)
const pubPage    = ref(1)
const publishDialog = ref(false)
const optionDialog  = ref(false)
const selectedProd  = ref(null)
const newPub = ref({ uid: null, price: '$ 150' })

const optTypes = ref({
  platform: false,
  orthodontics: false,
  surgery: false
})
const optActivation = ref('Activation')
const optDueDate = ref('')

const pubCols = [
  ...subCols,
  { name: 'manage', label: 'Option Mgmt', field: 'manage', align: 'center' },
]

const filteredPubs = computed(() => {
  return store.products.filter(p => {
    if (p.publish !== 'Yes') return false
    if (pubSearch.value) {
      const q = pubSearch.value.toLowerCase()
      if (![p.uid, p.customer].some(v => v.toLowerCase().includes(q))) return false
    }
    return true
  })
})

const totalPubPages = computed(() => Math.ceil(filteredPubs.value.length / pubPerPage.value) || 1)
const pagedPubs = computed(() => {
  const s = (pubPage.value - 1) * pubPerPage.value
  return filteredPubs.value.slice(s, s + pubPerPage.value)
})

const unpublishedUids = computed(() =>
  store.products.filter(p => p.publish !== 'Yes').map(p => p.uid)
)

function goToUser(name) {
  const user = store.users.find(u => u.name === name)
  router.push(`/user/${user ? user.email : 'unknown'}`)
}

function openOptionDialog(prod) {
  selectedProd.value = { ...prod }
  
  // Set checkboxes
  const tLower = (prod.type || '').toLowerCase()
  optTypes.value.platform = true
  optTypes.value.orthodontics = tLower.includes('ortho')
  optTypes.value.surgery = tLower.includes('surgery')
  
  // Set activation radio
  optActivation.value = (prod.available === 'Yes') ? 'Activation' : 'Deactivation'
  
  // Set due date
  optDueDate.value = prod.dueDate ? prod.dueDate.replaceAll('-', '/') : '2026/05/20'
  
  optionDialog.value = true
}

function saveOption() {
  const idx = store.products.findIndex(p => p.uid === selectedProd.value.uid)
  if (idx !== -1) {
    // Rebuild type string
    const chosen = []
    if (optTypes.value.platform) chosen.push('Platform')
    if (optTypes.value.orthodontics) chosen.push('Orthodontics')
    if (optTypes.value.surgery) chosen.push('Surgery')
    
    // Save to store
    store.products[idx].type = chosen.join(', ') || 'Platform'
    store.products[idx].available = (optActivation.value === 'Activation') ? 'Yes' : 'No'
    store.products[idx].subscribe = (optActivation.value === 'Activation') ? 'Yes' : 'No'
    store.products[idx].dueDate = optDueDate.value.replaceAll('/', '-')
    
    $q.notify({ type: 'positive', message: 'Product option updated.' })
  }
  optionDialog.value = false
}

function doPublish() {
  const idx = store.products.findIndex(p => p.uid === newPub.value.uid)
  if (idx !== -1) {
    store.products[idx].publish = 'Yes'
    store.products[idx].price = newPub.value.price
    $q.notify({ type: 'positive', message: `${newPub.value.uid} published successfully.` })
  }
  publishDialog.value = false
}
</script>
