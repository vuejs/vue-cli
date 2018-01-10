const prefixRE = /^VUE_APP_/

module.exports = function resolveClientEnv (publicPath) {
  const env = {}
  Object.keys(process.env).forEach(key => {
    if (prefixRE.test(key) || key === 'NODE_ENV') {
      env[key] = JSON.stringify(process.env[key])
    }
  })
  env.BASE_URL = JSON.stringify(publicPath)
  return {
    'process.env': env
  }
}
