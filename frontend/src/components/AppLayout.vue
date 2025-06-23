<template>
  <a-layout class="admin-layout">
    <!-- Mobile Overlay -->
    <div
      v-if="showMobileMenu"
      class="mobile-overlay"
      @click="showMobileMenu = false"
    ></div>

    <!-- Modern Sidebar -->
    <a-layout-sider
      v-model:collapsed="collapsed"
      :trigger="null"
      collapsible
      :theme="isDarkMode ? 'dark' : 'light'"
      width="280"
      :collapsed-width="80"
      class="modern-sidebar fixed-sidebar"
      :class="{ 'mobile-visible': showMobileMenu }"
    >
      <!-- Logo Section -->
      <div class="sidebar-header">
        <div class="logo-container">
          <div class="logo-icon">
            <MonitorOutlined />
          </div>
          <div v-if="!collapsed" class="logo-content">
            <h2 class="logo-title">CloudWatch</h2>
            <span class="logo-subtitle">ELK Monitoring</span>
          </div>
        </div>
      </div>

      <!-- Navigation Menu -->
      <div class="sidebar-nav">
        <a-menu
          v-model:selected-keys="selectedKeys"
          v-model:open-keys="openKeys"
          mode="inline"
          :theme="isDarkMode ? 'dark' : 'light'"
          :inline-collapsed="collapsed"
          class="sidebar-menu"
        >
          <!-- Platform Overview -->
          <a-menu-item key="/" @click="navigateTo('/')">
            <template #icon>
              <DashboardOutlined />
            </template>
            <span>Platform Overview</span>
          </a-menu-item>

          <!-- Customer Management -->
          <a-sub-menu key="customers">
            <template #title>
              <TeamOutlined />
              <span>Customers</span>
            </template>
            <a-menu-item key="/customers" @click="navigateTo('/customers')">
              <UserOutlined />
              <span>All Customers</span>
            </a-menu-item>
            <a-menu-item key="/customers/create" @click="navigateTo('/customers/create')">
              <UserAddOutlined />
              <span>Add Customer</span>
            </a-menu-item>
            <a-menu-item key="/usage" @click="navigateTo('/usage')">
              <BarChartOutlined />
              <span>Usage Analytics</span>
            </a-menu-item>
          </a-sub-menu>

          <!-- Project Management -->
          <a-sub-menu key="projects">
            <template #title>
              <ProjectOutlined />
              <span>Projects</span>
            </template>
            <a-menu-item key="/projects" @click="navigateTo('/projects')">
              <FolderOutlined />
              <span>All Projects</span>
            </a-menu-item>
            <a-menu-item key="/projects/templates" @click="navigateTo('/projects/templates')">
              <FileOutlined />
              <span>Project Templates</span>
            </a-menu-item>
            <a-menu-item key="/quotas" @click="navigateTo('/quotas')">
              <BarChartOutlined />
              <span>Quotas & Limits</span>
            </a-menu-item>
          </a-sub-menu>

          <!-- Service Management -->
          <a-sub-menu key="services">
            <template #title>
              <CloudServerOutlined />
              <span>Services</span>
            </template>
            <a-menu-item key="/services/compute" @click="navigateTo('/services/compute')">
              <DesktopOutlined />
              <span>Compute</span>
            </a-menu-item>
            <a-menu-item key="/services/storage" @click="navigateTo('/services/storage')">
              <HddOutlined />
              <span>Storage</span>
            </a-menu-item>
            <a-menu-item key="/services/network" @click="navigateTo('/services/network')">
              <GlobalOutlined />
              <span>Network</span>
            </a-menu-item>
            <a-menu-item key="/services/database" @click="navigateTo('/services/database')">
              <DatabaseOutlined />
              <span>Database</span>
            </a-menu-item>
            <a-menu-item key="/services/monitoring" @click="navigateTo('/services/monitoring')">
              <LineChartOutlined />
              <span>Monitoring</span>
            </a-menu-item>
          </a-sub-menu>

          <!-- Resource Management -->
          <a-sub-menu key="resources">
            <template #title>
              <ClusterOutlined />
              <span>Resources</span>
            </template>
            <a-menu-item key="/resources/nodes" @click="navigateTo('/resources/nodes')">
              <NodeIndexOutlined />
              <span>Physical Nodes</span>
            </a-menu-item>
            <a-menu-item key="/resources/capacity" @click="navigateTo('/resources/capacity')">
              <FundOutlined />
              <span>Capacity Planning</span>
            </a-menu-item>
            <a-menu-item key="/resources/allocation" @click="navigateTo('/resources/allocation')">
              <PieChartOutlined />
              <span>Resource Allocation</span>
            </a-menu-item>
          </a-sub-menu>

          <!-- Monitoring & Logs -->
          <a-sub-menu key="monitoring">
            <template #title>
              <MonitorOutlined />
              <span>Monitoring</span>
            </template>
            <a-menu-item key="/monitoring/platform" @click="navigateTo('/monitoring/platform')">
              <DashboardOutlined />
              <span>Platform Health</span>
            </a-menu-item>
            <a-menu-item key="/monitoring/customers" @click="navigateTo('/monitoring/customers')">
              <UserOutlined />
              <span>Customer Metrics</span>
            </a-menu-item>
            <a-menu-item key="/logs" @click="navigateTo('/logs')">
              <FileTextOutlined />
              <span>System Logs</span>
            </a-menu-item>
            <a-menu-item key="/alerts" @click="navigateTo('/alerts')">
              <AlertOutlined />
              <span>Alerts</span>
            </a-menu-item>
          </a-sub-menu>

          <!-- Security & Compliance -->
          <a-sub-menu key="security">
            <template #title>
              <SecurityScanOutlined />
              <span>Security</span>
            </template>
            <a-menu-item key="/security/policies" @click="navigateTo('/security/policies')">
              <SafetyOutlined />
              <span>Security Policies</span>
            </a-menu-item>
            <a-menu-item key="/security/audit" @click="navigateTo('/security/audit')">
              <AuditOutlined />
              <span>Audit Logs</span>
            </a-menu-item>
            <a-menu-item key="/security/compliance" @click="navigateTo('/security/compliance')">
              <CheckCircleOutlined />
              <span>Compliance</span>
            </a-menu-item>
          </a-sub-menu>

          <!-- Platform Settings -->
          <a-sub-menu key="settings">
            <template #title>
              <SettingOutlined />
              <span>Platform Settings</span>
            </template>
            <a-menu-item key="/settings/general" @click="navigateTo('/settings/general')">
              <ControlOutlined />
              <span>General</span>
            </a-menu-item>
            <a-menu-item key="/settings/integrations" @click="navigateTo('/settings/integrations')">
              <ApiOutlined />
              <span>Integrations</span>
            </a-menu-item>
            <a-menu-item key="/settings/notifications" @click="navigateTo('/settings/notifications')">
              <BellOutlined />
              <span>Notifications</span>
            </a-menu-item>
            <a-menu-item key="/settings/maintenance" @click="navigateTo('/settings/maintenance')">
              <ToolOutlined />
              <span>Maintenance</span>
            </a-menu-item>
          </a-sub-menu>
        </a-menu>
      </div>

      <!-- User Profile Section -->
      <div class="sidebar-footer">
        <div class="user-profile">
          <a-dropdown :trigger="['click']" placement="topLeft">
            <div class="user-info">
              <a-avatar class="user-avatar" :size="collapsed ? 32 : 40">
                {{ userInitials }}
              </a-avatar>
              <div v-if="!collapsed" class="user-details">
                <div class="user-name">{{ authStore.user?.username || 'Admin' }}</div>
                <div class="user-role">{{ authStore.user?.role || 'Administrator' }}</div>
              </div>
              <MoreOutlined v-if="!collapsed" class="user-menu-icon" />
            </div>
            <template #overlay>
              <a-menu class="user-dropdown">
                <a-menu-item key="profile">
                  <UserOutlined />
                  <span>Profile Settings</span>
                </a-menu-item>
                <a-menu-item key="preferences">
                  <SettingOutlined />
                  <span>Preferences</span>
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="logout" @click="handleLogout">
                  <LogoutOutlined />
                  <span>Sign Out</span>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </div>
    </a-layout-sider>

    <!-- Main Content Area -->
    <a-layout class="main-content" :style="{ marginLeft: collapsed ? '80px' : '280px' }">
      <!-- Modern Header -->
      <a-layout-header
        class="modern-header fixed-header"
        :style="{ left: collapsed ? '80px' : '280px' }"
      >
        <div class="header-left">
          <!-- Sidebar Toggle -->
          <a-button
            type="text"
            @click="toggleSidebar"
            class="sidebar-toggle"
          >
            <MenuUnfoldOutlined v-if="collapsed || !showMobileMenu" />
            <MenuFoldOutlined v-else />
          </a-button>

          <!-- Customer/Project Selector -->
          <div class="scope-selector">
            <a-select
              v-model:value="selectedCustomerId"
              placeholder="Select Customer"
              style="width: 200px"
              @change="onCustomerChange"
              :allow-clear="true"
              :loading="customerStore.loading"
            >
              <a-select-option value="">All Customers (System View)</a-select-option>
              <a-select-option
                v-for="customer in customerStore.customers"
                :key="customer.id"
                :value="customer.id"
              >
                {{ customer.name }}
              </a-select-option>
            </a-select>

            <a-select
              v-if="customerStore.selectedCustomer"
              v-model:value="selectedProjectId"
              placeholder="Select Project"
              style="width: 180px; margin-left: 8px"
              @change="onProjectChange"
              :allow-clear="true"
              :loading="customerStore.loading"
            >
              <a-select-option value="">All Projects</a-select-option>
              <a-select-option
                v-for="project in customerStore.projects"
                :key="project.id"
                :value="project.id"
              >
                {{ project.name }}
              </a-select-option>
            </a-select>
          </div>

          <!-- Breadcrumb -->
          <div class="breadcrumb-container">
            <div class="breadcrumb-wrapper">
              <div class="page-icon">
                <HomeOutlined />
              </div>
              <div class="page-title">{{ currentPageTitle }}</div>
            </div>
          </div>
        </div>

        <div class="header-center">
          <!-- Global Search -->
          <div class="global-search">
            <AdvancedSearch
              placeholder="Search logs, metrics, alerts..."
              :show-filters="true"
              :show-history="true"
              @search="handleGlobalSearch"
              @clear="handleSearchClear"
            />
          </div>
        </div>

        <div class="header-right">
          <!-- System Status -->
          <div class="system-status">
            <a-tooltip title="All systems are running normally">
              <div class="status-indicator">
                <div class="status-dot"></div>
                <span class="status-text">Online</span>
              </div>
            </a-tooltip>
          </div>

          <!-- Notifications -->
          <a-dropdown placement="bottomRight">
            <a-badge :count="notificationCount">
              <a-button type="text" class="header-action-btn">
                <BellOutlined />
              </a-button>
            </a-badge>
            <template #overlay>
              <div class="notification-dropdown">
                <div class="notification-header">
                  <h4>Notifications</h4>
                  <a-button type="link" size="small">Mark all read</a-button>
                </div>
                <a-list
                  :data-source="notifications"
                  size="small"
                  class="notification-list"
                >
                  <template #renderItem="{ item }">
                    <a-list-item class="notification-item">
                      <a-list-item-meta>
                        <template #title>
                          <span class="notification-title">{{ item.title }}</span>
                        </template>
                        <template #description>
                          <span class="notification-desc">{{ item.description }}</span>
                        </template>
                      </a-list-item-meta>
                    </a-list-item>
                  </template>
                </a-list>
              </div>
            </template>
          </a-dropdown>

          <!-- User Management -->
          <a-dropdown placement="bottomRight">
            <a-button type="text" class="header-action-btn">
              <TeamOutlined />
            </a-button>
            <template #overlay>
              <a-menu>
                <a-menu-item key="users" @click="navigateTo('/users')">
                  <UserOutlined />
                  <span>User Management</span>
                </a-menu-item>
                <a-menu-item key="roles" @click="navigateTo('/roles')">
                  <SafetyOutlined />
                  <span>Roles & Permissions</span>
                </a-menu-item>
                <a-menu-item key="sessions" @click="navigateTo('/sessions')">
                  <ClockCircleOutlined />
                  <span>Active Sessions</span>
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="audit" @click="navigateTo('/security/audit')">
                  <AuditOutlined />
                  <span>Audit Logs</span>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>

          <!-- Quick Actions -->
          <a-dropdown placement="bottomRight">
            <a-button type="text" class="header-action-btn">
              <PlusOutlined />
            </a-button>
            <template #overlay>
              <a-menu>
                <a-menu-item key="new-customer" @click="navigateTo('/customers/create')">
                  <UserAddOutlined />
                  <span>Add Customer</span>
                </a-menu-item>
                <a-menu-item key="new-project" @click="navigateTo('/projects/create')">
                  <ProjectOutlined />
                  <span>Create Project</span>
                </a-menu-item>
                <a-menu-item key="new-alert" @click="navigateTo('/alerts/create')">
                  <AlertOutlined />
                  <span>Create Alert</span>
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="export-data">
                  <ExportOutlined />
                  <span>Export Data</span>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>

          <!-- Dark Mode Toggle -->
          <a-tooltip :title="isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
            <a-button type="text" class="header-action-btn dark-mode-toggle" @click="toggleDarkMode">
              <template #icon>
                <Sun v-if="isDarkMode" :size="16" />
                <Moon v-else :size="16" />
              </template>
            </a-button>
          </a-tooltip>

          <!-- Settings -->
          <a-button type="text" class="header-action-btn" @click="openSettings">
            <SettingOutlined />
          </a-button>

          <!-- Full Screen -->
          <a-button type="text" class="header-action-btn" @click="toggleFullscreen">
            <FullscreenOutlined v-if="!isFullscreen" />
            <FullscreenExitOutlined v-else />
          </a-button>
        </div>
      </a-layout-header>

      <!-- Content Area -->
      <a-layout-content class="modern-content scrollable-content">
        <div class="content-wrapper">
          <slot />
        </div>
      </a-layout-content>
    </a-layout>

    <!-- Toast Notifications -->
    <ToastNotification ref="toastRef" />
  </a-layout>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCustomerStore } from '@/stores/customer'
import { Sun, Moon } from 'lucide-vue-next'
import ToastNotification from '@/components/ToastNotification.vue'
import AdvancedSearch from '@/components/AdvancedSearch.vue'
import { setToastInstance, useToast } from '@/composables/useToast'
import { useTheme } from '@/composables/useTheme'
import {
  MonitorOutlined,
  DashboardOutlined,
  LineChartOutlined,
  BarChartOutlined,
  FileTextOutlined,
  SearchOutlined,
  UnorderedListOutlined,
  FundProjectionScreenOutlined,
  CloudServerOutlined,
  SecurityScanOutlined,
  AlertOutlined,
  HeartOutlined,
  TeamOutlined,
  ApiOutlined,
  UserOutlined,
  UserAddOutlined,
  LogoutOutlined,
  SafetyOutlined,
  ClockCircleOutlined,
  AuditOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  SettingOutlined,
  HomeOutlined,
  PlusOutlined,
  ExportOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  MoreOutlined,

  ProjectOutlined,
  FolderOutlined,
  FileOutlined,
  DesktopOutlined,
  HddOutlined,
  GlobalOutlined,
  DatabaseOutlined,
  ClusterOutlined,
  NodeIndexOutlined,
  FundOutlined,
  PieChartOutlined,
  CheckCircleOutlined,
  ControlOutlined,
  ToolOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const customerStore = useCustomerStore()
const { isDarkMode, toggleTheme } = useTheme()

// Reactive state
const collapsed = ref(false)
const selectedKeys = ref<string[]>([])
const openKeys = ref<string[]>(['monitoring', 'logs'])
const searchQuery = ref('')
const isFullscreen = ref(false)
const notificationCount = ref(3)
const showMobileMenu = ref(false)
const isMobile = ref(false)
const toastRef = ref()

// Customer/Project selection
const selectedCustomerId = ref('')
const selectedProjectId = ref('')

// Computed properties
const userInitials = computed(() => {
  const username = authStore.user?.username || 'Admin'
  return username.substring(0, 2).toUpperCase()
})

const currentPageTitle = computed(() => {
  const path = route.path
  if (path === '/') return 'Overview'
  if (path === '/metrics') return 'Metrics'
  if (path === '/logs') return 'Logs'
  if (path === '/search') return 'Search'
  if (path === '/alerts') return 'Alerts'
  if (path === '/uptime') return 'Uptime'
  if (path === '/infrastructure') return 'Infrastructure'
  if (path === '/security') return 'Security'
  if (path === '/users') return 'Users'
  if (path === '/integrations') return 'Integrations'
  if (path === '/notifications') return 'Notifications'
  return 'Dashboard'
})

const systemStatus = computed(() => {
  return {
    status: 'processing' as const,
    text: 'All Systems Operational'
  }
})

const notifications = ref([
  {
    title: 'High CPU Usage Alert',
    description: 'Server CPU usage exceeded 85% threshold',
    time: '2 minutes ago'
  },
  {
    title: 'New Log Entries',
    description: '1,234 new log entries processed',
    time: '5 minutes ago'
  },
  {
    title: 'System Update',
    description: 'Elasticsearch cluster updated successfully',
    time: '1 hour ago'
  }
])

// Methods
const navigateTo = (path: string) => {
  router.push(path)
}

const handleGlobalSearch = (query: string, filters: any) => {
  if (query.trim()) {
    console.log('Global search:', query, filters)
    // Implement global search logic here
    const searchParams = new URLSearchParams({
      q: query,
      ...(filters.type && { type: filters.type }),
      ...(filters.status && { status: filters.status }),
      ...(filters.timeRange && {
        from: filters.timeRange[0],
        to: filters.timeRange[1]
      })
    })
    router.push(`/search?${searchParams.toString()}`)
  }
}

const handleSearchClear = () => {
  console.log('Search cleared')
}

const openSettings = () => {
  router.push('/settings')
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

// Use the theme composable's toggle function
const toggleDarkMode = toggleTheme

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

// Mobile functionality
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
  if (isMobile.value) {
    collapsed.value = true
    showMobileMenu.value = false
  }
}

const toggleSidebar = () => {
  if (isMobile.value) {
    showMobileMenu.value = !showMobileMenu.value
  } else {
    collapsed.value = !collapsed.value
  }
}

// Customer/Project selection methods
const onCustomerChange = async (customerId: string) => {
  const customer = customerStore.customers.find(c => c.id === customerId)
  await customerStore.selectCustomer(customer || null)
  selectedProjectId.value = ''
}

const onProjectChange = (projectId: string) => {
  const project = customerStore.projects.find(p => p.id === projectId)
  customerStore.selectProject(project || null)
}



// Watch route changes
watch(() => route.path, (newPath) => {
  selectedKeys.value = [newPath]

  // Auto-expand relevant menu sections
  if (newPath.includes('/metrics') || newPath.includes('/alerts') || newPath.includes('/uptime')) {
    if (!openKeys.value.includes('monitoring')) {
      openKeys.value.push('monitoring')
    }
  }
  if (newPath.includes('/logs') || newPath.includes('/search') || newPath.includes('/analysis')) {
    if (!openKeys.value.includes('logs')) {
      openKeys.value.push('logs')
    }
  }
  if (newPath.includes('/users') || newPath.includes('/integrations') || newPath.includes('/notifications')) {
    if (!openKeys.value.includes('settings')) {
      openKeys.value.push('settings')
    }
  }
}, { immediate: true })

// Listen for fullscreen changes and load dark mode preference
onMounted(() => {
  document.addEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement
  })

  // Theme is already initialized by useTheme composable

  // Initialize mobile detection
  checkMobile()
  window.addEventListener('resize', checkMobile)

  // Setup toast instance
  if (toastRef.value) {
    setToastInstance(toastRef.value)
  }
})
</script>

<style lang="scss">
@import '@/styles/components/app-layout.scss';
























</style>
