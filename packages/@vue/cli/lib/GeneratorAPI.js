const fs = require('fs')
const ejs = require('ejs')
const path = require('path')
const globby = require('globby')
const isBinary = require('isbinaryfile')
const yaml = require('yaml-front-matter')
const mergeDeps = require('./util/mergeDeps')

const isString = val => typeof val === 'string'
const isFunction = val => typeof val === 'function'
const isObject = val => val && typeof val === 'object'

// get link for a 3rd party plugin.
function getLink (id) {
  let pkg = {}
  try {
    pkg = require(`${id}/package.json`)
  } catch (e) {}
  return (
    pkg.homepage ||
    (pkg.repository && pkg.repository.url) ||
    `https://www.npmjs.com/package/${id.replace(`/`, `%2F`)}`
  )
}

class GeneratorAPI {
  /**
   * @param {string} id - Id of the owner plugin
   * @param {Generator} generator - The invoking Generator instance
   * @param {object} options - generator options passed to this plugin
   * @param {object} rootOptions - root options (the entire preset)
   */
  constructor (id, generator, options, rootOptions) {
    this.id = id
    this.generator = generator
    this.options = options
    this.rootOptions = rootOptions

    this.pluginsData = generator.plugins
      .filter(({ id }) => id !== `@vue/cli-service`)
      .map(({ id }) => {
        const name = id.replace(/^(@vue|vue-)\/cli-plugin-/, '')
        const isOfficial = /^@vue/.test(id)
        return {
          name: name,
          link: isOfficial
            ? `https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-${name}`
            : getLink(id)
        }
      })
  }

  /**
   * Resolves the data when rendering templates.
   *
   * @private
   */
  _resolveData (additionalData) {
    return Object.assign({
      options: this.options,
      rootOptions: this.rootOptions,
      plugins: this.pluginsData
    }, additionalData)
  }

  /**
   * Inject a file processing middleware.
   *
   * @private
   * @param {FileMiddleware} middleware - A middleware function that receives the
   *   virtual files tree object, and an ejs render function. Can be async.
   */
  _injectFileMiddleware (middleware) {
    this.generator.fileMiddlewares.push(middleware)
  }

  /**
   * Resolve path for a project.
   *
   * @param {string} _path - Relative path from project root
   * @return {string} The resolved absolute path.
   */
  resolve (_path) {
    return path.resolve(this.generator.context, _path)
  }

  /**
   * Check if the project has a given plugin.
   *
   * @param {string} id - Plugin id, can omit the (@vue/|vue-)-cli-plugin- prefix
   * @return {boolean}
   */
  hasPlugin (id) {
    return this.generator.hasPlugin(id)
  }

  /**
   * Extend the package.json of the project.
   * Nested fields are deep-merged unless `{ merge: false }` is passed.
   * Also resolves dependency conflicts between plugins.
   * Tool configuration fields may be extracted into standalone files before
   * files are written to disk.
   *
   * @param {object | () => object} fields - Fields to merge.
   */
  extendPackage (fields) {
    const pkg = this.generator.pkg
    const toMerge = isFunction(fields) ? fields(pkg) : fields
    for (const key in toMerge) {
      const value = toMerge[key]
      const existing = pkg[key]
      if (isObject(value) && (key === 'dependencies' || key === 'devDependencies')) {
        // use special version resolution merge
        pkg[key] = mergeDeps(
          this.id,
          existing || {},
          value,
          this.generator.depSources
        )
      } else if (!(key in pkg)) {
        pkg[key] = value
      } else if (Array.isArray(value) && Array.isArray(existing)) {
        pkg[key] = existing.concat(value)
      } else if (isObject(value) && isObject(existing)) {
        pkg[key] = Object.assign({}, existing, value)
      } else {
        pkg[key] = value
      }
    }
  }

  /**
   * Render template files into the virtual files tree object.
   *
   * @param {string | object | FileMiddleware} source -
   *   Can be one of:
   *   - relative path to a directory;
   *   - Object hash of { sourceTemplate: targetFile } mappings;
   *   - a custom file middleware function.
   * @param {object} [additionalData] - additional data available to templates.
   * @param {object} [ejsOptions] - options for ejs.
   */
  render (source, additionalData = {}, ejsOptions = {}) {
    const baseDir = extractCallDir()
    if (isString(source)) {
      source = path.resolve(baseDir, source)
      this._injectFileMiddleware(async (files) => {
        const data = this._resolveData(additionalData)
        const _files = await globby(['**/*'], { cwd: source })
        for (const rawPath of _files) {
          let filename = path.basename(rawPath)
          // dotfiles are ignored when published to npm, therefore in templates
          // we need to use underscore instead (e.g. "_gitignore")
          if (filename.charAt(0) === '_') {
            filename = `.${filename.slice(1)}`
          }
          const targetPath = path.join(path.dirname(rawPath), filename)
          const sourcePath = path.resolve(source, rawPath)
          const content = renderFile(sourcePath, data, ejsOptions)
          // only set file if it's not all whitespace, or is a Buffer (binary files)
          if (Buffer.isBuffer(content) || /[^\s]/.test(content)) {
            files[targetPath] = content
          }
        }
      })
    } else if (isObject(source)) {
      this._injectFileMiddleware(files => {
        const data = this._resolveData(additionalData)
        for (const targetPath in source) {
          const sourcePath = path.resolve(baseDir, source[targetPath])
          const content = renderFile(sourcePath, data, ejsOptions)
          if (Buffer.isBuffer(content) || content.trim()) {
            files[targetPath] = content
          }
        }
      })
    } else if (isFunction(source)) {
      this._injectFileMiddleware(source)
    }
  }

  /**
   * Push a file middleware that will be applied after all normal file
   * middelwares have been applied.
   *
   * @param {FileMiddleware} cb
   */
  postProcessFiles (cb) {
    this.generator.postProcessFilesCbs.push(cb)
  }

  /**
   * Push a callback to be called when the files have been written to disk.
   *
   * @param {function} cb
   */
  onCreateComplete (cb) {
    this.generator.completeCbs.push(cb)
  }
}

function extractCallDir () {
  // extract api.render() callsite file location using error stack
  const obj = {}
  Error.captureStackTrace(obj)
  const callSite = obj.stack.split('\n')[3]
  const fileName = callSite.match(/\s\((.*):\d+:\d+\)$/)[1]
  return path.dirname(fileName)
}

const replaceBlockRE = /<%# REPLACE %>([^]*?)<%# END_REPLACE %>/g

function renderFile (name, data, ejsOptions) {
  if (isBinary.sync(name)) {
    return fs.readFileSync(name) // return buffer
  }
  const template = fs.readFileSync(name, 'utf-8')

  // custom template inheritance via yaml front matter.
  // ---
  // extend: 'source-file'
  // replace: !!js/regexp /some-regex/
  // OR
  // replace:
  //   - !!js/regexp /foo/
  //   - !!js/regexp /bar/
  // ---
  const parsed = yaml.loadFront(template)
  const content = parsed.__content
  let finalTemplate = content.trim() + `\n`
  if (parsed.extend) {
    const extendPath = path.isAbsolute(parsed.extend)
      ? parsed.extend
      : require.resolve(parsed.extend)
    finalTemplate = fs.readFileSync(extendPath, 'utf-8')
    if (parsed.replace) {
      if (Array.isArray(parsed.replace)) {
        const replaceMatch = content.match(replaceBlockRE)
        if (replaceMatch) {
          const replaces = replaceMatch.map(m => {
            return m.replace(replaceBlockRE, '$1').trim()
          })
          parsed.replace.forEach((r, i) => {
            finalTemplate = finalTemplate.replace(r, replaces[i])
          })
        }
      } else {
        finalTemplate = finalTemplate.replace(parsed.replace, content.trim())
      }
    }
  }

  return ejs.render(finalTemplate, data, ejsOptions)
}

module.exports = GeneratorAPI
