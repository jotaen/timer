import React from "react"
import css from "./style.module.css"
import { formatClock } from "../format.ts"
import { STATUS } from "../useTicker.ts"
import { useProgramContext } from "../App/useProgramContext.ts"

export type ToolbarProps = {
  children: React.ReactNode
  isSubdued?: boolean
  showProgram?: boolean
}

export function Toolbar({
  children,
  isSubdued = true,
  showProgram = true,
}: ToolbarProps) {
  const ctx = useProgramContext()
  if (!children) {
    children = <div className={css.title}>Programmable Timer</div>
  }
  return (
    <div className={css.container}>
      <div className={css.menubar}>{children}</div>
      {ctx && showProgram && (
        <div className={`${css.program} ${!isSubdued ? css.strong : ""}`}>
          <span className={css.programTitle}>{ctx.program.title}</span>
          {ctx.ticker.status === STATUS.PAUSED && (
            <span className={css.status}>
              {ctx.program.title && "\u00A0"}(Paused){"\u00A0"}
            </span>
          )}
          <div style={{ flex: 1 }}></div>
          {formatClock(ctx.ticker.remaining)}
        </div>
      )}
    </div>
  )
}
