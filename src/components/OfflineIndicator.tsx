import React from 'react'
import { Wifi, WifiOff, Upload, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { useOfflineForm } from '../hooks/useOfflineForm'
import { useAccessibility } from '../contexts/AccessibilityContext'

export default function OfflineIndicator() {
  const { isOnline, pendingSync, syncOfflineForms } = useOfflineForm()
  const { settings, announceToScreenReader } = useAccessibility()

  const handleSyncClick = () => {
    syncOfflineForms()
    announceToScreenReader(settings.simplifiedLanguage ? 'Syncing forms' : 'Attempting to sync offline forms')
  }

  return (
    <div className={`fixed bottom-4 left-4 z-50 ${settings.touchMode ? 'bottom-6 left-6' : 'bottom-4 left-4'}`}>
      <div className={`flex items-center space-x-3 px-4 py-3 rounded-xl shadow-lg transition-all ${
        isOnline 
          ? 'bg-green-100 border-2 border-green-300 text-green-800'
          : 'bg-red-100 border-2 border-red-300 text-red-800'
      }`}>
        {/* Connection Status */}
        <div className="flex items-center space-x-2">
          {isOnline ? (
            <Wifi className="h-5 w-5" />
          ) : (
            <WifiOff className="h-5 w-5" />
          )}
          <span className="font-medium">
            {isOnline 
              ? (settings.simplifiedLanguage ? 'Online' : 'Connected')
              : (settings.simplifiedLanguage ? 'Offline' : 'No Connection')
            }
          </span>
        </div>

        {/* Sync Status */}
        {pendingSync > 0 && (
          <>
            <div className="w-px h-6 bg-gray-300" />
            <div className="flex items-center space-x-2">
              {isOnline ? (
                <button
                  onClick={handleSyncClick}
                  className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  aria-label={`Sync ${pendingSync} pending forms`}
                >
                  <Upload className="h-4 w-4" />
                  <span className="font-medium">
                    {settings.simplifiedLanguage ? 'Sync' : 'Sync'} ({pendingSync})
                  </span>
                </button>
              ) : (
                <div className="flex items-center space-x-2 text-yellow-700">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">
                    {pendingSync} {settings.simplifiedLanguage ? 'waiting' : 'pending'}
                  </span>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Offline Mode Explanation */}
      {!isOnline && (
        <div className="mt-3 bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 max-w-sm">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-yellow-800 mb-1">
                {settings.simplifiedLanguage ? 'Working Offline' : 'Offline Mode'}
              </h4>
              <p className="text-sm text-yellow-700">
                {settings.simplifiedLanguage 
                  ? 'You can still fill forms. They will save when internet comes back.'
                  : 'You can continue filling forms. They will sync automatically when connection is restored.'
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}