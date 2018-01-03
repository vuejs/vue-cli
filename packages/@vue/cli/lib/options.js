const fs = require('fs')
const os = require('os')
const path = require('path')
const { error, hasYarn } = require('@vue/cli-shared-utils')

const rcPath = exports.rcPath = (
  process.env.VUE_CLI_CONFIG_PATH ||
  path.join(os.homedir(), '.vuerc')
)

exports.defaults = {
  useTaobaoRegistry: null,
  packageManager: hasYarn ? 'yarn' : 'npm',
  plugins: {
    '@vue/cli-plugin-babel': {},
    '@vue/cli-plugin-eslint': { config: 'base' },
    '@vue/cli-plugin-unit-mocha-webpack': { assertionLibrary: 'chai' }
  }
}

exports.loadSavedOptions = () => {
  if (fs.existsSync(rcPath)) {
    try {
      return JSON.parse(fs.readFileSync(rcPath, 'utf-8'))
    } catch (e) {
      error(
        `Error loading saved preferences: ` +
        `~/.vuerc may be corrupted or have syntax errors. ` +
        `You may need to delete it and re-run vue-cli in manual mode.\n` +
        `(${e.message})`,
      )
      process.exit(1)
    }
  } else {
    return {}
  }
}

exports.saveOptions = options => {
  options = Object.assign({}, options)
  for (const key in options) {
    if (!(key in exports.defaults)) {
      delete options[key]
    }
  }
  try {
    fs.writeFileSync(rcPath, JSON.stringify(options, null, 2))
  } catch (e) {
    error(
      `Error saving preferences: ` +
      `make sure you have write access to ${rcPath}.\n` +
      `(${e.message})`
    )
  }
}

exports.savePartialOptions = options => {
  const saved = exports.loadSavedOptions()
  deepMerge(saved, options)
  exports.saveOptions(saved)
}

const isObject = val => val && typeof val === 'object'
function deepMerge (to, from) {
  for (const key in from) {
    if (isObject(to[key]) && isObject(from[key])) {
      deepMerge(to[key], from[key])
    } else {
      to[key] = from[key]
    }
  }
}
