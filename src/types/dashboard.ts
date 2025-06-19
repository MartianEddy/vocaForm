export interface Client {
  id: string
  name: string
  email?: string
  phone?: string
  idNumber?: string
  status: 'waiting' | 'active' | 'completed' | 'paused'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  joinedAt: Date
  estimatedWaitTime?: number
  currentForm?: string
  progress: number
  lastActivity: Date
  notes: string[]
  sessionDuration?: number
  completedForms: number
  totalRevenue: number
}

export interface Session {
  id: string
  clientId: string
  clientName: string
  formType: string
  formId: string
  status: 'active' | 'completed' | 'paused' | 'cancelled'
  startTime: Date
  endTime?: Date
  duration?: number
  progress: number
  confidence: number
  revenue: number
  notes: string[]
  fieldsCompleted: number
  totalFields: number
  retryCount: number
  lastActivity: Date
}

export interface DashboardStats {
  totalClients: number
  activeClients: number
  completedToday: number
  totalRevenue: number
  dailyRevenue: number
  weeklyRevenue: number
  monthlyRevenue: number
  averageSessionTime: number
  averageConfidence: number
  totalSessions: number
  successRate: number
}

export interface FormAnalytics {
  templateId: string
  templateName: string
  totalUsage: number
  completionRate: number
  averageTime: number
  averageConfidence: number
  revenue: number
  popularFields: string[]
  commonIssues: string[]
}

export interface RevenueData {
  date: string
  amount: number
  sessions: number
  clients: number
}

export interface QueueSettings {
  maxWaitTime: number
  priorityWeights: {
    urgent: number
    high: number
    normal: number
    low: number
  }
  autoAssignment: boolean
  notifications: boolean
}