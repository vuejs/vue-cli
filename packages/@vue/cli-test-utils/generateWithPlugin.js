const Generator = require('@vue/cli/lib/Generator')

module.exports = async function generateWithPlugin (plugin, pkg) {
  process.env.VUE_CLI_SKIP_WRITE = true
  const generator = new Generator('/', {
    plugins: [].concat(plugin)
  })
  await generator.generate()
  return {
    pkg: generator.pkg,
    files: generator.files
  }
}
