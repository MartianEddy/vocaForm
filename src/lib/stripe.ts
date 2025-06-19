import { loadStripe, Stripe } from '@stripe/stripe-js'

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

let stripePromise: Promise<Stripe | null>

if (stripePublishableKey) {
  stripePromise = loadStripe(stripePublishableKey)
} else {
  console.warn('Stripe publishable key not found. Payment features will be disabled.')
  stripePromise = Promise.resolve(null)
}

export { stripePromise }

// Subscription plans configuration
export const subscriptionPlans = [
  {
    id: 'free',
    name: 'Free',
    description: 'Basic form filling with limited features',
    price: 0,
    currency: 'USD',
    interval: 'month' as const,
    features: [
      '5 forms per month',
      'Basic voice recognition',
      'PDF export',
      'Email support'
    ],
    stripePriceId: null,
    popular: false
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Enhanced features for regular users',
    price: 9.99,
    currency: 'USD',
    interval: 'month' as const,
    features: [
      'Unlimited forms',
      'Advanced voice recognition',
      'Priority support',
      'Custom templates',
      'Analytics dashboard',
      'Multi-language support'
    ],
    stripePriceId: 'price_premium_monthly',
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Full-featured solution for organizations',
    price: 49.99,
    currency: 'USD',
    interval: 'month' as const,
    features: [
      'Everything in Premium',
      'Team management',
      'API access',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantee',
      'White-label options'
    ],
    stripePriceId: 'price_enterprise_monthly',
    popular: false
  }
]

// Payment service
class PaymentService {
  private stripe: Stripe | null = null

  async initialize() {
    this.stripe = await stripePromise
    return this.stripe !== null
  }

  async createCheckoutSession(priceId: string, userId: string, successUrl: string, cancelUrl: string) {
    if (!this.stripe) {
      throw new Error('Stripe not initialized')
    }

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId,
          successUrl,
          cancelUrl
        })
      })

      const session = await response.json()

      if (session.error) {
        throw new Error(session.error)
      }

      // Redirect to Stripe Checkout
      const result = await this.stripe.redirectToCheckout({
        sessionId: session.id
      })

      if (result.error) {
        throw new Error(result.error.message)
      }
    } catch (error) {
      console.error('Checkout session creation failed:', error)
      throw error
    }
  }

  async createPortalSession(customerId: string, returnUrl: string) {
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          returnUrl
        })
      })

      const session = await response.json()

      if (session.error) {
        throw new Error(session.error)
      }

      // Redirect to customer portal
      window.location.href = session.url
    } catch (error) {
      console.error('Portal session creation failed:', error)
      throw error
    }
  }

  getPlanById(planId: string) {
    return subscriptionPlans.find(plan => plan.id === planId)
  }

  isAvailable(): boolean {
    return this.stripe !== null
  }
}

export const paymentService = new PaymentService()

// React hook for payments
export function usePayments() {
  const subscribe = async (planId: string, userId: string) => {
    const plan = paymentService.getPlanById(planId)
    if (!plan || !plan.stripePriceId) {
      throw new Error('Invalid plan or price ID')
    }

    const successUrl = `${window.location.origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${window.location.origin}/subscription/cancelled`

    await paymentService.createCheckoutSession(
      plan.stripePriceId,
      userId,
      successUrl,
      cancelUrl
    )
  }

  const manageSubscription = async (customerId: string) => {
    const returnUrl = `${window.location.origin}/account/subscription`
    await paymentService.createPortalSession(customerId, returnUrl)
  }

  return {
    subscribe,
    manageSubscription,
    plans: subscriptionPlans,
    isAvailable: paymentService.isAvailable()
  }
}

// Revenue tracking for analytics
export function trackSubscriptionEvent(eventType: string, planId: string, amount?: number) {
  const plan = paymentService.getPlanById(planId)
  
  // This would integrate with your analytics service
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventType, {
      currency: 'USD',
      value: amount || plan?.price || 0,
      items: [{
        item_id: planId,
        item_name: plan?.name || 'Unknown Plan',
        category: 'Subscription',
        quantity: 1,
        price: amount || plan?.price || 0
      }]
    })
  }
}