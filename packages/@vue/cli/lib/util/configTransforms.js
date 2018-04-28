const fs = require('fs')
const extendJSConfig = require('./extendJSConfig')
const stringifyJS = require('javascript-stringify')

function transformJSON (value, filename, source) {
  let existing = {}
  if (source) {
    existing = JSON.parse(fs.readFileSync(source, 'utf-8'))
  }
  value = Object.assign(existing, value)
  return {
    filename,
    content: JSON.stringify(value, null, 2)
  }
}

function transformJS (value, filename, source) {
  if (source) {
    return {
      filename,
      content: extendJSConfig(value, fs.readFileSync(source, 'utf-8'))
    }
  } else {
    return {
      filename,
      content: `module.exports = ${stringifyJS(value, null, 2)}`
    }
  }
}

function transformYAML (value, filename, source) {
  const yaml = require('js-yaml')
  let existing = {}
  if (source) {
    existing = yaml.safeLoad(fs.readFileSync(source, 'utf-8'))
  }
  return {
    filename,
    content: yaml.safeDump(Object.assign(existing, value))
  }
}

exports.transformJSON = transformJSON
exports.transformJS = transformJS
exports.transformYAML = transformYAML
