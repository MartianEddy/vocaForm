import React from 'react'
import { Link } from 'react-router-dom'
import { Mic, FileText, Download, ArrowRight, CheckCircle } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'

export default function Home() {
  const { t } = useLanguage()

  const features = [
    {
      icon: Mic,
      title: t('home.features.voice'),
      description: t('home.features.voiceDesc')
    },
    {
      icon: FileText,
      title: t('home.features.templates'),
      description: t('home.features.templatesDesc')
    },
    {
      icon: Download,
      title: t('home.features.export'),
      description: t('home.features.exportDesc')
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
                {t('home.title')}
              </h1>
              <p className="text-xl md:text-2xl text-primary-100 font-medium">
                {t('home.subtitle')}
              </p>
            </div>
            
            <p className="text-lg md:text-xl text-primary-100 max-w-3xl mx-auto leading-relaxed">
              {t('home.description')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/templates"
                className="btn-primary bg-white text-primary-600 hover:bg-gray-50 text-lg px-8 py-4 flex items-center space-x-2"
              >
                <span>{t('home.getStarted')}</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              
              <Link
                to="/agent/login"
                className="btn-secondary bg-primary-500 hover:bg-primary-400 text-white border-primary-400 text-lg px-8 py-4"
              >
                {t('home.agentLogin')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to fill government forms quickly and accurately using voice technology.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center space-y-4">
                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <feature.icon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Forms Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Supported Government Forms
            </h2>
            <p className="text-lg text-gray-600">
              Pre-built templates for common East African government forms
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: t('template.ntsa'), org: 'NTSA' },
              { name: t('template.nhif'), org: 'NHIF' },
              { name: t('template.nssf'), org: 'NSSF' },
              { name: t('template.contact'), org: 'General' }
            ].map((form, index) => (
              <div key={index} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {form.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {form.org}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link
              to="/templates"
              className="btn-primary text-lg px-8 py-4"
            >
              View All Templates
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-primary-100">
            Choose a form template and start filling it with your voice in seconds.
          </p>
          <Link
            to="/templates"
            className="btn-primary bg-white text-primary-600 hover:bg-gray-50 text-lg px-8 py-4 inline-flex items-center space-x-2"
          >
            <span>Start Now</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}