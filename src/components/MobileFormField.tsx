import React, { useState } from 'react'
import { 
  Mic, 
  Edit3, 
  Check, 
  X, 
  ChevronDown,
  ChevronUp,
  Volume2,
  Eye,
  EyeOff
} from 'lucide-react'
import { FormField as FormFieldType } from '../contexts/FormContext'
import { useAccessibility } from '../contexts/AccessibilityContext'
import { useTouchGestures } from '../hooks/useTouchGestures'
import AccessibleVoiceRecorder from './AccessibleVoiceRecorder'

interface MobileFormFieldProps {
  field: FormFieldType
  onUpdate: (value: string, confidence?: number) => void
  isActive?: boolean
  onNext?: () => void
  onPrevious?: () => void
}

export default function MobileFormField({ 
  field, 
  onUpdate, 
  isActive = false,
  onNext,
  onPrevious
}: MobileFormFieldProps) {
  const { settings, announceToScreenReader } = useAccessibility()
  const [isExpanded, setIsExpanded] = useState(isActive)
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(field.value)
  const [showPassword, setShowPassword] = useState(false)

  // Touch gestures for navigation
  const gestureRef = useTouchGestures({
    onSwipeLeft: onNext,
    onSwipeRight: onPrevious,
    onDoubleTap: () => setIsExpanded(!isExpanded),
    threshold: 100
  })

  const handleVoiceTranscript = (text: string, confidence: number) => {
    onUpdate(text, confidence)
    announceToScreenReader(settings.simplifiedLanguage ? 'Voice input saved' : 'Voice input received and saved')
  }

  const handleSaveEdit = () => {
    onUpdate(editValue, 1.0)
    setIsEditing(false)
    announceToScreenReader(settings.simplifiedLanguage ? 'Changes saved' : 'Manual edit saved')
  }

  const getFieldIcon = () => {
    switch (field.type) {
      case 'email': return '📧'
      case 'tel': return '📞'
      case 'date': return '📅'
      case 'textarea': return '📝'
      case 'select': return '📋'
      default: return '✏️'
    }
  }

  const getStatusColor = () => {
    if (field.value) {
      if (field.confidence && field.confidence < 0.7) {
        return 'border-yellow-400 bg-yellow-50'
      }
      return 'border-green-400 bg-green-50'
    }
    return field.required ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-gray-50'
  }

  const renderMobileInput = () => {
    const baseClasses = "w-full px-6 py-4 text-xl border-2 rounded-xl focus:ring-4 focus:ring-primary-500 focus:border-primary-500"
    
    if (field.type === 'textarea') {
      return (
        <textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className={`${baseClasses} min-h-[120px] resize-none`}
          placeholder={field.placeholder}
          rows={4}
        />
      )
    }
    
    if (field.type === 'select') {
      return (
        <select
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className={baseClasses}
        >
          <option value="">Choose...</option>
          {field.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
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
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 text-gray-500"
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
      />
    )
  }

  return (
    <div 
      ref={gestureRef}
      className={`border-2 rounded-2xl transition-all duration-300 ${getStatusColor()} ${
        isActive ? 'ring-4 ring-primary-500 shadow-lg' : 'shadow-sm'
      }`}
    >
      {/* Field Header - Always Visible */}
      <div 
        className="p-6 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-4xl">{getFieldIcon()}</span>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900">
                {field.label}
                {field.required && <span className="text-red-500 ml-2">*</span>}
              </h3>
              {field.value ? (
                <p className="text-lg text-gray-600 truncate mt-1">
                  {field.type === 'password' ? '••••••••' : field.value}
                </p>
              ) : (
                <p className="text-lg text-gray-500 italic">
                  {settings.simplifiedLanguage ? 'Not filled' : 'Tap to fill'}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {field.confidence && (
              <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                field.confidence >= 0.8 ? 'bg-green-100 text-green-800' :
                field.confidence >= 0.6 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {Math.round(field.confidence * 100)}%
              </div>
            )}
            
            {isExpanded ? (
              <ChevronUp className="h-6 w-6 text-gray-400" />
            ) : (
              <ChevronDown className="h-6 w-6 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-6 pb-6 space-y-6">
          {/* Voice Input Section */}
          {!isEditing && (
            <AccessibleVoiceRecorder
              onTranscript={handleVoiceTranscript}
              fieldLabel={field.label}
              fieldType={field.type}
              isRequired={field.required || false}
              className="bg-white"
            />
          )}

          {/* Manual Input Section */}
          {isEditing ? (
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                <Edit3 className="h-5 w-5" />
                <span>{settings.simplifiedLanguage ? 'Type Here' : 'Manual Input'}</span>
              </h4>
              
              {renderMobileInput()}
              
              <div className="flex space-x-4">
                <button
                  onClick={handleSaveEdit}
                  className="btn-primary flex-1 flex items-center justify-center space-x-2 py-4 text-lg"
                >
                  <Check className="h-6 w-6" />
                  <span>{settings.simplifiedLanguage ? 'Save' : 'Save Changes'}</span>
                </button>
                <button
                  onClick={() => {
                    setEditValue(field.value)
                    setIsEditing(false)
                  }}
                  className="btn-secondary flex-1 flex items-center justify-center space-x-2 py-4 text-lg"
                >
                  <X className="h-6 w-6" />
                  <span>{settings.simplifiedLanguage ? 'Cancel' : 'Cancel'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={() => {
                  setEditValue(field.value)
                  setIsEditing(true)
                }}
                className="btn-secondary flex items-center space-x-3 px-8 py-4 text-lg"
              >
                <Edit3 className="h-6 w-6" />
                <span>{settings.simplifiedLanguage ? 'Type Instead' : 'Manual Input'}</span>
              </button>
            </div>
          )}

          {/* Navigation Hints */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <p className="text-blue-800 text-center font-medium">
              {settings.simplifiedLanguage 
                ? '👈 Swipe left/right to go to next field'
                : '👈 Swipe left or right to navigate between fields'
              }
            </p>
          </div>

          {/* Confidence Warning */}
          {field.confidence && field.confidence < 0.7 && field.value && (
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
              <p className="text-yellow-800 font-medium text-center">
                {settings.simplifiedLanguage 
                  ? '⚠️ Please check this is correct'
                  : '⚠️ Low confidence - please verify this information'
                }
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}