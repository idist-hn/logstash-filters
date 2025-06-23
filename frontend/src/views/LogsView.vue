<template>
  <div class="min-h-screen bg-gray-50">
    <AppLayout>
      <div class="space-y-6">
        <!-- Header -->
        <div class="bg-white shadow">
          <div class="px-4 sm:px-6 lg:px-8">
            <div class="py-6">
              <h1 class="text-3xl font-bold text-gray-900">Logs</h1>
              <p class="mt-2 text-sm text-gray-600">
                View and analyze system logs
              </p>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="bg-white shadow rounded-lg p-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
              <select
                v-model="selectedTimeRange"
                @change="fetchLogs"
                class="input"
              >
                <option value="15m">Last 15 minutes</option>
                <option value="1h">Last hour</option>
                <option value="6h">Last 6 hours</option>
                <option value="24h">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Log Level</label>
              <select
                v-model="selectedLevel"
                @change="fetchLogs"
                class="input"
              >
                <option value="">All Levels</option>
                <option value="error">Error</option>
                <option value="warn">Warning</option>
                <option value="info">Info</option>
                <option value="debug">Debug</option>
              </select>
            </div>
            <div class="flex items-end">
              <button
                @click="fetchLogs"
                :disabled="loading"
                class="btn btn-primary w-full"
              >
                <span v-if="loading">Loading...</span>
                <span v-else>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Log Statistics -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white shadow rounded-lg p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Total Logs</h3>
            <p class="text-3xl font-bold text-blue-600">
              {{ logsData?.hits?.total?.value || 0 }}
            </p>
          </div>

          <div class="bg-white shadow rounded-lg p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Log Levels</h3>
            <div class="space-y-2">
              <div
                v-for="level in logLevels"
                :key="level.key"
                class="flex items-center justify-between"
              >
                <span class="text-sm font-medium" :class="getLevelColor(level.key)">
                  {{ level.key || 'Unknown' }}
                </span>
                <span class="text-sm text-gray-600">{{ level.doc_count }}</span>
              </div>
            </div>
          </div>

          <div class="bg-white shadow rounded-lg p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Active Hosts</h3>
            <div class="space-y-2">
              <div
                v-for="host in logHosts"
                :key="host.key"
                class="flex items-center justify-between"
              >
                <span class="text-sm font-medium text-gray-900">{{ host.key }}</span>
                <span class="text-sm text-gray-600">{{ host.doc_count }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Logs Table -->
        <div class="bg-white shadow rounded-lg overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Recent Logs</h3>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Level
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Host
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Message
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr
                  v-for="(log, index) in logs"
                  :key="index"
                  class="hover:bg-gray-50"
                >
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatTimestamp(log._source?.['@timestamp']) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                      :class="getLevelBadgeClass(log._source?.level)"
                    >
                      {{ log._source?.level || 'Unknown' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ log._source?.host?.name || 'Unknown' }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-900 max-w-md truncate">
                    {{ log._source?.message || 'No message' }}
                  </td>
                </tr>
                <tr v-if="logs.length === 0">
                  <td colspan="4" class="px-6 py-8 text-center text-gray-500">
                    No logs found for the selected criteria
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import api from '@/services/api'

const logsData = ref<any>({})
const loading = ref(false)
const selectedTimeRange = ref('1h')
const selectedLevel = ref('')

const logs = computed(() => logsData.value?.hits?.hits || [])
const logLevels = computed(() => logsData.value?.aggregations?.log_levels?.buckets || [])
const logHosts = computed(() => logsData.value?.aggregations?.hosts?.buckets || [])

const fetchLogs = async () => {
  try {
    loading.value = true
    const params = new URLSearchParams({
      timeRange: selectedTimeRange.value,
    })
    if (selectedLevel.value) {
      params.append('level', selectedLevel.value)
    }
    
    const response = await api.get(`/metrics/logs?${params}`)
    logsData.value = response.data
  } catch (error) {
    console.error('Failed to fetch logs:', error)
  } finally {
    loading.value = false
  }
}

const getLevelColor = (level: string) => {
  switch (level?.toLowerCase()) {
    case 'error':
      return 'text-red-600'
    case 'warn':
    case 'warning':
      return 'text-yellow-600'
    case 'info':
      return 'text-blue-600'
    case 'debug':
      return 'text-gray-600'
    default:
      return 'text-gray-600'
  }
}

const getLevelBadgeClass = (level: string) => {
  switch (level?.toLowerCase()) {
    case 'error':
      return 'bg-red-100 text-red-800'
    case 'warn':
    case 'warning':
      return 'bg-yellow-100 text-yellow-800'
    case 'info':
      return 'bg-blue-100 text-blue-800'
    case 'debug':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const formatTimestamp = (timestamp: string) => {
  if (!timestamp) return 'Unknown time'
  return new Date(timestamp).toLocaleString()
}

onMounted(() => {
  fetchLogs()
})
</script>
