const extendJSConfig = require('./extendJSConfig')
const stringifyJS = require('./stringifyJS')
const { loadModule } = require('@vue/cli-shared-utils')
const merge = require('deepmerge')

const mergeArrayWithDedupe = (a, b) => Array.from(new Set([...a, ...b]))
const mergeOptions = {
  arrayMerge: mergeArrayWithDedupe
}

const isObject = val => val && typeof val === 'object'

const transformJS = {
  read: ({ filename, context }) => {
    try {
      return loadModule(`./${filename}`, context, true)
    } catch (e) {
      return null
    }
  },
  write: ({ value, existing, source, filename }) => {
    if (existing) {
      // We merge only the modified keys
      const changedData = {}
      Object.keys(value).forEach(key => {
        const originalValue = existing[key]
        const newValue = value[key]
        if (Array.isArray(originalValue) && Array.isArray(newValue)) {
          changedData[key] = mergeArrayWithDedupe(originalValue, newValue)
        } else if (isObject(originalValue) && isObject(newValue)) {
          changedData[key] = merge(originalValue, newValue, mergeOptions)
        } else {
          changedData[key] = newValue
        }
      })
      return extendJSConfig(changedData, source)
    } else if (filename === 'vue.config.js') {
      return (
        `const { defineConfig } = require('@vue/cli-service')\n` +
        `module.exports = defineConfig(${stringifyJS(value, null, 2)})`
      )
    } else {
      return `module.exports = ${stringifyJS(value, null, 2)}`
    }
  }
}

const transformJSON = {
  read: ({ source }) => JSON.parse(source),
  write: ({ value, existing }) => {
    return JSON.stringify(merge(existing, value, mergeOptions), null, 2)
  }
}

const transformYAML = {
  read: ({ source }) => require('js-yaml').load(source),
  write: ({ value, existing }) => {
    return require('js-yaml').dump(merge(existing, value, mergeOptions), {
      skipInvalid: true
    })
  }
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
