import { ref, type App } from 'vue'
import type { Toast } from '@/components/ToastNotification.vue'

// Global toast state
const toastInstance = ref<any>(null)

export interface ToastOptions {
  title?: string
  message: string
  duration?: number
  dismissible?: boolean
}

export interface ToastMethods {
  success: (options: string | ToastOptions) => string
  error: (options: string | ToastOptions) => string
  warning: (options: string | ToastOptions) => string
  info: (options: string | ToastOptions) => string
  remove: (id: string) => void
  clear: () => void
}

const normalizeOptions = (options: string | ToastOptions): ToastOptions => {
  if (typeof options === 'string') {
    return { message: options }
  }
  return options
}

export const useToast = (): ToastMethods => {
  const addToast = (type: Toast['type'], options: string | ToastOptions) => {
    if (!toastInstance.value) {
      console.warn('Toast instance not found. Make sure ToastNotification component is mounted.')
      return ''
    }
    
    const normalizedOptions = normalizeOptions(options)
    return toastInstance.value.addToast({
      type,
      ...normalizedOptions
    })
  }

  return {
    success: (options: string | ToastOptions) => addToast('success', options),
    error: (options: string | ToastOptions) => addToast('error', options),
    warning: (options: string | ToastOptions) => addToast('warning', options),
    info: (options: string | ToastOptions) => addToast('info', options),
    remove: (id: string) => {
      if (toastInstance.value) {
        toastInstance.value.removeToast(id)
      }
    },
    clear: () => {
      if (toastInstance.value) {
        toastInstance.value.clearAllToasts()
      }
    }
  }
}

// Plugin for global installation
export const ToastPlugin = {
  install(app: App) {
    const toast = useToast()
    
    app.config.globalProperties.$toast = toast
    app.provide('toast', toast)
  }
}

// Set toast instance (called from ToastNotification component)
export const setToastInstance = (instance: any) => {
  toastInstance.value = instance
}

// Global toast methods for direct import
export const toast = {
  success: (options: string | ToastOptions) => {
    const toastMethods = useToast()
    return toastMethods.success(options)
  },
  error: (options: string | ToastOptions) => {
    const toastMethods = useToast()
    return toastMethods.error(options)
  },
  warning: (options: string | ToastOptions) => {
    const toastMethods = useToast()
    return toastMethods.warning(options)
  },
  info: (options: string | ToastOptions) => {
    const toastMethods = useToast()
    return toastMethods.info(options)
  },
  remove: (id: string) => {
    const toastMethods = useToast()
    toastMethods.remove(id)
  },
  clear: () => {
    const toastMethods = useToast()
    toastMethods.clear()
  }
}

// Error handling utilities
export const handleApiError = (error: any, customMessage?: string) => {
  console.error('API Error:', error)
  
  let message = customMessage || 'An unexpected error occurred'
  
  if (error?.response?.data?.message) {
    message = error.response.data.message
  } else if (error?.message) {
    message = error.message
  }
  
  toast.error({
    title: 'Error',
    message,
    duration: 6000
  })
}

export const handleSuccess = (message: string, title?: string) => {
  toast.success({
    title: title || 'Success',
    message,
    duration: 4000
  })
}

export const handleWarning = (message: string, title?: string) => {
  toast.warning({
    title: title || 'Warning',
    message,
    duration: 5000
  })
}

export const handleInfo = (message: string, title?: string) => {
  toast.info({
    title: title || 'Information',
    message,
    duration: 4000
  })
}

// Network error handling
export const handleNetworkError = () => {
  toast.error({
    title: 'Network Error',
    message: 'Please check your internet connection and try again.',
    duration: 6000
  })
}

// Validation error handling
export const handleValidationErrors = (errors: Record<string, string[]>) => {
  const errorMessages = Object.entries(errors)
    .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
    .join('\n')
  
  toast.error({
    title: 'Validation Error',
    message: errorMessages,
    duration: 8000
  })
}

// Loading state with toast
export const withLoadingToast = async <T>(
  promise: Promise<T>,
  options: {
    loading?: string
    success?: string
    error?: string
  } = {}
): Promise<T> => {
  const loadingId = toast.info({
    message: options.loading || 'Loading...',
    duration: 0,
    dismissible: false
  })
  
  try {
    const result = await promise
    toast.remove(loadingId)
    
    if (options.success) {
      toast.success(options.success)
    }
    
    return result
  } catch (error) {
    toast.remove(loadingId)
    
    if (options.error) {
      toast.error(options.error)
    } else {
      handleApiError(error)
    }
    
    throw error
  }
}
