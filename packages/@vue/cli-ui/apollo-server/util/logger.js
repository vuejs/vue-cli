const { chalk } = require('@vue/cli-shared-utils')

exports.log = (...args) => {
  if (!process.env.VUE_APP_CLI_UI_DEBUG) return
  const date = new Date()
  const timestamp = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}.${date.getSeconds().toString().padStart(2, '0')}`
  const first = args.shift()
  console.log(`${chalk.blue('UI')} ${chalk.dim(timestamp)}`, chalk.bold(first), ...args)
}

const simpleTypes = [
  'string',
  'number',
  'boolean'
]

exports.dumpObject = (obj) => {
  if (!process.env.VUE_APP_CLI_UI_DEBUG) return
  const result = {}
  Object.keys(obj).forEach(key => {
    const value = obj[key]
    const type = typeof value
    if (simpleTypes.includes(type)) {
      result[key] = value
    } else {
      result[key] = type
    }
  })
  return JSON.stringify(result)
}
