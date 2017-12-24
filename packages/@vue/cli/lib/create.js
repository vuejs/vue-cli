const path = require('path')
const program = require('commander')
const Creator = require('./Creator')
const Generator = require('./Generator')
const { info, error } = require('./util/log')
const resolveInstalledGenerators = require('./util/resolveInstalledGenerators')

program.usage('<app-name>')

program.on('help', () => {
  console.log('TODO')
})

program.parse(process.argv)

const builtInGenerators = [
  'core',
  'babel',
  'typescript',
  'pwa',
  'eslint',
  'unit-jest',
  'unit-mocha-webpack',
  'e2e-nightwatch',
  'e2e-cypress'
].map(id => new Generator(id, `./generators/${id}`))

const installedGenerators = resolveInstalledGenerators().map(id => {
  return new Generator(id)
})

const creator = new Creator(builtInGenerators.concat(installedGenerators))
const targetDir = path.resolve(process.cwd(), program.args[0])

creator
  .create(targetDir)
  .then(() => {
    // TODO: log instructions
  })
  .catch(error)
