const fs = require('fs')
const path = require('path')

const stripAnsi = require('strip-ansi')
const { execa, semver } = require('@vue/cli-shared-utils')

const cwd = process.cwd()

const usesNpm = fs.existsSync(path.resolve(cwd, './package-lock.json'))
if (!usesNpm) {
  process.exit()
}

const npmVersion = stripAnsi(execa.sync('npm', ['--version']).stdout)
if (!semver.satisfies(npmVersion, '6.x')) {
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
