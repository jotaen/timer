import { useState, useEffect } from "react"
import { Program } from "../program.ts"
import { decode, encode } from "../encode.ts"

export type UseProgram = {
  program?: Program
  loadProgram: (p: Program) => void
  clearProgram: () => void
}

export function useProgram(): UseProgram {
  const [program, setProgram] = useState<Program | undefined>(() => {
    const p = loadFromUrl()
    populateTabState(p, false)
    return p
  })

  useEffect(() => {
    const handleHashChange = () => {
      const p = loadFromUrl()
      populateTabState(p, false)
      setProgram(p)
    }
    window.addEventListener("hashchange", handleHashChange)
    return () => {
      window.removeEventListener("hashchange", handleHashChange)
    }
  }, [])

  return {
    program,
    loadProgram: (p: Program) => {
      populateTabState(p)
      setProgram(p)
    },
    clearProgram: () => {
      populateTabState(undefined)
      setProgram(undefined)
    },
  }
}

function populateTabState(p?: Program, newHistoryEntry = true): void {
  const prefix = p ? `${p.title} – ` : ""
  document.title = `${prefix}Geek Timer`
  const hash = p ? `/#${encode(p)}` : "/"
  if (newHistoryEntry) {
    window.history.pushState({}, "", hash)
  } else {
    window.history.replaceState({}, "", hash)
  }
}

function loadFromUrl(): Program | undefined {
  const blob = window.location.hash.substring(1)
  if (!blob) {
    return undefined
  }
  try {
    return decode(blob)
  } catch (e) {
    console.error(e)
    return undefined
  }
}
