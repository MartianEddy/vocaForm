import React, { useState, useEffect } from 'react'
import { Volume2, VolumeX, Settings } from 'lucide-react'
import { useVoiceGuidance } from '../lib/elevenlabs'
import { useAuth } from '../contexts/AuthContext'

interface VoiceGuidanceProps {
  fieldLabel: string
  fieldType: string
  isRequired: boolean
  isActive: boolean
  value?: string
  confidence?: number
  errors?: string[]
  className?: string
}

export default function VoiceGuidance({
  fieldLabel,
  fieldType,
  isRequired,
  isActive,
  value,
  confidence,
  errors = [],
  className = ''
}: VoiceGuidanceProps) {
  const { profile } = useAuth()
  const { playFieldPrompt, playConfirmation, playError, playCustomMessage, isAvailable } = useVoiceGuidance()
  const [isEnabled, setIsEnabled] = useState(true)
  const [hasPlayedPrompt, setHasPlayedPrompt] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  // Voice guidance settings from user preferences
  const voiceSettings = profile?.preferences?.voice_guidance || {
    enabled: true,
    auto_prompt: true,
    confirmation_threshold: 0.7,
    error_guidance: true
  }

  useEffect(() => {
    setIsEnabled(voiceSettings.enabled && isAvailable)
  }, [voiceSettings.enabled, isAvailable])

  // Auto-play field prompt when field becomes active
  useEffect(() => {
    if (isActive && isEnabled && voiceSettings.auto_prompt && !hasPlayedPrompt) {
      const timer = setTimeout(() => {
        playFieldPrompt(fieldLabel, fieldType, isRequired)
        setHasPlayedPrompt(true)
      }, 500) // Small delay to avoid interrupting user

      return () => clearTimeout(timer)
    }
  }, [isActive, isEnabled, voiceSettings.auto_prompt, hasPlayedPrompt, fieldLabel, fieldType, isRequired, playFieldPrompt])

  // Play confirmation for low confidence values
  useEffect(() => {
    if (value && confidence !== undefined && confidence < voiceSettings.confirmation_threshold && isEnabled) {
      playConfirmation(fieldLabel, value, confidence)
    }
  }, [value, confidence, voiceSettings.confirmation_threshold, isEnabled, fieldLabel, playConfirmation])

  // Play error guidance
  useEffect(() => {
    if (errors.length > 0 && isEnabled && voiceSettings.error_guidance) {
      const errorType = errors[0].includes('required') ? 'required' : 'invalid_format'
      playError(fieldLabel, errorType)
    }
  }, [errors, isEnabled, voiceSettings.error_guidance, fieldLabel, playError])

  // Reset prompt state when field changes
  useEffect(() => {
    setHasPlayedPrompt(false)
  }, [fieldLabel])

  const handleManualPrompt = () => {
    if (isEnabled) {
      playFieldPrompt(fieldLabel, fieldType, isRequired)
    }
  }

  const handleToggleGuidance = () => {
    setIsEnabled(!isEnabled)
    // TODO: Update user preferences
  }

  if (!isAvailable) {
    return null
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Voice guidance toggle */}
      <button
        onClick={handleToggleGuidance}
        className={`p-2 rounded-lg transition-colors ${
          isEnabled 
            ? 'text-primary-600 bg-primary-50 hover:bg-primary-100' 
            : 'text-gray-400 bg-gray-50 hover:bg-gray-100'
        }`}
        title={isEnabled ? 'Disable voice guidance' : 'Enable voice guidance'}
      >
        {isEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
      </button>

      {/* Manual prompt button */}
      {isEnabled && (
        <button
          onClick={handleManualPrompt}
          className="px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors"
          title="Replay field instructions"
        >
          Replay
        </button>
      )}

      {/* Settings button */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
        title="Voice guidance settings"
      >
        <Settings className="h-3 w-3" />
      </button>

      {/* Settings panel */}
      {showSettings && (
        <div className="absolute z-10 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Voice Guidance Settings</h4>
          
          <div className="space-y-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={voiceSettings.auto_prompt}
                onChange={(e) => {
                  // TODO: Update user preferences
                }}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Auto-play field prompts</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={voiceSettings.error_guidance}
                onChange={(e) => {
                  // TODO: Update user preferences
                }}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Error guidance</span>
            </label>
            
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Confirmation threshold: {Math.round(voiceSettings.confirmation_threshold * 100)}%
              </label>
              <input
                type="range"
                min="0.5"
                max="0.9"
                step="0.1"
                value={voiceSettings.confirmation_threshold}
                onChange={(e) => {
                  // TODO: Update user preferences
                }}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}