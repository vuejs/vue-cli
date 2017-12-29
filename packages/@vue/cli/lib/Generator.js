const ejs = require('ejs')
const path = require('path')
const debug = require('debug')
const resolve = require('resolve')
const GeneratorAPI = require('./GeneratorAPI')
const writeFileTree = require('./util/writeFileTree')

module.exports = class Generator {
  constructor (context, options) {
    this.context = context
    this.options = options
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
    this.resolvePkg()
    this.files['package.json'] = JSON.stringify(this.pkg, null, 2)
    // write file tree to disk
    await writeFileTree(this.context, this.files)
  }

  resolvePkg () {
    const sortDeps = deps => Object.keys(deps).sort().reduce((res, name) => {
      res[name] = deps[name]
      return res
    }, {})
    this.pkg.dependencies = sortDeps(this.pkg.dependencies)
    this.pkg.devDependencies = sortDeps(this.pkg.devDependencies)
    debug('vue:cli-pkg')(this.pkg)
  }

  async resolveFiles () {
    for (const middleware of this.fileMiddlewares) {
      await middleware(this.files, ejs.render)
    }
    debug('vue:cli-files')(this.files)
  }
}
