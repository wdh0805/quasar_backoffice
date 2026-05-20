import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import { Quasar, Dialog, Notify } from 'quasar'
import VueApexCharts from 'vue3-apexcharts'

import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'

import App from './App.vue'

const myApp = createApp(App)
myApp.use(createPinia())
myApp.use(router)
myApp.use(Quasar, {
  plugins: { Dialog, Notify },
  config: { dark: false }
})
myApp.use(VueApexCharts)
myApp.mount('#app')
