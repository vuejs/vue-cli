const fs = require('fs')
const path = require('path')
const {
  transformJSON,
  transformJS,
  transformYAML
} = require('./util/configTransforms')

class ConfigTransform {
  constructor (configs) {
    this.configs = Array.isArray(configs) ? configs : [configs]

    this.filenames = this.configs.reduce((acc, config) => {
      const types = new Set(config.types)

      if (types.has('bare')) {
        acc.push(String(config.file))
        types.delete('bare')
      }

      if (types.has('yaml') || types.has('yml')) {
        types.add('yaml')
        types.add('yml')
      }

      return acc.concat(Array.from(types.values()).map(type => `${config.file}.${type}`))
    }, []) || []
  }

  transform (value, checkExisting, context) {
    function transformer (filename, source) {
      if (/\.json$/.test(filename)) {
        return transformJSON(value, filename, source)
      } else if (/\.js$/.test(filename)) {
        return transformJS(value, filename, source)
      } else if (/\.ya?ml$/.test(filename)) {
        return transformYAML(value, filename, source)
      } else {
        return transformJSON(value, filename, source)
      }
    }

    if (checkExisting) {
      const filename = this.existingConfig(context)
      if (filename) {
        const source = path.resolve(context, filename)
        return transformer(filename, source)
      }
    }

    const [{ file, types }] = this.configs
    const [type] = types
    if (type === 'bare' || !type) {
      return transformer(String(file))
    } else {
      return transformer(`${file}.${type}`)
    }
  }

  existingConfig (context) {
    let existingConfigName
    for (const filename of this.filenames) {
      const absolutePath = path.resolve(context, filename)
      if (fs.existsSync(absolutePath)) {
        existingConfigName = filename
        break
      }
    }

    return existingConfigName
  }
}

module.exports = ConfigTransform
