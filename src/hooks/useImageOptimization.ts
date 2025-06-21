import { useState, useEffect } from 'react'
import { useNetworkOptimization } from './useNetworkOptimization'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'jpeg' | 'png'
  lazy?: boolean
}

export function useImageOptimization() {
  const { getImageQuality, isSlowConnection, shouldPreloadImages } = useNetworkOptimization()
  const [supportsWebP, setSupportsWebP] = useState<boolean | null>(null)

  useEffect(() => {
    checkWebPSupport()
  }, [])

  const checkWebPSupport = () => {
    const webP = new Image()
    webP.onload = webP.onerror = () => {
      setSupportsWebP(webP.height === 2)
    }
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA'
  }

  const getOptimizedImageUrl = (src: string, options: Partial<OptimizedImageProps> = {}) => {
    if (!src) return src

    // For external URLs, return as-is
    if (src.startsWith('http') && !src.includes(window.location.hostname)) {
      return src
    }

    const quality = options.quality || getQualityForNetwork()
    const format = getOptimalFormat(options.format)
    const params = new URLSearchParams()

    if (options.width) params.set('w', options.width.toString())
    if (options.height) params.set('h', options.height.toString())
    if (quality < 100) params.set('q', quality.toString())
    if (format !== 'original') params.set('f', format)

    // Add compression for slow connections
    if (isSlowConnection()) {
      params.set('compress', 'true')
    }

    const queryString = params.toString()
    return queryString ? `${src}?${queryString}` : src
  }

  const getQualityForNetwork = (): number => {
    const baseQuality = getImageQuality()
    switch (baseQuality) {
      case 'low': return 60
      case 'medium': return 80
      case 'high': return 95
      default: return 80
    }
  }

  const getOptimalFormat = (preferredFormat?: string): string => {
    if (preferredFormat) return preferredFormat
    if (supportsWebP) return 'webp'
    return 'jpeg'
  }

  const preloadImage = (src: string, options: Partial<OptimizedImageProps> = {}) => {
    if (!shouldPreloadImages()) return Promise.resolve()

    return new Promise<void>((resolve, reject) => {
      const img = new Image()
      const optimizedSrc = getOptimizedImageUrl(src, options)
      
      img.onload = () => resolve()
      img.onerror = () => reject(new Error(`Failed to preload image: ${optimizedSrc}`))
      img.src = optimizedSrc
    })
  }

  const createImageElement = (props: OptimizedImageProps): HTMLImageElement => {
    const img = new Image()
    const optimizedSrc = getOptimizedImageUrl(props.src, props)
    
    img.src = optimizedSrc
    img.alt = props.alt
    img.loading = props.lazy !== false ? 'lazy' : 'eager'
    
    if (props.width) img.width = props.width
    if (props.height) img.height = props.height

    return img
  }

  return {
    getOptimizedImageUrl,
    preloadImage,
    createImageElement,
    supportsWebP,
    isSlowConnection: isSlowConnection()
  }
}

// React component for optimized images
export function OptimizedImage(props: OptimizedImageProps & React.ImgHTMLAttributes<HTMLImageElement>) {
  const { getOptimizedImageUrl } = useImageOptimization()
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  const {
    src,
    alt,
    width,
    height,
    quality,
    format,
    lazy = true,
    className = '',
    ...imgProps
  } = props

  const optimizedSrc = getOptimizedImageUrl(src, { width, height, quality, format })

  return (
    <div className={`relative ${className}`}>
      <img
        {...imgProps}
        src={optimizedSrc}
        alt={alt}
        width={width}
        height={height}
        loading={lazy ? 'lazy' : 'eager'}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${imgProps.className || ''}`}
      />
      
      {/* Loading placeholder */}
      {!isLoaded && !hasError && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse rounded"
          style={{ width, height }}
          aria-hidden="true"
        />
      )}
      
      {/* Error fallback */}
      {hasError && (
        <div 
          className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-400 rounded"
          style={{ width, height }}
        >
          <span className="text-sm">Image unavailable</span>
        </div>
      )}
    </div>
  )
}