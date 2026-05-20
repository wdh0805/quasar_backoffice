<template>
  <q-page padding class="bg-grey-1 text-dark">

    <!-- ── Header ── -->
    <div class="row items-center q-mb-md">
      <q-btn flat no-caps icon="arrow_back" label="Back" color="primary"
        class="q-mr-md" style="border:1px solid #ccc; border-radius:4px;"
        @click="$router.push('/subscription')"/>
      <q-separator vertical class="q-mx-md" style="height:48px"/>
      <q-icon name="inventory_2" color="orange" size="40px" class="q-mr-sm"/>
      <div class="text-h4 text-weight-bold">
        Subscription Detail — {{ uid }}
      </div>
    </div>

    <q-separator class="q-mb-xl"/>

    <div v-if="!product" class="text-grey-5 text-h6 text-center q-mt-xl">
      Product not found: {{ uid }}
    </div>

    <template v-else>

      <!-- ── Basic Information ── -->
      <div class="text-h5 text-weight-bold q-mb-md">📋 Basic Information</div>

      <q-markup-table flat bordered class="q-mb-xl" style="max-width:520px">
        <thead>
          <tr>
            <th class="text-left text-dark text-weight-bold">Field</th>
            <th class="text-left text-dark text-weight-bold">Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="text-weight-bold text-black">Prod_UID</td>
            <td>{{ product.uid }}</td>
          </tr>
          <tr>
            <td class="text-weight-bold text-black">Product Type</td>
            <td>
              <!-- Each type segment rendered as link-like span -->
              <span v-for="(seg, i) in productTypeSegments" :key="i">
                <span v-if="i > 0">, </span>
                <span
                  :class="seg.isDiscount ? 'text-primary text-underline cursor-pointer' : ''"
                  :style="seg.isDiscount ? 'text-decoration:underline' : ''"
                >{{ seg.label }}</span>
              </span>
            </td>
          </tr>
          <tr>
            <td class="text-weight-bold text-black">Customer</td>
            <td>
              <q-btn flat no-caps dense color="primary" :label="product.customer"
                @click="goToUser(product.customer)"/>
            </td>
          </tr>
          <tr>
            <td class="text-weight-bold text-black">Price</td>
            <td>{{ product.price }}</td>
          </tr>
          <tr>
            <td class="text-weight-bold text-black">Purchase Time</td>
            <td>{{ product.purchaseTime }}</td>
          </tr>
          <tr>
            <td class="text-weight-bold text-black">Due Date</td>
            <td>{{ product.dueDate }}</td>
          </tr>
          <tr>
            <td class="text-weight-bold text-black">Last Connect Time</td>
            <td>{{ product.lastConnect }}</td>
          </tr>
          <tr>
            <td class="text-weight-bold text-black">Available</td>
            <td>
              <q-icon
                :name="product.available === 'Yes' ? 'check_box' : 'close'"
                :color="product.available === 'Yes' ? 'positive' : 'negative'"
                size="sm"/>
            </td>
          </tr>
          <tr>
            <td class="text-weight-bold text-black">Subscribe</td>
            <td>
              <q-icon
                :name="product.subscribe === 'Yes' ? 'check_box' : 'close'"
                :color="product.subscribe === 'Yes' ? 'positive' : 'negative'"
                size="sm"/>
            </td>
          </tr>
          <tr>
            <td class="text-weight-bold text-black">Publish</td>
            <td>
              <q-icon
                :name="product.publish === 'Yes' ? 'check_box' : 'close'"
                :color="product.publish === 'Yes' ? 'positive' : 'negative'"
                size="sm"/>
            </td>
          </tr>
        </tbody>
      </q-markup-table>

      <q-separator class="q-mb-xl"/>

      <!-- ── Payment History ── -->
      <div class="text-h5 text-weight-bold q-mb-md">💳 Payment History</div>

      <!-- Filter by Payment Date -->
      <div class="q-mb-sm" style="max-width:700px">
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

      <!-- Total Completed Amount -->
      <div class="q-mb-md">
        <div class="text-caption text-grey-5">Total Completed Amount</div>
        <div class="text-h4 text-weight-bold q-mt-xs">$ {{ totalCompleted.toLocaleString() }}</div>
      </div>

      <q-table flat bordered :rows="filteredPays" :columns="payCols"
        row-key="payUid" class="bg-white">

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

const route   = useRoute()
const router  = useRouter()
const store   = useDataStore()

const uid     = computed(() => route.params.uid)
const product = computed(() => {
  const p = store.products.find(p => p.uid === uid.value)
  if (!p) return null
  let type = p.type || ''
  if (!type.toLowerCase().includes('platform')) {
    type = type ? 'Platform, ' + type : 'Platform'
  }
  return { ...p, type }
})

// ── Product type segments (highlight _Discount parts) ────────
const productTypeSegments = computed(() => {
  if (!product.value) return []
  return product.value.type.split(',').map(s => {
    const label = s.trim()
    return { label, isDiscount: label.includes('Discount') }
  })
})

// ── Payment columns ───────────────────────────────────────────
const payCols = [
  { name: 'payUid',  label: 'Pay_UID',      field: 'payUid',  align: 'left'  },
  { name: 'date',    label: 'Date',         field: 'date',    align: 'left'  },
  { name: 'customer',label: 'Customer',     field: 'customer',align: 'left'  },
  { name: 'amount',  label: 'Amount',       field: 'amount',  align: 'right', format: v => `$ ${v}` },
  { name: 'cardNum', label: 'Card Number',  field: 'cardNum', align: 'left'  },
  { name: 'status',  label: 'Status',       field: 'status',  align: 'center'},
]

// ── Date range picker ─────────────────────────────────────────
const payDateRange = ref(null)

const payRangeLabel = computed(() => {
  if (!payDateRange.value) return ''
  if (typeof payDateRange.value === 'string') return payDateRange.value
  const { from, to } = payDateRange.value
  return from && to ? `${from} – ${to}` : from || to || ''
})

// ── Filtered payments for this product ───────────────────────
const filteredPays = computed(() => {
  if (!product.value) return []
  return store.payments.filter(p => {
    if (p.prodUid !== uid.value) return false
    if (payDateRange.value) {
      const r    = payDateRange.value
      const from = typeof r === 'string' ? r : r.from
      const to   = typeof r === 'string' ? r : r.to
      const dt   = p.date?.slice(0, 10).replaceAll('-', '/')
      if (from && dt < from) return false
      if (to   && dt > to)   return false
    }
    return true
  })
})

// ── Total Completed Amount ────────────────────────────────────
const totalCompleted = computed(() =>
  filteredPays.value
    .filter(p => p.status === 'Completed')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
)

// ── Status helpers ────────────────────────────────────────────
function statusColor(s)     { return { Completed:'positive', Fail:'negative', Refund:'warning' }[s] || 'grey' }
function statusTextClass(s) { return { Completed:'text-positive', Fail:'text-negative', Refund:'text-warning' }[s] || '' }

function goToUser(name) {
  const user = store.users.find(u => u.name === name)
  router.push(`/user/${user ? user.email : 'unknown'}`)
}
</script>
