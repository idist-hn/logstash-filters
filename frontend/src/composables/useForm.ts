// Form handling composable
import { ref, reactive, computed, watch } from 'vue'
import { ValidationManager } from '@/utils/validation'
import type { ValidationRule } from '@/types/auth'

interface FormField {
  value: any
  error: string | null
  touched: boolean
  rules: ValidationRule[]
}

interface FormConfig {
  [key: string]: {
    initialValue: any
    rules: ValidationRule[]
  }
}

export function useForm<T extends Record<string, any>>(config: FormConfig) {
  const validation = ValidationManager.getInstance()
  
  // Create reactive form state
  const formData = reactive<Record<string, FormField>>({})
  const isSubmitting = ref(false)
  const submitError = ref<string | null>(null)

  // Initialize form fields
  for (const [fieldName, fieldConfig] of Object.entries(config)) {
    formData[fieldName] = {
      value: fieldConfig.initialValue,
      error: null,
      touched: false,
      rules: fieldConfig.rules,
    }
  }

  // Computed properties
  const values = computed(() => {
    const result: Record<string, any> = {}
    for (const [key, field] of Object.entries(formData)) {
      result[key] = field.value
    }
    return result as T
  })

  const errors = computed(() => {
    const result: Record<string, string> = {}
    for (const [key, field] of Object.entries(formData)) {
      if (field.error) {
        result[key] = field.error
      }
    }
    return result
  })

  const hasErrors = computed(() => {
    return Object.values(formData).some(field => field.error !== null)
  })

  const isValid = computed(() => {
    return !hasErrors.value && Object.values(formData).every(field => field.touched)
  })

  const touchedFields = computed(() => {
    return Object.values(formData).filter(field => field.touched).length
  })

  // Methods
  const validateField = (fieldName: string) => {
    const field = formData[fieldName]
    if (!field) return

    const error = validation.validateField(field.value, field.rules)
    field.error = error
    return error === null
  }

  const validateAllFields = () => {
    let isFormValid = true
    for (const fieldName of Object.keys(formData)) {
      const isFieldValid = validateField(fieldName)
      if (!isFieldValid) {
        isFormValid = false
      }
    }
    return isFormValid
  }

  const touchField = (fieldName: string) => {
    const field = formData[fieldName]
    if (field) {
      field.touched = true
      validateField(fieldName)
    }
  }

  const touchAllFields = () => {
    for (const fieldName of Object.keys(formData)) {
      touchField(fieldName)
    }
  }

  const setFieldValue = (fieldName: string, value: any) => {
    const field = formData[fieldName]
    if (field) {
      field.value = value
      if (field.touched) {
        validateField(fieldName)
      }
    }
  }

  const setFieldError = (fieldName: string, error: string | null) => {
    const field = formData[fieldName]
    if (field) {
      field.error = error
    }
  }

  const clearFieldError = (fieldName: string) => {
    setFieldError(fieldName, null)
  }

  const clearAllErrors = () => {
    for (const fieldName of Object.keys(formData)) {
      clearFieldError(fieldName)
    }
    submitError.value = null
  }

  const resetForm = () => {
    for (const [fieldName, fieldConfig] of Object.entries(config)) {
      const field = formData[fieldName]
      if (field) {
        field.value = fieldConfig.initialValue
        field.error = null
        field.touched = false
      }
    }
    submitError.value = null
    isSubmitting.value = false
  }

  const setValues = (newValues: Partial<T>) => {
    for (const [key, value] of Object.entries(newValues)) {
      setFieldValue(key, value)
    }
  }

  // Watch for value changes and validate if touched
  for (const fieldName of Object.keys(formData)) {
    watch(
      () => formData[fieldName].value,
      () => {
        if (formData[fieldName].touched) {
          validateField(fieldName)
        }
      }
    )
  }

  return {
    // State
    formData,
    values,
    errors,
    hasErrors,
    isValid,
    touchedFields,
    isSubmitting,
    submitError,

    // Methods
    validateField,
    validateAllFields,
    touchField,
    touchAllFields,
    setFieldValue,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    resetForm,
    setValues,
  }
}
