import React, { useEffect, useState } from "react"
import css from "./style.module.css"
import { ScreenProps, Screens } from "../App"
import { Toolbar } from "../Toolbar"
import { Program } from "../program.ts"
import { serialise } from "../serialise.ts"
import { parse, ParseError, ProgramError } from "../parse.ts"
import { handleControlKeys } from "./handleControlKeys.ts"
import { useServiceContext } from "../App/useServiceContext.ts"
import { useT, useLocale } from "../i18n/locale.tsx"

export type EditorProps = ScreenProps & {
  program?: Program
  loadProgram: (p: Program) => void
  isReadonly: boolean
}

const UNSAVED_CHANGES_GUARD = "editor:unsaved-changes"

export function Editor({
  goToScreen,
  program,
  loadProgram,
  isReadonly,
}: EditorProps) {
  const t = useT()
  const [locale] = useLocale()
  const [initialText, setInitialText] = useState<string>("")
  const [text, setText] = useState<string>("")
  const [initialTitle, setInitialTitle] = useState<string>("")
  const [title, setTitle] = useState<string>("")
  const [parseError, setParseError] = useState<ProgramError | null>(null)
  const [showCreatedAtInfo, setShowCreatedAtInfo] = useState<boolean>(false)
  const { viewPreferences, navigationGuard } = useServiceContext()
  const { showSyntaxRules, setShowSyntaxRules } = viewPreferences
  const isDirty = text !== initialText || title !== initialTitle
  const isEmpty = text.trim() === "" // Empty title is fine.

  useEffect(() => {
    navigationGuard.enable(
      UNSAVED_CHANGES_GUARD,
      t.unsavedChangesConfirm,
      isDirty,
    )
  }, [isDirty, t])

  useEffect(() => {
    // The program can change underneath the editor through browser history
    // navigation. In case there were unsaved edits, the `hashchange` handler
    // has already asked for confirmation, so it’s safe to re-sync here.
    const p = program ? serialise(program) : { title: "", program: "" }
    setInitialText(p.program)
    setText(p.program)
    setInitialTitle(p.title)
    setTitle(p.title)
    setParseError(null)
    setShowCreatedAtInfo(false)
  }, [program])

  const save = () => {
    try {
      const p = parse(title, text, new Date())
      loadProgram(p)
      goToScreen(Screens.Timer)
      navigationGuard.disable(UNSAVED_CHANGES_GUARD)
    } catch (e) {
      setParseError(e as ProgramError)
      return
    }
  }

  const handleTextChange = (newText: string) => {
    setText(newText)
    setParseError(null)
  }

  return (
    <div className={css.main}>
      <Toolbar showProgram={isReadonly}>
        <button
          onClick={() => {
            if (!navigationGuard.checkAndConfirm(UNSAVED_CHANGES_GUARD)) {
              return
            }
            goToScreen(program ? Screens.Timer : Screens.Menu)
          }}
        >
          {t.back}
        </button>
        <div style={{ flex: 1 }}></div>
        <button onClick={save} disabled={isReadonly || isEmpty || !isDirty}>
          {t.save}
        </button>
      </Toolbar>

      {!isReadonly && (
        <div className={css.titleRow}>
          <input
            type="text"
            value={title}
            className={css.title}
            onChange={(evt) => setTitle(evt.target.value)}
            placeholder={t.titlePlaceholder}
            maxLength={30}
          />
          {program && (
            <button
              type="button"
              className={css.infoButton}
              aria-label={t.programInfoButtonLabel}
              title={t.programInfoButtonLabel}
              onClick={() => setShowCreatedAtInfo((show) => !show)}
            >
              (i)
            </button>
          )}
        </div>
      )}
      {showCreatedAtInfo && program && (
        <div className={css.createdAtInfo}>
          {t.programCreatedAt(
            new Intl.DateTimeFormat(locale, {
              dateStyle: "long",
              timeStyle: "short",
            }).format(program.createdAt),
          )}
          .
        </div>
      )}
      {parseError && (
        <div className={css.error}>
          <div className={css.errorMessage}>
            {t.errorPrefix}
            {t.parseErrors[parseError.code]?.message ?? parseError.message}
          </div>
          {parseError instanceof ParseError && (
            <div className={css.errorDetails}>
              <strong>{t.lineNumber(parseError.line.number)} </strong>
              {parseError.line.text.trimStart()}
              {t.parseErrors[parseError.code]?.hint && (
                <em>
                  <br />
                  {t.parseErrors[parseError.code].hint}
                </em>
              )}
            </div>
          )}
        </div>
      )}
      <textarea
        className={`${css.editor} ${isReadonly ? css.noBottomBorderRadius : ""} ${parseError ? css.noTopBorderRadius : ""}`}
        onChange={(evt) => handleTextChange(evt.target.value)}
        onKeyDown={(evt) => {
          const hasIntercepted = handleControlKeys(evt)
          if (hasIntercepted) {
            evt.preventDefault()
            handleTextChange((evt.target as HTMLTextAreaElement).value)
          }
        }}
        value={text}
        disabled={isReadonly}
        placeholder={t.programPlaceholder}
      ></textarea>
      {isReadonly && <div className={css.readonlyHint}>{t.readonlyHint}</div>}
      <div className={css.syntaxRules}>
        <strong onClick={() => setShowSyntaxRules(!showSyntaxRules)}>
          {showSyntaxRules ? "⏷" : "⏵"} {t.syntaxRulesTitle}
        </strong>
        {showSyntaxRules && (
          <div style={{ marginTop: "1em" }}>
            <t.SyntaxRules />
          </div>
        )}
      </div>
    </div>
  )
}
