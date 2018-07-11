const fs = require('fs')
const homedir = require('os').homedir()
const { get, set, unset } = require('@vue/cli-shared-utils')
const opn = require('opn')
const { error } = require('@vue/cli-shared-utils')

async function config (value, options) {
  const path = homedir + '/' + '.vuerc'
  const config = JSON.parse(fs.readFileSync(path, 'utf-8'))

  if (!options.delete && !options.get && !options.edit && !options.set) {
    console.log('Resolved path: ' + path + '\n', JSON.stringify(config, null, 4))
  }

  if (options.get) {
    console.log(get(config, options.get))
  }

  if (options.delete) {
    unset(config, options.delete)
    await fs.writeFile(path, JSON.stringify(config, null, 4), 'utf-8', (err) => {
      if (err) error(err)
      console.log(`You have removed the option: ${options.delete}`)
    })
  }

  if (options.edit) {
    opn(path, { app: process.env.EDITOR })
    process.exit()
  }

  if (options.set && !value) {
    error(`Make sure you define a value for the option ${options.set}`)
  }

  if (options.set && value) {
    set(config, options.set, value)

    if (value.match('[0-9]')) {
      set(config, options.set, parseInt(value))
    }

    if (value === 'true') {
      set(config, options.set, true)
    }

    if (value === 'false') {
      set(config, options.set, false)
    }

    await fs.writeFile(path, JSON.stringify(config, null, 4), 'utf-8', (err) => {
      if (err) error(err)
      console.log(`You have updated the option: ${options.set} to ${value}`)
    })
  }
}

module.exports = (...args) => {
  return config(...args).catch(err => {
    error(err)
  })
}
