export interface FormFieldCondition {
  field: string
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty'
  value: any
}

export interface FormFieldValidation {
  required?: boolean
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: string
  custom?: string // Custom validation function name
  message?: string
}

export interface FormFieldOption {
  value: string
  label: string
  disabled?: boolean
}

export interface FormField {
  id: string
  type: 'text' | 'number' | 'email' | 'tel' | 'date' | 'datetime-local' | 'select' | 'radio' | 'checkbox' | 'textarea' | 'file'
  label: string
  placeholder?: string
  description?: string
  defaultValue?: any
  value?: any
  confidence?: number
  
  // Validation
  validation?: FormFieldValidation
  
  // Options for select/radio/checkbox
  options?: FormFieldOption[]
  
  // Conditional logic
  showIf?: FormFieldCondition[]
  requiredIf?: FormFieldCondition[]
  
  // Layout and styling
  width?: 'full' | 'half' | 'third' | 'quarter'
  className?: string
  
  // Voice recognition settings
  voiceEnabled?: boolean
  voiceHints?: string[]
  
  // Auto-completion
  autoComplete?: string
  suggestions?: string[]
}

export interface FormSection {
  id: string
  title: string
  description?: string
  fields: FormField[]
  showIf?: FormFieldCondition[]
  collapsible?: boolean
  collapsed?: boolean
}

export interface FormTemplate {
  id: string
  name: string
  description: string
  category: string
  version: string
  createdAt: Date
  updatedAt: Date
  
  // Template metadata
  estimatedTime: number // in minutes
  difficulty: 'easy' | 'medium' | 'hard'
  tags: string[]
  
  // Form structure
  sections: FormSection[]
  
  // Form settings
  settings: {
    autoSave: boolean
    autoSaveInterval: number // in seconds
    allowPartialSubmission: boolean
    showProgress: boolean
    voiceEnabled: boolean
    multiLanguage: boolean
  }
  
  // Styling
  theme?: {
    primaryColor?: string
    backgroundColor?: string
    fontFamily?: string
  }
  
  // Submission settings
  submission: {
    method: 'pdf' | 'email' | 'api' | 'print'
    endpoint?: string
    emailTemplate?: string
    pdfTemplate?: string
  }
}

export interface FormData {
  templateId: string
  templateVersion: string
  sessionId: string
  userId?: string
  
  // Form values
  values: Record<string, any>
  confidences: Record<string, number>
  
  // Progress tracking
  completedFields: string[]
  currentSection: string
  currentField: string
  progress: number
  
  // Session metadata
  startedAt: Date
  lastSavedAt: Date
  completedAt?: Date
  
  // Auto-save data
  autoSaveData?: {
    lastSave: Date
    saveCount: number
    conflicts: string[]
  }
}

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string[]>
  warnings: Record<string, string[]>
}

export interface ConditionalLogicResult {
  visibleFields: string[]
  requiredFields: string[]
  hiddenSections: string[]
}