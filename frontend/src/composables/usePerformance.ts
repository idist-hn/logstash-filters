import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { 
  debounce, 
  throttle, 
  performanceMonitor, 
  cacheManager,
  getMemoryUsage,
  createIntersectionObserver
} from '@/utils/performance'

// Debounced search composable
export function useDebouncedSearch(delay = 300) {
  const searchQuery = ref('')
  const isSearching = ref(false)
  const searchResults = ref<any[]>([])
  
  const performSearch = async (query: string) => {
    if (!query.trim()) {
      searchResults.value = []
      return
    }
    
    isSearching.value = true
    
    try {
      // Check cache first
      const cacheKey = `search:${query}`
      const cached = cacheManager.get(cacheKey)
      
      if (cached) {
        searchResults.value = cached
        return
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      const results = [
        { id: 1, title: `Result for "${query}"`, type: 'mock' }
      ]
      
      // Cache results
      cacheManager.set(cacheKey, results, 300000) // 5 minutes
      searchResults.value = results
    } catch (error) {
      console.error('Search failed:', error)
      searchResults.value = []
    } finally {
      isSearching.value = false
    }
  }
  
  const debouncedSearch = debounce(performSearch, delay)
  
  const search = (query: string) => {
    searchQuery.value = query
    debouncedSearch(query)
  }
  
  return {
    searchQuery,
    isSearching,
    searchResults,
    search
  }
}

// Virtual scrolling composable
export function useVirtualScroll(itemHeight: number, containerRef: any) {
  const scrollTop = ref(0)
  const visibleStartIndex = ref(0)
  const visibleEndIndex = ref(0)
  const visibleItems = ref<any[]>([])
  const totalHeight = ref(0)
  
  const updateVisibleItems = (allItems: any[]) => {
    if (!containerRef.value) return
    
    const containerHeight = containerRef.value.clientHeight
    const visibleCount = Math.ceil(containerHeight / itemHeight) + 2
    
    const startIndex = Math.floor(scrollTop.value / itemHeight)
    const endIndex = Math.min(startIndex + visibleCount, allItems.length)
    
    visibleStartIndex.value = Math.max(0, startIndex)
    visibleEndIndex.value = endIndex
    visibleItems.value = allItems.slice(visibleStartIndex.value, visibleEndIndex.value)
    totalHeight.value = allItems.length * itemHeight
  }
  
  const handleScroll = throttle((event: Event) => {
    const target = event.target as HTMLElement
    scrollTop.value = target.scrollTop
  }, 16) // ~60fps
  
  onMounted(() => {
    if (containerRef.value) {
      containerRef.value.addEventListener('scroll', handleScroll)
    }
  })
  
  onUnmounted(() => {
    if (containerRef.value) {
      containerRef.value.removeEventListener('scroll', handleScroll)
    }
  })
  
  return {
    scrollTop,
    visibleStartIndex,
    visibleEndIndex,
    visibleItems,
    totalHeight,
    updateVisibleItems
  }
}

// Lazy loading composable
export function useLazyLoading() {
  const isVisible = ref(false)
  const targetRef = ref<HTMLElement>()
  
  onMounted(() => {
    if (!targetRef.value) return
    
    const observer = createIntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          isVisible.value = true
          observer.unobserve(entry.target)
        }
      })
    })
    
    observer.observe(targetRef.value)
    
    onUnmounted(() => {
      observer.disconnect()
    })
  })
  
  return {
    isVisible,
    targetRef
  }
}

// Performance monitoring composable
export function usePerformanceMonitoring() {
  const metrics = ref<Record<string, number>>({})
  const memoryUsage = ref<any>(null)
  
  const startTiming = (label: string) => {
    performanceMonitor.startTiming(label)
  }
  
  const endTiming = (label: string) => {
    const duration = performanceMonitor.endTiming(label)
    updateMetrics()
    return duration
  }
  
  const updateMetrics = () => {
    metrics.value = performanceMonitor.getAllMetrics()
  }
  
  const updateMemoryUsage = () => {
    memoryUsage.value = getMemoryUsage()
  }
  
  const measureAsync = async <T>(label: string, fn: () => Promise<T>): Promise<T> => {
    startTiming(label)
    try {
      const result = await fn()
      return result
    } finally {
      endTiming(label)
    }
  }
  
  // Update memory usage periodically
  let memoryInterval: NodeJS.Timeout
  
  onMounted(() => {
    updateMemoryUsage()
    memoryInterval = setInterval(updateMemoryUsage, 5000) // Every 5 seconds
  })
  
  onUnmounted(() => {
    if (memoryInterval) {
      clearInterval(memoryInterval)
    }
  })
  
  return {
    metrics,
    memoryUsage,
    startTiming,
    endTiming,
    measureAsync,
    updateMetrics,
    updateMemoryUsage
  }
}

// Image optimization composable
export function useImageOptimization() {
  const loadedImages = ref(new Set<string>())
  const failedImages = ref(new Set<string>())
  
  const optimizeImageSrc = (
    src: string, 
    width?: number, 
    height?: number, 
    quality = 80
  ): string => {
    // Simple optimization - in real app, this would use a service
    const params = new URLSearchParams()
    if (width) params.set('w', width.toString())
    if (height) params.set('h', height.toString())
    params.set('q', quality.toString())
    
    return params.toString() ? `${src}?${params.toString()}` : src
  }
  
  const preloadImage = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (loadedImages.value.has(src)) {
        resolve()
        return
      }
      
      if (failedImages.value.has(src)) {
        reject(new Error('Image previously failed to load'))
        return
      }
      
      const img = new Image()
      img.onload = () => {
        loadedImages.value.add(src)
        resolve()
      }
      img.onerror = () => {
        failedImages.value.add(src)
        reject(new Error('Failed to load image'))
      }
      img.src = src
    })
  }
  
  const isImageLoaded = (src: string) => loadedImages.value.has(src)
  const hasImageFailed = (src: string) => failedImages.value.has(src)
  
  return {
    optimizeImageSrc,
    preloadImage,
    isImageLoaded,
    hasImageFailed,
    loadedImages,
    failedImages
  }
}

// Bundle splitting helper
export function useDynamicImport() {
  const loadingComponents = ref(new Set<string>())
  const loadedComponents = ref(new Map<string, any>())
  const failedComponents = ref(new Set<string>())
  
  const loadComponent = async (componentPath: string) => {
    if (loadedComponents.value.has(componentPath)) {
      return loadedComponents.value.get(componentPath)
    }
    
    if (failedComponents.value.has(componentPath)) {
      throw new Error(`Component ${componentPath} previously failed to load`)
    }
    
    if (loadingComponents.value.has(componentPath)) {
      // Wait for existing load to complete
      while (loadingComponents.value.has(componentPath)) {
        await new Promise(resolve => setTimeout(resolve, 50))
      }
      return loadedComponents.value.get(componentPath)
    }
    
    loadingComponents.value.add(componentPath)
    
    try {
      const module = await import(componentPath)
      const component = module.default || module
      loadedComponents.value.set(componentPath, component)
      return component
    } catch (error) {
      failedComponents.value.add(componentPath)
      throw error
    } finally {
      loadingComponents.value.delete(componentPath)
    }
  }
  
  const isComponentLoading = (componentPath: string) => {
    return loadingComponents.value.has(componentPath)
  }
  
  const isComponentLoaded = (componentPath: string) => {
    return loadedComponents.value.has(componentPath)
  }
  
  return {
    loadComponent,
    isComponentLoading,
    isComponentLoaded,
    loadingComponents,
    loadedComponents
  }
}

// Resource preloading composable
export function useResourcePreloading() {
  const preloadedResources = ref(new Set<string>())
  
  const preloadResource = (href: string, as = 'fetch') => {
    if (preloadedResources.value.has(href)) return
    
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = href
    link.as = as
    
    link.onload = () => preloadedResources.value.add(href)
    link.onerror = () => console.warn(`Failed to preload resource: ${href}`)
    
    document.head.appendChild(link)
  }
  
  const preloadCriticalResources = () => {
    // Preload critical CSS
    preloadResource('/css/critical.css', 'style')
    
    // Preload important fonts
    preloadResource('/fonts/main.woff2', 'font')
    
    // Preload critical images
    preloadResource('/images/logo.svg', 'image')
  }
  
  return {
    preloadResource,
    preloadCriticalResources,
    preloadedResources
  }
}
