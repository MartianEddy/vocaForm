import React, { useState, useEffect } from 'react'
import { 
  Edit3, 
  Check, 
  X, 
  Volume2, 
  Eye, 
  EyeOff, 
  Calendar,
  Upload,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react'
import { FormField as FormFieldType } from '../contexts/FormContext'
import { useAccessibility } from '../contexts/AccessibilityContext'
import { useVoiceGuidance } from '../lib/elevenlabs'
import AccessibleVoiceRecorder from './AccessibleVoiceRecorder'

interface AccessibleFormFieldProps {
  field: FormFieldType
  onUpdate: (value: string, confidence?: number) => void
  isActive?: boolean
}

export default function AccessibleFormField({ 
  field, 
  onUpdate, 
  isActive = false 
}: AccessibleFormFieldProps) {
  const { settings, announceToScreenReader } = useAccessibility()
  const { playCustomMessage, isAvailable } = useVoiceGuidance()
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(field.value)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (isActive && settings.audioPrompts && isAvailable) {
      const message = settings.simplifiedLanguage
        ? `Fill in ${field.label}`
        : `Please provide your ${field.label.toLowerCase()}`
      
      setTimeout(() => playCustomMessage(message), 500)
    }
  }, [isActive, settings.audioPrompts, isAvailable, field.label, playCustomMessage, settings.simplifiedLanguage])

  const handleVoiceTranscript = (text: string, confidence: number) => {
    onUpdate(text, confidence)
    announceToScreenReader(settings.simplifiedLanguage ? 'Got it!' : 'Voice input received')
  }

  const handleManualEdit = () => {
    setEditValue(field.value)
    setIsEditing(true)
    announceToScreenReader(settings.simplifiedLanguage ? 'Typing mode' : 'Manual editing mode activated')
  }

  const handleSaveEdit = () => {
    onUpdate(editValue, 1.0)
    setIsEditing(false)
    announceToScreenReader(settings.simplifiedLanguage ? 'Saved!' : 'Changes saved')
  }

  const handleCancelEdit = () => {
    setEditValue(field.value)
    setIsEditing(false)
    announceToScreenReader(settings.simplifiedLanguage ? 'Cancelled' : 'Edit cancelled')
  }

  const getConfidenceLevel = (confidence?: number): 'high' | 'medium' | 'low' | 'very-low' => {
    if (!confidence) return 'very-low'
    if (confidence >= 0.85) return 'high'
    if (confidence >= 0.65) return 'medium'
    if (confidence >= 0.45) return 'low'
    return 'very-low'
  }

  const getConfidenceIcon = (level: string) => {
    switch (level) {
      case 'high':
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case 'medium':
        return <Info className="h-6 w-6 text-blue-500" />
      case 'low':
      case 'very-low':
        return <AlertCircle className="h-6 w-6 text-yellow-500" />
      default:
        return null
    }
  }

  const renderInput = () => {
    const baseClasses = `form-input ${settings.touchMode ? 'text-xl py-6' : 'text-lg py-4'}`
    
    if (field.type === 'textarea') {
      return (
        <textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className={`${baseClasses} min-h-[120px] resize-vertical`}
          placeholder={field.placeholder}
          rows={settings.touchMode ? 6 : 4}
          aria-label={field.label}
        />
      )
    }
    
    if (field.type === 'select') {
      return (
        <select
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className={baseClasses}
          aria-label={field.label}
        >
          <option value="">
            {settings.simplifiedLanguage ? 'Choose one...' : 'Select an option...'}
          </option>
          {field.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      )
    }

    if (field.type === 'date') {
      return (
        <div className="relative">
          <input
            type="date"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className={baseClasses}
            aria-label={field.label}
          />
          <Calendar className="absolute right-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400 pointer-events-none" />
        </div>
      )
    }

    if (field.type === 'password') {
      return (
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className={`${baseClasses} pr-16`}
            placeholder={field.placeholder}
            aria-label={field.label}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-2"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
          </button>
        </div>
      )
    }
    
    return (
      <input
        type={field.type}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        className={baseClasses}
        placeholder={field.placeholder}
        aria-label={field.label}
      />
    )
  }

  return (
    <div className={`card transition-all duration-200 ${
      isActive ? 'ring-4 ring-primary-500 bg-primary-50' : ''
    } ${settings.touchMode ? 'p-8' : 'p-6'}`}>
      <div className="space-y-6">
        {/* Field Label with Icons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">
              {field.type === 'email' && '📧'}
              {field.type === 'tel' && '📞'}
              {field.type === 'date' && '📅'}
              {field.type === 'text' && '✏️'}
              {field.type === 'textarea' && '📝'}
              {field.type === 'select' && '📋'}
              {!['email', 'tel', 'date', 'text', 'textarea', 'select'].includes(field.type) && '📄'}
            </div>
            <div>
              <label className={`form-label ${settings.touchMode ? 'text-2xl' : 'text-xl'} mb-0`}>
                {field.label}
                {field.required && (
                  <span className="text-red-500 ml-2 text-2xl" aria-label="required">*</span>
                )}
              </label>
              {settings.simplifiedLanguage && field.required && (
                <p className="text-red-600 font-medium text-lg mt-1">
                  You must fill this
                </p>
              )}
            </div>
          </div>
          
          {field.confidence !== undefined && (
            <div className="flex items-center space-x-2">
              {getConfidenceIcon(getConfidenceLevel(field.confidence))}
              <span className={`font-bold ${settings.touchMode ? 'text-xl' : 'text-lg'}`}>
                {Math.round(field.confidence * 100)}%
              </span>
            </div>
          )}
        </div>

        {/* Voice Recorder */}
        {isActive && !isEditing && (
          <AccessibleVoiceRecorder
            onTranscript={handleVoiceTranscript}
            fieldLabel={field.label}
            fieldType={field.type}
            isRequired={field.required || false}
            placeholder={`Say your ${field.label.toLowerCase()}`}
          />
        )}

        {/* Field Value Display/Edit */}
        <div className="space-y-4">
          {isEditing ? (
            <div className="space-y-4">
              {renderInput()}
              <div className="flex space-x-4">
                <button
                  onClick={handleSaveEdit}
                  className={`btn-primary flex items-center space-x-3 ${settings.touchMode ? 'btn-large' : ''} touch-feedback`}
                >
                  <Check className="h-6 w-6" />
                  <span className="font-bold">
                    {settings.simplifiedLanguage ? 'Save' : 'Save Changes'}
                  </span>
                </button>
                <button
                  onClick={handleCancelEdit}
                  className={`btn-secondary flex items-center space-x-3 ${settings.touchMode ? 'btn-large' : ''} touch-feedback`}
                >
                  <X className="h-6 w-6" />
                  <span className="font-bold">
                    {settings.simplifiedLanguage ? 'Cancel' : 'Cancel'}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {field.value ? (
                <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className={`text-gray-900 font-medium ${settings.touchMode ? 'text-xl' : 'text-lg'}`}>
                        {field.type === 'password' ? '••••••••' : field.value}
                      </p>
                      {field.confidence !== undefined && field.confidence < 0.7 && (
                        <div className="mt-3 p-3 bg-yellow-100 border-2 border-yellow-300 rounded-lg">
                          <div className="flex items-center space-x-2 text-yellow-800">
                            <AlertCircle className="h-5 w-5" />
                            <span className="font-medium">
                              {settings.simplifiedLanguage 
                                ? 'Please check this is correct'
                                : 'Low confidence - please verify'
                              }
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={handleManualEdit}
                      className={`btn-icon bg-primary-100 text-primary-600 hover:bg-primary-200 ml-4 ${settings.touchMode ? 'p-4' : 'p-3'} touch-feedback`}
                      aria-label={settings.simplifiedLanguage ? 'Change this' : 'Edit this field'}
                    >
                      <Edit3 className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-300">
                  <div className="flex items-center justify-between">
                    <p className={`text-gray-500 italic ${settings.touchMode ? 'text-xl' : 'text-lg'}`}>
                      {settings.simplifiedLanguage 
                        ? `Say your ${field.label.toLowerCase()}` 
                        : field.placeholder || `Enter ${field.label.toLowerCase()}`
                      }
                    </p>
                    
                    <button
                      onClick={handleManualEdit}
                      className={`btn-secondary flex items-center space-x-2 ${settings.touchMode ? 'btn-large' : ''} touch-feedback`}
                    >
                      <Edit3 className="h-5 w-5" />
                      <span className="font-bold">
                        {settings.simplifiedLanguage ? 'Type' : 'Type Instead'}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Voice Input Hint */}
        {isActive && !isEditing && !field.value && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
            <div className="flex items-center space-x-3 text-blue-700 mb-3">
              <Volume2 className="h-8 w-8" />
              <span className={`font-bold ${settings.touchMode ? 'text-xl' : 'text-lg'}`}>
                {settings.simplifiedLanguage ? 'Voice is ready!' : 'Voice Input Active'}
              </span>
            </div>
            <p className={`text-blue-600 ${settings.touchMode ? 'text-lg' : 'text-base'}`}>
              {settings.simplifiedLanguage 
                ? `Press the microphone and say your ${field.label.toLowerCase()}.`
                : `Click the microphone above and speak your ${field.label.toLowerCase()}. The system will automatically detect and transcribe your speech.`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}