import { useState, useEffect } from 'react'

interface ProgressiveFeatures {
  hasJavaScript: boolean
  hasLocalStorage: boolean
  hasIndexedDB: boolean
  hasServiceWorker: boolean
  hasWebAudio: boolean
  hasSpeechRecognition: boolean
  hasNotifications: boolean
  hasVibration: boolean
  hasCamera: boolean
  hasGeolocation: boolean
  hasOnlineStatus: boolean
  hasNetworkInformation: boolean
}

export function useProgressiveEnhancement() {
  const [features, setFeatures] = useState<ProgressiveFeatures>({
    hasJavaScript: true, // If this runs, JS is available
    hasLocalStorage: false,
    hasIndexedDB: false,
    hasServiceWorker: false,
    hasWebAudio: false,
    hasSpeechRecognition: false,
    hasNotifications: false,
    hasVibration: false,
    hasCamera: false,
    hasGeolocation: false,
    hasOnlineStatus: false,
    hasNetworkInformation: false
  })

  const [enhancementLevel, setEnhancementLevel] = useState<'basic' | 'enhanced' | 'advanced'>('basic')

  useEffect(() => {
    detectFeatures()
  }, [])

  const detectFeatures = async () => {
    const detectedFeatures: ProgressiveFeatures = {
      hasJavaScript: true,
      hasLocalStorage: checkLocalStorage(),
      hasIndexedDB: checkIndexedDB(),
      hasServiceWorker: 'serviceWorker' in navigator,
      hasWebAudio: checkWebAudio(),
      hasSpeechRecognition: checkSpeechRecognition(),
      hasNotifications: 'Notification' in window,
      hasVibration: 'vibrate' in navigator,
      hasCamera: await checkCamera(),
      hasGeolocation: 'geolocation' in navigator,
      hasOnlineStatus: 'onLine' in navigator,
      hasNetworkInformation: 'connection' in navigator
    }

    setFeatures(detectedFeatures)
    setEnhancementLevel(calculateEnhancementLevel(detectedFeatures))
  }

  const checkLocalStorage = (): boolean => {
    try {
      const test = 'test'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  }

  const checkIndexedDB = (): boolean => {
    return 'indexedDB' in window
  }

  const checkWebAudio = (): boolean => {
    return 'AudioContext' in window || 'webkitAudioContext' in window
  }

  const checkSpeechRecognition = (): boolean => {
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
  }

  const checkCamera = async (): Promise<boolean> => {
    try {
      if (!('mediaDevices' in navigator)) return false
      const devices = await navigator.mediaDevices.enumerateDevices()
      return devices.some(device => device.kind === 'videoinput')
    } catch {
      return false
    }
  }

  const calculateEnhancementLevel = (features: ProgressiveFeatures): 'basic' | 'enhanced' | 'advanced' => {
    const coreFeatures = [
      features.hasLocalStorage,
      features.hasServiceWorker,
      features.hasSpeechRecognition
    ]

    const advancedFeatures = [
      features.hasIndexedDB,
      features.hasWebAudio,
      features.hasNotifications,
      features.hasCamera,
      features.hasNetworkInformation
    ]

    const coreCount = coreFeatures.filter(Boolean).length
    const advancedCount = advancedFeatures.filter(Boolean).length

    if (coreCount >= 2 && advancedCount >= 3) return 'advanced'
    if (coreCount >= 1) return 'enhanced'
    return 'basic'
  }

  const getFeatureSupport = () => features
  const getEnhancementLevel = () => enhancementLevel

  const canUseFeature = (feature: keyof ProgressiveFeatures): boolean => {
    return features[feature]
  }

  const gracefullyDegrade = <T>(
    advanced: () => T,
    fallback: () => T,
    requiredFeatures: (keyof ProgressiveFeatures)[]
  ): T => {
    const hasAllFeatures = requiredFeatures.every(feature => features[feature])
    return hasAllFeatures ? advanced() : fallback()
  }

  return {
    features,
    enhancementLevel,
    getFeatureSupport,
    getEnhancementLevel,
    canUseFeature,
    gracefullyDegrade
  }
}

// Hook for progressive form enhancement
export function useProgressiveForm() {
  const { features, enhancementLevel, canUseFeature, gracefullyDegrade } = useProgressiveEnhancement()

  const getFormStrategy = () => {
    return gracefullyDegrade(
      () => ({
        type: 'voice-enhanced' as const,
        features: ['voice', 'auto-save', 'offline', 'validation']
      }),
      () => ({
        type: 'basic' as const,
        features: ['manual-input', 'basic-validation']
      }),
      ['hasSpeechRecognition', 'hasLocalStorage']
    )
  }

  const getSaveStrategy = () => {
    if (canUseFeature('hasIndexedDB')) {
      return 'indexeddb'
    } else if (canUseFeature('hasLocalStorage')) {
      return 'localstorage'
    } else {
      return 'memory'
    }
  }

  const getValidationStrategy = () => {
    return gracefullyDegrade(
      () => 'real-time',
      () => 'on-submit',
      ['hasJavaScript']
    )
  }

  const getOfflineStrategy = () => {
    return gracefullyDegrade(
      () => 'full-offline',
      () => canUseFeature('hasLocalStorage') ? 'basic-offline' : 'no-offline',
      ['hasServiceWorker', 'hasIndexedDB']
    )
  }

  return {
    enhancementLevel,
    formStrategy: getFormStrategy(),
    saveStrategy: getSaveStrategy(),
    validationStrategy: getValidationStrategy(),
    offlineStrategy: getOfflineStrategy(),
    canUseVoice: canUseFeature('hasSpeechRecognition'),
    canUseOffline: canUseFeature('hasServiceWorker') || canUseFeature('hasLocalStorage'),
    canUseNotifications: canUseFeature('hasNotifications')
  }
}