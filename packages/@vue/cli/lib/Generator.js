const ejs = require('ejs')
const path = require('path')
const debug = require('debug')
const resolve = require('resolve')
const GeneratorAPI = require('./GeneratorAPI')
const sortObject = require('./util/sortObject')
const writeFileTree = require('./util/writeFileTree')

module.exports = class Generator {
  constructor (context, options, creator) {
    this.context = context
    this.options = options
    this.creator = creator
    this.pkg = require(path.resolve(context, 'package.json'))
    // for conflict resolution
    this.depSources = {}
    // virtual file tree
    this.files = {}
    this.fileMiddlewares = []

    // apply generators from plugins
    Object.keys(options.plugins).forEach(id => {
      const generatorPath = resolve.sync(`${id}/generator`, { basedir: context })
      const generator = require(generatorPath)
      const generatorOptions = options.plugins[id]
      generator(new GeneratorAPI(id, this, generatorOptions), generatorOptions)
    })
  }

  async generate () {
    // wait for file resolve
    await this.resolveFiles()
    // set package.json
    this.sortPkg()
    this.files['package.json'] = JSON.stringify(this.pkg, null, 2)
    // write file tree to disk
    await writeFileTree(this.context, this.files)
  }

  sortPkg () {
    // ensure package.json keys has readable order
    this.pkg.dependencies = sortObject(this.pkg.dependencies)
    this.pkg.devDependencies = sortObject(this.pkg.devDependencies)
    this.pkg.scripts = sortObject(this.pkg.scripts, [
      'serve',
      'build',
      'test',
      'e2e',
      'lint',
      'deploy'
    ])
    this.pkg = sortObject(this.pkg, [
      'name',
      'version',
      'private',
      'scripts',
      'dependencies',
      'devDependencies',
      'vue',
      'babel',
      'eslintConfig',
      'prettier',
      'postcss',
      'browserslist',
      'jest'
    ])

    debug('vue:cli-pkg')(this.pkg)
  }

  async resolveFiles () {
    for (const middleware of this.fileMiddlewares) {
      await middleware(this.files, ejs.render)
    }
    debug('vue:cli-files')(this.files)
  }
}
