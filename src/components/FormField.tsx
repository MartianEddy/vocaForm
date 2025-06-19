import React, { useState } from 'react'
import { Edit3, Check, X } from 'lucide-react'
import { FormField as FormFieldType } from '../contexts/FormContext'
import { useLanguage } from '../contexts/LanguageContext'
import VoiceRecorder from './VoiceRecorder'

interface FormFieldProps {
  field: FormFieldType
  onUpdate: (value: string, confidence?: number) => void
  isActive?: boolean
}

export default function FormField({ field, onUpdate, isActive = false }: FormFieldProps) {
  const { t } = useLanguage()
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(field.value)

  const handleVoiceTranscript = (text: string, confidence: number) => {
    onUpdate(text, confidence)
  }

  const handleManualEdit = () => {
    setEditValue(field.value)
    setIsEditing(true)
  }

  const handleSaveEdit = () => {
    onUpdate(editValue)
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditValue(field.value)
    setIsEditing(false)
  }

  const renderInput = () => {
    const baseClasses = "form-input text-lg"
    
    if (field.type === 'textarea') {
      return (
        <textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className={`${baseClasses} min-h-[100px] resize-vertical`}
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
          <option value="">Select an option...</option>
          {field.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
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

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return 'text-gray-400'
    if (confidence > 0.8) return 'text-green-600'
    if (confidence > 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className={`card transition-all duration-200 ${isActive ? 'ring-2 ring-primary-500 bg-primary-50' : ''}`}>
      <div className="space-y-4">
        {/* Field Label */}
        <div className="flex items-center justify-between">
          <label className="form-label text-lg">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          
          {field.confidence && (
            <span className={`text-sm font-medium ${getConfidenceColor(field.confidence)}`}>
              {Math.round(field.confidence * 100)}% confidence
            </span>
          )}
        </div>

        {/* Voice Recorder */}
        {isActive && !isEditing && (
          <VoiceRecorder
            onTranscript={handleVoiceTranscript}
            placeholder={`Say your ${field.label.toLowerCase()}`}
          />
        )}

        {/* Field Value Display/Edit */}
        <div className="space-y-3">
          {isEditing ? (
            <div className="space-y-3">
              {renderInput()}
              <div className="flex space-x-2">
                <button
                  onClick={handleSaveEdit}
                  className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Check className="h-4 w-4" />
                  <span>{t('form.save')}</span>
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center space-x-1 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span>{t('common.cancel')}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex-1">
                {field.value ? (
                  <div className="bg-gray-50 rounded-lg p-4 border">
                    <p className="text-gray-900">{field.value}</p>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 border border-dashed border-gray-300">
                    <p className="text-gray-500 italic">
                      {field.placeholder || `Enter ${field.label.toLowerCase()}`}
                    </p>
                  </div>
                )}
              </div>
              
              <button
                onClick={handleManualEdit}
                className="ml-3 p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                title={t('form.edit')}
              >
                <Edit3 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}