const prefixRE = /^VUE_APP_/

module.exports = function resolveClientEnv () {
  const env = {}
  Object.keys(process.env).forEach(key => {
    if (prefixRE.test(key) || key === 'NODE_ENV') {
      env[key] = JSON.stringify(process.env[key])
    }
  })
  return {
    'process.env': env
  }
}
