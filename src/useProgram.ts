import { Program } from "./program.ts"
import { decode, encode } from "./encode.ts"
import { useState } from "react"

export type UseProgram = {
  program?: Program
  loadProgram: (p: Program) => void
  clearProgram: () => void
}

export function useProgram(): UseProgram {
  const programText = window.location.hash.substring(1)
  const [program, setProgram] = useState<Program | undefined>(() => {
    const p = programText ? decode(programText) : undefined
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

function setPage(p?: Program) {
  const prefix = p ? `${p.title} – ` : ""
  document.title = `${prefix}Geek Timer`
  window.location.hash = p ? encode(p) : ""
}
