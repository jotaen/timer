import { useCallback, useEffect, useState } from "react"

export type FullScreen = {
  isFullscreen: boolean
  fullScreenFailed: boolean
  toggleFullscreen: () => void
}

export function useFullScreen(): FullScreen {
  const [isFullscreen, setIsFullScreen] = useState(!!document.fullscreenElement)
  const [fullScreenFailed, setFullScreenFailed] = useState(false)

  const handleFullscreenChange = () => {
    setIsFullScreen(!!document.fullscreenElement)
  }
  const handleFullscreenError = () => {
    setFullScreenFailed(true)
    setTimeout(() => setFullScreenFailed(false), 2000)
  }

  useEffect(() => {
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    document.addEventListener("fullscreenerror", handleFullscreenError)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
      document.removeEventListener("fullscreenerror", handleFullscreenError)
    }
  }, [])

  const toggleFullscreen = useCallback(async () => {
    try {
      setFullScreenFailed(false)
      if (isFullscreen) {
        await document.exitFullscreen()
      } else {
        await document.documentElement.requestFullscreen({
          navigationUI: "hide",
        })
      }
    } catch {
      handleFullscreenError()
    }
  }, [isFullscreen])

  return { isFullscreen, fullScreenFailed, toggleFullscreen }
}
