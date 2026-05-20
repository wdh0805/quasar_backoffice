<template>
  <q-page padding class="bg-grey-1 text-dark">

    <!-- ── Header ── -->
    <div class="row items-center q-mb-md">
      <q-btn flat no-caps icon="arrow_back" label="Back" color="primary"
        class="q-mr-md" style="border:1px solid #ccc; border-radius:4px;"
        @click="$router.push('/user')"/>
      <q-separator vertical class="q-mx-md" style="height:48px"/>
      <q-icon name="person" color="purple-4" size="40px" class="q-mr-sm"/>
      <div class="text-h4 text-weight-bold">User Detail — {{ user?.name ?? email }}</div>
    </div>

    <q-separator class="q-mb-xl"/>

    <div v-if="!user" class="text-grey-5 text-h6 text-center q-mt-xl">
      User not found: {{ email }}
    </div>

    <template v-else>

      <!-- ── Basic Information ── -->
      <div class="text-h5 text-weight-bold q-mb-md">
        📋 Basic Information
      </div>

      <q-markup-table flat bordered class="q-mb-xl" style="max-width:500px">
        <thead>
          <tr>
            <th class="text-left text-dark text-weight-bold">Field</th>
            <th class="text-left text-dark text-weight-bold">Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="text-weight-bold text-black">Name</td>
            <td>{{ user.name }}</td>
          </tr>
          <tr>
            <td class="text-weight-bold text-black">Email</td>
            <td><a :href="`mailto:${user.email}`" class="text-primary">{{ user.email }}</a></td>
          </tr>
          <tr>
            <td class="text-weight-bold text-black">Phone</td>
            <td>{{ user.phone }}</td>
          </tr>
          <tr>
            <td class="text-weight-bold text-black">Reg. Date</td>
            <td>{{ user.regDate }}</td>
          </tr>
          <tr>
            <td class="text-weight-bold text-black">Company</td>
            <td>{{ user.company }}</td>
          </tr>
          <tr>
            <td class="text-weight-bold text-black">Region</td>
            <td>{{ user.region }}</td>
          </tr>
          <tr>
            <td class="text-weight-bold text-black">Product Available</td>
            <td>
              <q-icon
                :name="user.productAvailable === 'Yes' ? 'check_box' : 'close'"
                :color="user.productAvailable === 'Yes' ? 'positive' : 'negative'"
                size="sm" class="q-mr-xs"/>
              {{ user.productAvailable }}
            </td>
          </tr>
          <tr>
            <td class="text-weight-bold text-black">Last Login (ON3D)</td>
            <td>{{ user.lastLogin }}</td>
          </tr>
          <tr>
            <td class="text-weight-bold text-black">Total Purchases</td>
            <td>{{ user.purchases }}</td>
          </tr>
          <tr>
            <td class="text-weight-bold text-black">Point</td>
            <td>
              <span class="text-primary text-weight-bold">{{ user.point.toLocaleString() }}</span>
            </td>
          </tr>
        </tbody>
      </q-markup-table>

      <!-- ── Subscription List ── -->
      <div class="text-h5 text-weight-bold q-mb-md">
        📦 Subscription List
      </div>

      <!-- Filter by Purchase Time -->
      <div class="q-mb-md" style="max-width:600px">
        <div class="text-caption text-grey-5 q-mb-xs">Filter by Purchase Time</div>
        <q-input outlined dense readonly
          :model-value="subRangeLabel"
          placeholder="YYYY/MM/DD – YYYY/MM/DD"
          clearable @clear="subDateRange = null">
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date v-model="subDateRange" range mask="YYYY/MM/DD"
                  color="negative" today-btn>
                  <div class="q-pa-sm">
                    <q-btn flat label="Close" color="primary" v-close-popup/>
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>

      <q-table flat bordered :rows="filteredSubs" :columns="subCols"
        row-key="uid" class="bg-grey-2 q-mb-xl">

        <template v-slot:body-cell-uid="props">
          <q-td :props="props">
            <q-btn flat no-caps dense color="primary" :label="props.row.uid"
              @click="$router.push(`/subscription/${props.row.uid}`)"/>
          </q-td>
        </template>

        <template v-slot:body-cell-type="props">
          <q-td :props="props">
            <q-btn flat no-caps dense color="primary" :label="props.row.type"
              @click="$router.push(`/subscription/${props.row.uid}`)"/>
          </q-td>
        </template>

        <template v-slot:body-cell-available="props">
          <q-td :props="props" class="text-center">
            <q-icon :name="props.row.available==='Yes'?'check_box':'close'"
              :color="props.row.available==='Yes'?'positive':'negative'" size="sm"/>
          </q-td>
        </template>
        <template v-slot:body-cell-subscribe="props">
          <q-td :props="props" class="text-center">
            <q-icon :name="props.row.subscribe==='Yes'?'check_box':'close'"
              :color="props.row.subscribe==='Yes'?'positive':'negative'" size="sm"/>
          </q-td>
        </template>
        <template v-slot:body-cell-publish="props">
          <q-td :props="props" class="text-center">
            <q-icon :name="props.row.publish==='Yes'?'check_box':'close'"
              :color="props.row.publish==='Yes'?'positive':'negative'" size="sm"/>
          </q-td>
        </template>
      </q-table>

      <!-- ── Payment History ── -->
      <div class="text-h5 text-weight-bold q-mb-md">
        💳 Payment History
      </div>

      <!-- Filter by Payment Date -->
      <div class="q-mb-md" style="max-width:600px">
        <div class="text-caption text-grey-5 q-mb-xs">Filter by Payment Date</div>
        <q-input outlined dense readonly
          :model-value="payRangeLabel"
          placeholder="YYYY/MM/DD – YYYY/MM/DD"
          clearable @clear="payDateRange = null">
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date v-model="payDateRange" range mask="YYYY/MM/DD"
                  color="negative" today-btn>
                  <div class="q-pa-sm">
                    <q-btn flat label="Close" color="primary" v-close-popup/>
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>

      <q-table flat bordered :rows="filteredPays" :columns="payCols"
        row-key="payUid" class="bg-grey-2 q-mb-xl">

        <template v-slot:body-cell-payUid="props">
          <q-td :props="props">
            <q-btn flat no-caps dense color="primary" :label="props.row.payUid"
              @click="$router.push(`/payment/${props.row.payUid}`)"/>
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

    </template>


  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDataStore } from '../stores/data'
import { useQuasar } from 'quasar'

const route  = useRoute()
const router = useRouter()
const store  = useDataStore()
const $q     = useQuasar()

const email = computed(() => decodeURIComponent(route.params.email))
const user  = computed(() => store.users.find(u => u.email === email.value))

// ── Subscription columns ──────────────────────────────────────
const subCols = [
  { name: 'uid',         label: 'Prod_UID',         field: 'uid',         align: 'left' },
  { name: 'type',        label: 'Product Type',      field: 'type',        align: 'left' },
  { name: 'price',       label: 'Price',             field: 'price',       align: 'left' },
  { name: 'purchaseTime',label: 'Purchase Time',     field: 'purchaseTime',align: 'left' },
  { name: 'dueDate',     label: 'Due Date',          field: 'dueDate',     align: 'left' },
  { name: 'lastConnect', label: 'Last Connect Time', field: 'lastConnect', align: 'left' },
  { name: 'available',   label: 'Available',         field: 'available',   align: 'center' },
  { name: 'subscribe',   label: 'Subscribe',         field: 'subscribe',   align: 'center' },
  { name: 'publish',     label: 'Publish',           field: 'publish',     align: 'center' },
]

// ── Payment columns ───────────────────────────────────────────
const payCols = [
  { name: 'payUid',  label: 'Pay_UID',      field: 'payUid',  align: 'left'  },
  { name: 'date',    label: 'Date',         field: 'date',    align: 'left'  },
  { name: 'payType', label: 'Payment Type', field: 'payType', align: 'left'  },
  { name: 'prodUid', label: 'Product UID',  field: 'prodUid', align: 'left'  },
  { name: 'amount',  label: 'Amount',       field: 'amount',  align: 'right', format: v => `$ ${v}` },
  { name: 'cardNum', label: 'Card Number',  field: 'cardNum', align: 'left'  },
  { name: 'status',  label: 'Status',       field: 'status',  align: 'center'},
]

// ── Date range pickers ────────────────────────────────────────
const subDateRange = ref(null)
const payDateRange = ref(null)

function rangeLabel(r) {
  if (!r) return ''
  if (typeof r === 'string') return r
  const { from, to } = r
  return from && to ? `${from} – ${to}` : from || to || ''
}
const subRangeLabel = computed(() => rangeLabel(subDateRange.value))
const payRangeLabel = computed(() => rangeLabel(payDateRange.value))

// ── Filtered subscriptions ────────────────────────────────────
const filteredSubs = computed(() => {
  if (!user.value) return []
  return store.products.filter(p => {
    if (p.customer !== user.value.name) return false
    if (subDateRange.value) {
      const r    = subDateRange.value
      const from = typeof r === 'string' ? r : r.from
      const to   = typeof r === 'string' ? r : r.to
      const pt   = p.purchaseTime?.slice(0,10).replaceAll('-','/')
      if (from && pt < from) return false
      if (to   && pt > to)   return false
    }
    return true
  })
})

// ── Filtered payments ─────────────────────────────────────────
const filteredPays = computed(() => {
  if (!user.value) return []
  return store.payments.filter(p => {
    if (p.customer !== user.value.name) return false
    if (payDateRange.value) {
      const r    = payDateRange.value
      const from = typeof r === 'string' ? r : r.from
      const to   = typeof r === 'string' ? r : r.to
      const dt   = p.date?.slice(0,10).replaceAll('-','/')
      if (from && dt < from) return false
      if (to   && dt > to)   return false
    }
    return true
  })
})

// ── Status helpers ────────────────────────────────────────────
function statusColor(s)     { return { Completed:'positive', Fail:'negative', Refund:'warning' }[s] || 'grey' }
function statusTextClass(s) { return { Completed:'text-positive', Fail:'text-negative', Refund:'text-warning' }[s] || '' }
</script>
