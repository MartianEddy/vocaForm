import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabaseHelpers } from '../lib/supabase'
import { useAnalytics } from '../lib/analytics'
import { FormData, FormTemplate } from '../types/form'

export function useSupabaseForm(templateId: string) {
  const { user } = useAuth()
  const { trackFormStart, trackFormCompleted, trackFormAbandoned } = useAnalytics()
  const [template, setTemplate] = useState<FormTemplate | null>(null)
  const [formData, setFormData] = useState<FormData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTemplate()
  }, [templateId])

  const loadTemplate = async () => {
    try {
      setLoading(true)
      const templateData = await supabaseHelpers.getFormTemplate(templateId)
      setTemplate(templateData)
      
      // Create new form session
      if (user) {
        const newFormData: FormData = {
          templateId,
          templateVersion: templateData.version,
          sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: user.id,
          values: {},
          confidences: {},
          completedFields: [],
          currentSection: templateData.template_data.sections[0]?.id || '',
          currentField: '',
          progress: 0,
          startedAt: new Date(),
          lastSavedAt: new Date()
        }

        setFormData(newFormData)
        
        // Track form start
        await trackFormStart(templateId, templateData.name)
        
        // Create session record
        await supabaseHelpers.createUserSession({
          user_id: user.id,
          template_id: templateId,
          status: 'active',
          start_time: new Date().toISOString(),
          progress: 0,
          voice_interactions: 0,
          retry_count: 0
        })
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const saveForm = async (data: FormData, isCompleted = false) => {
    if (!user || !template) return

    try {
      setSaving(true)
      
      const submissionData = {
        template_id: templateId,
        user_id: user.id,
        session_id: data.sessionId,
        form_data: data.values,
        status: isCompleted ? 'completed' : 'draft',
        confidence_scores: data.confidences,
        completion_time: isCompleted ? 
          Math.round((new Date().getTime() - data.startedAt.getTime()) / 1000) : null
      }

      await supabaseHelpers.saveFormSubmission(submissionData)
      
      // Update session
      await supabaseHelpers.updateUserSession(data.sessionId, {
        status: isCompleted ? 'completed' : 'active',
        progress: data.progress,
        end_time: isCompleted ? new Date().toISOString() : null,
        duration: isCompleted ? 
          Math.round((new Date().getTime() - data.startedAt.getTime()) / 60000) : null
      })

      if (isCompleted) {
        const voiceFields = Object.keys(data.confidences).length
        const totalFields = template.template_data.sections.reduce(
          (total: number, section: any) => total + section.fields.length, 0
        )
        
        await trackFormCompleted(
          templateId,
          Math.round((new Date().getTime() - data.startedAt.getTime()) / 1000),
          totalFields,
          voiceFields
        )
      }
      
      setFormData(data)
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setSaving(false)
    }
  }

  const abandonForm = async () => {
    if (!formData || !user) return

    try {
      await supabaseHelpers.updateUserSession(formData.sessionId, {
        status: 'abandoned',
        end_time: new Date().toISOString(),
        duration: Math.round((new Date().getTime() - formData.startedAt.getTime()) / 60000)
      })

      await trackFormAbandoned(
        templateId,
        formData.progress,
        Math.round((new Date().getTime() - formData.startedAt.getTime()) / 1000)
      )
    } catch (err: any) {
      console.error('Failed to track form abandonment:', err)
    }
  }

  const updateField = (fieldId: string, value: any, confidence?: number) => {
    if (!formData) return

    const updatedData = {
      ...formData,
      values: { ...formData.values, [fieldId]: value },
      confidences: confidence !== undefined 
        ? { ...formData.confidences, [fieldId]: confidence }
        : formData.confidences,
      lastSavedAt: new Date()
    }

    // Update completed fields
    if (value !== undefined && value !== null && value !== '') {
      if (!updatedData.completedFields.includes(fieldId)) {
        updatedData.completedFields = [...updatedData.completedFields, fieldId]
      }
    } else {
      updatedData.completedFields = updatedData.completedFields.filter(id => id !== fieldId)
    }

    setFormData(updatedData)
  }

  return {
    template,
    formData,
    loading,
    saving,
    error,
    saveForm,
    abandonForm,
    updateField,
    reload: loadTemplate
  }
}