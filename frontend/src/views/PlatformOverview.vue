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
          <div class="metric-card platform-health">
            <div class="card-header">
              <div class="card-icon">
                <CheckCircleOutlined />
              </div>
              <div class="card-info">
                <h3>Platform Health</h3>
                <span class="card-subtitle">Overall system status</span>
              </div>
            </div>
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
          </div>
        </a-col>

        <!-- Resource Utilization -->
        <a-col :xs="24" :lg="8">
          <div class="metric-card resource-usage">
            <div class="card-header">
              <div class="card-icon">
                <ClusterOutlined />
              </div>
              <div class="card-info">
                <h3>Resource Utilization</h3>
                <span class="card-subtitle">Platform-wide usage</span>
              </div>
            </div>
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
          </div>
        </a-col>

        <!-- Performance Metrics -->
        <a-col :xs="24" :lg="8">
          <div class="metric-card performance-card">
            <div class="card-header">
              <div class="card-icon">
                <ThunderboltOutlined />
              </div>
              <div class="card-info">
                <h3>Performance</h3>
                <span class="card-subtitle">System metrics</span>
              </div>
            </div>
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
          </div>
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
            <div class="customer-list">
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
            <div class="project-list">
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
            <a-row :gutter="[16, 16]">
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
      <div class="quick-actions">
        <h3>Quick Actions</h3>
        <a-row :gutter="[16, 16]">
          <a-col :xs="12" :sm="8" :lg="4">
            <a-button block size="large" @click="navigateTo('/customers/create')">
              <UserAddOutlined />
              Add Customer
            </a-button>
          </a-col>
          <a-col :xs="12" :sm="8" :lg="4">
            <a-button block size="large" @click="navigateTo('/projects/create')">
              <PlusOutlined />
              Create Project
            </a-button>
          </a-col>
          <a-col :xs="12" :sm="8" :lg="4">
            <a-button block size="large" @click="navigateTo('/monitoring/platform')">
              <MonitorOutlined />
              View Monitoring
            </a-button>
          </a-col>
          <a-col :xs="12" :sm="8" :lg="4">
            <a-button block size="large" @click="navigateTo('/resources/capacity')">
              <FundOutlined />
              Capacity Planning
            </a-button>
          </a-col>
          <a-col :xs="12" :sm="8" :lg="4">
            <a-button block size="large" @click="navigateTo('/security/audit')">
              <SecurityScanOutlined />
              Security Audit
            </a-button>
          </a-col>
          <a-col :xs="12" :sm="8" :lg="4">
            <a-button block size="large" @click="navigateTo('/settings/maintenance')">
              <ToolOutlined />
              Maintenance
            </a-button>
          </a-col>
        </a-row>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCustomerStore } from '@/stores/customer'
import AppLayout from '@/components/AppLayout.vue'
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
  LineChartOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const customerStore = useCustomerStore()
const loading = ref(false)
const selectedRegion = ref('all')

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
  router.push(path)
}

const refreshData = async () => {
  loading.value = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('Platform data refreshed')
  } finally {
    loading.value = false
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

onMounted(() => {
  refreshData()
})
</script>

<style scoped>
/* Platform Overview Styles */
.platform-overview {
  width: 100%;
  padding: 0;
}

/* Platform Header */
.platform-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 32px;
  color: white;
  position: relative;
  overflow: hidden;
}

.platform-header::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 200px;
  height: 200px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  transform: translate(50%, -50%);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
  z-index: 1;
}

.platform-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: white;
}

.platform-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 24px 0;
}

.platform-stats {
  display: flex;
  gap: 32px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: white;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 4px;
}

.header-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

/* Metric Cards */
.metrics-grid {
  margin-bottom: 32px;
}

.metric-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
  height: 100%;
  transition: all 0.3s ease;
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
}

.card-info h3 {
  font-size: 18px;
  font-weight: 600;
  color: #262626;
  margin: 0;
}

.card-subtitle {
  font-size: 14px;
  color: #8c8c8c;
}

/* Platform Health */
.health-status {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #52c41a;
}

.status-text {
  font-size: 16px;
  font-weight: 500;
  color: #52c41a;
}

.health-metrics {
  display: flex;
  gap: 24px;
}

.health-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.metric-label {
  font-size: 12px;
  color: #8c8c8c;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metric-value {
  font-size: 20px;
  font-weight: 600;
  color: #262626;
}

/* Resource Usage */
.resource-metrics {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.resource-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.resource-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.resource-label {
  font-size: 14px;
  color: #595959;
  font-weight: 500;
}

.resource-value {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

/* Performance Card */
.performance-metrics {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.performance-score {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.score-label {
  font-size: 14px;
  color: #8c8c8c;
  font-weight: 500;
  margin-right: 8px;
}

.score-value {
  font-size: 32px;
  font-weight: 700;
  color: #262626;
}

.score-unit {
  font-size: 20px;
  color: #8c8c8c;
  font-weight: 500;
}

.performance-trend {
  display: flex;
  align-items: center;
  gap: 6px;
}

.trend-icon.positive {
  color: #52c41a;
}

.trend-text {
  font-size: 14px;
  color: #52c41a;
}

.performance-breakdown {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.breakdown-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
}

.metric-name {
  font-size: 14px;
  color: #595959;
}

.metric-value {
  font-size: 14px;
  font-weight: 600;
  color: #262626;
}

/* Overview Cards */
.overview-grid {
  margin-bottom: 32px;
}

.overview-card {
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
}

.customer-list, .project-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.customer-item, .project-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.customer-item:hover, .project-item:hover {
  background: #f0f0f0;
}

.customer-info, .project-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.customer-details, .project-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.customer-name, .project-name {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  margin: 0;
}

.customer-projects, .project-customer {
  font-size: 12px;
  color: #8c8c8c;
}

.customer-usage, .project-status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.usage-amount {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.usage-trend {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.usage-trend.positive {
  color: #52c41a;
}

.usage-trend.negative {
  color: #f5222d;
}

.project-date {
  font-size: 12px;
  color: #8c8c8c;
}

/* Service Grid */
.service-grid {
  margin-bottom: 32px;
}

.service-card {
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
}

.service-item {
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s ease;
}

.service-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.service-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 12px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
}

.service-icon.healthy {
  background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
}

.service-icon.warning {
  background: linear-gradient(135deg, #faad14 0%, #d48806 100%);
}

.service-icon.error {
  background: linear-gradient(135deg, #f5222d 0%, #cf1322 100%);
}

.service-name {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  margin: 0 0 8px 0;
}

.service-metrics {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
}

.service-instances, .service-uptime {
  font-size: 12px;
  color: #8c8c8c;
}

/* Quick Actions */
.quick-actions {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
}

.quick-actions h3 {
  font-size: 20px;
  font-weight: 600;
  color: #262626;
  margin: 0 0 20px 0;
}

.quick-actions .ant-btn {
  height: 60px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
}

/* Responsive Design */
@media (max-width: 768px) {
  .platform-header {
    padding: 24px;
  }

  .header-content {
    flex-direction: column;
    gap: 20px;
  }

  .platform-stats {
    gap: 20px;
  }

  .platform-title {
    font-size: 24px;
  }

  .metric-card {
    padding: 20px;
  }

  .health-metrics {
    gap: 16px;
  }
}

@media (max-width: 576px) {
  .platform-stats {
    flex-direction: column;
    gap: 16px;
  }

  .customer-item, .project-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .customer-usage, .project-status {
    align-items: flex-start;
  }
}
</style>
