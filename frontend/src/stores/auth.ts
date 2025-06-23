import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref<string | null>(null)
  const user = ref<any>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const isAuthenticated = computed(() => !!token.value)

  // Actions
  const login = async (username: string, password: string, remember: boolean = false) => {
    try {
      isLoading.value = true
      error.value = null

      console.log('Auth store: Making login request', {
        username,
        password: '***',
        remember
      })

      const response = await api.post('/auth/login', {
        username,
        password
      })

      console.log('Auth store: Login response received', response.data)

      const { token: newToken, user: userData } = response.data

      // Validate response
      if (!newToken || !userData) {
        throw new Error('Invalid response from server')
      }

      // Set auth state
      token.value = newToken
      user.value = userData

      // Store token with remember preference
      if (remember) {
        localStorage.setItem('cloudwatch_token', newToken)
        localStorage.setItem('cloudwatch_remember', 'true')
        localStorage.setItem('cloudwatch_username', username)
        sessionStorage.removeItem('cloudwatch_token')
      } else {
        sessionStorage.setItem('cloudwatch_token', newToken)
        localStorage.removeItem('cloudwatch_token')
        localStorage.removeItem('cloudwatch_remember')
        localStorage.removeItem('cloudwatch_username')
      }

      console.log('Auth store: Login successful')
      return { success: true }
    } catch (err: any) {
      console.error('Auth store: Login error', err)

      let errorMessage = 'Login failed'

      if (err.response?.status === 401) {
        errorMessage = 'Invalid username or password'
      } else if (err.response?.status === 429) {
        errorMessage = 'Too many login attempts. Please try again later.'
      } else if (err.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.'
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.message) {
        errorMessage = err.message
      }

      error.value = errorMessage

      return {
        success: false,
        error: errorMessage
      }
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      isLoading.value = true

      // Call logout API if token exists
      if (token.value) {
        try {
          await api.post('/auth/logout')
        } catch (err) {
          console.warn('Logout API call failed:', err)
        }
      }

      // Clear auth state
      token.value = null
      user.value = null
      error.value = null

      // Clear all storage
      localStorage.removeItem('cloudwatch_token')
      localStorage.removeItem('cloudwatch_remember')
      localStorage.removeItem('cloudwatch_username')
      sessionStorage.removeItem('cloudwatch_token')

      console.log('Auth store: User logged out')
    } catch (err) {
      console.error('Auth store: Logout error', err)
    } finally {
      isLoading.value = false
    }
  }

  const checkAuth = async () => {
    try {
      isLoading.value = true

      // Check for stored token
      const storedToken = localStorage.getItem('cloudwatch_token') ||
                         sessionStorage.getItem('cloudwatch_token')

      if (!storedToken) {
        console.log('Auth store: No token found')
        return
      }

      // Set token temporarily
      token.value = storedToken

      try {
        // Validate token with server
        const response = await api.get('/auth/profile')

        if (response.data && response.data.user) {
          user.value = response.data.user
          console.log('Auth store: Token validated, user authenticated')
        } else {
          throw new Error('Invalid profile response')
        }
      } catch (err: any) {
        console.warn('Auth store: Token validation failed', err)

        // Clear invalid token
        token.value = null
        user.value = null
        localStorage.removeItem('cloudwatch_token')
        sessionStorage.removeItem('cloudwatch_token')
      }
    } catch (err) {
      console.error('Auth store: Auth check error', err)
    } finally {
      isLoading.value = false
    }
  }

  // Get remembered credentials
  const getRememberedCredentials = () => {
    const remember = localStorage.getItem('cloudwatch_remember') === 'true'
    const username = localStorage.getItem('cloudwatch_username') || ''

    return {
      remember,
      username
    }
  }

  return {
    // State
    isAuthenticated,
    user,
    token,
    isLoading,
    error,

    // Actions
    login,
    logout,
    checkAuth,
    getRememberedCredentials,
  }
})
