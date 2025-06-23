<template>
  <div style="padding: 20px;">
    <h2>Login Test Component</h2>
    <div style="margin-bottom: 16px;">
      <input v-model="username" placeholder="Username" style="margin-right: 8px;" />
      <input v-model="password" type="password" placeholder="Password" style="margin-right: 8px;" />
      <button @click="testLogin" :disabled="loading">
        {{ loading ? 'Testing...' : 'Test Login' }}
      </button>
    </div>
    <div v-if="result" style="margin-top: 16px;">
      <h3>Result:</h3>
      <pre>{{ JSON.stringify(result, null, 2) }}</pre>
    </div>
    <div v-if="error" style="margin-top: 16px; color: red;">
      <h3>Error:</h3>
      <pre>{{ error }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import api from '@/services/api'

const username = ref('admin')
const password = ref('admin123')
const loading = ref(false)
const result = ref(null)
const error = ref('')

const testLogin = async () => {
  loading.value = true
  result.value = null
  error.value = ''
  
  try {
    console.log('Testing login with:', { username: username.value, password: '***' })
    
    const response = await api.post('/auth/login', {
      username: username.value,
      password: password.value
    })
    
    console.log('Login response:', response)
    result.value = response.data
    
  } catch (err: any) {
    console.error('Login error:', err)
    error.value = err.response?.data?.error || err.message || 'Unknown error'
  } finally {
    loading.value = false
  }
}
</script>
