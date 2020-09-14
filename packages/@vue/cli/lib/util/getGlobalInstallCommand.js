const { execa, hasYarn, hasPnpm3OrLater } = require('@vue/cli-shared-utils')

module.exports = function getGlobalInstallCommand () {
  if (hasYarn()) {
    const { stdout: yarnGlobalDir } = execa.sync('yarn', ['global', 'dir'])
    if (__dirname.includes(yarnGlobalDir)) {
      return 'yarn global add'
    }
  }

  if (hasPnpm3OrLater()) {
    const { stdout: pnpmGlobalPrefix } = execa.sync('pnpm', ['config', 'get', 'prefix'])
    if (__dirname.includes(pnpmGlobalPrefix) && __dirname.includes('pnpm-global')) {
      return `pnpm i -g`
    }
  }

  const { stdout: npmGlobalPrefix } = execa.sync('npm', ['config', 'get', 'prefix'])
  if (__dirname.includes(npmGlobalPrefix)) {
    return `npm i -g`
  }
}
