const pluginRE = /^(@vue\/|vue-|@[\w-]+\/vue-)cli-plugin-/
const scopeRE = /^@[\w-]+\//

exports.isPlugin = id => pluginRE.test(id)

exports.isOfficialPlugin = id => /^@vue\//.test(id)

exports.toShortPluginId = id => id.replace(pluginRE, '')

exports.resolvePluginId = id => {
  // already full id
  // e.g. vue-cli-plugin-foo, @vue/cli-plugin-foo, @bar/vue-cli-plugin-foo
  if (pluginRE.test(id)) {
    return id
  }
  // scoped short
  // e.g. @vue/foo, @bar/foo
  if (id.charAt(0) === '@') {
    const scopeMatch = id.match(scopeRE)
    if (scopeMatch) {
      const shortId = id.replace(scopeRE, '')
      return `${scopeMatch[0]}vue-cli-plugin-${shortId}`
    }
  }
  // default short
  // e.g. foo
  return `vue-cli-plugin-${id}`
}
