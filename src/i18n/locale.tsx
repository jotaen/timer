import React, { createContext, useContext, useEffect } from "react"
import en from "./en.tsx"
import de from "./de.tsx"
import { useLocalStorage } from "../util/useLocalStorage.ts"

const locales = [
  { code: "en", dictionary: en },
  { code: "de", dictionary: de },
] as const

export type Locale = (typeof locales)[number]["code"]

export const localeOptions = locales.map(({ code, dictionary }) => ({
  code,
  name: dictionary.name,
}))

const DEFAULT_LOCALE: Locale = locales[0].code

function getLocaleEntry(code: Locale): (typeof locales)[number] {
  return locales.find((entry) => entry.code === code)!
}

function findLocale(predicate: (code: Locale) => boolean): Locale {
  return locales.find((entry) => predicate(entry.code))?.code ?? DEFAULT_LOCALE
}

function detectBrowserLocale(): Locale {
  const lang = navigator.language.toLowerCase()
  return findLocale((code) => lang.startsWith(code))
}

type LocaleContextValue = [Locale, (l: Locale) => void]

const LocaleContext = createContext<LocaleContextValue | null>(null)

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [storedLocale, setStoredLocale] = useLocalStorage<Locale>(
    "locale",
    detectBrowserLocale(),
  )
  const locale = findLocale((code) => code === storedLocale)

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  return (
    <LocaleContext value={[locale, setStoredLocale]}>{children}</LocaleContext>
  )
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error("useLocale called outside <LocaleProvider>")
  return ctx
}

export function useT() {
  const [locale] = useLocale()
  return getLocaleEntry(locale).dictionary
}
