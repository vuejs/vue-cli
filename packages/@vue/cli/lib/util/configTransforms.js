const extendJSConfig = require('./extendJSConfig')
const stringifyJS = require('./stringifyJS')
const { loadModule } = require('./module')
const merge = require('deepmerge')

const isObject = val => val && typeof val === 'object'

function makeJSTransform (filename) {
  return function transformToJS (value, checkExisting, files, context) {
    if (checkExisting && files[filename]) {
      // Merge data
      let changedData = {}
      try {
        const originalData = loadModule(filename, context, true)
        // We merge only the modified keys
        Object.keys(value).forEach(key => {
          const originalValue = originalData[key]
          const newValue = value[key]
          if (Array.isArray(newValue)) {
            changedData[key] = newValue
          } else if (isObject(originalValue) && isObject(newValue)) {
            changedData[key] = merge(originalValue, newValue)
          } else {
            changedData[key] = newValue
          }
        })
      } catch (e) {
        changedData = value
      }
      // Write
      return {
        filename,
        content: extendJSConfig(changedData, files[filename])
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
    value = merge(existing, value)
    return {
      filename,
      content: JSON.stringify(value, null, 2)
    }
  }
}

function makeMutliExtensionJSONTransform (filename, preferJS) {
  return function transformToMultiExtensions (value, checkExisting, files, context) {
    function defaultTransform () {
      if (preferJS) {
        return makeJSTransform(`${filename}.js`)(value, false, files, context)
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
      return makeJSTransform(`${filename}.js`)(value, checkExisting, files, context)
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
    content: yaml.safeDump(merge(existing, value))
  }
}

function transformBrowserslist (value, filename, source) {
  return {
    filename: `.browserslistrc`,
    content: value.join('\n')
  }
}

module.exports = {
  vue: makeJSTransform('vue.config.js'),
  babel: makeJSTransform('babel.config.js'),
  postcss: makeMutliExtensionJSONTransform('.postcssrc', true),
  eslintConfig: makeMutliExtensionJSONTransform('.eslintrc', true),
  jest: makeJSTransform('jest.config.js'),
  browserslist: transformBrowserslist
}
