const fs = require('fs-extra')
const { CONFIG_FILE_PATH } = require('../constants')
const { get, set, unset, error, launch } = require('@vue/cli-shared-utils')

const showConfig = (config, options) => {
  if (options.json) {
    console.log(JSON.stringify({
      resolvedPath: CONFIG_FILE_PATH,
      content: config
    }))
  } else {
    console.log('Resolved path: ' + CONFIG_FILE_PATH + '\n', JSON.stringify(config, null, 2))
  }
}

const getValue = (config, options) => {
  const value = get(config, options.get)
  if (options.json) {
    console.log(JSON.stringify({
      value
    }))
  } else {
    console.log(value)
  }
}

const deleteValue = async (config, options) => {
  unset(config, options.delete)
  await fs.writeFile(CONFIG_FILE_PATH, JSON.stringify(config, null, 2), 'utf-8')
  if (options.json) {
    console.log(JSON.stringify({
      deleted: options.delete
    }))
  } else {
    console.log(`You have removed the option: ${options.delete}`)
  }
}

const setValue = async (config, options, value) => {
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

    await fs.writeFile(CONFIG_FILE_PATH, JSON.stringify(config, null, 2), 'utf-8')
    if (options.json) {
      console.log(JSON.stringify({
        updated: options.set
      }))
    } else {
      console.log(`You have updated the option: ${options.set} to ${value}`)
    }
  }
}

async function config (value, options) {
  const config = await fs.readJson(CONFIG_FILE_PATH)

  if (!options.delete && !options.get && !options.edit && !options.set) {
    showConfig(config, options)
  }

  if (options.get) {
    getValue(config, options)
  }

  if (options.delete) {
    deleteValue(config, options)
  }

  if (options.set) {
    setValue(config, options, value)
  }

  if (options.edit) {
    launch(CONFIG_FILE_PATH)
  }
}

module.exports = (...args) => {
  return config(...args).catch(err => {
    error(err)
    if (!process.env.VUE_CLI_TEST) {
      process.exit(1)
    }
  })
}
