import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, Save, RefreshCw, Eye } from 'lucide-react'
import { useDynamicForm } from '../contexts/DynamicFormContext'
import { ValidationResult } from '../types/form'
import DynamicFormRenderer from '../components/DynamicFormRenderer'

export default function DynamicFormFilling() {
  const { templateId } = useParams<{ templateId: string }>()
  const navigate = useNavigate()
  const {
    getTemplate,
    currentTemplate,
    currentFormData,
    setCurrentTemplate,
    createNewForm,
    validateForm,
    saveForm
  } = useDynamicForm()

  const [validation, setValidation] = useState<ValidationResult>({ isValid: true, errors: {}, warnings: {} })
  const [progress, setProgress] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    if (templateId) {
      const template = getTemplate(templateId)
      if (template) {
        setCurrentTemplate(template)
        
        // Create new form or load existing
        if (!currentFormData || currentFormData.templateId !== templateId) {
          createNewForm(templateId)
        }
      } else {
        navigate('/templates')
      }
    }
  }, [templateId, getTemplate, setCurrentTemplate, createNewForm, currentFormData, navigate])

  const handleSave = async () => {
    if (!currentFormData) return

    setIsSaving(true)
    try {
      await saveForm(currentFormData)
    } catch (error) {
      console.error('Save failed:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleExport = async () => {
    if (!currentTemplate || !currentFormData) return

    // Generate PDF export
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF()

    // Add title
    doc.setFontSize(20)
    doc.text(currentTemplate.name, 20, 30)

    // Add form data
    let yPosition = 50
    doc.setFontSize(12)

    currentTemplate.sections.forEach(section => {
      // Section title
      doc.setFontSize(14)
      doc.setFont(undefined, 'bold')
      doc.text(section.title, 20, yPosition)
      yPosition += 10

      doc.setFontSize(12)
      doc.setFont(undefined, 'normal')

      section.fields.forEach(field => {
        const value = currentFormData.values[field.id]
        if (value !== undefined && value !== null && value !== '') {
          const text = `${field.label}: ${value}`
          doc.text(text, 25, yPosition)
          yPosition += 8

          if (yPosition > 280) {
            doc.addPage()
            yPosition = 30
          }
        }
      })

      yPosition += 5
    })

    // Add metadata
    doc.setFontSize(10)
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, yPosition + 20)
    doc.text(`Template Version: ${currentTemplate.version}`, 20, yPosition + 30)

    // Save the PDF
    doc.save(`${currentTemplate.name.replace(/\s+/g, '_')}.pdf`)
  }

  const handleReset = () => {
    if (templateId && confirm('Are you sure you want to reset the form? All data will be lost.')) {
      createNewForm(templateId)
    }
  }

  if (!currentTemplate) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <p className="text-gray-600">Loading template...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              {currentTemplate.name}
            </h1>
            <p className="text-gray-600 mt-1">
              {currentTemplate.description}
            </p>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <span>Version {currentTemplate.version}</span>
              <span>•</span>
              <span>Est. {currentTemplate.estimatedTime} minutes</span>
              <span>•</span>
              <span className="capitalize">{currentTemplate.difficulty} difficulty</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="btn-secondary flex items-center space-x-2"
            >
              <Eye className="h-4 w-4" />
              <span>{showPreview ? 'Hide Preview' : 'Preview'}</span>
            </button>

            <button
              onClick={handleReset}
              className="btn-secondary flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Reset</span>
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn-secondary flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? 'Saving...' : 'Save'}</span>
            </button>

            <button
              onClick={handleExport}
              disabled={!validation.isValid}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-3">
          <DynamicFormRenderer
            template={currentTemplate}
            initialData={currentFormData || undefined}
            onValidationChange={setValidation}
            onProgressChange={setProgress}
          />
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Progress Card */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Completion</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-xs text-gray-600">
                {currentFormData?.completedFields.length || 0} of{' '}
                {currentTemplate.sections.reduce((total, section) => total + section.fields.length, 0)} fields completed
              </div>
            </div>
          </div>

          {/* Validation Status */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Validation</h3>
            <div className="space-y-2">
              {validation.isValid ? (
                <div className="flex items-center space-x-2 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Form is valid</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-red-600">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm">{Object.keys(validation.errors).length} errors</span>
                  </div>
                  {Object.keys(validation.warnings).length > 0 && (
                    <div className="flex items-center space-x-2 text-yellow-600">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm">{Object.keys(validation.warnings).length} warnings</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Template Info */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Template Info</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Category:</span>
                <span className="ml-2 font-medium">{currentTemplate.category}</span>
              </div>
              <div>
                <span className="text-gray-600">Version:</span>
                <span className="ml-2 font-medium">{currentTemplate.version}</span>
              </div>
              <div>
                <span className="text-gray-600">Last Updated:</span>
                <span className="ml-2 font-medium">
                  {currentTemplate.updatedAt.toLocaleDateString()}
                </span>
              </div>
              {currentTemplate.tags.length > 0 && (
                <div>
                  <span className="text-gray-600">Tags:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {currentTemplate.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && currentFormData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Form Preview</h2>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                {currentTemplate.sections.map(section => (
                  <div key={section.id} className="border-b border-gray-200 pb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {section.title}
                    </h3>
                    <div className="grid gap-4">
                      {section.fields.map(field => {
                        const value = currentFormData.values[field.id]
                        if (value === undefined || value === null || value === '') return null
                        
                        return (
                          <div key={field.id} className="flex justify-between">
                            <span className="text-gray-600">{field.label}:</span>
                            <span className="font-medium text-gray-900">
                              {Array.isArray(value) ? value.join(', ') : String(value)}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}