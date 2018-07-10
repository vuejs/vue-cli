export function isValidName (name) {
  return !name.match(/[/@\s+%:]/) && encodeURIComponent(name) === name
}

export function isValidMultiName (name) {
  name = name.replace(/\\/g, '/')
  return name.split('/').every(isValidName)
}
