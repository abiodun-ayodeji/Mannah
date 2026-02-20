import { useState, useCallback, useEffect, useRef } from 'react'

const synth = typeof window !== 'undefined' ? window.speechSynthesis : null

/** Pick a suitable English voice from available system voices */
function getEnglishVoice(): SpeechSynthesisVoice | null {
  if (!synth) return null
  const voices = synth.getVoices()
  // Prefer a British English voice (good for UK 11+ context)
  const british = voices.find((v) => v.lang === 'en-GB' && !v.localService === false)
    ?? voices.find((v) => v.lang === 'en-GB')
  if (british) return british
  // Fallback to any English voice
  const english = voices.find((v) => v.lang.startsWith('en'))
  return english ?? null
}

export function useReadAloud() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Stop speech on unmount
  useEffect(() => {
    return () => {
      synth?.cancel()
    }
  }, [])

  const speak = useCallback((text: string) => {
    if (!synth || !text.trim()) return

    // Cancel any current speech
    synth.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    const voice = getEnglishVoice()
    if (voice) utterance.voice = voice
    utterance.rate = 0.9 // Slightly slower for kids
    utterance.pitch = 1.05

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    utteranceRef.current = utterance
    synth.speak(utterance)
  }, [])

  const stop = useCallback(() => {
    synth?.cancel()
    setIsSpeaking(false)
  }, [])

  return { speak, stop, isSpeaking }
}
