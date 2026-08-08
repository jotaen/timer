import React, { createContext, useContext, useEffect } from "react"
import en from "./en-GB.tsx"
import de from "./de-DE.tsx"
import es from "./es-ES.tsx"
import { useLocalStorage } from "../util/useLocalStorage.ts"

const locales = [
  { code: "en-GB", dictionary: en },
  { code: "de-DE", dictionary: de },
  { code: "es-ES", dictionary: es },
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

function matchLocale(predicate: (code: Locale) => boolean): Locale | undefined {
  return locales.find((entry) => predicate(entry.code))?.code
}

function findLocale(predicate: (code: Locale) => boolean): Locale {
  return matchLocale(predicate) ?? DEFAULT_LOCALE
}

function detectBrowserLocale(): Locale {
  const lang = navigator.language.toLowerCase()
  const language = lang.split("-")[0]
  return (
    matchLocale((code) => code.toLowerCase() === lang) ??
    matchLocale((code) => code.toLowerCase().startsWith(`${language}-`)) ??
    DEFAULT_LOCALE
  )
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
