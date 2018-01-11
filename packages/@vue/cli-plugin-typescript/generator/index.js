module.exports = (api, options) => {
  api.render('./template')

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

  // delete all js files that have a ts file of the same name
  // TODO compat with PWA and test plugins
  const jsRE = /\.js$/
  api.postProcessFiles(files => {
    for (const file in files) {
      if (jsRE.test(file) && files[file.replace(jsRE, '.ts')]) {
        delete files[file]
      }
    }
  })
}
