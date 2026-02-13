import React, { useState, useEffect } from "react"
// @ts-ignore
import css from "./style.module.css"
import { ScreenProps, Screens } from "./index.tsx"
import { Program } from "../program.ts"
import { Toolbar } from "./Toolbar.tsx"
import {serialise} from "../serialise.ts";

const samplePrograms: Program[] = [{
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
}]

export type MenuProps = ScreenProps & {
  program: Program | undefined
  setProgram: (p: Program) => void
  unsetProgram: () => void
}

export function Menu({
  program,
  setProgram,
  unsetProgram,
  goToScreen,
}: MenuProps) {
  return (
    <div className={css.main}>
      {program && (
        <Toolbar>
          <button onClick={() => goToScreen(Screens.Timer)}>Back</button>
          <div style={{ flex: 1 }}></div>
        </Toolbar>
      )}
      <div className={css.menu}>
        <p>
          <button
            onClick={() => {
              unsetProgram()
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
          <h2>Demo Programs:</h2>
          {samplePrograms.map((p) => (
            <a href={`#${serialise(p)}`} onClick={() => {
              setProgram(p)
              goToScreen(Screens.Timer)
              return false
            }}>{p.title}</a>
          ))}
        </p>
      </div>
    </div>
  )
}
