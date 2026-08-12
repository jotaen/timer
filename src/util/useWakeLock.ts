import { useCallback, useEffect, useRef } from "react"

export type WakeLock = {
  on: () => void
  off: () => void
}

export function useWakeLock() {
  const lockRef = useRef<WakeLockSentinel | null>(null)
  // Whether the lock is meant to be held right now. The browser automatically
  // releases the lock whenever the page is hidden (e.g. when switching apps),
  // so we have to remember the intent in order to re-acquire it on return.
  const isDesiredRef = useRef(false)

  const acquire = useCallback(async () => {
    try {
      lockRef.current = (await navigator.wakeLock.request("screen")) ?? null
    } catch {}
  }, [])

  const release = useCallback(async () => {
    if (!lockRef.current) {
      return
    }

    try {
      await lockRef.current.release()
      lockRef.current = null
    } catch {}
  }, [])

  const on = useCallback(async () => {
    if (!("wakeLock" in navigator)) {
      return
    }

    isDesiredRef.current = true
    await release()
    await acquire()
  }, [acquire, release])

  const off = useCallback(async () => {
    isDesiredRef.current = false
    await release()
  }, [release])

  useEffect(() => {
    if (!("wakeLock" in navigator)) {
      return
    }
    const handler = () => {
      if (document.visibilityState === "visible" && isDesiredRef.current) {
        acquire()
      }
    }
    document.addEventListener("visibilitychange", handler)
    return () => document.removeEventListener("visibilitychange", handler)
  }, [acquire])

  return { on, off }
}
