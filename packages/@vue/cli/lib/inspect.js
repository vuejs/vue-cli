const fs = require('fs')
const path = require('path')
const execa = require('execa')
const resolve = require('resolve')

module.exports = function inspect (paths, args) {
  const cwd = process.cwd()
  let servicePath
  try {
    servicePath = resolve.sync('@vue/cli-service', { basedir: cwd })
  } catch (e) {
    const { error } = require('@vue/cli-shared-utils')
    error(`Failed to locate @vue/cli-service. Make sure you are in the right directory.`)
    process.exit(1)
  }
  const binPath = path.resolve(servicePath, '../../bin/vue-cli-service.js')
  if (fs.existsSync(binPath)) {
    execa('node', [
      binPath,
      'inspect',
      ...(args.mode ? ['--mode', args.mode] : []),
      ...(args.rule ? ['--rule', args.rule] : []),
      ...(args.plugin ? ['--plugin', args.plugin] : []),
      ...(args.rules ? ['--rules'] : []),
      ...(args.plugins ? ['--plugins'] : []),
      ...(args.verbose ? ['--verbose'] : []),
      ...paths
    ], { cwd, stdio: 'inherit' })
  }
}
