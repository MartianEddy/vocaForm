export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'user' | 'agent' | 'admin'
          subscription_status: 'free' | 'premium' | 'enterprise'
          created_at: string
          updated_at: string
          last_login: string | null
          preferences: any | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'agent' | 'admin'
          subscription_status?: 'free' | 'premium' | 'enterprise'
          created_at?: string
          updated_at?: string
          last_login?: string | null
          preferences?: any | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'agent' | 'admin'
          subscription_status?: 'free' | 'premium' | 'enterprise'
          created_at?: string
          updated_at?: string
          last_login?: string | null
          preferences?: any | null
        }
      }
      form_templates: {
        Row: {
          id: string
          name: string
          description: string
          category: string
          version: string
          template_data: any
          is_active: boolean
          created_by: string
          created_at: string
          updated_at: string
          usage_count: number
          tags: string[]
        }
        Insert: {
          id?: string
          name: string
          description: string
          category: string
          version: string
          template_data: any
          is_active?: boolean
          created_by: string
          created_at?: string
          updated_at?: string
          usage_count?: number
          tags?: string[]
        }
        Update: {
          id?: string
          name?: string
          description?: string
          category?: string
          version?: string
          template_data?: any
          is_active?: boolean
          created_by?: string
          created_at?: string
          updated_at?: string
          usage_count?: number
          tags?: string[]
        }
      }
      form_submissions: {
        Row: {
          id: string
          template_id: string
          user_id: string
          session_id: string
          form_data: any
          status: 'draft' | 'completed' | 'submitted'
          confidence_scores: any
          completion_time: number | null
          created_at: string
          updated_at: string
          submitted_at: string | null
        }
        Insert: {
          id?: string
          template_id: string
          user_id: string
          session_id: string
          form_data: any
          status?: 'draft' | 'completed' | 'submitted'
          confidence_scores?: any
          completion_time?: number | null
          created_at?: string
          updated_at?: string
          submitted_at?: string | null
        }
        Update: {
          id?: string
          template_id?: string
          user_id?: string
          session_id?: string
          form_data?: any
          status?: 'draft' | 'completed' | 'submitted'
          confidence_scores?: any
          completion_time?: number | null
          created_at?: string
          updated_at?: string
          submitted_at?: string | null
        }
      }
      user_sessions: {
        Row: {
          id: string
          user_id: string
          template_id: string
          status: 'active' | 'paused' | 'completed' | 'abandoned'
          start_time: string
          end_time: string | null
          duration: number | null
          progress: number
          voice_interactions: number
          retry_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          template_id: string
          status?: 'active' | 'paused' | 'completed' | 'abandoned'
          start_time?: string
          end_time?: string | null
          duration?: number | null
          progress?: number
          voice_interactions?: number
          retry_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          template_id?: string
          status?: 'active' | 'paused' | 'completed' | 'abandoned'
          start_time?: string
          end_time?: string | null
          duration?: number | null
          progress?: number
          voice_interactions?: number
          retry_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      analytics_events: {
        Row: {
          id: string
          user_id: string | null
          session_id: string | null
          event_type: string
          event_data: any
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          event_type: string
          event_data?: any
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          event_type?: string
          event_data?: any
          created_at?: string
        }
      }
      subscription_plans: {
        Row: {
          id: string
          name: string
          description: string
          price: number
          currency: string
          interval: 'month' | 'year'
          features: string[]
          stripe_price_id: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          price: number
          currency: string
          interval: 'month' | 'year'
          features: string[]
          stripe_price_id: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          price?: number
          currency?: string
          interval?: 'month' | 'year'
          features?: string[]
          stripe_price_id?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}