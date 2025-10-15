/**
 * @param {string} args
 */
exports.parseArgs = function (args) {
  const parts = args.split(/\s+/)
  const result = []
  let arg
  let index = 0
  for (const part of parts) {
    const l = part.length
    if (!arg && part.charAt(0) === '"') {
      arg = part.slice(1)
    } else if (part.charAt(l - 1) === '"' && (
      l === 1 || part.charAt(l - 2) !== '\\'
    )) {
      arg += args.charAt(index - 1) + part.slice(0, -1)
      result.push(arg)
      arg = null
    } else if (arg) {
      arg += args.charAt(index - 1) + part
    } else {
      result.push(part)
    }
    index += part.length + 1
  }
  return result
}
