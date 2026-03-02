import { useCallback, useRef } from "react"

export function useWakeLock() {
  const lockRef = useRef<WakeLockSentinel | null>(null)

  const on = useCallback(async () => {
    if (!("wakeLock" in navigator)) {
      return
    }

    off()

    try {
      lockRef.current = (await navigator.wakeLock.request("screen")) ?? null
    } catch {}
  }, [])

  const off = useCallback(async () => {
    if (!lockRef.current) {
      return
    }

    try {
      await lockRef.current.release()
      lockRef.current = null
    } catch {}
  }, [])

  return { on, off }
}
