import React, { useState } from 'react'
import { TrendingUp, DollarSign, Calendar, BarChart3 } from 'lucide-react'
import { useDashboard } from '../contexts/DashboardContext'
import { format, subDays } from 'date-fns'

export default function RevenueChart() {
  const { revenueData, stats } = useDashboard()
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')
  const [viewType, setViewType] = useState<'revenue' | 'sessions' | 'clients'>('revenue')

  const getFilteredData = () => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
    return revenueData.slice(-days)
  }

  const filteredData = getFilteredData()
  const maxValue = Math.max(...filteredData.map(d => 
    viewType === 'revenue' ? d.amount : 
    viewType === 'sessions' ? d.sessions : d.clients
  ))

  const getBarHeight = (value: number) => {
    return (value / maxValue) * 100
  }

  const getValueLabel = (item: any) => {
    switch (viewType) {
      case 'revenue':
        return `KSh ${item.amount.toLocaleString()}`
      case 'sessions':
        return `${item.sessions} sessions`
      case 'clients':
        return `${item.clients} clients`
      default:
        return ''
    }
  }

  const getBarColor = () => {
    switch (viewType) {
      case 'revenue':
        return 'bg-green-500'
      case 'sessions':
        return 'bg-blue-500'
      case 'clients':
        return 'bg-purple-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getTotalValue = () => {
    return filteredData.reduce((sum, item) => {
      switch (viewType) {
        case 'revenue':
          return sum + item.amount
        case 'sessions':
          return sum + item.sessions
        case 'clients':
          return sum + item.clients
        default:
          return sum
      }
    }, 0)
  }

  const getAverageValue = () => {
    return Math.round(getTotalValue() / filteredData.length)
  }

  const getGrowthRate = () => {
    if (filteredData.length < 2) return 0
    const recent = filteredData.slice(-7)
    const previous = filteredData.slice(-14, -7)
    
    const recentAvg = recent.reduce((sum, item) => {
      switch (viewType) {
        case 'revenue':
          return sum + item.amount
        case 'sessions':
          return sum + item.sessions
        case 'clients':
          return sum + item.clients
        default:
          return sum
      }
    }, 0) / recent.length

    const previousAvg = previous.reduce((sum, item) => {
      switch (viewType) {
        case 'revenue':
          return sum + item.amount
        case 'sessions':
          return sum + item.sessions
        case 'clients':
          return sum + item.clients
        default:
          return sum
      }
    }, 0) / previous.length

    return previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <BarChart3 className="h-6 w-6 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900">Analytics Overview</h2>
        </div>
        
        <div className="flex space-x-2">
          {/* View Type Selector */}
          <select
            value={viewType}
            onChange={(e) => setViewType(e.target.value as any)}
            className="form-input text-sm"
          >
            <option value="revenue">Revenue</option>
            <option value="sessions">Sessions</option>
            <option value="clients">Clients</option>
          </select>
          
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="form-input text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-1">
            <DollarSign className="h-4 w-4 text-gray-600" />
            <span className="text-sm text-gray-600">Total</span>
          </div>
          <div className="text-xl font-bold text-gray-900">
            {viewType === 'revenue' 
              ? `KSh ${getTotalValue().toLocaleString()}`
              : getTotalValue().toLocaleString()
            }
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-1">
            <Calendar className="h-4 w-4 text-gray-600" />
            <span className="text-sm text-gray-600">Daily Average</span>
          </div>
          <div className="text-xl font-bold text-gray-900">
            {viewType === 'revenue' 
              ? `KSh ${getAverageValue().toLocaleString()}`
              : getAverageValue().toLocaleString()
            }
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-1">
            <TrendingUp className="h-4 w-4 text-gray-600" />
            <span className="text-sm text-gray-600">Growth Rate</span>
          </div>
          <div className={`text-xl font-bold ${getGrowthRate() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {getGrowthRate() >= 0 ? '+' : ''}{getGrowthRate().toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="space-y-4">
        <div className="flex items-end space-x-1 h-64 bg-gray-50 rounded-lg p-4">
          {filteredData.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="relative flex-1 w-full flex items-end">
                <div
                  className={`w-full ${getBarColor()} rounded-t transition-all duration-300 hover:opacity-80 cursor-pointer group relative`}
                  style={{ height: `${getBarHeight(
                    viewType === 'revenue' ? item.amount : 
                    viewType === 'sessions' ? item.sessions : item.clients
                  )}%` }}
                  title={getValueLabel(item)}
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {getValueLabel(item)}
                    <div className="text-xs text-gray-300">
                      {format(new Date(item.date), 'MMM dd')}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-left">
                {format(new Date(item.date), timeRange === '7d' ? 'EEE' : 'dd')}
              </div>
            </div>
          ))}
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded ${getBarColor()}`} />
            <span className="capitalize">{viewType}</span>
          </div>
          <div className="text-xs">
            Hover over bars for details
          </div>
        </div>
      </div>
    </div>
  )
}