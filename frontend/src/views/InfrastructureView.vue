<template>
  <AppLayout>
    <div class="infrastructure-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">Infrastructure Management</h1>
          <p class="page-description">Monitor and manage physical infrastructure and resources</p>
        </div>
        <div class="header-actions">
          <a-select v-model:value="selectedRegion" style="width: 150px" @change="filterByRegion">
            <a-select-option value="all">All Regions</a-select-option>
            <a-select-option value="us-east-1">US East 1</a-select-option>
            <a-select-option value="us-west-2">US West 2</a-select-option>
            <a-select-option value="eu-west-1">EU West 1</a-select-option>
          </a-select>
          <a-button type="primary" @click="showAddNode = true">
            <PlusOutlined />
            Add Node
          </a-button>
        </div>
      </div>

      <!-- Infrastructure Stats -->
      <a-row :gutter="[24, 24]" class="stats-row">
        <a-col :xs="24" :sm="12" :lg="6">
          <div class="stat-card nodes">
            <div class="stat-icon">
              <ClusterOutlined />
            </div>
            <div class="stat-content">
              <h3>Total Nodes</h3>
              <span class="stat-value">{{ infraStats.totalNodes }}</span>
              <span class="stat-trend">{{ infraStats.activeNodes }} active</span>
            </div>
          </div>
        </a-col>
        <a-col :xs="24" :sm="12" :lg="6">
          <div class="stat-card cpu">
            <div class="stat-icon">
              <DesktopOutlined />
            </div>
            <div class="stat-content">
              <h3>CPU Cores</h3>
              <span class="stat-value">{{ infraStats.totalCores }}</span>
              <span class="stat-trend">{{ infraStats.usedCores }} in use</span>
            </div>
          </div>
        </a-col>
        <a-col :xs="24" :sm="12" :lg="6">
          <div class="stat-card memory">
            <div class="stat-icon">
              <DatabaseOutlined />
            </div>
            <div class="stat-content">
              <h3>Total Memory</h3>
              <span class="stat-value">{{ infraStats.totalMemory }}TB</span>
              <span class="stat-trend">{{ infraStats.usedMemory }}TB used</span>
            </div>
          </div>
        </a-col>
        <a-col :xs="24" :sm="12" :lg="6">
          <div class="stat-card storage">
            <div class="stat-icon">
              <HddOutlined />
            </div>
            <div class="stat-content">
              <h3>Storage</h3>
              <span class="stat-value">{{ infraStats.totalStorage }}PB</span>
              <span class="stat-trend">{{ infraStats.usedStorage }}PB used</span>
            </div>
          </div>
        </a-col>
      </a-row>

      <!-- Node Status Grid -->
      <a-card title="Physical Nodes" class="nodes-card">
        <template #extra>
          <a-space>
            <a-button @click="refreshNodes">
              <ReloadOutlined />
              Refresh
            </a-button>
            <a-button type="primary" @click="showMaintenanceMode = true">
              <ToolOutlined />
              Maintenance Mode
            </a-button>
          </a-space>
        </template>
        
        <a-row :gutter="[16, 16]">
          <a-col :xs="24" :sm="12" :lg="8" :xl="6" v-for="node in nodes" :key="node.id">
            <div class="node-card" :class="node.status">
              <div class="node-header">
                <div class="node-info">
                  <h4 class="node-name">{{ node.name }}</h4>
                  <span class="node-type">{{ node.type }}</span>
                </div>
                <div class="node-status">
                  <a-badge :status="getNodeStatusBadge(node.status)" :text="node.status" />
                </div>
              </div>
              
              <div class="node-metrics">
                <div class="metric-item">
                  <span class="metric-label">CPU</span>
                  <div class="metric-bar">
                    <a-progress 
                      :percent="node.cpu" 
                      :show-info="false" 
                      size="small"
                      :stroke-color="getMetricColor(node.cpu)"
                    />
                    <span class="metric-value">{{ node.cpu }}%</span>
                  </div>
                </div>
                
                <div class="metric-item">
                  <span class="metric-label">Memory</span>
                  <div class="metric-bar">
                    <a-progress 
                      :percent="node.memory" 
                      :show-info="false" 
                      size="small"
                      :stroke-color="getMetricColor(node.memory)"
                    />
                    <span class="metric-value">{{ node.memory }}%</span>
                  </div>
                </div>
                
                <div class="metric-item">
                  <span class="metric-label">Storage</span>
                  <div class="metric-bar">
                    <a-progress 
                      :percent="node.storage" 
                      :show-info="false" 
                      size="small"
                      :stroke-color="getMetricColor(node.storage)"
                    />
                    <span class="metric-value">{{ node.storage }}%</span>
                  </div>
                </div>
              </div>
              
              <div class="node-details">
                <div class="detail-item">
                  <span class="detail-label">Region:</span>
                  <span class="detail-value">{{ node.region }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Uptime:</span>
                  <span class="detail-value">{{ node.uptime }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Load:</span>
                  <span class="detail-value">{{ node.load }}</span>
                </div>
              </div>
              
              <div class="node-actions">
                <a-dropdown>
                  <a-button type="text" block>
                    <MoreOutlined />
                    Actions
                  </a-button>
                  <template #overlay>
                    <a-menu>
                      <a-menu-item key="details" @click="viewNodeDetails(node)">
                        <EyeOutlined />
                        View Details
                      </a-menu-item>
                      <a-menu-item key="ssh" @click="sshToNode(node)">
                        <CodeOutlined />
                        SSH Access
                      </a-menu-item>
                      <a-menu-item key="logs" @click="viewNodeLogs(node)">
                        <FileTextOutlined />
                        View Logs
                      </a-menu-item>
                      <a-menu-divider />
                      <a-menu-item key="reboot" @click="rebootNode(node)">
                        <ReloadOutlined />
                        Reboot
                      </a-menu-item>
                      <a-menu-item key="maintenance" @click="setMaintenance(node)">
                        <ToolOutlined />
                        Maintenance
                      </a-menu-item>
                      <a-menu-item key="remove" @click="removeNode(node)" danger>
                        <DeleteOutlined />
                        Remove
                      </a-menu-item>
                    </a-menu>
                  </template>
                </a-dropdown>
              </div>
            </div>
          </a-col>
        </a-row>
      </a-card>

      <!-- Resource Allocation -->
      <a-row :gutter="[24, 24]">
        <a-col :xs="24" :lg="12">
          <a-card title="Resource Allocation" class="resource-card">
            <div class="resource-overview">
              <div class="resource-item">
                <h4>CPU Allocation</h4>
                <a-progress 
                  :percent="68" 
                  stroke-color="#1890ff"
                  trail-color="#f0f0f0"
                />
                <div class="resource-details">
                  <span>2,720 / 4,000 cores allocated</span>
                </div>
              </div>
              
              <div class="resource-item">
                <h4>Memory Allocation</h4>
                <a-progress 
                  :percent="72" 
                  stroke-color="#52c41a"
                  trail-color="#f0f0f0"
                />
                <div class="resource-details">
                  <span>14.4 / 20 TB allocated</span>
                </div>
              </div>
              
              <div class="resource-item">
                <h4>Storage Allocation</h4>
                <a-progress
                  :percent="45"
                  stroke-color="#faad14"
                  trail-color="#f0f0f0"
                />
                <div class="resource-details">
                  <span>4.5 / 10 PB allocated</span>
                </div>
              </div>
            </div>
          </a-card>
        </a-col>
        
        <a-col :xs="24" :lg="12">
          <a-card title="Network Topology" class="network-card">
            <div class="network-overview">
              <div class="network-item">
                <div class="network-icon">
                  <GlobalOutlined />
                </div>
                <div class="network-info">
                  <h4>Network Bandwidth</h4>
                  <span class="network-value">850 Gbps</span>
                  <span class="network-usage">65% utilized</span>
                </div>
              </div>
              
              <div class="network-item">
                <div class="network-icon">
                  <WifiOutlined />
                </div>
                <div class="network-info">
                  <h4>Active Connections</h4>
                  <span class="network-value">12,456</span>
                  <span class="network-usage">connections</span>
                </div>
              </div>
              
              <div class="network-item">
                <div class="network-icon">
                  <ThunderboltOutlined />
                </div>
                <div class="network-info">
                  <h4>Latency</h4>
                  <span class="network-value">2.3ms</span>
                  <span class="network-usage">average</span>
                </div>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import {
  PlusOutlined,
  ClusterOutlined,
  DesktopOutlined,
  DatabaseOutlined,
  HddOutlined,
  ReloadOutlined,
  ToolOutlined,
  MoreOutlined,
  EyeOutlined,
  CodeOutlined,
  FileTextOutlined,
  DeleteOutlined,
  GlobalOutlined,
  WifiOutlined,
  ThunderboltOutlined
} from '@ant-design/icons-vue'

const selectedRegion = ref('all')
const showAddNode = ref(false)
const showMaintenanceMode = ref(false)

const infraStats = reactive({
  totalNodes: 48,
  activeNodes: 46,
  totalCores: 4000,
  usedCores: 2720,
  totalMemory: 20,
  usedMemory: 14.4,
  totalStorage: 10,
  usedStorage: 4.5
})

const nodes = ref([
  {
    id: 1,
    name: 'node-compute-01',
    type: 'Compute',
    status: 'healthy',
    cpu: 68,
    memory: 72,
    storage: 45,
    region: 'us-east-1',
    uptime: '45d 12h',
    load: '2.34'
  },
  {
    id: 2,
    name: 'node-storage-01',
    type: 'Storage',
    status: 'healthy',
    cpu: 23,
    memory: 45,
    storage: 78,
    region: 'us-east-1',
    uptime: '32d 8h',
    load: '0.89'
  },
  {
    id: 3,
    name: 'node-compute-02',
    type: 'Compute',
    status: 'warning',
    cpu: 89,
    memory: 91,
    storage: 34,
    region: 'us-west-2',
    uptime: '28d 15h',
    load: '4.12'
  },
  {
    id: 4,
    name: 'node-network-01',
    type: 'Network',
    status: 'maintenance',
    cpu: 12,
    memory: 25,
    storage: 15,
    region: 'eu-west-1',
    uptime: '0d 2h',
    load: '0.23'
  }
])

const filterByRegion = () => {
  console.log('Filter by region:', selectedRegion.value)
}

const refreshNodes = () => {
  console.log('Refresh nodes')
}

const getNodeStatusBadge = (status: string) => {
  switch (status) {
    case 'healthy': return 'success'
    case 'warning': return 'warning'
    case 'error': return 'error'
    case 'maintenance': return 'default'
    default: return 'default'
  }
}

const getMetricColor = (value: number) => {
  if (value > 80) return '#f5222d'
  if (value > 60) return '#faad14'
  return '#52c41a'
}

const viewNodeDetails = (node: any) => {
  console.log('View node details:', node)
}

const sshToNode = (node: any) => {
  console.log('SSH to node:', node)
}

const viewNodeLogs = (node: any) => {
  console.log('View node logs:', node)
}

const rebootNode = (node: any) => {
  console.log('Reboot node:', node)
}

const setMaintenance = (node: any) => {
  console.log('Set maintenance mode:', node)
}

const removeNode = (node: any) => {
  console.log('Remove node:', node)
}
</script>

<style scoped>
.infrastructure-container {
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

.nodes-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
  margin-bottom: 24px;
}

.node-card {
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
}

.node-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.node-card.warning {
  border-color: #faad14;
}

.node-card.error {
  border-color: #f5222d;
}

.node-card.maintenance {
  border-color: #8c8c8c;
  opacity: 0.7;
}

.node-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.node-name {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  margin: 0 0 4px 0;
}

.node-type {
  font-size: 12px;
  color: #8c8c8c;
}

.node-metrics {
  margin-bottom: 16px;
}

.metric-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.metric-label {
  font-size: 12px;
  color: #8c8c8c;
  width: 50px;
}

.metric-bar {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.metric-value {
  font-size: 12px;
  color: #595959;
  width: 35px;
  text-align: right;
}

.node-details {
  margin-bottom: 16px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.detail-label {
  font-size: 12px;
  color: #8c8c8c;
}

.detail-value {
  font-size: 12px;
  color: #595959;
  font-weight: 500;
}

.resource-card, .network-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
}

.resource-overview {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.resource-item h4 {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  margin: 0 0 12px 0;
}

.resource-details {
  margin-top: 8px;
  font-size: 12px;
  color: #8c8c8c;
}

.network-overview {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.network-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.network-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
}

.network-info h4 {
  font-size: 14px;
  font-weight: 600;
  color: #262626;
  margin: 0 0 4px 0;
}

.network-value {
  font-size: 20px;
  font-weight: 700;
  color: #262626;
  display: block;
}

.network-usage {
  font-size: 12px;
  color: #8c8c8c;
}
</style>
