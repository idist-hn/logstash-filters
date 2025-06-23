<template>
  <div class="advanced-search">
    <div class="search-container">
      <div class="search-input-wrapper">
        <a-auto-complete
          v-model:value="searchQuery"
          :options="searchSuggestions"
          :placeholder="placeholder"
          class="search-input"
          @search="onSearch"
          @select="onSelect"
          @keyup.enter="performSearch"
        >
          <template #option="{ value, label, type, icon }">
            <div class="search-suggestion">
              <div class="suggestion-icon">
                <component :is="icon" v-if="icon" />
                <SearchOutlined v-else />
              </div>
              <div class="suggestion-content">
                <div class="suggestion-label">{{ label }}</div>
                <div class="suggestion-type">{{ type }}</div>
              </div>
            </div>
          </template>
        </a-auto-complete>
        
        <div class="search-actions">
          <a-button
            v-if="showFilters"
            type="text"
            class="filter-toggle"
            :class="{ active: filtersVisible }"
            @click="toggleFilters"
          >
            <FilterOutlined />
          </a-button>
          
          <a-button
            type="primary"
            class="search-button"
            @click="performSearch"
            :loading="searching"
          >
            <SearchOutlined />
          </a-button>
        </div>
      </div>
      
      <!-- Advanced Filters -->
      <div v-if="filtersVisible && showFilters" class="search-filters">
        <div class="filter-row">
          <div class="filter-group">
            <label>Type:</label>
            <a-select
              v-model:value="filters.type"
              placeholder="All types"
              style="width: 120px"
              @change="onFilterChange"
            >
              <a-select-option value="">All types</a-select-option>
              <a-select-option value="logs">Logs</a-select-option>
              <a-select-option value="metrics">Metrics</a-select-option>
              <a-select-option value="alerts">Alerts</a-select-option>
              <a-select-option value="customers">Customers</a-select-option>
              <a-select-option value="projects">Projects</a-select-option>
            </a-select>
          </div>
          
          <div class="filter-group">
            <label>Time Range:</label>
            <a-range-picker
              v-model:value="filters.timeRange"
              style="width: 240px"
              @change="onFilterChange"
            />
          </div>
          
          <div class="filter-group">
            <label>Status:</label>
            <a-select
              v-model:value="filters.status"
              placeholder="Any status"
              style="width: 120px"
              @change="onFilterChange"
            >
              <a-select-option value="">Any status</a-select-option>
              <a-select-option value="active">Active</a-select-option>
              <a-select-option value="inactive">Inactive</a-select-option>
              <a-select-option value="error">Error</a-select-option>
              <a-select-option value="warning">Warning</a-select-option>
            </a-select>
          </div>
          
          <div class="filter-actions">
            <a-button size="small" @click="clearFilters">Clear</a-button>
            <a-button type="primary" size="small" @click="applyFilters">Apply</a-button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Search History -->
    <div v-if="showHistory && searchHistory.length > 0" class="search-history">
      <div class="history-header">
        <span>Recent Searches</span>
        <a-button type="link" size="small" @click="clearHistory">Clear All</a-button>
      </div>
      <div class="history-items">
        <div
          v-for="(item, index) in searchHistory.slice(0, 5)"
          :key="index"
          class="history-item"
          @click="selectHistoryItem(item)"
        >
          <ClockCircleOutlined class="history-icon" />
          <span class="history-query">{{ item.query }}</span>
          <span class="history-time">{{ formatTime(item.timestamp) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import {
  SearchOutlined,
  FilterOutlined,
  ClockCircleOutlined,
  UserOutlined,
  ProjectOutlined,
  FileTextOutlined,
  BarChartOutlined,
  AlertOutlined
} from '@ant-design/icons-vue'

interface SearchSuggestion {
  value: string
  label: string
  type: string
  icon?: any
}

interface SearchFilter {
  type: string
  timeRange: [string, string] | null
  status: string
}

interface SearchHistoryItem {
  query: string
  filters: SearchFilter
  timestamp: number
}

interface Props {
  placeholder?: string
  showFilters?: boolean
  showHistory?: boolean
  autoFocus?: boolean
}

interface Emits {
  (e: 'search', query: string, filters: SearchFilter): void
  (e: 'clear'): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Search logs, metrics, alerts...',
  showFilters: true,
  showHistory: true,
  autoFocus: false
})

const emit = defineEmits<Emits>()

// Reactive state
const searchQuery = ref('')
const searching = ref(false)
const filtersVisible = ref(false)
const searchHistory = ref<SearchHistoryItem[]>([])

const filters = reactive<SearchFilter>({
  type: '',
  timeRange: null,
  status: ''
})

// Mock data for suggestions
const mockSuggestions: SearchSuggestion[] = [
  { value: 'error logs', label: 'Error logs', type: 'Logs', icon: FileTextOutlined },
  { value: 'cpu usage', label: 'CPU usage metrics', type: 'Metrics', icon: BarChartOutlined },
  { value: 'high memory alert', label: 'High memory alerts', type: 'Alerts', icon: AlertOutlined },
  { value: 'TechCorp Solutions', label: 'TechCorp Solutions', type: 'Customer', icon: UserOutlined },
  { value: 'E-commerce Platform', label: 'E-commerce Platform', type: 'Project', icon: ProjectOutlined }
]

// Computed
const searchSuggestions = computed(() => {
  if (!searchQuery.value) return []
  
  return mockSuggestions
    .filter(item => 
      item.label.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.value.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
    .map(item => ({
      value: item.value,
      label: item.label,
      type: item.type,
      icon: item.icon
    }))
})

// Methods
const onSearch = (value: string) => {
  searchQuery.value = value
}

const onSelect = (value: string) => {
  searchQuery.value = value
  performSearch()
}

const performSearch = () => {
  if (!searchQuery.value.trim()) return
  
  searching.value = true
  
  // Add to search history
  addToHistory(searchQuery.value, { ...filters })
  
  // Emit search event
  emit('search', searchQuery.value, { ...filters })
  
  // Simulate search delay
  setTimeout(() => {
    searching.value = false
  }, 1000)
}

const toggleFilters = () => {
  filtersVisible.value = !filtersVisible.value
}

const onFilterChange = () => {
  // Auto-search when filters change (debounced)
  if (searchQuery.value.trim()) {
    setTimeout(() => {
      performSearch()
    }, 300)
  }
}

const clearFilters = () => {
  filters.type = ''
  filters.timeRange = null
  filters.status = ''
  onFilterChange()
}

const applyFilters = () => {
  if (searchQuery.value.trim()) {
    performSearch()
  }
}

const addToHistory = (query: string, searchFilters: SearchFilter) => {
  const historyItem: SearchHistoryItem = {
    query,
    filters: { ...searchFilters },
    timestamp: Date.now()
  }
  
  // Remove duplicate
  const existingIndex = searchHistory.value.findIndex(item => item.query === query)
  if (existingIndex > -1) {
    searchHistory.value.splice(existingIndex, 1)
  }
  
  // Add to beginning
  searchHistory.value.unshift(historyItem)
  
  // Keep only last 10 items
  if (searchHistory.value.length > 10) {
    searchHistory.value = searchHistory.value.slice(0, 10)
  }
  
  // Save to localStorage
  localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value))
}

const selectHistoryItem = (item: SearchHistoryItem) => {
  searchQuery.value = item.query
  Object.assign(filters, item.filters)
  performSearch()
}

const clearHistory = () => {
  searchHistory.value = []
  localStorage.removeItem('searchHistory')
}

const formatTime = (timestamp: number) => {
  const now = Date.now()
  const diff = now - timestamp
  
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return `${Math.floor(diff / 86400000)}d ago`
}

// Load search history on mount
onMounted(() => {
  const saved = localStorage.getItem('searchHistory')
  if (saved) {
    try {
      searchHistory.value = JSON.parse(saved)
    } catch (e) {
      console.warn('Failed to parse search history:', e)
    }
  }
})

// Watch for external clear
watch(() => props, () => {
  if (!searchQuery.value) {
    emit('clear')
  }
})
</script>

<style lang="scss" scoped>
.advanced-search {
  width: 100%;
  max-width: 600px;
}

.search-container {
  position: relative;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-primary);
  border: 2px solid var(--border-light);
  border-radius: 12px;
  padding: 4px;
  transition: all 0.3s ease;

  &:focus-within {
    border-color: #1890ff;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  }
}

.search-input {
  flex: 1;
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;

  :deep(.ant-input) {
    border: none !important;
    background: transparent !important;
    box-shadow: none !important;
    padding: 8px 12px;
    font-size: 14px;
  }
}

.search-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.filter-toggle {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  transition: all 0.2s ease;

  &:hover,
  &.active {
    background: rgba(24, 144, 255, 0.1);
    color: #1890ff;
  }
}

.search-button {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-filters {
  margin-top: 12px;
  padding: 16px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;

  label {
    font-size: 12px;
    color: var(--text-secondary);
    white-space: nowrap;
  }
}

.filter-actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.search-suggestion {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}

.suggestion-icon {
  width: 16px;
  height: 16px;
  color: var(--text-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.suggestion-content {
  flex: 1;
}

.suggestion-label {
  font-size: 13px;
  color: var(--text-primary);
}

.suggestion-type {
  font-size: 11px;
  color: var(--text-tertiary);
}

.search-history {
  margin-top: 12px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
}

.history-items {
  max-height: 200px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: var(--bg-tertiary);
  }
}

.history-icon {
  color: var(--text-tertiary);
  font-size: 12px;
}

.history-query {
  flex: 1;
  font-size: 13px;
  color: var(--text-primary);
}

.history-time {
  font-size: 11px;
  color: var(--text-tertiary);
}

/* Responsive */
@media (max-width: 768px) {
  .filter-row {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .filter-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .filter-actions {
    margin-left: 0;
    justify-content: flex-end;
  }
}
</style>
