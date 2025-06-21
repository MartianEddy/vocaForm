import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  ArrowRight, 
  Download, 
  Save,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Wifi,
  WifiOff
} from 'lucide-react'
import { useForm } from '../contexts/FormContext'
import { useAccessibility } from '../contexts/AccessibilityContext'
import { useOfflineForm } from '../hooks/useOfflineForm'
import { useTouchGestures } from '../hooks/useTouchGestures'
import MobileFormField from '../components/MobileFormField'
import OfflineIndicator from '../components/OfflineIndicator'

export default function MobileFormFilling() {
  const { templateId } = useParams<{ templateId: string }>()
  const navigate = useNavigate()
  const { templates, currentForm, setCurrentForm, updateField, clearForm, exportToPDF } = useForm()
  const { settings, announceToScreenReader } = useAccessibility()
  const { isOnline, saveOfflineForm } = useOfflineForm()
  
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0)
  const [isExporting, setIsExporting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Touch gestures for navigation
  const gestureRef = useTouchGestures({
    onSwipeLeft: handleNext,
    onSwipeRight: handlePrevious,
    threshold: 100
  })

  useEffect(() => {
    if (templateId) {
      const template = templates.find(t => t.id === templateId)
      if (template) {
        setCurrentForm(template)
        announceToScreenReader(
          settings.simplifiedLanguage 
            ? `Starting ${template.name} form`
            : `Loading ${template.name} form template`
        )
      } else {
        navigate('/templates')
      }
    }
  }, [templateId, templates, setCurrentForm, navigate, announceToScreenReader, settings.simplifiedLanguage])

  // Auto-save functionality
  useEffect(() => {
    if (currentForm && currentForm.fields.some(f => f.value)) {
      const saveTimer = setTimeout(async () => {
        try {
          setIsSaving(true)
          // Convert to FormData format for offline storage
          const formData = {
            templateId: currentForm.id,
            templateVersion: '1.0.0',
            sessionId: `mobile_${Date.now()}`,
            values: currentForm.fields.reduce((acc, field) => {
              acc[field.id] = field.value
              return acc
            }, {} as Record<string, any>),
            confidences: currentForm.fields.reduce((acc, field) => {
              if (field.confidence) acc[field.id] = field.confidence
              return acc
            }, {} as Record<string, number>),
            completedFields: currentForm.fields.filter(f => f.value).map(f => f.id),
            currentSection: '',
            currentField: currentForm.fields[currentFieldIndex]?.id || '',
            progress: (currentForm.fields.filter(f => f.value).length / currentForm.fields.length) * 100,
            startedAt: new Date(),
            lastSavedAt: new Date()
          }
          
          await saveOfflineForm(formData, {
            id: currentForm.id,
            name: currentForm.name,
            description: currentForm.description,
            category: currentForm.category
          } as any)
        } catch (error) {
          console.error('Auto-save failed:', error)
        } finally {
          setIsSaving(false)
        }
      }, 2000)

      return () => clearTimeout(saveTimer)
    }
  }, [currentForm, currentFieldIndex, saveOfflineForm])

  if (!currentForm) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">
            {settings.simplifiedLanguage ? 'Loading...' : 'Loading form...'}
          </p>
        </div>
      </div>
    )
  }

  const currentField = currentForm.fields[currentFieldIndex]
  const completedFields = currentForm.fields.filter(field => field.value.trim() !== '').length
  const totalFields = currentForm.fields.length
  const progressPercentage = (completedFields / totalFields) * 100
  const isFormComplete = completedFields === totalFields

  function handleNext() {
    if (currentFieldIndex < currentForm.fields.length - 1) {
      setCurrentFieldIndex(currentFieldIndex + 1)
      announceToScreenReader(
        settings.simplifiedLanguage 
          ? 'Next field' 
          : `Moving to field ${currentFieldIndex + 2} of ${totalFields}`
      )
    }
  }

  function handlePrevious() {
    if (currentFieldIndex > 0) {
      setCurrentFieldIndex(currentFieldIndex - 1)
      announceToScreenReader(
        settings.simplifiedLanguage 
          ? 'Previous field' 
          : `Moving to field ${currentFieldIndex} of ${totalFields}`
      )
    }
  }

  const handleFieldUpdate = (value: string, confidence?: number) => {
    updateField(currentField.id, value, confidence)
    announceToScreenReader(
      settings.simplifiedLanguage 
        ? 'Field updated' 
        : `${currentField.label} updated`
    )
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await exportToPDF()
      announceToScreenReader(
        settings.simplifiedLanguage 
          ? 'Form downloaded' 
          : 'PDF exported successfully'
      )
    } catch (error) {
      console.error('Export failed:', error)
      announceToScreenReader(
        settings.simplifiedLanguage 
          ? 'Download failed' 
          : 'Export failed, please try again'
      )
    } finally {
      setIsExporting(false)
    }
  }

  const handleReset = () => {
    if (confirm(settings.simplifiedLanguage 
      ? 'Delete all answers?' 
      : 'Are you sure you want to clear all form data?'
    )) {
      clearForm()
      setCurrentFieldIndex(0)
      announceToScreenReader(
        settings.simplifiedLanguage 
          ? 'Form cleared' 
          : 'Form data cleared'
      )
    }
  }

  return (
    <div ref={gestureRef} className="min-h-screen bg-gray-50 pb-20">
      <OfflineIndicator />
      
      {/* Mobile Header */}
      <div className="bg-white shadow-sm border-b-2 border-gray-200 sticky top-0 z-30">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/templates')}
              className="btn-icon bg-gray-100 text-gray-600 hover:bg-gray-200"
              aria-label="Go back"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            
            <div className="flex-1 mx-4 text-center">
              <h1 className={`font-bold text-gray-900 ${settings.touchMode ? 'text-xl' : 'text-lg'}`}>
                {currentForm.name}
              </h1>
              <p className="text-sm text-gray-600">
                {settings.simplifiedLanguage 
                  ? `${currentFieldIndex + 1} of ${totalFields}`
                  : `Field ${currentFieldIndex + 1} of ${totalFields}`
                }
              </p>
            </div>

            <div className="flex items-center space-x-2">
              {isSaving && (
                <div className="flex items-center space-x-1 text-blue-600">
                  <Save className="h-4 w-4 animate-pulse" />
                  <span className="text-xs">Saving</span>
                </div>
              )}
              
              {!isOnline && (
                <div className="flex items-center space-x-1 text-red-600">
                  <WifiOff className="h-4 w-4" />
                  <span className="text-xs">Offline</span>
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">
                {settings.simplifiedLanguage ? 'Done:' : 'Progress:'}
              </span>
              <span className="text-gray-600">
                {Math.round(progressPercentage)}% ({completedFields}/{totalFields})
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Current Field */}
      <div className="p-4">
        <MobileFormField
          field={currentField}
          onUpdate={handleFieldUpdate}
          isActive={true}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />
      </div>

      {/* Navigation Controls */}
      <div className="fixed bottom-20 left-0 right-0 bg-white border-t-2 border-gray-200 p-4">
        <div className="flex items-center justify-between space-x-4">
          <button
            onClick={handlePrevious}
            disabled={currentFieldIndex === 0}
            className="btn-secondary flex items-center space-x-2 flex-1 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-bold">
              {settings.simplifiedLanguage ? 'Back' : 'Previous'}
            </span>
          </button>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={handleReset}
              className="btn-icon bg-red-100 text-red-600 hover:bg-red-200"
              aria-label={settings.simplifiedLanguage ? 'Clear all' : 'Reset form'}
            >
              <RotateCcw className="h-5 w-5" />
            </button>
            
            {isFormComplete && (
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="btn-icon bg-green-100 text-green-600 hover:bg-green-200 disabled:opacity-50"
                aria-label={settings.simplifiedLanguage ? 'Download' : 'Export PDF'}
              >
                <Download className="h-5 w-5" />
              </button>
            )}
          </div>

          <button
            onClick={handleNext}
            disabled={currentFieldIndex === currentForm.fields.length - 1}
            className="btn-primary flex items-center space-x-2 flex-1 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="font-bold">
              {currentFieldIndex === currentForm.fields.length - 1 
                ? (settings.simplifiedLanguage ? 'Done' : 'Finish')
                : (settings.simplifiedLanguage ? 'Next' : 'Next')
              }
            </span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Completion Message */}
      {isFormComplete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-green-900 mb-2">
              {settings.simplifiedLanguage ? 'All Done!' : 'Form Complete!'}
            </h3>
            <p className="text-green-700 mb-6">
              {settings.simplifiedLanguage 
                ? 'All fields filled. Download your form now.'
                : 'All required fields have been completed. You can now download your form.'
              }
            </p>
            <div className="space-y-3">
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="btn-primary w-full flex items-center justify-center space-x-2 py-4"
              >
                <Download className="h-6 w-6" />
                <span className="font-bold">
                  {isExporting 
                    ? (settings.simplifiedLanguage ? 'Downloading...' : 'Exporting...')
                    : (settings.simplifiedLanguage ? 'Download PDF' : 'Export PDF')
                  }
                </span>
              </button>
              <button
                onClick={() => navigate('/templates')}
                className="btn-secondary w-full py-4 font-bold"
              >
                {settings.simplifiedLanguage ? 'Fill Another Form' : 'Fill Another Form'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}