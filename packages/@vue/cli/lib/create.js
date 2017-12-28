const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const rimraf = require('rimraf')
const inquirer = require('inquirer')
const program = require('commander')
const Creator = require('./Creator')
const debug = require('debug')('create')
const { warn, error } = require('@vue/cli-shared-utils')
const resolveInstalledGenerators = require('./util/resolveInstalledGenerators')

async function run () {
  program
    .usage('<app-name>')
    .parse(process.argv)

  const projectName = program.args[0]
  if (!projectName) {
    warn(`\n  Please provide an app name.`)
    program.outputHelp()
    process.exit(1)
  }

  const targetDir = path.resolve(process.cwd(), projectName)
  if (fs.existsSync(targetDir)) {
    const { overwrite } = await inquirer.prompt([
      {
        name: 'overwrite',
        type: 'confirm',
        message: `Target directory ${chalk.cyan(targetDir)} already exists.\n  Overwrite?`
      }
    ])
    if (overwrite) {
      rimraf.sync(targetDir)
    } else {
      return
    }
  }

  const createGenerator = (id, requirePath = id) => ({
    id,
    apply: require(requirePath)
  })

  const builtInGenerators = fs
    .readdirSync(path.resolve(__dirname, './generators'))
    .filter(dir => dir.charAt(0) !== '.')
    .map(id => createGenerator(id, `./generators/${id}`))

  debug(builtInGenerators)

  const installedGenerators = resolveInstalledGenerators().map(id => {
    return createGenerator(id)
  })

  const creator = new Creator(projectName, builtInGenerators.concat(installedGenerators))

  await creator.create(targetDir)
}

run().catch(error)
