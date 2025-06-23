import CryptoJS from 'crypto-js'

interface EncryptionConfig {
  algorithm: string
  keySize: number
  iterations: number
}

interface EncryptedData {
  data: string
  iv: string
  salt: string
  timestamp: number
}

interface VoiceDataConfig {
  maxRetentionDays: number
  autoDeleteAfterProcessing: boolean
  encryptInTransit: boolean
}

class EncryptionService {
  private config: EncryptionConfig = {
    algorithm: 'AES',
    keySize: 256 / 32,
    iterations: 10000
  }

  private voiceConfig: VoiceDataConfig = {
    maxRetentionDays: 30,
    autoDeleteAfterProcessing: true,
    encryptInTransit: true
  }

  // Generate a secure encryption key from password
  private deriveKey(password: string, salt: string): string {
    return CryptoJS.PBKDF2(password, salt, {
      keySize: this.config.keySize,
      iterations: this.config.iterations
    }).toString()
  }

  // Generate a random salt
  private generateSalt(): string {
    return CryptoJS.lib.WordArray.random(128 / 8).toString()
  }

  // Generate a random IV
  private generateIV(): string {
    return CryptoJS.lib.WordArray.random(128 / 8).toString()
  }

  // Encrypt form data
  encryptFormData(data: any, userKey?: string): EncryptedData {
    try {
      const salt = this.generateSalt()
      const iv = this.generateIV()
      const key = userKey || this.generateSessionKey()
      const derivedKey = this.deriveKey(key, salt)

      const encrypted = CryptoJS.AES.encrypt(
        JSON.stringify(data),
        derivedKey,
        { iv: CryptoJS.enc.Hex.parse(iv) }
      ).toString()

      return {
        data: encrypted,
        iv,
        salt,
        timestamp: Date.now()
      }
    } catch (error) {
      console.error('Encryption failed:', error)
      throw new Error('Failed to encrypt form data')
    }
  }

  // Decrypt form data
  decryptFormData(encryptedData: EncryptedData, userKey?: string): any {
    try {
      const key = userKey || this.getSessionKey()
      const derivedKey = this.deriveKey(key, encryptedData.salt)

      const decrypted = CryptoJS.AES.decrypt(
        encryptedData.data,
        derivedKey,
        { iv: CryptoJS.enc.Hex.parse(encryptedData.iv) }
      )

      const decryptedString = decrypted.toString(CryptoJS.enc.Utf8)
      return JSON.parse(decryptedString)
    } catch (error) {
      console.error('Decryption failed:', error)
      throw new Error('Failed to decrypt form data')
    }
  }

  // Encrypt voice data with additional security
  encryptVoiceData(audioBlob: Blob, sessionId: string): Promise<EncryptedData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = () => {
        try {
          const arrayBuffer = reader.result as ArrayBuffer
          const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer)
          const base64Audio = CryptoJS.enc.Base64.stringify(wordArray)

          const salt = this.generateSalt()
          const iv = this.generateIV()
          const key = this.deriveKey(sessionId, salt)

          const encrypted = CryptoJS.AES.encrypt(base64Audio, key, {
            iv: CryptoJS.enc.Hex.parse(iv)
          }).toString()

          resolve({
            data: encrypted,
            iv,
            salt,
            timestamp: Date.now()
          })
        } catch (error) {
          reject(new Error('Voice encryption failed'))
        }
      }

      reader.onerror = () => reject(new Error('Failed to read audio data'))
      reader.readAsArrayBuffer(audioBlob)
    })
  }

  // Decrypt voice data
  async decryptVoiceData(encryptedData: EncryptedData, sessionId: string): Promise<Blob> {
    try {
      const key = this.deriveKey(sessionId, encryptedData.salt)
      
      const decrypted = CryptoJS.AES.decrypt(
        encryptedData.data,
        key,
        { iv: CryptoJS.enc.Hex.parse(encryptedData.iv) }
      )

      const base64Audio = decrypted.toString(CryptoJS.enc.Utf8)
      const wordArray = CryptoJS.enc.Base64.parse(base64Audio)
      const arrayBuffer = this.wordArrayToArrayBuffer(wordArray)
      
      return new Blob([arrayBuffer], { type: 'audio/wav' })
    } catch (error) {
      console.error('Voice decryption failed:', error)
      throw new Error('Failed to decrypt voice data')
    }
  }

  // Secure deletion of voice data
  async secureDeleteVoiceData(encryptedData: EncryptedData): Promise<void> {
    try {
      // Overwrite the encrypted data multiple times
      for (let i = 0; i < 3; i++) {
        encryptedData.data = CryptoJS.lib.WordArray.random(encryptedData.data.length).toString()
      }
      
      // Clear the object
      Object.keys(encryptedData).forEach(key => {
        delete (encryptedData as any)[key]
      })
    } catch (error) {
      console.error('Secure deletion failed:', error)
    }
  }

  // Generate session-specific encryption key
  private generateSessionKey(): string {
    return CryptoJS.lib.WordArray.random(256 / 8).toString()
  }

  // Get session key from secure storage
  private getSessionKey(): string {
    const key = sessionStorage.getItem('vocaform_session_key')
    if (!key) {
      const newKey = this.generateSessionKey()
      sessionStorage.setItem('vocaform_session_key', newKey)
      return newKey
    }
    return key
  }

  // Convert WordArray to ArrayBuffer
  private wordArrayToArrayBuffer(wordArray: CryptoJS.lib.WordArray): ArrayBuffer {
    const arrayOfWords = wordArray.hasOwnProperty('words') ? wordArray.words : []
    const length = wordArray.hasOwnProperty('sigBytes') ? wordArray.sigBytes : arrayOfWords.length * 4
    const uInt8Array = new Uint8Array(length)
    
    let index = 0
    for (let i = 0; i < length; i++) {
      const word = arrayOfWords[i]
      uInt8Array[index++] = word >> 24
      uInt8Array[index++] = (word >> 16) & 0xff
      uInt8Array[index++] = (word >> 8) & 0xff
      uInt8Array[index++] = word & 0xff
    }
    
    return uInt8Array.buffer
  }

  // Check if voice data should be deleted
  shouldDeleteVoiceData(timestamp: number): boolean {
    const maxAge = this.voiceConfig.maxRetentionDays * 24 * 60 * 60 * 1000
    return Date.now() - timestamp > maxAge
  }

  // Clean up expired voice data
  async cleanupExpiredVoiceData(): Promise<void> {
    try {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith('vocaform_voice_')
      )

      for (const key of keys) {
        const data = localStorage.getItem(key)
        if (data) {
          const parsed = JSON.parse(data)
          if (this.shouldDeleteVoiceData(parsed.timestamp)) {
            await this.secureDeleteVoiceData(parsed)
            localStorage.removeItem(key)
          }
        }
      }
    } catch (error) {
      console.error('Voice data cleanup failed:', error)
    }
  }
}

export const encryptionService = new EncryptionService()