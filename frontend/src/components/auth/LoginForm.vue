<template>
  <div class="login-form">
    <a-form
      ref="formRef"
      :model="formData"
      @finish="handleSubmit"
      layout="vertical"
      :disabled="isLoading"
      class="auth-form"
    >
      <!-- Username Field -->
      <a-form-item
        name="username"
        :rules="usernameRules"
        class="form-field"
      >
        <template #label>
          <span class="field-label">
            <UserOutlined />
            Username
          </span>
        </template>
        
        <a-input
          v-model:value="formData.username"
          size="large"
          placeholder="Enter your username"
          autocomplete="username"
          :maxlength="50"
          class="auth-input"
          @keyup.enter="submitForm"
          @blur="touchField('username')"
        >
          <template #prefix>
            <UserOutlined class="input-icon" />
          </template>
        </a-input>
      </a-form-item>

      <!-- Password Field -->
      <a-form-item
        name="password"
        :rules="passwordRules"
        class="form-field"
      >
        <template #label>
          <span class="field-label">
            <LockOutlined />
            Password
          </span>
        </template>
        
        <a-input-password
          v-model:value="formData.password"
          size="large"
          placeholder="Enter your password"
          autocomplete="current-password"
          :maxlength="100"
          class="auth-input"
          @keyup.enter="submitForm"
          @blur="touchField('password')"
        >
          <template #prefix>
            <LockOutlined class="input-icon" />
          </template>
        </a-input-password>
        
        <!-- Password strength indicator -->
        <div v-if="formData.password && passwordStrength" class="password-strength">
          <div class="strength-bar">
            <div 
              class="strength-fill"
              :class="`strength-${passwordStrength.level}`"
              :style="{ width: `${(passwordStrength.score / 5) * 100}%` }"
            ></div>
          </div>
          <span class="strength-text" :class="`strength-${passwordStrength.level}`">
            {{ passwordStrength.level.charAt(0).toUpperCase() + passwordStrength.level.slice(1) }}
          </span>
        </div>
      </a-form-item>

      <!-- Remember Me -->
      <a-form-item name="remember" class="remember-field">
        <a-checkbox v-model:checked="formData.remember" class="remember-checkbox">
          <span class="remember-text">
            <ClockCircleOutlined />
            Remember me for 30 days
          </span>
        </a-checkbox>
      </a-form-item>

      <!-- Error Display -->
      <a-form-item v-if="error" class="error-field">
        <a-alert
          :message="error"
          type="error"
          show-icon
          closable
          @close="clearError"
          class="auth-alert"
        >
          <template #icon>
            <ExclamationCircleOutlined />
          </template>
        </a-alert>
      </a-form-item>

      <!-- Submit Button -->
      <a-form-item class="submit-field">
        <a-button
          type="primary"
          html-type="submit"
          size="large"
          block
          :loading="isLoading"
          class="auth-button"
        >
          <template #icon v-if="!isLoading">
            <LoginOutlined />
          </template>
          {{ isLoading ? 'Authenticating...' : 'Access System' }}
        </a-button>
      </a-form-item>

      <!-- Additional Options -->
      <div class="form-options">
        <a-button type="link" size="small" @click="$emit('forgot-password')">
          <QuestionCircleOutlined />
          Forgot password?
        </a-button>
        
        <a-divider type="vertical" />
        
        <a-button type="link" size="small" @click="$emit('show-help')">
          <InfoCircleOutlined />
          Need help?
        </a-button>
      </div>

      <!-- Demo Credentials -->
      <div class="demo-section">
        <a-divider>
          <span class="demo-title">
            <CodeOutlined />
            Demo Access
          </span>
        </a-divider>
        
        <div class="demo-credentials">
          <div class="credential-item">
            <span class="credential-label">Username:</span>
            <a-tag color="blue" @click="fillDemoCredentials">admin</a-tag>
          </div>
          <div class="credential-item">
            <span class="credential-label">Password:</span>
            <a-tag color="green" @click="fillDemoCredentials">admin123</a-tag>
          </div>
        </div>
        
        <a-button 
          type="dashed" 
          size="small" 
          block 
          @click="fillDemoCredentials"
          class="demo-button"
        >
          <ThunderboltOutlined />
          Quick Demo Login
        </a-button>
      </div>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  UserOutlined, 
  LockOutlined, 
  LoginOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  QuestionCircleOutlined,
  InfoCircleOutlined,
  CodeOutlined,
  ThunderboltOutlined
} from '@ant-design/icons-vue'
import { ValidationManager } from '@/utils/validation'
import type { LoginCredentials } from '@/types/auth'

// Props & Emits
interface Props {
  isLoading?: boolean
  error?: string | null
  initialValues?: Partial<LoginCredentials>
}

interface Emits {
  (e: 'submit', credentials: LoginCredentials): void
  (e: 'clear-error'): void
  (e: 'forgot-password'): void
  (e: 'show-help'): void
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  error: null,
  initialValues: () => ({})
})

const emit = defineEmits<Emits>()

// Form setup
const formRef = ref()
const validation = ValidationManager.getInstance()

const formData = ref<LoginCredentials>({
  username: '',
  password: '',
  remember: false,
  ...props.initialValues
})

// Validation rules
const usernameRules = computed(() => validation.getUsernameRules())
const passwordRules = computed(() => validation.getPasswordRules())

// Password strength
const passwordStrength = computed(() => {
  if (!formData.value.password) return null
  return validation.getPasswordStrength(formData.value.password)
})

// Methods
const handleSubmit = (values: LoginCredentials) => {
  emit('submit', values)
}

const submitForm = () => {
  formRef.value?.submit()
}

const touchField = (fieldName: string) => {
  // Trigger validation for the field
  formRef.value?.validateFields([fieldName])
}

const clearError = () => {
  emit('clear-error')
}

const fillDemoCredentials = () => {
  formData.value.username = 'admin'
  formData.value.password = 'admin123'
  formData.value.remember = true
}

// Initialize form with remembered values
onMounted(() => {
  if (props.initialValues) {
    Object.assign(formData.value, props.initialValues)
  }
})
</script>

<style scoped>
.login-form {
  width: 100%;
}

.auth-form {
  width: 100%;
}

/* Form Fields */
.form-field {
  margin-bottom: 24px;
}

.field-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #262626;
  font-size: 14px;
}

.auth-input {
  border-radius: 12px;
  border: 2px solid #e8e8e8;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 16px;
  height: 48px;
}

.auth-input:hover {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
}

.auth-input:focus,
.auth-input.ant-input-focused {
  border-color: #1890ff;
  box-shadow: 0 0 0 4px rgba(24, 144, 255, 0.15);
}

.input-icon {
  color: #8c8c8c;
  font-size: 16px;
  transition: color 0.3s ease;
}

.auth-input:focus .input-icon,
.auth-input.ant-input-focused .input-icon {
  color: #1890ff;
}

/* Password Strength */
.password-strength {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.strength-bar {
  flex: 1;
  height: 4px;
  background: #f0f0f0;
  border-radius: 2px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s ease;
  border-radius: 2px;
}

.strength-weak { background: #ff4d4f; }
.strength-fair { background: #faad14; }
.strength-good { background: #52c41a; }
.strength-strong { background: #1890ff; }

.strength-text {
  font-size: 12px;
  font-weight: 500;
  min-width: 60px;
}

/* Remember Me */
.remember-field {
  margin-bottom: 20px;
}

.remember-checkbox {
  font-size: 14px;
}

.remember-text {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #595959;
}

/* Error Field */
.error-field {
  margin-bottom: 20px;
}

.auth-alert {
  border-radius: 8px;
  border: none;
  box-shadow: 0 2px 8px rgba(255, 77, 79, 0.15);
}

/* Submit Button */
.submit-field {
  margin-bottom: 24px;
}

.auth-button {
  height: 52px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  background: linear-gradient(135deg, #1890ff, #096dd9);
  border: none;
  box-shadow: 0 4px 16px rgba(24, 144, 255, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.auth-button:hover {
  background: linear-gradient(135deg, #096dd9, #0050b3);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(24, 144, 255, 0.4);
}

.auth-button:active {
  transform: translateY(0);
}

/* Form Options */
.form-options {
  text-align: center;
  margin-bottom: 24px;
  padding: 16px 0;
  border-top: 1px solid #f0f0f0;
}

.form-options .ant-btn-link {
  color: #8c8c8c;
  font-size: 13px;
  padding: 4px 8px;
  transition: color 0.3s ease;
}

.form-options .ant-btn-link:hover {
  color: #1890ff;
}

/* Demo Section */
.demo-section {
  margin-top: 24px;
  padding: 20px;
  background: rgba(24, 144, 255, 0.02);
  border-radius: 12px;
  border: 1px solid rgba(24, 144, 255, 0.1);
}

.demo-title {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #1890ff;
  font-size: 13px;
  font-weight: 600;
}

.demo-credentials {
  display: flex;
  justify-content: space-between;
  margin: 16px 0;
  gap: 16px;
}

.credential-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.credential-label {
  color: #8c8c8c;
  font-weight: 500;
  min-width: 70px;
}

.credential-item .ant-tag {
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 600;
}

.credential-item .ant-tag:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.demo-button {
  border-radius: 8px;
  border-color: #1890ff;
  color: #1890ff;
  transition: all 0.3s ease;
}

.demo-button:hover {
  background: #1890ff;
  color: white;
  transform: translateY(-1px);
}

/* Responsive Design */
@media (max-width: 480px) {
  .form-field {
    margin-bottom: 20px;
  }

  .auth-input {
    height: 44px;
    font-size: 16px; /* Prevent zoom on iOS */
  }

  .auth-button {
    height: 48px;
    font-size: 15px;
  }

  .demo-credentials {
    flex-direction: column;
    gap: 12px;
  }

  .credential-item {
    justify-content: space-between;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .auth-input,
  .auth-button,
  .strength-fill {
    transition: none;
  }

  .auth-button:hover {
    transform: none;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .auth-input {
    border-width: 2px;
  }

  .field-label {
    color: #000;
  }
}
</style>
