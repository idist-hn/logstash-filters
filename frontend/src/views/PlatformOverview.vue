<template>
  <AppLayout>
    <div class="platform-overview">
      <!-- Platform Header -->
      <div class="platform-header">
        <div class="header-content">
          <div class="header-info">
            <h1 class="platform-title">Platform Overview</h1>
            <p class="platform-subtitle">Multi-tenant cloud platform management and monitoring</p>
            <div class="platform-stats">
              <div class="stat-item">
                <span class="stat-value">{{ platformStats.totalCustomers }}</span>
                <span class="stat-label">Active Customers</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ platformStats.totalProjects }}</span>
                <span class="stat-label">Total Projects</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ platformStats.totalServices }}</span>
                <span class="stat-label">Running Services</span>
              </div>
            </div>
          </div>
          <div class="header-actions">
            <a-select v-model:value="selectedRegion" style="width: 150px" @change="onRegionChange">
              <a-select-option value="all">All Regions</a-select-option>
              <a-select-option value="us-east-1">US East 1</a-select-option>
              <a-select-option value="us-west-2">US West 2</a-select-option>
              <a-select-option value="eu-west-1">EU West 1</a-select-option>
              <a-select-option value="ap-southeast-1">AP Southeast 1</a-select-option>
            </a-select>
            <a-button @click="refreshData" :loading="loading" type="primary">
              <template #icon>
                <ReloadOutlined />
              </template>
              Refresh
            </a-button>
          </div>
        </div>
      </div>

      <!-- Key Metrics Grid -->
      <a-row :gutter="[24, 24]" class="metrics-grid">
        <!-- Platform Health -->
        <a-col :xs="24" :lg="8">
          <SkeletonLoader v-if="loadingStates.metrics" type="card" />
          <a-card v-else class="metric-card platform-health">
            <template #title>
              <div class="card-header">
                <div class="card-icon">
                  <CheckCircleOutlined />
                </div>
                <div class="card-info">
                  <span>Platform Health</span>
                  <div class="card-subtitle">Overall system status</div>
                </div>
              </div>
            </template>
            <div class="health-status">
              <div class="status-indicator healthy">
                <span class="status-dot"></span>
                <span class="status-text">All Systems Operational</span>
              </div>
              <div class="health-metrics">
                <div class="health-item">
                  <span class="metric-label">Uptime</span>
                  <span class="metric-value">99.98%</span>
                </div>
                <div class="health-item">
                  <span class="metric-label">Response Time</span>
                  <span class="metric-value">145ms</span>
                </div>
              </div>
            </div>
          </a-card>
        </a-col>

        <!-- Resource Utilization -->
        <a-col :xs="24" :lg="8">
          <SkeletonLoader v-if="loadingStates.metrics" type="card" />
          <a-card v-else class="metric-card resource-usage">
            <template #title>
              <div class="card-header">
                <div class="card-icon">
                  <ClusterOutlined />
                </div>
                <div class="card-info">
                  <span>Resource Utilization</span>
                  <div class="card-subtitle">Platform-wide usage</div>
                </div>
              </div>
            </template>
            <div class="resource-metrics">
              <div class="resource-item">
                <div class="resource-info">
                  <span class="resource-label">CPU</span>
                  <span class="resource-value">68%</span>
                </div>
                <a-progress :percent="68" :show-info="false" stroke-color="#1890ff" />
              </div>
              <div class="resource-item">
                <div class="resource-info">
                  <span class="resource-label">Memory</span>
                  <span class="resource-value">72%</span>
                </div>
                <a-progress :percent="72" :show-info="false" stroke-color="#52c41a" />
              </div>
              <div class="resource-item">
                <div class="resource-info">
                  <span class="resource-label">Storage</span>
                  <span class="resource-value">45%</span>
                </div>
                <a-progress :percent="45" :show-info="false" stroke-color="#faad14" />
              </div>
            </div>
          </a-card>
        </a-col>

        <!-- Performance Metrics -->
        <a-col :xs="24" :lg="8">
          <SkeletonLoader v-if="loadingStates.metrics" type="card" />
          <a-card v-else class="metric-card performance-card">
            <template #title>
              <div class="card-header">
                <div class="card-icon">
                  <ThunderboltOutlined />
                </div>
                <div class="card-info">
                  <span>Performance</span>
                  <div class="card-subtitle">System metrics</div>
                </div>
              </div>
            </template>
            <div class="performance-metrics">
              <div class="performance-score">
                <span class="score-label">Overall Score</span>
                <span class="score-value">94.2</span>
                <span class="score-unit">/100</span>
              </div>
              <div class="performance-trend">
                <ArrowUpOutlined class="trend-icon positive" />
                <span class="trend-text">+2.1% from last week</span>
              </div>
              <div class="performance-breakdown">
                <div class="breakdown-item">
                  <span class="metric-name">Response Time</span>
                  <span class="metric-value">145ms</span>
                </div>
                <div class="breakdown-item">
                  <span class="metric-name">Throughput</span>
                  <span class="metric-value">2.4K req/s</span>
                </div>
                <div class="breakdown-item">
                  <span class="metric-name">Error Rate</span>
                  <span class="metric-value">0.02%</span>
                </div>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>

      <!-- Customer & Project Overview -->
      <a-row :gutter="[24, 24]" class="overview-grid">
        <!-- Top Customers by Resource Usage -->
        <a-col :xs="24" :lg="12">
          <a-card title="Top Customers by Resource Usage" class="overview-card">
            <template #extra>
              <a-button type="link" size="small" @click="navigateTo('/customers')">
                View All
              </a-button>
            </template>
            <SkeletonLoader v-if="loadingStates.customers" type="list" :count="4" />
            <div v-else class="customer-list">
              <div v-for="customer in topCustomers" :key="customer.id" class="customer-item">
                <div class="customer-info">
                  <a-avatar :size="40" style="background-color: #1890ff">
                    {{ customer.name.substring(0, 2).toUpperCase() }}
                  </a-avatar>
                  <div class="customer-details">
                    <h4 class="customer-name">{{ customer.name }}</h4>
                    <span class="customer-projects">{{ customer.projectCount }} projects</span>
                  </div>
                </div>
                <div class="customer-usage">
                  <span class="usage-amount">{{ customer.resourceUsage }}% resources</span>
                  <span class="usage-trend" :class="customer.trend > 0 ? 'positive' : 'negative'">
                    <ArrowUpOutlined v-if="customer.trend > 0" />
                    <ArrowDownOutlined v-else />
                    {{ Math.abs(customer.trend) }}%
                  </span>
                </div>
              </div>
            </div>
          </a-card>
        </a-col>

        <!-- Recent Projects -->
        <a-col :xs="24" :lg="12">
          <a-card title="Recent Projects" class="overview-card">
            <template #extra>
              <a-button type="link" size="small" @click="navigateTo('/projects')">
                View All
              </a-button>
            </template>
            <SkeletonLoader v-if="loadingStates.projects" type="list" :count="4" />
            <div v-else class="project-list">
              <div v-for="project in recentProjects" :key="project.id" class="project-item">
                <div class="project-info">
                  <div class="project-icon">
                    <ProjectOutlined />
                  </div>
                  <div class="project-details">
                    <h4 class="project-name">{{ project.name }}</h4>
                    <span class="project-customer">{{ project.customerName }}</span>
                  </div>
                </div>
                <div class="project-status">
                  <a-tag :color="getProjectStatusColor(project.status)">
                    {{ project.status }}
                  </a-tag>
                  <span class="project-date">{{ formatDate(project.createdAt) }}</span>
                </div>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>

      <!-- Service Status Grid -->
      <a-row :gutter="[24, 24]" class="service-grid">
        <a-col :xs="24">
          <a-card title="Service Status Overview" class="service-card">
            <template #extra>
              <a-button type="link" size="small" @click="navigateTo('/services')">
                Manage Services
              </a-button>
            </template>
            <SkeletonLoader v-if="loadingStates.services" type="grid" :count="5" />
            <a-row v-else :gutter="[16, 16]">
              <a-col :xs="12" :sm="8" :lg="4" v-for="service in services" :key="service.name">
                <div class="service-item">
                  <div class="service-icon" :class="service.status">
                    <component :is="service.icon" />
                  </div>
                  <h4 class="service-name">{{ service.name }}</h4>
                  <div class="service-metrics">
                    <span class="service-instances">{{ service.instances }} instances</span>
                    <span class="service-uptime">{{ service.uptime }}% uptime</span>
                  </div>
                  <a-badge :status="getServiceStatusBadge(service.status)" :text="service.status" />
                </div>
              </a-col>
            </a-row>
          </a-card>
        </a-col>
      </a-row>

      <!-- Quick Actions -->
      <a-row :gutter="[24, 24]" class="quick-actions-grid">
        <a-col :xs="24">
          <a-card title="Quick Actions" class="quick-actions-card">
            <template #extra>
              <a-button type="link" size="small" @click="navigateTo('/admin/settings')">
                Settings
              </a-button>
            </template>
            <a-row :gutter="[16, 16]">
              <a-col :xs="12" :sm="8" :lg="4">
                <div class="action-item" @click="navigateTo('/customers/create')">
                  <div class="action-icon">
                    <UserAddOutlined />
                  </div>
                  <h4 class="action-name">Add Customer</h4>
                  <div class="action-description">
                    <span class="action-subtitle">Create new customer account</span>
                  </div>
                </div>
              </a-col>
              <a-col :xs="12" :sm="8" :lg="4">
                <div class="action-item" @click="navigateTo('/projects/create')">
                  <div class="action-icon">
                    <PlusOutlined />
                  </div>
                  <h4 class="action-name">Create Project</h4>
                  <div class="action-description">
                    <span class="action-subtitle">Setup new project</span>
                  </div>
                </div>
              </a-col>
              <a-col :xs="12" :sm="8" :lg="4">
                <div class="action-item" @click="navigateTo('/monitoring/platform')">
                  <div class="action-icon">
                    <MonitorOutlined />
                  </div>
                  <h4 class="action-name">View Monitoring</h4>
                  <div class="action-description">
                    <span class="action-subtitle">Platform metrics</span>
                  </div>
                </div>
              </a-col>
              <a-col :xs="12" :sm="8" :lg="4">
                <div class="action-item" @click="navigateTo('/resources/capacity')">
                  <div class="action-icon">
                    <FundOutlined />
                  </div>
                  <h4 class="action-name">Capacity Planning</h4>
                  <div class="action-description">
                    <span class="action-subtitle">Resource planning</span>
                  </div>
                </div>
              </a-col>
              <a-col :xs="12" :sm="8" :lg="4">
                <div class="action-item" @click="navigateTo('/security/audit')">
                  <div class="action-icon">
                    <SecurityScanOutlined />
                  </div>
                  <h4 class="action-name">Security Audit</h4>
                  <div class="action-description">
                    <span class="action-subtitle">Security review</span>
                  </div>
                </div>
              </a-col>
              <a-col :xs="12" :sm="8" :lg="4">
                <div class="action-item" @click="navigateTo('/settings/maintenance')">
                  <div class="action-icon">
                    <ToolOutlined />
                  </div>
                  <h4 class="action-name">Maintenance</h4>
                  <div class="action-description">
                    <span class="action-subtitle">System maintenance</span>
                  </div>
                </div>
              </a-col>
              <a-col :xs="12" :sm="8" :lg="4">
                <div class="action-item" @click="showExportImport = true">
                  <div class="action-icon">
                    <ExportOutlined />
                  </div>
                  <h4 class="action-name">Export Data</h4>
                  <div class="action-description">
                    <span class="action-subtitle">Export & Import</span>
                  </div>
                </div>
              </a-col>
            </a-row>
          </a-card>
        </a-col>
      </a-row>

      <!-- Export/Import Modal -->
      <a-modal
        v-model:open="showExportImport"
        title="Data Export & Import"
        width="1000px"
        :footer="null"
        :destroy-on-close="true"
      >
        <DataExportImport
          @export-complete="onExportComplete"
          @import-complete="onImportComplete"
        />
      </a-modal>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCustomerStore } from '@/stores/customer'
import AppLayout from '@/components/AppLayout.vue'
import SkeletonLoader from '@/components/SkeletonLoader.vue'
import DataExportImport from '@/components/DataExportImport.vue'
import { useToast, handleApiError, handleSuccess } from '@/composables/useToast'
import { usePerformanceMonitoring, useDebouncedSearch, useImageOptimization } from '@/composables/usePerformance'
import {
  ReloadOutlined,
  CheckCircleOutlined,
  ClusterOutlined,
  ThunderboltOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ProjectOutlined,
  UserAddOutlined,
  PlusOutlined,
  MonitorOutlined,
  FundOutlined,
  SecurityScanOutlined,
  ToolOutlined,
  DesktopOutlined,
  HddOutlined,
  GlobalOutlined,
  DatabaseOutlined,
  LineChartOutlined,
  ExportOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const customerStore = useCustomerStore()
const toast = useToast()
const { startTiming, endTiming, measureAsync } = usePerformanceMonitoring()
const loading = ref(false)
const selectedRegion = ref('all')
const showExportImport = ref(false)

// Individual loading states
const loadingStates = reactive({
  metrics: true,
  customers: true,
  projects: true,
  services: true,
  actions: false
})

const platformStats = reactive({
  totalCustomers: 156,
  totalProjects: 423,
  totalServices: 1247
})

const topCustomers = ref([
  {
    id: 1,
    name: 'TechCorp Solutions',
    projectCount: 12,
    resourceUsage: 24.5,
    trend: 8.5
  },
  {
    id: 2,
    name: 'Global Dynamics',
    projectCount: 8,
    resourceUsage: 18.2,
    trend: -2.1
  },
  {
    id: 3,
    name: 'Innovation Labs',
    projectCount: 15,
    resourceUsage: 16.8,
    trend: 12.3
  },
  {
    id: 4,
    name: 'DataFlow Inc',
    projectCount: 6,
    resourceUsage: 12.4,
    trend: 5.7
  }
])

const recentProjects = ref([
  {
    id: 1,
    name: 'E-commerce Platform',
    customerName: 'TechCorp Solutions',
    status: 'active',
    createdAt: new Date('2024-01-15')
  },
  {
    id: 2,
    name: 'Analytics Dashboard',
    customerName: 'Global Dynamics',
    status: 'deploying',
    createdAt: new Date('2024-01-14')
  },
  {
    id: 3,
    name: 'ML Pipeline',
    customerName: 'Innovation Labs',
    status: 'active',
    createdAt: new Date('2024-01-13')
  },
  {
    id: 4,
    name: 'Data Warehouse',
    customerName: 'DataFlow Inc',
    status: 'maintenance',
    createdAt: new Date('2024-01-12')
  }
])

const services = ref([
  {
    name: 'Compute',
    icon: DesktopOutlined,
    instances: 1247,
    uptime: 99.9,
    status: 'healthy'
  },
  {
    name: 'Storage',
    icon: HddOutlined,
    instances: 856,
    uptime: 99.8,
    status: 'healthy'
  },
  {
    name: 'Network',
    icon: GlobalOutlined,
    instances: 423,
    uptime: 99.7,
    status: 'healthy'
  },
  {
    name: 'Database',
    icon: DatabaseOutlined,
    instances: 234,
    uptime: 99.5,
    status: 'warning'
  },
  {
    name: 'Monitoring',
    icon: LineChartOutlined,
    instances: 156,
    uptime: 99.9,
    status: 'healthy'
  }
])

const navigateTo = (path: string) => {
  try {
    router.push(path)
  } catch (error) {
    handleApiError(error, `Failed to navigate to ${path}`)
  }
}

const refreshData = async () => {
  loading.value = true

  // Start performance monitoring
  startTiming('dataRefresh')

  // Reset all loading states
  Object.keys(loadingStates).forEach(key => {
    loadingStates[key] = true
  })

  try {
    // Measure each data loading phase
    await measureAsync('metricsLoad', async () => {
      await new Promise(resolve => setTimeout(resolve, 800))
      loadingStates.metrics = false
    })

    await measureAsync('customersLoad', async () => {
      await new Promise(resolve => setTimeout(resolve, 400))
      loadingStates.customers = false
    })

    await measureAsync('projectsLoad', async () => {
      await new Promise(resolve => setTimeout(resolve, 200))
      loadingStates.projects = false
    })

    await measureAsync('servicesLoad', async () => {
      await new Promise(resolve => setTimeout(resolve, 200))
      loadingStates.services = false
    })

    // Simulate main API call with potential error
    await measureAsync('mainApiCall', async () => {
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate random error (10% chance)
          if (Math.random() < 0.1) {
            reject(new Error('Failed to fetch platform data'))
          } else {
            resolve(true)
          }
        }, 500)
      })
    })

    handleSuccess('Platform data refreshed successfully')
    console.log('Platform data refreshed')
  } catch (error) {
    handleApiError(error, 'Failed to refresh platform data')

    // Reset loading states on error
    Object.keys(loadingStates).forEach(key => {
      loadingStates[key] = false
    })
  } finally {
    loading.value = false
    endTiming('dataRefresh')
  }
}

const onRegionChange = (value: string) => {
  console.log('Region changed to:', value)
  // Implement region filtering logic
}

const getProjectStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'green'
    case 'deploying': return 'blue'
    case 'maintenance': return 'orange'
    case 'error': return 'red'
    default: return 'default'
  }
}

const getServiceStatusBadge = (status: string) => {
  switch (status) {
    case 'healthy': return 'success'
    case 'warning': return 'warning'
    case 'error': return 'error'
    default: return 'default'
  }
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

const onExportComplete = (data: any) => {
  console.log('Export completed:', data)
  showExportImport.value = false
}

const onImportComplete = (data: any) => {
  console.log('Import completed:', data)
  showExportImport.value = false
  // Refresh data after import
  refreshData()
}

onMounted(async () => {
  // Initial load with staggered skeleton loading
  setTimeout(() => { loadingStates.metrics = false }, 600)
  setTimeout(() => { loadingStates.customers = false }, 1000)
  setTimeout(() => { loadingStates.projects = false }, 1200)
  setTimeout(() => { loadingStates.services = false }, 1400)
})
</script>

<style lang="scss" scoped>
// Dashboard styles are now in SCSS files
// All styles moved to /src/styles/components/dashboard.scss





</style>
