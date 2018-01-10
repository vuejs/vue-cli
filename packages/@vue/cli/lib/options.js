const fs = require('fs')
const os = require('os')
const path = require('path')
const {
  error,
  hasYarn,
  createSchema,
  validate
} = require('@vue/cli-shared-utils')

const rcPath = exports.rcPath = (
  process.env.VUE_CLI_CONFIG_PATH ||
  path.join(os.homedir(), '.vuerc')
)

const schema = createSchema(joi => joi.object().keys({
  router: joi.boolean(),
  vuex: joi.boolean(),
  cssPreprocessor: joi.string().only(['sass', 'less', 'stylus']),
  useTaobaoRegistry: joi.boolean(),
  packageManager: joi.string().only(['yarn', 'npm']),
  plugins: joi.object().required()
}))

exports.validate = options => validate(options, schema)

exports.defaults = {
  router: false,
  vuex: false,
  cssPreprocessor: undefined,
  useTaobaoRegistry: undefined,
  packageManager: hasYarn ? 'yarn' : 'npm',
  plugins: {
    '@vue/cli-plugin-babel': {},
    '@vue/cli-plugin-eslint': { config: 'base', lintOn: 'save' },
    '@vue/cli-plugin-unit-mocha-webpack': { assertionLibrary: 'chai' },
    '@vue/cli-plugin-pwa': {}
  }
}

let cachedOptions

exports.loadOptions = () => {
  if (cachedOptions) {
    return cachedOptions
  }
  if (fs.existsSync(rcPath)) {
    try {
      cachedOptions = JSON.parse(fs.readFileSync(rcPath, 'utf-8'))
      return cachedOptions
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

exports.saveOptions = (toSave, replace) => {
  let options
  if (replace) {
    options = toSave
  } else {
    options = Object.assign(exports.loadOptions(), toSave)
  }
  for (const key in options) {
    if (!(key in exports.defaults)) {
      delete options[key]
    }
  }
  cachedOptions = options
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
