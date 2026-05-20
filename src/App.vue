<template>
  <q-layout view="hHh Lpr lFf">
    <q-header elevated class="bg-primary text-white" v-if="authStore.isLoggedIn">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />
        <q-toolbar-title>3DONS Backoffice</q-toolbar-title>
        <q-btn flat dense icon="logout" @click="logout" label="Logout" />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      class="bg-grey-1 text-dark"
      v-if="authStore.isLoggedIn"
    >
      <q-list>
        <q-item-label header class="text-grey-7">Navigation</q-item-label>
        
        <q-item to="/dashboard" clickable v-ripple active-class="text-primary bg-grey-3">
          <q-item-section avatar><q-icon name="dashboard" /></q-item-section>
          <q-item-section><q-item-label>Dashboard</q-item-label></q-item-section>
        </q-item>
        
        <q-item to="/payment" clickable v-ripple active-class="text-primary bg-grey-3">
          <q-item-section avatar><q-icon name="payment" /></q-item-section>
          <q-item-section><q-item-label>Payment</q-item-label></q-item-section>
        </q-item>

        <q-item to="/subscription" clickable v-ripple active-class="text-primary bg-grey-3">
          <q-item-section avatar><q-icon name="inventory_2" /></q-item-section>
          <q-item-section><q-item-label>Subscription</q-item-label></q-item-section>
        </q-item>

        <q-item to="/user" clickable v-ripple active-class="text-primary bg-grey-3">
          <q-item-section avatar><q-icon name="people" /></q-item-section>
          <q-item-section><q-item-label>User Management</q-item-label></q-item-section>
        </q-item>

        <q-item to="/sales" clickable v-ripple active-class="text-primary bg-grey-3">
          <q-item-section avatar><q-icon name="bar_chart" /></q-item-section>
          <q-item-section><q-item-label>Sales Reports</q-item-label></q-item-section>
        </q-item>

      </q-list>
    </q-drawer>
 
    <q-page-container class="bg-grey-2 text-dark">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from './stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const leftDrawerOpen = ref(false)

function toggleLeftDrawer () {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function logout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style>
body { background-color: #f5f5f5; color: #1a1a1a; }
</style>
