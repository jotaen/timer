import { useCallback } from "react"

export type UseVoice = {
  say: (text: string) => void
}

export function useVoice(): UseVoice {
  const say = useCallback((text: string) => {
    const synth = window.speechSynthesis
    if (!synth) {
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.voice = synth.getVoices()[0]
    utterance.pitch = 1.0
    utterance.rate = 1.0
    utterance.volume = 1.0
    synth.speak(utterance)
  }, [])

  return { say }
}
