<template>
  <AppLayout>
    <div class="settings-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">Settings</h1>
          <p class="page-description">Configure your CloudWatch monitoring preferences</p>
        </div>
      </div>

      <!-- Settings Navigation -->
      <div class="settings-layout">
        <div class="settings-sidebar">
          <a-menu
            v-model:selected-keys="selectedKeys"
            mode="inline"
            class="settings-menu"
          >
            <a-menu-item key="general" @click="activeTab = 'general'">
              <SettingOutlined />
              <span>General</span>
            </a-menu-item>
            <a-menu-item key="notifications" @click="activeTab = 'notifications'">
              <BellOutlined />
              <span>Notifications</span>
            </a-menu-item>
            <a-menu-item key="alerts" @click="activeTab = 'alerts'">
              <AlertOutlined />
              <span>Alert Rules</span>
            </a-menu-item>
            <a-menu-item key="integrations" @click="activeTab = 'integrations'">
              <ApiOutlined />
              <span>Integrations</span>
            </a-menu-item>
            <a-menu-item key="users" @click="activeTab = 'users'">
              <TeamOutlined />
              <span>Users & Roles</span>
            </a-menu-item>
            <a-menu-item key="security" @click="activeTab = 'security'">
              <SecurityScanOutlined />
              <span>Security</span>
            </a-menu-item>
          </a-menu>
        </div>

        <div class="settings-content">
          <!-- General Settings -->
          <div v-if="activeTab === 'general'" class="settings-panel">
            <a-card title="General Preferences" class="settings-card">
              <a-form layout="vertical">
                <a-row :gutter="24">
                  <a-col :span="12">
                    <a-form-item label="Default Time Range">
                      <a-select v-model:value="settings.defaultTimeRange" style="width: 100%">
                        <a-select-option value="15m">Last 15 minutes</a-select-option>
                        <a-select-option value="1h">Last hour</a-select-option>
                        <a-select-option value="6h">Last 6 hours</a-select-option>
                        <a-select-option value="24h">Last 24 hours</a-select-option>
                      </a-select>
                    </a-form-item>
                  </a-col>
                  <a-col :span="12">
                    <a-form-item label="Refresh Interval">
                      <a-select v-model:value="settings.refreshInterval" style="width: 100%">
                        <a-select-option value="10">10 seconds</a-select-option>
                        <a-select-option value="30">30 seconds</a-select-option>
                        <a-select-option value="60">1 minute</a-select-option>
                        <a-select-option value="300">5 minutes</a-select-option>
                      </a-select>
                    </a-form-item>
                  </a-col>
                </a-row>
                
                <a-form-item label="Theme">
                  <a-radio-group v-model:value="settings.theme">
                    <a-radio value="light">Light</a-radio>
                    <a-radio value="dark">Dark</a-radio>
                    <a-radio value="auto">Auto</a-radio>
                  </a-radio-group>
                </a-form-item>

                <a-form-item>
                  <a-checkbox v-model:checked="settings.enableAnimations">
                    Enable animations
                  </a-checkbox>
                </a-form-item>

                <a-form-item>
                  <a-checkbox v-model:checked="settings.enableSounds">
                    Enable notification sounds
                  </a-checkbox>
                </a-form-item>
              </a-form>
            </a-card>

            <a-card title="Data Retention" class="settings-card">
              <a-form layout="vertical">
                <a-form-item label="Log Retention Period">
                  <a-select v-model:value="settings.logRetention" style="width: 200px">
                    <a-select-option value="7">7 days</a-select-option>
                    <a-select-option value="30">30 days</a-select-option>
                    <a-select-option value="90">90 days</a-select-option>
                    <a-select-option value="365">1 year</a-select-option>
                  </a-select>
                </a-form-item>
                
                <a-form-item label="Metrics Retention Period">
                  <a-select v-model:value="settings.metricsRetention" style="width: 200px">
                    <a-select-option value="30">30 days</a-select-option>
                    <a-select-option value="90">90 days</a-select-option>
                    <a-select-option value="365">1 year</a-select-option>
                    <a-select-option value="1095">3 years</a-select-option>
                  </a-select>
                </a-form-item>
              </a-form>
            </a-card>
          </div>

          <!-- Notifications Settings -->
          <div v-if="activeTab === 'notifications'" class="settings-panel">
            <a-card title="Notification Preferences" class="settings-card">
              <a-form layout="vertical">
                <a-form-item label="Email Notifications">
                  <a-checkbox-group v-model:value="settings.emailNotifications">
                    <a-checkbox value="alerts">Critical alerts</a-checkbox>
                    <a-checkbox value="reports">Daily reports</a-checkbox>
                    <a-checkbox value="maintenance">Maintenance notifications</a-checkbox>
                    <a-checkbox value="updates">System updates</a-checkbox>
                  </a-checkbox-group>
                </a-form-item>

                <a-form-item label="Slack Integration">
                  <a-input 
                    v-model:value="settings.slackWebhook" 
                    placeholder="https://hooks.slack.com/services/..."
                    style="width: 400px"
                  />
                </a-form-item>

                <a-form-item label="Notification Frequency">
                  <a-radio-group v-model:value="settings.notificationFrequency">
                    <a-radio value="immediate">Immediate</a-radio>
                    <a-radio value="hourly">Hourly digest</a-radio>
                    <a-radio value="daily">Daily digest</a-radio>
                  </a-radio-group>
                </a-form-item>
              </a-form>
            </a-card>
          </div>

          <!-- Alert Rules -->
          <div v-if="activeTab === 'alerts'" class="settings-panel">
            <a-card title="Alert Rules" class="settings-card">
              <template #extra>
                <a-button type="primary" @click="showCreateAlert = true">
                  <PlusOutlined />
                  Create Rule
                </a-button>
              </template>
              
              <a-table
                :columns="alertColumns"
                :data-source="alertRules"
                :pagination="false"
                size="middle"
              >
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'status'">
                    <a-switch 
                      v-model:checked="record.enabled" 
                      :checked-children="'ON'" 
                      :un-checked-children="'OFF'"
                    />
                  </template>
                  <template v-else-if="column.key === 'severity'">
                    <a-tag :color="getSeverityColor(record.severity)">
                      {{ record.severity.toUpperCase() }}
                    </a-tag>
                  </template>
                  <template v-else-if="column.key === 'actions'">
                    <a-space>
                      <a-button type="link" size="small">Edit</a-button>
                      <a-button type="link" size="small" danger>Delete</a-button>
                    </a-space>
                  </template>
                </template>
              </a-table>
            </a-card>
          </div>

          <!-- Integrations -->
          <div v-if="activeTab === 'integrations'" class="settings-panel">
            <a-card title="External Integrations" class="settings-card">
              <a-row :gutter="[24, 24]">
                <a-col :span="8" v-for="integration in integrations" :key="integration.name">
                  <div class="integration-card">
                    <div class="integration-icon">
                      <component :is="integration.icon" />
                    </div>
                    <h4>{{ integration.name }}</h4>
                    <p>{{ integration.description }}</p>
                    <a-button 
                      :type="integration.connected ? 'default' : 'primary'"
                      block
                      @click="toggleIntegration(integration)"
                    >
                      {{ integration.connected ? 'Disconnect' : 'Connect' }}
                    </a-button>
                  </div>
                </a-col>
              </a-row>
            </a-card>
          </div>

          <!-- Users & Roles -->
          <div v-if="activeTab === 'users'" class="settings-panel">
            <a-card title="User Management" class="settings-card">
              <template #extra>
                <a-button type="primary">
                  <UserAddOutlined />
                  Add User
                </a-button>
              </template>
              
              <a-table
                :columns="userColumns"
                :data-source="users"
                :pagination="{ pageSize: 10 }"
                size="middle"
              >
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'role'">
                    <a-tag :color="getRoleColor(record.role)">
                      {{ record.role }}
                    </a-tag>
                  </template>
                  <template v-else-if="column.key === 'status'">
                    <a-badge 
                      :status="record.active ? 'success' : 'default'" 
                      :text="record.active ? 'Active' : 'Inactive'" 
                    />
                  </template>
                  <template v-else-if="column.key === 'actions'">
                    <a-space>
                      <a-button type="link" size="small">Edit</a-button>
                      <a-button type="link" size="small" danger>Deactivate</a-button>
                    </a-space>
                  </template>
                </template>
              </a-table>
            </a-card>
          </div>

          <!-- Security -->
          <div v-if="activeTab === 'security'" class="settings-panel">
            <a-card title="Security Settings" class="settings-card">
              <a-form layout="vertical">
                <a-form-item label="Session Timeout">
                  <a-select v-model:value="settings.sessionTimeout" style="width: 200px">
                    <a-select-option value="30">30 minutes</a-select-option>
                    <a-select-option value="60">1 hour</a-select-option>
                    <a-select-option value="240">4 hours</a-select-option>
                    <a-select-option value="480">8 hours</a-select-option>
                  </a-select>
                </a-form-item>

                <a-form-item>
                  <a-checkbox v-model:checked="settings.requireMFA">
                    Require Multi-Factor Authentication
                  </a-checkbox>
                </a-form-item>

                <a-form-item>
                  <a-checkbox v-model:checked="settings.enableAuditLog">
                    Enable audit logging
                  </a-checkbox>
                </a-form-item>

                <a-form-item label="API Rate Limiting">
                  <a-input-number 
                    v-model:value="settings.apiRateLimit" 
                    :min="100" 
                    :max="10000"
                    style="width: 200px"
                  />
                  <span style="margin-left: 8px">requests per minute</span>
                </a-form-item>
              </a-form>
            </a-card>
          </div>

          <!-- Save Button -->
          <div class="settings-actions">
            <a-space>
              <a-button @click="resetSettings">Reset to Defaults</a-button>
              <a-button type="primary" @click="saveSettings" :loading="saving">
                Save Changes
              </a-button>
            </a-space>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import {
  SettingOutlined,
  BellOutlined,
  AlertOutlined,
  ApiOutlined,
  TeamOutlined,
  SecurityScanOutlined,
  PlusOutlined,
  UserAddOutlined,
  SlackOutlined,
  GithubOutlined,
  MailOutlined
} from '@ant-design/icons-vue'

const activeTab = ref('general')
const selectedKeys = ref(['general'])
const saving = ref(false)
const showCreateAlert = ref(false)

const settings = reactive({
  defaultTimeRange: '1h',
  refreshInterval: '30',
  theme: 'light',
  enableAnimations: true,
  enableSounds: true,
  logRetention: '30',
  metricsRetention: '90',
  emailNotifications: ['alerts', 'reports'],
  slackWebhook: '',
  notificationFrequency: 'immediate',
  sessionTimeout: '60',
  requireMFA: false,
  enableAuditLog: true,
  apiRateLimit: 1000
})

const alertColumns = [
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

const userColumns = [
  { title: 'Username', dataIndex: 'username', key: 'username' },
  { title: 'Email', dataIndex: 'email', key: 'email' },
  { title: 'Role', dataIndex: 'role', key: 'role' },
  { title: 'Status', dataIndex: 'active', key: 'status' },
  { title: 'Last Login', dataIndex: 'lastLogin', key: 'lastLogin' },
  { title: 'Actions', key: 'actions' }
]

const users = ref([
  {
    key: '1',
    username: 'admin',
    email: 'admin@cloudwatch.local',
    role: 'Administrator',
    active: true,
    lastLogin: '2 hours ago'
  },
  {
    key: '2',
    username: 'operator',
    email: 'operator@cloudwatch.local',
    role: 'Operator',
    active: true,
    lastLogin: '1 day ago'
  },
  {
    key: '3',
    username: 'viewer',
    email: 'viewer@cloudwatch.local',
    role: 'Viewer',
    active: false,
    lastLogin: '1 week ago'
  }
])

const integrations = ref([
  {
    name: 'Slack',
    description: 'Send alerts to Slack channels',
    icon: SlackOutlined,
    connected: false
  },
  {
    name: 'GitHub',
    description: 'Integration with GitHub repositories',
    icon: GithubOutlined,
    connected: true
  },
  {
    name: 'Email',
    description: 'Email notification service',
    icon: MailOutlined,
    connected: true
  }
])

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical': return 'red'
    case 'warning': return 'orange'
    case 'info': return 'blue'
    default: return 'default'
  }
}

const getRoleColor = (role: string) => {
  switch (role) {
    case 'Administrator': return 'red'
    case 'Operator': return 'blue'
    case 'Viewer': return 'green'
    default: return 'default'
  }
}

const toggleIntegration = (integration: any) => {
  integration.connected = !integration.connected
}

const saveSettings = async () => {
  saving.value = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('Settings saved:', settings)
  } finally {
    saving.value = false
  }
}

const resetSettings = () => {
  // Reset to default values
  Object.assign(settings, {
    defaultTimeRange: '1h',
    refreshInterval: '30',
    theme: 'light',
    enableAnimations: true,
    enableSounds: true,
    logRetention: '30',
    metricsRetention: '90',
    emailNotifications: ['alerts'],
    slackWebhook: '',
    notificationFrequency: 'immediate',
    sessionTimeout: '60',
    requireMFA: false,
    enableAuditLog: true,
    apiRateLimit: 1000
  })
}
</script>

<style scoped>
/* Settings Page Styles */
.settings-container {
  width: 100%;
}

.page-header {
  margin-bottom: 32px;
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

.settings-layout {
  display: flex;
  gap: 32px;
  min-height: 600px;
}

.settings-sidebar {
  width: 240px;
  flex-shrink: 0;
}

.settings-menu {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
}

.settings-menu :deep(.ant-menu-item) {
  margin: 4px 8px;
  border-radius: 6px;
  height: 40px;
  line-height: 40px;
}

.settings-menu :deep(.ant-menu-item-selected) {
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  color: white;
}

.settings-menu :deep(.ant-menu-item-selected .anticon) {
  color: white;
}

.settings-content {
  flex: 1;
}

.settings-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.settings-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
}

.settings-card :deep(.ant-card-head) {
  border-bottom: 1px solid #f0f0f0;
}

.settings-card :deep(.ant-card-head-title) {
  font-size: 18px;
  font-weight: 600;
  color: #262626;
}

.integration-card {
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  transition: all 0.3s ease;
}

.integration-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.integration-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 16px;
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.integration-card h4 {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  margin: 0 0 8px 0;
}

.integration-card p {
  font-size: 14px;
  color: #8c8c8c;
  margin: 0 0 16px 0;
}

.settings-actions {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
}

/* Responsive Design */
@media (max-width: 768px) {
  .settings-layout {
    flex-direction: column;
    gap: 24px;
  }

  .settings-sidebar {
    width: 100%;
  }

  .settings-menu {
    display: flex;
    overflow-x: auto;
  }

  .settings-menu :deep(.ant-menu-item) {
    white-space: nowrap;
    margin: 4px;
  }
}

@media (max-width: 576px) {
  .page-title {
    font-size: 24px;
  }

  .page-description {
    font-size: 14px;
  }

  .settings-card {
    margin: 0 -8px;
  }

  .integration-card {
    padding: 16px;
  }

  .integration-icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }
}
</style>
