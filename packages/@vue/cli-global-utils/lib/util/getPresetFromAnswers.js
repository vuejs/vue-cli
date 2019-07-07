const debug = require('debug')
const {
  saveOptions,
  validatePreset,
  savePreset
} = require('../options')
const { resolvePreset } = require('./resolvePreset')

exports.getPresetFromAnswers = async function (answers, promptCompleteCbs) {
  debug('vue-cli:answers')(answers)

  if (answers.packageManager) {
    saveOptions({
      packageManager: answers.packageManager
    })
  }

  let preset
  if (answers.preset && answers.preset !== '__manual__') {
    preset = await resolvePreset(answers.preset)
  } else {
    // manual
    preset = {
      useConfigFiles: answers.useConfigFiles === 'files',
      plugins: {}
    }
    answers.features = answers.features || []
    // run cb registered by prompt modules to finalize the preset
    promptCompleteCbs.forEach(cb => cb(answers, preset))
  }

  // validate
  validatePreset(preset)

  // save preset
  if (answers.save && answers.saveName) {
    savePreset(answers.saveName, preset)
  }

  debug('vue-cli:preset')(preset)
  return preset
}
