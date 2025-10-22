/**
 * Web Speech API Wrapper for Speech-to-Text (STT)
 *
 * Provides a clean interface for browser-based speech recognition.
 * Uses Web Speech API (available in Chrome, Edge, Safari).
 *
 * No dependencies required - uses built-in browser APIs.
 */

// Extend Window interface for Web Speech API types
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}

export interface VoiceRecognitionOptions {
  language?: string // Default: 'en-US'
  continuous?: boolean // Keep listening after results
  interimResults?: boolean // Show partial results while speaking
  maxAlternatives?: number // Number of alternative transcriptions
}

export interface VoiceRecognitionResult {
  transcript: string
  confidence: number
  isFinal: boolean
}

export interface VoiceRecognitionCallbacks {
  onResult?: (result: VoiceRecognitionResult) => void
  onEnd?: () => void
  onError?: (error: string) => void
  onStart?: () => void
}

export class VoiceRecognition {
  private recognition: SpeechRecognition | null = null
  private isListening: boolean = false
  private callbacks: VoiceRecognitionCallbacks = {}

  constructor(options: VoiceRecognitionOptions = {}, callbacks: VoiceRecognitionCallbacks = {}) {
    this.callbacks = callbacks

    // Check browser support
    if (!this.isSupported()) {
      console.error('Web Speech API not supported in this browser')
      return
    }

    // Create recognition instance
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
    this.recognition = new SpeechRecognitionAPI()

    // Configure recognition
    this.recognition.language = options.language || 'en-US'
    this.recognition.continuous = options.continuous !== undefined ? options.continuous : false
    this.recognition.interimResults = options.interimResults !== undefined ? options.interimResults : true
    this.recognition.maxAlternatives = options.maxAlternatives || 1

    // Event listeners
    this.recognition.onstart = () => {
      this.isListening = true
      this.callbacks.onStart?.()
    }

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const lastResultIndex = event.results.length - 1
      const lastResult = event.results[lastResultIndex]
      const transcript = lastResult[0].transcript
      const confidence = lastResult[0].confidence
      const isFinal = lastResult.isFinal

      this.callbacks.onResult?.({
        transcript,
        confidence,
        isFinal,
      })
    }

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error)
      this.isListening = false

      let errorMessage = 'Speech recognition error'
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected. Please try again.'
          break
        case 'audio-capture':
          errorMessage = 'Microphone not found or accessible.'
          break
        case 'not-allowed':
          errorMessage = 'Microphone permission denied.'
          break
        case 'network':
          errorMessage = 'Network error occurred.'
          break
        case 'aborted':
          errorMessage = 'Speech recognition aborted.'
          break
        default:
          errorMessage = `Speech recognition error: ${event.error}`
      }

      this.callbacks.onError?.(errorMessage)
    }

    this.recognition.onend = () => {
      this.isListening = false
      this.callbacks.onEnd?.()
    }
  }

  /**
   * Check if Web Speech API is supported
   */
  static isSupported(): boolean {
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
  }

  /**
   * Instance method to check support
   */
  isSupported(): boolean {
    return VoiceRecognition.isSupported()
  }

  /**
   * Start listening
   */
  start(): void {
    if (!this.recognition) {
      console.error('Speech recognition not initialized')
      return
    }

    if (this.isListening) {
      console.warn('Already listening')
      return
    }

    try {
      this.recognition.start()
    } catch (error) {
      console.error('Error starting recognition:', error)
      this.callbacks.onError?.('Failed to start speech recognition')
    }
  }

  /**
   * Stop listening
   */
  stop(): void {
    if (!this.recognition) return

    if (!this.isListening) {
      console.warn('Not currently listening')
      return
    }

    try {
      this.recognition.stop()
    } catch (error) {
      console.error('Error stopping recognition:', error)
    }
  }

  /**
   * Abort listening immediately
   */
  abort(): void {
    if (!this.recognition) return

    try {
      this.recognition.abort()
    } catch (error) {
      console.error('Error aborting recognition:', error)
    }
  }

  /**
   * Check if currently listening
   */
  getIsListening(): boolean {
    return this.isListening
  }

  /**
   * Update language
   */
  setLanguage(language: string): void {
    if (this.recognition) {
      this.recognition.language = language
    }
  }

  /**
   * Get available languages (common ones)
   */
  static getAvailableLanguages(): Array<{ code: string; name: string }> {
    return [
      { code: 'en-US', name: 'English (US)' },
      { code: 'en-GB', name: 'English (UK)' },
      { code: 'es-ES', name: 'Spanish (Spain)' },
      { code: 'es-MX', name: 'Spanish (Mexico)' },
      { code: 'fr-FR', name: 'French' },
      { code: 'de-DE', name: 'German' },
      { code: 'it-IT', name: 'Italian' },
      { code: 'pt-BR', name: 'Portuguese (Brazil)' },
      { code: 'zh-CN', name: 'Chinese (Simplified)' },
      { code: 'ja-JP', name: 'Japanese' },
      { code: 'ko-KR', name: 'Korean' },
      { code: 'ru-RU', name: 'Russian' },
      { code: 'ar-SA', name: 'Arabic' },
      { code: 'hi-IN', name: 'Hindi' },
    ]
  }
}
