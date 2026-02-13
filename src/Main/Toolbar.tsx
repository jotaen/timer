import React, { useContext } from "react"
// @ts-ignore
import css from "./style.module.css"
import { ProgramContext } from "./index.tsx"
import { formatClock } from "../format.ts"

export type ToolbarProps = {
  children: React.ReactElement[]
  strong?: boolean
}

export function Toolbar({ children, strong = false }: ToolbarProps) {
  const { hasProgram, remaining, title } = useContext(ProgramContext)
  return (
    <div>
      <div className={css.menubar}>{children}</div>
      {hasProgram && (
        <div className={`${css.program} ${strong ? css.strong : ""}`}>
          {title}
          <div style={{ flex: 1 }}></div>
          {formatClock(remaining)}
        </div>
      )}
    </div>
  )
}
