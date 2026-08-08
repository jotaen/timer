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
import { useFullScreen } from "../util/useFullScreen.ts"
import { useServiceContext } from "../App/useServiceContext.ts"
import { useT } from "../i18n/locale.tsx"

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
  const t = useT()
  const { isFullscreen, toggleFullscreen, fullScreenFailed } =
    useServiceContext().fullScreen
  const confirm = () => {
    return !program || window.confirm(t.confirmClearProgram)
  }
  return (
    <div className={css.main}>
      <Toolbar>
        {program && (
          <button onClick={() => goToScreen(Screens.Timer)}>{t.back}</button>
        )}
      </Toolbar>
      <div className={css.menu}>
        <button onClick={() => goToScreen(Screens.Settings)}>
          <IconGear />
          {t.settings}
        </button>
        <button onClick={async () => toggleFullscreen()}>
          <IconFullScreen />
          {fullScreenFailed
            ? t.fullscreenError
            : isFullscreen
              ? t.exitFullscreen
              : t.fullscreen}
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
          {t.newTimerProgram}
        </button>
        <button
          onClick={() => {
            if (!confirm()) {
              return
            }
            loadProgram(t.demoProgram)
            goToScreen(Screens.Timer)
          }}
        >
          <IconStars />
          {t.tryDemoTimer}
        </button>
      </div>
      <div className={css.footer}>
        <p>
          {t.createdBy}{" "}
          <a href="https://www.jotaen.net" target="_blank">
            Jan Heuermann
          </a>
        </p>
        <p className={css.githubLink}>
          <IconGithub />
          {t.starOn}
          {"\u00A0"}
          <a href="https://github.com/jotaen/timer" target="_blank">
            GitHub
          </a>
        </p>
      </div>
    </div>
  )
}
