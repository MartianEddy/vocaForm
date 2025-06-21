import { useState, useEffect, useCallback } from 'react'
import { FormData, FormTemplate } from '../types/form'

interface OfflineFormData {
  formData: FormData
  template: FormTemplate
  lastModified: Date
  syncStatus: 'pending' | 'synced' | 'error'
}

export function useOfflineForm() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [offlineForms, setOfflineForms] = useState<OfflineFormData[]>([])
  const [syncQueue, setSyncQueue] = useState<string[]>([])

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Load offline forms from IndexedDB
    loadOfflineForms()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && syncQueue.length > 0) {
      syncOfflineForms()
    }
  }, [isOnline, syncQueue])

  const loadOfflineForms = async () => {
    try {
      const db = await openDB()
      const transaction = db.transaction(['forms'], 'readonly')
      const store = transaction.objectStore('forms')
      const forms = await store.getAll()
      setOfflineForms(forms)
    } catch (error) {
      console.error('Failed to load offline forms:', error)
    }
  }

  const saveOfflineForm = async (formData: FormData, template: FormTemplate) => {
    const offlineData: OfflineFormData = {
      formData,
      template,
      lastModified: new Date(),
      syncStatus: isOnline ? 'synced' : 'pending'
    }

    try {
      const db = await openDB()
      const transaction = db.transaction(['forms'], 'readwrite')
      const store = transaction.objectStore('forms')
      await store.put(offlineData, formData.sessionId)

      setOfflineForms(prev => {
        const existing = prev.findIndex(f => f.formData.sessionId === formData.sessionId)
        if (existing >= 0) {
          const updated = [...prev]
          updated[existing] = offlineData
          return updated
        }
        return [...prev, offlineData]
      })

      if (!isOnline) {
        setSyncQueue(prev => [...new Set([...prev, formData.sessionId])])
      }
    } catch (error) {
      console.error('Failed to save offline form:', error)
      throw error
    }
  }

  const syncOfflineForms = async () => {
    if (!isOnline) return

    for (const sessionId of syncQueue) {
      try {
        const form = offlineForms.find(f => f.formData.sessionId === sessionId)
        if (!form) continue

        // Attempt to sync with server
        await syncFormToServer(form)
        
        // Update sync status
        const db = await openDB()
        const transaction = db.transaction(['forms'], 'readwrite')
        const store = transaction.objectStore('forms')
        const updatedForm = { ...form, syncStatus: 'synced' as const }
        await store.put(updatedForm, sessionId)

        setOfflineForms(prev => 
          prev.map(f => 
            f.formData.sessionId === sessionId 
              ? { ...f, syncStatus: 'synced' }
              : f
          )
        )

        setSyncQueue(prev => prev.filter(id => id !== sessionId))
      } catch (error) {
        console.error(`Failed to sync form ${sessionId}:`, error)
        // Mark as error but keep in queue for retry
        setOfflineForms(prev => 
          prev.map(f => 
            f.formData.sessionId === sessionId 
              ? { ...f, syncStatus: 'error' }
              : f
          )
        )
      }
    }
  }

  const deleteOfflineForm = async (sessionId: string) => {
    try {
      const db = await openDB()
      const transaction = db.transaction(['forms'], 'readwrite')
      const store = transaction.objectStore('forms')
      await store.delete(sessionId)

      setOfflineForms(prev => prev.filter(f => f.formData.sessionId !== sessionId))
      setSyncQueue(prev => prev.filter(id => id !== sessionId))
    } catch (error) {
      console.error('Failed to delete offline form:', error)
    }
  }

  return {
    isOnline,
    offlineForms,
    syncQueue,
    saveOfflineForm,
    syncOfflineForms,
    deleteOfflineForm,
    pendingSync: syncQueue.length
  }
}

// IndexedDB helper functions
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('VocaFormOffline', 1)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains('forms')) {
        db.createObjectStore('forms')
      }
      if (!db.objectStoreNames.contains('templates')) {
        db.createObjectStore('templates')
      }
    }
  })
}

const syncFormToServer = async (form: OfflineFormData) => {
  // This would sync with your actual backend
  // For now, simulate network request
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // In real implementation:
  // const response = await fetch('/api/forms/sync', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(form)
  // })
  // if (!response.ok) throw new Error('Sync failed')
}