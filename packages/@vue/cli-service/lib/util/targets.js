// copied from @vue/babel-preset-app

const { semver } = require('@vue/cli-shared-utils')
const { default: getTargets } = require('@babel/helper-compilation-targets')

const allModernTargets = getTargets(
  { esmodules: true },
  { ignoreBrowserslistConfig: true }
)

function getIntersectionTargets (targets, constraintTargets) {
  const intersection = Object.keys(constraintTargets).reduce(
    (results, browser) => {
      // exclude the browsers that the user does not need
      if (!targets[browser]) {
        return results
      }

      // if the user-specified version is higher the minimum version that supports esmodule, than use it
      results[browser] = semver.gt(
        semver.coerce(constraintTargets[browser]),
        semver.coerce(targets[browser])
      )
        ? constraintTargets[browser]
        : targets[browser]

      return results
    },
    {}
  )

  return intersection
}

function getModernTargets (targets) {
  // use the intersection of modern mode browsers and user defined targets config
  return getIntersectionTargets(targets, allModernTargets)
}

const projectTargets = getTargets()
const projectModernTargets = getModernTargets(projectTargets)

module.exports = {
  getTargets,
  getModernTargets,
  getIntersectionTargets,

  projectTargets,
  projectModernTargets
}
