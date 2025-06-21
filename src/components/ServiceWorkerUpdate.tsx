import React, { useState } from 'react'
import { RefreshCw, Download, X } from 'lucide-react'
import { useServiceWorker } from '../hooks/useServiceWorker'
import { useAccessibility } from '../contexts/AccessibilityContext'

export default function ServiceWorkerUpdate() {
  const { isWaiting, updateServiceWorker } = useServiceWorker()
  const { settings, announceToScreenReader } = useAccessibility()
  const [isDismissed, setIsDismissed] = useState(false)

  if (!isWaiting || isDismissed) return null

  const handleUpdate = () => {
    updateServiceWorker()
    announceToScreenReader(
      settings.simplifiedLanguage 
        ? 'Updating app...' 
        : 'Updating to latest version...'
    )
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    announceToScreenReader(
      settings.simplifiedLanguage 
        ? 'Update dismissed' 
        : 'Update notification dismissed'
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-blue-600 text-white rounded-xl shadow-lg p-4">
        <div className="flex items-start space-x-3">
          <Download className="h-6 w-6 text-blue-200 flex-shrink-0 mt-0.5" />
          
          <div className="flex-1">
            <h4 className={`font-bold mb-1 ${settings.touchMode ? 'text-lg' : 'text-base'}`}>
              {settings.simplifiedLanguage ? 'App Update Ready' : 'New Version Available'}
            </h4>
            <p className={`text-blue-100 mb-3 ${settings.touchMode ? 'text-base' : 'text-sm'}`}>
              {settings.simplifiedLanguage 
                ? 'A new version is ready. Update now for the latest features.'
                : 'A new version of VocaForm is ready with improvements and bug fixes.'
              }
            </p>
            
            <div className="flex space-x-2">
              <button
                onClick={handleUpdate}
                className={`bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-colors flex items-center space-x-2 ${
                  settings.touchMode ? 'px-4 py-3 text-base' : 'px-3 py-2 text-sm'
                }`}
              >
                <RefreshCw className="h-4 w-4" />
                <span>{settings.simplifiedLanguage ? 'Update Now' : 'Update Now'}</span>
              </button>
              
              <button
                onClick={handleDismiss}
                className={`text-blue-200 hover:text-white transition-colors ${
                  settings.touchMode ? 'p-3' : 'p-2'
                }`}
                aria-label={settings.simplifiedLanguage ? 'Close' : 'Dismiss update'}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}