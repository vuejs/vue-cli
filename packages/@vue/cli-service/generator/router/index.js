module.exports = (api, options) => {
  api.injectImports(`src/main.js`, `import router from './router'`)
  api.injectRootOptions(`src/main.js`, `router`)
  api.extendPackage({
    dependencies: {
      'vue-router': '^3.0.1'
    }
  })
  api.render('./template')

  if (options.invoking) {
    api.postProcessFiles(files => {
      const appFile = files[`src/App.vue`]
      if (appFile) {
        files[`src/App.vue`] = appFile.replace(/^<template>[^]+<\/script>/, `
<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </div>
    <router-view/>
  </div>
</template>
        `.trim())
        console.log(files[`src/App.vue`])
      }
    })
  }
}
