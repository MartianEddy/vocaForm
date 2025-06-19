import React from 'react'
import { 
  Users, 
  FileText, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  Target,
  Award,
  Activity
} from 'lucide-react'
import { useDashboard } from '../contexts/DashboardContext'

export default function DashboardStats() {
  const { stats } = useDashboard()

  const statCards = [
    {
      title: 'Active Clients',
      value: stats.activeClients,
      total: stats.totalClients,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: '+12%',
      changeType: 'positive' as const
    },
    {
      title: 'Completed Today',
      value: stats.completedToday,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: '+8%',
      changeType: 'positive' as const
    },
    {
      title: 'Daily Revenue',
      value: `KSh ${stats.dailyRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: '+15%',
      changeType: 'positive' as const
    },
    {
      title: 'Avg Session Time',
      value: `${Math.round(stats.averageSessionTime)}min`,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      change: '-5%',
      changeType: 'positive' as const
    },
    {
      title: 'Success Rate',
      value: `${Math.round(stats.successRate)}%`,
      icon: Target,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      change: '+3%',
      changeType: 'positive' as const
    },
    {
      title: 'Avg Confidence',
      value: `${Math.round(stats.averageConfidence * 100)}%`,
      icon: Award,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      change: '+2%',
      changeType: 'positive' as const
    }
  ]

  const getChangeColor = (type: 'positive' | 'negative') => {
    return type === 'positive' ? 'text-green-600' : 'text-red-600'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Dashboard Overview</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Activity className="h-4 w-4" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="card hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <h3 className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </h3>
                </div>
                
                <div className="flex items-baseline space-x-2">
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  {stat.total && (
                    <p className="text-sm text-gray-500">
                      / {stat.total}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center space-x-1 mt-1">
                  <TrendingUp className={`h-3 w-3 ${getChangeColor(stat.changeType)}`} />
                  <span className={`text-xs font-medium ${getChangeColor(stat.changeType)}`}>
                    {stat.change}
                  </span>
                  <span className="text-xs text-gray-500">vs yesterday</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Summary */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Today</span>
              <span className="font-semibold text-gray-900">
                KSh {stats.dailyRevenue.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">This Week</span>
              <span className="font-semibold text-gray-900">
                KSh {stats.weeklyRevenue.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">This Month</span>
              <span className="font-semibold text-gray-900">
                KSh {stats.monthlyRevenue.toLocaleString()}
              </span>
            </div>
            <div className="pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-gray-900 font-medium">Total Revenue</span>
                <span className="font-bold text-lg text-primary-600">
                  KSh {stats.totalRevenue.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Sessions</span>
              <span className="font-semibold text-gray-900">
                {stats.totalSessions}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Avg Duration</span>
              <span className="font-semibold text-gray-900">
                {Math.round(stats.averageSessionTime)} min
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Success Rate</span>
              <span className="font-semibold text-gray-900">
                {Math.round(stats.successRate)}%
              </span>
            </div>
            <div className="pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-gray-900 font-medium">Avg Confidence</span>
                <span className="font-bold text-lg text-green-600">
                  {Math.round(stats.averageConfidence * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Completion Rate</span>
                <span className="font-medium">{Math.round(stats.successRate)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${stats.successRate}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Voice Accuracy</span>
                <span className="font-medium">{Math.round(stats.averageConfidence * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${stats.averageConfidence * 100}%` }}
                />
              </div>
            </div>
            
            <div className="pt-3 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">A+</div>
                <div className="text-sm text-gray-600">Overall Grade</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}