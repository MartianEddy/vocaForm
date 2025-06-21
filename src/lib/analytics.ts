import mixpanel from 'mixpanel-browser'
import { hotjar } from 'react-hotjar'
import posthog from 'posthog-js'
import { supabaseHelpers } from './supabase'
import { supabase } from './supabase'

// Initialize analytics services
const MIXPANEL_TOKEN = import.meta.env.VITE_MIXPANEL_TOKEN
const HOTJAR_ID = import.meta.env.VITE_HOTJAR_ID
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY

class AnalyticsService {
  private isInitialized = false
  private userId: string | null = null

  async initialize() {
    if (this.isInitialized) return

    try {
      // Initialize Mixpanel
      if (MIXPANEL_TOKEN) {
        mixpanel.init(MIXPANEL_TOKEN, {
          debug: import.meta.env.DEV,
          track_pageview: true,
          persistence: 'localStorage'
        })
      }

      // Initialize Hotjar
      if (HOTJAR_ID) {
        hotjar.initialize(parseInt(HOTJAR_ID), 6)
      }

      // Initialize PostHog
      if (POSTHOG_KEY) {
        posthog.init(POSTHOG_KEY, {
          api_host: 'https://app.posthog.com',
          debug: import.meta.env.DEV
        })
      }

      this.isInitialized = true
    } catch (error) {
      console.error('Analytics initialization failed:', error)
    }
  }

  setUser(userId: string, properties?: Record<string, any>) {
    this.userId = userId

    if (MIXPANEL_TOKEN) {
      mixpanel.identify(userId)
      if (properties) {
        mixpanel.people.set(properties)
      }
    }

    if (POSTHOG_KEY) {
      posthog.identify(userId, properties)
    }

    if (HOTJAR_ID) {
      hotjar.identify(userId, properties)
    }
  }

  async track(eventName: string, properties?: Record<string, any>) {
    const eventData = {
      ...properties,
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      url: window.location.href
    }

    // Track with external services
    if (MIXPANEL_TOKEN) {
      mixpanel.track(eventName, eventData)
    }

    if (POSTHOG_KEY) {
      posthog.capture(eventName, eventData)
    }

    // Store in Supabase for internal analytics
    try {
      // Get current authenticated user
      const { data: { user } } = await supabase.auth.getUser()
      
      // Only set user_id if there's an authenticated user, otherwise leave it null
      const analyticsEvent = {
        user_id: user?.id || null,
        event_type: eventName,
        event_data: eventData
      }

      await supabaseHelpers.trackEvent(analyticsEvent)
    } catch (error) {
      console.error('Failed to store analytics event:', error)
    }
  }

  // Form-specific tracking methods
  async trackFormStart(templateId: string, templateName: string) {
    await this.track('form_started', {
      template_id: templateId,
      template_name: templateName
    })
  }

  async trackFormFieldCompleted(templateId: string, fieldId: string, fieldType: string, confidence?: number) {
    await this.track('form_field_completed', {
      template_id: templateId,
      field_id: fieldId,
      field_type: fieldType,
      confidence: confidence
    })
  }

  async trackVoiceInteraction(templateId: string, fieldId: string, success: boolean, confidence?: number, retryCount?: number) {
    await this.track('voice_interaction', {
      template_id: templateId,
      field_id: fieldId,
      success,
      confidence,
      retry_count: retryCount
    })
  }

  async trackFormCompleted(templateId: string, completionTime: number, totalFields: number, voiceFields: number) {
    await this.track('form_completed', {
      template_id: templateId,
      completion_time: completionTime,
      total_fields: totalFields,
      voice_fields: voiceFields,
      voice_usage_percentage: (voiceFields / totalFields) * 100
    })
  }

  async trackFormAbandoned(templateId: string, progress: number, timeSpent: number) {
    await this.track('form_abandoned', {
      template_id: templateId,
      progress_percentage: progress,
      time_spent: timeSpent
    })
  }

  async trackError(errorType: string, errorMessage: string, context?: Record<string, any>) {
    await this.track('error_occurred', {
      error_type: errorType,
      error_message: errorMessage,
      ...context
    })
  }

  async trackPerformance(metric: string, value: number, context?: Record<string, any>) {
    await this.track('performance_metric', {
      metric,
      value,
      ...context
    })
  }

  // Page tracking
  async trackPageView(pageName: string, properties?: Record<string, any>) {
    await this.track('page_viewed', {
      page_name: pageName,
      ...properties
    })
  }

  // User behavior tracking
  async trackUserAction(action: string, properties?: Record<string, any>) {
    await this.track('user_action', {
      action,
      ...properties
    })
  }

  // Revenue tracking (for future payment integration)
  async trackRevenue(amount: number, currency: string, planName?: string) {
    const revenueData = {
      amount,
      currency,
      plan_name: planName
    }

    if (MIXPANEL_TOKEN) {
      mixpanel.track('purchase', revenueData)
      mixpanel.people.track_charge(amount)
    }

    if (POSTHOG_KEY) {
      posthog.capture('purchase', revenueData)
    }

    await this.track('revenue_generated', revenueData)
  }
}

export const analytics = new AnalyticsService()

// React hook for analytics
export function useAnalytics() {
  return {
    track: analytics.track.bind(analytics),
    trackFormStart: analytics.trackFormStart.bind(analytics),
    trackFormFieldCompleted: analytics.trackFormFieldCompleted.bind(analytics),
    trackVoiceInteraction: analytics.trackVoiceInteraction.bind(analytics),
    trackFormCompleted: analytics.trackFormCompleted.bind(analytics),
    trackFormAbandoned: analytics.trackFormAbandoned.bind(analytics),
    trackError: analytics.trackError.bind(analytics),
    trackPerformance: analytics.trackPerformance.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics),
    trackUserAction: analytics.trackUserAction.bind(analytics),
    trackRevenue: analytics.trackRevenue.bind(analytics)
  }
}

// Performance monitoring
export function trackWebVitals() {
  // Track Core Web Vitals
  if ('web-vital' in window) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(metric => analytics.trackPerformance('CLS', metric.value))
      getFID(metric => analytics.trackPerformance('FID', metric.value))
      getFCP(metric => analytics.trackPerformance('FCP', metric.value))
      getLCP(metric => analytics.trackPerformance('LCP', metric.value))
      getTTFB(metric => analytics.trackPerformance('TTFB', metric.value))
    })
  }
}