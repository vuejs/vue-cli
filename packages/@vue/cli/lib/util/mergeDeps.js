const { semver, warn } = require('@vue/cli-shared-utils')

const tryGetNewerRange = require('./tryGetNewerRange')

const extractSemver = r => r.replace(/^.+#semver:/, '')
const injectSemver = (r, v) =>
  semver.validRange(r) ? v : r.replace(/#semver:.+$/, `#semver:${v}`)

const isValidRange = range => {
  if (typeof range !== 'string') {
    return false
  }

  const isValidSemver = !!semver.validRange(range)
  const isValidGitHub = range.match(/^[^/]+\/[^/]+/) != null
  const isValidURI =
    range.match(
      /^(?:file|git|npm|git\+ssh|git\+http|git\+https|git\+file|https?):/
    ) != null

  return isValidSemver || isValidGitHub || isValidURI
}

module.exports = function mergeDeps (
  generatorId,
  sourceDeps,
  depsToInject,
  sources,
  {
    prune,
    warnIncompatibleVersions,
    forceOverwrite
  }
) {
  const result = Object.assign({}, sourceDeps)

  for (const depName in depsToInject) {
    const sourceRange = sourceDeps[depName]
    const injectingRange = depsToInject[depName]

    // if they are the same, do nothing. Helps when non semver type deps are used
    if (sourceRange === injectingRange) continue

    if (prune && injectingRange == null) {
      delete result[depName]
      continue
    }

    if (!isValidRange(injectingRange)) {
      warn(
        `invalid version range for dependency "${depName}":\n\n` +
          `- ${injectingRange} injected by generator "${generatorId}"`
      )
      continue
    }

    const sourceGeneratorId = sources[depName]
    if (!sourceRange) {
      result[depName] = injectingRange
      sources[depName] = generatorId
    } else {
      const sourceRangeSemver = extractSemver(sourceRange)
      const injectingRangeSemver = extractSemver(injectingRange)
      const r = tryGetNewerRange(sourceRangeSemver, injectingRangeSemver)
      const didGetNewer = !!r

      if (forceOverwrite) {
        result[depName] = injectingRange
      } else if (didGetNewer) {
        result[depName] = injectSemver(injectingRange, r)
      } else {
        // if failed to infer newer version, use existing one because it's likely
        // built-in
        result[depName] = sourceRange
      }

      // if changed, update source
      if (result[depName] === injectingRange) {
        sources[depName] = generatorId
      }

      // warn incompatible version requirements
      if (
        warnIncompatibleVersions &&
        (!semver.validRange(sourceRangeSemver) ||
          !semver.validRange(injectingRangeSemver) ||
          !semver.intersects(sourceRangeSemver, injectingRangeSemver))
      ) {
        warn(
          `conflicting versions for project dependency "${depName}":\n\n` +
            `- ${sourceRange} injected by generator "${sourceGeneratorId}"\n` +
            `- ${injectingRange} injected by generator "${generatorId}"\n\n` +
            `Using ${(!forceOverwrite && didGetNewer) ? `newer ` : ``}version (${
              result[depName]
            }), but this may cause build errors.`
        )
      }
    }
  }
  return result
}
