// Authentication composable
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { StorageManager } from '@/utils/storage'
import { VALIDATION_MESSAGES } from '@/constants/auth'
import type { LoginCredentials } from '@/types/auth'

export function useAuth() {
  const router = useRouter()
  const authStore = useAuthStore()
  const storage = StorageManager.getInstance()

  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed properties
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const currentUser = computed(() => authStore.user)

  // Login function
  const login = async (credentials: LoginCredentials) => {
    try {
      isLoading.value = true
      error.value = null

      const result = await authStore.login(
        credentials.username,
        credentials.password,
        credentials.remember || false
      )

      if (result.success) {
        // Handle remember me
        if (credentials.remember) {
          storage.setRememberMe(credentials.username)
        } else {
          storage.clearRememberMe()
        }

        return { success: true }
      } else {
        error.value = result.error || VALIDATION_MESSAGES.GENERAL.INVALID_CREDENTIALS
        return { success: false, error: error.value }
      }
    } catch (err) {
      console.error('Login error:', err)
      error.value = VALIDATION_MESSAGES.GENERAL.UNEXPECTED_ERROR
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Logout function
  const logout = async () => {
    try {
      isLoading.value = true
      await authStore.logout()
      router.push('/login')
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      isLoading.value = false
    }
  }

  // Refresh token
  const refreshToken = async () => {
    try {
      return await authStore.refreshToken()
    } catch (err) {
      console.error('Token refresh error:', err)
      return false
    }
  }

  // Check authentication status
  const checkAuth = async () => {
    try {
      isLoading.value = true
      await authStore.checkAuth()
    } catch (err) {
      console.error('Auth check error:', err)
    } finally {
      isLoading.value = false
    }
  }

  // Clear error
  const clearError = () => {
    error.value = null
  }

  // Get remembered credentials
  const getRememberedCredentials = () => {
    return storage.getRememberMe()
  }

  // Initialize auth on mount
  onMounted(() => {
    checkAuth()
  })

  return {
    // State
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    isAuthenticated,
    currentUser,

    // Methods
    login,
    logout,
    refreshToken,
    checkAuth,
    clearError,
    getRememberedCredentials,
  }
}
