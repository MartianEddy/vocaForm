import { useState, useEffect } from 'react'

interface NetworkInfo {
  effectiveType: '2g' | '3g' | '4g' | 'slow-2g'
  downlink: number
  rtt: number
  saveData: boolean
}

interface OptimizationSettings {
  imageQuality: 'low' | 'medium' | 'high'
  enableAnimations: boolean
  preloadContent: boolean
  compressionLevel: number
}

export function useNetworkOptimization() {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null)
  const [optimizationSettings, setOptimizationSettings] = useState<OptimizationSettings>({
    imageQuality: 'medium',
    enableAnimations: true,
    preloadContent: true,
    compressionLevel: 0.8
  })

  useEffect(() => {
    // Check for Network Information API support
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection

    if (connection) {
      const updateNetworkInfo = () => {
        setNetworkInfo({
          effectiveType: connection.effectiveType || '4g',
          downlink: connection.downlink || 10,
          rtt: connection.rtt || 100,
          saveData: connection.saveData || false
        })
      }

      updateNetworkInfo()
      connection.addEventListener('change', updateNetworkInfo)

      return () => {
        connection.removeEventListener('change', updateNetworkInfo)
      }
    }
  }, [])

  // Automatically adjust settings based on network conditions
  useEffect(() => {
    if (!networkInfo) return

    const { effectiveType, downlink, saveData } = networkInfo

    let newSettings: OptimizationSettings = {
      imageQuality: 'medium',
      enableAnimations: true,
      preloadContent: true,
      compressionLevel: 0.8
    }

    // Optimize for slow connections
    if (effectiveType === 'slow-2g' || effectiveType === '2g' || downlink < 1.5 || saveData) {
      newSettings = {
        imageQuality: 'low',
        enableAnimations: false,
        preloadContent: false,
        compressionLevel: 0.6
      }
    } else if (effectiveType === '3g' || downlink < 5) {
      newSettings = {
        imageQuality: 'medium',
        enableAnimations: true,
        preloadContent: false,
        compressionLevel: 0.7
      }
    }

    setOptimizationSettings(newSettings)
  }, [networkInfo])

  const isSlowConnection = () => {
    if (!networkInfo) return false
    return networkInfo.effectiveType === 'slow-2g' || 
           networkInfo.effectiveType === '2g' || 
           networkInfo.downlink < 1.5 ||
           networkInfo.saveData
  }

  const shouldPreloadImages = () => {
    return optimizationSettings.preloadContent && !isSlowConnection()
  }

  const getImageQuality = () => {
    return optimizationSettings.imageQuality
  }

  const shouldEnableAnimations = () => {
    return optimizationSettings.enableAnimations
  }

  const getCompressionLevel = () => {
    return optimizationSettings.compressionLevel
  }

  return {
    networkInfo,
    optimizationSettings,
    isSlowConnection,
    shouldPreloadImages,
    getImageQuality,
    shouldEnableAnimations,
    getCompressionLevel
  }
}