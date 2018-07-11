const extendJSConfig = require('./extendJSConfig')
const stringifyJS = require('./stringifyJS')
const { loadModule } = require('./module')
const merge = require('deepmerge')

const isObject = val => val && typeof val === 'object'

const transformJS = {
  read: ({ filename, context }) => {
    try {
      return loadModule(filename, context, true)
    } catch (e) {
      return null
    }
  },
  write: ({ value, existing, source }) => {
    if (existing) {
      // We merge only the modified keys
      const changedData = {}
      Object.keys(value).forEach(key => {
        const originalValue = existing[key]
        const newValue = value[key]
        if (Array.isArray(newValue)) {
          changedData[key] = newValue
        } else if (isObject(originalValue) && isObject(newValue)) {
          changedData[key] = merge(originalValue, newValue)
        } else {
          changedData[key] = newValue
        }
      })
      return extendJSConfig(changedData, source)
    } else {
      return `module.exports = ${stringifyJS(value, null, 2)}`
    }
  }
}

const transformJSON = {
  read: ({ source }) => JSON.parse(source),
  write: ({ value, existing }) => JSON.stringify(merge(existing, value), null, 2)
}

const transformYAML = {
  read: ({ source }) => require('js-yaml').safeLoad(source),
  write: ({ value, existing }) => require('js-yaml').safeDump(merge(existing, value))
}

const transformLines = {
  read: ({ source }) => source.split('\n'),
  write: ({ value, existing }) => {
    if (existing) {
      value = existing.concat(value)
      // Dedupe
      value = value.filter((item, index) => value.indexOf(item) === index)
    }
    return value.join('\n')
  }
}

module.exports = {
  js: transformJS,
  json: transformJSON,
  yaml: transformYAML,
  lines: transformLines
}
