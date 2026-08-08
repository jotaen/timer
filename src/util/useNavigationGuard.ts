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
    return window.confirm(t.unsavedChangesConfirm)
  }, [t])

  return { enable, disable, checkAndConfirm }
}
