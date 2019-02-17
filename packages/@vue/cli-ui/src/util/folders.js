export function isValidName (name) {
  return !name.match(/[/@\s+%:]|^[_.]/) && encodeURIComponent(name) === name && name.length <= 214
}

export function isValidMultiName (name) {
  name = name.replace(/\\/g, '/')
  return name.split('/').every(isValidName)
}
