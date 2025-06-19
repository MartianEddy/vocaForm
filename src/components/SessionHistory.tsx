import React, { useState } from 'react'
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Clock,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  MessageSquare
} from 'lucide-react'
import { useDashboard } from '../contexts/DashboardContext'
import { Session } from '../types/dashboard'
import { format } from 'date-fns'

export default function SessionHistory() {
  const { sessions, getSessionHistory, addSessionNote } = useDashboard()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | Session['status']>('all')
  const [dateRange, setDateRange] = useState<'today' | '7d' | '30d' | 'all'>('30d')
  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')

  const getFilteredSessions = () => {
    let filtered = sessions

    // Date filter
    if (dateRange !== 'all') {
      const days = dateRange === 'today' ? 1 : dateRange === '7d' ? 7 : 30
      filtered = getSessionHistory(days)
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(s => s.status === statusFilter)
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.formType.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filtered.sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
  }

  const getStatusIcon = (status: Session['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'active':
        return <Play className="h-4 w-4 text-blue-600" />
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-600" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />
    }
  }

  const getStatusColor = (status: Session['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'active':
        return 'bg-blue-100 text-blue-800'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600'
    if (confidence >= 0.8) return 'text-blue-600'
    if (confidence >= 0.7) return 'text-yellow-600'
    return 'text-red-600'
  }

  const handleAddNote = (sessionId: string) => {
    if (noteText.trim()) {
      addSessionNote(sessionId, noteText.trim())
      setNoteText('')
      setSelectedSession(null)
    }
  }

  const filteredSessions = getFilteredSessions()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <History className="h-6 w-6 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900">Session History</h2>
          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm font-medium">
            {filteredSessions.length} sessions
          </span>
        </div>
        
        <button className="btn-secondary flex items-center space-x-2 text-sm">
          <Download className="h-4 w-4" />
          <span>Export</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="form-label text-sm">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by client or form..."
                className="form-input pl-10 text-sm"
              />
            </div>
          </div>
          
          <div>
            <label className="form-label text-sm">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="form-input text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div>
            <label className="form-label text-sm">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="form-input text-sm"
            >
              <option value="today">Today</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="all">All time</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button className="btn-secondary w-full flex items-center justify-center space-x-2 text-sm">
              <Filter className="h-4 w-4" />
              <span>More Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No sessions found matching your criteria</p>
          </div>
        ) : (
          filteredSessions.map((session) => (
            <div key={session.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {session.clientName}
                    </h3>
                    
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(session.status)}
                        <span>{session.status}</span>
                      </div>
                    </span>
                    
                    <span className="text-sm text-gray-600">
                      {session.formType}
                    </span>
                  </div>
                  
                  <div className="grid md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Started:</span> {format(session.startTime, 'MMM dd, HH:mm')}
                    </div>
                    
                    <div>
                      <span className="font-medium">Duration:</span> {session.duration || 'Ongoing'} min
                    </div>
                    
                    <div>
                      <span className="font-medium">Progress:</span> {session.progress}% 
                      ({session.fieldsCompleted}/{session.totalFields} fields)
                    </div>
                    
                    <div>
                      <span className="font-medium">Confidence:</span> 
                      <span className={`ml-1 font-semibold ${getConfidenceColor(session.confidence)}`}>
                        {Math.round(session.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">
                          Last activity: {format(session.lastActivity, 'HH:mm')}
                        </span>
                      </div>
                      
                      {session.retryCount > 0 && (
                        <div className="text-yellow-600">
                          {session.retryCount} retries
                        </div>
                      )}
                    </div>
                    
                    <div className="text-lg font-semibold text-primary-600">
                      KSh {session.revenue.toLocaleString()}
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Completion Progress</span>
                      <span>{session.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          session.status === 'completed' ? 'bg-green-500' :
                          session.status === 'active' ? 'bg-blue-500' :
                          session.status === 'paused' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${session.progress}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Notes Preview */}
                  {session.notes.length > 0 && (
                    <div className="mt-3 text-sm text-gray-600">
                      <span className="font-medium">Latest note:</span> {session.notes[session.notes.length - 1]}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-2 ml-4">
                  <button
                    className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={() => setSelectedSession(session.id)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Add Note"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </button>
                  
                  <button
                    className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                    title="Download Report"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {/* Add Note Section */}
              {selectedSession === session.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Add a note about this session..."
                      className="form-input flex-1 text-sm"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddNote(session.id)}
                    />
                    <button
                      onClick={() => handleAddNote(session.id)}
                      className="btn-primary text-sm px-3 py-2"
                      disabled={!noteText.trim()}
                    >
                      Add Note
                    </button>
                    <button
                      onClick={() => setSelectedSession(null)}
                      className="btn-secondary text-sm px-3 py-2"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}