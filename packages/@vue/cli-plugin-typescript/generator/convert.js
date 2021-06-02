module.exports = (api, { convertJsToTs = true } = {}) => {
  const jsRE = /\.js$/
  let excludeRE = /^tests\/e2e\/|(\.config|rc)\.js$/

  if (api.hasPlugin('e2e-webdriverio')) {
    excludeRE = /(\.config|rc)\.js$/
  }
  api.postProcessFiles((files) => {
    if (convertJsToTs) {
      // delete all js files that have a ts file of the same name
      // and simply rename other js files to ts
      for (const file in files) {
        if (jsRE.test(file) && !excludeRE.test(file)) {
          const tsFile = file.replace(jsRE, '.ts')
          if (!files[tsFile]) {
            const content = files[file]
            files[tsFile] = content
          }
          delete files[file]
        }
      }
    } else {
      // rename only main file to main.ts
      const tsFile = api.entryFile.replace(jsRE, '.ts')
      const content = files[api.entryFile]
      files[tsFile] = content
      delete files[api.entryFile]
    }
  })
}
