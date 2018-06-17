export function isValidName (name) {
  return !name.match(/[/@\s+%:]/) && encodeURIComponent(name) === name
}
