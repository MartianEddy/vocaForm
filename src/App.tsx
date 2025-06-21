import React, { useEffect, Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { LanguageProvider } from './contexts/LanguageContext'
import { AccessibilityProvider } from './contexts/AccessibilityContext'
import { AuthProvider } from './contexts/AuthContext'
import { FormProvider } from './contexts/FormContext'
import { DynamicFormProvider } from './contexts/DynamicFormContext'
import { analytics, trackWebVitals } from './lib/analytics'
import { paymentService } from './lib/stripe'
import { useServiceWorker } from './hooks/useServiceWorker'
import { useProgressiveEnhancement } from './hooks/useProgressiveEnhancement'
import AccessibleLayout from './components/AccessibleLayout'
import MobileNavigation from './components/MobileNavigation'
import ServiceWorkerUpdate from './components/ServiceWorkerUpdate'
import { LoadingSpinner } from './components/LoadingStates'
import ErrorBoundary from './components/ErrorBoundary'

// Lazy load components for better performance
const AccessibleHome = lazy(() => import('./pages/AccessibleHome'))
const AuthPage = lazy(() => import('./pages/AuthPage'))
const AgentLogin = lazy(() => import('./pages/AgentLogin'))
const AgentDashboard = lazy(() => import('./pages/AgentDashboard'))
const FormFilling = lazy(() => import('./pages/FormFilling'))
const MobileFormFilling = lazy(() => import('./pages/MobileFormFilling'))
const DynamicFormFilling = lazy(() => import('./pages/DynamicFormFilling'))
const FormTemplates = lazy(() => import('./pages/FormTemplates'))
const ClientSession = lazy(() => import('./pages/ClientSession'))

function App() {
  const { enhancementLevel } = useProgressiveEnhancement()
  
  useEffect(() => {
    // Initialize analytics
    analytics.initialize()
    
    // Initialize payment service
    paymentService.initialize()
    
    // Track web vitals for performance monitoring
    trackWebVitals()
    
    // Track page views
    analytics.trackPageView('app_loaded', {
      enhancement_level: enhancementLevel
    })
  }, [enhancementLevel])

  // Detect if user is on mobile device
  const isMobile = window.innerWidth <= 768 || 'ontouchstart' in window

  // Loading fallback component
  const PageLoader = () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )

  return (
    <ErrorBoundary>
      <AccessibilityProvider>
        <LanguageProvider>
          <AuthProvider>
            <FormProvider>
              <DynamicFormProvider>
                <AccessibleLayout>
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/" element={<AccessibleHome />} />
                      <Route path="/auth" element={<AuthPage />} />
                      <Route path="/agent/login" element={<AgentLogin />} />
                      <Route path="/agent/dashboard" element={<AgentDashboard />} />
                      <Route path="/templates" element={<FormTemplates />} />
                      <Route 
                        path="/form/:templateId" 
                        element={isMobile ? <MobileFormFilling /> : <FormFilling />} 
                      />
                      <Route path="/dynamic-form/:templateId" element={<DynamicFormFilling />} />
                      <Route path="/client/:sessionId" element={<ClientSession />} />
                    </Routes>
                  </Suspense>
                  {isMobile && <MobileNavigation />}
                  <ServiceWorkerUpdate />
                </AccessibleLayout>
              </DynamicFormProvider>
            </FormProvider>
          </AuthProvider>
        </LanguageProvider>
      </AccessibilityProvider>
    </ErrorBoundary>
  )
}

export default App