const { semver } = require('@vue/cli-shared-utils')

const leadRE = /^(~|\^|>=?)/
const rangeToVersion = r => r.replace(leadRE, '').replace(/x/g, '0')

module.exports = function tryGetNewerRange (r1, r2) {
  const v1 = rangeToVersion(r1)
  const v2 = rangeToVersion(r2)
  if (semver.valid(v1) && semver.valid(v2)) {
    return semver.gt(v1, v2) ? r1 : r2
  }
}
