const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const rimraf = require('rimraf')
const inquirer = require('inquirer')
const Creator = require('./Creator')
const clearConsole = require('./util/clearConsole')
const { error, stopSpinner } = require('@vue/cli-shared-utils')

async function create (projectName, options) {
  const targetDir = path.resolve(process.cwd(), projectName)
  if (fs.existsSync(targetDir)) {
    if (options.force) {
      rimraf.sync(targetDir)
    } else {
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
  }

  const promptModules = [
    'babel',
    'router',
    'vuex',
    'cssPreprocessors',
    'eslint',
    'unit',
    'e2e',
    'typescript',
    'pwa'
  ].map(file => require(`./promptModules/${file}`))

  const creator = new Creator(projectName, targetDir, promptModules)
  await creator.create(options)
}

module.exports = (...args) => {
  create(...args).catch(err => {
    stopSpinner(false) // do not persist
    error(err)
    process.exit(1)
  })
}
