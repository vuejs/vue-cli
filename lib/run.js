var path = require('path')
var chalk = require('chalk')
var rm = require('rimraf').sync
var webpack = require('webpack')
var logger = require('./logger')
var createServer = require('../lib/server')

module.exports = function (webpackConfig, options) {
  if (typeof options.run === 'function') {
    return options.run(webpackConfig, options)
  }

  try {
    var compiler = webpack(webpackConfig)
  } catch (err) {
    if (err.name === 'WebpackOptionsValidationError') {
      logger.fatal(err.message)
    } else {
      throw err
    }
  }

  if (options.watch) {
    console.log('> Running in watch mode')
    rm(path.join(options.dist, '*'))
    compiler.watch({}, (err, stats) => handleBuild(err, stats, true))
  } else if (options.production) {
    console.log('> Creating an optimized production build:\n')
    // remove dist files but keep that folder in production mode
    rm(path.join(options.dist, '*'))
    compiler.run(handleBuild)
  } else {
    var server = createServer(compiler, options)

    server.listen(options.port, options.host)
    if (options.open) {
      require('opn')(`http://${options.host}:${options.port}`)
    }
  }

  function handleBuild (err, stats, watch) {
    if (watch) {
      process.stdout.write('\x1Bc')
    }
    if (err) {
      process.exitCode = 1
      return console.error(err.stack)
    }
    if (stats.hasErrors() || stats.hasWarnings()) {
      process.exitCode = 1
      return console.error(stats.toString('errors-only'))
    }
    console.log(stats.toString({
      chunks: false,
      children: false,
      modules: false,
      colors: true
    }))
    console.log(`\n${chalk.bgGreen.black(' SUCCESS ')} Compiled successfully.\n`)
    if (!watch) {
      if (options.lib) {
        console.log(`The ${chalk.cyan(options.dist)} folder is ready to be published.`)
        console.log(`Make sure you have correctly set ${chalk.cyan('package.json')}\n`)
      } else {
        console.log(`The ${chalk.cyan(options.dist)} folder is ready to be deployed.`)
        console.log(`You may also serve it locally with a static server:\n`)
        console.log(`  ${chalk.yellow('npm')} i -g serve`)
        console.log(`  ${chalk.yellow('serve')} ${options.dist}\n`)
      }
    }
  }
}
