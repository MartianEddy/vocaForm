import { useState, useEffect } from 'react'

interface ServiceWorkerState {
  isSupported: boolean
  isInstalled: boolean
  isWaiting: boolean
  registration: ServiceWorkerRegistration | null
  error: string | null
}

export function useServiceWorker() {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: 'serviceWorker' in navigator,
    isInstalled: false,
    isWaiting: false,
    registration: null,
    error: null
  })

  useEffect(() => {
    if (!state.isSupported) return

    registerServiceWorker()
  }, [state.isSupported])

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })

      setState(prev => ({
        ...prev,
        registration,
        isInstalled: !!registration.active
      }))

      // Check for waiting service worker
      if (registration.waiting) {
        setState(prev => ({ ...prev, isWaiting: true }))
      }

      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setState(prev => ({ ...prev, isWaiting: true }))
            }
          })
        }
      })

      // Listen for controller change (new SW activated)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload()
      })

    } catch (error) {
      console.error('Service Worker registration failed:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Registration failed'
      }))
    }
  }

  const updateServiceWorker = () => {
    if (state.registration?.waiting) {
      state.registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    }
  }

  const unregisterServiceWorker = async () => {
    if (state.registration) {
      const success = await state.registration.unregister()
      if (success) {
        setState(prev => ({
          ...prev,
          isInstalled: false,
          registration: null
        }))
      }
    }
  }

  return {
    ...state,
    updateServiceWorker,
    unregisterServiceWorker
  }
}