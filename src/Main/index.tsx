import React, { useState, useEffect } from "react"
// @ts-ignore
import css from "./style.module.css"
import { createRoot } from "react-dom/client"
import { Timer } from "../Timer"
import { Editor } from "../Editor"
import { Settings } from "../Settings"
import { Share } from "../Share"
import { Program } from "../program.ts"
import { SettingsContext, useSettings } from "../Settings/useSettings.ts"
import { serialise, deserialise } from "../serialise.ts"
import { Menu } from "./Menu.tsx"

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

function Main() {
  const { program, setProgram, unsetProgram } = useProgram()
  const [screen, goToScreen] = useState<Screens>(Screens.Timer)
  const settings = useSettings()

  const MenuScreen = (s: ScreenProps) => (
    <Menu
      {...s}
      program={program}
      unsetProgram={unsetProgram}
      setProgram={setProgram}
    />
  )
  const Screen = {
    [Screens.Menu]: MenuScreen,
    [Screens.Timer]: program
      ? (s: ScreenProps) => <Timer {...s} program={program!} />
      : MenuScreen,
    [Screens.Editor]: (s: ScreenProps) => (
      <Editor program={program} setProgram={setProgram} {...s} />
    ),
    [Screens.Settings]: (s: ScreenProps) => <Settings {...s} />,
    [Screens.Share]: (s: ScreenProps) => <Share {...s} program={program!} />,
  }[screen]

  return (
    <div className={css.main}>
      <SettingsContext.Provider value={settings}>
        <Screen goToScreen={goToScreen} />
      </SettingsContext.Provider>
    </div>
  )
}

export type UseProgram = {
  program: Program | undefined
  setProgram: (p: Program) => void
  unsetProgram: () => void
}

export function useProgram(): UseProgram {
  const [program, setProgram] = useState<Program>()
  const unsetProgram = () => setProgram(undefined)

  useEffect(() => {
    const programText = window.location.hash.substring(1)
    if (programText) {
      setProgram(deserialise(programText))
    }
  }, [])

  useEffect(() => {
    if (program) {
      window.location.hash = serialise(program)
      document.title = `${program.title} – Geek Timer`
    } else {
      window.location.hash = ""
      document.title = "Geek Timer"
    }
  }, [program])

  return { program, setProgram, unsetProgram }
}
