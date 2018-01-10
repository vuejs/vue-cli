// dev only

const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')

module.exports = function setupDevProject (targetDir, deps) {
  const pkg = require(path.resolve(targetDir, 'package.json'))
  pkg.devDependencies = {}
  deps.forEach(dep => {
    pkg.devDependencies[dep] = require(path.resolve(
      __dirname,
      '../../../../',
      dep,
      'package.json'
    )).version
  })
  fs.writeFileSync(
    path.resolve(targetDir, 'package.json'),
    JSON.stringify(pkg, null, 2)
  )
  const binPath = path.join(targetDir, 'node_modules', '.bin')
  mkdirp.sync(binPath)
  fs.symlinkSync(
    require.resolve('@vue/cli-service/bin/vue-cli-service'),
    path.join(binPath, 'vue-cli-service'),
    'junction' // needed for windows
  )
}
