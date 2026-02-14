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
    const p = programText ? deserialise(programText) : undefined
    setPage(p)
    return p
  })

  return {
    program,
    loadProgram: (p: Program) => {
      setPage(p)
      setProgram(p)
    },
    clearProgram: () => {
      setPage(undefined)
      setProgram(undefined)
    },
  }
}

function setPage(p: Program | undefined) {
  if (p) {
    window.location.hash = serialise(p)
    document.title = `${p.title} – Geek Timer`
  } else {
    window.location.hash = ""
    document.title = "Geek Timer"
  }
}
