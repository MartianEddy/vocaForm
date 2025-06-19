import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface AccessibilitySettings {
  highContrast: boolean
  largeText: boolean
  reducedMotion: boolean
  audioPrompts: boolean
  simplifiedLanguage: boolean
  touchMode: boolean
  fontSize: 'normal' | 'large' | 'extra-large'
  voiceSpeed: number
  autoPlay: boolean
}

interface AccessibilityContextType {
  settings: AccessibilitySettings
  updateSettings: (updates: Partial<AccessibilitySettings>) => void
  toggleHighContrast: () => void
  toggleLargeText: () => void
  toggleAudioPrompts: () => void
  toggleSimplifiedLanguage: () => void
  toggleTouchMode: () => void
  increaseFontSize: () => void
  decreaseFontSize: () => void
  resetSettings: () => void
  announceToScreenReader: (message: string) => void
}

const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  largeText: false,
  reducedMotion: false,
  audioPrompts: true,
  simplifiedLanguage: false,
  touchMode: false,
  fontSize: 'normal',
  voiceSpeed: 1.0,
  autoPlay: true
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    // Load from localStorage or use defaults
    const saved = localStorage.getItem('vocaform_accessibility')
    if (saved) {
      try {
        return { ...defaultSettings, ...JSON.parse(saved) }
      } catch {
        return defaultSettings
      }
    }
    return defaultSettings
  })

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement
    
    // High contrast
    if (settings.highContrast) {
      document.body.classList.add('high-contrast')
    } else {
      document.body.classList.remove('high-contrast')
    }

    // Large text
    if (settings.largeText) {
      document.body.classList.add('large-text')
    } else {
      document.body.classList.remove('large-text')
    }

    // Font size
    root.style.setProperty('--base-font-size', 
      settings.fontSize === 'large' ? '1.125rem' : 
      settings.fontSize === 'extra-large' ? '1.25rem' : '1rem'
    )

    // Touch mode
    if (settings.touchMode) {
      document.body.classList.add('touch-mode')
    } else {
      document.body.classList.remove('touch-mode')
    }

    // Reduced motion
    if (settings.reducedMotion) {
      root.style.setProperty('--animation-duration', '0.01ms')
    } else {
      root.style.setProperty('--animation-duration', '200ms')
    }

    // Save to localStorage
    localStorage.setItem('vocaform_accessibility', JSON.stringify(settings))
  }, [settings])

  // Detect system preferences
  useEffect(() => {
    const mediaQueries = {
      highContrast: window.matchMedia('(prefers-contrast: high)'),
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)'),
      touchMode: window.matchMedia('(pointer: coarse)')
    }

    const updateFromSystem = () => {
      setSettings(prev => ({
        ...prev,
        highContrast: prev.highContrast || mediaQueries.highContrast.matches,
        reducedMotion: prev.reducedMotion || mediaQueries.reducedMotion.matches,
        touchMode: prev.touchMode || mediaQueries.touchMode.matches
      }))
    }

    // Initial check
    updateFromSystem()

    // Listen for changes
    Object.values(mediaQueries).forEach(mq => {
      mq.addEventListener('change', updateFromSystem)
    })

    return () => {
      Object.values(mediaQueries).forEach(mq => {
        mq.removeEventListener('change', updateFromSystem)
      })
    }
  }, [])

  const updateSettings = (updates: Partial<AccessibilitySettings>) => {
    setSettings(prev => ({ ...prev, ...updates }))
  }

  const toggleHighContrast = () => {
    setSettings(prev => ({ ...prev, highContrast: !prev.highContrast }))
  }

  const toggleLargeText = () => {
    setSettings(prev => ({ ...prev, largeText: !prev.largeText }))
  }

  const toggleAudioPrompts = () => {
    setSettings(prev => ({ ...prev, audioPrompts: !prev.audioPrompts }))
  }

  const toggleSimplifiedLanguage = () => {
    setSettings(prev => ({ ...prev, simplifiedLanguage: !prev.simplifiedLanguage }))
  }

  const toggleTouchMode = () => {
    setSettings(prev => ({ ...prev, touchMode: !prev.touchMode }))
  }

  const increaseFontSize = () => {
    setSettings(prev => ({
      ...prev,
      fontSize: prev.fontSize === 'normal' ? 'large' : 
                prev.fontSize === 'large' ? 'extra-large' : 'extra-large'
    }))
  }

  const decreaseFontSize = () => {
    setSettings(prev => ({
      ...prev,
      fontSize: prev.fontSize === 'extra-large' ? 'large' : 
                prev.fontSize === 'large' ? 'normal' : 'normal'
    }))
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
  }

  const announceToScreenReader = (message: string) => {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', 'polite')
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message
    
    document.body.appendChild(announcement)
    
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }

  return (
    <AccessibilityContext.Provider value={{
      settings,
      updateSettings,
      toggleHighContrast,
      toggleLargeText,
      toggleAudioPrompts,
      toggleSimplifiedLanguage,
      toggleTouchMode,
      increaseFontSize,
      decreaseFontSize,
      resetSettings,
      announceToScreenReader
    }}>
      {children}
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider')
  }
  return context
}