const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')
const clone = require('clone')
// Connectors
const cwd = require('./cwd')
const plugins = require('./plugins')
const folders = require('./folders')
const prompts = require('./prompts')
// Utils
const { set } = require('../../util/object')

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

function readData (config, context) {
  const file = findFile(config, context)
  if (file) {
    if (file.type === 'package') {
      const pkg = folders.readPackage(cwd.get(), context)
      return pkg[config.files.package]
    } else {
      const rawContent = fs.readFileSync(file.path, { encoding: 'utf8' })
      if (file.type === 'json') {
        return JSON.parse(rawContent)
      } else if (file.type === 'yaml') {
        return yaml.safeLoad(rawContent)
      } else if (file.type === 'js') {
        // TODO
      }
    }
  }
}

function writeData ({ config, data }, context) {
  const file = findFile(config, context)
  if (file) {
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
        // TODO
      }
    }
    fs.writeFileSync(file.path, rawContent, { encoding: 'utf8' })
  }
}

function getPrompts (id, context) {
  const config = findOne(id, context)
  if (config) {
    if (current.config !== config) {
      const data = readData(config, context)
      current = {
        config,
        data
      }
      const configData = config.onRead({
        data
      })
      prompts.reset()
      configData.prompts.forEach(prompts.add)
      if (configData.answers) {
        prompts.setAnswers(configData.answers)
      }
      prompts.start()
    }
    return prompts.list()
  }
  return []
}

function save (id, context) {
  const config = findOne(id, context)
  if (config) {
    if (current.config === config) {
      const answers = prompts.getAnswers()
      let data = clone(current.data)
      config.onWrite({
        answers,
        data,
        file: {
          ...config.file,
          assignData: newData => {
            Object.assign(data, newData)
          },
          setData: newData => {
            Object.keys(newData).forEach(key => {
              set(data, key, newData[key])
            })
          }
        }
      })
      writeData({ config, data }, context)
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
