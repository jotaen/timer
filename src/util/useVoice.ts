import { useCallback } from "react"
import { useLocalStorage } from "./useLocalStorage.ts"

export type UseVoice = {
  say: (text: string) => void
  shouldSpeak: boolean
  setShouldSpeak: (b: boolean) => void
}

export function useVoice(): UseVoice {
  const [shouldSpeak, setShouldSpeak] = useLocalStorage<boolean>(
    "voice:enabled",
    true,
  )
  const say = useCallback(
    (text: string) => {
      if (!shouldSpeak) {
        return
      }
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
    },
    [shouldSpeak],
  )

  return { say, shouldSpeak, setShouldSpeak }
}
