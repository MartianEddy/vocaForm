import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  FileText, 
  History,
  Settings,
  RefreshCw
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { DashboardProvider } from '../contexts/DashboardContext'
import DashboardStats from '../components/DashboardStats'
import ClientQueue from '../components/ClientQueue'
import RevenueChart from '../components/RevenueChart'
import FormAnalytics from '../components/FormAnalytics'
import SessionHistory from '../components/SessionHistory'

type DashboardView = 'overview' | 'queue' | 'analytics' | 'forms' | 'history'

export default function AgentDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeView, setActiveView] = useState<DashboardView>('overview')

  if (!user) {
    navigate('/agent/login')
    return null
  }

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'queue', label: 'Client Queue', icon: Users },
    { id: 'analytics', label: 'Revenue Analytics', icon: BarChart3 },
    { id: 'forms', label: 'Form Analytics', icon: FileText },
    { id: 'history', label: 'Session History', icon: History }
  ]

  const renderContent = () => {
    switch (activeView) {
      case 'overview':
        return (
          <div className="space-y-8">
            <DashboardStats />
            <RevenueChart />
          </div>
        )
      case 'queue':
        return <ClientQueue />
      case 'analytics':
        return <RevenueChart />
      case 'forms':
        return <FormAnalytics />
      case 'history':
        return <SessionHistory />
      default:
        return <DashboardStats />
    }
  }

  return (
    <DashboardProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Agent Dashboard
                </h1>
                <p className="text-gray-600 mt-1">
                  Welcome back, {user.name}
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <button className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                  <RefreshCw className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                  <Settings className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex space-x-8">
            {/* Sidebar Navigation */}
            <div className="w-64 flex-shrink-0">
              <nav className="space-y-2">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id as DashboardView)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeView === item.id
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </DashboardProvider>
  )
}