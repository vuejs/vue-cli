module.exports = function getSpecificEnv () {
  return Object.keys(process.env).reduce(
    (prev, key) => {
      if (key.startsWith('VUE_CLI_') || key.startsWith('VUE_APP_') || key === 'NODE_ENV' || key === 'BABEL_ENV') {
        return `${prev}|${key}=${process.env[key]}`
      }
      return prev
    },
    ''
  )
}
