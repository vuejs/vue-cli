const invoke = require('./invoke')
const inquirer = require('inquirer')
const {
  chalk,
  semver,
  resolveModule,
  loadModule
} = require('@vue/cli-shared-utils')

const getVersions = require('./util/getVersions')
const PackageManager = require('./util/ProjectPackageManager')
const {
  log,
  error,
  resolvePluginId,
  isOfficialPlugin
} = require('@vue/cli-shared-utils')
const confirmIfGitDirty = require('./util/confirmIfGitDirty')

async function add (pluginToAdd, options = {}, context = process.cwd()) {
  if (!(await confirmIfGitDirty(context))) {
    return
  }

  // for `vue add` command in 3.x projects
  const servicePkg = loadModule('@vue/cli-service/package.json', context)
  if (servicePkg && semver.satisfies(servicePkg.version, '3.x')) {
    // special internal "plugins"
    if (/^(@vue\/)?router$/.test(pluginToAdd)) {
      return addRouter(context)
    }
    if (/^(@vue\/)?vuex$/.test(pluginToAdd)) {
      return addVuex(context)
    }
  }

  const pluginRe = /^(@?[^@]+)(?:@(.+))?$/
  const [
    // eslint-disable-next-line
    _skip,
    pluginName,
    pluginVersion
  ] = pluginToAdd.match(pluginRe)
  const packageName = resolvePluginId(pluginName)

  log()
  log(`📦  Installing ${chalk.cyan(packageName)}...`)
  log()

  const pm = new PackageManager({ context })

  if (pluginVersion) {
    await pm.add(`${packageName}@${pluginVersion}`)
  } else if (isOfficialPlugin(packageName)) {
    const { latestMinor } = await getVersions()
    await pm.add(`${packageName}@~${latestMinor}`)
  } else {
    await pm.add(packageName, { tilde: true })
  }

  log(`${chalk.green('✔')}  Successfully installed plugin: ${chalk.cyan(packageName)}`)
  log()

  const generatorPath = resolveModule(`${packageName}/generator`, context)
  if (generatorPath) {
    invoke(pluginName, options, context)
  } else {
    log(`Plugin ${packageName} does not have a generator to invoke`)
  }
}

module.exports = (...args) => {
  return add(...args).catch(err => {
    error(err)
    if (!process.env.VUE_CLI_TEST) {
      process.exit(1)
    }
  })
}

async function addRouter (context) {
  const options = await inquirer.prompt([{
    name: 'routerHistoryMode',
    type: 'confirm',
    message: `Use history mode for router? ${chalk.yellow(`(Requires proper server setup for index fallback in production)`)}`
  }])
  invoke.runGenerator(context, {
    id: 'core:router',
    apply: loadModule('@vue/cli-service/generator/router', context),
    options
  })
}

async function addVuex (context) {
  invoke.runGenerator(context, {
    id: 'core:vuex',
    apply: loadModule('@vue/cli-service/generator/vuex', context)
  })
}
