import React, { useState, useEffect } from 'react'
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Play, 
  RotateCcw, 
  CheckCircle, 
  AlertTriangle,
  AlertCircle,
  Headphones
} from 'lucide-react'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { useAccessibility } from '../contexts/AccessibilityContext'
import { useVoiceGuidance } from '../lib/elevenlabs'

interface AccessibleVoiceRecorderProps {
  onTranscript: (text: string, confidence: number) => void
  fieldLabel: string
  fieldType: string
  isRequired: boolean
  placeholder?: string
  className?: string
}

export default function AccessibleVoiceRecorder({
  onTranscript,
  fieldLabel,
  fieldType,
  isRequired,
  placeholder,
  className = ''
}: AccessibleVoiceRecorderProps) {
  const { settings, announceToScreenReader } = useAccessibility()
  const { playFieldPrompt, playCustomMessage, isAvailable } = useVoiceGuidance()
  const [hasPlayedIntro, setHasPlayedIntro] = useState(false)
  
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
    isNoisy,
    canPlayback,
    playbackTranscript,
    isPlaying,
    retryCount,
    maxRetries,
    needsRetry,
    alternativeTranscripts
  } = useSpeechRecognition()

  // Auto-play field introduction when component mounts
  useEffect(() => {
    if (settings.audioPrompts && isAvailable && !hasPlayedIntro) {
      const timer = setTimeout(() => {
        const introMessage = settings.simplifiedLanguage 
          ? `Say your ${fieldLabel.toLowerCase()}`
          : `Please provide your ${fieldLabel.toLowerCase()}. ${isRequired ? 'This field is required.' : ''}`
        
        playCustomMessage(introMessage)
        setHasPlayedIntro(true)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [settings.audioPrompts, isAvailable, hasPlayedIntro, fieldLabel, isRequired, playCustomMessage, settings.simplifiedLanguage])

  useEffect(() => {
    if (transcript && transcript.trim() && !needsRetry) {
      onTranscript(transcript.trim(), confidence)
      
      if (settings.audioPrompts) {
        const message = settings.simplifiedLanguage 
          ? 'Got it!' 
          : `I heard: ${transcript.trim()}`
        announceToScreenReader(message)
      }
    }
  }, [transcript, confidence, onTranscript, needsRetry, settings.audioPrompts, settings.simplifiedLanguage, announceToScreenReader])

  const handleToggleRecording = () => {
    if (isListening) {
      stopListening()
      announceToScreenReader(settings.simplifiedLanguage ? 'Stopped listening' : 'Recording stopped')
    } else {
      resetTranscript()
      startListening()
      announceToScreenReader(settings.simplifiedLanguage ? 'Listening now' : 'Recording started, please speak')
    }
  }

  const handlePlayInstructions = () => {
    if (settings.audioPrompts && isAvailable) {
      const message = settings.simplifiedLanguage
        ? `Say your ${fieldLabel.toLowerCase()}`
        : `Please speak your ${fieldLabel.toLowerCase()} clearly into the microphone`
      
      playCustomMessage(message)
    }
  }

  const handleRetry = () => {
    retryRecording()
    announceToScreenReader(settings.simplifiedLanguage ? 'Trying again' : 'Retrying voice input')
  }

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'text-green-600 bg-green-100 border-green-300'
      case 'medium':
        return 'text-blue-600 bg-blue-100 border-blue-300'
      case 'low':
        return 'text-yellow-600 bg-yellow-100 border-yellow-300'
      case 'very-low':
        return 'text-red-600 bg-red-100 border-red-300'
      default:
        return 'text-gray-600 bg-gray-100 border-gray-300'
    }
  }

  const getConfidenceIcon = (level: string) => {
    switch (level) {
      case 'high':
        return <CheckCircle className="h-6 w-6" />
      case 'medium':
        return <CheckCircle className="h-6 w-6" />
      case 'low':
        return <AlertTriangle className="h-6 w-6" />
      case 'very-low':
        return <AlertCircle className="h-6 w-6" />
      default:
        return null
    }
  }

  if (!isSupported) {
    return (
      <div className={`card ${className}`}>
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <div>
            <h3 className="text-xl font-bold text-red-600 mb-2">
              {settings.simplifiedLanguage ? 'Voice not available' : 'Voice recognition not supported'}
            </h3>
            <p className="text-gray-600">
              {settings.simplifiedLanguage 
                ? 'Please type instead' 
                : 'Please use Chrome, Edge, or Safari for voice features'
              }
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`card ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            🎤 {settings.simplifiedLanguage ? 'Speak Here' : 'Voice Input'}
          </h3>
          <p className="text-lg text-gray-600">
            {settings.simplifiedLanguage 
              ? `Say your ${fieldLabel.toLowerCase()}`
              : `Speak your ${fieldLabel.toLowerCase()} clearly`
            }
          </p>
        </div>

        {/* Large Recording Button */}
        <div className="flex justify-center">
          <button
            onClick={handleToggleRecording}
            className={`relative rounded-full transition-all duration-200 focus:outline-none focus:ring-8 focus:ring-offset-4 touch-feedback ${
              settings.touchMode ? 'p-12' : 'p-10'
            } ${
              isListening
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500 recording-pulse shadow-2xl'
                : 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 shadow-xl'
            }`}
            aria-label={isListening 
              ? (settings.simplifiedLanguage ? 'Stop talking' : 'Stop recording') 
              : (settings.simplifiedLanguage ? 'Start talking' : 'Start recording')
            }
            aria-pressed={isListening}
          >
            {isListening ? (
              <MicOff className={`text-white ${settings.touchMode ? 'h-16 w-16' : 'h-12 w-12'}`} />
            ) : (
              <Mic className={`text-white ${settings.touchMode ? 'h-16 w-16' : 'h-12 w-12'}`} />
            )}
            
            {/* Recording indicator */}
            {isListening && (
              <div className="absolute inset-0 rounded-full border-8 border-red-300 animate-ping" />
            )}
          </button>
        </div>

        {/* Status Display */}
        <div className="text-center space-y-4">
          {isListening ? (
            <div className="space-y-3">
              <div className="flex items-center justify-center space-x-3 text-red-600">
                <Volume2 className="h-8 w-8 animate-pulse" />
                <span className="text-2xl font-bold">
                  {settings.simplifiedLanguage ? 'Listening...' : 'I\'m listening...'}
                </span>
              </div>
              {isNoisy && (
                <div className="bg-yellow-100 border-2 border-yellow-300 rounded-xl p-4">
                  <p className="text-yellow-800 font-medium">
                    {settings.simplifiedLanguage 
                      ? '🔊 Too noisy. Move to quiet place.' 
                      : '🔊 Background noise detected. Try moving to a quieter location.'
                    }
                  </p>
                </div>
              )}
            </div>
          ) : transcript ? (
            <div className="space-y-4">
              <div className={`inline-flex items-center space-x-3 px-6 py-3 rounded-xl border-2 text-lg font-bold ${getConfidenceColor(confidenceLevel)}`}>
                {getConfidenceIcon(confidenceLevel)}
                <span>
                  {settings.simplifiedLanguage 
                    ? `${Math.round(confidence * 100)}% sure`
                    : `${Math.round(confidence * 100)}% confidence`
                  }
                </span>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-lg">
              {settings.simplifiedLanguage 
                ? '👆 Press the button and speak'
                : '👆 Click the microphone and speak clearly'
              }
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          {/* Instructions Button */}
          <button
            onClick={handlePlayInstructions}
            className="btn-secondary flex items-center space-x-3 touch-feedback"
            aria-label={settings.simplifiedLanguage ? 'Hear instructions' : 'Play instructions'}
          >
            <Volume2 className="h-6 w-6" />
            <span className="font-bold">
              {settings.simplifiedLanguage ? 'Help' : 'Instructions'}
            </span>
          </button>

          {/* Playback Button */}
          {transcript && canPlayback && (
            <button
              onClick={playbackTranscript}
              disabled={isPlaying}
              className="btn-secondary flex items-center space-x-3 touch-feedback disabled:opacity-50"
              aria-label={settings.simplifiedLanguage ? 'Hear what I said' : 'Play back what you said'}
            >
              {isPlaying ? (
                <Headphones className="h-6 w-6 animate-pulse" />
              ) : (
                <Play className="h-6 w-6" />
              )}
              <span className="font-bold">
                {settings.simplifiedLanguage ? 'Hear It' : 'Play Back'}
              </span>
            </button>
          )}

          {/* Retry Button */}
          {needsRetry && retryCount < maxRetries && (
            <button
              onClick={handleRetry}
              className="btn-primary flex items-center space-x-3 touch-feedback"
              aria-label={settings.simplifiedLanguage ? 'Try again' : 'Try recording again'}
            >
              <RotateCcw className="h-6 w-6" />
              <span className="font-bold">
                {settings.simplifiedLanguage ? 'Try Again' : `Retry (${retryCount + 1}/${maxRetries})`}
              </span>
            </button>
          )}
        </div>

        {/* Transcript Display */}
        {transcript && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-6 border-l-8 border-primary-500">
              <div className="flex items-start justify-between mb-4">
                <h4 className="text-lg font-bold text-gray-900">
                  {settings.simplifiedLanguage ? 'You said:' : 'What I heard:'}
                </h4>
                {canPlayback && (
                  <button
                    onClick={playbackTranscript}
                    disabled={isPlaying}
                    className="btn-icon bg-primary-100 text-primary-600 hover:bg-primary-200 disabled:opacity-50"
                    aria-label="Play back transcript"
                  >
                    {isPlaying ? (
                      <Headphones className="h-5 w-5 animate-pulse" />
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
                  </button>
                )}
              </div>
              
              <p className="text-xl text-gray-800 font-medium italic">
                "{transcript}"
              </p>
              
              {/* Confidence Bar */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">
                    {settings.simplifiedLanguage ? 'How sure:' : 'Confidence:'}
                  </span>
                  <span className="font-bold text-gray-900">
                    {Math.round(confidence * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full transition-all duration-300 ${
                      confidenceLevel === 'high' ? 'bg-green-500' : 
                      confidenceLevel === 'medium' ? 'bg-blue-500' :
                      confidenceLevel === 'low' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${confidence * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Alternative Suggestions */}
            {alternativeTranscripts.length > 1 && (
              <div className="space-y-3">
                <h4 className="text-lg font-bold text-gray-900">
                  {settings.simplifiedLanguage ? 'Other options:' : 'Did you mean:'}
                </h4>
                <div className="space-y-2">
                  {alternativeTranscripts.slice(1, 4).map((alternative, index) => (
                    <button
                      key={index}
                      onClick={() => onTranscript(alternative, confidence)}
                      className="w-full text-left p-4 text-lg bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-primary-300 rounded-xl transition-all touch-feedback"
                    >
                      "{alternative}"
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Low Confidence Warning */}
            {needsRetry && retryCount < maxRetries && (
              <div className="bg-yellow-100 border-2 border-yellow-300 rounded-xl p-6">
                <div className="flex items-center space-x-3 text-yellow-800 mb-3">
                  <AlertTriangle className="h-8 w-8" />
                  <span className="text-xl font-bold">
                    {settings.simplifiedLanguage ? 'Not sure what you said' : 'Low confidence detected'}
                  </span>
                </div>
                <p className="text-yellow-700 text-lg mb-4">
                  {settings.simplifiedLanguage 
                    ? 'Please speak louder and clearer.'
                    : 'The transcription might not be accurate. Try speaking more clearly or closer to the microphone.'
                  }
                </p>
                <button
                  onClick={handleRetry}
                  className="btn-primary flex items-center space-x-2"
                >
                  <RotateCcw className="h-5 w-5" />
                  <span>{settings.simplifiedLanguage ? 'Try Again' : `Retry (${retryCount + 1}/${maxRetries})`}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border-2 border-red-300 rounded-xl p-6">
            <div className="flex items-center space-x-3 text-red-700 mb-2">
              <AlertCircle className="h-8 w-8" />
              <span className="text-xl font-bold">
                {settings.simplifiedLanguage ? 'Problem' : 'Error'}
              </span>
            </div>
            <p className="text-red-600 text-lg">
              {settings.simplifiedLanguage 
                ? 'Voice not working. Please type instead.'
                : error
              }
            </p>
          </div>
        )}

        {/* Simple Instructions */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h4 className="text-lg font-bold text-blue-900 mb-3">
            {settings.simplifiedLanguage ? '📝 How to use:' : '📝 Instructions:'}
          </h4>
          <div className="space-y-2 text-blue-800">
            {settings.simplifiedLanguage ? (
              <>
                <p>• Press the big button</p>
                <p>• Speak clearly</p>
                <p>• Press again to stop</p>
                <p>• Check what you said</p>
              </>
            ) : (
              <>
                <p>• Click the microphone to start recording</p>
                <p>• Speak clearly and at normal pace</p>
                <p>• Click again to stop recording</p>
                <p>• Review and confirm your input</p>
                <p>• Use retry if confidence is low</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}