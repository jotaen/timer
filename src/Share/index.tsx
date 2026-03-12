import React from "react"
// @ts-ignore
import css from "./style.module.css"
import { QRCodeSVG } from "qrcode.react"
import { Program } from "../program.ts"
import { encode } from "../encode.ts"
import { Toolbar } from "../Toolbar"
import { ScreenProps, Screens } from "../App"

export type ShareProps = ScreenProps & {
  program: Program
}

export function Share({ goToScreen, program }: ShareProps) {
  const baseUrl =
    window.location.hostname === "localhost"
      ? "https://timer.jotaen.net"
      : window.location.origin
  const shareUrl = `${baseUrl}/#${encode(program)}`
  return (
    <div>
      <Toolbar>
        <button onClick={() => goToScreen(Screens.Timer)}>Back</button>
        <div style={{ flex: 1 }}></div>
      </Toolbar>
      <div className={css.container}>
        <QRCodeSVG size={256} value={shareUrl} />
        <a href={shareUrl} className={css.link}>
          {shareUrl}
        </a>
      </div>
      <p style={{ textAlign: "center" }}>
        Your timer program is encoded in the URL and QR code.
        <br />
        You can share it with others or save it as bookmark.
      </p>
    </div>
  )
}
