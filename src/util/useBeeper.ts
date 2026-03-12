import { useCallback, useEffect, useRef } from "react"
import { useLocalStorage } from "./useLocalStorage.ts"

export type UseBeeper = {
  beep: (frequency: number, duration: number) => void
  enable: () => void
  shouldBeep: boolean
  setShouldBeep: (b: boolean) => void
  volume: number // 0.0 - 1.0
  setVolume: (v: number) => void
}

const AudioContext = window.AudioContext ?? (window as any).webkitAudioContext

export function useBeeper(): UseBeeper {
  const getAudioCtx = useAudioContext()
  const [shouldBeep, setShouldBeep] = useLocalStorage<boolean>(
    "beep:enabled",
    true,
  )
  const [volume, setVolume] = useLocalStorage<number>("beep:volume", 1.0)

  const beep = useCallback(
    async (frequency: number, duration: number, volumeOverride?: number) => {
      if (!shouldBeep) {
        return
      }

      const audioCtx = await getAudioCtx()
      if (!audioCtx) {
        return
      }

      const oscillator = audioCtx.createOscillator()
      const gainNode = audioCtx.createGain()
      oscillator.connect(gainNode)
      gainNode.connect(audioCtx.destination)

      const t = audioCtx.currentTime
      const endTime = t + duration / 1000
      gainNode.gain.value = volumeOverride || 0.4 * volume
      oscillator.frequency.value = frequency
      oscillator.type = "square"
      oscillator.start(t)
      oscillator.stop(endTime)
    },
    [getAudioCtx, shouldBeep, volume],
  )

  const enable = useCallback(() => {
    beep(15000, 1, 0.01)
  }, [])

  return { beep, enable, shouldBeep, setShouldBeep, volume, setVolume }
}

export function useAudioContext() {
  const audioCtx = useRef<AudioContext | null>(null)

  useEffect(() => {
    return () => {
      audioCtx.current?.close()
      audioCtx.current = null
    }
  }, [])

  return useCallback(async (): Promise<AudioContext | null> => {
    if (!AudioContext) {
      return null
    }
    if (!audioCtx.current || audioCtx.current.state === "closed") {
      audioCtx.current = new AudioContext()
    }
    if (audioCtx.current.state === "suspended") {
      await audioCtx.current.resume()
    }
    return audioCtx.current
  }, [])
}
