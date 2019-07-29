const sleep = n => new Promise(resolve => setTimeout(resolve, n))

module.exports = async (api, options) => {
  api.render('./template', options)

  // add asynchronous code test
  await sleep(1000)

  api.extendPackage({
    scripts: {
      testasync: 'this is the test'
    },
    devDependencies: {
      'vue-cli-plugin-async-generator': 'v0.0.1'
    }
  })
}
