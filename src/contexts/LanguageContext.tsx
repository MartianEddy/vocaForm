import React, { createContext, useContext, useState, ReactNode } from 'react'

type Language = 'en' | 'sw'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.templates': 'Form Templates',
    'nav.agent': 'Agent Login',
    'nav.dashboard': 'Dashboard',
    
    // Home page
    'home.title': 'VocaForm',
    'home.subtitle': 'Voice-Powered Form Filling',
    'home.description': 'Fill out government forms using your voice. Fast, accurate, and accessible.',
    'home.getStarted': 'Get Started',
    'home.agentLogin': 'Agent Login',
    'home.features.voice': 'Voice Recognition',
    'home.features.voiceDesc': 'Speak naturally to fill forms',
    'home.features.templates': 'Pre-built Templates',
    'home.features.templatesDesc': 'NTSA, NHIF, NSSF forms ready',
    'home.features.export': 'Export & Print',
    'home.features.exportDesc': 'Generate PDFs instantly',
    
    // Form filling
    'form.startRecording': 'Start Recording',
    'form.stopRecording': 'Stop Recording',
    'form.listening': 'Listening...',
    'form.processing': 'Processing...',
    'form.confidence': 'Confidence',
    'form.edit': 'Edit',
    'form.save': 'Save',
    'form.export': 'Export PDF',
    'form.clear': 'Clear',
    'form.next': 'Next Field',
    'form.previous': 'Previous Field',
    'form.complete': 'Complete Form',
    'form.retry': 'Retry Recording',
    'form.playback': 'Play Back',
    'form.alternatives': 'Alternative Suggestions',
    
    // Voice recognition
    'voice.highConfidence': 'High Confidence',
    'voice.mediumConfidence': 'Medium Confidence',
    'voice.lowConfidence': 'Low Confidence',
    'voice.veryLowConfidence': 'Very Low Confidence',
    'voice.noiseDetected': 'Background noise detected',
    'voice.clearAudio': 'Audio is clear',
    'voice.retryPrompt': 'Low confidence detected. Try speaking more clearly.',
    'voice.languageSettings': 'Language & Accent Settings',
    
    // Templates
    'template.ntsa': 'NTSA Driver\'s License',
    'template.nhif': 'NHIF Registration',
    'template.nssf': 'NSSF Contribution',
    'template.contact': 'Contact Form',
    
    // Agent
    'agent.login': 'Agent Login',
    'agent.email': 'Email',
    'agent.password': 'Password',
    'agent.signin': 'Sign In',
    'agent.dashboard': 'Agent Dashboard',
    'agent.clients': 'Active Clients',
    'agent.newSession': 'New Client Session',
    'agent.sessions': 'Sessions Today',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.back': 'Back',
    'common.continue': 'Continue',
  },
  sw: {
    // Navigation
    'nav.home': 'Nyumbani',
    'nav.templates': 'Mifano ya Fomu',
    'nav.agent': 'Kuingia kwa Wakala',
    'nav.dashboard': 'Dashibodi',
    
    // Home page
    'home.title': 'VocaForm',
    'home.subtitle': 'Kujaza Fomu kwa Sauti',
    'home.description': 'Jaza fomu za serikali kwa kutumia sauti yako. Haraka, sahihi, na rahisi.',
    'home.getStarted': 'Anza',
    'home.agentLogin': 'Kuingia kwa Wakala',
    'home.features.voice': 'Utambuzi wa Sauti',
    'home.features.voiceDesc': 'Zungumza kwa kawaida kujaza fomu',
    'home.features.templates': 'Mifano Iliyoandaliwa',
    'home.features.templatesDesc': 'Fomu za NTSA, NHIF, NSSF tayari',
    'home.features.export': 'Hamisha na Chapisha',
    'home.features.exportDesc': 'Tengeneza PDF mara moja',
    
    // Form filling
    'form.startRecording': 'Anza Kurekodi',
    'form.stopRecording': 'Acha Kurekodi',
    'form.listening': 'Sikiliza...',
    'form.processing': 'Inachakata...',
    'form.confidence': 'Uhakika',
    'form.edit': 'Hariri',
    'form.save': 'Hifadhi',
    'form.export': 'Hamisha PDF',
    'form.clear': 'Futa',
    'form.next': 'Uga Unaofuata',
    'form.previous': 'Uga wa Awali',
    'form.complete': 'Maliza Fomu',
    'form.retry': 'Jaribu Tena Kurekodi',
    'form.playback': 'Cheza Tena',
    'form.alternatives': 'Mapendekezo Mengine',
    
    // Voice recognition
    'voice.highConfidence': 'Uhakika wa Juu',
    'voice.mediumConfidence': 'Uhakika wa Kati',
    'voice.lowConfidence': 'Uhakika wa Chini',
    'voice.veryLowConfidence': 'Uhakika wa Chini Sana',
    'voice.noiseDetected': 'Kelele za nyuma zimegunduliwa',
    'voice.clearAudio': 'Sauti ni wazi',
    'voice.retryPrompt': 'Uhakika wa chini umegunduliwa. Jaribu kuzungumza kwa uwazi zaidi.',
    'voice.languageSettings': 'Mipangilio ya Lugha na Lafudhi',
    
    // Templates
    'template.ntsa': 'Leseni ya Udereva NTSA',
    'template.nhif': 'Usajili wa NHIF',
    'template.nssf': 'Mchango wa NSSF',
    'template.contact': 'Fomu ya Mawasiliano',
    
    // Agent
    'agent.login': 'Kuingia kwa Wakala',
    'agent.email': 'Barua pepe',
    'agent.password': 'Nywila',
    'agent.signin': 'Ingia',
    'agent.dashboard': 'Dashibodi ya Wakala',
    'agent.clients': 'Wateja Hai',
    'agent.newSession': 'Kipindi Kipya cha Mteja',
    'agent.sessions': 'Vipindi Vya Leo',
    
    // Common
    'common.loading': 'Inapakia...',
    'common.error': 'Hitilafu',
    'common.success': 'Mafanikio',
    'common.cancel': 'Ghairi',
    'common.confirm': 'Thibitisha',
    'common.back': 'Rudi',
    'common.continue': 'Endelea',
  }
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en')
  
  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key
  }
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}