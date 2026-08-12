export function handleControlKeys(
  evt: React.KeyboardEvent<HTMLTextAreaElement>,
): boolean {
  const textarea = evt.target as HTMLTextAreaElement
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const INDENTATION = "  "

  if (evt.key == "Tab") {
    replaceRange(textarea, start, end, INDENTATION)
    return true
  }

  if (evt.key == "Enter") {
    const textBeforeCursor = textarea.value.substring(0, start)
    const currentLineStart = textBeforeCursor.lastIndexOf("\n") + 1
    const currentLine = textarea.value.substring(currentLineStart, start)

    const indentMatch = currentLine.match(/^(\s*)/)
    const indent = indentMatch ? indentMatch[1] : ""

    replaceRange(textarea, start, end, "\n" + indent)
    return true
  }

  if (evt.key === "Backspace") {
    if (start === end && start > 0) {
      const textBeforeCursor = textarea.value.substring(0, start)
      const currentLineStart = textBeforeCursor.lastIndexOf("\n") + 1
      const currentLine = textarea.value.substring(currentLineStart, start)

      if (/^\s+$/.test(currentLine) && currentLine.length >= 2) {
        const removeCount = Math.min(2, currentLine.length)
        replaceRange(textarea, start - removeCount, end, "")
        return true
      }
    }
  }

  return false
}

// Replaces the given range with the new text and puts the cursor right after
// it. `execCommand` is deprecated, but it’s the only mechanism through which
// programmatic edits keep the browser’s undo history intact, so try it first
// and only fall back to rewriting the value wholesale.
function replaceRange(
  textarea: HTMLTextAreaElement,
  from: number,
  to: number,
  newText: string,
): void {
  textarea.setSelectionRange(from, to)
  let done = false
  try {
    done =
      newText === ""
        ? document.execCommand("delete")
        : document.execCommand("insertText", false, newText)
  } catch {
    done = false
  }
  if (!done) {
    textarea.value =
      textarea.value.substring(0, from) + newText + textarea.value.substring(to)
    textarea.selectionStart = textarea.selectionEnd = from + newText.length
  }
}
