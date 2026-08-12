import React, { useEffect } from "react"
import css from "./style.module.css"
import { QRCodeSVG } from "qrcode.react"
import { Program } from "../program.ts"
import { encode } from "../encode.ts"
import { Toolbar } from "../Toolbar"
import { ScreenProps, Screens } from "../App"
import { IconClipboard } from "../util/Icons.tsx"
import { useT } from "../i18n/locale.tsx"

export type ShareProps = ScreenProps & {
  program: Program
}

// qrcode.react throws during render when the value exceeds the QR code’s
// data capacity, which can happen for very large programs. Catch that and
// show a hint instead of crashing the whole app.
class QRCode extends React.Component<
  { value: string; fallback: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (this.state.failed) {
      return this.props.fallback
    }
    return <QRCodeSVG size={256} value={this.props.value} />
  }
}

export function Share({ goToScreen, program }: ShareProps) {
  const t = useT()
  const baseUrl =
    window.location.hostname === "localhost"
      ? "https://timer.jotaen.net"
      : window.location.origin
  const shareUrl = `${baseUrl}/#${encode(program)}`
  const [clipboardLabel, setClipboardLabel] = React.useState(t.copyUrl)
  useEffect(() => {
    setClipboardLabel(t.copyUrl)
  }, [t])
  useEffect(() => {
    if (clipboardLabel !== t.copyUrl) {
      const timeout = setTimeout(() => {
        setClipboardLabel(t.copyUrl)
      }, 1500)
      return () => clearTimeout(timeout)
    }
  }, [clipboardLabel])
  return (
    <div>
      <Toolbar>
        <button onClick={() => goToScreen(Screens.Timer)}>{t.back}</button>
        <div style={{ flex: 1 }}></div>
      </Toolbar>
      <div className={css.container}>
        <QRCode
          key={shareUrl}
          value={shareUrl}
          fallback={<div className={css.qrFallback}>{t.qrCodeTooLarge}</div>}
        />
        <p>
          <button
            className={css.clipboardButton}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(shareUrl)
                setClipboardLabel(t.urlCopied)
              } catch {
                setClipboardLabel(t.copyFailed)
              }
            }}
          >
            <IconClipboard />
            {clipboardLabel}
          </button>
        </p>
        <p>
          <a href={shareUrl} className={css.link}>
            {shareUrl}
          </a>
        </p>
        <p className={css.hint}>
          {t.shareHint.map((line, i) => (
            <React.Fragment key={i}>
              {i > 0 && <br />}
              {line}
            </React.Fragment>
          ))}
        </p>
      </div>
    </div>
  )
}
