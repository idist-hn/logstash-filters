<template>
  <AppLayout>
    <div class="alerts-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">Alert Management</h1>
          <p class="page-description">Monitor and manage platform alerts and notifications</p>
        </div>
        <div class="header-actions">
          <a-select v-model:value="selectedSeverity" style="width: 120px" @change="filterAlerts">
            <a-select-option value="all">All Severity</a-select-option>
            <a-select-option value="critical">Critical</a-select-option>
            <a-select-option value="warning">Warning</a-select-option>
            <a-select-option value="info">Info</a-select-option>
          </a-select>
          <a-button type="primary" @click="showCreateAlert = true">
            <PlusOutlined />
            Create Alert Rule
          </a-button>
        </div>
      </div>

      <!-- Alert Stats -->
      <a-row :gutter="[24, 24]" class="stats-row">
        <a-col :xs="24" :sm="12" :lg="6">
          <div class="stat-card critical">
            <div class="stat-icon">
              <ExclamationCircleOutlined />
            </div>
            <div class="stat-content">
              <h3>Critical Alerts</h3>
              <span class="stat-value">{{ alertStats.critical }}</span>
              <span class="stat-trend">Active now</span>
            </div>
          </div>
        </a-col>
        <a-col :xs="24" :sm="12" :lg="6">
          <div class="stat-card warning">
            <div class="stat-icon">
              <WarningOutlined />
            </div>
            <div class="stat-content">
              <h3>Warning Alerts</h3>
              <span class="stat-value">{{ alertStats.warning }}</span>
              <span class="stat-trend">Needs attention</span>
            </div>
          </div>
        </a-col>
        <a-col :xs="24" :sm="12" :lg="6">
          <div class="stat-card resolved">
            <div class="stat-icon">
              <CheckCircleOutlined />
            </div>
            <div class="stat-content">
              <h3>Resolved Today</h3>
              <span class="stat-value">{{ alertStats.resolved }}</span>
              <span class="stat-trend">+12 from yesterday</span>
            </div>
          </div>
        </a-col>
        <a-col :xs="24" :sm="12" :lg="6">
          <div class="stat-card rules">
            <div class="stat-icon">
              <SettingOutlined />
            </div>
            <div class="stat-content">
              <h3>Alert Rules</h3>
              <span class="stat-value">{{ alertStats.rules }}</span>
              <span class="stat-trend">{{ alertStats.activeRules }} active</span>
            </div>
          </div>
        </a-col>
      </a-row>

      <!-- Active Alerts -->
      <a-card title="Active Alerts" class="alerts-card">
        <template #extra>
          <a-space>
            <a-button @click="markAllRead">Mark All Read</a-button>
            <a-button type="primary" @click="refreshAlerts">
              <ReloadOutlined />
              Refresh
            </a-button>
          </a-space>
        </template>
        
        <div class="alerts-list">
          <div v-for="alert in activeAlerts" :key="alert.id" class="alert-item" :class="alert.severity">
            <div class="alert-icon">
              <ExclamationCircleOutlined v-if="alert.severity === 'critical'" />
              <WarningOutlined v-else-if="alert.severity === 'warning'" />
              <InfoCircleOutlined v-else />
            </div>
            <div class="alert-content">
              <h4 class="alert-title">{{ alert.title }}</h4>
              <p class="alert-message">{{ alert.message }}</p>
              <div class="alert-meta">
                <span class="alert-source">{{ alert.source }}</span>
                <span class="alert-time">{{ formatTime(alert.timestamp) }}</span>
              </div>
            </div>
            <div class="alert-actions">
              <a-dropdown>
                <a-button type="text">
                  <MoreOutlined />
                </a-button>
                <template #overlay>
                  <a-menu>
                    <a-menu-item key="acknowledge" @click="acknowledgeAlert(alert)">
                      <CheckOutlined />
                      Acknowledge
                    </a-menu-item>
                    <a-menu-item key="resolve" @click="resolveAlert(alert)">
                      <CheckCircleOutlined />
                      Resolve
                    </a-menu-item>
                    <a-menu-item key="escalate" @click="escalateAlert(alert)">
                      <ArrowUpOutlined />
                      Escalate
                    </a-menu-item>
                    <a-menu-divider />
                    <a-menu-item key="mute" @click="muteAlert(alert)">
                      <SoundOutlined />
                      Mute
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </div>
          </div>
        </div>
      </a-card>

      <!-- Alert Rules -->
      <a-card title="Alert Rules" class="rules-card">
        <template #extra>
          <a-button type="primary" @click="showCreateRule = true">
            <PlusOutlined />
            Add Rule
          </a-button>
        </template>
        
        <a-table
          :columns="ruleColumns"
          :data-source="alertRules"
          :pagination="{ pageSize: 10 }"
          size="middle"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <a-switch 
                v-model:checked="record.enabled" 
                :checked-children="'ON'" 
                :un-checked-children="'OFF'"
                @change="toggleRule(record)"
              />
            </template>
            <template v-else-if="column.key === 'severity'">
              <a-tag :color="getSeverityColor(record.severity)">
                {{ record.severity.toUpperCase() }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'actions'">
              <a-space>
                <a-button type="link" size="small" @click="editRule(record)">Edit</a-button>
                <a-button type="link" size="small" danger @click="deleteRule(record)">Delete</a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import {
  PlusOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  SettingOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  MoreOutlined,
  CheckOutlined,
  ArrowUpOutlined,
  SoundOutlined
} from '@ant-design/icons-vue'

const selectedSeverity = ref('all')
const showCreateAlert = ref(false)
const showCreateRule = ref(false)

const alertStats = reactive({
  critical: 3,
  warning: 12,
  resolved: 45,
  rules: 28,
  activeRules: 24
})

const activeAlerts = ref([
  {
    id: 1,
    title: 'High CPU Usage',
    message: 'CPU usage exceeded 85% threshold on node-01',
    severity: 'critical',
    source: 'Infrastructure Monitor',
    timestamp: new Date(Date.now() - 5 * 60 * 1000)
  },
  {
    id: 2,
    title: 'Memory Warning',
    message: 'Memory usage is approaching 80% on multiple nodes',
    severity: 'warning',
    source: 'Resource Monitor',
    timestamp: new Date(Date.now() - 15 * 60 * 1000)
  },
  {
    id: 3,
    title: 'Disk Space Low',
    message: 'Available disk space is below 15% on storage cluster',
    severity: 'warning',
    source: 'Storage Monitor',
    timestamp: new Date(Date.now() - 30 * 60 * 1000)
  }
])

const ruleColumns = [
  { title: 'Rule Name', dataIndex: 'name', key: 'name' },
  { title: 'Condition', dataIndex: 'condition', key: 'condition' },
  { title: 'Severity', dataIndex: 'severity', key: 'severity' },
  { title: 'Status', dataIndex: 'enabled', key: 'status' },
  { title: 'Actions', key: 'actions' }
]

const alertRules = ref([
  {
    key: '1',
    name: 'High CPU Usage',
    condition: 'CPU > 80% for 5 minutes',
    severity: 'warning',
    enabled: true
  },
  {
    key: '2',
    name: 'Memory Critical',
    condition: 'Memory > 90% for 2 minutes',
    severity: 'critical',
    enabled: true
  },
  {
    key: '3',
    name: 'Disk Space Low',
    condition: 'Disk usage > 85%',
    severity: 'warning',
    enabled: false
  }
])

const filterAlerts = () => {
  console.log('Filter alerts by severity:', selectedSeverity.value)
}

const markAllRead = () => {
  console.log('Mark all alerts as read')
}

const refreshAlerts = () => {
  console.log('Refresh alerts')
}

const acknowledgeAlert = (alert: any) => {
  console.log('Acknowledge alert:', alert)
}

const resolveAlert = (alert: any) => {
  console.log('Resolve alert:', alert)
}

const escalateAlert = (alert: any) => {
  console.log('Escalate alert:', alert)
}

const muteAlert = (alert: any) => {
  console.log('Mute alert:', alert)
}

const toggleRule = (rule: any) => {
  console.log('Toggle rule:', rule)
}

const editRule = (rule: any) => {
  console.log('Edit rule:', rule)
}

const deleteRule = (rule: any) => {
  console.log('Delete rule:', rule)
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical': return 'red'
    case 'warning': return 'orange'
    case 'info': return 'blue'
    default: return 'default'
  }
}

const formatTime = (timestamp: Date) => {
  const now = new Date()
  const diff = now.getTime() - timestamp.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
</script>

<style scoped>
.alerts-container {
  width: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #262626;
  margin: 0 0 8px 0;
}

.page-description {
  font-size: 16px;
  color: #8c8c8c;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.stats-row {
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
}

.stat-card.critical .stat-icon {
  background: linear-gradient(135deg, #f5222d 0%, #cf1322 100%);
}

.stat-card.warning .stat-icon {
  background: linear-gradient(135deg, #faad14 0%, #d48806 100%);
}

.stat-card.resolved .stat-icon {
  background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
}

.stat-card.rules .stat-icon {
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
}

.stat-content h3 {
  font-size: 14px;
  color: #8c8c8c;
  margin: 0 0 4px 0;
  font-weight: 500;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #262626;
  display: block;
  line-height: 1.2;
}

.stat-trend {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 4px;
  display: block;
}

.alerts-card, .rules-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
  margin-bottom: 24px;
}

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.alert-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid;
  background: #fafafa;
}

.alert-item.critical {
  border-left-color: #f5222d;
  background: #fff2f0;
}

.alert-item.warning {
  border-left-color: #faad14;
  background: #fffbe6;
}

.alert-item.info {
  border-left-color: #1890ff;
  background: #f0f5ff;
}

.alert-icon {
  font-size: 20px;
  margin-top: 2px;
}

.alert-item.critical .alert-icon {
  color: #f5222d;
}

.alert-item.warning .alert-icon {
  color: #faad14;
}

.alert-item.info .alert-icon {
  color: #1890ff;
}

.alert-content {
  flex: 1;
}

.alert-title {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  margin: 0 0 8px 0;
}

.alert-message {
  font-size: 14px;
  color: #595959;
  margin: 0 0 12px 0;
  line-height: 1.5;
}

.alert-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #8c8c8c;
}

.alert-actions {
  margin-left: auto;
}
</style>
