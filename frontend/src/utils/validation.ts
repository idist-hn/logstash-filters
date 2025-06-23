// Validation utilities
import { VALIDATION_PATTERNS, VALIDATION_MESSAGES } from '@/constants/auth'
import type { ValidationRule } from '@/types/auth'

export class ValidationManager {
  private static instance: ValidationManager
  
  private constructor() {}
  
  static getInstance(): ValidationManager {
    if (!ValidationManager.instance) {
      ValidationManager.instance = new ValidationManager()
    }
    return ValidationManager.instance
  }

  // Username validation rules
  getUsernameRules(): ValidationRule[] {
    return [
      {
        required: true,
        message: VALIDATION_MESSAGES.USERNAME.REQUIRED,
      },
      {
        min: 3,
        message: VALIDATION_MESSAGES.USERNAME.MIN_LENGTH,
      },
      {
        max: 50,
        message: VALIDATION_MESSAGES.USERNAME.MAX_LENGTH,
      },
      {
        pattern: VALIDATION_PATTERNS.USERNAME,
        message: VALIDATION_MESSAGES.USERNAME.INVALID_PATTERN,
      },
    ]
  }

  // Password validation rules
  getPasswordRules(requireStrong: boolean = false): ValidationRule[] {
    const rules: ValidationRule[] = [
      {
        required: true,
        message: VALIDATION_MESSAGES.PASSWORD.REQUIRED,
      },
      {
        min: 6,
        message: VALIDATION_MESSAGES.PASSWORD.MIN_LENGTH,
      },
      {
        max: 100,
        message: VALIDATION_MESSAGES.PASSWORD.MAX_LENGTH,
      },
    ]

    if (requireStrong) {
      rules.push({
        pattern: VALIDATION_PATTERNS.STRONG_PASSWORD,
        message: VALIDATION_MESSAGES.PASSWORD.WEAK,
      })
    }

    return rules
  }

  // Validate single field
  validateField(value: string, rules: ValidationRule[]): string | null {
    for (const rule of rules) {
      if (rule.required && (!value || value.trim() === '')) {
        return rule.message
      }

      if (value && rule.min && value.length < rule.min) {
        return rule.message
      }

      if (value && rule.max && value.length > rule.max) {
        return rule.message
      }

      if (value && rule.pattern && !rule.pattern.test(value)) {
        return rule.message
      }

      if (value && rule.validator && !rule.validator(value)) {
        return rule.message
      }
    }

    return null
  }

  // Validate entire form
  validateForm(data: Record<string, any>, rules: Record<string, ValidationRule[]>): Record<string, string> {
    const errors: Record<string, string> = {}

    for (const [field, fieldRules] of Object.entries(rules)) {
      const error = this.validateField(data[field], fieldRules)
      if (error) {
        errors[field] = error
      }
    }

    return errors
  }

  // Password strength checker
  getPasswordStrength(password: string): {
    score: number
    level: 'weak' | 'fair' | 'good' | 'strong'
    suggestions: string[]
  } {
    let score = 0
    const suggestions: string[] = []

    if (password.length >= 8) score += 1
    else suggestions.push('Use at least 8 characters')

    if (/[a-z]/.test(password)) score += 1
    else suggestions.push('Add lowercase letters')

    if (/[A-Z]/.test(password)) score += 1
    else suggestions.push('Add uppercase letters')

    if (/\d/.test(password)) score += 1
    else suggestions.push('Add numbers')

    if (/[@$!%*?&]/.test(password)) score += 1
    else suggestions.push('Add special characters')

    const levels = ['weak', 'weak', 'fair', 'good', 'strong'] as const
    return {
      score,
      level: levels[score],
      suggestions,
    }
  }

  // Sanitize input
  sanitizeInput(input: string): string {
    return input.trim().replace(/[<>]/g, '')
  }

  // Check if email is valid
  isValidEmail(email: string): boolean {
    return VALIDATION_PATTERNS.EMAIL.test(email)
  }
}
