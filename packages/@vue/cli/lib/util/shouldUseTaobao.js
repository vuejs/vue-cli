const {
  chalk,
  execa,
  hasYarn
} = require('@vue/cli-shared-utils')
const inquirer = require('inquirer')
const registries = require('./registries')
const { getProjectRegistry, setProjectRegistry } = require('./projectRegistry')

function removeSlash (url) {
  return url.replace(/\/$/, '')
}

let checked
let result

module.exports = async function shouldUseTaobao (command, context) {
  if (!command) {
    command = hasYarn() ? 'yarn' : 'npm'
  }

  // ensure this only gets called once.
  if (checked) return result
  checked = true

  // previously saved preference
  const saved = getProjectRegistry(context)
  if (saved) {
    result = saved === registries.taobao
    return result
  }

  const save = val => {
    result = val

    if (val === true) {
      setProjectRegistry(context, registries.taobao)
    }

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

  if (process.env.VUE_CLI_API_MODE) {
    return save(true)
  }

  // ask and save preference
  const { useTaobaoRegistry } = await inquirer.prompt([
    {
      name: 'useTaobaoRegistry',
      type: 'confirm',
      default: false,
      message: `Use ${chalk.cyan(registries.taobao)} for faster installation? (Recommend to Chinese users)`
    }
  ])
  return save(useTaobaoRegistry)
}
