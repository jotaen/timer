import React, { useState } from "react"
// @ts-ignore
import css from "./style.module.css"
import { createRoot } from "react-dom/client"
import { Timer } from "../Timer"
import { Editor } from "../Editor"
import { Settings } from "../Settings"
import { Item } from "../activity"
import { SettingsContext, useSettings } from "../Settings/useSettings.ts"

const testProcedure: Item[] = [
  { kind: "ACTIVITY", title: "Get ready!", duration: 5, skipLast: false },
  {
    kind: "LOOP",
    repeat: 2,
    activities: [
      { kind: "ACTIVITY", title: "Work out", duration: 10, skipLast: false },
      { kind: "ACTIVITY", title: "Rest", duration: 5, skipLast: true },
    ],
  },
]

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
  const [screen, goToScreen] = useState<Screens>(Screens.Editor)
  const settings = useSettings()
  const Screen = {
    [Screens.Timer]: (s: ScreenProps) => (
      <Timer {...s} activities={testProcedure} />
    ),
    [Screens.Editor]: (s: ScreenProps) => <Editor {...s} />,
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
