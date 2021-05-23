const pkgDir = require('pkg-dir')
const PackageManager = require('./ProjectPackageManager')
const { chalk, execa } = require('@vue/cli-shared-utils')

module.exports = async function runNpmScript (task, additonalArgs) {
  const projectRoot = await pkgDir(process.cwd())
  const pm = new PackageManager({ context: projectRoot })

  const args = [task, ...additonalArgs]
  if (pm.bin !== 'yarn') {
    args.unshift('run')
  }

  const command = chalk.dim(`${pm.bin} ${args.join(' ')}`)
  console.log(`Running ${command}`)

  return await execa(pm.bin, args, { cwd: projectRoot, stdio: 'inherit' })
}
