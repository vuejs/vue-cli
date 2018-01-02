const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const rimraf = require('rimraf')
const inquirer = require('inquirer')
const Creator = require('./Creator')
const clearConsole = require('./util/clearConsole')
const { error, warn, stopSpinner } = require('@vue/cli-shared-utils')

async function create (projectName) {
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

  const creator = new Creator(projectName, targetDir)
  await creator.create()
}

module.exports = projectName => {
  create(projectName).catch(err => {
    stopSpinner(false) // do not persist
    error(err)
    process.exit(1)
  })
}
