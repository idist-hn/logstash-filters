<template>
  <div class="api-status">
    <a-card size="small" title="🔗 API Status" class="status-card">
      <div class="status-grid">
        <div class="status-item">
          <div class="status-label">Backend API</div>
          <a-tag :color="backendStatus.color">
            {{ backendStatus.text }}
          </a-tag>
        </div>
        
        <div class="status-item">
          <div class="status-label">Authentication</div>
          <a-tag :color="authStatus.color">
            {{ authStatus.text }}
          </a-tag>
        </div>
        
        <div class="status-item">
          <div class="status-label">User Session</div>
          <a-tag :color="sessionStatus.color">
            {{ sessionStatus.text }}
          </a-tag>
        </div>
      </div>
      
      <div class="status-actions">
        <a-button size="small" @click="checkStatus" :loading="checking">
          <template #icon>
            <ReloadOutlined />
          </template>
          Refresh
        </a-button>
        
        <a-button size="small" type="link" @click="showDetails = !showDetails">
          {{ showDetails ? 'Hide' : 'Show' }} Details
        </a-button>
      </div>
      
      <div v-if="showDetails" class="status-details">
        <a-divider />
        <div class="detail-item">
          <strong>Backend URL:</strong> http://localhost:8080
        </div>
        <div class="detail-item">
          <strong>Frontend URL:</strong> http://localhost:3001
        </div>
        <div class="detail-item">
          <strong>Current User:</strong> {{ authStore.user?.username || 'Not logged in' }}
        </div>
        <div class="detail-item">
          <strong>Token Status:</strong> {{ authStore.token ? 'Valid' : 'None' }}
        </div>
        <div class="detail-item">
          <strong>Last Check:</strong> {{ lastCheck || 'Never' }}
        </div>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { ReloadOutlined } from '@ant-design/icons-vue'
import api from '../services/api'

const authStore = useAuthStore()

const checking = ref(false)
const showDetails = ref(false)
const lastCheck = ref<string>('')
const backendHealthy = ref(false)
const authWorking = ref(false)

// Status computeds
const backendStatus = computed(() => {
  if (checking.value) return { color: 'processing', text: 'Checking...' }
  return backendHealthy.value 
    ? { color: 'success', text: 'Online' }
    : { color: 'error', text: 'Offline' }
})

const authStatus = computed(() => {
  if (checking.value) return { color: 'processing', text: 'Checking...' }
  return authWorking.value
    ? { color: 'success', text: 'Working' }
    : { color: 'warning', text: 'Unknown' }
})

const sessionStatus = computed(() => {
  return authStore.isAuthenticated
    ? { color: 'success', text: 'Active' }
    : { color: 'default', text: 'None' }
})

const checkStatus = async () => {
  checking.value = true
  
  try {
    // Test backend health
    const healthResponse = await api.get('/health')
    backendHealthy.value = healthResponse.status === 200
    
    // Test auth endpoint
    try {
      await api.post('/auth/login', { username: 'test', password: 'test' })
      authWorking.value = true
    } catch (err: any) {
      // 401 means auth is working (just wrong credentials)
      authWorking.value = err.response?.status === 401
    }
    
    lastCheck.value = new Date().toLocaleTimeString()
  } catch (error) {
    console.error('Status check failed:', error)
    backendHealthy.value = false
    authWorking.value = false
  } finally {
    checking.value = false
  }
}

onMounted(() => {
  checkStatus()
  // Auto-refresh every 30 seconds
  setInterval(checkStatus, 30000)
})
</script>

<style scoped>
.api-status {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 280px;
  z-index: 1000;
}

.status-card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
}

.status-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.status-actions {
  display: flex;
  gap: 8px;
  justify-content: space-between;
}

.status-details {
  margin-top: 12px;
}

.detail-item {
  font-size: 11px;
  margin-bottom: 4px;
  color: #666;
}

.detail-item strong {
  color: #333;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .api-status {
    position: relative;
    top: auto;
    right: auto;
    width: 100%;
    margin-bottom: 16px;
  }
}
</style>
