<template>
  <div class="login-container">
    <!-- Simple Background -->
    <div class="login-background"></div>

    <!-- Login Card -->
    <div class="login-card">
      <!-- Header -->
      <div class="card-header">
        <div class="logo">
          <div class="logo-icon">
            <MonitorOutlined />
          </div>
          <div class="logo-text">
            <h1>CloudWatch ELK</h1>
            <p>System Monitoring Platform</p>
          </div>
        </div>
      </div>

      <!-- Form -->
      <div class="card-body">
        <a-form
          ref="formRef"
          :model="form"
          @finish="handleLogin"
          layout="vertical"
          :disabled="isLoading"
        >
          <a-form-item
            name="username"
            :rules="[{ required: true, message: 'Please enter username' }]"
          >
            <template #label>
              <span class="field-label">
                <UserOutlined />
                Username
              </span>
            </template>
            <a-input
              v-model:value="form.username"
              size="large"
              placeholder="Enter your username"
              class="form-input"
              autocomplete="username"
              @keyup.enter="submitForm"
              @blur="validateField('username')"
            >
              <template #prefix>
                <UserOutlined class="input-icon" />
              </template>
            </a-input>
          </a-form-item>

          <a-form-item
            name="password"
            :rules="[{ required: true, message: 'Please enter password' }]"
          >
            <template #label>
              <span class="field-label">
                <LockOutlined />
                Password
              </span>
            </template>
            <a-input-password
              v-model:value="form.password"
              size="large"
              placeholder="Enter your password"
              class="form-input"
              autocomplete="current-password"
              @keyup.enter="submitForm"
              @blur="validateField('password')"
            >
              <template #prefix>
                <LockOutlined class="input-icon" />
              </template>
            </a-input-password>
          </a-form-item>

          <a-form-item name="remember">
            <a-checkbox v-model:checked="form.remember">
              <span class="remember-text">
                <ClockCircleOutlined />
                Remember me for 30 days
              </span>
            </a-checkbox>
          </a-form-item>

          <a-form-item v-if="error" class="error-item">
            <a-alert
              :message="error"
              type="error"
              show-icon
              closable
              @close="clearError"
            />
          </a-form-item>

          <a-form-item>
            <a-button
              type="primary"
              html-type="submit"
              size="large"
              block
              :loading="isLoading"
              class="login-button"
            >
              <template #icon v-if="!isLoading">
                <LoginOutlined />
              </template>
              {{ isLoading ? 'Authenticating...' : 'Access System' }}
            </a-button>
          </a-form-item>
        </a-form>
      </div>
    </div>

    <!-- API Status Monitor - Temporarily disabled -->
    <!-- <ApiStatus /> -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
// import ApiStatus from '../components/ApiStatus.vue'
import {
  MonitorOutlined,
  UserOutlined,
  LockOutlined,
  LoginOutlined,
  ClockCircleOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const authStore = useAuthStore()
const formRef = ref()

const form = ref({
  username: 'admin',
  password: 'admin123',
  remember: true
})

// Simple form validation handled by individual form items

const isLoading = computed(() => authStore.isLoading)
const error = computed(() => authStore.error)

const handleLogin = async (values: any) => {
  console.log('LoginView: Form submit triggered')
  console.log('LoginView: Values from form:', values)
  console.log('LoginView: Current form state:', form.value)

  // Use form.value if values is empty (fallback)
  const loginData = values || form.value

  console.log('LoginView: Final login data', {
    username: loginData.username,
    password: loginData.password ? '***' : 'EMPTY',
    remember: loginData.remember
  })

  // Basic client-side validation
  if (!loginData.username || !loginData.password) {
    console.log('LoginView: Missing username or password')
    console.log('LoginView: Username:', loginData.username)
    console.log('LoginView: Password:', loginData.password ? 'HAS_VALUE' : 'EMPTY')
    return
  }

  if (loginData.username.length < 3) {
    console.log('LoginView: Username too short')
    return
  }

  if (loginData.password.length < 6) {
    console.log('LoginView: Password too short')
    return
  }

  const result = await authStore.login(loginData.username, loginData.password, loginData.remember)

  if (result.success) {
    console.log('LoginView: Login successful, redirecting to dashboard')
    router.push('/')
  } else {
    console.log('LoginView: Login failed', result.error)
    // Error is already set in the store
  }
}

const submitForm = () => {
  formRef.value?.submit()
}

const validateField = (fieldName: string) => {
  formRef.value?.validateFields([fieldName])
}

// Debug functions removed - using v-model:value now

const clearError = () => {
  // Clear error in auth store
  if (authStore.error) {
    authStore.error = null
  }
}



// Initialize remembered credentials
const initForm = () => {
  const remembered = authStore.getRememberedCredentials()

  if (remembered.remember && remembered.username) {
    form.value.username = remembered.username
    form.value.remember = true
    console.log('LoginView: Loaded remembered credentials for', remembered.username)
  }
}

// Check auth status on mount
const checkAuthStatus = async () => {
  await authStore.checkAuth()

  // If already authenticated, redirect to dashboard
  if (authStore.isAuthenticated) {
    console.log('LoginView: User already authenticated, redirecting')
    router.push('/')
  }
}

// Watch form changes
watch(form, (newForm) => {
  console.log('Form changed:', newForm)
}, { deep: true })

// Initialize
initForm()
checkAuthStatus()
</script>

<style scoped>
.login-container {
  min-height: 100vh !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  position: relative;
  background: var(--login-bg, linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%));
  padding: 20px !important;
}

/* Simple Background */
.login-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 25% 25%, rgba(24, 144, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(114, 46, 209, 0.1) 0%, transparent 50%);
}

/* Login Card */
.login-card {
  position: relative;
  z-index: 10;
  width: 100% !important;
  max-width: 480px !important;
  background: var(--login-card-bg, rgba(255, 255, 255, 0.95));
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid var(--login-card-border, rgba(255, 255, 255, 0.2));
  box-shadow: var(--login-card-shadow, 0 20px 40px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.05));
  overflow: hidden;
  animation: card-entrance 0.8s cubic-bezier(0.4, 0, 0.2, 1);
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

/* Header */
.card-header {
  padding: 40px 40px 32px;
  text-align: center;
  background: var(--login-header-bg, linear-gradient(135deg, rgba(24, 144, 255, 0.05), rgba(114, 46, 209, 0.05)));
  border-bottom: 1px solid var(--login-border, rgba(0, 0, 0, 0.06));
}

.logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
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
  box-shadow: 0 8px 24px rgba(24, 144, 255, 0.3);
  transition: all 0.3s ease;
}

.logo-icon:hover {
  transform: scale(1.05) rotate(5deg);
  box-shadow: 0 12px 32px rgba(24, 144, 255, 0.4);
}

.logo-text h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #1890ff, #722ed1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-text p {
  margin: 8px 0 0;
  font-size: 16px;
  color: var(--login-text-secondary, #666);
  font-weight: 500;
}

/* Form */
.card-body {
  padding: 40px;
}

.field-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--login-text-primary, #262626);
  font-size: 14px;
}

.form-input {
  border-radius: 12px;
  border: 2px solid var(--login-input-border, #e8e8e8);
  background: var(--login-input-bg, #ffffff) !important;
  color: var(--login-text-primary, #262626) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  height: 48px;
}

.form-input:hover {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
}

.form-input:focus,
.form-input.ant-input-focused {
  border-color: #1890ff;
  box-shadow: 0 0 0 4px rgba(24, 144, 255, 0.15);
}

.input-icon {
  color: var(--login-text-tertiary, #8c8c8c);
  font-size: 16px;
}

.remember-text {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--login-text-secondary, #595959);
  font-size: 14px;
}

.login-button {
  height: 52px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  background: linear-gradient(135deg, #1890ff, #096dd9);
  border: none;
  box-shadow: 0 4px 16px rgba(24, 144, 255, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.login-button:hover {
  background: linear-gradient(135deg, #096dd9, #0050b3);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(24, 144, 255, 0.4);
}

/* Footer */
.card-footer {
  padding: 24px 40px 32px;
  background: rgba(0, 0, 0, 0.02);
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.footer-info {
  text-align: center;
  padding: 8px 0;
}

.footer-text {
  color: #8c8c8c;
  font-size: 14px;
  font-weight: 500;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.footer-version {
  color: #bfbfbf;
  font-size: 12px;
  margin: 0;
  font-weight: 400;
}

/* Responsive */
@media (max-width: 640px) {
  .login-card {
    margin: 16px !important;
    max-width: none !important;
  }

  .card-header {
    padding: 32px 24px 24px;
  }

  .card-body {
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

  .footer-text {
    font-size: 13px;
  }

  .footer-version {
    font-size: 11px;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .gradient-layer,
  .particle,
  .login-card,
  .logo-icon,
  .login-button {
    animation: none;
    transition: none;
  }

  .logo-icon:hover,
  .login-button:hover {
    transform: none;
  }
}
</style>
