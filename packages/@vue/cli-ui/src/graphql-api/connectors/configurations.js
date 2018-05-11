const fs = require('fs-extra')
const path = require('path')
const yaml = require('js-yaml')
const clone = require('clone')
const stringifyJS = require('javascript-stringify')
// Connectors
const cwd = require('./cwd')
const plugins = require('./plugins')
const folders = require('./folders')
const prompts = require('./prompts')
// Utils
const { get, set, remove } = require('../../util/object')
const { log } = require('../utils/logger')
const { loadModule } = require('@vue/cli/lib/util/module')
const extendJSConfig = require('@vue/cli/lib/util/extendJSConfig')

const fileTypes = ['js', 'json', 'yaml']
let current = {}

function list (context) {
  return plugins.getApi().configurations
}

function findOne (id, context) {
  return list(context).find(
    c => c.id === id
  )
}

function findFile (config, context) {
  if (!config.files) {
    return null
  }

  if (config.files.package) {
    const pkg = folders.readPackage(cwd.get(), context)
    const data = pkg[config.files.package]
    if (data) {
      return { type: 'package', path: path.join(cwd.get(), 'package.json') }
    }
  }

  for (const type of fileTypes) {
    const files = config.files[type]
    if (files) {
      for (const file of files) {
        const resolvedFile = path.resolve(cwd.get(), file)
        if (fs.existsSync(resolvedFile)) {
          return { type, path: resolvedFile }
        }
      }
    }
  }
}

function getDefaultFile (config, context) {
  if (!config.files) {
    return null
  }

  const keys = Object.keys(config.files)
  if (keys.length) {
    for (const key of keys) {
      if (key !== 'package') {
        const file = config.files[key][0]
        return {
          type: key,
          path: path.resolve(cwd.get(), file)
        }
      }
    }
  }
}

function readData (config, context) {
  const file = findFile(config, context)
  config.file = file
  if (file) {
    if (file.type === 'package') {
      const pkg = folders.readPackage(cwd.get(), context)
      return pkg[config.files.package]
    } else if (file.type === 'js') {
      return loadModule(file.path, cwd.get(), true)
    } else {
      const rawContent = fs.readFileSync(file.path, { encoding: 'utf8' })
      if (file.type === 'json') {
        return JSON.parse(rawContent)
      } else if (file.type === 'yaml') {
        return yaml.safeLoad(rawContent)
      }
    }
  }
  return {}
}

function writeData ({ config, data, changedFields }, context) {
  let file = findFile(config, context)

  if (!file) {
    file = getDefaultFile(config, context)
  }

  if (file) {
    log('Config write', config.id, data, changedFields, file.path)
    fs.ensureFileSync(file.path)
    let rawContent
    if (file.type === 'package') {
      const pkg = folders.readPackage(cwd.get(), context)
      pkg[config.files.package] = data
      rawContent = JSON.stringify(pkg, null, 2)
    } else {
      if (file.type === 'json') {
        rawContent = JSON.stringify(data, null, 2)
      } else if (file.type === 'yaml') {
        rawContent = yaml.safeDump(data)
      } else if (file.type === 'js') {
        let source = fs.readFileSync(file.path, { encoding: 'utf8' })
        if (!source.trim()) {
          rawContent = `module.exports = ${stringifyJS(data, null, 2)}`
        } else {
          const changedData = changedFields.reduce((obj, field) => {
            obj[field] = data[field]
            return obj
          }, {})
          rawContent = extendJSConfig(changedData, source)
        }
      }
    }
    fs.writeFileSync(file.path, rawContent, { encoding: 'utf8' })
  }
}

async function getPrompts (id, context) {
  const config = findOne(id, context)
  if (config) {
    const data = readData(config, context)
    log('Config read', config.id, data)
    current = {
      config,
      data
    }
    const configData = await config.onRead({
      cwd: cwd.get(),
      data
    })
    await prompts.reset()
    configData.prompts.forEach(prompts.add)
    if (configData.answers) {
      await prompts.setAnswers(configData.answers)
    }
    await prompts.start()
    return prompts.list()
  }
  return []
}

async function save (id, context) {
  const config = findOne(id, context)
  if (config) {
    if (current.config === config) {
      const answers = prompts.getAnswers()
      let data = clone(current.data)
      const changedFields = []
      await config.onWrite({
        prompts: prompts.list(),
        answers,
        data: current.data,
        file: config.file,
        cwd: cwd.get(),
        api: {
          assignData: newData => {
            changedFields.push(...Object.keys(newData))
            Object.assign(data, newData)
          },
          setData: newData => {
            Object.keys(newData).forEach(key => {
              let field = key
              const dotIndex = key.indexOf('.')
              if (dotIndex !== -1) {
                field = key.substr(0, dotIndex)
              }
              changedFields.push(field)

              const value = newData[key]
              if (typeof value === 'undefined') {
                remove(data, key)
              } else {
                set(data, key, value)
              }
            })
          },
          getAnswer: async (id, mapper) => {
            const prompt = prompts.findOne(id)
            if (prompt) {
              const defaultValue = await prompts.getDefaultValue(prompt)
              if (defaultValue !== prompt.rawValue) {
                let value = get(answers, prompt.id)
                if (mapper) {
                  value = mapper(value)
                }
                return value
              }
            }
          }
        }
      })
      writeData({ config, data, changedFields }, context)
      current = {}
    }
  }
  return config
}

function cancel (id, context) {
  const config = findOne(id, context)
  if (config) {
    current = {}
  }
  return config
}

module.exports = {
  list,
  findOne,
  getPrompts,
  save,
  cancel
}
