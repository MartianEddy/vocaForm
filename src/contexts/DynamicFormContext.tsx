import React, { createContext, useContext, useState, ReactNode } from 'react'
import { FormTemplate, FormData, ValidationResult } from '../types/form'
import { dynamicFormTemplates } from '../data/formTemplates'
import { formValidator } from '../utils/formValidation'
import { templateVersionManager } from '../utils/templateVersioning'

interface DynamicFormContextType {
  // Templates
  templates: FormTemplate[]
  getTemplate: (id: string) => FormTemplate | null
  getTemplateVersion: (id: string, version: string) => FormTemplate | null
  
  // Current form
  currentTemplate: FormTemplate | null
  currentFormData: FormData | null
  setCurrentTemplate: (template: FormTemplate) => void
  setCurrentFormData: (data: FormData) => void
  
  // Form operations
  createNewForm: (templateId: string, userId?: string) => FormData
  updateFormField: (fieldId: string, value: any, confidence?: number) => void
  validateForm: () => ValidationResult
  saveForm: (data: FormData) => Promise<void>
  loadForm: (sessionId: string) => Promise<FormData | null>
  
  // Template management
  addTemplate: (template: FormTemplate) => void
  updateTemplate: (template: FormTemplate, changelog: string[]) => void
  deleteTemplate: (templateId: string) => void
  
  // Auto-save
  enableAutoSave: (enabled: boolean) => void
  isAutoSaveEnabled: boolean
  lastSaveTime: Date | null
}

const DynamicFormContext = createContext<DynamicFormContextType | undefined>(undefined)

export function DynamicFormProvider({ children }: { children: ReactNode }) {
  const [templates, setTemplates] = useState<FormTemplate[]>(dynamicFormTemplates)
  const [currentTemplate, setCurrentTemplate] = useState<FormTemplate | null>(null)
  const [currentFormData, setCurrentFormData] = useState<FormData | null>(null)
  const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState(true)
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null)

  const getTemplate = (id: string): FormTemplate | null => {
    return templates.find(t => t.id === id) || null
  }

  const getTemplateVersion = (id: string, version: string): FormTemplate | null => {
    const versionData = templateVersionManager.getVersion(id, version)
    return versionData?.template || null
  }

  const createNewForm = (templateId: string, userId?: string): FormData => {
    const template = getTemplate(templateId)
    if (!template) {
      throw new Error(`Template ${templateId} not found`)
    }

    const newFormData: FormData = {
      templateId,
      templateVersion: template.version,
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      values: {},
      confidences: {},
      completedFields: [],
      currentSection: template.sections[0]?.id || '',
      currentField: '',
      progress: 0,
      startedAt: new Date(),
      lastSavedAt: new Date()
    }

    // Set default values
    template.sections.forEach(section => {
      section.fields.forEach(field => {
        if (field.defaultValue !== undefined) {
          newFormData.values[field.id] = field.defaultValue
        }
      })
    })

    setCurrentFormData(newFormData)
    return newFormData
  }

  const updateFormField = (fieldId: string, value: any, confidence?: number) => {
    if (!currentFormData) return

    const updatedData = {
      ...currentFormData,
      values: {
        ...currentFormData.values,
        [fieldId]: value
      },
      confidences: confidence !== undefined ? {
        ...currentFormData.confidences,
        [fieldId]: confidence
      } : currentFormData.confidences,
      lastSavedAt: new Date()
    }

    // Update completed fields
    if (value !== undefined && value !== null && value !== '') {
      if (!updatedData.completedFields.includes(fieldId)) {
        updatedData.completedFields = [...updatedData.completedFields, fieldId]
      }
    } else {
      updatedData.completedFields = updatedData.completedFields.filter(id => id !== fieldId)
    }

    setCurrentFormData(updatedData)
  }

  const validateForm = (): ValidationResult => {
    if (!currentTemplate || !currentFormData) {
      return { isValid: false, errors: {}, warnings: {} }
    }

    return formValidator.validateForm(currentTemplate, currentFormData)
  }

  const saveForm = async (data: FormData): Promise<void> => {
    try {
      // In a real application, this would save to a backend
      const storageKey = `vocaform_${data.templateId}_${data.sessionId}`
      localStorage.setItem(storageKey, JSON.stringify(data))
      setLastSaveTime(new Date())
    } catch (error) {
      console.error('Failed to save form:', error)
      throw error
    }
  }

  const loadForm = async (sessionId: string): Promise<FormData | null> => {
    try {
      // Find the form data by session ID
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.includes(sessionId)) {
          const data = localStorage.getItem(key)
          if (data) {
            const formData = JSON.parse(data) as FormData
            
            // Convert date strings back to Date objects
            formData.startedAt = new Date(formData.startedAt)
            formData.lastSavedAt = new Date(formData.lastSavedAt)
            if (formData.completedAt) {
              formData.completedAt = new Date(formData.completedAt)
            }
            
            return formData
          }
        }
      }
      return null
    } catch (error) {
      console.error('Failed to load form:', error)
      return null
    }
  }

  const addTemplate = (template: FormTemplate) => {
    setTemplates(prev => [...prev, template])
    templateVersionManager.addVersion(template.id, template, ['Initial version'], 'system')
  }

  const updateTemplate = (template: FormTemplate, changelog: string[]) => {
    setTemplates(prev => prev.map(t => t.id === template.id ? template : t))
    templateVersionManager.addVersion(template.id, template, changelog, 'system')
  }

  const deleteTemplate = (templateId: string) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId))
  }

  const enableAutoSave = (enabled: boolean) => {
    setIsAutoSaveEnabled(enabled)
  }

  return (
    <DynamicFormContext.Provider value={{
      templates,
      getTemplate,
      getTemplateVersion,
      currentTemplate,
      currentFormData,
      setCurrentTemplate,
      setCurrentFormData,
      createNewForm,
      updateFormField,
      validateForm,
      saveForm,
      loadForm,
      addTemplate,
      updateTemplate,
      deleteTemplate,
      enableAutoSave,
      isAutoSaveEnabled,
      lastSaveTime
    }}>
      {children}
    </DynamicFormContext.Provider>
  )
}

export function useDynamicForm() {
  const context = useContext(DynamicFormContext)
  if (context === undefined) {
    throw new Error('useDynamicForm must be used within a DynamicFormProvider')
  }
  return context
}