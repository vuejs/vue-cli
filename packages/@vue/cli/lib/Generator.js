const ejs = require('ejs')
const slash = require('slash')
const debug = require('debug')
const configMap = require('./util/configMap')
const GeneratorAPI = require('./GeneratorAPI')
const sortObject = require('./util/sortObject')
const writeFileTree = require('./util/writeFileTree')

module.exports = class Generator {
  constructor (context, pkg, plugins, extractConfigFiles, completeCbs = []) {
    this.context = context
    this.plugins = plugins
    this.pkg = pkg
    this.completeCbs = completeCbs

    // for conflict resolution
    this.depSources = {}
    // virtual file tree
    this.files = {}
    this.fileMiddlewares = []
    this.postProcessFilesCbs = []

    const cliService = plugins.find(p => p.id === '@vue/cli-service')
    const rootOptions = cliService && cliService.options
    // apply generators from plugins
    plugins.forEach(({ id, apply, options }) => {
      const api = new GeneratorAPI(id, this, options, rootOptions || {})
      apply(api, options, rootOptions)
    })
    // extract configs from package.json into dedicated files.
    this.extractConfigFiles(extractConfigFiles)
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

  extractConfigFiles (all) {
    const extract = key => {
      if (configMap[key]) {
        const value = this.pkg[key]
        const { transform, filename } = configMap[key]
        this.files[filename] = transform(value)
        delete this.pkg[key]
      }
    }
    if (all) {
      for (const key in this.pkg) {
        extract(key)
      }
    } else {
      // by default, extract vue.config.js
      extract('vue')
    }
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
    const files = this.files
    for (const middleware of this.fileMiddlewares) {
      await middleware(files, ejs.render)
    }
    // normalize paths
    Object.keys(files).forEach(file => {
      const normalized = slash(file)
      if (file !== normalized) {
        files[normalized] = files[file]
        delete files[file]
      }
    })
    for (const postProcess of this.postProcessFilesCbs) {
      await postProcess(files)
    }
    debug('vue:cli-files')(this.files)
  }

  hasPlugin (_id) {
    const prefixRE = /^(@vue\/|vue-)cli-plugin-/
    return [
      ...this.plugins.map(p => p.id),
      ...Object.keys(this.pkg.devDependencies || {}),
      ...Object.keys(this.pkg.dependencies || {})
    ].some(id => {
      return id === _id || id.replace(prefixRE, '') === _id
    })
  }
}
