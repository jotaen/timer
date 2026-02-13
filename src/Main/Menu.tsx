import React, { useState, useEffect } from "react"
// @ts-ignore
import css from "./style.module.css"
import { Screens } from "./index.tsx"
import { Program } from "../program.ts"

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

export function Menu({ setProgram, goToScreen }: any) {
  return (
    <div className={css.main}>
      No program selected.
      <br />
      <button onClick={() => goToScreen(Screens.Editor)}>New program</button>
      <button onClick={() => setProgram(sampleProgram)}>
        Use sample program
      </button>
    </div>
  )
}
