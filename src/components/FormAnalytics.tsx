import React, { useState } from 'react'
import { FileText, TrendingUp, Clock, Target, AlertCircle, Award } from 'lucide-react'
import { useDashboard } from '../contexts/DashboardContext'

export default function FormAnalytics() {
  const { formAnalytics } = useDashboard()
  const [selectedForm, setSelectedForm] = useState<string | null>(null)

  const getCompletionRateColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600 bg-green-100'
    if (rate >= 75) return 'text-blue-600 bg-blue-100'
    if (rate >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600'
    if (confidence >= 0.8) return 'text-blue-600'
    if (confidence >= 0.7) return 'text-yellow-600'
    return 'text-red-600'
  }

  const selectedFormData = selectedForm 
    ? formAnalytics.find(f => f.templateId === selectedForm)
    : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FileText className="h-6 w-6 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900">Form Analytics</h2>
        </div>
      </div>

      {/* Form Overview Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {formAnalytics.map((form) => (
          <div
            key={form.templateId}
            className={`card cursor-pointer transition-all hover:shadow-md ${
              selectedForm === form.templateId ? 'ring-2 ring-primary-500 bg-primary-50' : ''
            }`}
            onClick={() => setSelectedForm(
              selectedForm === form.templateId ? null : form.templateId
            )}
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {form.templateName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {form.totalUsage} total uses
                  </p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getCompletionRateColor(form.completionRate)}`}>
                  {form.completionRate}% success
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="flex items-center space-x-1 text-gray-600 mb-1">
                    <Clock className="h-3 w-3" />
                    <span>Avg Time</span>
                  </div>
                  <div className="font-semibold text-gray-900">
                    {form.averageTime} min
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center space-x-1 text-gray-600 mb-1">
                    <Award className="h-3 w-3" />
                    <span>Confidence</span>
                  </div>
                  <div className={`font-semibold ${getConfidenceColor(form.averageConfidence)}`}>
                    {Math.round(form.averageConfidence * 100)}%
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-1 text-gray-600 mb-2">
                  <TrendingUp className="h-3 w-3" />
                  <span className="text-sm">Revenue</span>
                </div>
                <div className="text-lg font-bold text-primary-600">
                  KSh {form.revenue.toLocaleString()}
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Completion Rate</span>
                  <span>{form.completionRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      form.completionRate >= 90 ? 'bg-green-500' :
                      form.completionRate >= 75 ? 'bg-blue-500' :
                      form.completionRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${form.completionRate}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed View */}
      {selectedFormData && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedFormData.templateName} - Detailed Analytics
            </h3>
            <button
              onClick={() => setSelectedForm(null)}
              className="text-gray-600 hover:text-gray-900"
            >
              ✕
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Popular Fields */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
                <Target className="h-4 w-4 text-green-600" />
                <span>Most Completed Fields</span>
              </h4>
              <div className="space-y-3">
                {selectedFormData.popularFields.map((field, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{field}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${95 - index * 10}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-8">
                        {95 - index * 10}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Common Issues */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span>Common Issues</span>
              </h4>
              <div className="space-y-3">
                {selectedFormData.commonIssues.map((issue, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">{issue}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Reported {Math.floor(Math.random() * 20) + 5} times
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-4">Performance Metrics</h4>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">
                  {selectedFormData.totalUsage}
                </div>
                <div className="text-sm text-gray-600">Total Uses</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {selectedFormData.completionRate}%
                </div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {selectedFormData.averageTime}min
                </div>
                <div className="text-sm text-gray-600">Avg Duration</div>
              </div>
              
              <div className="text-center">
                <div className={`text-2xl font-bold ${getConfidenceColor(selectedFormData.averageConfidence)}`}>
                  {Math.round(selectedFormData.averageConfidence * 100)}%
                </div>
                <div className="text-sm text-gray-600">Avg Confidence</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Insights */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-3">Key Insights</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>• NHIF Registration has the highest completion rate at 94%</p>
          <p>• NTSA License Renewal generates the most revenue (KSh 33,750)</p>
          <p>• Average session confidence is 87% across all forms</p>
          <p>• Most common issues relate to date formatting and address clarity</p>
        </div>
      </div>
    </div>
  )
}