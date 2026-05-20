<template>
  <q-page padding class="bg-grey-1 text-dark">

    <!-- Title -->
    <div class="row items-center q-mb-lg">
      <q-icon name="group" color="purple-4" size="36px" class="q-mr-sm"/>
      <div class="text-h4 text-weight-bold">User Management</div>
    </div>

    <!-- Search (full width) -->
    <div class="q-mb-md">
      <q-input outlined dense v-model="search"
        label="Search User (Name, Email, Phone)" clearable>
        <template v-slot:append><q-icon name="search"/></template>
      </q-input>
    </div>

    <!-- Filter by Product Available + Filter by Reg. Date -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-5">
        <div class="text-caption text-grey-5 q-mb-xs">Filter by Product Available</div>
        <q-select outlined dense v-model="filterProduct"
          :options="['All','Yes','No']"/>
      </div>
      <div class="col-12 col-md-7">
        <div class="text-caption text-grey-5 q-mb-xs">Filter by Reg. Date</div>
        <q-input outlined dense readonly
          :model-value="regDateRangeLabel"
          placeholder="YYYY/MM/DD – YYYY/MM/DD"
          clearable @clear="regDateRange = null">
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date v-model="regDateRange" range mask="YYYY/MM/DD"
                  color="negative" today-btn>
                  <div class="row items-center justify-end q-pa-sm">
                    <div class="col-12 q-mb-sm">
                      <div class="text-caption text-grey-5 q-mb-xs">Choose a date range</div>
                      <q-select outlined dense v-model="regDatePreset"
                        :options="datePresets" emit-value map-options
                        @update:model-value="applyRegDatePreset"/>
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

    <!-- User List -->
    <div class="text-h6 text-weight-bold q-mb-sm">User List</div>

    <!-- Sort + Order -->
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
      💡 Tip: Click <strong>Name</strong> to view details · Click <strong>Point</strong> to manage balance.
    </div>

    <!-- Per-page + Pagination -->
    <div class="row items-center q-col-gutter-sm q-mb-md">
      <div class="col-auto text-caption text-grey-5">Display</div>
      <div class="col-auto">
        <q-select outlined dense v-model="perPage" :options="[5,10,15,25]" style="min-width:80px"/>
      </div>
      <div class="col-auto text-caption text-grey-5">records / page</div>
      <div class="col-auto text-caption text-grey-5 q-ml-auto">
        {{ filteredUsers.length }} records in {{ totalPages }} pages
      </div>
      <div class="col-auto row items-center q-gutter-xs">
        <q-btn flat dense round icon="chevron_left" :disable="currentPage<=1" @click="currentPage > 1 && currentPage--"/>
        <q-input outlined dense v-model.number="currentPage" type="number" style="width:60px" :min="1" :max="totalPages"/>
        <q-btn flat dense round icon="chevron_right" :disable="currentPage>=totalPages" @click="currentPage < totalPages && currentPage++"/>
      </div>
    </div>

    <!-- Table -->
    <q-table flat bordered :rows="pagedUsers" :columns="columns" row-key="email"
      :pagination="{ rowsPerPage: 0 }" hide-pagination class="bg-white">

      <!-- Name: red clickable link → user detail -->
      <template v-slot:body-cell-name="props">
        <q-td :props="props">
          <q-btn flat no-caps dense color="primary" :label="props.row.name"
            @click="$router.push(`/user/${props.row.email}`)"/>
        </q-td>
      </template>

      <!-- Email: blue clickable -->
      <template v-slot:body-cell-email="props">
        <q-td :props="props">
          <q-btn flat no-caps dense color="primary" :label="props.row.email"
            @click="$router.push(`/user/${props.row.email}`)"/>
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

      <!-- Product Available: icon -->
      <template v-slot:body-cell-productAvailable="props">
        <q-td :props="props" class="text-center">
          <q-icon
            :name="props.row.productAvailable === 'Yes' ? 'check_box' : 'close'"
            :color="props.row.productAvailable === 'Yes' ? 'positive' : 'negative'"
            size="sm"/>
        </q-td>
      </template>

      <!-- Point: clickable number -->
      <template v-slot:body-cell-point="props">
        <q-td :props="props">
          <span style="white-space:nowrap">{{ props.row.point.toLocaleString() }}</span>
        </q-td>
      </template>

      <!-- Point Mgmt: Manage button -->
      <template v-slot:body-cell-manage="props">
        <q-td :props="props">
          <q-btn size="sm" color="grey-7" label="Manage" no-caps
            @click="openManagePointDialog(props.row)"/>
        </q-td>
      </template>
    </q-table>

    <!-- Point Management Dialog -->
    <q-dialog v-model="manageDialog">
      <q-card class="bg-grey-1" style="min-width:420px">
        <q-card-section>
          <div class="text-h6">Point Management</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-markup-table flat bordered class="q-mb-md">
            <tbody>
              <tr>
                <td class="text-grey-5">User Account</td>
                <td>{{ selectedUser?.email }}</td>
                <td class="text-grey-5">Name</td>
                <td>{{ selectedUser?.name }}</td>
              </tr>
              <tr>
                <td class="text-grey-5">Current Point</td>
                <td class="text-h6 text-primary">{{ selectedUser?.point.toLocaleString() }}</td>
                <td class="text-grey-5">Region</td>
                <td>{{ selectedUser?.region }}</td>
              </tr>
            </tbody>
          </q-markup-table>

          <q-option-group v-model="actionType"
            :options="[{label:'Charge',value:'charge'},{label:'Deduction',value:'deduct'}]"
            color="primary" inline class="q-mb-md"/>

          <q-input outlined v-model.number="amount" type="number"
            label="Point Amount" step="10000" class="q-mb-sm"/>
          <q-input outlined v-model="memo" label="Memo (e.g. Customer request)"/>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey-8" v-close-popup/>
          <q-btn flat label="Execute" color="primary" @click="executePointAction"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

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

// ── Filters ───────────────────────────────────────────────────
const search        = ref('')
const filterProduct = ref('All')
const regDateRange  = ref(null)
const regDatePreset = ref('None')
const frDomestic    = ref(true)
const frGlobal      = ref(true)
const frUS          = ref(true)
const frJP          = ref(true)

watch(frGlobal, (newVal) => {
  if (newVal) {
    frUS.value = true
    frJP.value = true
  } else {
    frUS.value = false
    frJP.value = false
  }
})
watch([frUS, frJP], ([newUS, newJP]) => {
  if (frGlobal.value && !newUS && !newJP) {
    frGlobal.value = false
  }
})

// ── Sort / Pagination ─────────────────────────────────────────
const sortField   = ref('regDate')
const sortOrder   = ref('desc')
const perPage     = ref(5)
const currentPage = ref(1)

const sortOptions = [
  { label: 'Reg. Date',       value: 'regDate'  },
  { label: 'Name',            value: 'name'     },
  { label: 'Region',          value: 'region'   },
  { label: 'Total Purchases', value: 'purchases'},
  { label: 'Point',           value: 'point'    },
]

// ── Columns ───────────────────────────────────────────────────
const columns = [
  { name: 'regDate',          label: 'Reg. Date',        field: 'regDate',          align: 'left',   sortable: true },
  { name: 'name',             label: 'Name',             field: 'name',             align: 'left',   sortable: true },
  { name: 'email',            label: 'Email',            field: 'email',            align: 'left'                   },
  { name: 'region',           label: 'Region',           field: 'region',           align: 'left',   sortable: true },
  { name: 'phone',            label: 'Phone',            field: 'phone',            align: 'left'                   },
  { name: 'lastLogin',        label: 'Last Login',       field: 'lastLogin',        align: 'left',   sortable: true },
  { name: 'purchases',        label: 'Total Purchases',  field: 'purchases',        align: 'right'                  },
  { name: 'productAvailable', label: 'Product Available',field: 'productAvailable', align: 'center'                 },
  { name: 'point',            label: 'Point',            field: 'point',            align: 'right',  sortable: true },
  { name: 'manage',           label: 'Point Mgmt',       field: 'manage',           align: 'center'                 },
]

// ── Date range label helpers ──────────────────────────────────
const regDateRangeLabel = computed(() => {
  if (!regDateRange.value) return ''
  if (typeof regDateRange.value === 'string') return regDateRange.value
  const { from, to } = regDateRange.value
  return from && to ? `${from} – ${to}` : from || to || ''
})

const datePresets = [
  { label: 'None',         value: 'None'      },
  { label: 'Last 7 Days',  value: 'last7'     },
  { label: 'Last 30 Days', value: 'last30'    },
  { label: 'This Month',   value: 'thisMonth' },
]

function buildPresetRange(preset) {
  const pad = v => String(v).padStart(2, '0')
  const fmt = d => `${d.getFullYear()}/${pad(d.getMonth()+1)}/${pad(d.getDate())}`
  const today = new Date()
  if (preset === 'last7')     { const f = new Date(); f.setDate(today.getDate()-6);  return { from: fmt(f), to: fmt(today) } }
  if (preset === 'last30')    { const f = new Date(); f.setDate(today.getDate()-29); return { from: fmt(f), to: fmt(today) } }
  if (preset === 'thisMonth') { const f = new Date(today.getFullYear(), today.getMonth(), 1); return { from: fmt(f), to: fmt(today) } }
  return null
}
function applyRegDatePreset(val) {
  regDateRange.value = val === 'None' ? null : buildPresetRange(val)
}

// ── Filtered + sorted users ───────────────────────────────────
const filteredUsers = computed(() => {
  return store.users.filter(u => {
    // text search
    if (search.value) {
      const q = search.value.toLowerCase()
      if (![u.name, u.email, u.phone].some(v => v?.toLowerCase().includes(q))) return false
    }
    // product available
    if (filterProduct.value !== 'All' && u.productAvailable !== filterProduct.value) return false
    // region
    const anySub = frUS.value || frJP.value
    const regionOk = (frDomestic.value && u.region === 'Domestic') ||
                     (frGlobal.value && (
                       !anySub
                         ? u.region.startsWith('Global')
                         : (frUS.value && u.region === 'Global - US') ||
                           (frJP.value && u.region === 'Global - JP')
                     ))
    if (!regionOk) return false
    // reg date range
    if (regDateRange.value) {
      const dr   = regDateRange.value
      const from = typeof dr === 'string' ? dr : dr.from
      const to   = typeof dr === 'string' ? dr : dr.to
      const rd   = u.regDate?.replaceAll('-', '/')
      if (from && rd < from) return false
      if (to   && rd > to)   return false
    }
    return true
  }).sort((a, b) => {
    let va = a[sortField.value], vb = b[sortField.value]
    // numeric sort for point
    if (sortField.value === 'point') {
      return sortOrder.value === 'asc' ? va - vb : vb - va
    }
    va = String(va || ''); vb = String(vb || '')
    return sortOrder.value === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
  })
})

const totalPages = computed(() => Math.ceil(filteredUsers.value.length / perPage.value) || 1)
const pagedUsers = computed(() => {
  const s = (currentPage.value - 1) * perPage.value
  return filteredUsers.value.slice(s, s + perPage.value)
})

// ── Point Dialog ──────────────────────────────────────────────
const manageDialog  = ref(false)
const selectedUser  = ref(null)
const actionType    = ref('charge')
const amount        = ref(10000)
const memo          = ref('')

function openManagePointDialog(user) {
  selectedUser.value = user
  amount.value       = 10000
  memo.value         = ''
  actionType.value   = 'charge'
  manageDialog.value = true
}

function executePointAction() {
  if (!selectedUser.value || amount.value <= 0) return
  store.adjustPoint(selectedUser.value.email,
    actionType.value === 'charge' ? amount.value : -amount.value)
  const msg = actionType.value === 'charge'
    ? `Successfully charged ${amount.value.toLocaleString()} points.`
    : `Successfully deducted ${amount.value.toLocaleString()} points.`
  // Re-sync local ref
  const u = store.users.find(u => u.email === selectedUser.value.email)
  if (u && u.point < 0) {
    $q.notify({ type: 'negative', message: 'Cannot deduct more than current balance.' })
    store.adjustPoint(selectedUser.value.email, amount.value) // rollback
    return
  }
  if (u) selectedUser.value = { ...u }
  $q.notify({ type: 'positive', message: msg })
  manageDialog.value = false
}
</script>
