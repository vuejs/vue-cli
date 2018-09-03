const execa = require('execa')

function getMaxSatisfying (packageName, range) {
  let version = JSON.parse(
    execa.shellSync(`npm view ${packageName}@${range} version --json`).stdout
  )

  if (typeof version !== 'string') {
    version = version[0]
  }

  return version
}

module.exports = function getUpgradableVersion (
  packageName,
  currRange,
  semverLevel
) {
  let newRange
  if (semverLevel === 'patch') {
    const currMaxVersion = getMaxSatisfying(packageName, currRange)
    newRange = `~${currMaxVersion}`
    const newMaxVersion = getMaxSatisfying(packageName, newRange)
    newRange = `~${newMaxVersion}`
  } else if (semverLevel === 'minor') {
    const currMaxVersion = getMaxSatisfying(packageName, currRange)
    newRange = `^${currMaxVersion}`
    const newMaxVersion = getMaxSatisfying(packageName, newRange)
    newRange = `^${newMaxVersion}`
  } else if (semverLevel === 'major') {
    newRange = `^${getMaxSatisfying(packageName, 'latest')}`
  } else {
    throw new Error('Release type must be one of patch | minor | major!')
  }

  return newRange
}
