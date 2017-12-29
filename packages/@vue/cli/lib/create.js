const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const rimraf = require('rimraf')
const inquirer = require('inquirer')
const program = require('commander')
const Creator = require('./Creator')

const {
  warn,
  error,
  stopSpinner
} = require('@vue/cli-shared-utils')
const clearConsole = require('./util/clearConsole')

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
    clearConsole()
    const { action } = await inquirer.prompt([
      {
        name: 'action',
        type: 'list',
        message: `Target directory ${chalk.cyan(targetDir)} already exists. Pick an action:`,
        choices: [
          { name: 'Overwrite', value: 'overwrite' },
          { name: 'Merge', value: 'merge' },
          { name: 'Cancel', value: false }
        ]
      }
    ])
    if (!action) {
      return
    } else if (action === 'overwrite') {
      rimraf.sync(targetDir)
    }
  }

  const promptModules = fs
    .readdirSync(path.resolve(__dirname, './promptModules'))
    .filter(file => file.charAt(0) !== '.')
    .map(file => require(`./promptModules/${file}`))

  const creator = new Creator(promptModules)
  await creator.create(projectName, targetDir)
}

run().catch(err => {
  stopSpinner(false) // do not persist
  error(err)
})
