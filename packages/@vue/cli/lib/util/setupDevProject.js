// dev only

const fs = require('fs')
const path = require('path')
const { linkBin } = require('@vue/cli-shared-utils')

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
  return linkBin(
    require.resolve('@vue/cli-service/bin/vue-cli-service'),
    path.join(targetDir, 'node_modules', '.bin', 'vue-cli-service')
  )
}
