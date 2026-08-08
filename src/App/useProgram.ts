import { useState, useEffect, useCallback } from "react"
import { Program } from "../program.ts"
import { decode, encode } from "../encode.ts"
import { useT } from "../i18n/locale.tsx"

export type UseProgram = {
  program?: Program
  loadProgram: (p: Program) => void
  clearProgram: () => void
}

export function useProgram(): UseProgram {
  const { demoProgram } = useT()
  const [program, setProgram] = useState<Program | undefined>(() => {
    const p = loadFromUrl(demoProgram)
    populateTabState(p, false)
    return p
  })

  useEffect(() => {
    const handleHashChange = () => {
      const p = loadFromUrl(demoProgram)
      populateTabState(p, false)
      setProgram(p)
    }
    window.addEventListener("hashchange", handleHashChange)
    return () => {
      window.removeEventListener("hashchange", handleHashChange)
    }
  }, [demoProgram])

  return {
    program,
    loadProgram: useCallback((p: Program) => {
      populateTabState(p)
      setProgram(p)
    }, []),
    clearProgram: useCallback(() => {
      populateTabState(undefined)
      setProgram(undefined)
    }, []),
  }
}

function populateTabState(p?: Program, newHistoryEntry = true): void {
  const prefix = p ? `${p.title} – ` : ""
  document.title = `${prefix}Timer`
  const hash = p ? `/#${encode(p)}` : "/"
  if (newHistoryEntry) {
    window.history.pushState({}, "", hash)
  } else {
    window.history.replaceState({}, "", hash)
  }
}

function loadFromUrl(demoProgram: Program): Program | undefined {
  const blob = window.location.hash.substring(1)
  if (!blob) {
    return undefined
  }
  if (blob === "demo") {
    return demoProgram
  }
  try {
    return decode(blob)
  } catch (e) {
    console.error(e)
    return undefined
  }
}
