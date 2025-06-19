import React, { useState } from 'react'
import { 
  Eye, 
  EyeOff, 
  Type, 
  Volume2, 
  VolumeX, 
  Smartphone, 
  Monitor,
  Settings,
  RotateCcw,
  Plus,
  Minus,
  Contrast,
  Languages
} from 'lucide-react'
import { useAccessibility } from '../contexts/AccessibilityContext'

export default function AccessibilityToolbar() {
  const {
    settings,
    toggleHighContrast,
    toggleLargeText,
    toggleAudioPrompts,
    toggleSimplifiedLanguage,
    toggleTouchMode,
    increaseFontSize,
    decreaseFontSize,
    resetSettings,
    announceToScreenReader
  } = useAccessibility()

  const [isExpanded, setIsExpanded] = useState(false)

  const handleToggle = (action: () => void, message: string) => {
    action()
    announceToScreenReader(message)
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Main toggle button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="btn-icon bg-primary-600 text-white shadow-lg hover:bg-primary-700 mb-2"
        aria-label="Accessibility settings"
        aria-expanded={isExpanded}
      >
        <Settings className="h-6 w-6" />
      </button>

      {/* Expanded toolbar */}
      {isExpanded && (
        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-4 space-y-3 min-w-[280px]">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Accessibility Settings
          </h3>

          {/* High Contrast */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
              <Contrast className="h-4 w-4" />
              <span>High Contrast</span>
            </label>
            <button
              onClick={() => handleToggle(toggleHighContrast, 
                settings.highContrast ? 'High contrast disabled' : 'High contrast enabled'
              )}
              className={`btn-icon ${settings.highContrast ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'}`}
              aria-pressed={settings.highContrast}
            >
              {settings.highContrast ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
          </div>

          {/* Font Size */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
              <Type className="h-4 w-4" />
              <span>Text Size</span>
            </label>
            <div className="flex space-x-1">
              <button
                onClick={() => handleToggle(decreaseFontSize, 'Text size decreased')}
                className="btn-icon bg-gray-200 text-gray-600 text-sm"
                aria-label="Decrease text size"
              >
                <Minus className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleToggle(increaseFontSize, 'Text size increased')}
                className="btn-icon bg-gray-200 text-gray-600 text-sm"
                aria-label="Increase text size"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Audio Prompts */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
              <Volume2 className="h-4 w-4" />
              <span>Audio Prompts</span>
            </label>
            <button
              onClick={() => handleToggle(toggleAudioPrompts,
                settings.audioPrompts ? 'Audio prompts disabled' : 'Audio prompts enabled'
              )}
              className={`btn-icon ${settings.audioPrompts ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'}`}
              aria-pressed={settings.audioPrompts}
            >
              {settings.audioPrompts ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
          </div>

          {/* Simple Language */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
              <Languages className="h-4 w-4" />
              <span>Simple Language</span>
            </label>
            <button
              onClick={() => handleToggle(toggleSimplifiedLanguage,
                settings.simplifiedLanguage ? 'Simple language disabled' : 'Simple language enabled'
              )}
              className={`btn-icon ${settings.simplifiedLanguage ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'}`}
              aria-pressed={settings.simplifiedLanguage}
            >
              <Languages className="h-4 w-4" />
            </button>
          </div>

          {/* Touch Mode */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
              <Smartphone className="h-4 w-4" />
              <span>Touch Mode</span>
            </label>
            <button
              onClick={() => handleToggle(toggleTouchMode,
                settings.touchMode ? 'Touch mode disabled' : 'Touch mode enabled'
              )}
              className={`btn-icon ${settings.touchMode ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'}`}
              aria-pressed={settings.touchMode}
            >
              {settings.touchMode ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
            </button>
          </div>

          {/* Reset */}
          <div className="pt-3 border-t border-gray-200">
            <button
              onClick={() => handleToggle(resetSettings, 'Accessibility settings reset to default')}
              className="btn-secondary w-full flex items-center justify-center space-x-2 text-sm py-2"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset Settings</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}