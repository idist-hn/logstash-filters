<template>
  <div class="login-tester">
    <a-card title="🧪 Login Feature Tester" size="small">
      <div class="test-section">
        <h4>Storage Check:</h4>
        <div class="storage-info">
          <div><strong>localStorage token:</strong> {{ localToken ? 'Present' : 'None' }}</div>
          <div><strong>sessionStorage token:</strong> {{ sessionToken ? 'Present' : 'None' }}</div>
          <div><strong>Token expiration:</strong> {{ tokenExpiration || 'None' }}</div>
          <div><strong>Remember me:</strong> {{ rememberMe }}</div>
          <div><strong>Last username:</strong> {{ lastUsername || 'None' }}</div>
        </div>
      </div>

      <div class="test-section">
        <h4>Quick Tests:</h4>
        <a-space direction="vertical" style="width: 100%;">
          <a-button size="small" @click="clearAllStorage">Clear All Storage</a-button>
          <a-button size="small" @click="setRememberMe">Set Remember Me Data</a-button>
          <a-button size="small" @click="testTokenExpiration">Test Token Expiration</a-button>
          <a-button size="small" @click="refreshData">Refresh Data</a-button>
        </a-space>
      </div>

      <div class="test-section">
        <h4>Auth Store Status:</h4>
        <div class="auth-info">
          <div><strong>Is Authenticated:</strong> {{ authStore.isAuthenticated }}</div>
          <div><strong>Current User:</strong> {{ authStore.user?.username || 'None' }}</div>
          <div><strong>Token Present:</strong> {{ authStore.token ? 'Yes' : 'No' }}</div>
        </div>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const localToken = ref('')
const sessionToken = ref('')
const tokenExpiration = ref('')
const rememberMe = ref('')
const lastUsername = ref('')

const refreshData = () => {
  localToken.value = localStorage.getItem('token') || ''
  sessionToken.value = sessionStorage.getItem('token') || ''
  tokenExpiration.value = localStorage.getItem('tokenExpiration') || ''
  rememberMe.value = localStorage.getItem('rememberMe') || ''
  lastUsername.value = localStorage.getItem('lastUsername') || ''
}

const clearAllStorage = () => {
  localStorage.clear()
  sessionStorage.clear()
  refreshData()
  console.log('All storage cleared')
}

const setRememberMe = () => {
  localStorage.setItem('rememberMe', 'true')
  localStorage.setItem('lastUsername', 'admin')
  refreshData()
  console.log('Remember me data set')
}

const testTokenExpiration = () => {
  // Set an expired token
  const expiredDate = new Date()
  expiredDate.setDate(expiredDate.getDate() - 1) // Yesterday
  
  localStorage.setItem('token', 'expired-token')
  localStorage.setItem('tokenExpiration', expiredDate.toISOString())
  refreshData()
  console.log('Expired token set')
}

onMounted(() => {
  refreshData()
  // Refresh every 2 seconds
  setInterval(refreshData, 2000)
})
</script>

<style scoped>
.login-tester {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 300px;
  z-index: 1000;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.test-section {
  margin-bottom: 16px;
}

.test-section h4 {
  margin: 0 0 8px 0;
  color: #1890ff;
  font-size: 14px;
}

.storage-info,
.auth-info {
  font-size: 12px;
  line-height: 1.4;
}

.storage-info div,
.auth-info div {
  margin-bottom: 4px;
  padding: 2px 0;
  border-bottom: 1px solid #f0f0f0;
}

.storage-info div:last-child,
.auth-info div:last-child {
  border-bottom: none;
}
</style>
