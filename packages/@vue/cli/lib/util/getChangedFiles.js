const { execa, hasProjectGit } = require('@vue/cli-shared-utils')

module.exports = async function getChangedFiles (context) {
  if (!hasProjectGit(context)) return []

  const { stdout } = await execa('git', [
    'ls-files',
    '-o',
    '--exclude-standard',
    '--full-name'
  ], {
    cwd: context
  })
  if (stdout.trim()) {
    return stdout.split(/\r?\n/g)
  }
  return []
}
