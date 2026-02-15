import React, { useState, createContext, useEffect } from "react"
// @ts-ignore
import css from "./style.module.css"
import { createRoot } from "react-dom/client"
import { Timer } from "../Timer"
import { Editor } from "../Editor"
import { Settings } from "../Settings"
import { Share } from "../Share"
import { Program } from "../program.ts"
import { Menu } from "../Menu"
import { STATUS, useTicker } from "../useTicker.ts"
import { useProgram } from "./useProgram.ts"

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

export const ProgramContext = createContext<{
  hasProgram: boolean
  title: string
  remaining?: number
  status: STATUS
}>({
  hasProgram: false,
  title: "",
  remaining: undefined,
  status: STATUS.RESET,
})

function Main() {
  const { program, loadProgram, clearProgram } = useProgram()
  const { screen, goToScreen } = useScreen(program)
  const ticker = useTicker(program)

  const Screen: React.JSX.Element = (() => {
    switch (screen) {
      case Screens.Menu:
        return (
          <Menu
            program={program}
            clearProgram={clearProgram}
            loadProgram={loadProgram}
            goToScreen={goToScreen}
          />
        )
      case Screens.Timer:
        return <Timer goToScreen={goToScreen} ticker={ticker!} />
      case Screens.Editor:
        return (
          <Editor
            program={program}
            loadProgram={loadProgram}
            isReadonly={ticker.status !== STATUS.RESET}
            goToScreen={goToScreen}
          />
        )
      case Screens.Settings:
        return <Settings goToScreen={goToScreen} />
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
        status: ticker.status,
      }}
    >
      <div className={css.main}>{Screen}</div>
    </ProgramContext>
  )
}

function useScreen(program?: Program) {
  const [screen, setScreen] = useState<Screens>(
    program ? Screens.Timer : Screens.Menu,
  )
  useEffect(() => {
    // Make sure to reset screen after program reload.
    setScreen(program ? Screens.Timer : Screens.Menu)
  }, [program])
  return { screen, goToScreen: setScreen }
}
