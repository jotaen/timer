export function handleControlKeys(
  evt: React.KeyboardEvent<HTMLTextAreaElement>,
): boolean {
  const textarea = evt.target as HTMLTextAreaElement
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const INDENTATION = "  "

  if (evt.key == "Tab") {
    textarea.value =
      textarea.value.substring(0, start) +
      INDENTATION +
      textarea.value.substring(end)
    textarea.selectionStart = textarea.selectionEnd = start + INDENTATION.length
    return true
  }

  if (evt.key == "Enter") {
    const textBeforeCursor = textarea.value.substring(0, start)
    const currentLineStart = textBeforeCursor.lastIndexOf("\n") + 1
    const currentLine = textarea.value.substring(currentLineStart, start)

    const indentMatch = currentLine.match(/^(\s*)/)
    const indent = indentMatch ? indentMatch[1] : ""

    textarea.value =
      textarea.value.substring(0, start) +
      "\n" +
      indent +
      textarea.value.substring(end)
    textarea.selectionStart = textarea.selectionEnd = start + 1 + indent.length
    return true
  }

  if (evt.key === "Backspace") {
    if (start === end && start > 0) {
      const textBeforeCursor = textarea.value.substring(0, start)
      const currentLineStart = textBeforeCursor.lastIndexOf("\n") + 1
      const currentLine = textarea.value.substring(currentLineStart, start)

      if (/^\s+$/.test(currentLine) && currentLine.length >= 2) {
        const removeCount = Math.min(2, currentLine.length)

        textarea.value =
          textarea.value.substring(0, start - removeCount) +
          textarea.value.substring(end)
        textarea.selectionStart = textarea.selectionEnd = start - removeCount
        return true
      }
    }
  }

  return false
}
