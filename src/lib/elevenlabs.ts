import { ElevenLabsApi, ElevenLabsApiOptions } from 'elevenlabs'

const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY

if (!apiKey) {
  console.warn('ElevenLabs API key not found. Voice synthesis will be disabled.')
}

class ElevenLabsService {
  private client: ElevenLabsApi | null = null
  private isEnabled = false

  constructor() {
    if (apiKey) {
      this.client = new ElevenLabsApi({
        apiKey: apiKey
      })
      this.isEnabled = true
    }
  }

  async getVoices() {
    if (!this.client) return []
    
    try {
      const response = await this.client.voices.getAll()
      return response.voices || []
    } catch (error) {
      console.error('Failed to fetch voices:', error)
      return []
    }
  }

  async synthesizeSpeech(
    text: string, 
    voiceId: string = 'pNInz6obpgDQGcFmaJgB', // Default voice
    options: {
      stability?: number
      similarityBoost?: number
      style?: number
      useSpeakerBoost?: boolean
    } = {}
  ): Promise<ArrayBuffer | null> {
    if (!this.client || !this.isEnabled) {
      console.warn('ElevenLabs not available')
      return null
    }

    try {
      const response = await this.client.textToSpeech.convert(voiceId, {
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: options.stability ?? 0.5,
          similarity_boost: options.similarityBoost ?? 0.75,
          style: options.style ?? 0.0,
          use_speaker_boost: options.useSpeakerBoost ?? true
        }
      })

      return response
    } catch (error) {
      console.error('Speech synthesis failed:', error)
      return null
    }
  }

  async playText(text: string, voiceId?: string): Promise<void> {
    const audioBuffer = await this.synthesizeSpeech(text, voiceId)
    
    if (!audioBuffer) {
      // Fallback to browser speech synthesis
      this.fallbackToWebSpeech(text)
      return
    }

    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const audioBufferDecoded = await audioContext.decodeAudioData(audioBuffer)
      const source = audioContext.createBufferSource()
      
      source.buffer = audioBufferDecoded
      source.connect(audioContext.destination)
      source.start()
    } catch (error) {
      console.error('Audio playback failed:', error)
      this.fallbackToWebSpeech(text)
    }
  }

  private fallbackToWebSpeech(text: string): void {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1.0
      utterance.volume = 0.8
      
      // Try to find a good voice
      const voices = speechSynthesis.getVoices()
      const preferredVoice = voices.find(voice => 
        voice.lang.startsWith('en') && voice.name.includes('Google')
      ) || voices.find(voice => voice.lang.startsWith('en'))
      
      if (preferredVoice) {
        utterance.voice = preferredVoice
      }
      
      speechSynthesis.speak(utterance)
    }
  }

  // Generate field prompts for voice guidance
  generateFieldPrompt(fieldLabel: string, fieldType: string, isRequired: boolean): string {
    const requiredText = isRequired ? 'This is a required field. ' : ''
    
    switch (fieldType) {
      case 'text':
        return `${requiredText}Please provide your ${fieldLabel.toLowerCase()}.`
      case 'email':
        return `${requiredText}Please spell out your ${fieldLabel.toLowerCase()}, including the at symbol and domain.`
      case 'tel':
        return `${requiredText}Please say your ${fieldLabel.toLowerCase()}, including the country code if applicable.`
      case 'date':
        return `${requiredText}Please provide the ${fieldLabel.toLowerCase()} in day, month, year format.`
      case 'select':
        return `${requiredText}Please choose one of the available options for ${fieldLabel.toLowerCase()}.`
      case 'number':
        return `${requiredText}Please say the number for ${fieldLabel.toLowerCase()}.`
      default:
        return `${requiredText}Please provide your ${fieldLabel.toLowerCase()}.`
    }
  }

  // Generate confirmation messages
  generateConfirmationMessage(fieldLabel: string, value: string, confidence: number): string {
    const confidenceText = confidence > 0.8 ? 'I heard' : 'I think I heard'
    return `${confidenceText} ${value} for ${fieldLabel.toLowerCase()}. Is this correct?`
  }

  // Generate error messages
  generateErrorMessage(fieldLabel: string, errorType: string): string {
    switch (errorType) {
      case 'required':
        return `${fieldLabel} is required. Please provide this information.`
      case 'invalid_format':
        return `The format for ${fieldLabel.toLowerCase()} is not valid. Please try again.`
      case 'low_confidence':
        return `I didn't catch that clearly. Please repeat your ${fieldLabel.toLowerCase()}.`
      default:
        return `There was an issue with ${fieldLabel.toLowerCase()}. Please try again.`
    }
  }

  isAvailable(): boolean {
    return this.isEnabled
  }
}

export const elevenLabsService = new ElevenLabsService()

// Voice guidance hook
export function useVoiceGuidance() {
  const playFieldPrompt = async (fieldLabel: string, fieldType: string, isRequired: boolean) => {
    const prompt = elevenLabsService.generateFieldPrompt(fieldLabel, fieldType, isRequired)
    await elevenLabsService.playText(prompt)
  }

  const playConfirmation = async (fieldLabel: string, value: string, confidence: number) => {
    const message = elevenLabsService.generateConfirmationMessage(fieldLabel, value, confidence)
    await elevenLabsService.playText(message)
  }

  const playError = async (fieldLabel: string, errorType: string) => {
    const message = elevenLabsService.generateErrorMessage(fieldLabel, errorType)
    await elevenLabsService.playText(message)
  }

  const playCustomMessage = async (message: string) => {
    await elevenLabsService.playText(message)
  }

  return {
    playFieldPrompt,
    playConfirmation,
    playError,
    playCustomMessage,
    isAvailable: elevenLabsService.isAvailable()
  }
}