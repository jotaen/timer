import React, { useState } from "react"
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
import { Background } from "./Background"
import { ProgramContext } from "./useProgramContext.ts"
import { Voice } from "../util/voice.ts"
import { Beeper } from "../util/beeper.ts"
import { useNavigationGuard } from "../util/useNavigationGuard.ts"
import { useWakeLock } from "../util/useWakeLock.ts"
import { ServiceContext } from "./useServiceContext.ts"

const container = document.getElementById("app")
const root = createRoot(container!)
root.render(<App />)

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

function App() {
  const services = {
    beeper: new Beeper(),
    voice: new Voice(),
    navigationGuard: useNavigationGuard(),
    wakeLock: useWakeLock(),
  }
  return (
    <ServiceContext value={services}>
      <Main />
    </ServiceContext>
  )
}

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
        return <Timer goToScreen={goToScreen} ticker={ticker} />
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
    <ProgramContext value={program ? { program, ticker } : null}>
      <Background />
      <div className={css.main}>{Screen}</div>
    </ProgramContext>
  )
}

function useScreen(program?: Program) {
  const [screen, setScreen] = useState<Screens>(
    program ? Screens.Timer : Screens.Menu,
  )
  return { screen, goToScreen: setScreen }
}
