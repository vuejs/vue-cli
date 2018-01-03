const semver = require('semver')
const { warn } = require('@vue/cli-shared-utils')

module.exports = function resolveDeps (generatorId, to, from, sources) {
  const res = Object.assign({}, to)
  for (const name in from) {
    const r1 = to[name]
    const r2 = from[name]
    const sourceGeneratorId = sources[name]

    if (!semver.validRange(r2)) {
      warn(
        `invalid version range for dependency "${name}":\n\n` +
        `- ${r2} injected by generator "${generatorId}"`
      )
      continue
    }

    if (!r1) {
      res[name] = r2
      sources[name] = generatorId
    } else {
      const r = tryGetNewerRange(r1, r2)
      const didGetNewer = !!r
      // if failed to infer newer version, use existing one because it's likely
      // built-in
      res[name] = didGetNewer ? r : r1
      // if changed, update source
      if (res[name] === r2) {
        sources[name] = generatorId
      }
      // warn incompatible version requirements
      if (!semver.intersects(r1, r2)) {
        warn(
          `conflicting versions for project dependency "${name}":\n\n` +
          `- ${r1} injected by generator "${sourceGeneratorId}"\n` +
          `- ${r2} injected by generator "${generatorId}"\n\n` +
          `Using ${didGetNewer ? `newer ` : ``}version (${res[name]}), but this may cause build errors.`
        )
      }
    }
  }
  return res
}

const leadRE = /^(~|\^|>=?)/
const rangeToVersion = r => r.replace(leadRE, '').replace(/x/g, '0')

function tryGetNewerRange (r1, r2) {
  const v1 = rangeToVersion(r1)
  const v2 = rangeToVersion(r2)
  if (semver.valid(v1) && semver.valid(v2)) {
    return semver.gt(v1, v2) ? r1 : r2
  }
}
