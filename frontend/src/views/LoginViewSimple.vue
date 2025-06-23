<template>
  <div class="login-container">
    <div class="login-background"></div>
    
    <div class="login-card">
      <div class="card-header">
        <h1>CloudWatch ELK</h1>
        <p>System Monitoring Platform</p>
      </div>

      <div class="card-body">
        <!-- Simple form without Ant Design validation -->
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>Username</label>
            <input
              v-model="username"
              type="text"
              placeholder="Enter username"
              required
              class="form-input"
              @input="onUsernameChange"
            />
          </div>

          <div class="form-group">
            <label>Password</label>
            <input
              v-model="password"
              type="password"
              placeholder="Enter password"
              required
              class="form-input"
              @input="onPasswordChange"
            />
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input v-model="remember" type="checkbox" />
              Remember me for 30 days
            </label>
          </div>

          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <button 
            type="submit" 
            class="login-button"
            :disabled="isLoading"
          >
            {{ isLoading ? 'Authenticating...' : 'Login' }}
          </button>

          <div class="debug-section">
            <button type="button" @click="debugData" class="debug-button">
              Debug Data
            </button>
            <button type="button" @click="fillDemo" class="demo-button">
              Fill Demo
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// Simple reactive variables
const username = ref('')
const password = ref('')
const remember = ref(false)

const isLoading = computed(() => authStore.isLoading)
const error = computed(() => authStore.error)

// Event handlers
const onUsernameChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  username.value = target.value
  console.log('Username changed:', username.value)
}

const onPasswordChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  password.value = target.value
  console.log('Password changed:', password.value ? '***' : 'empty')
}

const handleSubmit = async () => {
  console.log('Form submitted with:', {
    username: username.value,
    password: password.value ? '***' : 'empty',
    remember: remember.value
  })

  if (!username.value || !password.value) {
    console.log('Missing credentials')
    return
  }

  const result = await authStore.login(username.value, password.value, remember.value)
  
  if (result.success) {
    router.push('/')
  }
}

const debugData = () => {
  console.log('=== DEBUG DATA ===')
  console.log('Username:', username.value)
  console.log('Password:', password.value ? '***' : 'empty')
  console.log('Remember:', remember.value)
  console.log('Auth store loading:', authStore.isLoading)
  console.log('Auth store error:', authStore.error)
  console.log('==================')
}

const fillDemo = () => {
  username.value = 'admin'
  password.value = 'admin123'
  remember.value = true
  console.log('Demo data filled')
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.login-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 25% 25%, rgba(24, 144, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(114, 46, 209, 0.1) 0%, transparent 50%);
}

.login-card {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  padding: 32px 32px 24px;
  text-align: center;
  background: linear-gradient(135deg, rgba(24, 144, 255, 0.05), rgba(114, 46, 209, 0.05));
  border-bottom: 1px solid #f0f0f0;
}

.card-header h1 {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 700;
  color: #1890ff;
}

.card-header p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.card-body {
  padding: 32px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e8e8e8;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.1);
}

.checkbox-label {
  display: flex !important;
  align-items: center;
  gap: 8px;
  font-weight: normal !important;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  margin: 0;
}

.error-message {
  padding: 12px;
  background: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 6px;
  color: #ff4d4f;
  font-size: 14px;
  margin-bottom: 16px;
}

.login-button {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #1890ff, #096dd9);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.login-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #096dd9, #0050b3);
  transform: translateY(-1px);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.debug-section {
  margin-top: 20px;
  display: flex;
  gap: 8px;
}

.debug-button,
.demo-button {
  flex: 1;
  padding: 8px;
  border: 1px solid #d9d9d9;
  background: white;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.debug-button:hover,
.demo-button:hover {
  border-color: #1890ff;
  color: #1890ff;
}

@media (max-width: 480px) {
  .login-card {
    margin: 16px;
    max-width: none;
  }

  .card-header {
    padding: 24px 24px 20px;
  }

  .card-body {
    padding: 24px;
  }
}
</style>
