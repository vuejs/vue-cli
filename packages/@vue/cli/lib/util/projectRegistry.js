const fs = require('fs-extra')
const path = require('path')
const ini = require('ini')

exports.getProjectRegistry = (context) => {
  const npmrcPaths = path.resolve(context, '.npmrc')

  let registry

  if (fs.existsSync(npmrcPaths)) {
    try {
      registry = ini.parse(fs.readFileSync(npmrcPaths, 'utf-8')).registry
    } catch (e) {
      // in case of file permission issues, etc.
    }
  }

  return registry
}

exports.setProjectRegistry = (context, registry) => {
  const npmrcPaths = path.resolve(context, '.npmrc')

  let npmConfig = {
    registry
  }

  if (fs.existsSync(npmrcPaths)) {
    try {
      npmConfig = Object.assign({}, ini.parse(fs.readFileSync(npmrcPaths, 'utf-8')), npmConfig)
    } catch (e) {
      // in case of file permission issues, etc.
    }
  }

  fs.outputFileSync(npmrcPaths, ini.stringify(npmConfig))
}
