const { request } = require('@vue/cli-shared-utils')

module.exports = async function getPackageVersion (id, range = '', registry) {
  if (!registry) {
    registry = (await require('./shouldUseTaobao')())
      ? `https://registry.npm.taobao.org`
      : `https://registry.npmjs.org`
  }

  let result
  try {
    result = await request.get(`${registry}/${encodeURIComponent(id).replace(/^%40/, '@')}/${range}`)
  } catch (e) {
    return e
  }
  return result
}
