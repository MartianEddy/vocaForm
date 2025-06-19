import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/supabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database helper functions
export const supabaseHelpers = {
  // Form Templates
  async getFormTemplates() {
    const { data, error } = await supabase
      .from('form_templates')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getFormTemplate(id: string) {
    const { data, error } = await supabase
      .from('form_templates')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async createFormTemplate(template: any) {
    const { data, error } = await supabase
      .from('form_templates')
      .insert(template)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Form Submissions
  async saveFormSubmission(submission: any) {
    const { data, error } = await supabase
      .from('form_submissions')
      .insert(submission)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getFormSubmissions(userId?: string) {
    let query = supabase
      .from('form_submissions')
      .select(`
        *,
        form_templates (
          name,
          category
        )
      `)
      .order('created_at', { ascending: false })
    
    if (userId) {
      query = query.eq('user_id', userId)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data
  },

  // User Sessions
  async createUserSession(session: any) {
    const { data, error } = await supabase
      .from('user_sessions')
      .insert(session)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateUserSession(sessionId: string, updates: any) {
    const { data, error } = await supabase
      .from('user_sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Analytics
  async trackEvent(event: any) {
    const { data, error } = await supabase
      .from('analytics_events')
      .insert(event)
    
    if (error) throw error
    return data
  },

  async getAnalytics(startDate: Date, endDate: Date) {
    const { data, error } = await supabase
      .from('analytics_events')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // User Profiles
  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data
  },

  async updateUserProfile(userId: string, updates: any) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}