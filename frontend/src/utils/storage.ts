// Storage utilities with error handling
import { AUTH_CONFIG } from '@/constants/auth'

export class StorageManager {
  private static instance: StorageManager
  
  private constructor() {}
  
  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager()
    }
    return StorageManager.instance
  }

  // Token management
  setToken(token: string, remember: boolean = false): void {
    try {
      if (remember) {
        const expirationDate = new Date()
        expirationDate.setDate(expirationDate.getDate() + AUTH_CONFIG.REMEMBER_DURATION_DAYS)
        
        localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, token)
        localStorage.setItem(AUTH_CONFIG.TOKEN_EXPIRATION_KEY, expirationDate.toISOString())
        sessionStorage.removeItem(AUTH_CONFIG.TOKEN_KEY)
      } else {
        sessionStorage.setItem(AUTH_CONFIG.TOKEN_KEY, token)
        this.clearPersistentToken()
      }
    } catch (error) {
      console.error('Failed to store token:', error)
    }
  }

  getToken(): string | null {
    try {
      // Check localStorage first (remember me)
      let token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY)
      const expiration = localStorage.getItem(AUTH_CONFIG.TOKEN_EXPIRATION_KEY)
      
      // Check if localStorage token is expired
      if (token && expiration) {
        const expirationDate = new Date(expiration)
        if (new Date() > expirationDate) {
          this.clearPersistentToken()
          token = null
        }
      }
      
      // If no valid localStorage token, check sessionStorage
      if (!token) {
        token = sessionStorage.getItem(AUTH_CONFIG.TOKEN_KEY)
      }
      
      return token
    } catch (error) {
      console.error('Failed to retrieve token:', error)
      return null
    }
  }

  clearToken(): void {
    try {
      localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY)
      localStorage.removeItem(AUTH_CONFIG.TOKEN_EXPIRATION_KEY)
      sessionStorage.removeItem(AUTH_CONFIG.TOKEN_KEY)
    } catch (error) {
      console.error('Failed to clear token:', error)
    }
  }

  private clearPersistentToken(): void {
    try {
      localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY)
      localStorage.removeItem(AUTH_CONFIG.TOKEN_EXPIRATION_KEY)
    } catch (error) {
      console.error('Failed to clear persistent token:', error)
    }
  }

  // Remember me management
  setRememberMe(username: string): void {
    try {
      localStorage.setItem(AUTH_CONFIG.REMEMBER_ME_KEY, 'true')
      localStorage.setItem(AUTH_CONFIG.LAST_USERNAME_KEY, username)
    } catch (error) {
      console.error('Failed to set remember me:', error)
    }
  }

  getRememberMe(): { remember: boolean; username: string | null } {
    try {
      const remember = localStorage.getItem(AUTH_CONFIG.REMEMBER_ME_KEY) === 'true'
      const username = localStorage.getItem(AUTH_CONFIG.LAST_USERNAME_KEY)
      return { remember, username }
    } catch (error) {
      console.error('Failed to get remember me:', error)
      return { remember: false, username: null }
    }
  }

  clearRememberMe(): void {
    try {
      localStorage.removeItem(AUTH_CONFIG.REMEMBER_ME_KEY)
      localStorage.removeItem(AUTH_CONFIG.LAST_USERNAME_KEY)
    } catch (error) {
      console.error('Failed to clear remember me:', error)
    }
  }

  // General storage utilities
  clearAll(): void {
    try {
      this.clearToken()
      this.clearRememberMe()
    } catch (error) {
      console.error('Failed to clear all storage:', error)
    }
  }

  isStorageAvailable(): boolean {
    try {
      const test = '__storage_test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  }
}
