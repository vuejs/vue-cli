const fs = require('fs')
const path = require('path')
const program = require('commander')
const Creator = require('./Creator')
const debug = require('debug')('create')
const Generator = require('./Generator')
const { warn, error } = require('./util/log')
const resolveInstalledGenerators = require('./util/resolveInstalledGenerators')

program
  .usage('<app-name>')
  .parse(process.argv)

const projectName = program.args[0]
if (!projectName) {
  warn(`\n  Please provide an app name.`)
  program.outputHelp()
  process.exit(1)
}

const builtInGenerators = fs
  .readdirSync(path.resolve(__dirname, './generators'))
  .filter(dir => dir.charAt(0) !== '.')
  .map(id => new Generator(id, `./generators/${id}`))

debug(builtInGenerators)

const installedGenerators = resolveInstalledGenerators().map(id => {
  return new Generator(id)
})

const targetDir = path.resolve(process.cwd(), projectName)
const creator = new Creator(projectName, builtInGenerators.concat(installedGenerators))

creator
  .create(targetDir)
  .then(() => {
    // TODO: log instructions
  })
  .catch(error)
