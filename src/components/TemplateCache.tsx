import React, { useState, useEffect } from 'react'
import { Download, Trash2, RefreshCw, HardDrive, Wifi } from 'lucide-react'
import { useAccessibility } from '../contexts/AccessibilityContext'
import { FormTemplate } from '../types/form'

interface CachedTemplate {
  template: FormTemplate
  cachedAt: Date
  size: number
  lastUsed: Date
  isOfflineAvailable: boolean
}

export default function TemplateCache() {
  const { settings } = useAccessibility()
  const [cachedTemplates, setCachedTemplates] = useState<CachedTemplate[]>([])
  const [totalCacheSize, setTotalCacheSize] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadCachedTemplates()
  }, [])

  const loadCachedTemplates = async () => {
    try {
      setIsLoading(true)
      
      // Get cached templates from IndexedDB
      const db = await openTemplateDB()
      const transaction = db.transaction(['templates'], 'readonly')
      const store = transaction.objectStore('templates')
      const templates = await store.getAll()
      
      const cachedData: CachedTemplate[] = templates.map(item => ({
        template: item.template,
        cachedAt: new Date(item.cachedAt),
        size: item.size || 0,
        lastUsed: new Date(item.lastUsed || item.cachedAt),
        isOfflineAvailable: true
      }))
      
      setCachedTemplates(cachedData)
      setTotalCacheSize(cachedData.reduce((sum, item) => sum + item.size, 0))
    } catch (error) {
      console.error('Failed to load cached templates:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const cacheTemplate = async (template: FormTemplate) => {
    try {
      const db = await openTemplateDB()
      const transaction = db.transaction(['templates'], 'readwrite')
      const store = transaction.objectStore('templates')
      
      const cacheData = {
        id: template.id,
        template,
        cachedAt: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
        size: JSON.stringify(template).length
      }
      
      await store.put(cacheData)
      await loadCachedTemplates()
    } catch (error) {
      console.error('Failed to cache template:', error)
    }
  }

  const removeCachedTemplate = async (templateId: string) => {
    try {
      const db = await openTemplateDB()
      const transaction = db.transaction(['templates'], 'readwrite')
      const store = transaction.objectStore('templates')
      
      await store.delete(templateId)
      await loadCachedTemplates()
    } catch (error) {
      console.error('Failed to remove cached template:', error)
    }
  }

  const clearAllCache = async () => {
    if (confirm(settings.simplifiedLanguage 
      ? 'Delete all saved forms?' 
      : 'Are you sure you want to clear all cached templates?'
    )) {
      try {
        const db = await openTemplateDB()
        const transaction = db.transaction(['templates'], 'readwrite')
        const store = transaction.objectStore('templates')
        
        await store.clear()
        await loadCachedTemplates()
      } catch (error) {
        console.error('Failed to clear cache:', error)
      }
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <HardDrive className="h-6 w-6 text-primary-600" />
          <h3 className={`font-bold text-gray-900 ${settings.touchMode ? 'text-xl' : 'text-lg'}`}>
            {settings.simplifiedLanguage ? 'Saved Forms' : 'Offline Templates'}
          </h3>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className={`text-gray-600 ${settings.touchMode ? 'text-lg' : 'text-sm'}`}>
            {formatFileSize(totalCacheSize)} {settings.simplifiedLanguage ? 'used' : 'total'}
          </span>
          
          <button
            onClick={loadCachedTemplates}
            disabled={isLoading}
            className="btn-icon bg-blue-100 text-blue-600 hover:bg-blue-200 disabled:opacity-50"
            aria-label={settings.simplifiedLanguage ? 'Refresh' : 'Refresh cache'}
          >
            <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={clearAllCache}
            className="btn-icon bg-red-100 text-red-600 hover:bg-red-200"
            aria-label={settings.simplifiedLanguage ? 'Delete all' : 'Clear all cache'}
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {cachedTemplates.length === 0 ? (
        <div className="text-center py-12">
          <HardDrive className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h4 className={`font-medium text-gray-500 mb-2 ${settings.touchMode ? 'text-xl' : 'text-lg'}`}>
            {settings.simplifiedLanguage ? 'No saved forms' : 'No cached templates'}
          </h4>
          <p className={`text-gray-400 ${settings.touchMode ? 'text-lg' : 'text-base'}`}>
            {settings.simplifiedLanguage 
              ? 'Forms will save automatically when you use them offline'
              : 'Templates will be cached automatically when accessed offline'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {cachedTemplates.map((cached) => (
            <div 
              key={cached.template.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <Wifi className="h-5 w-5 text-green-500" />
                  <h4 className={`font-medium text-gray-900 ${settings.touchMode ? 'text-lg' : 'text-base'}`}>
                    {cached.template.name}
                  </h4>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    {settings.simplifiedLanguage ? 'Offline Ready' : 'Cached'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">
                      {settings.simplifiedLanguage ? 'Saved:' : 'Cached:'}
                    </span> {formatDate(cached.cachedAt)}
                  </div>
                  <div>
                    <span className="font-medium">
                      {settings.simplifiedLanguage ? 'Size:' : 'Size:'}
                    </span> {formatFileSize(cached.size)}
                  </div>
                  <div>
                    <span className="font-medium">
                      {settings.simplifiedLanguage ? 'Last used:' : 'Last used:'}
                    </span> {formatDate(cached.lastUsed)}
                  </div>
                  <div>
                    <span className="font-medium">
                      {settings.simplifiedLanguage ? 'Category:' : 'Category:'}
                    </span> {cached.template.category}
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => removeCachedTemplate(cached.template.id)}
                className="btn-icon bg-red-100 text-red-600 hover:bg-red-200 ml-4"
                aria-label={settings.simplifiedLanguage ? 'Delete' : 'Remove from cache'}
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Cache Statistics */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className={`font-bold text-primary-600 ${settings.touchMode ? 'text-2xl' : 'text-xl'}`}>
              {cachedTemplates.length}
            </div>
            <div className={`text-gray-600 ${settings.touchMode ? 'text-base' : 'text-sm'}`}>
              {settings.simplifiedLanguage ? 'Forms' : 'Templates'}
            </div>
          </div>
          
          <div>
            <div className={`font-bold text-green-600 ${settings.touchMode ? 'text-2xl' : 'text-xl'}`}>
              {formatFileSize(totalCacheSize)}
            </div>
            <div className={`text-gray-600 ${settings.touchMode ? 'text-base' : 'text-sm'}`}>
              {settings.simplifiedLanguage ? 'Storage' : 'Total Size'}
            </div>
          </div>
          
          <div>
            <div className={`font-bold text-blue-600 ${settings.touchMode ? 'text-2xl' : 'text-xl'}`}>
              {cachedTemplates.filter(t => t.isOfflineAvailable).length}
            </div>
            <div className={`text-gray-600 ${settings.touchMode ? 'text-base' : 'text-sm'}`}>
              {settings.simplifiedLanguage ? 'Offline' : 'Offline Ready'}
            </div>
          </div>
          
          <div>
            <div className={`font-bold text-purple-600 ${settings.touchMode ? 'text-2xl' : 'text-xl'}`}>
              {cachedTemplates.filter(t => 
                new Date().getTime() - t.lastUsed.getTime() < 7 * 24 * 60 * 60 * 1000
              ).length}
            </div>
            <div className={`text-gray-600 ${settings.touchMode ? 'text-base' : 'text-sm'}`}>
              {settings.simplifiedLanguage ? 'Recent' : 'Used This Week'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// IndexedDB helper
function openTemplateDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('VocaFormTemplates', 1)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains('templates')) {
        db.createObjectStore('templates', { keyPath: 'id' })
      }
    }
  })
}