import { ref, watch, onMounted } from 'vue'

export type Theme = 'light' | 'dark'

// Global theme state
const isDarkMode = ref(false)
const currentTheme = ref<Theme>('light')

// Theme management composable
export function useTheme() {
  // Apply theme to document
  const applyTheme = (theme: Theme) => {
    const html = document.documentElement
    
    // Remove existing theme classes
    html.classList.remove('light', 'dark')
    
    // Add new theme class
    html.classList.add(theme)
    html.setAttribute('data-theme', theme)
    
    // Update reactive state
    currentTheme.value = theme
    isDarkMode.value = theme === 'dark'
  }

  // Toggle between light and dark mode
  const toggleTheme = () => {
    const newTheme: Theme = currentTheme.value === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  // Set specific theme
  const setTheme = (theme: Theme) => {
    applyTheme(theme)
    localStorage.setItem('theme', theme)
  }

  // Get theme from localStorage or system preference
  const getInitialTheme = (): Theme => {
    // Check localStorage first
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
      return savedTheme
    }

    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }

    return 'light'
  }

  // Initialize theme
  const initializeTheme = () => {
    const initialTheme = getInitialTheme()
    applyTheme(initialTheme)
  }

  // Watch for system theme changes
  const watchSystemTheme = () => {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      
      const handleChange = (e: MediaQueryListEvent) => {
        // Only auto-switch if user hasn't manually set a preference
        const savedTheme = localStorage.getItem('theme')
        if (!savedTheme) {
          const systemTheme: Theme = e.matches ? 'dark' : 'light'
          applyTheme(systemTheme)
        }
      }

      mediaQuery.addEventListener('change', handleChange)
      
      // Return cleanup function
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
    
    return () => {}
  }

  return {
    isDarkMode,
    currentTheme,
    toggleTheme,
    setTheme,
    initializeTheme,
    watchSystemTheme
  }
}

// Global theme utilities
export const themeUtils = {
  // Get CSS variable value
  getCSSVariable: (variable: string): string => {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(variable)
      .trim()
  },

  // Set CSS variable value
  setCSSVariable: (variable: string, value: string): void => {
    document.documentElement.style.setProperty(variable, value)
  },

  // Check if dark mode is active
  isDarkMode: (): boolean => {
    return document.documentElement.classList.contains('dark')
  },

  // Get current theme
  getCurrentTheme: (): Theme => {
    return document.documentElement.getAttribute('data-theme') as Theme || 'light'
  },

  // Apply theme transition
  enableTransitions: (): void => {
    document.documentElement.classList.add('theme-transition')
  },

  // Disable theme transition (useful during initialization)
  disableTransitions: (): void => {
    document.documentElement.classList.remove('theme-transition')
  }
}

// Theme constants
export const THEME_COLORS = {
  light: {
    primary: '#1890ff',
    success: '#52c41a',
    warning: '#faad14',
    error: '#ff4d4f',
    info: '#1890ff',
    bgPrimary: '#ffffff',
    bgSecondary: '#fafafa',
    bgTertiary: '#f5f5f5',
    textPrimary: '#262626',
    textSecondary: '#595959',
    textTertiary: '#8c8c8c',
    borderColor: '#d9d9d9',
    borderLight: '#f0f0f0'
  },
  dark: {
    primary: '#1890ff',
    success: '#52c41a',
    warning: '#faad14',
    error: '#ff4d4f',
    info: '#1890ff',
    bgPrimary: '#141414',
    bgSecondary: '#1f1f1f',
    bgTertiary: '#262626',
    textPrimary: '#ffffff',
    textSecondary: '#a6a6a6',
    textTertiary: '#737373',
    borderColor: '#434343',
    borderLight: '#303030'
  }
} as const

// Theme validation
export const isValidTheme = (theme: string): theme is Theme => {
  return ['light', 'dark'].includes(theme)
}

// Auto-initialize theme when module is imported
let isInitialized = false

export const autoInitializeTheme = () => {
  if (isInitialized) return
  
  const { initializeTheme, watchSystemTheme } = useTheme()
  
  // Disable transitions during initialization
  themeUtils.disableTransitions()
  
  // Initialize theme
  initializeTheme()
  
  // Enable transitions after a short delay
  setTimeout(() => {
    themeUtils.enableTransitions()
  }, 100)
  
  // Watch for system theme changes
  watchSystemTheme()
  
  isInitialized = true
}

// Export singleton instance for global use
export const globalTheme = useTheme()

// Auto-initialize if we're in browser environment
if (typeof window !== 'undefined') {
  autoInitializeTheme()
}
