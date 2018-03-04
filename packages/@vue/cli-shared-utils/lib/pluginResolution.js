const pluginRE = /^(@vue\/|vue-|@[\w-]+\/vue-)cli-plugin-/

exports.isPlugin = id => pluginRE.test(id)

exports.isOfficial = id => /^@vue\//.test(id)

exports.toShortId = id => id.replace(pluginRE, '')
