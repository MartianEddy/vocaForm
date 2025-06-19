import React from 'react'
import { CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react'

interface ConfidenceIndicatorProps {
  confidence: number
  level: 'high' | 'medium' | 'low' | 'very-low'
  showDetails?: boolean
  className?: string
}

export default function ConfidenceIndicator({ 
  confidence, 
  level, 
  showDetails = false, 
  className = '' 
}: ConfidenceIndicatorProps) {
  const getConfig = (level: string) => {
    switch (level) {
      case 'high':
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          barColor: 'bg-green-500',
          icon: CheckCircle,
          label: 'High Confidence',
          description: 'Transcription is very reliable'
        }
      case 'medium':
        return {
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          barColor: 'bg-blue-500',
          icon: Info,
          label: 'Medium Confidence',
          description: 'Transcription is mostly reliable'
        }
      case 'low':
        return {
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          barColor: 'bg-yellow-500',
          icon: AlertTriangle,
          label: 'Low Confidence',
          description: 'Please review transcription'
        }
      case 'very-low':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          barColor: 'bg-red-500',
          icon: AlertCircle,
          label: 'Very Low Confidence',
          description: 'Transcription may be inaccurate'
        }
      default:
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          barColor: 'bg-gray-500',
          icon: Info,
          label: 'Unknown',
          description: 'Confidence level unknown'
        }
    }
  }

  const config = getConfig(level)
  const Icon = config.icon
  const percentage = Math.round(confidence * 100)

  if (showDetails) {
    return (
      <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-3 ${className}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Icon className={`h-4 w-4 ${config.color}`} />
            <span className={`text-sm font-medium ${config.color}`}>
              {config.label}
            </span>
          </div>
          <span className={`text-sm font-bold ${config.color}`}>
            {percentage}%
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${config.barColor}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        <p className={`text-xs ${config.color}`}>
          {config.description}
        </p>
      </div>
    )
  }

  return (
    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border text-sm font-medium ${config.color} ${config.bgColor} ${config.borderColor} ${className}`}>
      <Icon className="h-4 w-4" />
      <span>{percentage}%</span>
    </div>
  )
}