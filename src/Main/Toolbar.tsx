import React from "react"
// @ts-ignore
import css from "./style.module.css"

export type ToolbarProps = {
  children: React.ReactElement[]
}

export function Toolbar({ children }: ToolbarProps) {
  return <div className={css.toolbar}>{children}</div>
}
