const fs = require('fs-extra')
const path = require('path')
const homedir = require('os').homedir()
const { get, set, unset, error, launch } = require('@vue/cli-shared-utils')

async function configure (value, options) {
  const file = path.resolve(homedir, '.vuerc')
  const config = await fs.readJson(file)

  if (!options.delete && !options.get && !options.edit && !options.set) {
    if (options.json) {
      console.log(JSON.stringify({
        resolvedPath: file,
        content: config
      }))
    } else {
      console.log('Resolved path: ' + file + '\n', JSON.stringify(config, null, 2))
    }
  }

  if (options.get) {
    // eslint-disable-next-line no-shadow
    const value = get(config, options.get)
    if (options.json) {
      console.log(JSON.stringify({
        value
      }))
    } else {
      console.log(value)
    }
  }

  if (options.delete) {
    unset(config, options.delete)
    await fs.writeFile(file, JSON.stringify(config, null, 2), 'utf-8')
    if (options.json) {
      console.log(JSON.stringify({
        deleted: options.delete
      }))
    } else {
      console.log(`You have removed the option: ${options.delete}`)
    }
  }

  if (options.edit) {
    launch(file)
  }

  if (options.set && !value) {
    throw new Error(`Make sure you define a value for the option ${options.set}`)
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

    await fs.writeFile(file, JSON.stringify(config, null, 2), 'utf-8')
    if (options.json) {
      console.log(JSON.stringify({
        updated: options.set
      }))
    } else {
      console.log(`You have updated the option: ${options.set} to ${value}`)
    }
  }
}

module.exports = (...args) => {
  return configure(...args).catch(err => {
    error(err)
    if (!process.env.VUE_CLI_TEST) {
      process.exit(1)
    }
  })
}
