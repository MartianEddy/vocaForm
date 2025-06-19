import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Mic, 
  Home, 
  FileText, 
  User, 
  Settings,
  HelpCircle,
  Phone
} from 'lucide-react'
import { useAccessibility } from '../contexts/AccessibilityContext'
import { useAuth } from '../contexts/AuthContext'
import AccessibilityToolbar from './AccessibilityToolbar'

interface AccessibleLayoutProps {
  children: React.ReactNode
}

export default function AccessibleLayout({ children }: AccessibleLayoutProps) {
  const { settings } = useAccessibility()
  const { user, logout } = useAuth()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  const navigationItems = [
    {
      path: '/',
      icon: Home,
      label: settings.simplifiedLanguage ? 'Home' : 'Home',
      emoji: '🏠'
    },
    {
      path: '/templates',
      icon: FileText,
      label: settings.simplifiedLanguage ? 'Forms' : 'Form Templates',
      emoji: '📋'
    },
    {
      path: user ? '/agent/dashboard' : '/agent/login',
      icon: User,
      label: settings.simplifiedLanguage ? 'Agent' : (user ? 'Dashboard' : 'Agent Login'),
      emoji: '👤'
    }
  ]

  return (
    <div className={`min-h-screen ${settings.highContrast ? 'high-contrast' : 'bg-gray-50'}`}>
      {/* Skip Link */}
      <a 
        href="#main-content" 
        className="skip-link"
      >
        Skip to main content
      </a>

      {/* Accessibility Toolbar */}
      <AccessibilityToolbar />

      {/* Header */}
      <header className={`${settings.highContrast ? 'bg-black border-white' : 'bg-white border-gray-200'} shadow-sm border-b-2`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link 
              to="/" 
              className={`flex items-center space-x-3 focus:outline-none focus:ring-4 focus:ring-primary-500 rounded-xl p-2 touch-feedback ${
                settings.touchMode ? 'p-4' : 'p-2'
              }`}
            >
              <div className="bg-primary-600 p-3 rounded-xl">
                <Mic className="h-8 w-8 text-white" />
              </div>
              <div>
                <span className={`font-bold ${settings.touchMode ? 'text-3xl' : 'text-2xl'} ${
                  settings.highContrast ? 'text-white' : 'text-gray-900'
                }`}>
                  VocaForm
                </span>
                {settings.simplifiedLanguage && (
                  <p className="text-primary-600 text-lg font-medium">
                    Talk to fill forms
                  </p>
                )}
              </div>
            </Link>

            {/* Emergency Contact */}
            <div className="hidden md:flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl ${
                settings.highContrast ? 'bg-gray-800 text-white' : 'bg-blue-50 text-blue-700'
              }`}>
                <Phone className="h-5 w-5" />
                <span className="font-medium">
                  {settings.simplifiedLanguage ? 'Help: ' : 'Support: '}
                  <a href="tel:+254700000000" className="underline">
                    +254 700 000 000
                  </a>
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className={`${settings.highContrast ? 'bg-gray-900 border-white' : 'bg-white border-gray-200'} border-b-2 sticky top-0 z-40`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center space-x-2 py-4">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center space-y-2 px-6 py-4 rounded-xl font-bold transition-all touch-feedback ${
                  settings.touchMode ? 'px-8 py-6' : 'px-6 py-4'
                } ${
                  isActive(item.path)
                    ? 'bg-primary-600 text-white'
                    : settings.highContrast
                    ? 'text-white hover:bg-gray-800'
                    : 'text-gray-700 hover:bg-gray-100'
                } focus:outline-none focus:ring-4 focus:ring-primary-500`}
              >
                <div className="flex items-center space-x-2">
                  <span className={settings.touchMode ? 'text-3xl' : 'text-2xl'}>
                    {item.emoji}
                  </span>
                  <item.icon className={`${settings.touchMode ? 'h-8 w-8' : 'h-6 w-6'}`} />
                </div>
                <span className={`${settings.touchMode ? 'text-lg' : 'text-base'} text-center`}>
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main id="main-content" className="flex-1" role="main">
        {children}
      </main>

      {/* Footer */}
      <footer className={`${settings.highContrast ? 'bg-black border-white text-white' : 'bg-white border-gray-200'} border-t-2 mt-auto`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div>
              <h3 className={`font-bold mb-4 ${settings.touchMode ? 'text-xl' : 'text-lg'}`}>
                {settings.simplifiedLanguage ? 'Need Help?' : 'Contact Support'}
              </h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Phone className="h-5 w-5 text-primary-600" />
                  <a 
                    href="tel:+254700000000" 
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    +254 700 000 000
                  </a>
                </div>
                <p className={settings.touchMode ? 'text-lg' : 'text-base'}>
                  {settings.simplifiedLanguage 
                    ? 'Call us for help'
                    : 'Available 24/7 for assistance'
                  }
                </p>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className={`font-bold mb-4 ${settings.touchMode ? 'text-xl' : 'text-lg'}`}>
                {settings.simplifiedLanguage ? 'Quick Links' : 'Quick Access'}
              </h3>
              <div className="space-y-2">
                <Link 
                  to="/templates" 
                  className="block text-primary-600 hover:text-primary-700 font-medium"
                >
                  {settings.simplifiedLanguage ? 'All Forms' : 'Form Templates'}
                </Link>
                <Link 
                  to="/help" 
                  className="block text-primary-600 hover:text-primary-700 font-medium"
                >
                  {settings.simplifiedLanguage ? 'How to Use' : 'Help & Tutorials'}
                </Link>
              </div>
            </div>

            {/* Accessibility */}
            <div>
              <h3 className={`font-bold mb-4 ${settings.touchMode ? 'text-xl' : 'text-lg'}`}>
                {settings.simplifiedLanguage ? 'Make it Easier' : 'Accessibility'}
              </h3>
              <p className={settings.touchMode ? 'text-lg' : 'text-base'}>
                {settings.simplifiedLanguage 
                  ? 'Use the settings button (⚙️) at the top right to make text bigger, turn on voice help, or change colors.'
                  : 'Use the accessibility toolbar to customize your experience with larger text, high contrast, and voice assistance.'
                }
              </p>
            </div>
          </div>

          <div className={`text-center mt-8 pt-8 border-t ${settings.highContrast ? 'border-white' : 'border-gray-200'}`}>
            <p className={`${settings.highContrast ? 'text-white' : 'text-gray-600'} ${settings.touchMode ? 'text-lg' : 'text-base'}`}>
              &copy; 2025 VocaForm. {settings.simplifiedLanguage ? 'Made for everyone.' : 'Built for East African government forms.'}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}