const inquirer = require('inquirer')
const { semver } = require('@vue/cli-shared-utils')

module.exports = async (api) => {
  const pkg = require(api.resolve('package.json'))

  let localESLintRange = pkg.devDependencies.eslint

  // if project is scaffolded by Vue CLI 3.0.x or earlier,
  // the ESLint dependency (ESLint v4) is inside @vue/cli-plugin-eslint;
  // in Vue CLI v4 it should be extracted to the project dependency list.
  if (api.fromVersion('^3') && !localESLintRange) {
    localESLintRange = '^4.19.1'
    api.extendPackage({
      devDependencies: {
        eslint: localESLintRange,
        'babel-eslint': '^8.2.5',
        'eslint-plugin-vue': '^4.5.0'
      }
    })
  }

  const localESLintMajor = semver.major(
    semver.maxSatisfying(['4.99.0', '5.99.0', '6.99.0', '7.99.0'], localESLintRange) ||
      // in case the user does not specify a typical caret range;
      // it is used as **fallback** because the user may have not previously
      // installed eslint yet, such as in the case that they are from v3.0.x
      require('eslint/package.json').version
  )

  if (localESLintMajor >= 6) {
    return
  }

  const { confirmUpgrade } = await inquirer.prompt([{
    name: 'confirmUpgrade',
    type: 'confirm',
    message:
    `Your current ESLint version is v${localESLintMajor}.\n` +
    `The latest major version which supported by vue-cli is v6.\n` +
    `Do you want to upgrade? (May contain breaking changes)\n`
  }])

  if (confirmUpgrade) {
    const { getDeps } = require('../eslintDeps')

    const newDeps = getDeps(api)
    if (pkg.devDependencies['@vue/eslint-config-airbnb']) {
      Object.assign(newDeps, getDeps(api, 'airbnb'))
    }
    if (pkg.devDependencies['@vue/eslint-config-standard']) {
      Object.assign(newDeps, getDeps(api, 'standard'))
    }
    if (pkg.devDependencies['@vue/eslint-config-prettier']) {
      Object.assign(newDeps, getDeps(api, 'prettier'))
    }

    api.extendPackage({ devDependencies: newDeps }, { warnIncompatibleVersions: false })

    // in case anyone's upgrading from the legacy `typescript-eslint-parser`
    if (api.hasPlugin('typescript')) {
      api.extendPackage({
        eslintConfig: {
          parserOptions: {
            parser: '@typescript-eslint/parser'
          }
        }
      })
    }

    // TODO:
    // transform `@vue/prettier` to `eslint:recommended` + `@vue/prettier`
    // transform `@vue/typescript` to `@vue/typescript/recommended` and also fix prettier compatibility for it
  }
}
