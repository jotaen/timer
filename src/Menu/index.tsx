import React, { useState, useEffect } from "react"
// @ts-ignore
import css from "../Main/style.module.css"
import { ScreenProps, Screens } from "../Main"
import { Program } from "../program.ts"
import { Toolbar } from "../Toolbar"
import { encode } from "../encode.ts"

const samplePrograms: Program[] = [
  {
    title: "Sports!",
    items: [
      { kind: "ACTIVITY", title: "Get ready!", duration: 5, skipLast: false },
      {
        kind: "LOOP",
        repeat: 2,
        items: [
          {
            kind: "ACTIVITY",
            title: "Work out",
            duration: 10,
            skipLast: false,
          },
          { kind: "ACTIVITY", title: "Rest", duration: 5, skipLast: true },
        ],
      },
    ],
  },
]

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
        <p>
          <button
            onClick={() => {
              if (!confirm()) {
                return false
              }
              clearProgram()
              goToScreen(Screens.Editor)
            }}
          >
            New program
          </button>
        </p>
        <p>
          <button onClick={() => goToScreen(Screens.Settings)}>Settings</button>
        </p>
        <p>
          <button onClick={async () => toggleFullscreen()}>
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </button>
        </p>
        <p>
          <strong>Demo Programs:</strong>
          <br />
          {samplePrograms.map((p) => (
            <a
              key={p.title}
              href={`#${encode(p)}`}
              onClick={(evt) => {
                evt.preventDefault()
                if (!confirm()) {
                  return false
                }
                loadProgram(p)
                goToScreen(Screens.Timer)
                return false
              }}
            >
              {p.title}
            </a>
          ))}
        </p>
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
