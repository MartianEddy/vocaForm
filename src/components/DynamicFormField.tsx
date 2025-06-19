import React, { useState, useEffect } from 'react'
import { FormField, FormFieldOption } from '../types/form'
import { formValidator } from '../utils/formValidation'
import { AlertCircle, Calendar, Upload, Eye, EyeOff } from 'lucide-react'
import VoiceRecorder from './VoiceRecorder'
import ConfidenceIndicator from './ConfidenceIndicator'

interface DynamicFormFieldProps {
  field: FormField
  value: any
  confidence?: number
  onChange: (value: any, confidence?: number) => void
  onBlur?: () => void
  errors?: string[]
  warnings?: string[]
  isVisible?: boolean
  isRequired?: boolean
  isActive?: boolean
  formData?: Record<string, any>
}

export default function DynamicFormField({
  field,
  value,
  confidence,
  onChange,
  onBlur,
  errors = [],
  warnings = [],
  isVisible = true,
  isRequired = false,
  isActive = false,
  formData = {}
}: DynamicFormFieldProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [localValue, setLocalValue] = useState(value || field.defaultValue || '')
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    setLocalValue(value || field.defaultValue || '')
  }, [value, field.defaultValue])

  if (!isVisible) {
    return null
  }

  const handleChange = (newValue: any, newConfidence?: number) => {
    setLocalValue(newValue)
    setIsDirty(true)
    onChange(newValue, newConfidence)
  }

  const handleVoiceTranscript = (text: string, voiceConfidence: number) => {
    handleChange(text, voiceConfidence)
  }

  const getFieldClasses = () => {
    const baseClasses = 'form-input transition-all duration-200'
    const widthClasses = {
      full: 'w-full',
      half: 'w-1/2',
      third: 'w-1/3',
      quarter: 'w-1/4'
    }
    
    let classes = `${baseClasses} ${widthClasses[field.width || 'full']}`
    
    if (errors.length > 0) {
      classes += ' border-red-500 focus:border-red-500 focus:ring-red-500'
    } else if (warnings.length > 0) {
      classes += ' border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500'
    } else if (isActive) {
      classes += ' border-primary-500 focus:border-primary-600 focus:ring-primary-500'
    }
    
    if (field.className) {
      classes += ` ${field.className}`
    }
    
    return classes
  }

  const renderInput = () => {
    const commonProps = {
      id: field.id,
      value: localValue,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => 
        handleChange(e.target.value),
      onBlur,
      className: getFieldClasses(),
      placeholder: field.placeholder,
      autoComplete: field.autoComplete,
      'aria-describedby': field.description ? `${field.id}-description` : undefined,
      'aria-invalid': errors.length > 0,
      required: isRequired
    }

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={4}
            style={{ resize: 'vertical' }}
          />
        )

      case 'select':
        return (
          <select {...commonProps}>
            <option value="">Select an option...</option>
            {field.options?.map((option: FormFieldOption) => (
              <option 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
        )

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option: FormFieldOption) => (
              <label key={option.value} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={field.id}
                  value={option.value}
                  checked={localValue === option.value}
                  onChange={(e) => handleChange(e.target.value)}
                  disabled={option.disabled}
                  className="text-primary-600 focus:ring-primary-500"
                />
                <span className={option.disabled ? 'text-gray-400' : 'text-gray-700'}>
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        )

      case 'checkbox':
        if (field.options && field.options.length > 1) {
          // Multiple checkboxes
          const selectedValues = Array.isArray(localValue) ? localValue : []
          return (
            <div className="space-y-2">
              {field.options.map((option: FormFieldOption) => (
                <label key={option.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={option.value}
                    checked={selectedValues.includes(option.value)}
                    onChange={(e) => {
                      const newValues = e.target.checked
                        ? [...selectedValues, option.value]
                        : selectedValues.filter(v => v !== option.value)
                      handleChange(newValues)
                    }}
                    disabled={option.disabled}
                    className="text-primary-600 focus:ring-primary-500 rounded"
                  />
                  <span className={option.disabled ? 'text-gray-400' : 'text-gray-700'}>
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          )
        } else {
          // Single checkbox
          return (
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={!!localValue}
                onChange={(e) => handleChange(e.target.checked)}
                className="text-primary-600 focus:ring-primary-500 rounded"
              />
              <span className="text-gray-700">
                {field.options?.[0]?.label || field.label}
              </span>
            </label>
          )
        }

      case 'file':
        return (
          <div className="space-y-2">
            <input
              type="file"
              id={field.id}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  handleChange(file)
                }
              }}
              className="hidden"
              accept={field.validation?.pattern}
            />
            <label
              htmlFor={field.id}
              className="flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition-colors"
            >
              <Upload className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-gray-600">
                {localValue ? localValue.name || 'File selected' : 'Choose file...'}
              </span>
            </label>
          </div>
        )

      case 'date':
      case 'datetime-local':
        return (
          <div className="relative">
            <input
              {...commonProps}
              type={field.type}
            />
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        )

      case 'password':
        return (
          <div className="relative">
            <input
              {...commonProps}
              type={showPassword ? 'text' : 'password'}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        )

      default:
        return <input {...commonProps} type={field.type} />
    }
  }

  const renderSuggestions = () => {
    if (!field.suggestions || field.suggestions.length === 0 || !localValue) {
      return null
    }

    const filteredSuggestions = field.suggestions.filter(suggestion =>
      suggestion.toLowerCase().includes(localValue.toLowerCase()) &&
      suggestion.toLowerCase() !== localValue.toLowerCase()
    )

    if (filteredSuggestions.length === 0) {
      return null
    }

    return (
      <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
        {filteredSuggestions.slice(0, 5).map((suggestion, index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleChange(suggestion, 1.0)}
            className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
          >
            {suggestion}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${field.width === 'full' ? 'col-span-full' : ''}`}>
      {/* Field Label */}
      <div className="flex items-center justify-between">
        <label htmlFor={field.id} className="form-label">
          {field.label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        {confidence !== undefined && (
          <ConfidenceIndicator
            confidence={confidence}
            level={confidence >= 0.85 ? 'high' : confidence >= 0.65 ? 'medium' : confidence >= 0.45 ? 'low' : 'very-low'}
          />
        )}
      </div>

      {/* Field Description */}
      {field.description && (
        <p id={`${field.id}-description`} className="text-sm text-gray-600">
          {field.description}
        </p>
      )}

      {/* Voice Input */}
      {field.voiceEnabled && isActive && !['file', 'checkbox', 'radio'].includes(field.type) && (
        <VoiceRecorder
          onTranscript={handleVoiceTranscript}
          placeholder={`Say your ${field.label.toLowerCase()}`}
          className="mb-3"
        />
      )}

      {/* Input Field */}
      <div className="relative">
        {renderInput()}
        {renderSuggestions()}
      </div>

      {/* Voice Hints */}
      {field.voiceHints && field.voiceHints.length > 0 && isActive && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-700 font-medium mb-1">Voice Input Tips:</p>
          <ul className="text-xs text-blue-600 space-y-1">
            {field.voiceHints.map((hint, index) => (
              <li key={index}>• {hint}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Validation Errors */}
      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((error, index) => (
            <div key={index} className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          ))}
        </div>
      )}

      {/* Validation Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-1">
          {warnings.map((warning, index) => (
            <div key={index} className="flex items-center space-x-2 text-yellow-600">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{warning}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}