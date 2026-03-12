import { createContext, useContext } from "react"
import { Program } from "../program.ts"
import { Ticker } from "../useTicker.ts"

export type ProgramContext = {
  program: Program
  ticker: Ticker
}

export const ProgramContext = createContext<ProgramContext | null>(null)

export function useProgramContext(): ProgramContext | null {
  return useContext(ProgramContext)
}
