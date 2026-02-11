import React, { useState } from "react"
// @ts-ignore
import css from "./style.module.css"
import { createRoot } from "react-dom/client"
import { Timer } from "../Timer"
import { Editor } from "../Editor"
import { Settings } from "../Settings"
import { Program } from "../program.ts"
import { SettingsContext, useSettings } from "../Settings/useSettings.ts"
import { serialise, deserialise } from "../serialise.ts"

const sampleProgram: Program = {
  title: "Sports!",
  items: [
    { kind: "ACTIVITY", title: "Get ready!", duration: 5, skipLast: false },
    {
      kind: "LOOP",
      repeat: 2,
      items: [
        { kind: "ACTIVITY", title: "Work out", duration: 10, skipLast: false },
        { kind: "ACTIVITY", title: "Rest", duration: 5, skipLast: true },
      ],
    },
  ],
}

const s = serialise(sampleProgram)
console.log(s)
console.log(deserialise(s))

const container = document.getElementById("app")
const root = createRoot(container!)
root.render(<Main />)

export enum Screens {
  "Timer",
  "Editor",
  "Settings",
}

export type ScreenProps = {
  goToScreen: (s: Screens) => void
}

function Main() {
  const [screen, goToScreen] = useState<Screens>(Screens.Timer)
  const settings = useSettings()

  const Screen = {
    [Screens.Timer]: (s: ScreenProps) => (
      <Timer {...s} program={sampleProgram} />
    ),
    [Screens.Editor]: (s: ScreenProps) => (
      <Editor program={sampleProgram} {...s} />
    ),
    [Screens.Settings]: (s: ScreenProps) => <Settings {...s} />,
  }[screen]

  return (
    <div className={css.main}>
      <SettingsContext.Provider value={settings}>
        <Screen goToScreen={goToScreen} />
      </SettingsContext.Provider>
    </div>
  )
}
