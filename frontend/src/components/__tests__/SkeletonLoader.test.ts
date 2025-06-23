import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { screen } from '@testing-library/vue'
import SkeletonLoader from '../SkeletonLoader.vue'
import { renderWithProviders, setupTestEnvironment } from '@/utils/test-utils'

describe('SkeletonLoader', () => {
  let cleanup: () => void

  beforeEach(() => {
    cleanup = setupTestEnvironment()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders card skeleton by default', () => {
    renderWithProviders(SkeletonLoader, {
      props: { type: 'card' }
    })

    expect(document.querySelector('.skeleton-card')).toBeTruthy()
    expect(document.querySelector('.skeleton-icon')).toBeTruthy()
    expect(document.querySelector('.skeleton-title')).toBeTruthy()
    expect(document.querySelector('.skeleton-subtitle')).toBeTruthy()
  })

  it('renders list skeleton with correct count', () => {
    renderWithProviders(SkeletonLoader, {
      props: { 
        type: 'list',
        count: 5
      }
    })

    const listItems = document.querySelectorAll('.skeleton-list-item')
    expect(listItems).toHaveLength(5)
  })

  it('renders grid skeleton', () => {
    renderWithProviders(SkeletonLoader, {
      props: { type: 'grid' }
    })

    expect(document.querySelector('.skeleton-grid')).toBeTruthy()
    expect(document.querySelector('.skeleton-grid-item')).toBeTruthy()
  })

  it('renders table skeleton', () => {
    renderWithProviders(SkeletonLoader, {
      props: { type: 'table' }
    })

    expect(document.querySelector('.skeleton-table')).toBeTruthy()
    expect(document.querySelector('.skeleton-table-header')).toBeTruthy()
    expect(document.querySelector('.skeleton-table-row')).toBeTruthy()
  })

  it('renders chart skeleton', () => {
    renderWithProviders(SkeletonLoader, {
      props: { type: 'chart' }
    })

    expect(document.querySelector('.skeleton-chart')).toBeTruthy()
    expect(document.querySelector('.skeleton-chart-bars')).toBeTruthy()
    expect(document.querySelector('.skeleton-bar')).toBeTruthy()
  })

  it('renders text skeleton with default count', () => {
    renderWithProviders(SkeletonLoader, {
      props: { type: 'text' }
    })

    const lines = document.querySelectorAll('.skeleton-line')
    expect(lines).toHaveLength(3) // default count
  })

  it('renders text skeleton with custom count', () => {
    renderWithProviders(SkeletonLoader, {
      props: { 
        type: 'text',
        count: 7
      }
    })

    const lines = document.querySelectorAll('.skeleton-line')
    expect(lines).toHaveLength(7)
  })

  it('applies animation class when animated prop is true', () => {
    renderWithProviders(SkeletonLoader, {
      props: { 
        type: 'card',
        animated: true
      }
    })

    const skeletonElements = document.querySelectorAll('.skeleton-base')
    expect(skeletonElements.length).toBeGreaterThan(0)
  })

  it('renders with correct default props', () => {
    renderWithProviders(SkeletonLoader)

    // Should render text type by default
    expect(document.querySelector('.skeleton-text')).toBeTruthy()
    
    // Should have default count of 3
    const lines = document.querySelectorAll('.skeleton-line')
    expect(lines).toHaveLength(3)
  })

  it('handles invalid type gracefully', () => {
    renderWithProviders(SkeletonLoader, {
      props: { 
        type: 'invalid-type' as any
      }
    })

    // Should fallback to text skeleton
    expect(document.querySelector('.skeleton-text')).toBeTruthy()
  })

  it('renders chart skeleton with random bar heights', () => {
    renderWithProviders(SkeletonLoader, {
      props: { type: 'chart' }
    })

    const bars = document.querySelectorAll('.skeleton-bar')
    expect(bars.length).toBe(6)
    
    // Check that bars have different heights (random)
    const heights = Array.from(bars).map(bar => 
      (bar as HTMLElement).style.height
    )
    
    // At least some bars should have different heights
    const uniqueHeights = new Set(heights)
    expect(uniqueHeights.size).toBeGreaterThan(1)
  })

  it('renders text skeleton with random widths', () => {
    renderWithProviders(SkeletonLoader, {
      props: { 
        type: 'text',
        count: 5
      }
    })

    const lines = document.querySelectorAll('.skeleton-line')
    const widths = Array.from(lines).map(line => 
      (line as HTMLElement).style.width
    )
    
    // Lines should have different widths (random)
    const uniqueWidths = new Set(widths)
    expect(uniqueWidths.size).toBeGreaterThan(1)
  })

  it('has proper accessibility attributes', () => {
    renderWithProviders(SkeletonLoader, {
      props: { type: 'card' }
    })

    const skeletonContainer = document.querySelector('.skeleton-loader')
    expect(skeletonContainer).toBeTruthy()
    
    // Should be properly structured for screen readers
    expect(skeletonContainer?.getAttribute('role')).toBeFalsy() // No role needed for loading state
  })

  it('maintains consistent structure across renders', () => {
    const { unmount } = renderWithProviders(SkeletonLoader, {
      props: { 
        type: 'list',
        count: 3
      }
    })

    const firstRenderItems = document.querySelectorAll('.skeleton-list-item').length
    unmount()

    renderWithProviders(SkeletonLoader, {
      props: { 
        type: 'list',
        count: 3
      }
    })

    const secondRenderItems = document.querySelectorAll('.skeleton-list-item').length
    expect(firstRenderItems).toBe(secondRenderItems)
  })

  it('renders grid skeleton with proper responsive structure', () => {
    renderWithProviders(SkeletonLoader, {
      props: { 
        type: 'grid',
        count: 4
      }
    })

    const gridItems = document.querySelectorAll('.skeleton-grid-item')
    expect(gridItems).toHaveLength(4)
    
    // Each grid item should have the expected structure
    gridItems.forEach(item => {
      expect(item.querySelector('.skeleton-icon')).toBeTruthy()
      expect(item.querySelector('.skeleton-title')).toBeTruthy()
      expect(item.querySelector('.skeleton-subtitle')).toBeTruthy()
      expect(item.querySelector('.skeleton-badge')).toBeTruthy()
    })
  })

  it('renders table skeleton with proper structure', () => {
    renderWithProviders(SkeletonLoader, {
      props: { 
        type: 'table',
        count: 3
      }
    })

    // Should have header
    const header = document.querySelector('.skeleton-table-header')
    expect(header).toBeTruthy()
    
    // Should have correct number of rows
    const rows = document.querySelectorAll('.skeleton-table-row')
    expect(rows).toHaveLength(3)
    
    // Each row should have 4 cells (as defined in component)
    rows.forEach(row => {
      const cells = row.querySelectorAll('.skeleton-table-cell')
      expect(cells).toHaveLength(4)
    })
  })
})
