import React, { useState } from 'react'
import { 
  Users, 
  Clock, 
  AlertCircle, 
  Play, 
  Pause, 
  CheckCircle, 
  X,
  MessageSquare,
  Phone,
  Mail,
  User,
  ArrowUp,
  ArrowDown,
  Settings,
  Plus,
  Edit3
} from 'lucide-react'
import { useDashboard } from '../contexts/DashboardContext'
import { Client } from '../types/dashboard'
import { format } from 'date-fns'

export default function ClientQueue() {
  const {
    clients,
    activeClient,
    setActiveClient,
    updateClient,
    removeClient,
    addClientNote,
    startSession,
    getQueuePosition,
    getEstimatedWaitTime,
    queueSettings,
    updateQueueSettings
  } = useDashboard()

  const [showSettings, setShowSettings] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [selectedClient, setSelectedClient] = useState<string | null>(null)
  const [showAddClient, setShowAddClient] = useState(false)
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    priority: 'normal' as Client['priority']
  })

  const getPriorityColor = (priority: Client['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'normal':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: Client['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'waiting':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'paused':
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: Client['status']) => {
    switch (status) {
      case 'active':
        return <Play className="h-4 w-4" />
      case 'waiting':
        return <Clock className="h-4 w-4" />
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'paused':
        return <Pause className="h-4 w-4" />
    }
  }

  const handleStartSession = (client: Client) => {
    const formType = 'NTSA License Renewal' // Default for demo
    const formId = 'ntsa-license'
    startSession(client.id, formType, formId)
    setActiveClient(client)
  }

  const handleAddNote = (clientId: string) => {
    if (noteText.trim()) {
      addClientNote(clientId, noteText.trim())
      setNoteText('')
      setSelectedClient(null)
    }
  }

  const handlePriorityChange = (clientId: string, priority: Client['priority']) => {
    updateClient(clientId, { priority })
  }

  const handleAddClient = () => {
    if (newClient.name.trim()) {
      const clientData = {
        ...newClient,
        status: 'waiting' as const,
        progress: 0,
        notes: [],
        completedForms: 0,
        totalRevenue: 0
      }
      // addClient(clientData) // This would be implemented in the context
      setNewClient({ name: '', email: '', phone: '', priority: 'normal' })
      setShowAddClient(false)
    }
  }

  const sortedClients = [...clients].sort((a, b) => {
    const statusOrder = { active: 0, waiting: 1, paused: 2, completed: 3 }
    const statusDiff = statusOrder[a.status] - statusOrder[b.status]
    if (statusDiff !== 0) return statusDiff

    const priorityDiff = queueSettings.priorityWeights[b.priority] - queueSettings.priorityWeights[a.priority]
    if (priorityDiff !== 0) return priorityDiff

    return a.joinedAt.getTime() - b.joinedAt.getTime()
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="h-6 w-6 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900">Client Queue</h2>
          <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-sm font-medium">
            {clients.filter(c => c.status === 'waiting').length} waiting
          </span>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setShowAddClient(true)}
            className="btn-primary flex items-center space-x-2 text-sm px-3 py-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Client</span>
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Add Client Modal */}
      {showAddClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Client</h3>
            <div className="space-y-4">
              <div>
                <label className="form-label">Name *</label>
                <input
                  type="text"
                  value={newClient.name}
                  onChange={(e) => setNewClient(prev => ({ ...prev, name: e.target.value }))}
                  className="form-input"
                  placeholder="Client full name"
                />
              </div>
              <div>
                <label className="form-label">Email</label>
                <input
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient(prev => ({ ...prev, email: e.target.value }))}
                  className="form-input"
                  placeholder="client@email.com"
                />
              </div>
              <div>
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  value={newClient.phone}
                  onChange={(e) => setNewClient(prev => ({ ...prev, phone: e.target.value }))}
                  className="form-input"
                  placeholder="+254712345678"
                />
              </div>
              <div>
                <label className="form-label">Priority</label>
                <select
                  value={newClient.priority}
                  onChange={(e) => setNewClient(prev => ({ ...prev, priority: e.target.value as Client['priority'] }))}
                  className="form-input"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleAddClient}
                className="btn-primary flex-1"
                disabled={!newClient.name.trim()}
              >
                Add Client
              </button>
              <button
                onClick={() => setShowAddClient(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Queue Settings */}
      {showSettings && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <h3 className="font-medium text-gray-900">Queue Settings</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Wait Time (minutes)
              </label>
              <input
                type="number"
                value={queueSettings.maxWaitTime}
                onChange={(e) => updateQueueSettings({ maxWaitTime: parseInt(e.target.value) })}
                className="form-input text-sm"
                min="5"
                max="120"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Priority Weights
              </label>
              {Object.entries(queueSettings.priorityWeights).map(([priority, weight]) => (
                <div key={priority} className="flex items-center space-x-2">
                  <span className="text-sm capitalize w-16">{priority}:</span>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => updateQueueSettings({
                      priorityWeights: {
                        ...queueSettings.priorityWeights,
                        [priority]: parseInt(e.target.value)
                      }
                    })}
                    className="form-input text-sm w-16"
                    min="1"
                    max="10"
                  />
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={queueSettings.autoAssignment}
                onChange={(e) => updateQueueSettings({ autoAssignment: e.target.checked })}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Auto-assign next client</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={queueSettings.notifications}
                onChange={(e) => updateQueueSettings({ notifications: e.target.checked })}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Enable notifications</span>
            </label>
          </div>
        </div>
      )}

      {/* Client List */}
      <div className="space-y-4">
        {sortedClients.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No clients in queue</p>
            <button
              onClick={() => setShowAddClient(true)}
              className="btn-primary mt-4"
            >
              Add First Client
            </button>
          </div>
        ) : (
          sortedClients.map((client) => (
            <div
              key={client.id}
              className={`border rounded-lg p-4 transition-all ${
                activeClient?.id === client.id 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-gray-200 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {client.name}
                    </h3>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(client.status)}
                          <span>{client.status}</span>
                        </div>
                      </span>
                      
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(client.priority)}`}>
                        {client.priority}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="space-y-1">
                      {client.email && (
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4" />
                          <span>{client.email}</span>
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4" />
                          <span>{client.phone}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <div>Joined: {format(client.joinedAt, 'HH:mm')}</div>
                      <div>Last activity: {format(client.lastActivity, 'HH:mm')}</div>
                      {client.status === 'waiting' && (
                        <div className="text-yellow-600">
                          Position: #{getQueuePosition(client.id)} 
                          (Est. wait: {getEstimatedWaitTime(client.id)}min)
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {client.currentForm && (
                    <div className="mt-2">
                      <div className="text-sm text-gray-700">
                        Current form: <span className="font-medium">{client.currentForm}</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${client.progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{client.progress}%</span>
                      </div>
                    </div>
                  )}
                  
                  {client.notes.length > 0 && (
                    <div className="mt-2">
                      <div className="text-xs text-gray-500">
                        Latest note: {client.notes[client.notes.length - 1]}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-2 ml-4">
                  {client.status === 'waiting' && (
                    <button
                      onClick={() => handleStartSession(client)}
                      className="btn-primary text-sm px-3 py-2"
                    >
                      Start Session
                    </button>
                  )}
                  
                  {client.status === 'active' && (
                    <button
                      onClick={() => setActiveClient(client)}
                      className="btn-secondary text-sm px-3 py-2"
                    >
                      View Session
                    </button>
                  )}
                  
                  <div className="flex space-x-1">
                    <button
                      onClick={() => setSelectedClient(client.id)}
                      className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                      title="Add Note"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </button>
                    
                    <div className="relative">
                      <select
                        value={client.priority}
                        onChange={(e) => handlePriorityChange(client.id, e.target.value as Client['priority'])}
                        className="p-2 text-gray-600 hover:text-primary-600 bg-transparent border-none focus:ring-0 text-xs"
                        title="Change Priority"
                      >
                        <option value="low">Low</option>
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                    
                    <button
                      onClick={() => removeClient(client.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Remove Client"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Add Note Section */}
              {selectedClient === client.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Add a note about this client..."
                      className="form-input flex-1 text-sm"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddNote(client.id)}
                    />
                    <button
                      onClick={() => handleAddNote(client.id)}
                      className="btn-primary text-sm px-3 py-2"
                      disabled={!noteText.trim()}
                    >
                      Add Note
                    </button>
                    <button
                      onClick={() => setSelectedClient(null)}
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