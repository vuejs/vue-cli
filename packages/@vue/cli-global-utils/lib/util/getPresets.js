const {
  defaults,
  loadOptions
} = require('../options')

exports.getPresets = function () {
  const savedOptions = loadOptions()
  return Object.assign({}, savedOptions.presets, defaults.presets)
}
