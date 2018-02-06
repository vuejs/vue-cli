const fs = require('fs')
const path = require('path')
const extendJSConfig = require('./extendJSConfig')
const stringifyJS = require('javascript-stringify')

function makeJSTransform (filename) {
  return function transformToJS (value, checkExisting, context) {
    const absolutePath = path.resolve(context, filename)
    if (checkExisting && fs.existsSync(absolutePath)) {
      return {
        filename,
        content: extendJSConfig(value, fs.readFileSync(absolutePath, 'utf-8'))
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
  return function transformToJSON (value, checkExisting, context) {
    let existing = {}
    const absolutePath = path.resolve(context, filename)
    if (checkExisting && fs.existsSync(absolutePath)) {
      existing = JSON.parse(fs.readFileSync(absolutePath, 'utf-8'))
    }
    value = Object.assign(existing, value)
    return {
      filename,
      content: JSON.stringify(value, null, 2)
    }
  }
}

function makeMutliExtensionJSONTransform (filename) {
  return function transformToMultiExtensions (value, checkExisting, context) {
    if (!checkExisting) {
      return makeJSONTransform(filename)(value, checkExisting, context)
    }
    const absolutePath = path.resolve(context, filename)
    if (fs.existsSync(absolutePath)) {
      return makeJSONTransform(filename)(value, checkExisting, context)
    } else if (fs.existsSync(`${absolutePath}.json`)) {
      return makeJSONTransform(`${filename}.json`)(value, checkExisting, context)
    } else if (fs.existsSync(`${absolutePath}.js`)) {
      return makeJSTransform(`${filename}.js`)(value, checkExisting, context)
    } else if (fs.existsSync(`${absolutePath}.yaml`)) {
      return transformYAML(value, `${filename}.yaml`, fs.readFileSync(`${absolutePath}.yaml`, 'utf-8'))
    } else if (fs.existsSync(`${absolutePath}.yml`)) {
      return transformYAML(value, `${filename}.yml`, fs.readFileSync(`${absolutePath}.yml`, 'utf-8'))
    } else {
      return makeJSONTransform(filename)(value, false, context)
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
  babel: makeJSONTransform('.babelrc'),
  postcss: makeMutliExtensionJSONTransform('.postcssrc'),
  eslintConfig: makeMutliExtensionJSONTransform('.eslintrc'),
  jest: makeJSTransform('jest.config.js')
}
