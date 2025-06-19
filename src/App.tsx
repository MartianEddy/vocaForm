import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { LanguageProvider } from './contexts/LanguageContext'
import { AuthProvider } from './contexts/AuthContext'
import { FormProvider } from './contexts/FormContext'
import { DynamicFormProvider } from './contexts/DynamicFormContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import AgentLogin from './pages/AgentLogin'
import AgentDashboard from './pages/AgentDashboard'
import FormFilling from './pages/FormFilling'
import DynamicFormFilling from './pages/DynamicFormFilling'
import FormTemplates from './pages/FormTemplates'
import ClientSession from './pages/ClientSession'

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <FormProvider>
          <DynamicFormProvider>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/agent/login" element={<AgentLogin />} />
                <Route path="/agent/dashboard" element={<AgentDashboard />} />
                <Route path="/templates" element={<FormTemplates />} />
                <Route path="/form/:templateId" element={<FormFilling />} />
                <Route path="/dynamic-form/:templateId" element={<DynamicFormFilling />} />
                <Route path="/client/:sessionId" element={<ClientSession />} />
              </Routes>
            </Layout>
          </DynamicFormProvider>
        </FormProvider>
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App