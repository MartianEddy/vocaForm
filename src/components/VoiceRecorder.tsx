import React, { useState, useEffect } from 'react'
import { 
  Mic, 
  MicOff, 
  Volume2, 
  AlertCircle, 
  Play, 
  RotateCcw, 
  CheckCircle, 
  AlertTriangle,
  Settings,
  Headphones
} from 'lucide-react'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { useLanguage } from '../contexts/LanguageContext'

interface VoiceRecorderProps {
  onTranscript: (text: string, confidence: number) => void
  placeholder?: string
  className?: string
}

export default function VoiceRecorder({ onTranscript, placeholder, className = '' }: VoiceRecorderProps) {
  const { t } = useLanguage()
  const [showSettings, setShowSettings] = useState(false)
  const [selectedAlternative, setSelectedAlternative] = useState<string | null>(null)
  
  const {
    isSupported,
    isListening,
    transcript,
    confidence,
    confidenceLevel,
    startListening,
    stopListening,
    resetTranscript,
    retryRecording,
    error,
    noiseLevel,
    isNoisy,
    canPlayback,
    playbackTranscript,
    isPlaying,
    retryCount,
    maxRetries,
    needsRetry,
    alternativeTranscripts,
    selectedLanguage,
    setLanguage,
    supportedLanguages
  } = useSpeechRecognition()

  useEffect(() => {
    if (transcript && transcript.trim() && !needsRetry) {
      const finalTranscript = selectedAlternative || transcript.trim()
      onTranscript(finalTranscript, confidence)
      setSelectedAlternative(null)
    }
  }, [transcript, confidence, onTranscript, needsRetry, selectedAlternative])

  const handleToggleRecording = () => {
    if (isListening) {
      stopListening()
    } else {
      resetTranscript()
      setSelectedAlternative(null)
      startListening()
    }
  }

  const handleSelectAlternative = (alternative: string) => {
    setSelectedAlternative(alternative)
    onTranscript(alternative, confidence)
  }

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'medium':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'low':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'very-low':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getConfidenceIcon = (level: string) => {
    switch (level) {
      case 'high':
        return <CheckCircle className="h-4 w-4" />
      case 'medium':
        return <CheckCircle className="h-4 w-4" />
      case 'low':
        return <AlertTriangle className="h-4 w-4" />
      case 'very-low':
        return <AlertCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  const getNoiseIndicator = () => {
    if (noiseLevel === 0) return null
    
    const intensity = Math.min(noiseLevel * 100, 100)
    const color = isNoisy ? 'bg-red-500' : 'bg-green-500'
    
    return (
      <div className="flex items-center space-x-2 text-xs">
        <span className={isNoisy ? 'text-red-600' : 'text-green-600'}>
          {isNoisy ? 'Noisy' : 'Clear'}
        </span>
        <div className="w-16 bg-gray-200 rounded-full h-1">
          <div
            className={`h-1 rounded-full transition-all duration-200 ${color}`}
            style={{ width: `${intensity}%` }}
          />
        </div>
      </div>
    )
  }

  if (!isSupported) {
    return (
      <div className={`card ${className}`}>
        <div className="flex items-center space-x-3 text-amber-600">
          <AlertCircle className="h-5 w-5" />
          <div>
            <p className="text-sm font-medium">Speech recognition not supported</p>
            <p className="text-xs text-gray-600">Please use Chrome, Edge, or Safari for voice features</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`card ${className}`}>
      <div className="space-y-4">
        {/* Settings Toggle */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Voice Input</h3>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            title="Voice Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>

        {/* Language Settings */}
        {showSettings && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h4 className="text-sm font-medium text-gray-900">Language & Accent</h4>
            <select
              value={selectedLanguage}
              onChange={(e) => setLanguage(e.target.value)}
              className="form-input text-sm"
            >
              {supportedLanguages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name} {lang.accent && `(${lang.accent})`}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-600">
              Select your preferred language and accent for better recognition accuracy
            </p>
          </div>
        )}

        {/* Recording Button */}
        <div className="flex justify-center">
          <button
            onClick={handleToggleRecording}
            className={`relative p-8 rounded-full transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-2 ${
              isListening
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500 recording-pulse'
                : 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500'
            }`}
            aria-label={isListening ? t('form.stopRecording') : t('form.startRecording')}
          >
            {isListening ? (
              <MicOff className="h-10 w-10 text-white" />
            ) : (
              <Mic className="h-10 w-10 text-white" />
            )}
            
            {/* Recording indicator */}
            {isListening && (
              <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping" />
            )}
          </button>
        </div>

        {/* Status and Noise Indicator */}
        <div className="text-center space-y-2">
          {isListening ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-2 text-red-600">
                <Volume2 className="h-4 w-4 animate-pulse" />
                <span className="text-sm font-medium">{t('form.listening')}</span>
              </div>
              {getNoiseIndicator()}
              {isNoisy && (
                <p className="text-xs text-red-600">
                  High background noise detected. Try moving to a quieter location.
                </p>
              )}
            </div>
          ) : transcript ? (
            <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border text-sm font-medium ${getConfidenceColor(confidenceLevel)}`}>
              {getConfidenceIcon(confidenceLevel)}
              <span>
                {confidenceLevel.charAt(0).toUpperCase() + confidenceLevel.slice(1)} confidence ({Math.round(confidence * 100)}%)
              </span>
            </div>
          ) : (
            <span className="text-sm text-gray-500">
              {placeholder || t('form.startRecording')}
            </span>
          )}
        </div>

        {/* Transcript Display */}
        {transcript && (
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-primary-500">
              <div className="flex items-start justify-between">
                <p className="text-sm text-gray-700 italic flex-1">"{selectedAlternative || transcript}"</p>
                {canPlayback && (
                  <button
                    onClick={playbackTranscript}
                    disabled={isPlaying}
                    className="ml-3 p-1 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors disabled:opacity-50"
                    title="Play back transcript"
                  >
                    {isPlaying ? (
                      <Headphones className="h-4 w-4 animate-pulse" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </button>
                )}
              </div>
              
              {/* Confidence Bar */}
              <div className="mt-3 flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      confidenceLevel === 'high' ? 'bg-green-500' : 
                      confidenceLevel === 'medium' ? 'bg-blue-500' :
                      confidenceLevel === 'low' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${confidence * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 min-w-[3rem]">
                  {Math.round(confidence * 100)}%
                </span>
              </div>
            </div>

            {/* Alternative Transcripts */}
            {alternativeTranscripts.length > 1 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Alternative suggestions:</p>
                <div className="space-y-1">
                  {alternativeTranscripts.slice(1, 4).map((alternative, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectAlternative(alternative)}
                      className="w-full text-left p-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded border border-gray-200 transition-colors"
                    >
                      "{alternative}"
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Retry Section */}
            {needsRetry && retryCount < maxRetries && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-yellow-700">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm">Low confidence detected</span>
                  </div>
                  <button
                    onClick={retryRecording}
                    className="flex items-center space-x-1 px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 transition-colors"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Retry ({retryCount + 1}/{maxRetries})</span>
                  </button>
                </div>
                <p className="text-xs text-yellow-600 mt-1">
                  The transcription might not be accurate. Try speaking more clearly or closer to the microphone.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Error</span>
            </div>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-gray-500 text-center space-y-1">
          <p>• Click the microphone to start recording</p>
          <p>• Speak clearly and at normal pace</p>
          <p>• Use the retry button if confidence is low</p>
          {canPlayback && <p>• Click play to hear your transcript</p>}
        </div>
      </div>
    </div>
  )
}