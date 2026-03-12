import React, { useEffect, useState } from "react"
// @ts-ignore
import css from "./style.module.css"
import { ScreenProps, Screens } from "../App"
import { Toolbar } from "../Toolbar"
import { Program } from "../program.ts"
import { serialise } from "../serialise.ts"
import { parse, ParseError } from "../parse.ts"
import { handleControlKeys } from "./handleControlKeys.ts"
import { useServiceContext } from "../App/useServiceContext.ts"

export type EditorProps = ScreenProps & {
  program?: Program
  loadProgram: (p: Program) => void
  isReadonly: boolean
}

export function Editor({
  goToScreen,
  program,
  loadProgram,
  isReadonly,
}: EditorProps) {
  const [initialText, setInitialText] = useState<string>("")
  const [text, setText] = useState<string>("")
  const [title, setTitle] = useState<string>("")
  const [parseError, setParseError] = useState<ParseError | Error | null>(null)
  const { showSyntaxRules, setShowSyntaxRules } =
    useServiceContext().viewPreferences
  const { navigationGuard } = useServiceContext()

  useEffect(() => {
    if (program) {
      const p = serialise(program)
      setInitialText(p.program)
      setTitle(p.title)
      setText(p.program)
    }
  }, [program])

  const save = () => {
    try {
      const program = parse(title, text)
      loadProgram(program)
      goToScreen(Screens.Timer)
      navigationGuard.disable()
    } catch (e) {
      setParseError(e as Error)
      return
    }
  }

  const handleTextChange = (text: string) => {
    navigationGuard.enable(text !== initialText)
    setText(text)
    setParseError(null)
  }

  const isEmpty = text.trim() === "" // Empty title is fine.

  return (
    <div className={css.main}>
      <Toolbar showProgram={isReadonly}>
        <button
          onClick={() => {
            if (!navigationGuard.checkAndConfirm()) {
              return
            }
            goToScreen(program ? Screens.Timer : Screens.Menu)
          }}
        >
          Back
        </button>
        <div style={{ flex: 1 }}></div>
        <button onClick={save} disabled={isReadonly || isEmpty}>
          Save
        </button>
      </Toolbar>

      {!isReadonly && (
        <input
          type="text"
          value={title}
          className={css.title}
          onChange={(evt) => setTitle(evt.target.value)}
          placeholder="Title"
          maxLength={30}
        />
      )}
      {parseError && (
        <div className={css.error}>
          <div className={css.errorMessage}>Error: {parseError.message}</div>
          {parseError instanceof ParseError && (
            <div className={css.errorDetails}>
              <strong>Line {parseError.line.number}: </strong>
              {parseError.line.text.trimStart()}
              {parseError.hint && (
                <em>
                  <br />
                  {parseError.hint}
                </em>
              )}
            </div>
          )}
        </div>
      )}
      <textarea
        className={css.editor}
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
        placeholder="Program"
      ></textarea>
      {isReadonly && (
        <div className={css.readonlyHint}>
          You cannot edit while timer is running or paused.
        </div>
      )}
      <div className={css.syntaxRules}>
        <strong onClick={() => setShowSyntaxRules(!showSyntaxRules)}>
          {showSyntaxRules ? "⏷" : "⏵"} Syntax Rules
        </strong>
        {showSyntaxRules && (
          <div style={{ marginTop: "1em" }}>
            A timer program is processed line by line, where each line denotes
            either an activity or a loop.
            <h4>Activity</h4>
            An activity is expressed by a time value, optionally followed by a
            title (separated by one space character). The time value must be
            formatted <code>M:SS</code> or <code>MM:SS</code> (minutes,
            seconds). Examples: <code>0:45</code>, <code>1:00 Work Out!</code>.
            <br />
            If the time value is followed by an asterisk (e.g.,{" "}
            <code>0:45*</code>), the activity is skipped on the last loop
            iteration.
            <h4>Loop</h4>A loop is expressed as repetition count, e.g.{" "}
            <code>2x</code>, denoting that the following block of indented lines
            shall be repeated that many times. Indentation is 2&nbsp;space
            characters. Loops can be nested.
          </div>
        )}
      </div>
    </div>
  )
}
