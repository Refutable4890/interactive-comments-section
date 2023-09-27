export function placeCursorAtTheEnd(textarea: HTMLTextAreaElement) {
  if (!textarea) return
  let len = textarea.value.length
  textarea.focus()
  textarea.setSelectionRange(len, len)
}
