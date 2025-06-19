import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, FileText, Clock, Plus, Eye, Download } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { format } from 'date-fns'

interface ClientSession {
  id: string
  clientName: string
  formType: string
  status: 'active' | 'completed' | 'paused'
  startTime: Date
  progress: number
  lastActivity: Date
}

export default function AgentDashboard() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  
  const [sessions, setSessions] = useState<ClientSession[]>([])

  useEffect(() => {
    if (!user) {
      navigate('/agent/login')
      return
    }

    // Mock data for demo
    const mockSessions: ClientSession[] = [
      {
        id: '1',
        clientName: 'John Mwangi',
        formType: 'NTSA Driver\'s License',
        status: 'active',
        startTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        progress: 65,
        lastActivity: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
      },
      {
        id: '2',
        clientName: 'Mary Wanjiku',
        formType: 'NHIF Registration',
        status: 'completed',
        startTime: new Date(Date.now() - 90 * 60 * 1000), // 90 minutes ago
        progress: 100,
        lastActivity: new Date(Date.now() - 15 * 60 * 1000) // 15 minutes ago
      },
      {
        id: '3',
        clientName: 'Peter Ochieng',
        formType: 'NSSF Contribution',
        status: 'paused',
        startTime: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
        progress: 40,
        lastActivity: new Date(Date.now() - 20 * 60 * 1000) // 20 minutes ago
      }
    ]
    
    setSessions(mockSessions)
  }, [user, navigate])

  if (!user) {
    return null
  }

  const activeSessions = sessions.filter(s => s.status === 'active')
  const completedToday = sessions.filter(s => 
    s.status === 'completed' && 
    format(s.lastActivity, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  )

  const getStatusColor = (status: ClientSession['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleNewSession = () => {
    // In a real app, this would create a new client session
    navigate('/templates')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {t('agent.dashboard')}
        </h1>
        <p className="text-gray-600 mt-1">
          Welcome back, {user.name}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Clients</p>
              <p className="text-2xl font-bold text-gray-900">
                {activeSessions.length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed Today</p>
              <p className="text-2xl font-bold text-gray-900">
                {completedToday.length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900">
                {sessions.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mb-8">
        <button
          onClick={handleNewSession}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>{t('agent.newSession')}</span>
        </button>
      </div>

      {/* Active Sessions */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {t('agent.clients')}
          </h2>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No client sessions yet</p>
            <button
              onClick={handleNewSession}
              className="btn-primary mt-4"
            >
              Start First Session
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {session.clientName}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                        {session.status}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {session.formType}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>
                        Started: {format(session.startTime, 'HH:mm')}
                      </span>
                      <span>
                        Last activity: {format(session.lastActivity, 'HH:mm')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {/* Progress */}
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {session.progress}%
                      </p>
                      <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${session.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button
                        className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="View Session"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      
                      {session.status === 'completed' && (
                        <button
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Download PDF"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}