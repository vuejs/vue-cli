const fs = require('fs')
const homedir = require('os').homedir()
const opn = require('opn')
const { error } = require('@vue/cli-shared-utils')

async function config (value, options) {
  const path = homedir + '/' + '.vuerc'
  const config = JSON.parse(fs.readFileSync(path, 'utf-8'))

  if (!options.delete && !options.get && !options.edit && !options.set) {
    console.log('Resolved path: ' + path + '\n', JSON.stringify(config, null, 4))
  }

  if (options.get) {
    console.log(config[options.get])
  }

  if (options.delete) {
    delete config[options.delete]
    await fs.writeFile(path, JSON.stringify(config, null, 4), 'utf-8', (err) => {
      if (err) error(err)
      console.log(`You have removed the preset: ${options.delete}`)
    })
  }

  if (options.edit) {
    opn(path, { app: process.env.EDITOR })
    process.exit()
  }

  if (options.set && !value) {
    error(`Make sure you define a value for the preset ${options.set}`)
  }

  if (options.set && value) {
    config[options.set] = value

    if (value.match('[0-9]')) {
      config[options.set] = parseInt(value)
    }

    if (value === 'true') {
      config[options.set] = true
    }

    if (value === 'false') {
      config[options.set] = false
    }

    await fs.writeFile(path, JSON.stringify(config, null, 4), 'utf-8', (err) => {
      if (err) error(err)
      console.log(`You have updated the preset: ${options.set} to ${value}`)
    })
  }
}

module.exports = (...args) => {
  return config(...args).catch(err => {
    error(err)
  })
}
