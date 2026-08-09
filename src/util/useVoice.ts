import { useCallback, useEffect, useMemo, useState } from "react"
import { useLocalStorage } from "./useLocalStorage.ts"
import { useLocale } from "../i18n/locale.tsx"

export type UseVoice = {
  say: (text: string) => void
  voices: [string, SpeechSynthesisVoice[]][] // Voices grouped by language
  setVoice: (voiceURI: string) => void
  currentVoice?: SpeechSynthesisVoice // The voice that’s effectively in use
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
  const [chosenVoiceURI, setVoice] = useLocalStorage<string>("voice:uri", "")
  const [allVoices, setAllVoices] = useState<SpeechSynthesisVoice[]>([])

  useEffect(() => {
    const synth = window.speechSynthesis
    if (!synth) {
      return
    }
    let poll: number | undefined = undefined
    const check = () => {
      const vs = synth!.getVoices()
      if (vs.length > 0) {
        setAllVoices(vs)
        clearInterval(poll)
      }
    }
    // In theory, listening to the `voiceschanged` event should suffice, but
    // it doesn’t work reliably across browsers, so we additionally use a
    // brute-force polling mechanism for the initial load. The event listener
    // remains active beyond that, in case the voices change later on.
    synth.addEventListener("voiceschanged", check)
    let i = 0
    poll = setInterval(() => {
      if (i++ > 30) {
        clearInterval(poll)
      }
      check()
    }, 200)
    check()
    return () => {
      synth.removeEventListener("voiceschanged", check)
      clearInterval(poll)
    }
  }, [])

  const effectiveVoice = resolveVoice(allVoices, chosenVoiceURI, locale)
  const voices = useMemo(() => groupVoicesByLanguage(allVoices), [allVoices])

  const say = useCallback(
    (text: string) => {
      const synth = window.speechSynthesis
      if (!shouldSpeak || !synth || !effectiveVoice) {
        return
      }
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.voice = effectiveVoice
      utterance.pitch = 1.0
      utterance.rate = 1.0
      utterance.volume = volume
      synth.speak(utterance)
    },
    [shouldSpeak, volume, effectiveVoice],
  )

  return {
    say,
    voices,
    setVoice,
    currentVoice: effectiveVoice,
    shouldSpeak,
    setShouldSpeak,
    volume,
    setVolume,
  }
}

// The voice explicitly chosen by the user, or (if there is none, or it’s not
// available on this device) the best match for the app locale.
export function resolveVoice(
  voices: SpeechSynthesisVoice[],
  chosenVoiceURI: string,
  locale: string,
): SpeechSynthesisVoice | undefined {
  const voiceLang = locale.toLowerCase()
  const language = voiceLang.split("-")[0]
  // Some platforms use underscore-delimited language tags, e.g. `en_US`.
  const normalise = (lang: string) => lang.toLowerCase().replace("_", "-")
  return (
    voices.find((v) => v.voiceURI === chosenVoiceURI) ??
    voices.find((v) => normalise(v.lang).startsWith(voiceLang)) ??
    voices.find((v) => normalise(v.lang).split("-")[0] === language) ??
    voices[0]
  )
}

function groupVoicesByLanguage(
  voices: SpeechSynthesisVoice[],
): [string, SpeechSynthesisVoice[]][] {
  return Object.entries(
    voices.reduce<Record<string, SpeechSynthesisVoice[]>>((acc, voice) => {
      if (!acc[voice.lang]) {
        acc[voice.lang] = []
      }
      acc[voice.lang].push(voice)
      return acc
    }, {}),
  ).sort(([langA], [langB]) => langA.localeCompare(langB))
}
