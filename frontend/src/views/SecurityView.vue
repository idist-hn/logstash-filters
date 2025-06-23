<template>
  <AppLayout>
    <div class="security-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">Security & Compliance</h1>
          <p class="page-description">Monitor security posture and compliance status</p>
        </div>
        <div class="header-actions">
          <a-button @click="runSecurityScan" :loading="scanning">
            <ScanOutlined />
            Run Security Scan
          </a-button>
          <a-button type="primary" @click="showPolicyModal = true">
            <PlusOutlined />
            Add Policy
          </a-button>
        </div>
      </div>

      <!-- Security Overview -->
      <a-row :gutter="[24, 24]" class="stats-row">
        <a-col :xs="24" :sm="12" :lg="6">
          <div class="stat-card security-score">
            <div class="stat-icon">
              <ShieldCheckOutlined />
            </div>
            <div class="stat-content">
              <h3>Security Score</h3>
              <span class="stat-value">{{ securityStats.score }}/100</span>
              <span class="stat-trend positive">+5 this week</span>
            </div>
          </div>
        </a-col>
        <a-col :xs="24" :sm="12" :lg="6">
          <div class="stat-card vulnerabilities">
            <div class="stat-icon">
              <BugOutlined />
            </div>
            <div class="stat-content">
              <h3>Vulnerabilities</h3>
              <span class="stat-value">{{ securityStats.vulnerabilities }}</span>
              <span class="stat-trend negative">{{ securityStats.critical }} critical</span>
            </div>
          </div>
        </a-col>
        <a-col :xs="24" :sm="12" :lg="6">
          <div class="stat-card compliance">
            <div class="stat-icon">
              <CheckCircleOutlined />
            </div>
            <div class="stat-content">
              <h3>Compliance</h3>
              <span class="stat-value">{{ securityStats.compliance }}%</span>
              <span class="stat-trend">SOC 2, ISO 27001</span>
            </div>
          </div>
        </a-col>
        <a-col :xs="24" :sm="12" :lg="6">
          <div class="stat-card incidents">
            <div class="stat-icon">
              <ExclamationTriangleOutlined />
            </div>
            <div class="stat-content">
              <h3>Security Incidents</h3>
              <span class="stat-value">{{ securityStats.incidents }}</span>
              <span class="stat-trend">Last 30 days</span>
            </div>
          </div>
        </a-col>
      </a-row>

      <!-- Security Dashboard -->
      <a-row :gutter="[24, 24]">
        <!-- Threat Detection -->
        <a-col :xs="24" :lg="12">
          <a-card title="Threat Detection" class="security-card">
            <template #extra>
              <a-button type="link" size="small">
                View All
              </a-button>
            </template>
            
            <div class="threat-list">
              <div v-for="threat in threats" :key="threat.id" class="threat-item" :class="threat.severity">
                <div class="threat-icon">
                  <ExclamationCircleOutlined v-if="threat.severity === 'high'" />
                  <WarningOutlined v-else-if="threat.severity === 'medium'" />
                  <InfoCircleOutlined v-else />
                </div>
                <div class="threat-content">
                  <h4 class="threat-title">{{ threat.title }}</h4>
                  <p class="threat-description">{{ threat.description }}</p>
                  <div class="threat-meta">
                    <span class="threat-source">{{ threat.source }}</span>
                    <span class="threat-time">{{ formatTime(threat.timestamp) }}</span>
                  </div>
                </div>
                <div class="threat-actions">
                  <a-button size="small" @click="investigateThreat(threat)">
                    Investigate
                  </a-button>
                </div>
              </div>
            </div>
          </a-card>
        </a-col>

        <!-- Access Control -->
        <a-col :xs="24" :lg="12">
          <a-card title="Access Control" class="security-card">
            <template #extra>
              <a-button type="link" size="small">
                Manage Permissions
              </a-button>
            </template>
            
            <div class="access-overview">
              <div class="access-item">
                <div class="access-info">
                  <h4>Active Sessions</h4>
                  <span class="access-value">{{ accessStats.activeSessions }}</span>
                </div>
                <div class="access-chart">
                  <a-progress 
                    type="circle" 
                    :percent="75" 
                    :width="60"
                    :stroke-color="'#52c41a'"
                  />
                </div>
              </div>
              
              <div class="access-item">
                <div class="access-info">
                  <h4>Failed Logins</h4>
                  <span class="access-value">{{ accessStats.failedLogins }}</span>
                </div>
                <div class="access-chart">
                  <a-progress 
                    type="circle" 
                    :percent="25" 
                    :width="60"
                    :stroke-color="'#faad14'"
                  />
                </div>
              </div>
              
              <div class="access-item">
                <div class="access-info">
                  <h4>Privileged Users</h4>
                  <span class="access-value">{{ accessStats.privilegedUsers }}</span>
                </div>
                <div class="access-chart">
                  <a-progress 
                    type="circle" 
                    :percent="15" 
                    :width="60"
                    :stroke-color="'#1890ff'"
                  />
                </div>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>

      <!-- Security Policies -->
      <a-card title="Security Policies" class="policies-card">
        <template #extra>
          <a-space>
            <a-button @click="exportPolicies">
              <ExportOutlined />
              Export
            </a-button>
            <a-button type="primary" @click="showPolicyModal = true">
              <PlusOutlined />
              Add Policy
            </a-button>
          </a-space>
        </template>
        
        <a-table
          :columns="policyColumns"
          :data-source="policies"
          :pagination="{ pageSize: 10 }"
          size="middle"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <a-switch 
                v-model:checked="record.enabled" 
                :checked-children="'ON'" 
                :un-checked-children="'OFF'"
                @change="togglePolicy(record)"
              />
            </template>
            <template v-else-if="column.key === 'severity'">
              <a-tag :color="getSeverityColor(record.severity)">
                {{ record.severity.toUpperCase() }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'compliance'">
              <a-tag v-for="standard in record.compliance" :key="standard" color="blue">
                {{ standard }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'actions'">
              <a-space>
                <a-button type="link" size="small" @click="editPolicy(record)">Edit</a-button>
                <a-button type="link" size="small" @click="testPolicy(record)">Test</a-button>
                <a-button type="link" size="small" danger @click="deletePolicy(record)">Delete</a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-card>

      <!-- Audit Logs -->
      <a-card title="Recent Audit Logs" class="audit-card">
        <template #extra>
          <a-button type="link" @click="viewAllAuditLogs">
            View All Logs
          </a-button>
        </template>
        
        <a-table
          :columns="auditColumns"
          :data-source="auditLogs"
          :pagination="{ pageSize: 5 }"
          size="small"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'action'">
              <a-tag :color="getActionColor(record.action)">
                {{ record.action }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'result'">
              <a-badge 
                :status="record.result === 'success' ? 'success' : 'error'" 
                :text="record.result" 
              />
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
  ScanOutlined,
  PlusOutlined,
  ShieldCheckOutlined,
  BugOutlined,
  CheckCircleOutlined,
  ExclamationTriangleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  ExportOutlined
} from '@ant-design/icons-vue'

const scanning = ref(false)
const showPolicyModal = ref(false)

const securityStats = reactive({
  score: 87,
  vulnerabilities: 12,
  critical: 2,
  compliance: 94,
  incidents: 3
})

const accessStats = reactive({
  activeSessions: 156,
  failedLogins: 23,
  privilegedUsers: 12
})

const threats = ref([
  {
    id: 1,
    title: 'Suspicious Login Activity',
    description: 'Multiple failed login attempts from unknown IP address',
    severity: 'high',
    source: 'Authentication System',
    timestamp: new Date(Date.now() - 10 * 60 * 1000)
  },
  {
    id: 2,
    title: 'Unusual Data Access Pattern',
    description: 'Large volume of data accessed outside business hours',
    severity: 'medium',
    source: 'Data Access Monitor',
    timestamp: new Date(Date.now() - 30 * 60 * 1000)
  },
  {
    id: 3,
    title: 'Outdated Security Certificate',
    description: 'SSL certificate expires in 7 days',
    severity: 'low',
    source: 'Certificate Monitor',
    timestamp: new Date(Date.now() - 60 * 60 * 1000)
  }
])

const policyColumns = [
  { title: 'Policy Name', dataIndex: 'name', key: 'name' },
  { title: 'Description', dataIndex: 'description', key: 'description' },
  { title: 'Severity', dataIndex: 'severity', key: 'severity' },
  { title: 'Compliance', dataIndex: 'compliance', key: 'compliance' },
  { title: 'Status', dataIndex: 'enabled', key: 'status' },
  { title: 'Actions', key: 'actions' }
]

const policies = ref([
  {
    key: '1',
    name: 'Password Policy',
    description: 'Enforce strong password requirements',
    severity: 'high',
    compliance: ['SOC 2', 'ISO 27001'],
    enabled: true
  },
  {
    key: '2',
    name: 'Data Encryption',
    description: 'Require encryption for sensitive data',
    severity: 'critical',
    compliance: ['GDPR', 'SOC 2'],
    enabled: true
  },
  {
    key: '3',
    name: 'Access Control',
    description: 'Role-based access control enforcement',
    severity: 'high',
    compliance: ['ISO 27001'],
    enabled: true
  }
])

const auditColumns = [
  { title: 'Timestamp', dataIndex: 'timestamp', key: 'timestamp' },
  { title: 'User', dataIndex: 'user', key: 'user' },
  { title: 'Action', dataIndex: 'action', key: 'action' },
  { title: 'Resource', dataIndex: 'resource', key: 'resource' },
  { title: 'Result', dataIndex: 'result', key: 'result' }
]

const auditLogs = ref([
  {
    key: '1',
    timestamp: '2024-01-15 14:30:25',
    user: 'admin@platform.com',
    action: 'LOGIN',
    resource: 'Platform Dashboard',
    result: 'success'
  },
  {
    key: '2',
    timestamp: '2024-01-15 14:25:12',
    user: 'operator@platform.com',
    action: 'CREATE',
    resource: 'Customer: TechCorp',
    result: 'success'
  },
  {
    key: '3',
    timestamp: '2024-01-15 14:20:45',
    user: 'unknown@external.com',
    action: 'LOGIN',
    resource: 'Platform Dashboard',
    result: 'failed'
  }
])

const runSecurityScan = async () => {
  scanning.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 2000))
    console.log('Security scan completed')
  } finally {
    scanning.value = false
  }
}

const investigateThreat = (threat: any) => {
  console.log('Investigate threat:', threat)
}

const togglePolicy = (policy: any) => {
  console.log('Toggle policy:', policy)
}

const editPolicy = (policy: any) => {
  console.log('Edit policy:', policy)
}

const testPolicy = (policy: any) => {
  console.log('Test policy:', policy)
}

const deletePolicy = (policy: any) => {
  console.log('Delete policy:', policy)
}

const exportPolicies = () => {
  console.log('Export policies')
}

const viewAllAuditLogs = () => {
  console.log('View all audit logs')
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical': return 'red'
    case 'high': return 'orange'
    case 'medium': return 'yellow'
    case 'low': return 'blue'
    default: return 'default'
  }
}

const getActionColor = (action: string) => {
  switch (action) {
    case 'LOGIN': return 'blue'
    case 'CREATE': return 'green'
    case 'UPDATE': return 'orange'
    case 'DELETE': return 'red'
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
.security-container {
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

.stat-card.security-score .stat-icon {
  background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
}

.stat-card.vulnerabilities .stat-icon {
  background: linear-gradient(135deg, #f5222d 0%, #cf1322 100%);
}

.stat-card.compliance .stat-icon {
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
}

.stat-card.incidents .stat-icon {
  background: linear-gradient(135deg, #faad14 0%, #d48806 100%);
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
  margin-top: 4px;
  display: block;
}

.stat-trend.positive {
  color: #52c41a;
}

.stat-trend.negative {
  color: #f5222d;
}

.security-card, .policies-card, .audit-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
  margin-bottom: 24px;
}

.threat-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.threat-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid;
  background: #fafafa;
}

.threat-item.high {
  border-left-color: #f5222d;
  background: #fff2f0;
}

.threat-item.medium {
  border-left-color: #faad14;
  background: #fffbe6;
}

.threat-item.low {
  border-left-color: #1890ff;
  background: #f0f5ff;
}

.threat-icon {
  font-size: 16px;
  margin-top: 2px;
}

.threat-item.high .threat-icon {
  color: #f5222d;
}

.threat-item.medium .threat-icon {
  color: #faad14;
}

.threat-item.low .threat-icon {
  color: #1890ff;
}

.threat-content {
  flex: 1;
}

.threat-title {
  font-size: 14px;
  font-weight: 600;
  color: #262626;
  margin: 0 0 4px 0;
}

.threat-description {
  font-size: 12px;
  color: #595959;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.threat-meta {
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: #8c8c8c;
}

.access-overview {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.access-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.access-info h4 {
  font-size: 14px;
  font-weight: 600;
  color: #262626;
  margin: 0 0 4px 0;
}

.access-value {
  font-size: 20px;
  font-weight: 700;
  color: #262626;
}
</style>
