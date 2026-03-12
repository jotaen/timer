import { useCallback, useEffect, useRef, useState } from "react"
import { useLocalStorage } from "./useLocalStorage.ts"

export type UseVoice = {
  say: (text: string) => void
  voices: [string, string[]][] // Voice names grouped by language
  setVoice: (name: string) => void
  currentVoice?: string
  shouldSpeak: boolean
  setShouldSpeak: (b: boolean) => void
  volume: number // 0.0 - 1.0
  setVolume: (v: number) => void
}

export function useVoice(): UseVoice {
  const [shouldSpeak, setShouldSpeak] = useLocalStorage<boolean>(
    "voice:enabled",
    true,
  )
  const [volume, setVolume] = useLocalStorage<number>("voice:volume", 1.0)
  const [currentVoice, setVoice] = useLocalStorage<string>("voice:name", "")
  const [voices, setVoices] = useState<[string, string[]][]>([])

  useEffect(() => {
    const synth = window.speechSynthesis
    if (!synth) {
      return
    }
    synth.addEventListener("voiceschanged", () => {
      setVoices(
        Object.entries(
          synth!.getVoices().reduce<Record<string, string[]>>((acc, voice) => {
            if (!acc[voice.lang]) {
              acc[voice.lang] = []
            }
            acc[voice.lang].push(voice.name)
            return acc
          }, {}),
        ),
      )
    })
  }, [])

  const say = useCallback(
    (text: string) => {
      const synth = window.speechSynthesis
      if (!shouldSpeak || !synth) {
        return
      }
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.voice =
        synth.getVoices().find((v) => v.name === currentVoice) ||
        synth.getVoices()[0]
      utterance.pitch = 1.0
      utterance.rate = 1.0
      utterance.volume = volume
      synth.speak(utterance)
    },
    [shouldSpeak, volume, currentVoice],
  )

  return {
    say,
    voices,
    setVoice,
    currentVoice,
    shouldSpeak,
    setShouldSpeak,
    volume,
    setVolume,
  }
}
