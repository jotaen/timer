import { useEffect, useCallback, useRef } from "react"
import { useT } from "../i18n/locale.tsx"

export type NavigationGuard = {
  enable: (isEnabled?: boolean) => void
  disable: () => void
  checkAndConfirm: () => boolean
}

export function useNavigationGuard(): NavigationGuard {
  const t = useT()
  const enabledRef = useRef(false)

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!enabledRef.current) {
        return
      }
      e.preventDefault()
    }

    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [])

  const enable = useCallback((isEnabled = true) => {
    enabledRef.current = isEnabled
  }, [])
  const disable = useCallback(() => {
    enabledRef.current = false
  }, [])
  const checkAndConfirm = useCallback(() => {
    if (!enabledRef.current) {
      return true
    }
    const confirmed = window.confirm(t.unsavedChangesConfirm)
    if (confirmed) {
      // The changes are discarded, so there is nothing to guard anymore.
      enabledRef.current = false
    }
    return confirmed
  }, [t])

  return { enable, disable, checkAndConfirm }
}
