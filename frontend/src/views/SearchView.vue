<template>
  <div class="min-h-screen bg-gray-50">
    <AppLayout>
      <div class="space-y-6">
        <!-- Header -->
        <div class="bg-white shadow">
          <div class="px-4 sm:px-6 lg:px-8">
            <div class="py-6">
              <h1 class="text-3xl font-bold text-gray-900">Search</h1>
              <p class="mt-2 text-sm text-gray-600">
                Search across all logs and metrics
              </p>
            </div>
          </div>
        </div>

        <!-- Search Form -->
        <div class="bg-white shadow rounded-lg p-6">
          <form @submit.prevent="performSearch" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Search Query
                </label>
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Enter search terms..."
                  class="input"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Index Pattern
                </label>
                <select v-model="selectedIndex" class="input">
                  <option value="*">All Indices</option>
                  <option value="metricbeat-*">Metrics</option>
                  <option value="cloudwatch-logs-*">Logs</option>
                </select>
              </div>
            </div>
            <div class="flex justify-end">
              <button
                type="submit"
                :disabled="loading || !searchQuery.trim()"
                class="btn btn-primary"
              >
                <span v-if="loading">Searching...</span>
                <span v-else>Search</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Search Results -->
        <div v-if="hasSearched" class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-medium text-gray-900">Search Results</h3>
              <span class="text-sm text-gray-600">
                {{ searchResults?.hits?.total?.value || 0 }} results found
              </span>
            </div>
          </div>

          <div class="divide-y divide-gray-200">
            <div
              v-for="(result, index) in results"
              :key="index"
              class="p-6 hover:bg-gray-50"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center space-x-2 mb-2">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                      {{ result._index }}
                    </span>
                    <span class="text-xs text-gray-500">
                      ID: {{ result._id }}
                    </span>
                  </div>
                  
                  <div class="space-y-2">
                    <!-- Display key fields -->
                    <div v-if="result._source?.message" class="text-sm text-gray-900">
                      <strong>Message:</strong> {{ result._source.message }}
                    </div>
                    
                    <div v-if="result._source?.host?.name" class="text-sm text-gray-600">
                      <strong>Host:</strong> {{ result._source.host.name }}
                    </div>
                    
                    <div v-if="result._source?.level" class="text-sm text-gray-600">
                      <strong>Level:</strong> 
                      <span
                        class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ml-1"
                        :class="getLevelBadgeClass(result._source.level)"
                      >
                        {{ result._source.level }}
                      </span>
                    </div>
                    
                    <div v-if="result._source?.['@timestamp']" class="text-sm text-gray-500">
                      <strong>Timestamp:</strong> {{ formatTimestamp(result._source['@timestamp']) }}
                    </div>
                  </div>
                </div>
                
                <button
                  @click="toggleDetails(index)"
                  class="ml-4 text-sm text-blue-600 hover:text-blue-800"
                >
                  {{ expandedResults.has(index) ? 'Hide Details' : 'Show Details' }}
                </button>
              </div>
              
              <!-- Expanded Details -->
              <div v-if="expandedResults.has(index)" class="mt-4 p-4 bg-gray-50 rounded">
                <h4 class="text-sm font-medium text-gray-900 mb-2">Raw Data:</h4>
                <pre class="text-xs text-gray-600 overflow-x-auto">{{ JSON.stringify(result._source, null, 2) }}</pre>
              </div>
            </div>
            
            <div v-if="results.length === 0 && hasSearched && !loading" class="p-8 text-center text-gray-500">
              No results found for your search query.
            </div>
          </div>
        </div>

        <!-- Search Tips -->
        <div v-if="!hasSearched" class="bg-white shadow rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Search Tips</h3>
          <div class="space-y-2 text-sm text-gray-600">
            <p>• Use quotes for exact phrases: <code class="bg-gray-100 px-1 rounded">"error message"</code></p>
            <p>• Use wildcards: <code class="bg-gray-100 px-1 rounded">host:web*</code></p>
            <p>• Combine terms: <code class="bg-gray-100 px-1 rounded">level:error AND host:server1</code></p>
            <p>• Use field searches: <code class="bg-gray-100 px-1 rounded">message:timeout</code></p>
            <p>• Date ranges: <code class="bg-gray-100 px-1 rounded">@timestamp:[now-1h TO now]</code></p>
          </div>
        </div>
      </div>
    </AppLayout>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import api from '@/services/api'

const searchQuery = ref('')
const selectedIndex = ref('*')
const searchResults = ref<any>({})
const loading = ref(false)
const hasSearched = ref(false)
const expandedResults = ref(new Set<number>())

const results = computed(() => searchResults.value?.hits?.hits || [])

const performSearch = async () => {
  if (!searchQuery.value.trim()) return
  
  try {
    loading.value = true
    const response = await api.get('/search', {
      params: {
        q: searchQuery.value,
        index: selectedIndex.value
      }
    })
    searchResults.value = response.data
    hasSearched.value = true
    expandedResults.value.clear()
  } catch (error) {
    console.error('Search failed:', error)
  } finally {
    loading.value = false
  }
}

const toggleDetails = (index: number) => {
  if (expandedResults.value.has(index)) {
    expandedResults.value.delete(index)
  } else {
    expandedResults.value.add(index)
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
</script>
