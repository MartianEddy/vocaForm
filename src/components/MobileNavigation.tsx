import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, FileText, User, Settings, HelpCircle } from 'lucide-react'
import { useAccessibility } from '../contexts/AccessibilityContext'
import { useAuth } from '../contexts/AuthContext'

export default function MobileNavigation() {
  const { settings } = useAccessibility()
  const { user } = useAuth()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  const navItems = [
    {
      path: '/',
      icon: Home,
      label: settings.simplifiedLanguage ? 'Home' : 'Home',
      emoji: '🏠'
    },
    {
      path: '/templates',
      icon: FileText,
      label: settings.simplifiedLanguage ? 'Forms' : 'Forms',
      emoji: '📋'
    },
    {
      path: user ? '/agent/dashboard' : '/agent/login',
      icon: User,
      label: settings.simplifiedLanguage ? 'Agent' : 'Agent',
      emoji: '👤'
    },
    {
      path: '/help',
      icon: HelpCircle,
      label: settings.simplifiedLanguage ? 'Help' : 'Help',
      emoji: '❓'
    }
  ]

  return (
    <nav className={`fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 z-40 ${
      settings.highContrast ? 'bg-black border-white' : 'bg-white border-gray-200'
    }`}>
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-xl transition-all touch-feedback ${
              settings.touchMode ? 'px-4 py-3' : 'px-3 py-2'
            } ${
              isActive(item.path)
                ? 'bg-primary-600 text-white'
                : settings.highContrast
                ? 'text-white hover:bg-gray-800'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center space-x-1">
              <span className={settings.touchMode ? 'text-2xl' : 'text-xl'}>
                {item.emoji}
              </span>
              <item.icon className={`${settings.touchMode ? 'h-6 w-6' : 'h-5 w-5'}`} />
            </div>
            <span className={`font-medium ${settings.touchMode ? 'text-sm' : 'text-xs'}`}>
              {item.label}
            </span>
          </Link>
        ))}
      </div>
      
      {/* Safe area for devices with home indicator */}
      <div className="h-safe-area-inset-bottom bg-inherit" />
    </nav>
  )
}