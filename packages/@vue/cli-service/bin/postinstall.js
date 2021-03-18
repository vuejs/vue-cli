const fs = require('fs')
const path = require('path')

const { execa, semver } = require('@vue/cli-shared-utils')

const cwd = process.cwd()

const userAgent = process.env.npm_config_user_agent
const usesNpm6 = userAgent && userAgent.startsWith('npm/6.')
if (!usesNpm6) {
  process.exit()
}

const pkgPath = path.resolve(cwd, './package.json')
const pkg = fs.existsSync(pkgPath) ? require(pkgPath) : {}
const deps = {
  ...pkg.dependencies,
  ...pkg.devDependencies,
  ...pkg.optionalDependencies
}

let hasPostCSS8 = false
if (deps.postcss) {
  hasPostCSS8 = semver.intersects(deps.postcss, '8.x')
}

if (!hasPostCSS8) {
  execa.sync('npm', ['install', '--save-dev', '--loglevel', 'error', 'postcss@8'])
}
