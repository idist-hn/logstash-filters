<template>
  <teleport to="body">
    <transition-group
      name="toast"
      tag="div"
      class="toast-container"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast-item"
        :class="[`toast-${toast.type}`, { 'toast-dismissible': toast.dismissible }]"
        @click="toast.dismissible && removeToast(toast.id)"
      >
        <div class="toast-icon">
          <CheckCircleOutlined v-if="toast.type === 'success'" />
          <ExclamationCircleOutlined v-else-if="toast.type === 'warning'" />
          <CloseCircleOutlined v-else-if="toast.type === 'error'" />
          <InfoCircleOutlined v-else />
        </div>
        
        <div class="toast-content">
          <div class="toast-title" v-if="toast.title">{{ toast.title }}</div>
          <div class="toast-message">{{ toast.message }}</div>
        </div>
        
        <button
          v-if="toast.dismissible"
          class="toast-close"
          @click.stop="removeToast(toast.id)"
        >
          <CloseOutlined />
        </button>
        
        <div
          v-if="toast.duration && toast.duration > 0"
          class="toast-progress"
          :style="{ animationDuration: `${toast.duration}ms` }"
        ></div>
      </div>
    </transition-group>
  </teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  CloseOutlined
} from '@ant-design/icons-vue'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
  dismissible?: boolean
}

const toasts = ref<Toast[]>([])
const timers = new Map<string, NodeJS.Timeout>()

const addToast = (toast: Omit<Toast, 'id'>) => {
  const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
  const newToast: Toast = {
    id,
    dismissible: true,
    duration: 5000,
    ...toast
  }
  
  toasts.value.push(newToast)
  
  if (newToast.duration && newToast.duration > 0) {
    const timer = setTimeout(() => {
      removeToast(id)
    }, newToast.duration)
    timers.set(id, timer)
  }
  
  return id
}

const removeToast = (id: string) => {
  const index = toasts.value.findIndex(toast => toast.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
  
  const timer = timers.get(id)
  if (timer) {
    clearTimeout(timer)
    timers.delete(id)
  }
}

const clearAllToasts = () => {
  toasts.value = []
  timers.forEach(timer => clearTimeout(timer))
  timers.clear()
}

// Expose methods for external use
defineExpose({
  addToast,
  removeToast,
  clearAllToasts
})

onUnmounted(() => {
  timers.forEach(timer => clearTimeout(timer))
  timers.clear()
})
</script>

<style lang="scss" scoped>
.toast-container {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 400px;
  pointer-events: none;
}

.toast-item {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 8px 32px var(--shadow-medium);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 320px;
  max-width: 400px;
  pointer-events: auto;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    transform: translateX(-4px);
    box-shadow: 0 12px 40px var(--shadow-medium);
  }

  &.toast-dismissible {
    cursor: pointer;
  }
}

.toast-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  margin-top: 2px;
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
  line-height: 1.4;
}

.toast-message {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.4;
  word-wrap: break-word;
}

.toast-close {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border: none;
  background: none;
  color: var(--text-tertiary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background: var(--bg-tertiary);
    color: var(--text-primary);
  }
}

.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: currentColor;
  width: 100%;
  transform-origin: left;
  animation: toast-progress linear forwards;
}

@keyframes toast-progress {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

/* Toast type styles */
.toast-success {
  border-left: 4px solid #52c41a;
  
  .toast-icon {
    color: #52c41a;
  }
  
  .toast-progress {
    background: #52c41a;
  }
}

.toast-error {
  border-left: 4px solid #ff4d4f;
  
  .toast-icon {
    color: #ff4d4f;
  }
  
  .toast-progress {
    background: #ff4d4f;
  }
}

.toast-warning {
  border-left: 4px solid #faad14;
  
  .toast-icon {
    color: #faad14;
  }
  
  .toast-progress {
    background: #faad14;
  }
}

.toast-info {
  border-left: 4px solid #1890ff;
  
  .toast-icon {
    color: #1890ff;
  }
  
  .toast-progress {
    background: #1890ff;
  }
}

/* Transition animations */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}

/* Responsive */
@media (max-width: 768px) {
  .toast-container {
    top: 70px;
    right: 16px;
    left: 16px;
    max-width: none;
  }
  
  .toast-item {
    min-width: auto;
    max-width: none;
  }
}
</style>
