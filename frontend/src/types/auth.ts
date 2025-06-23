// Authentication related types
export interface User {
  id: string
  username: string
  email: string
  role: string
  avatar?: string
  lastLogin?: string
  permissions?: string[]
}

export interface LoginCredentials {
  username: string
  password: string
  remember?: boolean
}

export interface LoginResponse {
  token: string
  user: User
  expiresIn: number
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface ValidationRule {
  required?: boolean
  min?: number
  max?: number
  pattern?: RegExp
  message: string
  validator?: (value: string) => boolean
}

export interface FormValidation {
  username: ValidationRule[]
  password: ValidationRule[]
}
