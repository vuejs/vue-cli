const prefixRE = /^VUE_APP_/

module.exports = function resolveClientEnv (options, raw) {
  const isProd = process.env.NODE_ENV === 'production'
  const env = {}
  Object.keys(process.env).forEach(key => {
    if (prefixRE.test(key) || key === 'NODE_ENV') {
      env[key] = process.env[key]
    }
  })
  env.BASE_URL = isProd ? options.baseUrl : options.devBaseUrl

  if (raw) {
    return env
  }

  for (const key in env) {
    env[key] = JSON.stringify(env[key])
  }
  return {
    'process.env': env
  }
}
