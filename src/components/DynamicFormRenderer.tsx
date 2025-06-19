import React, { useState, useEffect, useCallback } from 'react'
import { FormTemplate, FormData, ValidationResult } from '../types/form'
import { formValidator } from '../utils/formValidation'
import { conditionalLogic } from '../utils/conditionalLogic'
import { createAutoSaveManager, AutoSaveManager } from '../utils/autoSave'
import DynamicFormField from './DynamicFormField'
import { ChevronDown, ChevronUp, Save, AlertTriangle, CheckCircle, Clock } from 'lucide-react'

interface DynamicFormRendererProps {
  template: FormTemplate
  initialData?: Partial<FormData>
  onSave?: (data: FormData) => void
  onValidationChange?: (validation: ValidationResult) => void
  onProgressChange?: (progress: number) => void
  className?: string
}

export default function DynamicFormRenderer({
  template,
  initialData,
  onSave,
  onValidationChange,
  onProgressChange,
  className = ''
}: DynamicFormRendererProps) {
  const [formData, setFormData] = useState<FormData>(() => ({
    templateId: template.id,
    templateVersion: template.version,
    sessionId: initialData?.sessionId || `session_${Date.now()}`,
    userId: initialData?.userId,
    values: initialData?.values || {},
    confidences: initialData?.confidences || {},
    completedFields: initialData?.completedFields || [],
    currentSection: initialData?.currentSection || template.sections[0]?.id || '',
    currentField: initialData?.currentField || '',
    progress: initialData?.progress || 0,
    startedAt: initialData?.startedAt || new Date(),
    lastSavedAt: initialData?.lastSavedAt || new Date(),
    completedAt: initialData?.completedAt
  }))

  const [validation, setValidation] = useState<ValidationResult>({ isValid: true, errors: {}, warnings: {} })
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())
  const [activeField, setActiveField] = useState<string>('')
  const [autoSaveManager, setAutoSaveManager] = useState<AutoSaveManager | null>(null)
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Initialize auto-save
  useEffect(() => {
    if (template.settings.autoSave) {
      const manager = createAutoSaveManager(template.id, formData.sessionId, {
        interval: template.settings.autoSaveInterval * 1000,
        onSave: (data) => {
          setLastSaveTime(new Date())
          onSave?.(data)
        },
        onError: (error) => {
          console.error('Auto-save error:', error)
        }
      })

      // Load any existing saved data
      const savedData = manager.loadSavedData()
      if (savedData && savedData.templateVersion === template.version) {
        setFormData(savedData)
      }

      manager.start(formData)
      setAutoSaveManager(manager)

      return () => {
        manager.stop()
      }
    }
  }, [template.id, template.version, template.settings.autoSave, template.settings.autoSaveInterval])

  // Evaluate conditional logic
  const conditionalResult = conditionalLogic.evaluateTemplate(template, formData)

  // Validate form whenever data changes
  useEffect(() => {
    const newValidation = formValidator.validateForm(template, formData)
    setValidation(newValidation)
    onValidationChange?.(newValidation)
  }, [formData, template])

  // Calculate and update progress
  useEffect(() => {
    const visibleFields = conditionalResult.visibleFields
    const completedVisibleFields = visibleFields.filter(fieldId => {
      const value = formData.values[fieldId]
      return value !== undefined && value !== null && value !== ''
    })
    
    const progress = visibleFields.length > 0 
      ? (completedVisibleFields.length / visibleFields.length) * 100 
      : 0

    setFormData(prev => ({ ...prev, progress }))
    onProgressChange?.(progress)
  }, [formData.values, conditionalResult.visibleFields])

  const handleFieldChange = useCallback((fieldId: string, value: any, confidence?: number) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        values: { ...prev.values, [fieldId]: value },
        confidences: confidence !== undefined 
          ? { ...prev.confidences, [fieldId]: confidence }
          : prev.confidences,
        lastSavedAt: new Date()
      }

      // Update completed fields
      if (value !== undefined && value !== null && value !== '') {
        if (!newData.completedFields.includes(fieldId)) {
          newData.completedFields = [...newData.completedFields, fieldId]
        }
      } else {
        newData.completedFields = newData.completedFields.filter(id => id !== fieldId)
      }

      return newData
    })
  }, [])

  const handleFieldBlur = useCallback((fieldId: string) => {
    // Trigger validation for the specific field
    const field = template.sections
      .flatMap(section => section.fields)
      .find(f => f.id === fieldId)
    
    if (field) {
      const fieldErrors = formValidator.validateField(field, formData.values[fieldId], formData)
      // Update validation state if needed
    }
  }, [template, formData])

  const handleSectionToggle = (sectionId: string) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId)
      } else {
        newSet.add(sectionId)
      }
      return newSet
    })
  }

  const handleManualSave = async () => {
    if (!autoSaveManager) return

    setIsSaving(true)
    try {
      await autoSaveManager.saveNow(formData)
      setLastSaveTime(new Date())
    } catch (error) {
      console.error('Manual save failed:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const renderField = (field: any, sectionId: string) => {
    const isVisible = conditionalResult.visibleFields.includes(field.id)
    const isRequired = conditionalResult.requiredFields.includes(field.id)
    const fieldErrors = validation.errors[field.id] || []
    const fieldWarnings = validation.warnings[field.id] || []

    return (
      <DynamicFormField
        key={field.id}
        field={field}
        value={formData.values[field.id]}
        confidence={formData.confidences[field.id]}
        onChange={(value, confidence) => handleFieldChange(field.id, value, confidence)}
        onBlur={() => handleFieldBlur(field.id)}
        errors={fieldErrors}
        warnings={fieldWarnings}
        isVisible={isVisible}
        isRequired={isRequired}
        isActive={activeField === field.id}
        formData={formData.values}
      />
    )
  }

  const renderSection = (section: any) => {
    const isCollapsed = collapsedSections.has(section.id)
    const isHidden = conditionalResult.hiddenSections.includes(section.id)
    
    if (isHidden) return null

    const sectionFields = section.fields.filter((field: any) => 
      conditionalResult.visibleFields.includes(field.id)
    )

    if (sectionFields.length === 0) return null

    return (
      <div key={section.id} className="card">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
            {section.description && (
              <p className="text-sm text-gray-600 mt-1">{section.description}</p>
            )}
          </div>
          
          {section.collapsible && (
            <button
              onClick={() => handleSectionToggle(section.id)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </button>
          )}
        </div>

        {/* Section Fields */}
        {!isCollapsed && (
          <div className="grid gap-6 md:grid-cols-2">
            {section.fields.map((field: any) => renderField(field, section.id))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Form Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{template.name}</h2>
          <p className="text-gray-600 mt-1">{template.description}</p>
        </div>
        
        {/* Save Status */}
        <div className="flex items-center space-x-4">
          {template.settings.autoSave && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>
                {lastSaveTime 
                  ? `Saved ${lastSaveTime.toLocaleTimeString()}`
                  : 'Not saved'
                }
              </span>
            </div>
          )}
          
          <button
            onClick={handleManualSave}
            disabled={isSaving}
            className="btn-secondary flex items-center space-x-2 text-sm"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? 'Saving...' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {template.settings.showProgress && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">Progress</span>
            <span className="text-gray-600">{Math.round(formData.progress)}% complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${formData.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Validation Summary */}
      {!validation.isValid && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-red-700 mb-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium">Please fix the following errors:</span>
          </div>
          <ul className="text-sm text-red-600 space-y-1">
            {Object.entries(validation.errors).map(([fieldId, errors]) => (
              <li key={fieldId}>
                <strong>{template.sections.flatMap(s => s.fields).find(f => f.id === fieldId)?.label}:</strong> {errors.join(', ')}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Form Sections */}
      <div className="space-y-6">
        {template.sections.map(renderSection)}
      </div>

      {/* Form Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          {validation.isValid ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Form is valid and ready to submit</span>
            </>
          ) : (
            <>
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span>{Object.keys(validation.errors).length} errors need to be fixed</span>
            </>
          )}
        </div>
        
        <div className="text-sm text-gray-500">
          Template v{template.version} • {formData.completedFields.length} fields completed
        </div>
      </div>
    </div>
  )
}