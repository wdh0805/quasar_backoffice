<template>
  <q-page class="flex flex-center bg-grey-2">
    <q-card bordered class="q-pa-lg shadow-4 bg-white text-dark" style="width: 100%; max-width: 400px; border-radius: 12px;">
      <q-card-section class="text-center">
        <q-avatar size="72px" color="primary" text-color="grey-8" icon="admin_panel_settings" class="q-mb-md" />
        <div class="text-h5 text-weight-bold">3DONS Backoffice</div>
        <div class="text-subtitle1 text-grey-5 q-mt-sm">Please sign in to continue</div>
      </q-card-section>
      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <q-input outlined v-model="username" label="Username" lazy-rules :rules="[val => val && val.length > 0 || 'Please type your username']">
            <template v-slot:prepend><q-icon name="person" /></template>
          </q-input>
          <q-input outlined type="password" v-model="password" label="Password" lazy-rules :rules="[val => val && val.length > 0 || 'Please type your password']">
            <template v-slot:prepend><q-icon name="lock" /></template>
          </q-input>
          <div><q-btn label="Login" type="submit" color="primary" class="full-width" size="lg" unelevated /></div>
        </q-form>
      </q-card-section>
      <q-card-section class="text-center text-caption text-grey-5">Tip: login with <b>admin</b> / <b>admin</b></q-card-section>
    </q-card>
  </q-page>
</template>
<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const authStore = useAuthStore()
const router = useRouter()
const $q = useQuasar()

const username = ref('admin')
const password = ref('admin')

function onSubmit() {
  const success = authStore.login(username.value, password.value)
  if (success) {
    $q.notify({ type: 'positive', message: 'Logged in successfully', position: 'top' })
    router.push('/')
  } else {
    $q.notify({ type: 'negative', message: 'Invalid credentials', position: 'top' })
  }
}
</script>
