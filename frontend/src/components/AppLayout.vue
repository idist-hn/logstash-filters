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
      theme="dark"
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
          theme="dark"
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
            @click="collapsed = !collapsed"
            class="sidebar-toggle"
          >
            <MenuUnfoldOutlined v-if="collapsed" />
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
            <div class="search-container">
              <div class="search-input-wrapper">
                <input
                  v-model="searchQuery"
                  type="text"
                  class="search-input"
                  placeholder="Search logs, metrics, alerts..."
                  @keyup.enter="onGlobalSearch(searchQuery)"
                />
                <button
                  v-if="searchQuery"
                  type="button"
                  class="search-clear"
                  @click="searchQuery = ''"
                >
                  ×
                </button>
              </div>
              <button
                type="button"
                class="search-button"
                @click="onGlobalSearch(searchQuery)"
              >
                <SearchOutlined />
              </button>
            </div>
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
  </a-layout>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCustomerStore } from '@/stores/customer'
import { Sun, Moon } from 'lucide-vue-next'
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

// Reactive state
const collapsed = ref(false)
const selectedKeys = ref<string[]>([])
const openKeys = ref<string[]>(['monitoring', 'logs'])
const searchQuery = ref('')
const isFullscreen = ref(false)
const notificationCount = ref(3)
const isDarkMode = ref(false)

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

const onGlobalSearch = (value: string) => {
  if (value.trim()) {
    router.push(`/search?q=${encodeURIComponent(value)}`)
  }
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

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value

  // Apply dark mode to document
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
    document.body.style.backgroundColor = '#141414'
    document.body.style.color = '#ffffff'
  } else {
    document.documentElement.classList.remove('dark')
    document.body.style.backgroundColor = '#f0f2f5'
    document.body.style.color = '#000000'
  }

  // Save preference to localStorage
  localStorage.setItem('darkMode', isDarkMode.value.toString())
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
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

  // Load dark mode preference
  const savedDarkMode = localStorage.getItem('darkMode')
  if (savedDarkMode === 'true') {
    isDarkMode.value = true
    document.documentElement.classList.add('dark')
    document.body.style.backgroundColor = '#141414'
    document.body.style.color = '#ffffff'
  }
})
</script>

<style scoped>
/* CSS Variables for Theme */
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f0f2f5;
  --bg-tertiary: #fafafa;
  --text-primary: #262626;
  --text-secondary: #595959;
  --text-tertiary: #8c8c8c;
  --border-color: #f0f0f0;
  --border-light: #d9d9d9;
  --shadow-light: rgba(0, 0, 0, 0.06);
  --shadow-medium: rgba(0, 0, 0, 0.12);
}

:root.dark {
  --bg-primary: #1f1f1f;
  --bg-secondary: #141414;
  --bg-tertiary: #262626;
  --text-primary: #ffffff;
  --text-secondary: #d9d9d9;
  --text-tertiary: #8c8c8c;
  --border-color: #303030;
  --border-light: #434343;
  --shadow-light: rgba(0, 0, 0, 0.3);
  --shadow-medium: rgba(0, 0, 0, 0.5);
}

/* Modern Admin Layout Styles */
.admin-layout {
  min-height: 100vh;
  background: var(--bg-secondary);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

/* Sidebar Styles */
.modern-sidebar {
  background: linear-gradient(180deg, #001529 0%, #002140 100%);
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 100;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  transition: all 0.3s ease;
}

.fixed-sidebar {
  position: fixed !important;
}

/* Custom Scrollbar for Sidebar */
.modern-sidebar::-webkit-scrollbar {
  width: 4px;
}

.modern-sidebar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

.modern-sidebar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

.modern-sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

.sidebar-header {
  padding: 24px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

.logo-content {
  flex: 1;
}

.logo-title {
  color: white;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  line-height: 1.2;
}

.logo-subtitle {
  color: rgba(255, 255, 255, 0.65);
  font-size: 12px;
  font-weight: 400;
}

.sidebar-nav {
  flex: 1;
  padding: 16px 0;
}

.sidebar-menu {
  background: transparent;
  border: none;
}

.sidebar-menu :deep(.ant-menu-item) {
  margin: 4px 12px;
  border-radius: 6px;
  height: 40px;
  line-height: 40px;
  transition: all 0.3s ease;
}

.sidebar-menu :deep(.ant-menu-item:hover) {
  background: rgba(255, 255, 255, 0.1);
  color: #1890ff;
}

.sidebar-menu :deep(.ant-menu-item-selected) {
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
}

.sidebar-menu :deep(.ant-menu-submenu-title) {
  margin: 4px 12px;
  border-radius: 6px;
  height: 40px;
  line-height: 40px;
  transition: all 0.3s ease;
}

.sidebar-menu :deep(.ant-menu-submenu-title:hover) {
  background: rgba(255, 255, 255, 0.1);
  color: #1890ff;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
}

.user-profile {
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.user-info:hover {
  background: rgba(255, 255, 255, 0.1);
}

.user-avatar {
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  color: white;
  font-weight: 600;
}

.user-details {
  flex: 1;
}

.user-name {
  color: white;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
}

.user-role {
  color: rgba(255, 255, 255, 0.65);
  font-size: 12px;
  line-height: 1.2;
}

.user-menu-icon {
  color: rgba(255, 255, 255, 0.65);
  font-size: 16px;
}

/* Header Styles */
.modern-header {
  background: white;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border-bottom: 1px solid #f0f0f0;
  position: fixed;
  top: 0;
  left: 280px;
  right: 0;
  z-index: 99;
  gap: 24px;
  transition: all 0.3s ease;
  min-height: 64px;
}

.fixed-header {
  position: fixed !important;
}

/* Header responsive to sidebar collapse */
.admin-layout .ant-layout-sider-collapsed + .main-content .modern-header {
  left: 80px;
}

/* Ensure header doesn't overlap with sidebar */
.modern-header {
  width: calc(100vw - 280px);
}

.admin-layout .ant-layout-sider-collapsed + .main-content .modern-header {
  width: calc(100vw - 80px);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-shrink: 0;
}

.scope-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.scope-selector :deep(.ant-select) {
  font-size: 14px;
}

.scope-selector :deep(.ant-select-selector) {
  border-radius: 6px !important;
  border-color: #d9d9d9 !important;
  height: 32px !important;
}

.scope-selector :deep(.ant-select-selection-item) {
  line-height: 30px !important;
}

.sidebar-toggle {
  font-size: 18px;
  color: #666;
  transition: all 0.3s ease;
  width: 40px;
  height: 40px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-toggle:hover {
  color: #1890ff;
  background: rgba(24, 144, 255, 0.1);
}

.breadcrumb-container {
  display: flex;
  align-items: center;
  margin-left: 16px;
}

.breadcrumb-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-icon {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8c8c8c;
  font-size: 12px;
  flex-shrink: 0;
}

.page-title {
  font-size: 14px;
  color: #595959;
  font-weight: 500;
  white-space: nowrap;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 500px;
  margin: 0 auto;
  height: 100%;
}

/* Global Search - Custom Implementation */
.global-search {
  width: 100%;
  max-width: 350px;
  display: flex;
  align-items: center;
}

.search-container {
  display: flex;
  width: 100%;
  height: 36px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  transition: all 0.3s ease;
}

.search-container:hover .search-input-wrapper {
  border-color: #40a9ff;
}

.search-container:hover .search-button {
  border-color: #40a9ff;
  background: #f0f9ff;
}

.search-input-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  background: #fafafa;
  border: 1px solid #d9d9d9;
  border-right: none;
  border-radius: 8px 0 0 8px;
  transition: all 0.3s ease;
}

.search-input-wrapper:focus-within {
  background: white;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.search-input-wrapper:focus-within + .search-button {
  border-color: #1890ff;
  background: #e6f7ff;
  color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.search-input {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  padding: 0 40px 0 12px;
  font-size: 14px;
  color: #262626;
  line-height: 1.5;
}

.search-input::placeholder {
  color: #8c8c8c;
  font-size: 14px;
}

.search-clear {
  position: absolute;
  right: 8px;
  width: 20px;
  height: 20px;
  border: none;
  background: none;
  color: #8c8c8c;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.search-clear:hover {
  background: #f5f5f5;
  color: #595959;
}

.search-button {
  width: 36px;
  height: 36px;
  border: 1px solid #d9d9d9;
  border-left: none;
  border-radius: 0 8px 8px 0;
  background: #fafafa;
  color: #8c8c8c;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.3s ease;
  outline: none;
}

.search-button:hover {
  background: #e6f7ff;
  border-color: #1890ff;
  color: #1890ff;
}

.search-button:focus {
  background: #e6f7ff;
  border-color: #1890ff;
  color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  min-width: 0;
}

.system-status {
  padding: 6px 10px;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 6px;
  font-size: 11px;
  white-space: nowrap;
  transition: all 0.3s ease;
  cursor: pointer;
  height: 32px;
  display: flex;
  align-items: center;
  max-width: 120px;
}

.system-status:hover {
  background: #f0f9ff;
  border-color: #91d5ff;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #52c41a;
  flex-shrink: 0;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(82, 196, 26, 0.7);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(82, 196, 26, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(82, 196, 26, 0);
  }
}

.status-text {
  color: #52c41a;
  font-weight: 500;
  font-size: 11px;
  letter-spacing: 0.3px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-action-btn {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #666;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.header-action-btn:hover {
  background: rgba(24, 144, 255, 0.1);
  color: #1890ff;
}

.dark-mode-toggle {
  position: relative;
}

.dark-mode-toggle:hover {
  background: rgba(24, 144, 255, 0.1);
}

/* Icon and Text Spacing */
.header-right :deep(.ant-menu-item) {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-right :deep(.ant-menu-item .anticon) {
  margin-right: 8px;
}

.header-right :deep(.ant-menu-item span) {
  margin-left: 0;
}

/* Badge Styling */
.header-right :deep(.ant-badge) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.header-right :deep(.ant-badge-count) {
  font-size: 10px;
  min-width: 16px;
  height: 16px;
  line-height: 16px;
  padding: 0 4px;
  border-radius: 8px;
  box-shadow: 0 0 0 1px #fff;
  position: absolute !important;
  top: 0px !important;
  right: 0px !important;
  transform: none !important;
}

/* Content Styles */
.main-content {
  transition: margin-left 0.3s ease;
}

.modern-content {
  background: #f0f2f5;
  min-height: 100vh;
  padding-top: 64px;
}

.scrollable-content {
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
}

/* Custom Scrollbar for Content */
.scrollable-content::-webkit-scrollbar {
  width: 6px;
}

.scrollable-content::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.scrollable-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.scrollable-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.content-wrapper {
  padding: 24px;
  width: 100%;
  min-height: calc(100vh - 64px - 48px);
}

/* Notification Dropdown */
.notification-dropdown {
  width: 320px;
  max-height: 400px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.notification-header {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notification-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.notification-list {
  max-height: 300px;
  overflow-y: auto;
}

.notification-item {
  padding: 12px 20px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  transition: background 0.3s ease;
}

.notification-item:hover {
  background: #fafafa;
}

.notification-title {
  font-weight: 500;
  color: #262626;
}

.notification-desc {
  color: #8c8c8c;
  font-size: 12px;
}

/* User Dropdown */
.user-dropdown {
  min-width: 180px;
}

/* Global Icon and Text Spacing for Dropdowns */
:deep(.ant-dropdown .ant-menu-item) {
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.ant-dropdown .ant-menu-item .anticon) {
  margin-right: 8px;
  flex-shrink: 0;
}

:deep(.ant-dropdown .ant-menu-item span) {
  margin-left: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .modern-sidebar {
    transform: translateX(-100%);
    z-index: 1000;
  }

  .modern-sidebar.ant-layout-sider-collapsed {
    transform: translateX(-100%);
  }

  .main-content {
    margin-left: 0 !important;
  }

  .modern-header {
    padding: 0 16px;
    gap: 12px;
    left: 0 !important;
    width: 100vw !important;
  }

  .header-center {
    display: none;
  }

  .header-left {
    gap: 16px;
  }

  .breadcrumb-container {
    margin-left: 8px;
  }

  .page-icon {
    width: 20px;
    height: 20px;
    font-size: 10px;
  }

  .page-title {
    font-size: 13px;
  }

  .header-right {
    gap: 8px;
  }

  .system-status {
    display: none;
  }

  .content-wrapper {
    padding: 16px;
    width: 100%;
  }

  /* Mobile sidebar toggle */
  .sidebar-toggle {
    display: block !important;
  }
}

@media (max-width: 576px) {
  .modern-header {
    padding: 0 16px;
  }

  .header-right {
    gap: 8px;
  }

  .header-action-btn {
    width: 36px;
    height: 36px;
    font-size: 14px;
  }
}
</style>
