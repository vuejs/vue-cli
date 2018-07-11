/**
 * Display a folder path
 * @param {string} value path
 * @param {number} maxLength maximum length of displayed path
 */
export function folder (value, maxLength = -1) {
  value = value.replace(/\\/g, '/')

  if (value.charAt(value.length - 1) !== '/') {
    value += '/'
  }

  if (maxLength !== -1 && value.length > maxLength) {
    const exceeded = value.length - maxLength + 3
    const firstEnd = Math.floor(maxLength / 2 - exceeded / 2)
    const lastStart = Math.ceil(maxLength / 2 + exceeded / 2)
    value = value.substring(0, firstEnd) + '...' + value.substring(lastStart)
  }

  return value
}

export function date (value) {
  return new Date(value).toLocaleString()
}
