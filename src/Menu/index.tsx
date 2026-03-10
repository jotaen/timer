import React, { useState, useEffect } from "react"
// @ts-ignore
import css from "./style.module.css"
import { ScreenProps, Screens } from "../Main"
import { Program } from "../program.ts"
import { Toolbar } from "../Toolbar"
import { encode } from "../encode.ts"

const sampleProgram: Program = {
  title: "Sports!",
  items: [
    { kind: "ACTIVITY", title: "Get ready", duration: 5, skipLast: false },
    {
      kind: "LOOP",
      repeat: 3,
      items: [
        {
          kind: "ACTIVITY",
          title: "Work out",
          duration: 45,
          skipLast: false,
        },
        { kind: "ACTIVITY", title: "Rest", duration: 30, skipLast: true },
      ],
    },
    { kind: "ACTIVITY", title: "Cool down", duration: 60, skipLast: false },
  ],
}

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
        <button onClick={() => goToScreen(Screens.Settings)}>Settings</button>
        <button onClick={async () => toggleFullscreen()}>
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
          New timer program
        </button>
        <button
          onClick={() => {
            if (!confirm()) {
              return
            }
            loadProgram(sampleProgram)
            goToScreen(Screens.Timer)
          }}
        >
          Load demo timer
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
