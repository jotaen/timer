import React from "react"
// @ts-ignore
import css from "./style.module.css"
import { QRCodeSVG } from "qrcode.react"
import { Program } from "../program.ts"
import { serialise } from "../serialise.ts"
import { Toolbar } from "../Main/Toolbar.tsx"
import { ScreenProps, Screens } from "../Main"

export type ShareProps = ScreenProps & {
  program: Program
}

export function Share({ goToScreen, program }: ShareProps) {
  const hash = serialise(program)
  return (
    <div>
      <Toolbar>
        <button onClick={() => goToScreen(Screens.Main)}>Back</button>
        <div style={{ flex: 1 }}></div>
      </Toolbar>
      <div className={css.container}>
        <QRCodeSVG size={256} value={`https://geektimer.jotaen.net#${hash}`} />
      </div>
    </div>
  )
}
