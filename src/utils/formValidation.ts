import { FormField, FormFieldValidation, ValidationResult, FormData } from '../types/form'

export class FormValidator {
  private customValidators: Record<string, (value: any, field: FormField) => string | null> = {}

  constructor() {
    this.registerDefaultValidators()
  }

  private registerDefaultValidators() {
    this.customValidators['kenyan_id'] = (value: string) => {
      if (!value) return null
      const idPattern = /^\d{8}$/
      return idPattern.test(value) ? null : 'Please enter a valid 8-digit Kenyan ID number'
    }

    this.customValidators['kenyan_phone'] = (value: string) => {
      if (!value) return null
      const phonePattern = /^(\+254|0)[17]\d{8}$/
      return phonePattern.test(value) ? null : 'Please enter a valid Kenyan phone number'
    }

    this.customValidators['license_number'] = (value: string) => {
      if (!value) return null
      const licensePattern = /^[A-Z]{2}\d{6,8}$/
      return licensePattern.test(value) ? null : 'Please enter a valid license number (e.g., DL123456)'
    }

    this.customValidators['nhif_number'] = (value: string) => {
      if (!value) return null
      const nhifPattern = /^\d{8,12}$/
      return nhifPattern.test(value) ? null : 'Please enter a valid NHIF number'
    }

    this.customValidators['nssf_number'] = (value: string) => {
      if (!value) return null
      const nssfPattern = /^\d{9}$/
      return nssfPattern.test(value) ? null : 'Please enter a valid 9-digit NSSF number'
    }
  }

  registerCustomValidator(name: string, validator: (value: any, field: FormField) => string | null) {
    this.customValidators[name] = validator
  }

  validateField(field: FormField, value: any, formData?: FormData): string[] {
    const errors: string[] = []
    const validation = field.validation

    if (!validation) return errors

    // Required validation
    if (validation.required && this.isEmpty(value)) {
      errors.push(validation.message || `${field.label} is required`)
      return errors // Don't validate further if required field is empty
    }

    // Skip other validations if field is empty and not required
    if (this.isEmpty(value)) return errors

    // Type-specific validation
    switch (field.type) {
      case 'email':
        if (!this.isValidEmail(value)) {
          errors.push('Please enter a valid email address')
        }
        break
      case 'tel':
        if (!this.isValidPhone(value)) {
          errors.push('Please enter a valid phone number')
        }
        break
      case 'number':
        if (!this.isValidNumber(value)) {
          errors.push('Please enter a valid number')
        }
        break
      case 'date':
        if (!this.isValidDate(value)) {
          errors.push('Please enter a valid date')
        }
        break
    }

    // Length validation
    if (validation.minLength && value.length < validation.minLength) {
      errors.push(`Minimum length is ${validation.minLength} characters`)
    }
    if (validation.maxLength && value.length > validation.maxLength) {
      errors.push(`Maximum length is ${validation.maxLength} characters`)
    }

    // Numeric range validation
    if (field.type === 'number') {
      const numValue = parseFloat(value)
      if (validation.min !== undefined && numValue < validation.min) {
        errors.push(`Minimum value is ${validation.min}`)
      }
      if (validation.max !== undefined && numValue > validation.max) {
        errors.push(`Maximum value is ${validation.max}`)
      }
    }

    // Pattern validation
    if (validation.pattern) {
      const regex = new RegExp(validation.pattern)
      if (!regex.test(value)) {
        errors.push(validation.message || 'Invalid format')
      }
    }

    // Custom validation
    if (validation.custom && this.customValidators[validation.custom]) {
      const customError = this.customValidators[validation.custom](value, field)
      if (customError) {
        errors.push(customError)
      }
    }

    return errors
  }

  validateForm(template: any, formData: FormData): ValidationResult {
    const errors: Record<string, string[]> = {}
    const warnings: Record<string, string[]> = {}

    // Get visible and required fields based on conditional logic
    const conditionalLogic = this.evaluateConditionalLogic(template, formData.values)

    template.sections.forEach((section: any) => {
      section.fields.forEach((field: FormField) => {
        // Skip validation for hidden fields
        if (!conditionalLogic.visibleFields.includes(field.id)) {
          return
        }

        const value = formData.values[field.id]
        const fieldErrors = this.validateField(field, value, formData)

        if (fieldErrors.length > 0) {
          errors[field.id] = fieldErrors
        }

        // Check confidence warnings
        const confidence = formData.confidences[field.id]
        if (confidence !== undefined && confidence < 0.7 && value) {
          warnings[field.id] = warnings[field.id] || []
          warnings[field.id].push('Low confidence transcription - please verify')
        }
      })
    })

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings
    }
  }

  private isEmpty(value: any): boolean {
    return value === null || value === undefined || value === '' || 
           (Array.isArray(value) && value.length === 0)
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))
  }

  private isValidNumber(value: string): boolean {
    return !isNaN(parseFloat(value)) && isFinite(parseFloat(value))
  }

  private isValidDate(date: string): boolean {
    const parsedDate = new Date(date)
    return !isNaN(parsedDate.getTime())
  }

  private evaluateConditionalLogic(template: any, values: Record<string, any>) {
    const visibleFields: string[] = []
    const requiredFields: string[] = []
    const hiddenSections: string[] = []

    template.sections.forEach((section: any) => {
      // Check section visibility
      const sectionVisible = this.evaluateConditions(section.showIf, values)
      if (!sectionVisible) {
        hiddenSections.push(section.id)
        return
      }

      section.fields.forEach((field: FormField) => {
        // Check field visibility
        const fieldVisible = this.evaluateConditions(field.showIf, values)
        if (fieldVisible) {
          visibleFields.push(field.id)

          // Check if field is required
          const isRequired = field.validation?.required || 
                           this.evaluateConditions(field.requiredIf, values)
          if (isRequired) {
            requiredFields.push(field.id)
          }
        }
      })
    })

    return { visibleFields, requiredFields, hiddenSections }
  }

  private evaluateConditions(conditions: any[] | undefined, values: Record<string, any>): boolean {
    if (!conditions || conditions.length === 0) return true

    return conditions.every(condition => {
      const fieldValue = values[condition.field]
      
      switch (condition.operator) {
        case 'equals':
          return fieldValue === condition.value
        case 'not_equals':
          return fieldValue !== condition.value
        case 'contains':
          return String(fieldValue || '').includes(condition.value)
        case 'greater_than':
          return parseFloat(fieldValue) > parseFloat(condition.value)
        case 'less_than':
          return parseFloat(fieldValue) < parseFloat(condition.value)
        case 'is_empty':
          return this.isEmpty(fieldValue)
        case 'is_not_empty':
          return !this.isEmpty(fieldValue)
        default:
          return true
      }
    })
  }
}

export const formValidator = new FormValidator()