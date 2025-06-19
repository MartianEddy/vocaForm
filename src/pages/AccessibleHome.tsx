import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Mic, 
  FileText, 
  Download, 
  ArrowRight, 
  CheckCircle,
  Volume2,
  Eye,
  Smartphone,
  Heart
} from 'lucide-react'
import { useAccessibility } from '../contexts/AccessibilityContext'
import { useVoiceGuidance } from '../lib/elevenlabs'

export default function AccessibleHome() {
  const { settings, announceToScreenReader } = useAccessibility()
  const { playCustomMessage, isAvailable } = useVoiceGuidance()

  useEffect(() => {
    if (settings.audioPrompts && isAvailable) {
      const welcomeMessage = settings.simplifiedLanguage
        ? 'Welcome to VocaForm. Talk to fill government forms.'
        : 'Welcome to VocaForm. Use your voice to fill out government forms quickly and easily.'
      
      setTimeout(() => playCustomMessage(welcomeMessage), 1000)
    }
  }, [settings.audioPrompts, isAvailable, playCustomMessage, settings.simplifiedLanguage])

  const features = [
    {
      icon: Mic,
      emoji: '🎤',
      title: settings.simplifiedLanguage ? 'Talk to Fill' : 'Voice Recognition',
      description: settings.simplifiedLanguage 
        ? 'Just speak. We write it down.' 
        : 'Speak naturally to fill forms automatically'
    },
    {
      icon: FileText,
      emoji: '📋',
      title: settings.simplifiedLanguage ? 'Ready Forms' : 'Pre-built Templates',
      description: settings.simplifiedLanguage 
        ? 'NTSA, NHIF, NSSF forms ready to use.' 
        : 'Government forms for NTSA, NHIF, NSSF ready to use'
    },
    {
      icon: Download,
      emoji: '📄',
      title: settings.simplifiedLanguage ? 'Get Your Form' : 'Export & Print',
      description: settings.simplifiedLanguage 
        ? 'Download your completed form.' 
        : 'Generate PDFs instantly for submission'
    }
  ]

  const accessibilityFeatures = [
    {
      icon: Volume2,
      emoji: '🔊',
      title: settings.simplifiedLanguage ? 'Voice Help' : 'Audio Guidance',
      description: settings.simplifiedLanguage 
        ? 'Hear instructions for each field.' 
        : 'Audio prompts guide you through each form field'
    },
    {
      icon: Eye,
      emoji: '👁️',
      title: settings.simplifiedLanguage ? 'Easy to See' : 'High Contrast',
      description: settings.simplifiedLanguage 
        ? 'Big text and clear colors.' 
        : 'Large text and high contrast for better visibility'
    },
    {
      icon: Smartphone,
      emoji: '📱',
      title: settings.simplifiedLanguage ? 'Touch Friendly' : 'Touch Optimized',
      description: settings.simplifiedLanguage 
        ? 'Big buttons for tablets and phones.' 
        : 'Large buttons optimized for tablets and touch devices'
    }
  ]

  const supportedForms = [
    { 
      name: settings.simplifiedLanguage ? 'Driver License' : 'NTSA Driver\'s License', 
      org: 'NTSA',
      emoji: '🚗',
      description: settings.simplifiedLanguage ? 'Renew your driving license' : 'License renewal and applications'
    },
    { 
      name: settings.simplifiedLanguage ? 'Health Insurance' : 'NHIF Registration', 
      org: 'NHIF',
      emoji: '🏥',
      description: settings.simplifiedLanguage ? 'Join health insurance' : 'Health insurance registration'
    },
    { 
      name: settings.simplifiedLanguage ? 'Social Security' : 'NSSF Contribution', 
      org: 'NSSF',
      emoji: '🛡️',
      description: settings.simplifiedLanguage ? 'Social security forms' : 'Social security contributions'
    },
    { 
      name: settings.simplifiedLanguage ? 'Contact Form' : 'General Contact', 
      org: 'General',
      emoji: '📞',
      description: settings.simplifiedLanguage ? 'Basic contact information' : 'General contact forms'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center space-y-8">
            <div className="space-y-6">
              <div className="text-6xl mb-4">🎤</div>
              <h1 className={`font-bold tracking-tight ${
                settings.touchMode ? 'text-6xl md:text-7xl' : 'text-5xl md:text-6xl'
              }`}>
                {settings.simplifiedLanguage ? 'VocaForm' : 'VocaForm'}
              </h1>
              <p className={`text-primary-100 font-bold ${
                settings.touchMode ? 'text-3xl md:text-4xl' : 'text-xl md:text-2xl'
              }`}>
                {settings.simplifiedLanguage ? 'Talk to Fill Forms' : 'Voice-Powered Form Filling'}
              </p>
            </div>
            
            <p className={`text-primary-100 max-w-4xl mx-auto leading-relaxed ${
              settings.touchMode ? 'text-2xl' : 'text-lg md:text-xl'
            }`}>
              {settings.simplifiedLanguage 
                ? 'Fill government forms by talking. Fast and easy. No typing needed.'
                : 'Fill out government forms using your voice. Fast, accurate, and accessible for everyone.'
              }
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                to="/templates"
                className={`btn-primary bg-white text-primary-600 hover:bg-gray-50 flex items-center space-x-3 touch-feedback ${
                  settings.touchMode ? 'btn-large text-2xl px-12 py-8' : 'text-xl px-10 py-6'
                }`}
                onClick={() => announceToScreenReader(settings.simplifiedLanguage ? 'Going to forms' : 'Navigating to form templates')}
              >
                <span className="text-3xl">🚀</span>
                <span className="font-bold">
                  {settings.simplifiedLanguage ? 'Start Now' : 'Get Started'}
                </span>
                <ArrowRight className="h-6 w-6" />
              </Link>
              
              <Link
                to="/agent/login"
                className={`btn-secondary bg-primary-500 hover:bg-primary-400 text-white border-primary-400 flex items-center space-x-3 touch-feedback ${
                  settings.touchMode ? 'btn-large text-2xl px-12 py-8' : 'text-xl px-10 py-6'
                }`}
              >
                <span className="text-3xl">👤</span>
                <span className="font-bold">
                  {settings.simplifiedLanguage ? 'Agent Help' : 'Agent Login'}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`font-bold text-gray-900 mb-6 ${
              settings.touchMode ? 'text-4xl md:text-5xl' : 'text-3xl md:text-4xl'
            }`}>
              {settings.simplifiedLanguage ? '✨ What We Do' : '✨ Powerful Features'}
            </h2>
            <p className={`text-gray-600 max-w-3xl mx-auto ${
              settings.touchMode ? 'text-2xl' : 'text-lg'
            }`}>
              {settings.simplifiedLanguage 
                ? 'Everything you need to fill forms with your voice.'
                : 'Everything you need to fill government forms quickly and accurately using voice technology.'
              }
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className={`text-center space-y-6 card hover:shadow-lg transition-all touch-feedback ${
                settings.touchMode ? 'p-10' : 'p-8'
              }`}>
                <div className="text-6xl mb-4">{feature.emoji}</div>
                <div className={`bg-primary-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto ${
                  settings.touchMode ? 'w-24 h-24' : 'w-20 h-20'
                }`}>
                  <feature.icon className={`text-primary-600 ${
                    settings.touchMode ? 'h-12 w-12' : 'h-10 w-10'
                  }`} />
                </div>
                <h3 className={`font-bold text-gray-900 ${
                  settings.touchMode ? 'text-2xl' : 'text-xl'
                }`}>
                  {feature.title}
                </h3>
                <p className={`text-gray-600 ${
                  settings.touchMode ? 'text-xl' : 'text-lg'
                }`}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Accessibility Features */}
      <section className="py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`font-bold text-gray-900 mb-6 ${
              settings.touchMode ? 'text-4xl md:text-5xl' : 'text-3xl md:text-4xl'
            }`}>
              <Heart className="inline h-10 w-10 text-red-500 mr-3" />
              {settings.simplifiedLanguage ? 'Made for Everyone' : 'Accessible for All'}
            </h2>
            <p className={`text-gray-600 max-w-3xl mx-auto ${
              settings.touchMode ? 'text-2xl' : 'text-lg'
            }`}>
              {settings.simplifiedLanguage 
                ? 'We made VocaForm easy for everyone to use.'
                : 'VocaForm is designed to be accessible and user-friendly for people of all abilities.'
              }
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {accessibilityFeatures.map((feature, index) => (
              <div key={index} className={`text-center space-y-6 card hover:shadow-lg transition-all touch-feedback ${
                settings.touchMode ? 'p-10' : 'p-8'
              }`}>
                <div className="text-6xl mb-4">{feature.emoji}</div>
                <div className={`bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto ${
                  settings.touchMode ? 'w-24 h-24' : 'w-20 h-20'
                }`}>
                  <feature.icon className={`text-green-600 ${
                    settings.touchMode ? 'h-12 w-12' : 'h-10 w-10'
                  }`} />
                </div>
                <h3 className={`font-bold text-gray-900 ${
                  settings.touchMode ? 'text-2xl' : 'text-xl'
                }`}>
                  {feature.title}
                </h3>
                <p className={`text-gray-600 ${
                  settings.touchMode ? 'text-xl' : 'text-lg'
                }`}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Forms Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`font-bold text-gray-900 mb-6 ${
              settings.touchMode ? 'text-4xl md:text-5xl' : 'text-3xl md:text-4xl'
            }`}>
              {settings.simplifiedLanguage ? '📋 Available Forms' : '📋 Supported Government Forms'}
            </h2>
            <p className={`text-gray-600 ${
              settings.touchMode ? 'text-2xl' : 'text-lg'
            }`}>
              {settings.simplifiedLanguage 
                ? 'Forms ready to fill with your voice'
                : 'Pre-built templates for common East African government forms'
              }
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {supportedForms.map((form, index) => (
              <div key={index} className={`card hover:shadow-lg transition-all touch-feedback ${
                settings.touchMode ? 'p-8' : 'p-6'
              }`}>
                <div className="text-center space-y-4">
                  <div className="text-5xl">{form.emoji}</div>
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    <span className={`font-bold text-gray-900 ${
                      settings.touchMode ? 'text-xl' : 'text-lg'
                    }`}>
                      {form.name}
                    </span>
                  </div>
                  <p className={`text-gray-600 ${
                    settings.touchMode ? 'text-lg' : 'text-base'
                  }`}>
                    {form.description}
                  </p>
                  <div className={`bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium ${
                    settings.touchMode ? 'text-lg px-4 py-2' : 'text-sm px-3 py-1'
                  }`}>
                    {form.org}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link
              to="/templates"
              className={`btn-primary flex items-center space-x-3 mx-auto touch-feedback ${
                settings.touchMode ? 'btn-large text-2xl' : 'text-xl px-10 py-6'
              }`}
            >
              <span className="text-3xl">📋</span>
              <span className="font-bold">
                {settings.simplifiedLanguage ? 'See All Forms' : 'View All Templates'}
              </span>
              <ArrowRight className="h-6 w-6" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="text-6xl mb-6">🚀</div>
          <h2 className={`font-bold ${
            settings.touchMode ? 'text-4xl md:text-5xl' : 'text-3xl md:text-4xl'
          }`}>
            {settings.simplifiedLanguage ? 'Ready to Start?' : 'Ready to Get Started?'}
          </h2>
          <p className={`text-primary-100 ${
            settings.touchMode ? 'text-2xl' : 'text-lg'
          }`}>
            {settings.simplifiedLanguage 
              ? 'Pick a form and start talking. It\'s that easy!'
              : 'Choose a form template and start filling it with your voice in seconds.'
            }
          </p>
          <Link
            to="/templates"
            className={`btn-primary bg-white text-primary-600 hover:bg-gray-50 inline-flex items-center space-x-3 touch-feedback ${
              settings.touchMode ? 'btn-large text-2xl' : 'text-xl px-10 py-6'
            }`}
          >
            <span className="text-3xl">🎤</span>
            <span className="font-bold">
              {settings.simplifiedLanguage ? 'Start Talking' : 'Start Now'}
            </span>
            <ArrowRight className="h-6 w-6" />
          </Link>
        </div>
      </section>
    </div>
  )
}