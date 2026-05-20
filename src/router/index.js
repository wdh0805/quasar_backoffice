import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import PaymentView from '../views/PaymentView.vue'
import PaymentDetailView from '../views/PaymentDetailView.vue'
import SubscriptionView from '../views/SubscriptionView.vue'
import SubscriptionDetailView from '../views/SubscriptionDetailView.vue'
import UserManagementView from '../views/UserManagementView.vue'
import UserDetailView from '../views/UserDetailView.vue'
import SalesReportsView from '../views/SalesReportsView.vue'

const routes = [
  { path: '/login', name: 'Login', component: LoginView },
  { path: '/dashboard', name: 'Dashboard', component: DashboardView, meta: { requiresAuth: true } },
  { path: '/payment', name: 'Payment', component: PaymentView, meta: { requiresAuth: true } },
  { path: '/payment/:uid', name: 'PaymentDetail', component: PaymentDetailView, meta: { requiresAuth: true } },
  { path: '/subscription', name: 'Subscription', component: SubscriptionView, meta: { requiresAuth: true } },
  { path: '/subscription/:uid', name: 'SubscriptionDetail', component: SubscriptionDetailView, meta: { requiresAuth: true } },
  { path: '/user', name: 'UserManagement', component: UserManagementView, meta: { requiresAuth: true } },
  { path: '/user/:email', name: 'UserDetail', component: UserDetailView, meta: { requiresAuth: true } },
  { path: '/sales', name: 'SalesReports', component: SalesReportsView, meta: { requiresAuth: true } },
  { path: '/', redirect: '/dashboard' },
  { path: '/:catchAll(.*)*', redirect: '/dashboard' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    next('/login')
  } else if (to.path === '/login' && authStore.isLoggedIn) {
    next('/dashboard')
  } else {
    next()
  }
})
export default router
