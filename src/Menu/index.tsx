import React from "react"
import css from "./style.module.css"
import { ScreenProps, Screens } from "../App"
import { Program } from "../program.ts"
import { Toolbar } from "../Toolbar"
import {
  IconFullScreen,
  IconGear,
  IconGithub,
  IconPencil,
  IconStars,
} from "../util/Icons.tsx"
import { demoProgram } from "../App/useProgram.ts"
import { useFullScreen } from "../util/useFullScreen.ts"
import { useServiceContext } from "../App/useServiceContext.ts"

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
  const { isFullscreen, toggleFullscreen, fullScreenFailed } =
    useServiceContext().fullScreen
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
          {fullScreenFailed
            ? "Error: not possible"
            : isFullscreen
              ? "Exit Fullscreen"
              : "Fullscreen"}
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
          <IconStars />
          Try demo timer
        </button>
      </div>
      <div className={css.footer}>
        <p>
          Created by{" "}
          <a href="https://www.jotaen.net" target="_blank">
            Jan Heuermann
          </a>
        </p>
        <p className={css.githubLink}>
          <IconGithub />
          Star on{"\u00A0"}
          <a href="https://github.com/jotaen/timer" target="_blank">
            GitHub
          </a>
        </p>
      </div>
    </div>
  )
}
