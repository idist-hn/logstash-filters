// Performance optimization utilities

// Debounce function for search and input handling
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }
    
    const callNow = immediate && !timeout
    
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    
    if (callNow) func(...args)
  }
}

// Throttle function for scroll and resize events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Intersection Observer for lazy loading
export function createIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  }
  
  return new IntersectionObserver(callback, defaultOptions)
}

// Virtual scrolling helper
export class VirtualScroller {
  private container: HTMLElement
  private itemHeight: number
  private visibleCount: number
  private scrollTop = 0
  private totalItems = 0
  
  constructor(container: HTMLElement, itemHeight: number) {
    this.container = container
    this.itemHeight = itemHeight
    this.visibleCount = Math.ceil(container.clientHeight / itemHeight) + 2
  }
  
  getVisibleRange(totalItems: number, scrollTop: number) {
    this.totalItems = totalItems
    this.scrollTop = scrollTop
    
    const startIndex = Math.floor(scrollTop / this.itemHeight)
    const endIndex = Math.min(startIndex + this.visibleCount, totalItems)
    
    return {
      startIndex: Math.max(0, startIndex),
      endIndex,
      offsetY: startIndex * this.itemHeight
    }
  }
  
  getTotalHeight() {
    return this.totalItems * this.itemHeight
  }
}

// Memory management
export function cleanupEventListeners(element: HTMLElement, events: string[]) {
  events.forEach(event => {
    const listeners = (element as any)._listeners?.[event] || []
    listeners.forEach((listener: EventListener) => {
      element.removeEventListener(event, listener)
    })
  })
}

// Image lazy loading
export function lazyLoadImage(img: HTMLImageElement, src: string) {
  const observer = createIntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const image = entry.target as HTMLImageElement
        image.src = src
        image.classList.add('loaded')
        observer.unobserve(image)
      }
    })
  })
  
  observer.observe(img)
  return observer
}

// Bundle size optimization - dynamic imports
export async function loadComponent(componentPath: string) {
  try {
    const module = await import(componentPath)
    return module.default || module
  } catch (error) {
    console.error(`Failed to load component: ${componentPath}`, error)
    throw error
  }
}

// Performance monitoring
export class PerformanceMonitor {
  private metrics: Map<string, number> = new Map()
  
  startTiming(label: string) {
    this.metrics.set(`${label}_start`, performance.now())
  }
  
  endTiming(label: string) {
    const startTime = this.metrics.get(`${label}_start`)
    if (startTime) {
      const duration = performance.now() - startTime
      this.metrics.set(label, duration)
      console.log(`${label}: ${duration.toFixed(2)}ms`)
      return duration
    }
    return 0
  }
  
  getMetric(label: string) {
    return this.metrics.get(label) || 0
  }
  
  getAllMetrics() {
    const result: Record<string, number> = {}
    this.metrics.forEach((value, key) => {
      if (!key.endsWith('_start')) {
        result[key] = value
      }
    })
    return result
  }
  
  clear() {
    this.metrics.clear()
  }
}

// Memory usage monitoring
export function getMemoryUsage() {
  if ('memory' in performance) {
    const memory = (performance as any).memory
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      usedPercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
    }
  }
  return null
}

// Resource preloading
export function preloadResource(href: string, as: string = 'fetch') {
  const link = document.createElement('link')
  link.rel = 'preload'
  link.href = href
  link.as = as
  document.head.appendChild(link)
}

// Critical resource hints
export function addResourceHints() {
  // DNS prefetch for external resources
  const dnsPrefetch = [
    '//fonts.googleapis.com',
    '//fonts.gstatic.com'
  ]
  
  dnsPrefetch.forEach(domain => {
    const link = document.createElement('link')
    link.rel = 'dns-prefetch'
    link.href = domain
    document.head.appendChild(link)
  })
}

// Optimize images
export function optimizeImage(
  src: string, 
  width?: number, 
  height?: number, 
  quality = 80
): string {
  // This would typically integrate with an image optimization service
  // For now, return the original src
  const params = new URLSearchParams()
  if (width) params.set('w', width.toString())
  if (height) params.set('h', height.toString())
  params.set('q', quality.toString())
  
  return params.toString() ? `${src}?${params.toString()}` : src
}

// Service Worker registration
export async function registerServiceWorker(swPath = '/sw.js') {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(swPath)
      console.log('Service Worker registered:', registration)
      return registration
    } catch (error) {
      console.error('Service Worker registration failed:', error)
      throw error
    }
  }
  throw new Error('Service Worker not supported')
}

// Cache management
export class CacheManager {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map()
  
  set(key: string, data: any, ttl = 300000) { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }
  
  get(key: string) {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return item.data
  }
  
  clear() {
    this.cache.clear()
  }
  
  cleanup() {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor()

// Global cache manager instance
export const cacheManager = new CacheManager()

// Auto cleanup cache every 5 minutes
setInterval(() => {
  cacheManager.cleanup()
}, 300000)
