import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Download, RotateCcw, CheckCircle } from 'lucide-react'
import { useForm } from '../contexts/FormContext'
import { useLanguage } from '../contexts/LanguageContext'
import FormField from '../components/FormField'

export default function FormFilling() {
  const { templateId } = useParams<{ templateId: string }>()
  const navigate = useNavigate()
  const { templates, currentForm, setCurrentForm, updateField, clearForm, exportToPDF } = useForm()
  const { t } = useLanguage()
  
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    if (templateId) {
      const template = templates.find(t => t.id === templateId)
      if (template) {
        setCurrentForm(template)
      } else {
        navigate('/templates')
      }
    }
  }, [templateId, templates, setCurrentForm, navigate])

  if (!currentForm) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  const currentField = currentForm.fields[currentFieldIndex]
  const completedFields = currentForm.fields.filter(field => field.value.trim() !== '').length
  const totalFields = currentForm.fields.length
  const progressPercentage = (completedFields / totalFields) * 100

  const handleFieldUpdate = (value: string, confidence?: number) => {
    updateField(currentField.id, value, confidence)
  }

  const handleNext = () => {
    if (currentFieldIndex < currentForm.fields.length - 1) {
      setCurrentFieldIndex(currentFieldIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentFieldIndex > 0) {
      setCurrentFieldIndex(currentFieldIndex - 1)
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await exportToPDF()
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const isFormComplete = completedFields === totalFields

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/templates')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Templates</span>
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {currentForm.name}
            </h1>
            <p className="text-gray-600 mt-1">
              {currentForm.description}
            </p>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-500">
              Field {currentFieldIndex + 1} of {totalFields}
            </p>
            <p className="text-lg font-semibold text-primary-600">
              {completedFields}/{totalFields} Complete
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm text-gray-500">{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-primary-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Current Field */}
      <div className="mb-8">
        <FormField
          field={currentField}
          onUpdate={handleFieldUpdate}
          isActive={true}
        />
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={handlePrevious}
          disabled={currentFieldIndex === 0}
          className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t('form.previous')}</span>
        </button>

        <div className="flex space-x-3">
          <button
            onClick={clearForm}
            className="btn-danger flex items-center space-x-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span>{t('form.clear')}</span>
          </button>
          
          {isFormComplete && (
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="btn-primary flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>{isExporting ? 'Exporting...' : t('form.export')}</span>
            </button>
          )}
        </div>

        <button
          onClick={handleNext}
          disabled={currentFieldIndex === currentForm.fields.length - 1}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <span>{t('form.next')}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Form Overview */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Form Overview</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {currentForm.fields.map((field, index) => (
            <div
              key={field.id}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                index === currentFieldIndex
                  ? 'border-primary-500 bg-primary-50'
                  : field.value
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
              onClick={() => setCurrentFieldIndex(index)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {field.value ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                  )}
                  <span className="text-sm font-medium text-gray-900">
                    {field.label}
                  </span>
                </div>
                {field.confidence && (
                  <span className="text-xs text-gray-500">
                    {Math.round(field.confidence * 100)}%
                  </span>
                )}
              </div>
              {field.value && (
                <p className="text-xs text-gray-600 mt-1 truncate">
                  {field.value}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Completion Message */}
      {isFormComplete && (
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <div>
              <h3 className="text-lg font-semibold text-green-900">
                Form Complete!
              </h3>
              <p className="text-green-700">
                All required fields have been filled. You can now export your form as a PDF.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}