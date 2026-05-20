<template>
  <q-page padding class="bg-grey-1 text-dark">

    <!-- ── Header ── -->
    <div class="row items-center q-mb-md">
      <q-btn flat no-caps icon="arrow_back" label="Back" color="primary"
        class="q-mr-md" style="border:1px solid #ccc; border-radius:4px;"
        @click="$router.push('/payment')"/>
      <div class="row items-center justify-center col">
        <q-icon name="credit_card" color="primary" size="40px" class="q-mr-sm"/>
        <div class="text-h4 text-weight-bold">Payment Detail — {{ uid }}</div>
      </div>
    </div>

    <q-separator class="q-mb-xl"/>

    <div v-if="!payment" class="text-grey-5 text-h6 text-center q-mt-xl">
      Payment not found: {{ uid }}
    </div>

    <template v-else>

      <!-- ── Payment Information ── -->
      <div class="text-h5 text-weight-bold q-mb-md">📋 Payment Information</div>

      <q-markup-table flat bordered class="q-mb-xl" style="max-width:480px">
        <thead>
          <tr>
            <th class="text-left text-dark text-weight-bold">Field</th>
            <th class="text-left text-dark text-weight-bold">Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="text-weight-bold text-black">Date</td>
            <td>{{ payment.date }}</td>
          </tr>
          <tr>
            <td class="text-weight-bold text-black">Customer</td>
            <td>
              <q-btn flat no-caps dense color="primary" :label="payment.customer"
                @click="goToUser(payment.customer)"/>
            </td>
          </tr>
          <tr>
            <td class="text-weight-bold text-black">Payment Type</td>
            <td>{{ payment.payType }}</td>
          </tr>
          <tr>
            <td class="text-weight-bold text-black">Product UID</td>
            <td>
              <q-btn flat no-caps dense color="primary" :label="payment.prodUid"
                @click="$router.push(`/subscription/${payment.prodUid}`)"/>
            </td>
          </tr>
          <tr>
            <td class="text-weight-bold text-black">Amount</td>
            <td>$ {{ payment.amount }}</td>
          </tr>
          <tr>
            <td class="text-weight-bold text-black">Card Number</td>
            <td>{{ payment.cardNum }}</td>
          </tr>
          <tr>
            <td class="text-weight-bold text-black">Status</td>
            <td>
              <q-badge :color="statusColor(payment.status)" rounded class="q-mr-xs"/>
              <span :class="statusTextClass(payment.status)">{{ payment.status }}</span>
            </td>
          </tr>
        </tbody>
      </q-markup-table>

      <!-- ── Issue Refund Button ── -->
      <q-btn
        v-if="payment.status === 'Completed'"
        color="negative"
        icon="reply"
        label="Issue Refund"
        unelevated
        @click="confirmRefund"
      />
      <div v-else-if="payment.status === 'Refund'" class="text-warning row items-center q-gutter-xs">
        <q-icon name="info" size="sm"/>
        <span>This payment has already been refunded.</span>
      </div>

    </template>

    <!-- ── Refund Confirm Dialog ── -->
    <q-dialog v-model="refundDialog">
      <q-card class="bg-grey-1" style="min-width:380px">
        <q-card-section class="row items-center">
          <q-icon name="warning" color="warning" size="32px" class="q-mr-md"/>
          <div>
            <div class="text-h6">Issue Refund</div>
            <div class="text-black text-caption">This action cannot be undone.</div>
          </div>
        </q-card-section>
        <q-card-section>
          Are you sure you want to issue a refund for <strong>{{ uid }}</strong>?<br/>
          Amount: <strong>$ {{ payment?.amount }}</strong>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey-8" v-close-popup/>
          <q-btn flat label="Confirm Refund" color="negative" @click="doRefund"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDataStore } from '../stores/data'
import { useQuasar } from 'quasar'

const route   = useRoute()
const router  = useRouter()
const store   = useDataStore()
const $q      = useQuasar()

const uid     = computed(() => route.params.uid)
const payment = computed(() => store.payments.find(p => p.payUid === uid.value))

const refundDialog = ref(false)

function confirmRefund() {
  refundDialog.value = true
}

function doRefund() {
  const p = store.payments.find(p => p.payUid === uid.value)
  if (p) p.status = 'Refund'
  refundDialog.value = false
  $q.notify({ type: 'warning', message: `Refund issued for ${uid.value}.`, position: 'top' })
}

function statusColor(s)     { return { Completed:'positive', Fail:'negative', Refund:'warning' }[s] || 'grey' }
function statusTextClass(s) { return { Completed:'text-positive', Fail:'text-negative', Refund:'text-warning' }[s] || '' }

function goToUser(name) {
  const user = store.users.find(u => u.name === name)
  router.push(`/user/${user ? user.email : 'unknown'}`)
}
</script>
