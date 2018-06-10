const extendJSConfig = require('./extendJSConfig')
const stringifyJS = require('./stringifyJS')

function makeJSTransform (filename) {
  return function transformToJS (value, checkExisting, files) {
    if (checkExisting && files[filename]) {
      return {
        filename,
        content: extendJSConfig(value, files[filename])
      }
    } else {
      return {
        filename,
        content: `module.exports = ${stringifyJS(value, null, 2)}`
      }
    }
  }
}

function makeJSONTransform (filename) {
  return function transformToJSON (value, checkExisting, files) {
    let existing = {}
    if (checkExisting && files[filename]) {
      existing = JSON.parse(files[filename])
    }
    value = Object.assign(existing, value)
    return {
      filename,
      content: JSON.stringify(value, null, 2)
    }
  }
}

function makeMutliExtensionJSONTransform (filename, preferJS) {
  return function transformToMultiExtensions (value, checkExisting, files) {
    function defaultTransform () {
      if (preferJS) {
        return makeJSTransform(`${filename}.js`)(value, false, files)
      } else {
        return makeJSONTransform(filename)(value, false, files)
      }
    }

    if (!checkExisting) {
      return defaultTransform()
    }

    if (files[filename]) {
      return makeJSONTransform(filename)(value, checkExisting, files)
    } else if (files[`${filename}.json`]) {
      return makeJSONTransform(`${filename}.json`)(value, checkExisting, files)
    } else if (files[`${filename}.js`]) {
      return makeJSTransform(`${filename}.js`)(value, checkExisting, files)
    } else if (files[`${filename}.yaml`]) {
      return transformYAML(value, `${filename}.yaml`, files[`${filename}.yaml`])
    } else if (files[`${filename}.yml`]) {
      return transformYAML(value, `${filename}.yml`, files[`${filename}.yml`])
    } else {
      return defaultTransform()
    }
  }
}

function transformYAML (value, filename, source) {
  const yaml = require('js-yaml')
  const existing = yaml.safeLoad(source)
  return {
    filename,
    content: yaml.safeDump(Object.assign(existing, value))
  }
}

module.exports = {
  vue: makeJSTransform('vue.config.js'),
  babel: makeJSTransform('babel.config.js'),
  postcss: makeMutliExtensionJSONTransform('.postcssrc', true),
  eslintConfig: makeMutliExtensionJSONTransform('.eslintrc', true),
  jest: makeJSTransform('jest.config.js')
}
