const { request } = require('@vue/cli-shared-utils')
const { getRegistry } = require('./packageManager')

module.exports = async function getPackageVersion (id, range = '', registry) {
  if (!registry) {
    registry = await getRegistry()
  }

  let result
  try {
    result = await request.get(`${registry}/${encodeURIComponent(id).replace(/^%40/, '@')}/${range}`)
  } catch (e) {
    return e
  }
  return result
}
