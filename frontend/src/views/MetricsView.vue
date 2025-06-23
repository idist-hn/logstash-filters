<template>
  <AppLayout>
    <div class="space-y-6">
      <!-- Header -->
      <a-page-header
        title="System Metrics"
        sub-title="Detailed system performance metrics and monitoring"
        :ghost="false"
      >
        <template #extra>
          <a-space>
            <a-select
              v-model="selectedTimeRange"
              @change="fetchMetrics"
              style="width: 150px"
            >
              <a-select-option value="15m">Last 15 minutes</a-select-option>
              <a-select-option value="1h">Last hour</a-select-option>
              <a-select-option value="6h">Last 6 hours</a-select-option>
              <a-select-option value="24h">Last 24 hours</a-select-option>
              <a-select-option value="7d">Last 7 days</a-select-option>
            </a-select>
            <a-button type="primary" :loading="loading" @click="fetchMetrics">
              <template #icon v-if="!loading">
                <ReloadOutlined />
              </template>
              Refresh
            </a-button>
          </a-space>
        </template>
      </a-page-header>

      <!-- Metrics Grid -->
      <a-row :gutter="[16, 16]">
        <!-- CPU Usage -->
        <a-col :xs="24" :lg="12">
          <a-card title="CPU Usage" class="dashboard-card">
            <div class="space-y-4">
              <a-statistic
                title="Average CPU Usage"
                :value="cpuUsage"
                suffix="%"
                :value-style="getCpuUsageStyle(cpuUsage)"
              />
              <a-progress
                :percent="cpuUsage"
                :stroke-color="getCpuProgressColor(cpuUsage)"
                :show-info="false"
              />
            </div>
          </a-card>
        </a-col>

        <!-- Memory Usage -->
        <a-col :xs="24" :lg="12">
          <a-card title="Memory Usage" class="dashboard-card">
            <div class="space-y-4">
              <a-statistic
                title="Average Memory Usage"
                :value="memoryUsage"
                suffix="%"
                :value-style="getMemoryUsageStyle(memoryUsage)"
              />
              <a-progress
                :percent="memoryUsage"
                :stroke-color="getMemoryProgressColor(memoryUsage)"
                :show-info="false"
              />
            </div>
          </a-card>
        </a-col>

        <!-- Host Information -->
        <a-col :xs="24" :lg="12">
          <a-card title="Active Hosts" class="dashboard-card">
            <div v-if="hosts.length === 0">
              <a-empty description="No host data available">
                <template #image>
                  <ClusterOutlined style="font-size: 48px; color: #d9d9d9;" />
                </template>
              </a-empty>
            </div>
            <a-list v-else :data-source="hosts" size="small">
              <template #renderItem="{ item }">
                <a-list-item>
                  <a-list-item-meta>
                    <template #title>
                      <div class="flex items-center justify-between">
                        <span class="font-medium">{{ item.key }}</span>
                        <a-tag color="blue">{{ item.doc_count }} metrics</a-tag>
                      </div>
                    </template>
                  </a-list-item-meta>
                </a-list-item>
              </template>
            </a-list>
          </a-card>
        </a-col>

        <!-- Recent Metrics -->
        <a-col :xs="24" :lg="12">
          <a-card title="Recent Metrics" class="dashboard-card">
            <div v-if="recentMetrics.length === 0">
              <a-empty description="No recent metrics available">
                <template #image>
                  <BarChartOutlined style="font-size: 48px; color: #d9d9d9;" />
                </template>
              </a-empty>
            </div>
            <div v-else class="max-h-64 overflow-y-auto">
              <a-list :data-source="recentMetrics" size="small">
                <template #renderItem="{ item }">
                  <a-list-item>
                    <a-list-item-meta>
                      <template #title>
                        <div class="flex items-center justify-between">
                          <span class="font-medium">{{ item._source?.host?.name || 'Unknown Host' }}</span>
                          <span class="text-xs text-gray-500">
                            {{ formatTimestamp(item._source?.['@timestamp']) }}
                          </span>
                        </div>
                      </template>
                      <template #description>
                        <div class="flex space-x-4">
                          <span>CPU: {{ formatPercentage(item._source?.system?.cpu?.total?.pct) }}%</span>
                          <span>Memory: {{ formatPercentage(item._source?.system?.memory?.used?.pct) }}%</span>
                        </div>
                      </template>
                    </a-list-item-meta>
                  </a-list-item>
                </template>
              </a-list>
            </div>
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
  ClusterOutlined,
  BarChartOutlined
} from '@ant-design/icons-vue'

const metricsData = ref<any>({})
const loading = ref(false)
const selectedTimeRange = ref('1h')

const cpuUsage = computed(() => {
  const cpu = metricsData.value?.aggregations?.cpu_usage?.value
  return cpu ? Math.round(cpu * 100) : 0
})

const memoryUsage = computed(() => {
  const memory = metricsData.value?.aggregations?.memory_usage?.value
  return memory ? Math.round(memory * 100) : 0
})

const hosts = computed(() => {
  return metricsData.value?.aggregations?.hosts?.buckets || []
})

const recentMetrics = computed(() => {
  return metricsData.value?.hits?.hits || []
})

const fetchMetrics = async () => {
  try {
    loading.value = true
    const response = await api.get(`/metrics/system?timeRange=${selectedTimeRange.value}`)
    metricsData.value = response.data
  } catch (error) {
    console.error('Failed to fetch metrics:', error)
  } finally {
    loading.value = false
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

const formatPercentage = (value: number) => {
  return value ? Math.round(value * 100) : 0
}

const formatTimestamp = (timestamp: string) => {
  if (!timestamp) return 'Unknown time'
  return new Date(timestamp).toLocaleString()
}

onMounted(() => {
  fetchMetrics()
})
</script>
