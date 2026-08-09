import { useCallback, useEffect, useRef, useState } from "react"
import { useLocalStorage } from "./useLocalStorage.ts"
import { useLocale } from "../i18n/locale.tsx"

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
  const [locale] = useLocale()
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
    let poll: number | undefined = undefined
    // In theory, we should be able to use the `voiceschanged` event, but this
    // doesn’t work reliably across browsers. So it’s overall more robust to
    // use a brute-force polling mechanism.
    const check = () => {
      const vs = synth!.getVoices()
      if (vs.length > 0) {
        setVoices(groupVoicesByLanguage(vs))
        clearInterval(poll)
      }
    }
    let i = 0
    poll = setInterval(() => {
      if (i++ > 30) {
        clearInterval(poll)
      }
      check()
    }, 200)
    check()
  }, [])

  const say = useCallback(
    (text: string) => {
      const synth = window.speechSynthesis
      if (!shouldSpeak || !synth) {
        return
      }
      const allVoices = synth.getVoices()
      const voiceLang = locale.toLowerCase()
      const voice =
        allVoices.find((v) => v.name === currentVoice) ??
        allVoices.find((v) => v.lang.toLowerCase().startsWith(voiceLang)) ??
        allVoices[0]
      if (!voice) {
        return
      }
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.voice = voice
      utterance.pitch = 1.0
      utterance.rate = 1.0
      utterance.volume = volume
      synth.speak(utterance)
    },
    [shouldSpeak, volume, currentVoice, locale],
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

function groupVoicesByLanguage(voices: SpeechSynthesisVoice[]) {
  return Object.entries(
    voices.reduce<Record<string, string[]>>((acc, voice) => {
      if (!acc[voice.lang]) {
        acc[voice.lang] = []
      }
      acc[voice.lang].push(voice.name)
      return acc
    }, {}),
  ).sort(([langA], [langB]) => langA.localeCompare(langB))
}
