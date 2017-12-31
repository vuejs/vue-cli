module.exports = (webpackConfig, args, rawArgv) => {
  // The following is largely copied from
  // https://github.com/zinserjan/mocha-webpack/blob/master/src/cli/index.js
  // with small modifications to use an in-memory webpack config instead.
  // It would be nice if we can somehow use mocha-webpack's CLI directly.

  /**
   * Copyright (c) 2016-2017 Jan-André Zinser
   * Licensed under MIT
   * https://github.com/zinserjan/mocha-webpack/blob/master/LICENSE.md
   *
   * modified by Yuxi Evan You
   */

  const fs = require('fs')
  const path = require('path')
  const _ = require('lodash')
  const parseArgv = require('mocha-webpack/lib/cli/parseArgv').default
  const createMochaWebpack = require('mocha-webpack/lib/createMochaWebpack')
  const { ensureGlob, extensionsToGlob } = require('mocha-webpack/lib/util/glob')

  const options = Object.assign(
    {},
    parseArgv([]),
    parseArgv(rawArgv, true)
  )

  if (!args._.length) {
    options.recursive = true
  }

  function resolve (mod) {
    const absolute = fs.existsSync(mod) || fs.existsSync(`${mod}.js`)
    const file = absolute ? path.resolve(mod) : mod
    return file
  }

  function exit (lazy, code) {
    if (lazy) {
      process.on('exit', () => {
        process.exit(code)
      })
    } else {
      process.exit(code)
    }
  }

  options.require.forEach((mod) => {
    require(resolve(mod)) // eslint-disable-line global-require
  })

  options.include = options.include.map(resolve)

  options.webpackConfig = webpackConfig

  const mochaWebpack = createMochaWebpack()

  options.include.forEach((f) => mochaWebpack.addInclude(f))

  const extensions = _.get(options.webpackConfig, 'resolve.extensions', ['.js'])
  const fallbackFileGlob = extensionsToGlob(extensions)
  const fileGlob = options.glob != null ? options.glob : fallbackFileGlob

  options.files.forEach((f) => mochaWebpack.addEntry(ensureGlob(f, options.recursive, fileGlob)))

  mochaWebpack.cwd(process.cwd())
  mochaWebpack.webpackConfig(options.webpackConfig)
  mochaWebpack.bail(options.bail)
  mochaWebpack.reporter(options.reporter, options.reporterOptions)
  mochaWebpack.ui(options.ui)
  mochaWebpack.interactive(options.interactive)

  if (options.fgrep) {
    mochaWebpack.fgrep(options.fgrep)
  }

  if (options.grep) {
    mochaWebpack.grep(options.grep)
  }

  if (options.invert) {
    mochaWebpack.invert()
  }

  if (options.checkLeaks) {
    mochaWebpack.ignoreLeaks(false)
  }

  if (options.fullTrace) {
    mochaWebpack.fullStackTrace()
  }

  mochaWebpack.useColors(options.colors)
  mochaWebpack.useInlineDiffs(options.inlineDiffs)
  mochaWebpack.timeout(options.timeout)

  if (options.retries) {
    mochaWebpack.retries(options.retries)
  }

  mochaWebpack.slow(options.slow)

  if (options.asyncOnly) {
    mochaWebpack.asyncOnly()
  }

  if (options.delay) {
    mochaWebpack.delay()
  }

  if (options.growl) {
    mochaWebpack.growl()
  }

  return Promise
    .resolve()
    .then(() => {
      if (options.watch) {
        return mochaWebpack.watch()
      }
      return mochaWebpack.run()
    })
    .then((failures) => {
      exit(options.exit, failures)
    })
    .catch((e) => {
      if (e) {
        console.error(e.stack); // eslint-disable-line
      }
      exit(options.exit, 1)
    })
}
