import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/vue'
import ToastNotification from '../ToastNotification.vue'
import { renderWithProviders, setupTestEnvironment, sleep } from '@/utils/test-utils'

describe('ToastNotification', () => {
  let cleanup: () => void

  beforeEach(() => {
    cleanup = setupTestEnvironment()
    vi.useFakeTimers()
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('renders without toasts initially', () => {
    const { container } = renderWithProviders(ToastNotification)
    
    const toastContainer = container.querySelector('.toast-container')
    expect(toastContainer).toBeTruthy()
    expect(toastContainer?.children).toHaveLength(0)
  })

  it('adds and displays a toast', async () => {
    const { container } = renderWithProviders(ToastNotification, {
      ref: 'toastRef'
    })

    const component = container.__vueParentComponent
    const toastRef = component?.refs?.toastRef

    // Add a toast
    const toastId = toastRef?.addToast({
      type: 'success',
      message: 'Test message',
      title: 'Test title'
    })

    await waitFor(() => {
      expect(screen.getByText('Test title')).toBeTruthy()
      expect(screen.getByText('Test message')).toBeTruthy()
    })

    expect(toastId).toBeTruthy()
  })

  it('displays different toast types with correct styling', async () => {
    const { container } = renderWithProviders(ToastNotification, {
      ref: 'toastRef'
    })

    const component = container.__vueParentComponent
    const toastRef = component?.refs?.toastRef

    // Add different types of toasts
    toastRef?.addToast({ type: 'success', message: 'Success message' })
    toastRef?.addToast({ type: 'error', message: 'Error message' })
    toastRef?.addToast({ type: 'warning', message: 'Warning message' })
    toastRef?.addToast({ type: 'info', message: 'Info message' })

    await waitFor(() => {
      expect(document.querySelector('.toast-success')).toBeTruthy()
      expect(document.querySelector('.toast-error')).toBeTruthy()
      expect(document.querySelector('.toast-warning')).toBeTruthy()
      expect(document.querySelector('.toast-info')).toBeTruthy()
    })
  })

  it('removes toast when close button is clicked', async () => {
    const { container } = renderWithProviders(ToastNotification, {
      ref: 'toastRef'
    })

    const component = container.__vueParentComponent
    const toastRef = component?.refs?.toastRef

    toastRef?.addToast({
      type: 'info',
      message: 'Test message',
      dismissible: true
    })

    await waitFor(() => {
      expect(screen.getByText('Test message')).toBeTruthy()
    })

    const closeButton = document.querySelector('.toast-close')
    expect(closeButton).toBeTruthy()

    await fireEvent.click(closeButton!)

    await waitFor(() => {
      expect(screen.queryByText('Test message')).toBeFalsy()
    })
  })

  it('removes toast when clicked if dismissible', async () => {
    const { container } = renderWithProviders(ToastNotification, {
      ref: 'toastRef'
    })

    const component = container.__vueParentComponent
    const toastRef = component?.refs?.toastRef

    toastRef?.addToast({
      type: 'info',
      message: 'Clickable message',
      dismissible: true
    })

    await waitFor(() => {
      expect(screen.getByText('Clickable message')).toBeTruthy()
    })

    const toastItem = document.querySelector('.toast-item')
    expect(toastItem).toBeTruthy()

    await fireEvent.click(toastItem!)

    await waitFor(() => {
      expect(screen.queryByText('Clickable message')).toBeFalsy()
    })
  })

  it('auto-removes toast after duration', async () => {
    const { container } = renderWithProviders(ToastNotification, {
      ref: 'toastRef'
    })

    const component = container.__vueParentComponent
    const toastRef = component?.refs?.toastRef

    toastRef?.addToast({
      type: 'info',
      message: 'Auto remove message',
      duration: 1000
    })

    await waitFor(() => {
      expect(screen.getByText('Auto remove message')).toBeTruthy()
    })

    // Fast-forward time
    vi.advanceTimersByTime(1000)

    await waitFor(() => {
      expect(screen.queryByText('Auto remove message')).toBeFalsy()
    })
  })

  it('does not auto-remove toast with duration 0', async () => {
    const { container } = renderWithProviders(ToastNotification, {
      ref: 'toastRef'
    })

    const component = container.__vueParentComponent
    const toastRef = component?.refs?.toastRef

    toastRef?.addToast({
      type: 'info',
      message: 'Persistent message',
      duration: 0
    })

    await waitFor(() => {
      expect(screen.getByText('Persistent message')).toBeTruthy()
    })

    // Fast-forward time
    vi.advanceTimersByTime(10000)

    // Should still be there
    expect(screen.getByText('Persistent message')).toBeTruthy()
  })

  it('removes specific toast by ID', async () => {
    const { container } = renderWithProviders(ToastNotification, {
      ref: 'toastRef'
    })

    const component = container.__vueParentComponent
    const toastRef = component?.refs?.toastRef

    const toastId1 = toastRef?.addToast({
      type: 'info',
      message: 'Message 1'
    })

    const toastId2 = toastRef?.addToast({
      type: 'info',
      message: 'Message 2'
    })

    await waitFor(() => {
      expect(screen.getByText('Message 1')).toBeTruthy()
      expect(screen.getByText('Message 2')).toBeTruthy()
    })

    // Remove first toast
    toastRef?.removeToast(toastId1)

    await waitFor(() => {
      expect(screen.queryByText('Message 1')).toBeFalsy()
      expect(screen.getByText('Message 2')).toBeTruthy()
    })
  })

  it('clears all toasts', async () => {
    const { container } = renderWithProviders(ToastNotification, {
      ref: 'toastRef'
    })

    const component = container.__vueParentComponent
    const toastRef = component?.refs?.toastRef

    toastRef?.addToast({ type: 'info', message: 'Message 1' })
    toastRef?.addToast({ type: 'info', message: 'Message 2' })
    toastRef?.addToast({ type: 'info', message: 'Message 3' })

    await waitFor(() => {
      expect(screen.getByText('Message 1')).toBeTruthy()
      expect(screen.getByText('Message 2')).toBeTruthy()
      expect(screen.getByText('Message 3')).toBeTruthy()
    })

    toastRef?.clearAllToasts()

    await waitFor(() => {
      expect(screen.queryByText('Message 1')).toBeFalsy()
      expect(screen.queryByText('Message 2')).toBeFalsy()
      expect(screen.queryByText('Message 3')).toBeFalsy()
    })
  })

  it('displays progress bar for timed toasts', async () => {
    const { container } = renderWithProviders(ToastNotification, {
      ref: 'toastRef'
    })

    const component = container.__vueParentComponent
    const toastRef = component?.refs?.toastRef

    toastRef?.addToast({
      type: 'info',
      message: 'Timed message',
      duration: 2000
    })

    await waitFor(() => {
      expect(screen.getByText('Timed message')).toBeTruthy()
      expect(document.querySelector('.toast-progress')).toBeTruthy()
    })
  })

  it('does not display progress bar for persistent toasts', async () => {
    const { container } = renderWithProviders(ToastNotification, {
      ref: 'toastRef'
    })

    const component = container.__vueParentComponent
    const toastRef = component?.refs?.toastRef

    toastRef?.addToast({
      type: 'info',
      message: 'Persistent message',
      duration: 0
    })

    await waitFor(() => {
      expect(screen.getByText('Persistent message')).toBeTruthy()
      expect(document.querySelector('.toast-progress')).toBeFalsy()
    })
  })

  it('applies correct icons for different toast types', async () => {
    const { container } = renderWithProviders(ToastNotification, {
      ref: 'toastRef'
    })

    const component = container.__vueParentComponent
    const toastRef = component?.refs?.toastRef

    toastRef?.addToast({ type: 'success', message: 'Success' })
    toastRef?.addToast({ type: 'error', message: 'Error' })
    toastRef?.addToast({ type: 'warning', message: 'Warning' })
    toastRef?.addToast({ type: 'info', message: 'Info' })

    await waitFor(() => {
      const toastIcons = document.querySelectorAll('.toast-icon')
      expect(toastIcons).toHaveLength(4)
    })
  })

  it('handles non-dismissible toasts correctly', async () => {
    const { container } = renderWithProviders(ToastNotification, {
      ref: 'toastRef'
    })

    const component = container.__vueParentComponent
    const toastRef = component?.refs?.toastRef

    toastRef?.addToast({
      type: 'info',
      message: 'Non-dismissible message',
      dismissible: false
    })

    await waitFor(() => {
      expect(screen.getByText('Non-dismissible message')).toBeTruthy()
    })

    // Should not have close button
    expect(document.querySelector('.toast-close')).toBeFalsy()

    // Should not have dismissible class
    const toastItem = document.querySelector('.toast-item')
    expect(toastItem?.classList.contains('toast-dismissible')).toBeFalsy()
  })

  it('generates unique IDs for toasts', async () => {
    const { container } = renderWithProviders(ToastNotification, {
      ref: 'toastRef'
    })

    const component = container.__vueParentComponent
    const toastRef = component?.refs?.toastRef

    const id1 = toastRef?.addToast({ type: 'info', message: 'Message 1' })
    const id2 = toastRef?.addToast({ type: 'info', message: 'Message 2' })
    const id3 = toastRef?.addToast({ type: 'info', message: 'Message 3' })

    expect(id1).not.toBe(id2)
    expect(id2).not.toBe(id3)
    expect(id1).not.toBe(id3)
  })
})
