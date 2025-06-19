import React from 'react'
import { Link } from 'react-router-dom'
import { FileText, ArrowRight, Clock, CheckCircle } from 'lucide-react'
import { useForm } from '../contexts/FormContext'
import { useLanguage } from '../contexts/LanguageContext'

export default function FormTemplates() {
  const { templates } = useForm()
  const { t } = useLanguage()

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'transport':
        return '🚗'
      case 'health':
        return '🏥'
      case 'social security':
        return '🛡️'
      default:
        return '📋'
    }
  }

  const getEstimatedTime = (fieldCount: number) => {
    // Estimate 30 seconds per field
    const minutes = Math.ceil((fieldCount * 30) / 60)
    return `${minutes} min`
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {t('nav.templates')}
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Choose from our pre-built templates for East African government forms. 
          Each template is optimized for voice input and includes all required fields.
        </p>
      </div>

      {/* Templates Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {templates.map((template) => (
          <div key={template.id} className="card hover:shadow-lg transition-all duration-200 group">
            <div className="space-y-4">
              {/* Template Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">
                    {getCategoryIcon(template.category)}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {template.category}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-600">
                {template.description}
              </p>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <FileText className="h-4 w-4" />
                  <span>{template.fields.length} fields</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{getEstimatedTime(template.fields.length)}</span>
                </div>
              </div>

              {/* Required Fields Preview */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Required Fields:</p>
                <div className="space-y-1">
                  {template.fields
                    .filter(field => field.required)
                    .slice(0, 3)
                    .map((field) => (
                      <div key={field.id} className="flex items-center space-x-2 text-sm text-gray-600">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>{field.label}</span>
                      </div>
                    ))}
                  {template.fields.filter(field => field.required).length > 3 && (
                    <p className="text-xs text-gray-500 ml-5">
                      +{template.fields.filter(field => field.required).length - 3} more...
                    </p>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <Link
                to={`/form/${template.id}`}
                className="btn-primary w-full flex items-center justify-center space-x-2 group-hover:bg-primary-700 transition-colors"
              >
                <span>Start Form</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Help Section */}
      <div className="mt-16 bg-primary-50 rounded-xl p-8">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Need Help Getting Started?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our voice-powered form filling is designed to be intuitive. Simply select a template, 
            click the microphone button, and speak your information clearly. The system will 
            automatically fill in the form fields for you.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="text-center space-y-2">
              <div className="bg-primary-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">1️⃣</span>
              </div>
              <h3 className="font-semibold text-gray-900">Choose Template</h3>
              <p className="text-sm text-gray-600">Select the form you need to fill</p>
            </div>
            <div className="text-center space-y-2">
              <div className="bg-primary-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">2️⃣</span>
              </div>
              <h3 className="font-semibold text-gray-900">Speak Clearly</h3>
              <p className="text-sm text-gray-600">Use the microphone to input your data</p>
            </div>
            <div className="text-center space-y-2">
              <div className="bg-primary-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">3️⃣</span>
              </div>
              <h3 className="font-semibold text-gray-900">Export & Submit</h3>
              <p className="text-sm text-gray-600">Download your completed form as PDF</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}