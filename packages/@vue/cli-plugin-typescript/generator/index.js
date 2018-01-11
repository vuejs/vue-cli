module.exports = (api, options) => {
  api.extendPackage({
    scripts: {
      lint: 'vue-cli-service lint'
    }
  })

  if (options.classComponent) {
    api.extendPackage({
      devDependencies: {
        'vue-class-component': '^6.0.0',
        'vue-property-decorator': '^6.0.0'
      }
    })
  }

  // inject necessary typings for other plugins

  const hasMocha = api.hasPlugin('@vue/cli-plugin-unit-mocha')
  if (hasMocha) {
    api.extendPackage({
      devDependencies: {
        '@types/mocha': '^2.2.46',
        '@types/chai': '^4.1.0'
      }
    })
  }

  const hasJest = api.hasPlugin('@vue/cli-plugin-unit-jest')
  if (hasJest) {
    api.extendPackage({
      devDependencies: {
        '@types/jest': '^22.0.1'
      }
    })
  }

  // TODO cater to e2e test plugins

  api.render('./template', {
    hasJest,
    hasMocha
  })

  // delete all js files that have a ts file of the same name
  // and simply rename other js files to ts
  const jsRE = /\.js$/
  const convertLintFlags = require('../lib/convertLintFlags')
  api.postProcessFiles(files => {
    for (const file in files) {
      if (jsRE.test(file)) {
        const tsFile = file.replace(jsRE, '.ts')
        if (!files[tsFile]) {
          files[tsFile] = convertLintFlags(files[file])
        }
        delete files[file]
      }
    }
  })

  // lint and fix files on creation complete
  api.onCreateComplete(() => {
    return require('../lib/tslint')({}, api, true)
  })
}
