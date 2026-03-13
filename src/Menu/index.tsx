import React, { useState, useEffect } from "react"
// @ts-ignore
import css from "./style.module.css"
import { ScreenProps, Screens } from "../App"
import { Program } from "../program.ts"
import { Toolbar } from "../Toolbar"
import {
  IconFullScreen,
  IconGear,
  IconPencil,
  IconRocket,
} from "../util/Icons.tsx"
import { demoProgram } from "../App/useProgram.ts"

export type MenuProps = ScreenProps & {
  program?: Program
  loadProgram: (p: Program) => void
  clearProgram: () => void
}

export function Menu({
  program,
  loadProgram,
  clearProgram,
  goToScreen,
}: MenuProps) {
  const { isFullscreen, toggleFullscreen } = useFullScreen()
  const confirm = () => {
    return (
      !program ||
      window.confirm("Your current program will be cleared. Continue?")
    )
  }
  return (
    <div className={css.main}>
      <Toolbar>
        {program && (
          <button onClick={() => goToScreen(Screens.Timer)}>Back</button>
        )}
      </Toolbar>
      <div className={css.menu}>
        <button onClick={() => goToScreen(Screens.Settings)}>
          <IconGear />
          Settings
        </button>
        <button onClick={async () => toggleFullscreen()}>
          <IconFullScreen />
          {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        </button>
        <button
          onClick={() => {
            if (!confirm()) {
              return false
            }
            clearProgram()
            goToScreen(Screens.Editor)
          }}
        >
          <IconPencil />
          New timer program
        </button>
        <button
          onClick={() => {
            if (!confirm()) {
              return
            }
            loadProgram(demoProgram)
            goToScreen(Screens.Timer)
          }}
        >
          <IconRocket />
          Try demo timer
        </button>
      </div>
    </div>
  )
}

function useFullScreen() {
  const [isFullscreen, setIsFullScreen] = useState(!!document.fullscreenElement)

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement)
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  return {
    isFullscreen,
    toggleFullscreen: async () => {
      if (isFullscreen) {
        await document.exitFullscreen()
      } else {
        await document.documentElement.requestFullscreen({
          navigationUI: "hide",
        })
      }
    },
  }
}
