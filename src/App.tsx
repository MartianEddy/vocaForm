import React, { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { LanguageProvider } from './contexts/LanguageContext'
import { AccessibilityProvider } from './contexts/AccessibilityContext'
import { AuthProvider } from './contexts/AuthContext'
import { FormProvider } from './contexts/FormContext'
import { DynamicFormProvider } from './contexts/DynamicFormContext'
import { analytics, trackWebVitals } from './lib/analytics'
import { paymentService } from './lib/stripe'
import AccessibleLayout from './components/AccessibleLayout'
import AccessibleHome from './pages/AccessibleHome'
import AuthPage from './pages/AuthPage'
import AgentLogin from './pages/AgentLogin'
import AgentDashboard from './pages/AgentDashboard'
import FormFilling from './pages/FormFilling'
import DynamicFormFilling from './pages/DynamicFormFilling'
import FormTemplates from './pages/FormTemplates'
import ClientSession from './pages/ClientSession'

function App() {
  useEffect(() => {
    // Initialize analytics
    analytics.initialize()
    
    // Initialize payment service
    paymentService.initialize()
    
    // Track web vitals
    trackWebVitals()
    
    // Track page views
    analytics.trackPageView('app_loaded')
  }, [])

  return (
    <AccessibilityProvider>
      <LanguageProvider>
        <AuthProvider>
          <FormProvider>
            <DynamicFormProvider>
              <AccessibleLayout>
                <Routes>
                  <Route path="/" element={<AccessibleHome />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/agent/login" element={<AgentLogin />} />
                  <Route path="/agent/dashboard" element={<AgentDashboard />} />
                  <Route path="/templates" element={<FormTemplates />} />
                  <Route path="/form/:templateId" element={<FormFilling />} />
                  <Route path="/dynamic-form/:templateId" element={<DynamicFormFilling />} />
                  <Route path="/client/:sessionId" element={<ClientSession />} />
                </Routes>
              </AccessibleLayout>
            </DynamicFormProvider>
          </FormProvider>
        </AuthProvider>
      </LanguageProvider>
    </AccessibilityProvider>
  )
}

export default App