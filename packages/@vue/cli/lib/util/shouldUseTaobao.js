const {
  chalk,
  execa,
  request,

  hasYarn
} = require('@vue/cli-shared-utils')
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

module.exports = async function shouldUseTaobao (command) {
  if (!command) {
    command = hasYarn() ? 'yarn' : 'npm'
  }

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

  let userCurrent
  try {
    userCurrent = (await execa(command, ['config', 'get', 'registry'])).stdout
  } catch (registryError) {
    try {
      // Yarn 2 uses `npmRegistryServer` instead of `registry`
      userCurrent = (await execa(command, ['config', 'get', 'npmRegistryServer'])).stdout
    } catch (npmRegistryServerError) {
      return save(false)
    }
  }

  const defaultRegistry = registries[command]
  if (removeSlash(userCurrent) !== removeSlash(defaultRegistry)) {
    // user has configured custom registry, respect that
    return save(false)
  }

  let faster
  try {
    faster = await Promise.race([
      ping(defaultRegistry),
      ping(registries.taobao)
    ])
  } catch (e) {
    return save(false)
  }

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
        ` Your connection to the default ${command} registry seems to be slow.\n` +
          `   Use ${chalk.cyan(registries.taobao)} for faster installation?`
      )
    }
  ])
  return save(useTaobaoRegistry)
}
