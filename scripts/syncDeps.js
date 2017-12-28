// make sure generators are using the latest version of plugins

const fs = require('fs')
const globby = require('globby')

;(async () => {
  const paths = await globby(['packages/@vue/cli/lib/generators/**/*.js'])
  paths
    .filter(p => !/\/files\//.test(p))
    .forEach(processFile)
})()

function processFile (filePath) {
  const file = fs.readFileSync(filePath, 'utf-8')
  const updated = file.replace(/'(@vue\/cli-[\w-]+)': '\^\d+\.\d+\.\d+'/g, (_, pkg) => {
    const version = require(`../packages/${pkg}/package.json`).version
    return `'${pkg}': '^${version}'`
  })
  fs.writeFileSync(filePath, updated)
}
