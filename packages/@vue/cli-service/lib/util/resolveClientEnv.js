const prefixRE = /^VUE_APP_/

module.exports = function resolveClientEnv () {
  // this should have been set by api.setEnv()
  const NODE_ENV = process.env.NODE_ENV || 'development'

  // TODO load .env files

  const env = { NODE_ENV }
  Object.keys(process.env).forEach(key => {
    if (prefixRE.test(key)) {
      env[key] = JSON.stringify(process.env[key])
    }
  })
  return {
    'process.env': env
  }
}
