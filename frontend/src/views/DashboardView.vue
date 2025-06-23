<template>
  <AppLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="mb-6">
        <a-page-header
          title="Dashboard"
          sub-title="Real-time monitoring and system overview"
          :ghost="false"
        >
          <template #extra>
            <a-button type="primary" @click="fetchDashboardData">
              <template #icon>
                <ReloadOutlined />
              </template>
              Refresh
            </a-button>
          </template>
        </a-page-header>
      </div>

      <!-- Modern Stats Overview -->
      <a-row :gutter="[24, 24]">
        <a-col :xs="24" :sm="12" :lg="6">
          <div class="metric-card cluster-status">
            <div class="metric-header">
              <div class="metric-icon cluster-icon">
                <CheckCircleOutlined v-if="clusterHealth?.status === 'green'" />
                <ExclamationCircleOutlined v-else-if="clusterHealth?.status === 'yellow'" />
                <CloseCircleOutlined v-else-if="clusterHealth?.status === 'red'" />
                <LoadingOutlined v-else />
              </div>
              <div class="metric-info">
                <h4>Cluster Status</h4>
                <span class="metric-subtitle">Elasticsearch Health</span>
              </div>
            </div>
            <div class="metric-value">
              <span :class="['status-badge', clusterHealth?.status]">
                {{ clusterHealth?.status || 'Loading...' }}
              </span>
            </div>
            <div class="metric-trend">
              <ArrowUpOutlined class="trend-up" />
              <span>99.9% uptime</span>
            </div>
          </div>
        </a-col>

        <a-col :xs="24" :sm="12" :lg="6">
          <div class="metric-card nodes-card">
            <div class="metric-header">
              <div class="metric-icon nodes-icon">
                <ClusterOutlined />
              </div>
              <div class="metric-info">
                <h4>Active Nodes</h4>
                <span class="metric-subtitle">Cluster Nodes</span>
              </div>
            </div>
            <div class="metric-value">
              <span class="value-number">{{ clusterHealth?.number_of_nodes || 0 }}</span>
              <span class="value-unit">nodes</span>
            </div>
            <div class="metric-trend">
              <ArrowUpOutlined class="trend-up" />
              <span>+2 this week</span>
            </div>
          </div>
        </a-col>

        <a-col :xs="24" :sm="12" :lg="6">
          <div class="metric-card cpu-card">
            <div class="metric-header">
              <div class="metric-icon cpu-icon">
                <DashboardOutlined />
              </div>
              <div class="metric-info">
                <h4>CPU Usage</h4>
                <span class="metric-subtitle">Average Load</span>
              </div>
            </div>
            <div class="metric-value">
              <span class="value-number">{{ cpuUsage }}</span>
              <span class="value-unit">%</span>
            </div>
            <div class="metric-progress">
              <a-progress
                :percent="cpuUsage"
                :stroke-color="getCpuProgressColor(cpuUsage)"
                :show-info="false"
                size="small"
              />
            </div>
            <div class="metric-trend">
              <ArrowDownOutlined class="trend-down" />
              <span>-5% from yesterday</span>
            </div>
          </div>
        </a-col>

        <a-col :xs="24" :sm="12" :lg="6">
          <div class="metric-card memory-card">
            <div class="metric-header">
              <div class="metric-icon memory-icon">
                <DatabaseOutlined />
              </div>
              <div class="metric-info">
                <h4>Memory Usage</h4>
                <span class="metric-subtitle">RAM Utilization</span>
              </div>
            </div>
            <div class="metric-value">
              <span class="value-number">{{ memoryUsage }}</span>
              <span class="value-unit">%</span>
            </div>
            <div class="metric-progress">
              <a-progress
                :percent="memoryUsage"
                :stroke-color="getMemoryProgressColor(memoryUsage)"
                :show-info="false"
                size="small"
              />
            </div>
            <div class="metric-trend">
              <ArrowUpOutlined class="trend-up" />
              <span>+3% from yesterday</span>
            </div>
          </div>
        </a-col>
      </a-row>

      <!-- Additional Metrics Row -->
      <a-row :gutter="[24, 24]" class="mt-6">
        <a-col :xs="24" :sm="12" :lg="6">
          <div class="metric-card logs-card">
            <div class="metric-header">
              <div class="metric-icon logs-icon">
                <FileTextOutlined />
              </div>
              <div class="metric-info">
                <h4>Log Events</h4>
                <span class="metric-subtitle">Last 24 hours</span>
              </div>
            </div>
            <div class="metric-value">
              <span class="value-number">1.2M</span>
              <span class="value-unit">events</span>
            </div>
            <div class="metric-trend">
              <ArrowUpOutlined class="trend-up" />
              <span>+15% from yesterday</span>
            </div>
          </div>
        </a-col>

        <a-col :xs="24" :sm="12" :lg="6">
          <div class="metric-card errors-card">
            <div class="metric-header">
              <div class="metric-icon errors-icon">
                <ExclamationCircleOutlined />
              </div>
              <div class="metric-info">
                <h4>Error Rate</h4>
                <span class="metric-subtitle">Critical Issues</span>
              </div>
            </div>
            <div class="metric-value">
              <span class="value-number">0.02</span>
              <span class="value-unit">%</span>
            </div>
            <div class="metric-trend">
              <ArrowDownOutlined class="trend-down" />
              <span>-50% from yesterday</span>
            </div>
          </div>
        </a-col>

        <a-col :xs="24" :sm="12" :lg="6">
          <div class="metric-card throughput-card">
            <div class="metric-header">
              <div class="metric-icon throughput-icon">
                <ThunderboltOutlined />
              </div>
              <div class="metric-info">
                <h4>Throughput</h4>
                <span class="metric-subtitle">Requests/sec</span>
              </div>
            </div>
            <div class="metric-value">
              <span class="value-number">2.4K</span>
              <span class="value-unit">req/s</span>
            </div>
            <div class="metric-trend">
              <ArrowUpOutlined class="trend-up" />
              <span>+8% from yesterday</span>
            </div>
          </div>
        </a-col>

        <a-col :xs="24" :sm="12" :lg="6">
          <div class="metric-card storage-card">
            <div class="metric-header">
              <div class="metric-icon storage-icon">
                <HddOutlined />
              </div>
              <div class="metric-info">
                <h4>Storage</h4>
                <span class="metric-subtitle">Disk Usage</span>
              </div>
            </div>
            <div class="metric-value">
              <span class="value-number">68</span>
              <span class="value-unit">%</span>
            </div>
            <div class="metric-progress">
              <a-progress
                :percent="68"
                stroke-color="#52c41a"
                :show-info="false"
                size="small"
              />
            </div>
            <div class="metric-trend">
              <ArrowUpOutlined class="trend-up" />
              <span>+2% from yesterday</span>
            </div>
          </div>
        </a-col>
      </a-row>

      <!-- Charts and Logs -->
      <a-row :gutter="[16, 16]">
        <a-col :xs="24" :lg="12">
          <a-card title="System Metrics" class="dashboard-card">
            <template #extra>
              <a-button type="link" size="small">
                View Details
              </a-button>
            </template>
            <div class="h-64 flex items-center justify-center">
              <a-empty description="Chart will be displayed here">
                <template #image>
                  <BarChartOutlined style="font-size: 48px; color: #d9d9d9;" />
                </template>
              </a-empty>
            </div>
          </a-card>
        </a-col>

        <a-col :xs="24" :lg="12">
          <a-card title="Recent Logs" class="dashboard-card">
            <template #extra>
              <a-button type="link" size="small" @click="$router.push('/logs')">
                View All
              </a-button>
            </template>
            <div v-if="recentLogs.length === 0" class="text-center py-8">
              <a-empty description="No recent logs available">
                <template #image>
                  <FileTextOutlined style="font-size: 48px; color: #d9d9d9;" />
                </template>
              </a-empty>
            </div>
            <a-list v-else :data-source="recentLogs.slice(0, 5)" size="small">
              <template #renderItem="{ item }">
                <a-list-item>
                  <a-list-item-meta>
                    <template #title>
                      <div class="flex items-center space-x-2">
                        <a-tag :color="getLogLevelColor(item._source?.level)">
                          {{ item._source?.level || 'unknown' }}
                        </a-tag>
                        <span class="text-sm">{{ item._source?.message || 'No message' }}</span>
                      </div>
                    </template>
                    <template #description>
                      <span class="text-xs text-gray-500">
                        {{ formatTimestamp(item._source?.['@timestamp']) }}
                      </span>
                    </template>
                  </a-list-item-meta>
                </a-list-item>
              </template>
            </a-list>
          </a-card>
        </a-col>
      </a-row>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import api from '@/services/api'
import {
  ReloadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  ClusterOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  BarChartOutlined,
  FileTextOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ThunderboltOutlined,
  HddOutlined
} from '@ant-design/icons-vue'

const dashboardData = ref<any>({})
const loading = ref(true)

const clusterHealth = computed(() => dashboardData.value.clusterHealth)
const systemMetrics = computed(() => dashboardData.value.systemMetrics)
const recentLogs = computed(() => dashboardData.value.recentLogs?.hits?.hits || [])

const cpuUsage = computed(() => {
  const cpu = systemMetrics.value?.aggregations?.cpu_usage?.value
  return cpu ? Math.round(cpu * 100) : 0
})

const memoryUsage = computed(() => {
  const memory = systemMetrics.value?.aggregations?.memory_usage?.value
  return memory ? Math.round(memory * 100) : 0
})

const fetchDashboardData = async () => {
  try {
    loading.value = true
    const response = await api.get('/dashboard?timeRange=1h')
    dashboardData.value = response.data
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error)
  } finally {
    loading.value = false
  }
}

const getStatusStyle = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'green':
      return { color: '#52c41a' }
    case 'yellow':
      return { color: '#faad14' }
    case 'red':
      return { color: '#f5222d' }
    default:
      return { color: '#d9d9d9' }
  }
}

const getCpuUsageStyle = (usage: number) => {
  if (usage > 80) return { color: '#f5222d' }
  if (usage > 60) return { color: '#faad14' }
  return { color: '#52c41a' }
}

const getMemoryUsageStyle = (usage: number) => {
  if (usage > 85) return { color: '#f5222d' }
  if (usage > 70) return { color: '#faad14' }
  return { color: '#52c41a' }
}

const getCpuProgressColor = (usage: number) => {
  if (usage > 80) return '#f5222d'
  if (usage > 60) return '#faad14'
  return '#52c41a'
}

const getMemoryProgressColor = (usage: number) => {
  if (usage > 85) return '#f5222d'
  if (usage > 70) return '#faad14'
  return '#52c41a'
}

const getLogLevelColor = (level: string) => {
  switch (level?.toLowerCase()) {
    case 'error':
      return 'red'
    case 'warn':
    case 'warning':
      return 'orange'
    case 'info':
      return 'blue'
    case 'debug':
      return 'gray'
    default:
      return 'default'
  }
}

const formatTimestamp = (timestamp: string) => {
  if (!timestamp) return 'Unknown time'
  return new Date(timestamp).toLocaleString()
}

onMounted(() => {
  fetchDashboardData()
  // Refresh data every 30 seconds
  setInterval(fetchDashboardData, 30000)
})
</script>

<style scoped>
/* Modern Dashboard Styles */
.space-y-6 > * + * {
  margin-top: 24px;
}

.mb-6 {
  margin-bottom: 24px;
}

.mt-6 {
  margin-top: 24px;
}

/* Modern Metric Cards */
.metric-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.metric-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.metric-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #1890ff 0%, #096dd9 100%);
}

.metric-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.metric-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

.cluster-icon {
  background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
  box-shadow: 0 4px 12px rgba(82, 196, 26, 0.3);
}

.nodes-icon {
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

.cpu-icon {
  background: linear-gradient(135deg, #faad14 0%, #d48806 100%);
  box-shadow: 0 4px 12px rgba(250, 173, 20, 0.3);
}

.memory-icon {
  background: linear-gradient(135deg, #722ed1 0%, #531dab 100%);
  box-shadow: 0 4px 12px rgba(114, 46, 209, 0.3);
}

.logs-icon {
  background: linear-gradient(135deg, #13c2c2 0%, #08979c 100%);
  box-shadow: 0 4px 12px rgba(19, 194, 194, 0.3);
}

.errors-icon {
  background: linear-gradient(135deg, #f5222d 0%, #cf1322 100%);
  box-shadow: 0 4px 12px rgba(245, 34, 45, 0.3);
}

.throughput-icon {
  background: linear-gradient(135deg, #fa8c16 0%, #d46b08 100%);
  box-shadow: 0 4px 12px rgba(250, 140, 22, 0.3);
}

.storage-icon {
  background: linear-gradient(135deg, #eb2f96 0%, #c41d7f 100%);
  box-shadow: 0 4px 12px rgba(235, 47, 150, 0.3);
}

.metric-info h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  line-height: 1.2;
}

.metric-subtitle {
  font-size: 12px;
  color: #8c8c8c;
  font-weight: 400;
}

.metric-value {
  margin-bottom: 12px;
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.value-number {
  font-size: 32px;
  font-weight: 700;
  color: #262626;
  line-height: 1;
}

.value-unit {
  font-size: 16px;
  color: #8c8c8c;
  font-weight: 500;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.green {
  background: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.status-badge.yellow {
  background: #fffbe6;
  color: #faad14;
  border: 1px solid #ffe58f;
}

.status-badge.red {
  background: #fff2f0;
  color: #f5222d;
  border: 1px solid #ffccc7;
}

.metric-progress {
  margin-bottom: 12px;
}

.metric-trend {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #8c8c8c;
}

.trend-up {
  color: #52c41a;
}

.trend-down {
  color: #f5222d;
}

/* Dashboard Cards */
.dashboard-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}

.dashboard-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.dashboard-card .ant-card-head {
  border-bottom: 1px solid #f0f0f0;
  padding: 16px 24px;
}

.dashboard-card .ant-card-head-title {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.dashboard-card .ant-card-body {
  padding: 24px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .metric-card {
    padding: 20px;
  }

  .metric-icon {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }

  .value-number {
    font-size: 28px;
  }

  .metric-info h4 {
    font-size: 14px;
  }
}

@media (max-width: 576px) {
  .metric-card {
    padding: 16px;
  }

  .metric-header {
    gap: 12px;
    margin-bottom: 12px;
  }

  .metric-icon {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }

  .value-number {
    font-size: 24px;
  }

  .metric-info h4 {
    font-size: 13px;
  }

  .metric-subtitle {
    font-size: 11px;
  }
}
</style>
