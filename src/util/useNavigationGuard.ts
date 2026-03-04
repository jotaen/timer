import { useEffect, useCallback, useRef } from "react"

type NavigationGuard = {
  enable: (isEnabled?: boolean) => void
  disable: () => void
  checkAndConfirm: () => boolean
}

export function useNavigationGuard(): NavigationGuard {
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
  const confirm = useCallback(() => {
    if (!enabledRef.current) {
      return true
    }
    return window.confirm(
      "You have unsaved changes. Are you sure you want to leave?",
    )
  }, [])

  return { enable, disable, checkAndConfirm: confirm }
}
