import { FormData, FormTemplate } from '../types/form'

export interface AutoSaveOptions {
  interval: number // milliseconds
  maxRetries: number
  storageKey: string
  onSave?: (data: FormData) => void
  onError?: (error: Error) => void
  onConflict?: (localData: FormData, serverData: FormData) => FormData
}

export class AutoSaveManager {
  private saveTimer: NodeJS.Timeout | null = null
  private isEnabled = false
  private options: AutoSaveOptions
  private lastSaveData: string = ''
  private saveQueue: FormData[] = []
  private isSaving = false

  constructor(options: AutoSaveOptions) {
    this.options = {
      interval: 5000, // 5 seconds default
      maxRetries: 3,
      ...options
    }
  }

  start(formData: FormData) {
    this.isEnabled = true
    this.scheduleNextSave(formData)
  }

  stop() {
    this.isEnabled = false
    if (this.saveTimer) {
      clearTimeout(this.saveTimer)
      this.saveTimer = null
    }
  }

  saveNow(formData: FormData): Promise<void> {
    return new Promise((resolve, reject) => {
      this.saveQueue.push(formData)
      this.processSaveQueue().then(resolve).catch(reject)
    })
  }

  private scheduleNextSave(formData: FormData) {
    if (!this.isEnabled) return

    if (this.saveTimer) {
      clearTimeout(this.saveTimer)
    }

    this.saveTimer = setTimeout(() => {
      this.saveIfChanged(formData)
      this.scheduleNextSave(formData)
    }, this.options.interval)
  }

  private async saveIfChanged(formData: FormData) {
    const currentDataString = JSON.stringify(formData)
    
    if (currentDataString === this.lastSaveData) {
      return // No changes to save
    }

    try {
      await this.performSave(formData)
      this.lastSaveData = currentDataString
    } catch (error) {
      console.error('Auto-save failed:', error)
      this.options.onError?.(error as Error)
    }
  }

  private async processSaveQueue(): Promise<void> {
    if (this.isSaving || this.saveQueue.length === 0) {
      return
    }

    this.isSaving = true
    const dataToSave = this.saveQueue.pop()! // Get the latest data
    this.saveQueue = [] // Clear queue

    try {
      await this.performSave(dataToSave)
      this.lastSaveData = JSON.stringify(dataToSave)
    } catch (error) {
      console.error('Manual save failed:', error)
      throw error
    } finally {
      this.isSaving = false
    }
  }

  private async performSave(formData: FormData): Promise<void> {
    const saveData = {
      ...formData,
      lastSavedAt: new Date(),
      autoSaveData: {
        lastSave: new Date(),
        saveCount: (formData.autoSaveData?.saveCount || 0) + 1,
        conflicts: formData.autoSaveData?.conflicts || []
      }
    }

    // Save to localStorage
    localStorage.setItem(this.options.storageKey, JSON.stringify(saveData))

    // Call custom save handler
    this.options.onSave?.(saveData)
  }

  loadSavedData(): FormData | null {
    try {
      const saved = localStorage.getItem(this.options.storageKey)
      if (!saved) return null

      const data = JSON.parse(saved) as FormData
      
      // Convert date strings back to Date objects
      data.startedAt = new Date(data.startedAt)
      data.lastSavedAt = new Date(data.lastSavedAt)
      if (data.completedAt) {
        data.completedAt = new Date(data.completedAt)
      }
      if (data.autoSaveData?.lastSave) {
        data.autoSaveData.lastSave = new Date(data.autoSaveData.lastSave)
      }

      return data
    } catch (error) {
      console.error('Failed to load saved data:', error)
      return null
    }
  }

  clearSavedData() {
    localStorage.removeItem(this.options.storageKey)
  }

  detectConflicts(localData: FormData, serverData: FormData): string[] {
    const conflicts: string[] = []
    
    Object.keys(localData.values).forEach(fieldId => {
      const localValue = localData.values[fieldId]
      const serverValue = serverData.values[fieldId]
      
      if (localValue !== serverValue && localValue && serverValue) {
        conflicts.push(fieldId)
      }
    })

    return conflicts
  }

  resolveConflicts(localData: FormData, serverData: FormData): FormData {
    if (this.options.onConflict) {
      return this.options.onConflict(localData, serverData)
    }

    // Default resolution: prefer local changes for newer data
    const localTime = localData.lastSavedAt.getTime()
    const serverTime = serverData.lastSavedAt.getTime()

    return localTime > serverTime ? localData : serverData
  }
}

export function createAutoSaveManager(
  templateId: string, 
  sessionId: string,
  customOptions?: Partial<AutoSaveOptions>
): AutoSaveManager {
  const options: AutoSaveOptions = {
    interval: 5000,
    maxRetries: 3,
    storageKey: `vocaform_autosave_${templateId}_${sessionId}`,
    ...customOptions
  }

  return new AutoSaveManager(options)
}