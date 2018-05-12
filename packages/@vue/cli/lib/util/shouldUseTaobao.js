const chalk = require('chalk')
const execa = require('execa')
const { request } = require('@vue/cli-shared-utils')
const inquirer = require('inquirer')
const registries = require('./registries')
const { loadOptions, saveOptions } = require('../options')

async function ping (registry) {
  await request.get(`${registry}/vue-cli-version-marker/latest`)
  return registry
}

function removeSlash (url) {
  return url.replace(/\/$/, '')
}

let checked
let result

module.exports = async function shouldUseTaobao () {
  // ensure this only gets called once.
  if (checked) return result
  checked = true

  // previously saved preference
  const saved = loadOptions().useTaobaoRegistry
  if (typeof saved === 'boolean') {
    return (result = saved)
  }

  const save = val => {
    result = val
    saveOptions({ useTaobaoRegistry: val })
    return val
  }

  const userCurrent = (await execa(`npm`, ['config', 'get', 'registry'])).stdout
  const defaultRegistry = registries.npm
  if (removeSlash(userCurrent) !== removeSlash(defaultRegistry)) {
    // user has configured custom regsitry, respect that
    return save(false)
  }
  const faster = await Promise.race([
    ping(defaultRegistry),
    ping(registries.taobao)
  ])

  if (faster !== registries.taobao) {
    // default is already faster
    return save(false)
  }

  if (process.env.VUE_CLI_API_MODE) {
    return save(true)
  }

  // ask and save preference
  const { useTaobaoRegistry } = await inquirer.prompt([
    {
      name: 'useTaobaoRegistry',
      type: 'confirm',
      message: chalk.yellow(
        ` Your connection to the the default npm registry seems to be slow.\n` +
          `   Use ${chalk.cyan(registries.taobao)} for faster installation?`
      )
    }
  ])
  return save(useTaobaoRegistry)
}
