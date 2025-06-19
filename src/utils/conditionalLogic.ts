import { FormTemplate, FormData, FormFieldCondition, ConditionalLogicResult } from '../types/form'

export class ConditionalLogicEngine {
  evaluateTemplate(template: FormTemplate, formData: FormData): ConditionalLogicResult {
    const visibleFields: string[] = []
    const requiredFields: string[] = []
    const hiddenSections: string[] = []

    template.sections.forEach(section => {
      // Evaluate section visibility
      const sectionVisible = this.evaluateConditions(section.showIf, formData.values)
      
      if (!sectionVisible) {
        hiddenSections.push(section.id)
        return
      }

      section.fields.forEach(field => {
        // Evaluate field visibility
        const fieldVisible = this.evaluateConditions(field.showIf, formData.values)
        
        if (fieldVisible) {
          visibleFields.push(field.id)
          
          // Evaluate field requirement
          const baseRequired = field.validation?.required || false
          const conditionalRequired = this.evaluateConditions(field.requiredIf, formData.values)
          
          if (baseRequired || conditionalRequired) {
            requiredFields.push(field.id)
          }
        }
      })
    })

    return {
      visibleFields,
      requiredFields,
      hiddenSections
    }
  }

  private evaluateConditions(conditions: FormFieldCondition[] | undefined, values: Record<string, any>): boolean {
    if (!conditions || conditions.length === 0) {
      return true
    }

    // All conditions must be true (AND logic)
    return conditions.every(condition => this.evaluateCondition(condition, values))
  }

  private evaluateCondition(condition: FormFieldCondition, values: Record<string, any>): boolean {
    const fieldValue = values[condition.field]
    const conditionValue = condition.value

    switch (condition.operator) {
      case 'equals':
        return this.compareValues(fieldValue, conditionValue, '===')
      
      case 'not_equals':
        return this.compareValues(fieldValue, conditionValue, '!==')
      
      case 'contains':
        if (typeof fieldValue === 'string' && typeof conditionValue === 'string') {
          return fieldValue.toLowerCase().includes(conditionValue.toLowerCase())
        }
        if (Array.isArray(fieldValue)) {
          return fieldValue.includes(conditionValue)
        }
        return false
      
      case 'greater_than':
        return this.compareNumeric(fieldValue, conditionValue, '>')
      
      case 'less_than':
        return this.compareNumeric(fieldValue, conditionValue, '<')
      
      case 'is_empty':
        return this.isEmpty(fieldValue)
      
      case 'is_not_empty':
        return !this.isEmpty(fieldValue)
      
      default:
        console.warn(`Unknown condition operator: ${condition.operator}`)
        return true
    }
  }

  private compareValues(value1: any, value2: any, operator: '===' | '!=='): boolean {
    if (operator === '===') {
      return value1 === value2
    }
    return value1 !== value2
  }

  private compareNumeric(value1: any, value2: any, operator: '>' | '<'): boolean {
    const num1 = this.toNumber(value1)
    const num2 = this.toNumber(value2)
    
    if (num1 === null || num2 === null) {
      return false
    }
    
    return operator === '>' ? num1 > num2 : num1 < num2
  }

  private toNumber(value: any): number | null {
    if (typeof value === 'number') return value
    if (typeof value === 'string') {
      const parsed = parseFloat(value)
      return isNaN(parsed) ? null : parsed
    }
    return null
  }

  private isEmpty(value: any): boolean {
    return value === null || 
           value === undefined || 
           value === '' || 
           (Array.isArray(value) && value.length === 0) ||
           (typeof value === 'object' && Object.keys(value).length === 0)
  }
}

export const conditionalLogic = new ConditionalLogicEngine()