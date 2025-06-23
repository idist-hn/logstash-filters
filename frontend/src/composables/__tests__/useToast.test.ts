import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { 
  useToast, 
  toast, 
  handleApiError, 
  handleSuccess, 
  handleWarning, 
  handleInfo,
  withLoadingToast,
  setToastInstance
} from '../useToast'
import { setupTestEnvironment } from '@/utils/test-utils'

describe('useToast', () => {
  let cleanup: () => void
  let mockToastInstance: any

  beforeEach(() => {
    cleanup = setupTestEnvironment()
    
    // Create mock toast instance
    mockToastInstance = {
      addToast: vi.fn().mockReturnValue('mock-id'),
      removeToast: vi.fn(),
      clearAllToasts: vi.fn()
    }
    
    setToastInstance(mockToastInstance)
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  describe('useToast composable', () => {
    it('returns toast methods', () => {
      const toastMethods = useToast()
      
      expect(toastMethods).toHaveProperty('success')
      expect(toastMethods).toHaveProperty('error')
      expect(toastMethods).toHaveProperty('warning')
      expect(toastMethods).toHaveProperty('info')
      expect(toastMethods).toHaveProperty('remove')
      expect(toastMethods).toHaveProperty('clear')
    })

    it('calls addToast with correct parameters for success', () => {
      const toastMethods = useToast()
      
      toastMethods.success('Success message')
      
      expect(mockToastInstance.addToast).toHaveBeenCalledWith({
        type: 'success',
        message: 'Success message'
      })
    })

    it('calls addToast with correct parameters for error', () => {
      const toastMethods = useToast()
      
      toastMethods.error('Error message')
      
      expect(mockToastInstance.addToast).toHaveBeenCalledWith({
        type: 'error',
        message: 'Error message'
      })
    })

    it('calls addToast with correct parameters for warning', () => {
      const toastMethods = useToast()
      
      toastMethods.warning('Warning message')
      
      expect(mockToastInstance.addToast).toHaveBeenCalledWith({
        type: 'warning',
        message: 'Warning message'
      })
    })

    it('calls addToast with correct parameters for info', () => {
      const toastMethods = useToast()
      
      toastMethods.info('Info message')
      
      expect(mockToastInstance.addToast).toHaveBeenCalledWith({
        type: 'info',
        message: 'Info message'
      })
    })

    it('handles object options correctly', () => {
      const toastMethods = useToast()
      
      toastMethods.success({
        title: 'Success Title',
        message: 'Success message',
        duration: 3000
      })
      
      expect(mockToastInstance.addToast).toHaveBeenCalledWith({
        type: 'success',
        title: 'Success Title',
        message: 'Success message',
        duration: 3000
      })
    })

    it('calls removeToast correctly', () => {
      const toastMethods = useToast()
      
      toastMethods.remove('test-id')
      
      expect(mockToastInstance.removeToast).toHaveBeenCalledWith('test-id')
    })

    it('calls clearAllToasts correctly', () => {
      const toastMethods = useToast()
      
      toastMethods.clear()
      
      expect(mockToastInstance.clearAllToasts).toHaveBeenCalled()
    })

    it('warns when toast instance is not available', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      setToastInstance(null)
      
      const toastMethods = useToast()
      toastMethods.success('Test message')
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Toast instance not found. Make sure ToastNotification component is mounted.'
      )
      
      consoleSpy.mockRestore()
    })
  })

  describe('global toast methods', () => {
    it('toast.success works correctly', () => {
      toast.success('Global success')
      
      expect(mockToastInstance.addToast).toHaveBeenCalledWith({
        type: 'success',
        message: 'Global success'
      })
    })

    it('toast.error works correctly', () => {
      toast.error('Global error')
      
      expect(mockToastInstance.addToast).toHaveBeenCalledWith({
        type: 'error',
        message: 'Global error'
      })
    })

    it('toast.warning works correctly', () => {
      toast.warning('Global warning')
      
      expect(mockToastInstance.addToast).toHaveBeenCalledWith({
        type: 'warning',
        message: 'Global warning'
      })
    })

    it('toast.info works correctly', () => {
      toast.info('Global info')
      
      expect(mockToastInstance.addToast).toHaveBeenCalledWith({
        type: 'info',
        message: 'Global info'
      })
    })
  })

  describe('error handling utilities', () => {
    it('handleApiError with default message', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const error = new Error('API Error')
      
      handleApiError(error)
      
      expect(consoleSpy).toHaveBeenCalledWith('API Error:', error)
      expect(mockToastInstance.addToast).toHaveBeenCalledWith({
        type: 'error',
        title: 'Error',
        message: 'API Error',
        duration: 6000
      })
      
      consoleSpy.mockRestore()
    })

    it('handleApiError with custom message', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const error = new Error('API Error')
      
      handleApiError(error, 'Custom error message')
      
      expect(mockToastInstance.addToast).toHaveBeenCalledWith({
        type: 'error',
        title: 'Error',
        message: 'Custom error message',
        duration: 6000
      })
      
      consoleSpy.mockRestore()
    })

    it('handleApiError with response data message', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const error = {
        response: {
          data: {
            message: 'Server error message'
          }
        }
      }
      
      handleApiError(error)
      
      expect(mockToastInstance.addToast).toHaveBeenCalledWith({
        type: 'error',
        title: 'Error',
        message: 'Server error message',
        duration: 6000
      })
      
      consoleSpy.mockRestore()
    })

    it('handleSuccess works correctly', () => {
      handleSuccess('Operation successful')
      
      expect(mockToastInstance.addToast).toHaveBeenCalledWith({
        type: 'success',
        title: 'Success',
        message: 'Operation successful',
        duration: 4000
      })
    })

    it('handleWarning works correctly', () => {
      handleWarning('Warning message')
      
      expect(mockToastInstance.addToast).toHaveBeenCalledWith({
        type: 'warning',
        title: 'Warning',
        message: 'Warning message',
        duration: 5000
      })
    })

    it('handleInfo works correctly', () => {
      handleInfo('Info message')
      
      expect(mockToastInstance.addToast).toHaveBeenCalledWith({
        type: 'info',
        title: 'Information',
        message: 'Info message',
        duration: 4000
      })
    })
  })

  describe('withLoadingToast', () => {
    it('shows loading toast and success message', async () => {
      const mockPromise = Promise.resolve('success')
      
      const result = await withLoadingToast(mockPromise, {
        loading: 'Loading...',
        success: 'Done!'
      })
      
      expect(result).toBe('success')
      
      // Should show loading toast
      expect(mockToastInstance.addToast).toHaveBeenCalledWith({
        type: 'info',
        message: 'Loading...',
        duration: 0,
        dismissible: false
      })
      
      // Should remove loading toast
      expect(mockToastInstance.removeToast).toHaveBeenCalledWith('mock-id')
      
      // Should show success toast
      expect(mockToastInstance.addToast).toHaveBeenCalledWith({
        type: 'success',
        message: 'Done!'
      })
    })

    it('shows loading toast and error message on failure', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const mockError = new Error('Test error')
      const mockPromise = Promise.reject(mockError)
      
      await expect(withLoadingToast(mockPromise, {
        loading: 'Loading...',
        error: 'Failed!'
      })).rejects.toThrow('Test error')
      
      // Should show loading toast
      expect(mockToastInstance.addToast).toHaveBeenCalledWith({
        type: 'info',
        message: 'Loading...',
        duration: 0,
        dismissible: false
      })
      
      // Should remove loading toast
      expect(mockToastInstance.removeToast).toHaveBeenCalledWith('mock-id')
      
      // Should show error toast
      expect(mockToastInstance.addToast).toHaveBeenCalledWith({
        type: 'error',
        message: 'Failed!'
      })
      
      consoleSpy.mockRestore()
    })

    it('uses default loading message', async () => {
      const mockPromise = Promise.resolve('success')
      
      await withLoadingToast(mockPromise)
      
      expect(mockToastInstance.addToast).toHaveBeenCalledWith({
        type: 'info',
        message: 'Loading...',
        duration: 0,
        dismissible: false
      })
    })

    it('handles error without custom error message', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const mockError = new Error('Test error')
      const mockPromise = Promise.reject(mockError)
      
      await expect(withLoadingToast(mockPromise)).rejects.toThrow('Test error')
      
      // Should call handleApiError for default error handling
      expect(mockToastInstance.addToast).toHaveBeenCalledWith({
        type: 'error',
        title: 'Error',
        message: 'Test error',
        duration: 6000
      })
      
      consoleSpy.mockRestore()
    })
  })
})
