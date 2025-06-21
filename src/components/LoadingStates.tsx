import React from 'react'
import { useAccessibility } from '../contexts/AccessibilityContext'
import { useNetworkOptimization } from '../hooks/useNetworkOptimization'

interface SkeletonProps {
  className?: string
  animate?: boolean
}

export function Skeleton({ className = '', animate = true }: SkeletonProps) {
  const { shouldEnableAnimations } = useNetworkOptimization()
  
  return (
    <div 
      className={`bg-gray-200 rounded ${animate && shouldEnableAnimations() ? 'animate-pulse' : ''} ${className}`}
      aria-hidden="true"
    />
  )
}

export function FormFieldSkeleton() {
  const { settings } = useAccessibility()
  
  return (
    <div className={`card space-y-4 ${settings.touchMode ? 'p-8' : 'p-6'}`}>
      <div className="flex items-center space-x-3">
        <Skeleton className="w-8 h-8 rounded-full" />
        <Skeleton className="h-6 w-32" />
      </div>
      <Skeleton className="h-16 w-full rounded-xl" />
      <div className="flex space-x-3">
        <Skeleton className="h-12 w-24 rounded-lg" />
        <Skeleton className="h-12 w-24 rounded-lg" />
      </div>
    </div>
  )
}

export function FormTemplateSkeleton() {
  const { settings } = useAccessibility()
  
  return (
    <div className={`card space-y-4 ${settings.touchMode ? 'p-8' : 'p-6'}`}>
      <div className="flex items-center space-x-3">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-12 w-full rounded-lg" />
    </div>
  )
}

export function DashboardStatsSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="card space-y-4">
          <div className="flex items-center space-x-3">
            <Skeleton className="w-12 h-12 rounded-lg" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  )
}

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const { shouldEnableAnimations } = useNetworkOptimization()
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }
  
  return (
    <div 
      className={`${sizeClasses[size]} border-2 border-gray-200 border-t-primary-600 rounded-full ${
        shouldEnableAnimations() ? 'animate-spin' : ''
      } ${className}`}
      role="status"
      aria-label="Loading"
    />
  )
}

interface ProgressBarProps {
  progress: number
  className?: string
  showPercentage?: boolean
}

export function ProgressBar({ progress, className = '', showPercentage = true }: ProgressBarProps) {
  const { settings } = useAccessibility()
  
  return (
    <div className={`space-y-2 ${className}`}>
      {showPercentage && (
        <div className="flex justify-between text-sm">
          <span className="font-medium text-gray-700">Progress</span>
          <span className="text-gray-600">{Math.round(progress)}%</span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="bg-primary-600 h-3 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(progress, 100)}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  )
}

interface ConnectionStatusProps {
  isOnline: boolean
  className?: string
}

export function ConnectionStatus({ isOnline, className = '' }: ConnectionStatusProps) {
  const { settings } = useAccessibility()
  
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div 
        className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}
        aria-hidden="true"
      />
      <span className={`text-sm font-medium ${
        isOnline ? 'text-green-700' : 'text-red-700'
      }`}>
        {isOnline 
          ? (settings.simplifiedLanguage ? 'Online' : 'Connected')
          : (settings.simplifiedLanguage ? 'Offline' : 'No Connection')
        }
      </span>
    </div>
  )
}

interface DataSaverBadgeProps {
  className?: string
}

export function DataSaverBadge({ className = '' }: DataSaverBadgeProps) {
  const { networkInfo } = useNetworkOptimization()
  const { settings } = useAccessibility()
  
  if (!networkInfo?.saveData) return null
  
  return (
    <div className={`inline-flex items-center space-x-1 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium ${className}`}>
      <span>📊</span>
      <span>{settings.simplifiedLanguage ? 'Data Saver' : 'Data Saver Mode'}</span>
    </div>
  )
}

interface NetworkSpeedIndicatorProps {
  className?: string
}

export function NetworkSpeedIndicator({ className = '' }: NetworkSpeedIndicatorProps) {
  const { networkInfo, isSlowConnection } = useNetworkOptimization()
  const { settings } = useAccessibility()
  
  if (!networkInfo) return null
  
  const getSpeedColor = () => {
    if (isSlowConnection()) return 'text-red-600 bg-red-100'
    if (networkInfo.effectiveType === '3g') return 'text-yellow-600 bg-yellow-100'
    return 'text-green-600 bg-green-100'
  }
  
  const getSpeedIcon = () => {
    if (isSlowConnection()) return '🐌'
    if (networkInfo.effectiveType === '3g') return '🚶'
    return '🚀'
  }
  
  return (
    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getSpeedColor()} ${className}`}>
      <span>{getSpeedIcon()}</span>
      <span>
        {settings.simplifiedLanguage 
          ? networkInfo.effectiveType.toUpperCase()
          : `${networkInfo.effectiveType.toUpperCase()} Network`
        }
      </span>
    </div>
  )
}