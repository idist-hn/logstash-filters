import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/',
      name: 'PlatformOverview',
      component: () => import('@/views/PlatformOverview.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/customers',
      name: 'Customers',
      component: () => import('@/views/CustomersView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/metrics',
      name: 'Metrics',
      component: () => import('@/views/MetricsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/logs',
      name: 'Logs',
      component: () => import('@/views/LogsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/search',
      name: 'Search',
      component: () => import('@/views/SearchView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('@/views/SettingsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/alerts',
      name: 'Alerts',
      component: () => import('@/views/AlertsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/infrastructure',
      name: 'Infrastructure',
      component: () => import('@/views/InfrastructureView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/security',
      name: 'Security',
      component: () => import('@/views/SecurityView.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router
