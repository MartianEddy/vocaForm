import React, { useState, useEffect } from 'react'
import { Mic, MicOff, Volume2, AlertCircle } from 'lucide-react'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { useLanguage } from '../contexts/LanguageContext'

interface VoiceRecorderProps {
  onTranscript: (text: string, confidence: number) => void
  placeholder?: string
  className?: string
}

export default function VoiceRecorder({ onTranscript, placeholder, className = '' }: VoiceRecorderProps) {
  const { t } = useLanguage()
  const {
    isSupported,
    isListening,
    transcript,
    confidence,
    startListening,
    stopListening,
    resetTranscript,
    error
  } = useSpeechRecognition()

  const [hasTranscript, setHasTranscript] = useState(false)

  useEffect(() => {
    if (transcript && transcript.trim()) {
      setHasTranscript(true)
      onTranscript(transcript.trim(), confidence)
    }
  }, [transcript, confidence, onTranscript])

  const handleToggleRecording = () => {
    if (isListening) {
      stopListening()
    } else {
      resetTranscript()
      setHasTranscript(false)
      startListening()
    }
  }

  if (!isSupported) {
    return (
      <div className={`card ${className}`}>
        <div className="flex items-center space-x-3 text-amber-600">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm">
            Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`card ${className}`}>
      <div className="space-y-4">
        {/* Recording Button */}
        <div className="flex justify-center">
          <button
            onClick={handleToggleRecording}
            className={`relative p-6 rounded-full transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-2 ${
              isListening
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500 recording-pulse'
                : 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500'
            }`}
            aria-label={isListening ? t('form.stopRecording') : t('form.startRecording')}
          >
            {isListening ? (
              <MicOff className="h-8 w-8 text-white" />
            ) : (
              <Mic className="h-8 w-8 text-white" />
            )}
            
            {/* Recording indicator */}
            {isListening && (
              <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping" />
            )}
          </button>
        </div>

        {/* Status */}
        <div className="text-center">
          {isListening ? (
            <div className="flex items-center justify-center space-x-2 text-red-600">
              <Volume2 className="h-4 w-4 animate-pulse" />
              <span className="text-sm font-medium">{t('form.listening')}</span>
            </div>
          ) : hasTranscript ? (
            <span className="text-sm text-green-600 font-medium">
              {t('common.success')} - {t('form.confidence')}: {Math.round(confidence * 100)}%
            </span>
          ) : (
            <span className="text-sm text-gray-500">
              {placeholder || t('form.startRecording')}
            </span>
          )}
        </div>

        {/* Transcript Display */}
        {transcript && (
          <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-primary-500">
            <p className="text-sm text-gray-700 italic">"{transcript}"</p>
            {confidence > 0 && (
              <div className="mt-2 flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      confidence > 0.8 ? 'bg-green-500' : 
                      confidence > 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${confidence * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500">
                  {Math.round(confidence * 100)}%
                </span>
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Error: {error}</span>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-gray-500 text-center space-y-1">
          <p>Click the microphone to start recording</p>
          <p>Speak clearly and at normal pace</p>
        </div>
      </div>
    </div>
  )
}