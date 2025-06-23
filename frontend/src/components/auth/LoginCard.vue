<template>
  <div class="login-card-container">
    <div class="login-card" :class="{ 'card-loading': isLoading }">
      <!-- Header Section -->
      <div class="card-header">
        <div class="logo-container">
          <div class="logo-icon">
            <MonitorOutlined />
          </div>
          <div class="logo-text">
            <h1>CloudWatch ELK</h1>
            <p>System Monitoring Platform</p>
          </div>
        </div>
        
        <div class="header-decoration">
          <div class="decoration-line"></div>
          <div class="decoration-dot"></div>
          <div class="decoration-line"></div>
        </div>
      </div>

      <!-- Content Section -->
      <div class="card-content">
        <slot />
      </div>

      <!-- Footer Section -->
      <div class="card-footer">
        <div class="footer-info">
          <div class="security-badge">
            <ShieldCheckOutlined />
            <span>Secure Authentication</span>
          </div>
          <div class="version-info">
            <span>v2.1.0</span>
          </div>
        </div>
      </div>

      <!-- Loading overlay -->
      <div v-if="isLoading" class="loading-overlay">
        <div class="loading-spinner">
          <LoadingOutlined />
        </div>
      </div>
    </div>

    <!-- Background effects -->
    <div class="card-glow"></div>
    <div class="card-shadow"></div>
  </div>
</template>

<script setup lang="ts">
import { 
  MonitorOutlined, 
  ShieldCheckOutlined, 
  LoadingOutlined 
} from '@ant-design/icons-vue'

interface Props {
  isLoading?: boolean
}

withDefaults(defineProps<Props>(), {
  isLoading: false
})
</script>

<style scoped>
.login-card-container {
  position: relative;
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  padding: 20px;
}

.login-card {
  position: relative;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 8px 16px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation: card-entrance 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-loading {
  pointer-events: none;
  opacity: 0.8;
}

@keyframes card-entrance {
  0% {
    opacity: 0;
    transform: translateY(40px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Header Section */
.card-header {
  padding: 40px 40px 32px;
  text-align: center;
  background: linear-gradient(135deg, rgba(24, 144, 255, 0.05), rgba(114, 46, 209, 0.05));
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  position: relative;
}

.logo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
}

.logo-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #1890ff, #722ed1);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 36px;
  box-shadow: 
    0 8px 24px rgba(24, 144, 255, 0.3),
    0 4px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.logo-icon::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.6s ease;
}

.logo-icon:hover::before {
  left: 100%;
}

.logo-icon:hover {
  transform: scale(1.05) rotate(5deg);
  box-shadow: 
    0 12px 32px rgba(24, 144, 255, 0.4),
    0 6px 12px rgba(0, 0, 0, 0.15);
}

.logo-text h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #1890ff, #722ed1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
}

.logo-text p {
  margin: 8px 0 0;
  font-size: 16px;
  color: #666;
  font-weight: 500;
}

.header-decoration {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  opacity: 0.6;
}

.decoration-line {
  width: 40px;
  height: 1px;
  background: linear-gradient(90deg, transparent, #1890ff, transparent);
}

.decoration-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #1890ff;
  box-shadow: 0 0 8px rgba(24, 144, 255, 0.5);
}

/* Content Section */
.card-content {
  padding: 40px;
  position: relative;
}

/* Footer Section */
.card-footer {
  padding: 24px 40px 32px;
  background: rgba(0, 0, 0, 0.02);
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.footer-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.security-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #52c41a;
  font-size: 14px;
  font-weight: 500;
}

.version-info {
  color: #8c8c8c;
  font-size: 12px;
  font-weight: 500;
}

/* Loading overlay */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.loading-spinner {
  font-size: 32px;
  color: #1890ff;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Background effects */
.card-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  right: -50%;
  bottom: -50%;
  background: radial-gradient(circle, rgba(24, 144, 255, 0.1) 0%, transparent 70%);
  z-index: -2;
  animation: glow-pulse 4s ease-in-out infinite;
}

@keyframes glow-pulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
}

.card-shadow {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  bottom: 10px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 20px;
  filter: blur(20px);
  z-index: -1;
}

/* Responsive design */
@media (max-width: 640px) {
  .login-card-container {
    padding: 16px;
  }

  .card-header {
    padding: 32px 24px 24px;
  }

  .card-content {
    padding: 32px 24px;
  }

  .card-footer {
    padding: 20px 24px 24px;
  }

  .logo-icon {
    width: 64px;
    height: 64px;
    font-size: 28px;
  }

  .logo-text h1 {
    font-size: 24px;
  }

  .logo-text p {
    font-size: 14px;
  }

  .footer-info {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .login-card {
    border-radius: 16px;
  }

  .card-header {
    padding: 24px 20px 20px;
  }

  .card-content {
    padding: 24px 20px;
  }

  .card-footer {
    padding: 16px 20px 20px;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .login-card {
    border: 2px solid #000;
    background: #fff;
  }

  .logo-text h1 {
    -webkit-text-fill-color: #000;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .login-card,
  .logo-icon,
  .card-glow,
  .loading-spinner {
    animation: none;
    transition: none;
  }

  .logo-icon:hover {
    transform: none;
  }
}
</style>
