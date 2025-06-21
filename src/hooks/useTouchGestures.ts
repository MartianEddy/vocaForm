import { useEffect, useRef, useState } from 'react'

interface TouchGestureOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onPinch?: (scale: number) => void
  onTap?: () => void
  onDoubleTap?: () => void
  onLongPress?: () => void
  threshold?: number
  longPressDelay?: number
}

export function useTouchGestures(options: TouchGestureOptions) {
  const elementRef = useRef<HTMLElement>(null)
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null)
  const [lastTap, setLastTap] = useState<number>(0)
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null)

  const threshold = options.threshold || 50
  const longPressDelay = options.longPressDelay || 500

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    let initialDistance = 0
    let initialScale = 1

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      const now = Date.now()
      
      setTouchStart({
        x: touch.clientX,
        y: touch.clientY,
        time: now
      })

      // Handle pinch gesture
      if (e.touches.length === 2 && options.onPinch) {
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        initialDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        )
      }

      // Long press detection
      if (options.onLongPress) {
        const timer = setTimeout(() => {
          options.onLongPress?.()
          setLongPressTimer(null)
        }, longPressDelay)
        setLongPressTimer(timer)
      }

      e.preventDefault()
    }

    const handleTouchMove = (e: TouchEvent) => {
      // Cancel long press if finger moves
      if (longPressTimer) {
        clearTimeout(longPressTimer)
        setLongPressTimer(null)
      }

      // Handle pinch gesture
      if (e.touches.length === 2 && options.onPinch && initialDistance > 0) {
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        const currentDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        )
        const scale = currentDistance / initialDistance
        options.onPinch(scale)
      }

      e.preventDefault()
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (longPressTimer) {
        clearTimeout(longPressTimer)
        setLongPressTimer(null)
      }

      if (!touchStart) return

      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - touchStart.x
      const deltaY = touch.clientY - touchStart.y
      const deltaTime = Date.now() - touchStart.time
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

      // Tap detection
      if (distance < 10 && deltaTime < 300) {
        const now = Date.now()
        const timeSinceLastTap = now - lastTap

        if (timeSinceLastTap < 300 && options.onDoubleTap) {
          // Double tap
          options.onDoubleTap()
          setLastTap(0)
        } else {
          // Single tap
          if (options.onTap) {
            setTimeout(() => {
              if (Date.now() - now > 250) {
                options.onTap?.()
              }
            }, 250)
          }
          setLastTap(now)
        }
      }

      // Swipe detection
      if (distance > threshold) {
        const absX = Math.abs(deltaX)
        const absY = Math.abs(deltaY)

        if (absX > absY) {
          // Horizontal swipe
          if (deltaX > 0 && options.onSwipeRight) {
            options.onSwipeRight()
          } else if (deltaX < 0 && options.onSwipeLeft) {
            options.onSwipeLeft()
          }
        } else {
          // Vertical swipe
          if (deltaY > 0 && options.onSwipeDown) {
            options.onSwipeDown()
          } else if (deltaY < 0 && options.onSwipeUp) {
            options.onSwipeUp()
          }
        }
      }

      setTouchStart(null)
      e.preventDefault()
    }

    element.addEventListener('touchstart', handleTouchStart, { passive: false })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })
    element.addEventListener('touchend', handleTouchEnd, { passive: false })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
      
      if (longPressTimer) {
        clearTimeout(longPressTimer)
      }
    }
  }, [options, threshold, longPressDelay, touchStart, lastTap, longPressTimer])

  return elementRef
}