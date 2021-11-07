// @ts-check
const { existsSync } = require('fs')
const { join } = require('path')
const { register } = require('esbuild-register/dist/node')

const POSSIBLE_CONFIG_PATHS = [
  process.env.VUE_CLI_SERVICE_CONFIG_PATH,
  'vue.config.js',
  'vue.config.cjs',
  'vue.config.mjs',
  'vue.config.ts'
].filter(i => !!i)

module.exports = function loadFileConfig (context) {
  let fileConfig

  const formatPath = p => join(context, p)
  const fileConfigPath = POSSIBLE_CONFIG_PATHS.map(formatPath).find(p => existsSync(p))
  const compatESModuleRequire = m => m.__esModule ? m.default : m

  if (fileConfigPath) {
    // Use esbuild to compile conifg files
    register({
      target: 'es2017',
      format: 'cjs'
    })
    const module = require('module')
    // @ts-ignore
    console.log(module.Module._extensions)
    fileConfig = compatESModuleRequire(require(fileConfigPath))
  }

  return {
    fileConfig,
    fileConfigPath
  }
}
