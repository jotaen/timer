import { useEffect, useCallback, useRef } from "react"

export type NavigationGuard = {
  enable: (reason: string, message: string, isEnabled?: boolean) => void
  disable: (reason: string) => void
  // Checks the given reason only (or all reasons, if none is given), since
  // some navigations only abandon some of the guarded things, e.g. in-app
  // screen switches, which leave a running timer untouched.
  checkAndConfirm: (reason?: string) => boolean
}

export function useNavigationGuard(): NavigationGuard {
  // The active reasons, mapped to their respective confirm message. The guard
  // can be active for independent reasons at the same time, e.g. a paused
  // timer while the (readonly) editor is open.
  const reasonsRef = useRef<Map<string, string>>(new Map())

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (reasonsRef.current.size === 0) {
        return
      }
      e.preventDefault()
    }

    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [])

  const enable = useCallback(
    (reason: string, message: string, isEnabled = true) => {
      if (isEnabled) {
        reasonsRef.current.set(reason, message)
      } else {
        reasonsRef.current.delete(reason)
      }
    },
    [],
  )
  const disable = useCallback((reason: string) => {
    reasonsRef.current.delete(reason)
  }, [])
  const checkAndConfirm = useCallback((reason?: string) => {
    const activeReasons = [...reasonsRef.current.keys()].filter(
      (r) => !reason || r === reason,
    )
    if (activeReasons.length === 0) {
      return true
    }
    const confirmed = window.confirm(reasonsRef.current.get(activeReasons[0]))
    if (confirmed) {
      // Whatever was guarded is being abandoned, so there is nothing to
      // guard anymore.
      activeReasons.forEach((r) => reasonsRef.current.delete(r))
    }
    return confirmed
  }, [])

  return { enable, disable, checkAndConfirm }
}
