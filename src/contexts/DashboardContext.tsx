import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Client, Session, DashboardStats, FormAnalytics, RevenueData, QueueSettings } from '../types/dashboard'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'

interface DashboardContextType {
  // Client Management
  clients: Client[]
  activeClient: Client | null
  setActiveClient: (client: Client | null) => void
  addClient: (client: Omit<Client, 'id' | 'joinedAt' | 'lastActivity'>) => void
  updateClient: (clientId: string, updates: Partial<Client>) => void
  removeClient: (clientId: string) => void
  addClientNote: (clientId: string, note: string) => void
  
  // Session Management
  sessions: Session[]
  currentSession: Session | null
  startSession: (clientId: string, formType: string, formId: string) => void
  endSession: (sessionId: string, completed: boolean) => void
  pauseSession: (sessionId: string) => void
  resumeSession: (sessionId: string) => void
  updateSession: (sessionId: string, updates: Partial<Session>) => void
  addSessionNote: (sessionId: string, note: string) => void
  
  // Analytics & Stats
  stats: DashboardStats
  formAnalytics: FormAnalytics[]
  revenueData: RevenueData[]
  getSessionHistory: (days?: number) => Session[]
  getClientHistory: (clientId: string) => Session[]
  
  // Queue Management
  queueSettings: QueueSettings
  updateQueueSettings: (settings: Partial<QueueSettings>) => void
  getQueuePosition: (clientId: string) => number
  getEstimatedWaitTime: (clientId: string) => number
  
  // Revenue Tracking
  calculateRevenue: (sessionId: string) => number
  getRevenueByPeriod: (startDate: Date, endDate: Date) => number
  
  // Utilities
  refreshData: () => void
  exportData: (type: 'clients' | 'sessions' | 'revenue', format: 'csv' | 'pdf') => void
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

// Mock data for demonstration
const generateMockClients = (): Client[] => [
  {
    id: '1',
    name: 'John Mwangi',
    email: 'john.mwangi@email.com',
    phone: '+254712345678',
    idNumber: '12345678',
    status: 'active',
    priority: 'normal',
    joinedAt: new Date(Date.now() - 30 * 60 * 1000),
    estimatedWaitTime: 0,
    currentForm: 'NTSA License Renewal',
    progress: 65,
    lastActivity: new Date(Date.now() - 5 * 60 * 1000),
    notes: ['Client prefers English', 'Has hearing difficulties - speak clearly'],
    sessionDuration: 25,
    completedForms: 2,
    totalRevenue: 1500
  },
  {
    id: '2',
    name: 'Mary Wanjiku',
    email: 'mary.wanjiku@email.com',
    phone: '+254723456789',
    status: 'waiting',
    priority: 'high',
    joinedAt: new Date(Date.now() - 10 * 60 * 1000),
    estimatedWaitTime: 15,
    progress: 0,
    lastActivity: new Date(Date.now() - 10 * 60 * 1000),
    notes: ['First time user', 'Needs assistance with voice commands'],
    completedForms: 0,
    totalRevenue: 0
  },
  {
    id: '3',
    name: 'Peter Ochieng',
    email: 'peter.ochieng@email.com',
    phone: '+254734567890',
    status: 'completed',
    priority: 'normal',
    joinedAt: new Date(Date.now() - 90 * 60 * 1000),
    progress: 100,
    lastActivity: new Date(Date.now() - 15 * 60 * 1000),
    notes: ['Completed NHIF registration successfully'],
    sessionDuration: 18,
    completedForms: 1,
    totalRevenue: 750
  },
  {
    id: '4',
    name: 'Grace Akinyi',
    email: 'grace.akinyi@email.com',
    phone: '+254745678901',
    status: 'paused',
    priority: 'urgent',
    joinedAt: new Date(Date.now() - 45 * 60 * 1000),
    currentForm: 'NSSF Contribution',
    progress: 40,
    lastActivity: new Date(Date.now() - 20 * 60 * 1000),
    notes: ['Technical issues with microphone', 'Switched to manual input'],
    sessionDuration: 35,
    completedForms: 3,
    totalRevenue: 2250
  }
]

const generateMockSessions = (): Session[] => [
  {
    id: 'session-1',
    clientId: '1',
    clientName: 'John Mwangi',
    formType: 'NTSA License Renewal',
    formId: 'ntsa-license',
    status: 'active',
    startTime: new Date(Date.now() - 25 * 60 * 1000),
    progress: 65,
    confidence: 0.85,
    revenue: 750,
    notes: ['Good voice clarity', 'Minor corrections needed'],
    fieldsCompleted: 5,
    totalFields: 8,
    retryCount: 2,
    lastActivity: new Date(Date.now() - 5 * 60 * 1000)
  },
  {
    id: 'session-2',
    clientId: '3',
    clientName: 'Peter Ochieng',
    formType: 'NHIF Registration',
    formId: 'nhif-registration',
    status: 'completed',
    startTime: new Date(Date.now() - 90 * 60 * 1000),
    endTime: new Date(Date.now() - 15 * 60 * 1000),
    duration: 18,
    progress: 100,
    confidence: 0.92,
    revenue: 750,
    notes: ['Excellent session', 'No issues encountered'],
    fieldsCompleted: 9,
    totalFields: 9,
    retryCount: 0,
    lastActivity: new Date(Date.now() - 15 * 60 * 1000)
  }
]

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>(generateMockClients())
  const [activeClient, setActiveClient] = useState<Client | null>(null)
  const [sessions, setSessions] = useState<Session[]>(generateMockSessions())
  const [currentSession, setCurrentSession] = useState<Session | null>(null)
  const [queueSettings, setQueueSettings] = useState<QueueSettings>({
    maxWaitTime: 30,
    priorityWeights: { urgent: 4, high: 3, normal: 2, low: 1 },
    autoAssignment: true,
    notifications: true
  })

  // Calculate dashboard statistics
  const stats: DashboardStats = {
    totalClients: clients.length,
    activeClients: clients.filter(c => c.status === 'active').length,
    completedToday: sessions.filter(s => 
      s.status === 'completed' && 
      format(s.endTime || new Date(), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
    ).length,
    totalRevenue: clients.reduce((sum, c) => sum + c.totalRevenue, 0),
    dailyRevenue: sessions
      .filter(s => format(s.startTime, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'))
      .reduce((sum, s) => sum + s.revenue, 0),
    weeklyRevenue: sessions
      .filter(s => s.startTime >= subDays(new Date(), 7))
      .reduce((sum, s) => sum + s.revenue, 0),
    monthlyRevenue: sessions
      .filter(s => s.startTime >= subDays(new Date(), 30))
      .reduce((sum, s) => sum + s.revenue, 0),
    averageSessionTime: sessions.length > 0 
      ? sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / sessions.length 
      : 0,
    averageConfidence: sessions.length > 0
      ? sessions.reduce((sum, s) => sum + s.confidence, 0) / sessions.length
      : 0,
    totalSessions: sessions.length,
    successRate: sessions.length > 0
      ? (sessions.filter(s => s.status === 'completed').length / sessions.length) * 100
      : 0
  }

  // Form analytics
  const formAnalytics: FormAnalytics[] = [
    {
      templateId: 'ntsa-license',
      templateName: 'NTSA License Renewal',
      totalUsage: 45,
      completionRate: 89,
      averageTime: 22,
      averageConfidence: 0.87,
      revenue: 33750,
      popularFields: ['Full Name', 'ID Number', 'License Number'],
      commonIssues: ['Date format confusion', 'Address clarity']
    },
    {
      templateId: 'nhif-registration',
      templateName: 'NHIF Registration',
      totalUsage: 38,
      completionRate: 94,
      averageTime: 18,
      averageConfidence: 0.91,
      revenue: 28500,
      popularFields: ['Full Name', 'ID Number', 'Phone Number'],
      commonIssues: ['Employer number confusion']
    },
    {
      templateId: 'nssf-contribution',
      templateName: 'NSSF Contribution',
      totalUsage: 32,
      completionRate: 85,
      averageTime: 25,
      averageConfidence: 0.83,
      revenue: 24000,
      popularFields: ['Full Name', 'NSSF Number', 'Salary'],
      commonIssues: ['Salary amount clarity', 'Employment dates']
    }
  ]

  // Revenue data for charts
  const revenueData: RevenueData[] = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 29 - i)
    return {
      date: format(date, 'yyyy-MM-dd'),
      amount: Math.floor(Math.random() * 5000) + 1000,
      sessions: Math.floor(Math.random() * 20) + 5,
      clients: Math.floor(Math.random() * 15) + 3
    }
  })

  const addClient = (clientData: Omit<Client, 'id' | 'joinedAt' | 'lastActivity'>) => {
    const newClient: Client = {
      ...clientData,
      id: `client-${Date.now()}`,
      joinedAt: new Date(),
      lastActivity: new Date()
    }
    setClients(prev => [...prev, newClient])
  }

  const updateClient = (clientId: string, updates: Partial<Client>) => {
    setClients(prev => prev.map(client => 
      client.id === clientId 
        ? { ...client, ...updates, lastActivity: new Date() }
        : client
    ))
  }

  const removeClient = (clientId: string) => {
    setClients(prev => prev.filter(client => client.id !== clientId))
    if (activeClient?.id === clientId) {
      setActiveClient(null)
    }
  }

  const addClientNote = (clientId: string, note: string) => {
    updateClient(clientId, {
      notes: [...(clients.find(c => c.id === clientId)?.notes || []), note]
    })
  }

  const startSession = (clientId: string, formType: string, formId: string) => {
    const client = clients.find(c => c.id === clientId)
    if (!client) return

    const newSession: Session = {
      id: `session-${Date.now()}`,
      clientId,
      clientName: client.name,
      formType,
      formId,
      status: 'active',
      startTime: new Date(),
      progress: 0,
      confidence: 0,
      revenue: 0,
      notes: [],
      fieldsCompleted: 0,
      totalFields: 8, // Default, should be based on form template
      retryCount: 0,
      lastActivity: new Date()
    }

    setSessions(prev => [...prev, newSession])
    setCurrentSession(newSession)
    updateClient(clientId, { status: 'active', currentForm: formType })
  }

  const endSession = (sessionId: string, completed: boolean) => {
    const session = sessions.find(s => s.id === sessionId)
    if (!session) return

    const endTime = new Date()
    const duration = Math.round((endTime.getTime() - session.startTime.getTime()) / (1000 * 60))
    const revenue = calculateRevenue(sessionId)

    setSessions(prev => prev.map(s => 
      s.id === sessionId 
        ? { 
            ...s, 
            status: completed ? 'completed' : 'cancelled',
            endTime,
            duration,
            revenue,
            progress: completed ? 100 : s.progress
          }
        : s
    ))

    updateClient(session.clientId, {
      status: completed ? 'completed' : 'waiting',
      progress: completed ? 100 : session.progress,
      completedForms: completed 
        ? (clients.find(c => c.id === session.clientId)?.completedForms || 0) + 1
        : (clients.find(c => c.id === session.clientId)?.completedForms || 0),
      totalRevenue: (clients.find(c => c.id === session.clientId)?.totalRevenue || 0) + revenue
    })

    if (currentSession?.id === sessionId) {
      setCurrentSession(null)
    }
  }

  const pauseSession = (sessionId: string) => {
    setSessions(prev => prev.map(s => 
      s.id === sessionId ? { ...s, status: 'paused' as const } : s
    ))
    
    const session = sessions.find(s => s.id === sessionId)
    if (session) {
      updateClient(session.clientId, { status: 'paused' })
    }
  }

  const resumeSession = (sessionId: string) => {
    setSessions(prev => prev.map(s => 
      s.id === sessionId ? { ...s, status: 'active' as const, lastActivity: new Date() } : s
    ))
    
    const session = sessions.find(s => s.id === sessionId)
    if (session) {
      updateClient(session.clientId, { status: 'active' })
      setCurrentSession(session)
    }
  }

  const updateSession = (sessionId: string, updates: Partial<Session>) => {
    setSessions(prev => prev.map(s => 
      s.id === sessionId 
        ? { ...s, ...updates, lastActivity: new Date() }
        : s
    ))
  }

  const addSessionNote = (sessionId: string, note: string) => {
    const session = sessions.find(s => s.id === sessionId)
    if (session) {
      updateSession(sessionId, {
        notes: [...session.notes, note]
      })
    }
  }

  const getSessionHistory = (days = 30) => {
    const cutoffDate = subDays(new Date(), days)
    return sessions.filter(s => s.startTime >= cutoffDate)
  }

  const getClientHistory = (clientId: string) => {
    return sessions.filter(s => s.clientId === clientId)
  }

  const updateQueueSettings = (settings: Partial<QueueSettings>) => {
    setQueueSettings(prev => ({ ...prev, ...settings }))
  }

  const getQueuePosition = (clientId: string) => {
    const waitingClients = clients
      .filter(c => c.status === 'waiting')
      .sort((a, b) => {
        const priorityDiff = queueSettings.priorityWeights[b.priority] - queueSettings.priorityWeights[a.priority]
        if (priorityDiff !== 0) return priorityDiff
        return a.joinedAt.getTime() - b.joinedAt.getTime()
      })
    
    return waitingClients.findIndex(c => c.id === clientId) + 1
  }

  const getEstimatedWaitTime = (clientId: string) => {
    const position = getQueuePosition(clientId)
    const averageSessionTime = stats.averageSessionTime || 20
    return Math.max(0, (position - 1) * averageSessionTime)
  }

  const calculateRevenue = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId)
    if (!session) return 0

    // Base rate per form type
    const baseRates = {
      'NTSA License Renewal': 750,
      'NHIF Registration': 750,
      'NSSF Contribution': 750,
      'Contact Form': 500
    }

    const baseRate = baseRates[session.formType as keyof typeof baseRates] || 500
    const completionMultiplier = session.progress / 100
    const confidenceBonus = session.confidence > 0.9 ? 1.1 : 1.0

    return Math.round(baseRate * completionMultiplier * confidenceBonus)
  }

  const getRevenueByPeriod = (startDate: Date, endDate: Date) => {
    return sessions
      .filter(s => s.startTime >= startDate && s.startTime <= endDate)
      .reduce((sum, s) => sum + s.revenue, 0)
  }

  const refreshData = () => {
    // In a real app, this would fetch fresh data from the API
    console.log('Refreshing dashboard data...')
  }

  const exportData = (type: 'clients' | 'sessions' | 'revenue', format: 'csv' | 'pdf') => {
    // Implementation would depend on the specific export requirements
    console.log(`Exporting ${type} data as ${format}`)
  }

  return (
    <DashboardContext.Provider value={{
      clients,
      activeClient,
      setActiveClient,
      addClient,
      updateClient,
      removeClient,
      addClientNote,
      sessions,
      currentSession,
      startSession,
      endSession,
      pauseSession,
      resumeSession,
      updateSession,
      addSessionNote,
      stats,
      formAnalytics,
      revenueData,
      getSessionHistory,
      getClientHistory,
      queueSettings,
      updateQueueSettings,
      getQueuePosition,
      getEstimatedWaitTime,
      calculateRevenue,
      getRevenueByPeriod,
      refreshData,
      exportData
    }}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider')
  }
  return context
}