const {
  chalk,

  log,
  error,
  logWithSpinner,
  stopSpinner,

  loadModule,
  resolvePluginId
} = require('@vue/cli-shared-utils')

const Migrator = require('./Migrator')
const PackageManager = require('./util/ProjectPackageManager')

const readFiles = require('./util/readFiles')
const getPkg = require('./util/getPkg')
const getChangedFiles = require('./util/getChangedFiles')

const isTestOrDebug = process.env.VUE_CLI_TEST || process.env.VUE_CLI_DEBUG

async function runMigrator (context, plugin, pkg = getPkg(context)) {
  const afterInvokeCbs = []
  const migrator = new Migrator(context, {
    plugin,
    pkg,
    files: await readFiles(context),
    afterInvokeCbs
  })

  log(`🚀  Running migrator of ${plugin.id}`)
  await migrator.generate({
    extractConfigFiles: true,
    checkExisting: true
  })

  const newDeps = migrator.pkg.dependencies
  const newDevDeps = migrator.pkg.devDependencies
  const depsChanged =
    JSON.stringify(newDeps) !== JSON.stringify(pkg.dependencies) ||
    JSON.stringify(newDevDeps) !== JSON.stringify(pkg.devDependencies)
  if (!isTestOrDebug && depsChanged) {
    log(`📦  Installing additional dependencies...`)
    log()

    const pm = new PackageManager({ context })
    await pm.install()
  }

  if (afterInvokeCbs.length) {
    logWithSpinner('⚓', `Running completion hooks...`)
    for (const cb of afterInvokeCbs) {
      await cb()
    }
    stopSpinner()
    log()
  }

  log(
    `${chalk.green(
      '✔'
    )}  Successfully invoked migrator for plugin: ${chalk.cyan(plugin.id)}`
  )

  const changedFiles = getChangedFiles(context)
  if (changedFiles.length) {
    log(`   The following files have been updated / added:\n`)
    log(chalk.red(changedFiles.map(line => `     ${line}`).join('\n')))
    log()
    log(
      `   You should review these changes with ${chalk.cyan(
        'git diff'
      )} and commit them.`
    )
    log()
  }

  migrator.printExitLogs()
}

async function migrate (pluginId, { from }, context = process.cwd()) {
  // TODO: remove this after upgrading to commander 4.x
  if (!from) {
    throw new Error(`Required option 'from' not specified`)
  }

  const pluginName = resolvePluginId(pluginId)
  const pluginMigrator = loadModule(`${pluginName}/migrator`, context)
  if (!pluginMigrator) {
    log(`There's no migrator in ${pluginName}`)
    return
  }
  await runMigrator(context, {
    id: pluginName,
    apply: pluginMigrator,
    baseVersion: from
  })
}

module.exports = (...args) => {
  return migrate(...args).catch(err => {
    error(err)
    if (!process.env.VUE_CLI_TEST) {
      process.exit(1)
    }
  })
}

module.exports.runMigrator = runMigrator
