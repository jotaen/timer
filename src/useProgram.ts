import { Program } from "./program.ts"
import { deserialise, serialise } from "./serialise.ts"
import { useState } from "react"

export type UseProgram = {
  program: Program | undefined
  loadProgram: (p: Program) => void
  clearProgram: () => void
}

export function useProgram(): UseProgram {
  const programText = window.location.hash.substring(1)
  const [program, setProgram] = useState<Program | undefined>(() => {
    if (programText) {
      return deserialise(programText)
    }
  })

  return {
    program,
    loadProgram: (p: Program) => {
      window.location.hash = serialise(p)
      document.title = `${p.title} – Geek Timer`
      setProgram(p)
    },
    clearProgram: () => {
      window.location.hash = ""
      document.title = "Geek Timer"
      setProgram(undefined)
    },
  }
}
