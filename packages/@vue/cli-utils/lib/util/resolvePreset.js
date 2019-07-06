const path = require('path')
const chalk = require('chalk')
const {
  defaults,
  loadOptions
} = require('../options')
const loadLocalPreset = require('./loadLocalPreset')
const loadRemotePreset = require('./loadRemotePreset')
const {
  log,
  error,
  logWithSpinner,
  stopSpinner,
  exit
} = require('@vue/cli-shared-utils')

exports.resolvePreset = async function (name, clone) {
  let preset
  const savedPresets = loadOptions().presets || {}

  if (name in savedPresets) {
    preset = savedPresets[name]
  } else if (name.endsWith('.json') || /^\./.test(name) || path.isAbsolute(name)) {
    preset = await loadLocalPreset(path.resolve(name))
  } else if (name.includes('/')) {
    logWithSpinner(`Fetching remote preset ${chalk.cyan(name)}...`)
    try {
      preset = await loadRemotePreset(name, clone)
      stopSpinner()
    } catch (e) {
      stopSpinner()
      error(`Failed fetching remote preset ${chalk.cyan(name)}:`)
      throw e
    }
  }

  // use default preset if user has not overwritten it
  if (name === 'default' && !preset) {
    preset = defaults.presets.default
  }
  if (!preset) {
    error(`preset "${name}" not found.`)
    const presets = Object.keys(savedPresets)
    if (presets.length) {
      log()
      log(`available presets:\n${presets.join(`\n`)}`)
    } else {
      log(`you don't seem to have any saved preset.`)
      log(`run vue-cli in manual mode to create a preset.`)
    }
    exit(1)
  }
  return preset
}
