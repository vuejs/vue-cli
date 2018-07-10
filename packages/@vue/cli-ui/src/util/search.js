export function generateSearchRegex (text) {
  return text && new RegExp(text.trim().replace(/\s+/g, '.{0,5}'), 'i')
}
