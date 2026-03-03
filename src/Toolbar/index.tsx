import React, { useContext } from "react"
// @ts-ignore
import css from "./style.module.css"
import { ProgramContext } from "../Main"
import { formatClock } from "../format.ts"
import { STATUS } from "../useTicker.ts"

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
  const { hasProgram, remaining, title, status } = useContext(ProgramContext)
  return (
    <div className={css.container}>
      <div className={css.logo}>Timer</div>
      <div className={css.menubar}>{children}</div>
      {hasProgram && showProgram && (
        <div className={`${css.program} ${!isSubdued ? css.strong : ""}`}>
          {title}
          {status === STATUS.PAUSED && (
            <span className={css.status}>(Paused)</span>
          )}
          <div style={{ flex: 1 }}></div>
          {formatClock(remaining)}
        </div>
      )}
    </div>
  )
}
