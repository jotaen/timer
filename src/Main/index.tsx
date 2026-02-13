import React, { useState, useEffect, createContext } from "react"
// @ts-ignore
import css from "./style.module.css"
import { createRoot } from "react-dom/client"
import { Timer } from "../Timer"
import { Editor } from "../Editor"
import { Settings } from "../Settings"
import { Share } from "../Share"
import { Program } from "../program.ts"
import { useSettings } from "../Settings/useSettings.ts"
import { Menu } from "../Menu"
import { STATUS, useTicker } from "../useTicker.ts"
import { useProgram } from "../useProgram.ts"

const container = document.getElementById("app")
const root = createRoot(container!)
root.render(<Main />)

export enum Screens {
  "Menu",
  "Timer",
  "Editor",
  "Settings",
  "Share",
}

export type ScreenProps = {
  goToScreen: (s: Screens) => void
}

const dummyProgram: Program = {
  title: "",
  items: [],
}

export const ProgramContext = createContext<{
  hasProgram: boolean
  title: string
  remaining?: number
}>({
  hasProgram: false,
  title: "",
  remaining: undefined,
})

function Main() {
  const { program, loadProgram, clearProgram } = useProgram()
  const [screen, goToScreen] = useState<Screens>(Screens.Timer)
  const settings = useSettings()
  const ticker = useTicker(program || dummyProgram, settings)
  const isTimerActive =
    ticker.status === STATUS.RUNNING || ticker.status === STATUS.PAUSED

  const Screen: React.JSX.Element = (() => {
    const MenuScreen = (
      <Menu
        program={program}
        clearProgram={clearProgram}
        loadProgram={loadProgram}
        goToScreen={goToScreen}
      />
    )

    switch (screen) {
      case Screens.Menu:
        return MenuScreen
      case Screens.Timer:
        return program ? (
          <Timer goToScreen={goToScreen} ticker={ticker} />
        ) : (
          MenuScreen
        )
      case Screens.Editor:
        return (
          <Editor
            program={program}
            loadProgram={loadProgram}
            isReadonly={isTimerActive}
            goToScreen={goToScreen}
          />
        )
      case Screens.Settings:
        return <Settings settings={settings} goToScreen={goToScreen} />
      case Screens.Share:
        return <Share goToScreen={goToScreen} program={program!} />
    }
  })()

  return (
    <ProgramContext
      value={{
        hasProgram: !!program,
        title: program?.title || "",
        remaining: ticker.remaining,
      }}
    >
      <div className={css.main}>{Screen}</div>
    </ProgramContext>
  )
}
