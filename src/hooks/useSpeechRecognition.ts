import { useState, useEffect, useCallback, useRef } from 'react'

interface SpeechRecognitionResult {
  transcript: string
  confidence: number
  isFinal: boolean
}

interface UseSpeechRecognitionReturn {
  isSupported: boolean
  isListening: boolean
  transcript: string
  confidence: number
  confidenceLevel: 'high' | 'medium' | 'low' | 'very-low'
  startListening: () => void
  stopListening: () => void
  resetTranscript: () => void
  retryRecording: () => void
  error: string | null
  noiseLevel: number
  isNoisy: boolean
  canPlayback: boolean
  playbackTranscript: () => void
  isPlaying: boolean
  retryCount: number
  maxRetries: number
  needsRetry: boolean
  alternativeTranscripts: string[]
  selectedLanguage: string
  setLanguage: (lang: string) => void
  supportedLanguages: { code: string; name: string; accent?: string }[]
}

// Confidence thresholds
const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.85,
  MEDIUM: 0.65,
  LOW: 0.45,
  VERY_LOW: 0.0
}

// Noise level threshold
const NOISE_THRESHOLD = 0.3

// Supported languages and accents
const SUPPORTED_LANGUAGES = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'en-GB', name: 'English (UK)' },
  { code: 'en-AU', name: 'English (Australia)' },
  { code: 'en-KE', name: 'English (Kenya)', accent: 'Kenyan' },
  { code: 'en-UG', name: 'English (Uganda)', accent: 'Ugandan' },
  { code: 'en-TZ', name: 'English (Tanzania)', accent: 'Tanzanian' },
  { code: 'sw-KE', name: 'Kiswahili (Kenya)', accent: 'Kenyan' },
  { code: 'sw-TZ', name: 'Kiswahili (Tanzania)', accent: 'Tanzanian' },
  { code: 'sw-UG', name: 'Kiswahili (Uganda)', accent: 'Ugandan' }
]

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [isSupported, setIsSupported] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [confidence, setConfidence] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)
  const [noiseLevel, setNoiseLevel] = useState(0)
  const [isNoisy, setIsNoisy] = useState(false)
  const [canPlayback, setCanPlayback] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [needsRetry, setNeedsRetry] = useState(false)
  const [alternativeTranscripts, setAlternativeTranscripts] = useState<string[]>([])
  const [selectedLanguage, setSelectedLanguage] = useState('en-KE')
  
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null)
  const noiseMonitorRef = useRef<number | null>(null)

  const maxRetries = 3

  // Get confidence level based on score
  const getConfidenceLevel = (score: number): 'high' | 'medium' | 'low' | 'very-low' => {
    if (score >= CONFIDENCE_THRESHOLDS.HIGH) return 'high'
    if (score >= CONFIDENCE_THRESHOLDS.MEDIUM) return 'medium'
    if (score >= CONFIDENCE_THRESHOLDS.LOW) return 'low'
    return 'very-low'
  }

  const confidenceLevel = getConfidenceLevel(confidence)

  // Initialize audio context for noise monitoring
  const initializeAudioContext = useCallback(async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        } 
      })
      
      streamRef.current = stream
      
      const analyser = audioContextRef.current.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.8
      
      const microphone = audioContextRef.current.createMediaStreamSource(stream)
      microphone.connect(analyser)
      
      analyserRef.current = analyser
      microphoneRef.current = microphone
      
      // Start noise monitoring
      monitorNoise()
      
    } catch (err) {
      console.error('Failed to initialize audio context:', err)
      setError('Microphone access denied or not available')
    }
  }, [])

  // Monitor background noise levels
  const monitorNoise = useCallback(() => {
    if (!analyserRef.current) return

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    
    const checkNoise = () => {
      if (!analyserRef.current) return
      
      analyserRef.current.getByteFrequencyData(dataArray)
      
      // Calculate average noise level
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length
      const normalizedLevel = average / 255
      
      setNoiseLevel(normalizedLevel)
      setIsNoisy(normalizedLevel > NOISE_THRESHOLD)
      
      if (isListening) {
        noiseMonitorRef.current = requestAnimationFrame(checkNoise)
      }
    }
    
    checkNoise()
  }, [isListening])

  // Clean up audio resources
  const cleanupAudio = useCallback(() => {
    if (noiseMonitorRef.current) {
      cancelAnimationFrame(noiseMonitorRef.current)
      noiseMonitorRef.current = null
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    if (microphoneRef.current) {
      microphoneRef.current.disconnect()
      microphoneRef.current = null
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    
    analyserRef.current = null
  }, [])

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      
      if (SpeechRecognition) {
        setIsSupported(true)
        setCanPlayback('speechSynthesis' in window)
        
        const recognitionInstance = new SpeechRecognition()
        
        // Enhanced configuration
        recognitionInstance.continuous = true
        recognitionInstance.interimResults = true
        recognitionInstance.maxAlternatives = 5
        recognitionInstance.lang = selectedLanguage
        
        recognitionInstance.onstart = () => {
          setIsListening(true)
          setError(null)
          setNeedsRetry(false)
          initializeAudioContext()
        }
        
        recognitionInstance.onend = () => {
          setIsListening(false)
          cleanupAudio()
        }
        
        recognitionInstance.onerror = (event) => {
          let errorMessage = event.error
          
          switch (event.error) {
            case 'no-speech':
              errorMessage = 'No speech detected. Please try speaking closer to the microphone.'
              break
            case 'audio-capture':
              errorMessage = 'Microphone not accessible. Please check your microphone settings.'
              break
            case 'not-allowed':
              errorMessage = 'Microphone permission denied. Please allow microphone access.'
              break
            case 'network':
              errorMessage = 'Network error. Please check your internet connection.'
              break
            case 'service-not-allowed':
              errorMessage = 'Speech recognition service not available.'
              break
            default:
              errorMessage = `Speech recognition error: ${event.error}`
          }
          
          setError(errorMessage)
          setIsListening(false)
          cleanupAudio()
        }
        
        recognitionInstance.onresult = (event) => {
          let finalTranscript = ''
          let interimTranscript = ''
          let maxConfidence = 0
          const alternatives: string[] = []
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i]
            const transcriptPart = result[0].transcript
            
            // Collect alternatives
            for (let j = 0; j < result.length && j < 3; j++) {
              if (result[j].transcript.trim() && !alternatives.includes(result[j].transcript.trim())) {
                alternatives.push(result[j].transcript.trim())
              }
            }
            
            if (result.isFinal) {
              finalTranscript += transcriptPart
              maxConfidence = Math.max(maxConfidence, result[0].confidence || 0)
            } else {
              interimTranscript += transcriptPart
            }
          }
          
          const currentTranscript = finalTranscript || interimTranscript
          setTranscript(currentTranscript)
          setAlternativeTranscripts(alternatives)
          
          if (maxConfidence > 0) {
            setConfidence(maxConfidence)
            
            // Check if retry is needed based on confidence
            if (finalTranscript && maxConfidence < CONFIDENCE_THRESHOLDS.LOW && retryCount < maxRetries) {
              setNeedsRetry(true)
            } else {
              setNeedsRetry(false)
            }
          }
        }
        
        setRecognition(recognitionInstance)
      }
    }
    
    return () => {
      cleanupAudio()
    }
  }, [selectedLanguage, retryCount, maxRetries, initializeAudioContext, cleanupAudio])

  const startListening = useCallback(() => {
    if (recognition && !isListening) {
      setTranscript('')
      setConfidence(0)
      setError(null)
      setAlternativeTranscripts([])
      setNeedsRetry(false)
      
      // Update language before starting
      recognition.lang = selectedLanguage
      recognition.start()
    }
  }, [recognition, isListening, selectedLanguage])

  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop()
    }
  }, [recognition, isListening])

  const resetTranscript = useCallback(() => {
    setTranscript('')
    setConfidence(0)
    setError(null)
    setRetryCount(0)
    setNeedsRetry(false)
    setAlternativeTranscripts([])
  }, [])

  const retryRecording = useCallback(() => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1)
      setNeedsRetry(false)
      resetTranscript()
      
      // Brief delay before retry
      setTimeout(() => {
        startListening()
      }, 500)
    }
  }, [retryCount, maxRetries, resetTranscript, startListening])

  const playbackTranscript = useCallback(() => {
    if (!canPlayback || !transcript || isPlaying) return
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel()
    
    const utterance = new SpeechSynthesisUtterance(transcript)
    
    // Configure speech synthesis
    utterance.rate = 0.9
    utterance.pitch = 1.0
    utterance.volume = 0.8
    
    // Try to match the selected language
    const voices = window.speechSynthesis.getVoices()
    const matchingVoice = voices.find(voice => 
      voice.lang.startsWith(selectedLanguage.split('-')[0])
    )
    if (matchingVoice) {
      utterance.voice = matchingVoice
    }
    
    utterance.onstart = () => setIsPlaying(true)
    utterance.onend = () => setIsPlaying(false)
    utterance.onerror = () => setIsPlaying(false)
    
    speechSynthesisRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }, [canPlayback, transcript, isPlaying, selectedLanguage])

  const setLanguage = useCallback((lang: string) => {
    setSelectedLanguage(lang)
    resetTranscript()
  }, [resetTranscript])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (speechSynthesisRef.current) {
        window.speechSynthesis.cancel()
      }
      cleanupAudio()
    }
  }, [cleanupAudio])

  return {
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
    supportedLanguages: SUPPORTED_LANGUAGES
  }
}

// Extend the Window interface to include speech recognition and audio context
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
    AudioContext: typeof AudioContext
    webkitAudioContext: typeof AudioContext
  }
}