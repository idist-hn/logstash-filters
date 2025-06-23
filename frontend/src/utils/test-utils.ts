import { render, RenderOptions } from '@testing-library/vue'
import { createRouter, createWebHistory, Router } from 'vue-router'
import { createPinia, Pinia } from 'pinia'
import { App } from 'vue'

// Mock router for testing
export function createMockRouter(routes: any[] = []): Router {
  const defaultRoutes = [
    {
      path: '/',
      name: 'Home',
      component: { template: '<div>Home</div>' }
    },
    {
      path: '/login',
      name: 'Login',
      component: { template: '<div>Login</div>' }
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: { template: '<div>Dashboard</div>' }
    }
  ]
  
  return createRouter({
    history: createWebHistory(),
    routes: routes.length > 0 ? routes : defaultRoutes
  })
}

// Mock store setup
export function createMockStore(): Pinia {
  return createPinia()
}

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'global'> {
  router?: Router
  store?: Pinia
  global?: RenderOptions['global']
}

export function renderWithProviders(
  component: any,
  options: CustomRenderOptions = {}
) {
  const {
    router = createMockRouter(),
    store = createMockStore(),
    global = {},
    ...renderOptions
  } = options

  const globalOptions = {
    ...global,
    plugins: [
      ...(global.plugins || []),
      router,
      store
    ]
  }

  return render(component, {
    ...renderOptions,
    global: globalOptions
  })
}

// Mock API responses
export const mockApiResponses = {
  customers: [
    {
      id: '1',
      name: 'Test Customer 1',
      email: 'test1@example.com',
      status: 'active',
      projects: 5
    },
    {
      id: '2',
      name: 'Test Customer 2',
      email: 'test2@example.com',
      status: 'inactive',
      projects: 2
    }
  ],
  
  projects: [
    {
      id: '1',
      name: 'Test Project 1',
      customerId: '1',
      status: 'active',
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'Test Project 2',
      customerId: '1',
      status: 'deploying',
      createdAt: '2024-01-02T00:00:00Z'
    }
  ],
  
  metrics: {
    cpu: 68,
    memory: 72,
    storage: 45,
    uptime: 99.9
  },
  
  logs: [
    {
      id: '1',
      timestamp: '2024-01-01T10:00:00Z',
      level: 'info',
      message: 'Test log message 1',
      service: 'api'
    },
    {
      id: '2',
      timestamp: '2024-01-01T10:01:00Z',
      level: 'error',
      message: 'Test error message',
      service: 'database'
    }
  ]
}

// Mock fetch function
export function createMockFetch(responses: Record<string, any> = {}) {
  return jest.fn((url: string, options?: RequestInit) => {
    const method = options?.method || 'GET'
    const key = `${method} ${url}`
    
    if (responses[key]) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(responses[key])
      })
    }
    
    // Default responses
    if (url.includes('/customers')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockApiResponses.customers)
      })
    }
    
    if (url.includes('/projects')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockApiResponses.projects)
      })
    }
    
    if (url.includes('/metrics')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockApiResponses.metrics)
      })
    }
    
    if (url.includes('/logs')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockApiResponses.logs)
      })
    }
    
    return Promise.reject(new Error(`No mock response for ${key}`))
  })
}

// Test data generators
export function generateMockCustomer(overrides: Partial<any> = {}) {
  return {
    id: Math.random().toString(36).substr(2, 9),
    name: 'Test Customer',
    email: 'test@example.com',
    status: 'active',
    projects: 3,
    createdAt: new Date().toISOString(),
    ...overrides
  }
}

export function generateMockProject(overrides: Partial<any> = {}) {
  return {
    id: Math.random().toString(36).substr(2, 9),
    name: 'Test Project',
    customerId: '1',
    status: 'active',
    createdAt: new Date().toISOString(),
    ...overrides
  }
}

export function generateMockLog(overrides: Partial<any> = {}) {
  return {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    level: 'info',
    message: 'Test log message',
    service: 'api',
    ...overrides
  }
}

// Wait utilities
export function waitFor(condition: () => boolean, timeout = 5000): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()
    
    const check = () => {
      if (condition()) {
        resolve()
      } else if (Date.now() - startTime > timeout) {
        reject(new Error('Timeout waiting for condition'))
      } else {
        setTimeout(check, 100)
      }
    }
    
    check()
  })
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Mock localStorage
export function createMockLocalStorage() {
  const store: Record<string, string> = {}
  
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key])
    }),
    length: 0,
    key: jest.fn()
  }
}

// Mock window.matchMedia
export function createMockMatchMedia() {
  return jest.fn((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
}

// Setup global mocks
export function setupGlobalMocks() {
  // Mock localStorage
  Object.defineProperty(window, 'localStorage', {
    value: createMockLocalStorage()
  })
  
  // Mock matchMedia
  Object.defineProperty(window, 'matchMedia', {
    value: createMockMatchMedia()
  })
  
  // Mock IntersectionObserver
  global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn()
  }))
  
  // Mock ResizeObserver
  global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn()
  }))
  
  // Mock fetch
  global.fetch = createMockFetch()
}

// Cleanup function
export function cleanupMocks() {
  jest.clearAllMocks()
  jest.restoreAllMocks()
}

// Custom matchers
export const customMatchers = {
  toBeVisible: (element: HTMLElement) => {
    const pass = element.style.display !== 'none' && 
                 element.style.visibility !== 'hidden' &&
                 element.offsetParent !== null
    
    return {
      pass,
      message: () => pass 
        ? `Expected element to not be visible`
        : `Expected element to be visible`
    }
  },
  
  toHaveClass: (element: HTMLElement, className: string) => {
    const pass = element.classList.contains(className)
    
    return {
      pass,
      message: () => pass
        ? `Expected element to not have class "${className}"`
        : `Expected element to have class "${className}"`
    }
  }
}

// Test environment setup
export function setupTestEnvironment() {
  setupGlobalMocks()
  
  // Extend Jest matchers
  expect.extend(customMatchers)
  
  // Set up console error/warning suppression for expected errors
  const originalError = console.error
  const originalWarn = console.warn
  
  console.error = (...args: any[]) => {
    if (args[0]?.includes?.('Warning:') || args[0]?.includes?.('Error:')) {
      return
    }
    originalError.apply(console, args)
  }
  
  console.warn = (...args: any[]) => {
    if (args[0]?.includes?.('Warning:')) {
      return
    }
    originalWarn.apply(console, args)
  }
  
  return () => {
    console.error = originalError
    console.warn = originalWarn
    cleanupMocks()
  }
}
